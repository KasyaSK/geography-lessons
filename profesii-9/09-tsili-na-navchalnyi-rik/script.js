
(()=>{"use strict";
const $=id=>document.getElementById(id), $$=sel=>Array.from(document.querySelectorAll(sel));
const show=(id,msg,tone="")=>{const e=$(id);if(e){e.textContent=msg;e.className="inlineFeedback"+(tone?" "+tone:"")}};
const focusTo=id=>$(id)?.scrollIntoView({behavior:"smooth",block:"start"});
$("teacherToggle")?.addEventListener("click",()=>{const yes=document.body.classList.toggle("teacherOn");$("teacherToggle").textContent=yes?"Сховати підказки вчителя":"Показати підказки вчителя"});
$("projectorToggle")?.addEventListener("click",()=>{const yes=document.body.classList.toggle("projector");$("projectorToggle").textContent=yes?"Звичайний шрифт":"Крупніший шрифт"});
const stages=Array.from(document.querySelectorAll(".stage[id]")).filter(el=>["s1","s2","s3","s4","s5","s6","s7"].includes(el.id));if("IntersectionObserver" in window){const obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){let k=stages.indexOf(e.target);$("topProgress").style.width=Math.round(100*(k+1)/stages.length)+"%";$$('.nav a[href^="#"]').forEach(a=>a.classList.toggle("navTag",a.getAttribute("href")==="#"+e.target.id))}})},{rootMargin:"-90px 0px -45% 0px",threshold:0});stages.forEach(s=>obs.observe(s))}
const feedbacks={
poll:{a:"Це бажання: воно вказує напрям, але не містить доказу результату.",b:"Тут уже є кількість готових робіт і дата. Залишилося оцінити ресурси.",c:"Це повторювана дія. Вона працює, коли наближає до цілі."},
rescue:{a:"Надолужувати за рахунок сну — небезпечна ціна для будь-якої мети.",b:"Резервний крок на папері зберігає напрям, не порушуючи безпеки.",c:"Один зрив плану не доводить, що людина «нічого не здатна»."},
exit:{a:"Так! Результат і термін — основа конкретної мети.",b:"Так! Час і ресурси впливають на досяжність.",c:"Так! Власний інтерес пояснює, навіщо Вам ця мета."}
};
$$("[data-hook]").forEach(b=>b.addEventListener("click",()=>{
const group=b.dataset.hook,val=b.dataset.value;$$('[data-hook="'+group+'"]').forEach(x=>{x.classList.remove("picked");x.setAttribute("aria-pressed","false")});b.classList.add("picked");b.setAttribute("aria-pressed","true");show(group+"Feedback",feedbacks[group]?.[val]||"Поясніть вибір одним аргументом.",group==="rescue"&&val==="b"?"ok":"");
}));
const cards=[
["Колись хочу створювати відеоігри.","dream","Є інтерес, але поки немає результату і терміну."],
["До 15 грудня створю 2 сцени у 3D-редакторі та збережу файли.","goal","Є результат, кількість і дата. Реалістичність ще потрібно перевірити."],
["По середах працюватиму з 3D-редактором по 25 хвилин.","action","Це регулярна дія, яка може працювати на мету."],
["Було б класно краще розуміти англійську.","dream","Не визначено, що саме стане доказом успіху."],
["До 20 грудня вивчу 80 термінів з дизайну й перевірю себе двома тестами.","goal","Є результат і перевірка. Потрібно оцінити ресурс часу."],
["Щоп’ятниці робитиму невеликий тренувальний тест.","action","Це спосіб практики та перевірки, а не кінцевий результат."]
],sortLabels={dream:"Бажання",goal:"Ціль",action:"Дія"},sortState=new Map();
const sortBox=$("sortCards");if(sortBox)cards.forEach((c,i)=>{
let art=document.createElement("article");art.className="panel";art.innerHTML='<span class="littleTag">КАРТКА '+(i+1)+'</span><h3></h3><div class="flex"></div><p class="tip" role="status"></p>';art.querySelector("h3").textContent=c[0];
["dream","goal","action"].forEach(cat=>{
let btn=document.createElement("button");btn.className="choice";btn.type="button";btn.textContent=sortLabels[cat];btn.addEventListener("click",()=>{
art.querySelectorAll("button").forEach(b=>b.classList.remove("picked","correct","incorrect"));btn.classList.add("picked",cat===c[1]?"correct":"incorrect");sortState.set(i,cat);art.querySelector(".tip").textContent=(cat===c[1]?"✓ ":"Перевірте: ")+c[2];
const good=Array.from(sortState).filter(([n,v])=>cards[n][1]===v).length;$("sortScore").textContent=good+" / "+cards.length;$("sortProgress").style.width=good/cards.length*100+"%";show("sortFeedback",good===cards.length?"Усе правильно! Бажання → ціль → дії: це різні ланки одного маршруту.":"Правильно "+good+" із "+cards.length+". Пояснення важливіше за швидкість.",good===cards.length?"ok":"");
});art.querySelector(".flex").appendChild(btn)});sortBox.appendChild(art);
});
const cases={
design:{who:"Марта, 15 років",interest:"цікавиться графічним дизайном",count:3,mins:45,weekly:80,weeks:6,product:"афіші",risk:"Ноутбук доступний лише кілька разів на тиждень."},
robot:{who:"Денис, 15 років",interest:"цікавиться робототехнікою",count:4,mins:35,weekly:70,weeks:5,product:"електронні схеми",risk:"Не завжди є доступ до потрібних деталей."},
language:{who:"Аліна, 14 років",interest:"любить іноземні мови",count:5,mins:25,weekly:60,weeks:4,product:"тематичні словнички",risk:"Розклад часто змінюється."}};
let current="design";
function updateCase(){const x=cases[current];$("caseTitle").textContent=x.who;$("caseInterest").textContent=x.interest;$("caseStats").textContent=x.weekly+" хв/тиж. · "+x.mins+" хв/одиницю · "+x.weeks+" тижнів";$("caseRisk").textContent=x.risk;$("caseProposed").textContent="За "+x.weeks+" тижнів створити "+x.count+" "+x.product+" й оцінити їх за критеріями.";$$("[data-scenario]").forEach(b=>{const active=b.dataset.scenario===current;b.classList.toggle("picked",active);b.setAttribute("aria-pressed",String(active));});$("caseConclusion").textContent="Дослідіть докази, перш ніж оцінювати реалістичність мети."}
$$("[data-scenario]").forEach(b=>b.addEventListener("click",()=>{current=b.dataset.scenario;$$("input[name=\"evidence\"]").forEach(input=>{input.checked=false});updateCase();show("evidenceFeedback","Новий кейс — оберіть три докази для цього героя.");}));updateCase();
const evidence=[
["time","Час на попередню подібну роботу",true],
["access","Фактична доступність пристрою / матеріалів",true],
["interest","Чи цікава учневі ця діяльність",true],
["friend","Куди планує вступати найкращий друг",false],
["likes","Популярність мотиваційного блогера",false],
["ad","Обіцянка «Профі за 7 днів» у рекламі",false]
];
evidence.forEach(([id,title])=>{const lab=document.createElement("label");lab.className="check";const el=document.createElement("input");el.type="checkbox";el.name="evidence";el.value=id;lab.append(el,document.createTextNode(title));$("evidenceChoices").appendChild(lab)});
$("evidenceCheck")?.addEventListener("click",()=>{
const selected=new Set($$('input[name="evidence"]:checked').map(x=>x.value)),valid=["time","access","interest"].every(x=>selected.has(x))&&selected.size===3,x=cases[current],need=x.count*x.mins,available=x.weekly*x.weeks;
show("evidenceFeedback",(valid?"Три придатні докази знайдено. ":"Перегляньте: потрібні фактичний темп, доступність ресурсів і особистий інтерес. ")+"Потрібно близько "+need+" хв, потенційно є "+available+" хв. "+(need<=available?"Часу на базові дії вистачає, але якість не гарантована.":"За цими даними часу недостатньо."),valid?"ok":"warn");
$("caseConclusion").textContent=need+" хв приблизно потрібно / "+available+" хв доступно. Навіть достатнього часу самого по собі замало для гарантії успіху.";
});
const activities=[
["draft","Створити ескіз / чернетку",45,"product"],["revise","Доопрацювати ескіз",30,"product"],["check","Перевірити результат за критеріями",20,"check"],["video","Переглянути навчальний ролик з нотатками",25,"support"],["scroll","Гортати референси без конкретної задачі",45,"passive"]
];
activities.forEach(a=>{let div=document.createElement("div");div.className="activity";let lab=document.createElement("label");const inp=document.createElement("input");inp.type="checkbox";inp.name="budget";inp.value=a[0];lab.append(inp,document.createTextNode(a[1]));let span=document.createElement("span");span.textContent=a[2]+" хв";div.append(lab,span);$("budgetChoices").appendChild(div)});
function budget(){const set=new Set($$('input[name="budget"]:checked').map(x=>x.value)),used=activities.filter(a=>set.has(a[0])).reduce((s,a)=>s+a[2],0),remain=120-used;
$("budgetUsed").textContent=used+" / 120 хв";$("budgetRemain").textContent=remain+" хв";$("budgetBar").style.width=Math.min(100,used/120*100)+"%";$("budgetBar").classList.toggle("over",remain<20);
const hasProduct=activities.some(a=>a[3]==="product"&&set.has(a[0])),hasCheck=set.has("check");
show("budgetFeedback",used===0?"Виберіть дії. Залишіть резерв щонайменше 20 хвилин.":remain<20?"Резерву менше 20 хв. Скоротіть навантаження.":!hasProduct?"Немає створення продукту. Додайте дію, яка наближає до результату.":!hasCheck?"Додайте перевірку якості: інакше важко оцінити прогрес.":"У плані є конкретний продукт, перевірка та резерв часу.",used>0&&remain>=20&&hasProduct&&hasCheck?"ok":"warn")}
$$('input[name="budget"]').forEach(e=>e.addEventListener("change",budget));budget();
const smart=[
["S","Конкретна","Що саме зроблю?","3 завершені афіші, а не «стати творчим»."],
["M","Вимірювана","Який доказ маю?","Файли трьох робіт + чек-лист якості."],
["A","Досяжна","Чи вистачає ресурсів?","Оцінив час на одну роботу та доступ до пристрою."],
["R","Значуща","Чому це моє?","Цікавлюся дизайном і хочу спробувати цю сферу."],
["T","У часі","Коли перевірю?","До 20 грудня, проміжна перевірка за 2 тижні."]
];
smart.forEach(([a,b,c,d])=>{let item=document.createElement("article");item.className="smartcard";item.innerHTML='<div class="smartletter"></div><h3></h3><p></p><div class="smartExample"></div>';item.querySelector(".smartletter").textContent=a;item.querySelector("h3").textContent=b;item.querySelector("p").textContent=c;item.querySelector(".smartExample").textContent=d;$("smartCards").appendChild(item)});
const t=new Date(),defaultDue=new Date(t.getFullYear(),t.getMonth(),t.getDate()+49);
$("goalDeadline").value=defaultDue.getFullYear()+"-"+String(defaultDue.getMonth()+1).padStart(2,"0")+"-"+String(defaultDue.getDate()).padStart(2,"0");
const interests={design:"Дизайн і творчість",tech:"Інженерія й технології",language:"Мови і комунікація",science:"Дослідження та науки",people:"Люди та суспільні проєкти",other:"Інший напрям"};
function getGoal(){const v=id=>$(id).value.trim();return {interest:v("goalInterest"),why:v("goalWhy"),qty:Number(v("goalCount")),product:v("goalProduct"),minutes:Number(v("goalUnitMinutes")),perWeek:Number(v("goalWeeklyMinutes")),date:v("goalDeadline"),action:v("goalAction"),risk:v("goalRisk"),backup:v("goalBackup"),check:v("goalCheck")}}
function buildPlan(){
const g=getGoal(),future=new Date(g.date+"T12:00:00"),today=new Date(t.getFullYear(),t.getMonth(),t.getDate(),12),weeks=g.date?Math.max(0,Math.ceil((future-today)/(7*864e5))):0,need=g.qty*g.minutes,available=weeks*g.perWeek;
const valid=g.qty>0&&g.product&&g.why&&g.minutes>0&&g.perWeek>0&&weeks>0&&g.action&&g.backup&&g.check;
$("planArea").textContent=interests[g.interest]||"Мій напрям";
$("planHeadline").textContent=valid?"До "+g.date.split("-").reverse().join(".")+" створю "+g.qty+" "+g.product+".":"Заповніть поля, щоб побачити свою ціль на цій картці.";
$("planWhy").textContent=g.why||"…";$("planAction").textContent=g.action||"…";$("planProof").textContent=g.check||"…";$("planBackup").textContent=g.backup||"…";
$("planTime").textContent=valid?"Потрібно приблизно "+need+" хв. Є близько "+available+" хв протягом "+weeks+" тижнів.":"Бюджет часу з’явиться після заповнення.";
$("planChecklist").textContent=(g.product&&g.qty>0?"✓ Результат ":"○ Результат ")+(g.why?"· ✓ Інтерес ":"· ○ Інтерес ")+(weeks?"· ✓ Дата ":"· ○ Дата ")+(g.action?"· ✓ Дії ":"· ○ Дії ")+(g.backup&&g.check?"· ✓ Перевірка + план Б":"· ○ Перевірка + план Б");
show("planFeedback",!valid?"Уточніть результат, особистий мотив, дату, ресурси, регулярну дію, перевірку й план Б.":need>available?"Потрібного часу більше, ніж доступного за оцінкою. Зменште обсяг або перегляньте графік.":"Приблизного часу достатньо. Це оцінка, а не гарантія: перевіряйте проміжні результати.",valid&&need<=available?"ok":"warn");
const text=["МІЙ МАРШРУТ НА 2026–2027","Інтерес: "+(interests[g.interest]||""),"Ціль: "+$("planHeadline").textContent,"Чому це для мене: "+g.why,"Повторювана дія: "+g.action,"Перевірка: "+g.check,"Орієнтовні витрати: "+need+" хв; доступно: "+available+" хв","План Б: "+g.backup].join("\n");
return {valid,text};
}
$("buildPlan")?.addEventListener("click",()=>{buildPlan();focusTo("planPreview")});
$("fillExample")?.addEventListener("click",()=>{const values={goalInterest:"design",goalWhy:"Мені цікаво спробувати себе у графічному дизайні.",goalCount:"3",goalProduct:"навчальні афіші",goalUnitMinutes:"50",goalWeeklyMinutes:"90",goalAction:"У вівторок створюю ескіз, у четвер доопрацьовую",goalRisk:"electricity",goalBackup:"За відсутності світла малюю композицію на папері",goalCheck:"Порівнюю роботи з чек-листом читабельності і композиції"};Object.entries(values).forEach(([id,val])=>$(id).value=val);buildPlan()});
$("downloadPlan")?.addEventListener("click",()=>{const p=buildPlan();if(!p.valid){show("planFeedback","Спершу заповніть усі ключові поля.","warn");return}const url=URL.createObjectURL(new Blob([p.text],{type:"text/plain;charset=utf-8"}));let a=document.createElement("a");a.href=url;a.download="moya-tsil-profesii-9.txt";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)});
$("printPlan")?.addEventListener("click",()=>{const p=buildPlan();if(!p.valid){show("planFeedback","Для друку заповніть усі обов’язкові поля.","warn");return;}document.body.classList.remove("print-result");document.body.classList.add("print-plan");window.print()});
const quiz=[
["single","Що з наведеного є перевірюваною ціллю?",["Стати творчою людиною","Дивитися всі цікаві відео","До 20 грудня створити 4 макети та отримати відгук за 2 критеріями","Завжди думати про майбутнє"],2,"Продукт, термін і критерії дають змогу оцінити результат."],
["single","12 макетів по 70 хв за 6 тижнів; доступно 90 хв щотижня. Яка оцінка правильна?",["Не вистачає 300 хвилин","Ресурсу досить","Не вистачає 840 хвилин","Вистачить із резервом 300 хвилин"],0,"Потрібно 840 хв, є 540 хв. Дефіцит — 300."],
["single","Учениця любить інженерію. Яка ціль найбільше відповідає її інтересам?",["Вступити туди, куди йдуть друзі","За 2 місяці створити 3 прості схеми й оцінити, чи подобається робота","Обрати найвідоміший фах","Не перевіряти практикою свій інтерес"],1,"Власний інтерес варто перевіряти діями, а не повторювати чужий вибір."],
["single","Через непередбачені події зірвався один навчальний тиждень. Що робити?",["Працювати всю ніч","Вважати мету проваленою","Порівняти фактично виконане й безпечно скоригувати план","Збільшити навантаження удвічі"],2,"Реалістичний план допускає адаптацію."],
["multi","Які три факти підтверджують досяжність мети?",["Час попередніх подібних завдань","Доступність інструментів","Рейтинг блогера","Вільний час на тиждень","Популярність у класі"],[0,1,3],"Орієнтуйтеся на власний темп, доступні ресурси й час."],
["multi","Які три складники роблять план надійнішим?",["Мала регулярна дія","Критерій перевірки результату","Запасний план на перешкоди","Відмова від відпочинку","Порівняння тільки з друзями"],[0,1,2],"Дія, доказ і гнучкість важливіші за гучні обіцянки."],
["match","Поєднайте частини SMART із прикладами.",["S — конкретність","M — вимірюваність","R — значущість"],[1,2,0],"S — продукт, M — доказ, R — особистий мотив.",["Люблю інженерію","Створю навчальну презентацію","Перевірю 5 слайдів за чек-листом"]],
["order","Розташуйте кроки від першого до четвертого.",["Перевірка результату й коригування","Оцінити свої інтереси та ресурси","Сформулювати результат, критерій і термін","Запланувати регулярні дії"],[4,1,2,3],"Інтереси → мета → дії → перевірка."],
["single","Учень каже: «Моя ціль реалістична, бо я дуже хочу». Чого бракує?",["Оцінки часу та ресурсів","Схвалення друзів","Мотиваційного відео","Красивого оформлення"],0,"Мотивація не доводить досяжності."],
["single","Який висновок поєднує твердження, доказ і пояснення?",["Я впораюся, бо хочу","План добрий, бо гарний","За два тижні створив 3 із 4 ескізів; отже, варто трохи змінити графік","Усі повинні працювати швидко"],2,"Дані пов’язані з причиною коригування."]
];
const escapeText=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fullName=s=>{let a=s.trim().replace(/\s+/g," ").split(" ");return a.length>=2&&a.every(x=>/^[\p{L}][\p{L}'’-]*$/u.test(x))};
function makeQuiz(){
$("quizQuestions").innerHTML="";
quiz.forEach((q,i)=>{
 let div=document.createElement("div");div.className="quizQ";div.id="q"+i;let h=document.createElement("h3");h.textContent=(i+1)+". "+q[1];div.appendChild(h);
 if(q[0]==="single"||q[0]==="multi"){q[2].forEach((option,k)=>{let label=document.createElement("label");label.className="check";let input=document.createElement("input");input.name="answer"+i;input.type=q[0]==="multi"?"checkbox":"radio";input.value=k;label.append(input,document.createTextNode(option));div.appendChild(label)})}
 if(q[0]==="match"||q[0]==="order"){q[2].forEach((left,j)=>{let group=document.createElement("div");group.className="group";let title=document.createElement("strong");title.textContent=left;let select=document.createElement("select");select.setAttribute("aria-label",left);select.dataset.slot=j;let options=q[0]==="order"?["1","2","3","4"]:q[5];select.innerHTML='<option value="">Оберіть відповідь</option>'+options.map((x,k)=>'<option value="'+(q[0]==="order"?k+1:k)+'">'+escapeText(x)+'</option>').join("");group.append(title,select);div.appendChild(group)})}
 $("quizQuestions").appendChild(div);
});
}
$("quizStart")?.addEventListener("click",()=>{
 if(!fullName($("studentName").value)||!/^9(?:[\s-]?[А-ЯІЇЄҐа-яіїєґA-Za-z0-9])?$/.test($("studentClass").value.trim())){show("gateFeedback","Введіть ім’я та прізвище й клас, наприклад «9-А».","warn");return}
 makeQuiz();$("quizGate").hidden=true;$("quizBody").hidden=false;focusTo("quizBody");
});
function resultFor(q,i){const root=$("q"+i);if(q[0]==="single"){let x=root.querySelector("input:checked");return x===null?null:Number(x.value)===q[3]}
 if(q[0]==="multi"){let a=Array.from(root.querySelectorAll("input:checked")).map(x=>Number(x.value)).sort((a,b)=>a-b);return !a.length?null:JSON.stringify(a)===JSON.stringify(q[3].slice().sort((a,b)=>a-b))}
 let values=Array.from(root.querySelectorAll("select")).map(x=>x.value);return values.some(x=>x==="")?null:values.every((x,j)=>Number(x)===q[3][j]);}
$("quizSubmit")?.addEventListener("click",()=>{
const results=quiz.map((q,i)=>resultFor(q,i)),missing=results.indexOf(null);
if(missing!==-1){show("quizFeedback","Дайте відповіді на всі 10 питань. Не заповнено №"+(missing+1)+".","warn");focusTo("q"+missing);return}
let total=results.filter(Boolean).length;quiz.forEach((q,i)=>{let box=$("q"+i);box.classList.add(results[i]?"right":"wrong");let p=document.createElement("p");p.className="feedback";p.textContent=(results[i]?"✓ ":"↻ ")+q[4];box.appendChild(p);Array.from(box.querySelectorAll("input,select")).forEach(x=>x.disabled=true)});
$("quizSubmit").disabled=true;$("quizResult").hidden=false;$("resultIdentity").textContent=$("studentName").value.trim()+" · "+$("studentClass").value.trim();$("resultScore").textContent=total+" / 10";$("resultDate").textContent=new Date().toLocaleString("uk-UA");
$("resultComment").textContent=total===10?"Усі завдання правильно.":total>=8?"Сильний результат: перегляньте пояснення до помилок.":total>=5?"Є основа: повторіть логіку й розрахунки.":"Повторіть матеріал і після цього спробуйте ще раз.";focusTo("quizResult");
});
$("quizAgain")?.addEventListener("click",()=>{$("quizResult").hidden=true;$("quizBody").hidden=true;$("quizGate").hidden=false;$("quizSubmit").disabled=false;show("quizFeedback","");focusTo("quizGate")});
$("printResult")?.addEventListener("click",()=>{if($("quizResult").hidden)return;document.body.classList.remove("print-plan");document.body.classList.add("print-result");window.print()});
window.addEventListener("afterprint",()=>document.body.classList.remove("print-result","print-plan"));
$("goalBuilder")?.addEventListener("input",()=>buildPlan());
$("goalBuilder")?.addEventListener("change",()=>buildPlan());

$("quickExample")?.addEventListener("click",()=>{$("quickInterest").value="Цікавлюся дизайном і хочу перевірити цей напрям";$("quickGoal").value="До 20 грудня створю 2 афіші й перевірю за чек-листом";$("quickStep").value="Цього тижня зроблю перший ескіз";show("quickOutput","Вигаданий приклад готовий. Можете змінити його під свій інтерес.","ok")});
["quickInterest","quickGoal","quickStep"].forEach(id=>$(id)?.addEventListener("input",()=>show("quickOutput","Формулювання змінено. Натисніть «Сформувати», щоб переглянути оновлену картку.")));
$("quickMake")?.addEventListener("click",()=>{const v=["quickInterest","quickGoal","quickStep"].map(x=>$(x).value.trim());if(v.some(x=>!x)){show("quickOutput","Заповніть інтерес, результат із терміном і першу дію.","warn");return}show("quickOutput","ІНТЕРЕС: "+v[0]+" | МЕТА: "+v[1]+" | ПЕРШИЙ КРОК: "+v[2]+". Тепер обміняйтеся зворотним зв’язком.","ok")});
$("peerCheck")?.addEventListener("click",()=>{let criteria=[["peerConcrete","Конкретність і термін"],["peerInterest","Зв’язок із інтересом"],["peerAction","Перший крок"]],good=criteria.filter(x=>$(x[0]).checked).map(x=>x[1]),improve=criteria.filter(x=>!$(x[0]).checked).map(x=>x[1]),advice=$("peerAdvice").value.trim();if(!advice){show("peerOutput","Напишіть конкретну пораду партнерові.","warn");return}show("peerOutput","СИЛЬНІ СТОРОНИ: "+(good.join(", ")||"потрібно уточнити")+" | ЩО УТОЧНИТИ: "+(improve.join(", ")||"усі критерії виконано")+" | ПОРАДА: "+advice+". Відредагуйте свою ціль після відгуку.","ok")});
})();
