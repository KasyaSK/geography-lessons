const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const proc={freeze:'Фізичне вивітрювання: порода руйнується на місці через замерзання й розширення води.',roots:'Біологічне/фізичне вивітрювання: корені розширюють тріщини, уламки ще не обов’язково переносяться.',river:'Водна ерозія: потік не лише руйнує, а й переносить матеріал.',wind:'Вітрова ерозія: дрібні частинки переносяться повітряним потоком.'};
$$('#processGrid button').forEach(b=>b.onclick=()=>$('#processInfo').innerHTML=proc[b.dataset.p]);
$$('.check').forEach(b=>b.onclick=()=>$('#'+b.dataset.target).classList.toggle('show'));
$$('#evidenceChoices button').forEach(b=>b.onclick=()=>{let f=$('#evidenceFeedback');f.textContent=b.dataset.answer==='right'?'Так. Ключова ознака ерозії — перенесення продуктів руйнування.':'Ні. Перевірте, чи є доказ переміщення матеріалу і чи не плутаєте тригер з процесом.';f.className='feedback '+(b.dataset.answer==='right'?'ok':'bad')});
$('#runWeathering').onclick=()=>{let t=+$('#temp').value,w=+$('#water').value,r=+$('#roots').value;let a=[];if(t>6&&w>4)a.push('сильне морозне руйнування');if(r>6)a.push('помітне кореневе розширення тріщин');if(w>7&&t<5)a.push('активні хімічні реакції/розчинення за наявності відповідних мінералів');if(!a.length)a.push('помірне вивітрювання без одного домінуючого механізму');$('#weatheringResult').textContent='Прогноз моделі: '+a.join('; ')+'.';};
$('#checkErosion').onclick=()=>{let n=0;$$('#erosionQuiz select').forEach(s=>{if(s.value===s.dataset.ok)n++});let f=$('#erosionFeedback');f.textContent=`Правильно: ${n}/3. Вода формує яри, вітер переміщує пісок у дюнах, льодовик шліфує й переносить матеріал.`;f.className='feedback '+(n===3?'ok':'bad')};
const factors={rain:'Вода насичує ґрунт, збільшує масу й може зменшувати тертя вздовж площини ковзання.',cut:'Підрізання підніжжя забирає опору, тому стійкість схилу зменшується.',quake:'Коливання можуть порушити рівновагу вже нестійкого схилу.',roots:'Корені часто зміцнюють верхній шар ґрунту. Втрата рослинності на деяких схилах підвищує ризик ерозії та зсувів.'};
$$('.factor-buttons button').forEach(b=>b.onclick=()=>$('#factorInfo').textContent=factors[b.dataset.factor]);
$('#claimCheck').onclick=()=>{let f=$('#claimFeedback');f.textContent='Твердження хибне. Ризик визначають не лише кут схилу, а й геологічна будова, вода, підрізання, навантаження, рослинність і тригери. Пологіші зсуви теж можливі.';f.className='feedback ok'};
$$('.warning-grid button').forEach(b=>b.onclick=()=>{let f=$('#warningFeedback');f.textContent=b.dataset.sign==='yes'?'Так, це може бути попереджувальною ознакою руху схилу. Не підходьте ближче й повідомте дорослих/служби.':'Саме по собі це не є типовою новою ознакою розвитку зсуву.';f.className='feedback '+(b.dataset.sign==='yes'?'ok':'bad')});
$('#buildPoster').onclick=()=>{$('#posterPreview').innerHTML=`<h3>Зсув: пам’ятка жителю і туристу</h3><p><b>Ознаки:</b> ${$('#signs').value}</p><p><b>Дії:</b> ${$('#actions').value}</p><p><b>Не робити:</b> ${$('#dont').value}</p>`};
$('#proofCheck').onclick=()=>$('#proofFeedback').classList.toggle('show');
$('#cerCheck').onclick=()=>{let c=$('#cerC').value.trim(),e=$('#cerE').value.trim(),r=$('#cerR').value.trim(),f=$('#cerFeedback');let ok=c.length>20&&e.length>35&&r.length>35;f.textContent=ok?'Структура є. Перевірте, чи доказ справді спостережуваний, а пояснення зв’язує його з тезою.':'Додайте конкретну тезу, щонайменше один спостережуваний доказ і причинне пояснення.';f.className='feedback '+(ok?'ok':'bad')};
const qs=[
['Що найточніше описує вивітрювання?',['Перенесення уламків річкою','Руйнування або зміна породи на місці','Сповзання маси вниз','Накопичення наносів'],1],
['Яка ознака обов’язкова для ерозії в шкільному визначенні?',['Магма','Переміщення матеріалу','Землетрус','Лише мороз'],1],
['Що є прикладом фізичного вивітрювання?',['Замерзання води в тріщинах','Осідання дельти','Перенесення пилу вітром','Зсув'],0],
['Головна сила, що переміщує масу під час зсуву:',['Магнетизм','Сила тяжіння','Сонячне світло','Коріолісова сила'],1],
['Після зливи з’явились нові тріщини та вода на схилі. Найкраща дія:',['Підійти й виміряти тріщину','Ігнорувати','Відійти від небезпечної ділянки й повідомити дорослих/служби','Стати нижче схилу'],2],
['Який агент формує дюни?',['Вітер','Льодовик','Магма','Підземне ядро'],0],
['Що найкраще доводить ерозію?',['Порода тріснула','Уламки переміщуються потоком','Камінь нагрівся','Корінь росте в тріщині'],1],
['Який чинник може зменшити стійкість схилу?',['Насичення ґрунту водою','Відсутність сили тяжіння','Стабільна основа','Зміцнення підніжжя'],0],
['Акумуляція — це:',['Руйнування на місці','Накопичення перенесеного матеріалу','Рух плит','Виверження'],1],
['Чому одного фото інколи недостатньо, щоб відрізнити вивітрювання від ерозії?',['Бо процеси не існують','Треба знати, чи матеріал переміщувався та які зміни відбувалися з часом','Бо потрібен тільки глобус','Бо ерозія буває лише в океані'],1]
];
function buildQuiz(){let q=$('#questions');q.innerHTML=qs.map((x,i)=>`<div class="question-item"><b>${i+1}. ${x[0]}</b>${x[1].map((o,j)=>`<label><input type="radio" name="q${i}" value="${j}"> ${o}</label>`).join('')}</div>`).join('')}
$('#unlock').onclick=()=>{let f=$('#firstName').value.trim(),l=$('#lastName').value.trim(),c=$('#className').value,lock=$('#testLock');if(!f||!l||!c){lock.textContent='🔒 Заповніть ім’я, прізвище та клас.';lock.className='feedback bad';return}buildQuiz();$('#quiz').hidden=false;lock.textContent=`🔓 ${l} ${f}, ${c}: тест відкрито.`;lock.className='feedback ok'};
$('#quiz').onsubmit=e=>{e.preventDefault();let s=0;qs.forEach((x,i)=>{let a=document.querySelector(`input[name=q${i}]:checked`);if(a&&+a.value===x[2])s++});$('#score').textContent=`Результат: ${s}/10 балів.`};
(function enhancement(){
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 $$(".fieldphoto img,.hero-card img,.photo-grid img").forEach(img=>{
  let attempts=0;img.addEventListener("error",()=>{attempts++;const backup="https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/153000/153158/landslide_oli2_20240801_lrg.jpg";
   if(attempts===1&&img.src!==backup)img.src=backup;
   else{const fig=img.closest("figure");if(fig&&!fig.querySelector(".imageNotice")){const p=document.createElement("p");p.className="imageNotice small";p.textContent="Фото тимчасово недоступне. Скористайтеся посиланням на першоджерело.";fig.append(p);}}});
 });
 const slider=$("#nasaSlider");
 if(slider)slider.addEventListener("input",()=>{$("#nasaCompare").style.setProperty("--split",slider.value+"%");$("#nasaOutput").textContent=slider.value+"%"});
 function choices(selector,target,answer){$$(selector+" button").forEach(b=>b.onclick=()=>{$(target).textContent=b.dataset.good==="yes"?answer:"Цього висновку немає у спостереженнях. Перевірте, чи бачимо ми рух уламків або наслідок перекриття русла.";});}
 choices("#atlasChoices","#atlasAnswer","Правильно. Для доказу ерозії або іншого перенесення треба встановити рух частинок; сама тріщина може бути результатом вивітрювання.");
 choices("#nasaChoices","#nasaAnswer","Так. Природна гребля накопичує воду. Її прорив може спричинити раптовий паводок із наносами нижче за течією.");
 function freeze(){
  const wet=+$("#simWater").value,cold=+$("#simCold").value,n=+$("#simCycles").value;
  $("#cyclesOut").textContent=n;
  $("#rockPiece").setAttribute("transform",`translate(${wet&&cold?n*4:0} 0)`);
  $("#iceGap").setAttribute("opacity",wet&&cold?"1":".15");
  $("#freezeAnswer").textContent=wet&&cold?`За ${n} умовних циклів вода може розширювати тріщину під час замерзання. Наведені величини не є реальними вимірами.`:!wet?"Без води у тріщині морозне розширення води не працює.":"За температури вище 0 °C вода не замерзає, тому саме цей механізм не працює.";
 }
 ["#simWater","#simCold","#simCycles"].forEach(id=>$(id).addEventListener("change",freeze));
 $("#runFreeze").onclick=freeze;freeze();
 function erosion(){
  const s=+$("#simSlope").value,r=+$("#simDownpour").value,g=+$("#simGreen").value;
  $("#slopeOut").textContent=s;$("#rainOut").textContent=r;$("#greenOut").textContent=g;
  $("#simHill").setAttribute("d",`M15 ${144-s*10} L386 192 L425 190 L425 235 L15 235Z`);
  $("#simGrass").setAttribute("d",`M15 ${144-s*10} L386 192`);
  $("#simStream").setAttribute("d",`M21 ${148-s*10} Q200 136 380 191`);
  $("#simStream").setAttribute("stroke-width",String(3+r*1.6));
  $("#simRain").setAttribute("opacity",String(.1+r*.09));
  $("#simParticles").setAttribute("opacity",String(Math.min(1,Math.max(.1,(s+r-g)/15))));
  const score=s+r-g;
  $("#erosionAnswer").textContent=(score>11?"Відносно високий":score>5?"Помірний":"Відносно низький")+" умовний потенціал змиву. Схил "+s+"/10, злива "+r+"/10, рослинність "+g+"/10. Для реального прогнозу бракує даних про ґрунт, водозбір і тривалість дощу.";
 }
 ["#simSlope","#simDownpour","#simGreen"].forEach(id=>$(id).addEventListener("input",erosion));$("#runErosion").onclick=erosion;erosion();
 const cases=[
 ["Схил після зливи: з’явилися нові тріщини, паркан нахилився, вода виходить із ґрунту. Як діяти?",["Відійти та повідомити дорослих/служби","Підійти і виміряти тріщину","Почекати прямо під схилом"],0,"Нові деформації та просочування води — можливі попереджувальні ознаки зсуву. Це не точний прогноз, але діяти треба обережно."],
 ["Річка стала каламутною після дощу, а нижче з’явилася піщана коса. Що сталося?",["Тільки вулканізм","Вода перенесла й відклала наноси","Гірські породи випарувалися"],1,"Річкова вода переносить частинки; при зниженні здатності потоку їх нести виникає акумуляція."],
 ["На фотографії скелі видно тріщину. Чи можна за нею встановити активний зсув?",["Так, завжди","Ні, треба додаткові ознаки руху та спостереження в часі","Так, якщо камінь червоний"],1,"Тріщина може мати різне походження. Без даних про зміни в часі не можна впевнено встановлювати рух маси порід."]];
 $("#caseTasks").innerHTML=cases.map((x,i)=>`<div class="caseItem"><h3>Справа ${i+1}</h3><p>${x[0]}</p><div class="choiceRow">${x[1].map((a,j)=>`<button type="button" data-i="${i}" data-j="${j}">${a}</button>`).join("")}</div><div id="caseResult${i}" class="answer"></div></div>`).join("");
 $$("#caseTasks button").forEach(b=>b.onclick=()=>{const x=cases[+b.dataset.i];$("#caseResult"+b.dataset.i).textContent=(+b.dataset.j===x[2]?"✓ ":"Подумайте ще. ")+x[3];});
 // Avoid interpreting pupil-written text as HTML.
 $("#buildPoster").onclick=()=>{const el=$("#posterPreview");el.replaceChildren();const h=document.createElement("h3");h.textContent="Зсув: пам’ятка жителю і туристу";el.append(h);
  [["Ознаки","#signs"],["Дії","#actions"],["Не робити","#dont"]].forEach(([t,id])=>{const p=document.createElement("p"),b=document.createElement("b");b.textContent=t+": ";p.append(b,document.createTextNode($(id).value));el.append(p);});};
 // Replace easy recall test with case-based questions, keeping the 10-point scoring gate.
 const data=[
 ["Корені розширили тріщину, але уламки не переміщувалися. Яке пояснення найточніше?",["Вивітрювання на місці","Водна ерозія","Зсув","Акумуляція"],0,"Корені можуть руйнувати породу без перенесення продуктів руйнування."],
 ["Злива утворила нову вимоїну на схилі. Що було головним агентом руйнування?",["Лід","Поверхневий стік води","Сейсмічні хвилі","Підземна магма"],1,"Текуча вода змиває пухкий матеріал і поглиблює вимоїну."],
 ["У річці після паводку з’явилася нова піщана коса. Чому?",["Вода втратила здатність переносити частину піску","Зникла сила тяжіння","Збільшився вулканічний тиск","Пісок випарувався"],0,"Коса виникає через накопичення наносів."],
 ["Після зливи нові тріщини і нахилені стовпи поблизу схилу. Яка дія найбезпечніша?",["Підійти ближче","Залишитися під схилом","Відійти й повідомити дорослих або служби","Зайти в тріщину"],2,"Важливі ознаки можливого руху схилу."],
 ["Яке спостереження найкраще підтверджує ерозію, а не лише вивітрювання?",["Камінь став теплим","Вітер переносить пил від скелі","Корені ростуть у тріщині","Скеля має червонуватий колір"],1,"Перенесення — ключовий доказ ерозійного процесу."],
 ["На супутникових фото NASA видно перекриту зсувом річку. Який вторинний ризик?",["Прорив загати й паводок","Обов’язкове виверження","Зникнення атмосфери","Повне припинення опадів"],0,"Накопичення води вище зсувної греблі загрожує раптовим проривом."],
 ["Які умови найсприятливіші для морозного розширення тріщин?",["Вода + переходи температури через 0 °C","Безводна скеля + постійно тепло","Сухе повітря без замерзання","Стійка висока температура"],0,"Морозне вивітрювання потребує води і її замерзання."],
 ["Оберіть правильний причинний ланцюг утворення яру.",["Дощ → поверхневий стік → розмивання → яр","Яр → вулкан → опади","Дюна → магма → яр","Тріщина → обов’язковий землетрус → яр"],0,"Потік води розмиває пухкий ґрунт і поглиблює вимоїну."],
 ["Дослідник бачить лише одну тріщину на фото. Яких даних бракує для висновку про активний зсув?",["Кольору неба","Спостережень деформації в часі й додаткових ознак руху","Назви країни","Кількості туристів"],1,"Самої тріщини недостатньо для визначення активності руху схилу."],
 ["Який висновок містить твердження, доказ і пояснення?",["Це зсув, бо я так відчуваю","Тріщини нові й стовпи похилилися — можливий рух ґрунту, тому варто відійти і повідомити дорослих","Всі тріщини утворюють льодовики","Після дощу зсуви неможливі"],1,"Висновок пов’язує спостереження з гіпотезою і безпечною дією."]];
 qs.splice(0,qs.length,...data.map(x=>x.slice(0,3)));
 $("#quiz").onsubmit=e=>{e.preventDefault();let total=0;let marked=0;
  data.forEach((x,i)=>{const a=document.querySelector(`input[name=q${i}]:checked`);if(a)marked++;const good=a&&+a.value===x[2];if(good)total++;const slot=document.querySelectorAll(".question-item")[i];if(slot&&!slot.querySelector(".why")){const p=document.createElement("div");p.className="why";p.textContent=(good?"✓ ":"✗ ")+x[3];slot.append(p);}});
  const name=$("#lastName").value.trim()+" "+$("#firstName").value.trim(),klass=$("#className").value,d=new Date();
  const out=$("#score");out.replaceChildren();
  const card=document.createElement("div");card.className="scoreResult";const h=document.createElement("h3");h.textContent="📋 Картка результату";
  const id=document.createElement("p");id.textContent=name+" • "+klass+" • Зовнішні процеси";
  const num=document.createElement("strong");num.textContent=total+"/10 • "+total*10+"%";
  const time=document.createElement("p");time.textContent="Дата й час: "+d.toLocaleString("uk-UA");
  const comment=document.createElement("p");comment.textContent=marked<10?`Ви відповіли на ${marked} із 10 запитань. `:"";comment.textContent+=total>=8?"Високий результат; перегляньте пояснення.":total>=5?"Повторіть поняття та приклади.":"Поверніться до фотоатласу й моделей та повторіть тест.";
  const note=document.createElement("p");note.textContent="📷 Зробіть скриншот цієї картки та надішліть учителю. Сайт не відправляє відповіді автоматично.";
  const print=document.createElement("button");print.type="button";print.textContent="🖨️ Друкувати";print.onclick=()=>window.print();
  [h,id,num,time,comment,note,print].forEach(x=>card.append(x));out.append(card);$("#quiz").querySelector('button[type=submit]').disabled=true;out.scrollIntoView({block:"start",behavior:"smooth"});
 };
})();