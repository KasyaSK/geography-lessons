from __future__ import annotations

import json, os, re, threading, time
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import quote
from selenium import webdriver
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select

ROOT=Path(__file__).resolve().parents[1]
SHARD_INDEX=int(os.environ.get('SHARD_INDEX','0')); SHARD_TOTAL=max(1,int(os.environ.get('SHARD_TOTAL','1')))
REPORT=ROOT/f'quiz-audit-{SHARD_INDEX}.json'
TOPS=['5','6','7','8','9','10','11','profesii-8','profesii-9','profesii-10','profesii-11']
LESSON_RE=re.compile(r'^(?:5|6|7|8|9|10|11|profesii-(?:8|9|10|11))/[^/]+/index\.html$')
HREF_RE=re.compile(r'href\s*=\s*["\']([^"\']+)["\']',re.I)

def published_lessons():
    found=set()
    for top in TOPS:
        cat=ROOT/top/'index.html'
        if not cat.exists(): continue
        for href in HREF_RE.findall(cat.read_text(encoding='utf-8',errors='ignore')):
            href=href.split('#',1)[0].split('?',1)[0].strip()
            if not href or '://' in href or href.startswith(('mailto:','javascript:','#')): continue
            if href.startswith('/geography-lessons/'): href=href[len('/geography-lessons/'):]
            elif href.startswith('/'): href=href[1:]
            target=(ROOT/href) if '/' in href and href.split('/',1)[0] in TOPS else (cat.parent/href)
            target=target.resolve()
            if target.is_dir() or not target.suffix: target=target/'index.html'
            try: rel=target.relative_to(ROOT).as_posix()
            except ValueError: continue
            if target.exists() and LESSON_RE.match(rel): found.add(target)
    return sorted(found)

def visible(el):
    try: return el.is_displayed()
    except WebDriverException: return False

def grade_from_path(rel):
    m=re.search(r'\d+',rel.split('/',1)[0]); return (m.group(0) if m else '7')+'-А'

def find_start(d):
    for sel in ['#startQuiz','#startTest','#quizStart','#testStart','#startBtn','[data-start-quiz]','[data-start-test]',"button[id*='start'][id*='quiz' i]","button[id*='start'][id*='test' i]"]:
        try:
            for e in d.find_elements(By.CSS_SELECTOR,sel):
                if visible(e): return e
        except Exception: pass
    for e in d.find_elements(By.XPATH,"//*[self::button or self::a or self::input]"):
        txt=((e.text or '')+' '+(e.get_attribute('value') or '')).lower()
        if visible(e) and 'тест' in txt and any(k in txt for k in ('поч','розпоч','старт','відкр')): return e
    return None

def find_field(d,kind):
    if kind=='name': keys=('fullname','full-name','studentname','student-name','quizname','pib','fio','прізвище','ім’я',"ім'я",'піб')
    else: keys=('studentclass','student-class','quizclass','class','grade','клас')
    for e in d.find_elements(By.CSS_SELECTOR,'input,select'):
        blob=' '.join(filter(None,[e.get_attribute('id'),e.get_attribute('name'),e.get_attribute('placeholder'),e.get_attribute('aria-label')])).lower()
        if visible(e) and any(k in blob for k in keys): return e
    words=('ім’я',"ім'я",'прізвище','піб') if kind=='name' else ('клас',)
    for lab in d.find_elements(By.TAG_NAME,'label'):
        if not any(w in (lab.text or '').lower() for w in words): continue
        target=lab.get_attribute('for')
        if target:
            try:
                e=d.find_element(By.ID,target)
                if visible(e): return e
            except Exception: pass
    return None

def fill(e,value):
    if e.tag_name.lower()=='select':
        s=Select(e); opts=[o for o in s.options if o.is_enabled() and (o.get_attribute('value') or o.text).strip()]
        wanted=value.split('-',1)[0]
        for o in opts:
            if wanted in (o.text or ''): s.select_by_visible_text(o.text); return
        if opts: s.select_by_visible_text(opts[0].text); return
        raise RuntimeError('немає доступного значення класу')
    e.clear(); e.send_keys(value)

def state(d):
    return d.execute_script(r"""
      const vis=e=>{if(!e)return false;const s=getComputedStyle(e),r=e.getBoundingClientRect();return !e.hidden&&s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};
      const cand=[...document.querySelectorAll('*')].filter(e=>/(^|\s|[-_])(quiz|test)(\s|[-_]|$)/i.test(`${e.id||''} ${typeof e.className==='string'?e.className:''}`));
      return {c:cand.map(e=>({id:e.id||'',cl:typeof e.className==='string'?e.className:'',v:vis(e),h:e.hidden,n:e.querySelectorAll('input[type=radio],input[type=checkbox],select,textarea,button').length,q:e.querySelectorAll('.question,.quiz-question,.test-question,[data-question],fieldset').length,t:(e.innerText||'').length})), radios:[...document.querySelectorAll('input[type=radio],input[type=checkbox]')].filter(vis).length, qs:[...document.querySelectorAll('.question,.quiz-question,.test-question,[data-question],fieldset')].filter(vis).length};
    """)

def opened(a,b):
    if b['radios']>a['radios'] and b['radios']>0: return True
    if b['qs']>a['qs'] and b['qs']>0: return True
    old={(x['id'],x['cl']):x for x in a['c']}
    for x in b['c']:
        if not x['v']: continue
        y=old.get((x['id'],x['cl']),{'v':False,'n':0,'q':0,'t':0})
        if (not y['v'] and (x['n']>0 or x['q']>0 or x['t']>180)) or x['n']>y['n'] or x['q']>y['q']: return True
    return False

def severe(d):
    out=[]
    try: logs=d.get_log('browser')
    except Exception: return out
    for x in logs:
        m=x.get('message','')
        if x.get('level')=='SEVERE' and any(k in m for k in ('Uncaught','SyntaxError','ReferenceError','TypeError')): out.append(m[:500])
    return out

def main():
    all_lessons=published_lessons(); files=[p for i,p in enumerate(all_lessons) if i%SHARD_TOTAL==SHARD_INDEX]
    os.chdir(ROOT); srv=ThreadingHTTPServer(('127.0.0.1',8765),SimpleHTTPRequestHandler); threading.Thread(target=srv.serve_forever,daemon=True).start()
    o=webdriver.ChromeOptions(); o.page_load_strategy='eager'; o.add_argument('--headless=new'); o.add_argument('--no-sandbox'); o.add_argument('--disable-dev-shm-usage'); o.add_argument('--window-size=1440,1600'); o.set_capability('goog:loggingPrefs',{'browser':'ALL'})
    d=webdriver.Chrome(options=o); d.set_page_load_timeout(10); results=[]
    try:
        for p in files:
            rel=p.relative_to(ROOT).as_posix(); rec={'path':rel,'status':'unknown','errors':[]}
            try:
                d.get('http://127.0.0.1:8765/'+'/'.join(quote(x) for x in rel.split('/'))); time.sleep(.55)
                body=(d.find_element(By.TAG_NAME,'body').text or '').lower(); start=find_start(d)
                if 'тест' not in body and start is None: rec['status']='no-test'; results.append(rec); continue
                if start is None: rec['status']='broken'; rec['errors'].append('Є тест/згадка тесту, але не знайдено видимої кнопки запуску.'); rec['errors']+=severe(d); results.append(rec); continue
                before=state(d); name=find_field(d,'name'); klass=find_field(d,'class')
                if name is None or klass is None: rec['status']='broken'; rec['errors'].append('Не знайдено видимі поля ПІБ і/або класу.'); rec['errors']+=severe(d); results.append(rec); continue
                fill(name,'Тест Учень'); fill(klass,grade_from_path(rel)); d.execute_script("arguments[0].scrollIntoView({block:'center'});",start)
                try: start.click()
                except Exception: d.execute_script('arguments[0].click();',start)
                time.sleep(.45); after=state(d); errs=severe(d)
                if opened(before,after): rec['status']='ok'
                else: rec['status']='broken'; rec['errors'].append('Після валідного ПІБ/класу питання тесту не стали видимими.')
                rec['errors']+=errs
            except Exception as e: rec['status']='broken'; rec['errors'].append(f'{type(e).__name__}: {e}')
            results.append(rec); print(rec['status'],rel,' | '.join(rec['errors']),flush=True)
    finally: d.quit(); srv.shutdown()
    summary={'published_lesson_pages':len(all_lessons),'shard':SHARD_INDEX,'lesson_pages':len(results),'tests_ok':sum(r['status']=='ok' for r in results),'broken':sum(r['status']=='broken' for r in results),'no_test':sum(r['status']=='no-test' for r in results)}
    REPORT.write_text(json.dumps({'summary':summary,'results':results},ensure_ascii=False,indent=2),encoding='utf-8'); print(json.dumps(summary,ensure_ascii=False),flush=True)
    if summary['broken']: raise SystemExit(1)

if __name__=='__main__': main()
