const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
$$('.choice').forEach(box=>box.addEventListener('click',e=>{if(e.target.tagName!=='BUTTON')return;const ok=e.target.dataset.v===box.dataset.answer;box.parentElement.querySelector('.feedback').textContent=ok?'Так. Водяна пара надходить із водойм, вологого ґрунту та рослин.':'Не зовсім. Згадайте: вода переходить у газоподібний стан не лише під час дощу.';}));
function evap(){const t=+$('input#temp').value,w=+$('input#wind').value,a=+$('input#area').value;$('#tVal').textContent=t+'°C';$('#wVal').textContent=w+' м/с';$('#aVal').textContent=a+'%';let x=Math.min(100,Math.max(8,(t-3)*1.25+w*3+a*.28));$('#evapBar').style.width=x+'%';$('#evapText').textContent=x<35?'повільне':x<70?'помірне':'швидке';$('#evapWhy').textContent=`Вища температура дає молекулам більше енергії, вітер забирає насичений вологою шар над поверхнею, а більша площа дає більше місця для переходу молекул у пару.`;}['temp','wind','area'].forEach(id=>$('#'+id).addEventListener('input',evap));evap();
$('#calcRH').addEventListener('click',()=>{const a=+$('#actual').value,m=+$('#maximum').value;if(m<=0||a<0){$('#rhResult').textContent='Перевірте дані';return}const r=a/m*100;$('#rhResult').textContent=r.toFixed(0)+'%';});
$$('[data-rh]').forEach(b=>b.addEventListener('click',()=>$('#miniOut').textContent=b.dataset.rh+'%'));
$('.reveal').addEventListener('click',()=>$('.hidden-answer').classList.toggle('show'));
function psy(){const d=+$('#dry').value,df=+$('#diff').value;$('#dryV').textContent=d+'°C';$('#diffV').textContent=df+'°C';let rh=Math.round(Math.max(12,100-df*(4.7-(d-20)*.035)));$('#psyOut').textContent=df===0?'≈ 100% RH':`орієнтовно ${rh}% RH`;}
['dry','diff'].forEach(id=>$('#'+id).addEventListener('input',psy));psy();
$('#checkCer').addEventListener('click',()=>{const c=$('#claim').value.trim(),e=$('#evidence').value.trim(),r=$('#reasoning').value.trim();$('#cerOut').textContent=c.length>20&&e.length>25&&r.length>30?'Структура CER заповнена: перевірте, чи Evidence містить дані/приклад, а Reasoning пояснює зв’язок.':'Додайте зміст у всі три частини: твердження → конкретний доказ → пояснення, чому доказ підтверджує твердження.';});
const questions=[
['Що таке випаровування?',['Перехід водяної пари в рідину','Перехід рідкої води у водяну пару','Замерзання води'],1],
['Яка умова зазвичай прискорює випаровування?',['Сильніший рух повітря','Зменшення площі поверхні','Зниження температури'],0],
['Абсолютна вологість у шкільних задачах — це…',['частка хмар на небі','фактична маса водяної пари в одиниці об’єму','швидкість випаровування'],1],
['Відносна вологість вимірюється переважно у…',['метрах','гектарах','відсотках'],2],
['У повітрі 8 г/м³ пари, максимально можливо 16 г/м³. RH дорівнює…',['25%','50%','200%'],1],
['За незмінної кількості водяної пари повітря охолоджується. RH зазвичай…',['зростає','зменшується','завжди стає 0%'],0],
['Що означає RH ≈100%?',['Повітря майже насичене водяною парою','В атмосфері 100 г води','Йде сильний вітер'],0],
['Точка роси — це…',['найвища температура дня','температура, за якої при охолодженні досягається насичення','температура кипіння води'],1],
['Для чого використовують гігрометр?',['Вимірювати атмосферну вологість','Вимірювати висоту гір','Визначати азимут'],0],
['Чому «вранці RH більша» не доводить, що водяної пари стало більше?',['Бо RH залежить і від температури','Бо RH залежить лише від вітру','Бо водяна пара існує тільки вдень'],0]
];
$('#questions').innerHTML=questions.map((q,i)=>`<div class="q"><p>${i+1}. ${q[0]}</p>${q[1].map((x,j)=>`<label><input type="radio" name="q${i}" value="${j}"> ${x}</label>`).join('')}</div>`).join('');
$('#unlock').addEventListener('click',()=>{const ok=$('#surname').value.trim().length>1&&$('#name').value.trim().length>1&&$('#className').value.trim().length>1;if(!ok){$('#gateMsg').textContent='Заповніть прізвище, ім’я та клас.';return}$('#quiz').classList.add('open');$('#gateMsg').textContent='Тест відкрито. Кожне завдання — 1 бал.';});
$('#quiz').addEventListener('submit',e=>{e.preventDefault();let s=0;questions.forEach((q,i)=>{const a=document.querySelector(`input[name=q${i}]:checked`);if(a&&+a.value===q[2])s++;});$('#score').textContent=`${$('#surname').value} ${$('#name').value}, ${$('#className').value}: ${s}/10 балів. ${s>=8?'Тему засвоєно впевнено.':s>=6?'Повторіть відносну вологість і точку роси.':'Поверніться до лабораторій і §29, потім спробуйте ще раз.'}`;$('#score').scrollIntoView({behavior:'smooth'});});