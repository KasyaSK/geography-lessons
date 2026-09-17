from pathlib import Path
import re


def replace_section(text: str, sid: str, html: str) -> str:
    pattern = rf'<section id="{re.escape(sid)}"[^>]*>.*?</section>'
    out, n = re.subn(pattern, html.strip(), text, count=1, flags=re.S)
    if n != 1:
        raise SystemExit(f'Expected one section {sid}, got {n}')
    return out

# -------------------- 8 CLASS --------------------
p = Path('profesii-8/03-portfolio-osobysti-tsili/index.html')
h = p.read_text(encoding='utf-8')
h = h.replace('<a href="#route">Маршрут</a>', '<a href="#route">План на 7 днів</a>')
h = h.replace('<a href="#pitch">Пітч</a>', '')
h = h.replace('0–6 хв • Оберіть усі картки', '0–5 хв • Оберіть усі картки')
h = h.replace('6–14 хв • Портфоліо має відповідати', '5–11 хв • Портфоліо має відповідати')
h = h.replace('14–19 хв • Натисніть «ціль»', '11–16 хв • Натисніть «ціль»')
h = h.replace('19–26 хв • Портфоліо не вимагає', '16–24 хв • Портфоліо не вимагає')
h = h.replace('26–29 хв • Корисна річ:', '24–27 хв • Корисна річ:')
h = h.replace('29–31 хв • Чотири правила', '27–29 хв • Чотири правила')
route8 = r'''
<section id="route"><div class="wrap"><div class="sectionHead"><span class="step">7</span><div><h2>План на 7 днів: одна робота, яку реально закінчити</h2><p>29–35 хв • Не плануємо нове життя з понеділка. Обираємо один результат і три дії, після яких у Вас з’явиться реальний доказ навички.</p></div></div><div class="activity"><div class="grid2"><div><label style="font-weight:900">Що буде готове через 7 днів?</label><input id="goalText" style="width:100%;padding:.75rem;border:1px solid #d8cbd3;border-radius:12px;font:inherit" placeholder="Наприклад: перероблена афіша + версія до/після"><label style="font-weight:900;display:block;margin-top:10px">Коли покажу результат</label><input id="goalDate" type="date" style="width:100%;padding:.75rem;border:1px solid #d8cbd3;border-radius:12px;font:inherit"></div><div class="callout orange"><b>Фільтр корисності:</b><br>кожен крок має або створювати роботу, або покращувати її, або давати конкретний відгук. «Подивитися ще 40 роликів» підозріло легко маскується під роботу.</div></div><div class="routeChoices" id="routeChoices" style="margin-top:14px"></div><div class="scoreline"><span><b id="routeCount">0</b>/3 кроки обрано</span><button onclick="buildRoute()">Зібрати план</button></div><div class="progress"><i id="routeProgress"></i></div><div id="routeOutput" class="feedback"></div></div></div></section>'''
h = replace_section(h, 'route', route8)
# pitch becomes optional reference, not lesson time
h = replace_section(h, 'pitch', '<section id="pitch" style="display:none"></section>')
home8 = r'''
<section id="home"><div class="wrap"><div class="sectionHead"><span class="step">Д/З</span><div><h2>Домашнє: закінчити одну річ, а не «подумати про майбутнє»</h2><p>Продовжуємо те, що вже почали на уроці.</p></div></div><div class="homegrid"><div class="home"><span class="tag" style="background:#e9f8f5;color:#147d6f">ОБОВ’ЯЗКОВО</span><h3>1 мікропроєкт</h3><p>Завершіть одну обрану роботу: афішу, відеоінструкцію, бюджет, інтерв’ю, інфографіку або «було → стало».</p></div><div class="home"><span class="tag" style="background:#fff0e5;color:#9d5c22">ДОКАЗ</span><h3>Збережіть процес</h3><p>Додайте <b>чернетку/«до» + фінал/«після»</b> і 2–3 речення: що було задачею, що зробили Ви, що змінилося.</p></div><div class="home"><span class="tag" style="background:#f0eaff;color:#6544bc">ПЕРЕВІРКА</span><h3>1 зовнішній відгук</h3><p>Покажіть роботу одній людині й запитайте не «гарно?», а: <b>що зрозуміло, що незрозуміло, що варто змінити?</b></p></div></div><div class="callout teal" style="margin-top:14px"><b>Після цього у Вас уже є перший нормальний кейс для портфоліо.</b> Сертифікат для цього не потрібен. Тест /10 на сторінці — після виконання уроку.</div></div></section>'''
h = replace_section(h, 'home', home8)
p.write_text(h, encoding='utf-8')

js = Path('profesii-8/03-portfolio-osobysti-tsili/script.js')
j = js.read_text(encoding='utf-8')
old_route = "const routeItems=['Знайти 2 хороші приклади й розібрати, що в них працює','Виділити 20 хв у календарі двічі на тиждень','Купити 17 маркерів, бо без них творчість точно не почнеться','Зробити першу маленьку роботу вже цього тижня','Попросити одну конкретну людину про відгук','Передивитися 40 випадкових роликів «для натхнення»','Зберегти результат у портфоліо з коротким поясненням','Обрати критерій: як я зрозумію, що стало краще'];"
new_route = "const routeItems=['Сформулювати коротке ТЗ: що саме має бути готове','Знайти 2 хороші приклади й виписати 3 прийоми, які працюють','Зробити першу чернетку/версію протягом 20–30 хв','Купити нові матеріали ще до першої спроби','Показати чернетку одній людині й поставити 2 конкретні питання','Передивитися 40 випадкових роликів «для натхнення»','Внести 1–3 правки й зберегти «до/після»','Написати 2 речення: що ця робота доводить про мої навички'];"
if old_route not in j:
    raise SystemExit('8 class route list not found')
j = j.replace(old_route, new_route)
js.write_text(j, encoding='utf-8')

# -------------------- 9 CLASS --------------------
p = Path('profesii-9/03-interesy-tsinnosti-priorytety/index.html')
h = p.read_text(encoding='utf-8')
h = h.replace('<a href="#matrix">Матриця</a>', '')
h = h.replace('<a href="#theory">Перевірка</a>', '')
h = h.replace('<a href="#statement">Висновок</a>', '<a href="#exitplan">План на 7 днів</a>')
h = h.replace('0–4 хв • Оберіть варіант', '0–3 хв • Оберіть варіант')
h = h.replace('4–10 хв • Оцініть', '3–8 хв • Оцініть')
h = h.replace('10–15 хв • Оберіть максимум 5.', '8–12 хв • Оберіть максимум 5.')
h = h.replace('15–20 хв • Оберіть варіант', '12–16 хв • Оберіть варіант')
h = h.replace('27–31 хв • Натискайте', '16–23 хв • Натискайте')
h = h.replace('31–34 хв • Оберіть напрям', '23–30 хв • Оберіть напрям')
h = h.replace('<section id="matrix">', '<section id="matrix" style="display:none">', 1)
h = h.replace('<section id="theory">', '<section id="theory" style="display:none">', 1)
# Add explicit timing to routes intro
h = h.replace('<h2>Що реально можна робити після 9 класу</h2><p>Коротко про маршрути.', '<h2>Що реально можна робити після 9 класу</h2><p>30–34 хв • Коротко про маршрути.')
exit9 = r'''
<section id="exitplan"><div class="wrap"><div class="head"><span class="step">9</span><div><h2>Вихід з уроку: план на 7 днів, а не «визначитися з професією»</h2><p>34–35 хв • До наступного тижня достатньо перевірити одну гіпотезу про себе.</p></div></div><div id="statementBox" style="display:none"></div><div class="activity exitCareer"><div class="exitGrid"><div><b>1. Два напрями, які я не відкидаю</b><p id="exitDomains">Виберіть «Можу це тестувати» у блоці про реальну роботу.</p></div><div><b>2. Одна профпроба</b><p id="exitTrial">Оберіть картку профпроби вище.</p></div><div><b>3. Коли зроблю?</b><input id="exitDate" type="date"></div></div><button id="exitBuild" type="button">Зібрати мій план</button><div id="exitResult" class="workSummary">План з’явиться тут.</div></div></div></section>'''
h = replace_section(h, 'statement', exit9)
home9 = r'''
<section id="home"><div class="wrap"><div class="head"><span class="step">Д/З</span><div><h2>Домашнє: одна профпроба + чесний висновок</h2><p>Не треба обирати професію. Треба отримати один шматок реального досвіду.</p></div></div><div class="homegrid"><div class="home"><h3>1. Виконайте профпробу</h3><p>Оберіть одну: дані, дизайн, пояснення людям, техніка, організація або дослідження природи. 30–45 хв достатньо.</p></div><div class="home"><h3>2. Запишіть 3 речення</h3><p><b>Що я реально робив/ла?</b><br><b>Що в процесі сподобалось/дратувало?</b><br><b>Що перевірю далі?</b></p></div><div class="home"><h3>3. Перевірте один маршрут</h3><p>Якщо Ви вже думаєте про навчання після 9 класу — відкрийте офіційний сайт одного реального ліцею/коледжу/закладу професійної освіти й подивіться не рекламу, а програму та умови вступу.</p></div></div><div class="callout" style="margin-top:14px"><b>Плюс тест /10 на сторінці.</b> Результат тесту — не «професійний діагноз», а перевірка того, чи Ви зрозуміли метод вибору через реальні задачі.</div></div></section>'''
h = replace_section(h, 'home', home9)
p.write_text(h, encoding='utf-8')

css = Path('profesii-9/03-interesy-tsinnosti-priorytety/style.css')
c = css.read_text(encoding='utf-8')
if 'final-career-plan-2026-09-17' not in c:
    c += '''\n/* final-career-plan-2026-09-17 */\n.exitCareer{background:linear-gradient(135deg,#f0faf7,#f4f6ff)}.exitGrid{display:grid;grid-template-columns:1.2fr 1.2fr .8fr;gap:10px;margin-bottom:12px}.exitGrid>div{border:1px solid var(--line);border-radius:16px;background:#fff;padding:13px}.exitGrid input{width:100%;padding:.7rem;border:1px solid var(--line);border-radius:12px;font:inherit}@media(max-width:700px){.exitGrid{grid-template-columns:1fr}}\n'''
css.write_text(c, encoding='utf-8')

js = Path('profesii-9/03-interesy-tsinnosti-priorytety/script.js')
j = js.read_text(encoding='utf-8')
if 'final-career-plan-2026-09-17' not in j:
    j += r'''
// final-career-plan-2026-09-17
(()=>{const domains=document.getElementById('exitDomains'),trial=document.getElementById('exitTrial'),date=document.getElementById('exitDate'),btn=document.getElementById('exitBuild'),out=document.getElementById('exitResult');if(!btn)return;function selectedDomains(){return [...document.querySelectorAll('.workCard')].filter(c=>c.dataset.pick==='yes').map(c=>c.dataset.domain)}function selectedTrial(){const x=document.querySelector('.trial.active');return x?x.querySelector('b')?.textContent.trim()||x.textContent.trim():''}function refresh(){const ds=selectedDomains();domains.textContent=ds.length?ds.join(' + '):'Оберіть хоча б два напрями у блоці «Реальна робота».';trial.textContent=selectedTrial()||'Оберіть одну профпробу вище.'}document.querySelectorAll('.workCard button,.trial').forEach(x=>x.addEventListener('click',()=>setTimeout(refresh,0)));btn.addEventListener('click',()=>{refresh();const ds=selectedDomains(),t=selectedTrial(),d=date.value;if(ds.length<1||!t||!d){out.textContent='Потрібні: хоча б один напрям, одна профпроба і дата.';return}out.innerHTML=`<b>Мій план:</b> до <b>${d}</b> я перевірю напрям <b>${ds.slice(0,2).join(' / ')}</b> через профпробу <b>${t}</b>. Після неї запишу: що робив/ла, що сподобалось або дратувало, і що перевірю далі.`})})();
'''
js.write_text(j, encoding='utf-8')
