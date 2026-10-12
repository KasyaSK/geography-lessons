#!/usr/bin/env python3
"""Real-browser smoke test for the grade-9 open lesson; runs against local GitHub Pages files."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
import json
from selenium import webdriver
from selenium.webdriver.common.by import By

ROOT = Path(__file__).resolve().parents[1]
PAGE = "/profesii-9/09-tsili-na-navchalnyi-rik/"
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(("127.0.0.1", 0), partial(Quiet, directory=str(ROOT)))
Thread(target=server.serve_forever, daemon=True).start()
opts = webdriver.ChromeOptions()
opts.add_argument("--headless=new")
opts.add_argument("--no-sandbox")
opts.add_argument("--disable-dev-shm-usage")
opts.add_argument("--window-size=1450,1400")
opts.set_capability("goog:loggingPrefs", {"browser":"ALL"})
browser = webdriver.Chrome(options=opts)
passed = []
def run(name, js, expected=True):
    value = browser.execute_script(js)
    if value != expected:
        raise AssertionError(f"{name}: expected {expected!r}, got {value!r}")
    passed.append(name)
    print("PASS", name, flush=True)

try:
    browser.get(f"http://127.0.0.1:{server.server_port}{PAGE}")
    print("DIAG", browser.execute_script("return {title:document.title,ready:document.readyState,cards:document.querySelectorAll(\'#sortCards .panel\').length,smart:document.querySelectorAll(\'#smartCards .smartcard\').length,budget:document.querySelectorAll(\'#budgetChoices input\').length,evidence:document.querySelectorAll(\'#evidenceChoices input\').length,src:[...document.scripts].map(s=>s.src)}"),flush=True)
    print("BROWSER LOG", browser.get_log("browser"),flush=True)
    run("initial page and JS execution", """
      return document.querySelectorAll('#sortCards .panel').length===6 &&
        document.querySelectorAll('#smartCards .smartcard').length===5 &&
        document.querySelectorAll('#budgetChoices input').length===5 &&
        document.querySelectorAll('#evidenceChoices input').length===6;
    """)
    run("presenter controls", """
      document.getElementById('teacherToggle').click();
      document.getElementById('projectorToggle').click();
      return document.body.classList.contains('teacherOn') && document.body.classList.contains('projector');
    """)
    run("opening poll buttons", """
      document.querySelector('[data-hook="poll"][data-value="b"]').click();
      return document.getElementById('pollFeedback').textContent.includes('кількість');
    """)
    run("six sorting cards", """
      const a=[0,1,2,0,1,2];
      document.querySelectorAll('#sortCards .panel').forEach((item,i)=>item.querySelectorAll('button')[a[i]].click());
      return document.getElementById('sortScore').textContent==='6 / 6';
    """)
    run("switching professional cases", """
      document.querySelector('[data-scenario="robot"]').click();
      if(!document.getElementById('caseTitle').textContent.includes('Денис'))return false;
      document.querySelectorAll('input[name="evidence"]').forEach(e=>e.checked=true);
      document.querySelector('[data-scenario="language"]').click();
      return document.getElementById('caseTitle').textContent.includes('Аліна') &&
        document.querySelectorAll('input[name="evidence"]:checked').length===0;
    """)
    run("evidence checker", """
      for(const v of ['time','access','interest'])document.querySelector('input[name="evidence"][value="'+v+'"]').checked=true;
      document.getElementById('evidenceCheck').click();
      return document.getElementById('evidenceFeedback').textContent.includes('Три придатні докази');
    """)
    run("time budget simulator", """
      for(const v of ['draft','check']) {
        const e=document.querySelector('input[name="budget"][value="'+v+'"]');
        e.checked=true;e.dispatchEvent(new Event('change',{bubbles:true}));
      }
      return document.getElementById('budgetUsed').textContent==='65 / 120 хв' &&
        document.getElementById('budgetFeedback').textContent.includes('конкретний продукт');
    """)
    run("SMART, example and goal builder", """
      const more=document.querySelector('#homework details');more.open=true;
      document.getElementById('fillExample').click();
      document.getElementById('buildPlan').click();
      return document.getElementById('planHeadline').textContent.includes('афіші') &&
        document.getElementById('planFeedback').textContent.includes('часу');
    """)
    run("live update of the extended goal", """
      const el=document.getElementById('goalProduct');el.value='фотоколажі';
      el.dispatchEvent(new Event('input',{bubbles:true}));
      return document.getElementById('planHeadline').textContent.includes('фотоколажі');
    """)
    run("quick goal preview", """
      document.getElementById('quickExample').click();
      document.getElementById('quickMake').click();
      return document.getElementById('quickOutput').textContent.includes('ІНТЕРЕС:');
    """)
    run("peer feedback", """
      document.getElementById('peerConcrete').checked=true;
      document.getElementById('peerInterest').checked=true;
      document.getElementById('peerAction').checked=true;
      document.getElementById('peerAdvice').value='Уточніть дату';
      document.getElementById('peerCheck').click();
      return document.getElementById('peerOutput').textContent.includes('ПОРАДА:');
    """)
    run("rescue and exit buttons", """
      document.querySelector('[data-hook="rescue"][data-value="b"]').click();
      document.querySelector('[data-hook="exit"][data-value="a"]').click();
      return document.getElementById('rescueFeedback').textContent.includes('Резервний') &&
        document.getElementById('exitFeedback').textContent.toLowerCase().includes('результат');
    """)
    run("identity gate and quiz generation", """
      document.getElementById('studentName').value='Олена Коваленко';
      document.getElementById('studentClass').value='9-А';
      document.getElementById('quizStart').click();
      return document.querySelectorAll('#quizQuestions .quizQ').length===10 &&
        document.getElementById('quizGate').hidden && !document.getElementById('quizBody').hidden;
    """)
    run("incomplete quiz blocked", """
      document.getElementById('quizSubmit').click();
      return document.getElementById('quizFeedback').textContent.includes('Не заповнено');
    """)
    run("all ten quiz answers and scoring", """
      const keys=[[2],[0],[1],[2],[0,1,3],[0,1,2],[1,2,0],[4,1,2,3],[0],[2]];
      document.querySelectorAll('#quizQuestions .quizQ').forEach((q,i)=>{
        if(i===6||i===7)q.querySelectorAll('select').forEach((e,k)=>e.value=keys[i][k].toString());
        else q.querySelectorAll('input').forEach(e=>e.checked=keys[i].includes(Number(e.value)));
      });
      document.getElementById('quizSubmit').click();
      return document.getElementById('resultScore').textContent==='10 / 10' &&
        !document.getElementById('quizResult').hidden;
    """)
    browser.execute_cdp_cmd("Emulation.setEmulatedMedia", {"media":"print"})
    run("result-card-only printing", """
      document.body.classList.add('print-result');
      return getComputedStyle(document.getElementById('s1')).display==='none' &&
        getComputedStyle(document.getElementById('quizResult')).display!=='none';
    """)
    run("goal-card-only printing", """
      document.body.classList.remove('print-result');
      document.body.classList.add('print-plan');
      return getComputedStyle(document.getElementById('s1')).display==='none' &&
        getComputedStyle(document.getElementById('goalBuilder')).display==='none' &&
        getComputedStyle(document.getElementById('planPreview')).display!=='none';
    """)
    browser.execute_cdp_cmd("Emulation.setEmulatedMedia", {"media":"screen"})
    run("quiz restart", """
      document.body.classList.remove('print-plan');
      document.getElementById('quizAgain').click();
      return !document.getElementById('quizGate').hidden &&
        document.getElementById('quizBody').hidden && document.getElementById('quizResult').hidden;
    """)
    run("requested terminology", """
      return !/покращ/iu.test(document.body.textContent) &&
        document.body.textContent.includes('удосконалити');
    """)
    severe = [x for x in browser.get_log("browser") if x.get("level")=="SEVERE"]
    if severe:
        raise AssertionError("Browser errors: "+json.dumps(severe,ensure_ascii=False)[:1500])
    print("PASS no severe browser-console errors",flush=True)
    print(f"SUCCESS: {len(passed)+1} real-browser checks",flush=True)
finally:
    browser.quit()
    server.shutdown()
