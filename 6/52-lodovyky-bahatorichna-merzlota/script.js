const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

$$('#warmup button').forEach(b=>b.addEventListener('click',()=>{
  const f=$('#warmupFeedback');
  if(b.dataset.ok==='1'){f.className='feedback ok';f.textContent='Так. Замерзання на одну зиму недостатньо: багаторічна мерзлота визначається температурою ґрунту ≤ 0 °C щонайменше два роки поспіль.'}
  else{f.className='feedback bad';f.textContent='Це твердження загалом правильне. Шукайте помилку у тривалості промерзання ґрунту.'}
}));

function updateBalance(){const a=+$('#acc').value,b=+$('#abl').value,d=a-b;$('#accVal').textContent=a;$('#ablVal').textContent=b;const box=$('#balanceBox');box.className='balance '+(d<0?'negative':d===0?'neutral':'');box.innerHTML=d>0?`<strong>Баланс +${d}</strong><span>накопичення переважає втрати</span>`:d<0?`<strong>Баланс ${d}</strong><span>втрати переважають накопичення</span>`:`<strong>Баланс 0</strong><span>умовна рівновага</span>`}
$('#acc').addEventListener('input',updateBalance);$('#abl').addEventListener('input',updateBalance);updateBalance();

const places={greenland:{lat:69.2,lng:-49.5,z:4,latText:'висока',elev:'від узбережжя до високого льодовикового щита',ice:'покривне зледеніння + мерзлота'},alaska:{lat:63.2,lng:-151.2,z:4,latText:'висока',elev:'високі гори + арктичні низовини',ice:'гірські льодовики + мерзлота'},himalaya:{lat:28.0,lng:86.8,z:5,latText:'середня',elev:'дуже велика',ice:'гірські льодовики завдяки висоті'},antarctica:{lat:-78,lng:20,z:3,latText:'дуже висока',elev:'великий льодовиковий щит',ice:'покривний льодовик континентального масштабу'}};
let map=L.map('map',{worldCopyJump:true}).setView([55,20],2);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap contributors'}).addTo(map);let marker=L.marker([69.2,-49.5]).addTo(map).bindPopup('Гренландія: льодовиковий щит і периферійні льодовики').openPopup();
$$('.map-btn').forEach(btn=>btn.addEventListener('click',()=>{const p=places[btn.dataset.place];$$('.map-btn').forEach(x=>x.classList.remove('active'));btn.classList.add('active');map.flyTo([p.lat,p.lng],p.z,{duration:1});marker.setLatLng([p.lat,p.lng]).bindPopup(btn.textContent).openPopup();$('#latEvidence').textContent=p.latText;$('#elevEvidence').textContent=p.elev;$('#iceEvidence').textContent=p.ice;}));

function updateTemp(){const t=+$('#temp').value;$('#tempVal').textContent=t;const depth=Math.max(.1,Math.min(3.2,(t+5)*0.075));$('#activeFill').style.height=`${Math.min(72,12+depth*18)}%`;$('#activeText').textContent=`умовний активний шар: ≈ ${depth.toFixed(1)} м`;}
$('#temp').addEventListener('input',updateTemp);updateTemp();
$('#seasonalBtn').onclick=()=>{$('#permaFeedback').className='feedback bad';$('#permaFeedback').textContent='Ні. Якщо ґрунт повністю відтає кожного літа, це сезонно мерзлий ґрунт.'};
$('#notPermafrostBtn').onclick=()=>{$('#permaFeedback').className='feedback ok';$('#permaFeedback').textContent='Так. Для багаторічної мерзлоти потрібні щонайменше два роки температури ґрунту не вище 0 °C на певній глибині.'};

const memos={
 ice:['Не виходити на лід без офіційного підтвердження його безпечності.','Не перевіряти міцність льоду ударом ноги.','Триматися подалі від течій, промоїн, мостів і місць скидання води.','Якщо лід тріщить — не бігти; повертатися лежачи/повзучи тією ж дорогою.'],
 flood:['Стежити за офіційними попередженнями та маршрутами евакуації.','Не переходити й не переїжджати потік води невідомої глибини.','Перенести документи, воду, ліки та заряджені засоби зв’язку вище.','Після підтоплення не торкатися електрообладнання до перевірки фахівцями.'],
 icejam:['Не наближатися до русла під час льодоходу та різкого підйому води.','Не виходити на крижини й не намагатися розбивати затор самостійно.','Відійти на підвищення при швидкому зростанні рівня води.','Слідкувати за повідомленнями ДСНС/місцевої влади.'],
 storm:['Відійти від урізу води, пірсів, скель та хвилерізів.','Не заходити у воду навіть «на хвилину».','Не фотографувати хвилі з небезпечної відстані.','Дочекатися офіційного завершення штормового попередження.'],
 tsunami:['Після сильного прибережного землетрусу негайно рухатися на височину.','Не чекати, поки побачите хвилю.','Не повертатися після першої хвилі: серія може тривати годинами.','Виконувати маршрути евакуації та офіційні вказівки.'],
 bog:['Не йти болотом наодинці та без відомого маршруту.','Оминати ділянки без рослинності, хиткі «вікна» води та місця з нестійким покривом.','Мати довгу палицю для перевірки опори перед кроком.','Якщо провалилися — не робити різких рухів; розподілити вагу, спертися грудьми/руками й повільно вибиратися назад.']
};
$('#buildMemo').onclick=()=>{const k=$('#hazard').value;$('#memo').innerHTML=memos[k].map((t,i)=>`<div><b>${i+1}</b> ${t}</div>`).join('')};$('#buildMemo').click();

const questions=[
 {q:'Що є визначальною ознакою льодовика?',a:['Лід плаває в океані','Лід утворився на суходолі й рухається під дією власної ваги','Будь-яка крига товща 1 м'],c:1},
 {q:'Що означає додатний баланс маси льодовика?',a:['Втрати більші за накопичення','Накопичення більше за втрати','Льодовик перестав рухатися'],c:1},
 {q:'Де можуть існувати гірські льодовики поза полярними широтами?',a:['На дуже великих висотах','Лише біля екватора на рівнинах','Тільки на островах'],c:0},
 {q:'Багаторічна мерзлота — це…',a:['будь-який сніг, що лежить два роки','ґрунт/породи з температурою ≤0 °C щонайменше два роки','льодовик під землею'],c:1},
 {q:'Активний шар мерзлоти…',a:['ніколи не відтає','сезонно відтає і промерзає','складається лише з чистого льоду'],c:1},
 {q:'Чому супутникові серії знімків кращі за одне фото для оцінки відступу льодовика?',a:['Дають порівняння положення межі в різні роки','Завжди мають більшу яскравість','Не потребують датування'],c:0},
 {q:'Що може спричинити танення мерзлоти для інфраструктури?',a:['Стабілізацію ґрунту','Просідання й деформацію ґрунту','Зменшення сезонних змін'],c:1},
 {q:'Кальвінг — це…',a:['відколювання айсбергів від краю льодовика','утворення мерзлоти','замерзання річки'],c:0},
 {q:'Який приклад найкраще доводить роль висоти?',a:['Гімалайські льодовики у середніх широтах','Морський лід Арктики','Крига на зимовій калюжі'],c:0},
 {q:'Як правильно перевіряти твердження про зміну льодовика?',a:['За одним фото без дати','За серією датованих спостережень і однаковими показниками','За враженням очевидця без вимірювань'],c:1}
];
$('#quizQuestions').innerHTML=questions.map((x,i)=>`<div class="q"><h4>${i+1}. ${x.q}</h4>${x.a.map((a,j)=>`<label><input type="radio" name="q${i}" value="${j}">${a}</label>`).join('')}</div>`).join('');
$('#unlock').onclick=()=>{const s=$('#surname').value.trim(),n=$('#name').value.trim(),k=$('#klass').value;const f=$('#lockFeedback');if(s.length<2||n.length<2||!k){f.className='feedback bad';f.textContent='Заповніть прізвище, ім’я та клас — лише після цього відкриється тест.';return}f.className='feedback ok';f.textContent=`Робота: ${s} ${n}, ${k}. Тест відкрито.`;$('#quiz').classList.remove('hidden');$('#quiz').scrollIntoView({behavior:'smooth',block:'start'});};
$('#quiz').addEventListener('submit',e=>{e.preventDefault();let score=0;questions.forEach((x,i)=>{const r=document.querySelector(`input[name=q${i}]:checked`);if(r&&+r.value===x.c)score++});const res=$('#result');res.className='result '+(score>=7?'good':'bad');res.textContent=`${$('#surname').value} ${$('#name').value}, ${$('#klass').value}: ${score}/10 балів.`});