from pathlib import Path
import base64,gzip,re

ROOT=Path(__file__).resolve().parents[1]
changed=[]

# 10 клас, урок 6: повний шлюз ПІБ + клас.
p=ROOT/'10/06-pryrodni-umovy-resursy-yevropy/index.html'
s=p.read_text(encoding='utf-8')
orig=s
s=s.replace('Введіть ім’я та прізвище — і тест відкриється.','Введіть ім’я, прізвище та клас — і тест відкриється.')
old='<input id="name" placeholder="Ім’я та прізвище"> <button class="btn" onclick="startQuiz()">Почати тест</button>'
new='<input id="name" placeholder="Ім’я та прізвище" autocomplete="name"> <input id="studentClass" placeholder="Клас, наприклад 10-А" autocomplete="off"> <button class="btn" onclick="startQuiz()">Почати тест</button>'
if 'id="studentClass"' not in s:
    if old not in s: raise SystemExit('Не знайдено очікуваний шлюз у 10/06')
    s=s.replace(old,new,1)
old_start="function startQuiz(){const n=document.getElementById('name').value.trim();if(n.length<3){alert('Спочатку введіть ім’я та прізвище.');return}document.getElementById('quiz').style.display='block';document.getElementById('quiz').scrollIntoView({behavior:'smooth'})}"
new_start="function validFullName(v){const p=v.trim().replace(/\\s+/g,' ').split(' ');return p.length>=2&&p.every(x=>/^[А-ЯІЇЄҐа-яіїєґ'’\\-]+$/.test(x))}function startQuiz(){const n=document.getElementById('name').value.trim(),c=document.getElementById('studentClass').value.trim();if(!validFullName(n)||!c){alert('Введіть ім’я, прізвище та клас.');return}document.getElementById('quiz').style.display='block';document.getElementById('quiz').scrollIntoView({behavior:'smooth'})}"
if old_start in s: s=s.replace(old_start,new_start,1)
elif 'function validFullName' not in s: raise SystemExit('Не знайдено startQuiz у 10/06')
old_result="document.getElementById('result').textContent=document.getElementById('name').value+': '+s+'/10. '"
new_result="document.getElementById('result').textContent=document.getElementById('name').value+' • '+document.getElementById('studentClass').value+': '+s+'/10. '"
if old_result in s: s=s.replace(old_result,new_result,1)
if s!=orig:
    p.write_text(s,encoding='utf-8'); changed.append(str(p.relative_to(ROOT)))

# Професії, 9 клас, урок 2: дубль id="radar" робив getElementById непередбачуваним.
p=ROOT/'profesii-9/02-sylni-storony-kompetentnosti/payload.b64'
b64=p.read_text(encoding='utf-8').strip()
html=gzip.decompress(base64.b64decode(b64)).decode('utf-8')
orig_html=html
if '<canvas id="radar"' in html:
    html=html.replace('<canvas id="radar"','<canvas id="radarCanvas"',1)
if "document.getElementById('radar')" in html:
    html=html.replace("document.getElementById('radar')","document.getElementById('radarCanvas')")
if html.count('id="radar"')>1: raise SystemExit('У payload лишилися дублікати id=radar')
if 'id="radarCanvas"' not in html or "getElementById('radarCanvas')" not in html: raise SystemExit('Не вдалося безпечно виправити radar canvas')
if html!=orig_html:
    packed=gzip.compress(html.encode('utf-8'),compresslevel=9,mtime=0)
    p.write_text(base64.b64encode(packed).decode('ascii')+'\n',encoding='utf-8'); changed.append(str(p.relative_to(ROOT)))

# Аудит: слово «тестування» в звичайному тексті не є тестовим шлюзом.
p=ROOT/'scripts/audit_quiz_runtime.py'
s=p.read_text(encoding='utf-8'); orig=s
old="""                body=(d.find_element(By.TAG_NAME,'body').text or '').lower(); start=find_start(d)\n                if 'тест' not in body and start is None: rec['status']='no-test'; results.append(rec); continue\n                if start is None: rec['status']='broken'; rec['errors'].append('Є тест/згадка тесту, але не знайдено видимої кнопки запуску.'); rec['errors']+=severe(d); results.append(rec); continue\n"""
new="""                body=(d.find_element(By.TAG_NAME,'body').text or '').lower(); start=find_start(d)\n                has_quiz=bool(start) or bool(d.execute_script(\"return !!document.querySelector('#quiz,#test,.quiz,.test,[data-quiz],[data-test]') || document.querySelectorAll('input[type=radio],input[type=checkbox]').length>=5\"))\n                if not has_quiz: rec['status']='no-test'; results.append(rec); continue\n                if start is None: rec['status']='broken'; rec['errors'].append('Є тестовий блок, але не знайдено видимої кнопки запуску.'); rec['errors']+=severe(d); results.append(rec); continue\n"""
if old in s: s=s.replace(old,new,1)
elif 'has_quiz=bool(start)' not in s: raise SystemExit('Не знайдено блок детектора тесту в аудиті')
if s!=orig:
    p.write_text(s,encoding='utf-8'); changed.append(str(p.relative_to(ROOT)))

print('CHANGED')
for x in changed: print(x)
