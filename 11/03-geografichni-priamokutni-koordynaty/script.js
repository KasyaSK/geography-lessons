(() => {
  "use strict";
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];

  $$("#hypothesis .choice").forEach(btn=>btn.addEventListener("click",()=>{
    $$("#hypothesis .choice").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
    const m={
      yes:"Гіпотезу зафіксовано. Перевіримо, що саме вимірює кожна система.",
      no:"Гіпотезу зафіксовано. Спробуємо довести або спростувати її двома алгоритмами.",
      maybe:"Гіпотезу зафіксовано. Масштаб впливає на точність, але чи визначає він саму систему координат?"
    };
    $("#hypoFeedback").textContent=m[btn.dataset.h];
  }));

  const typetext={
    geo:"Географічні координати: кутова величина, пов’язана з паралелями й меридіанами.",
    rect:"Прямокутні координати: лінійна величина у метрах/кілометрах у площині проєкції.",
    none:"Це важливий елемент топокарти, але не координата точки."
  };
  $$(".classify").forEach(btn=>btn.addEventListener("click",()=>{
    $$(".classify").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
    $("#classifyFeedback").textContent=typetext[btn.dataset.type];
  }));

  $$("#evidenceCards input").forEach(inp=>inp.addEventListener("change",()=>inp.closest(".evidence-card").classList.toggle("selected",inp.checked)));
  $("#checkEvidence").addEventListener("click",()=>{
    const vals=$$("#evidenceCards input:checked").map(x=>x.value).sort().join(",");
    $("#evidenceFeedback").textContent = vals==="grid"
      ? "Так. Саме числово підписані лінії кілометрової сітки безпосередньо потрібні для X/Y."
      : "Для цього твердження потрібен один прямий доказ: кілометрова сітка. Хвилинна рамка працює з φ/λ, легенда — зі змістом карти.";
  });

  $("#checkGeo").addEventListener("click",()=>{
    const ld=+$("#latDeg").value,lm=+$("#latMin").value,od=+$("#lonDeg").value,om=+$("#lonMin").value;
    const ok=ld===50 && od===30 && (lm===28 || lm===29) && (om===17 || om===18);
    $("#geoFeedback").textContent=ok
      ? "Наближено правильно. Точніше за заданою позицією: близько 50°28′03″ пн. ш., 30°17′51″ сх. д. На реальній карті ви інтерполюєте за рамкою, а не за відсотком зображення."
      : "Орієнтир: від півночі 50°30′ рухаємося вниз приблизно на 1′57″; від заходу 30°15′ — на схід приблизно на 2′51″.";
  });

  $("#checkRect").addEventListener("click",()=>{
    const x=$("#rectX").value.replace(/\s/g,""),y=$("#rectY").value.replace(/\s/g,"");
    $("#rectFeedback").textContent=(x==="6065550" && y==="4308750")
      ? "Правильно. X = 6 065 000 + 550 = 6 065 550; Y = 4 308 000 + 750 = 4 308 750."
      : "Перевірте: до повних значень південної та західної ліній треба додати зміщення точки всередині квадрата: +550 м до X і +750 м до Y.";
  });

  $$(".duel").forEach(btn=>btn.addEventListener("click",()=>{
    const m={
      "1":"Хибне. У топографічній системі X визначають саме за горизонтальними лініями кілометрової сітки; шкільна декартова інтуїція тут легко збиває.",
      "2":"Правильне. Це «false easting»: умовний зсув ординати, щоб не мати від’ємних Y у зоні.",
      "3":"Хибне. Градуси й мінути — ознака географічних координат.",
      "4":"Загалом правильне як тенденція, але точність також залежить від самої карти, знімання, друку й способу вимірювання."
    };
    $("#duelFeedback").textContent=m[btn.dataset.d];
  }));

  $("#checkCer").addEventListener("click",()=>{
    const vals=[$("#cerC").value,$("#cerE").value,$("#cerR").value].map(x=>x.trim());
    $("#cerFeedback").textContent=vals.every(v=>v.length>=25)
      ? "CER структурно повний. Сильна версія має прямо розрізнити кутові φ/λ і лінійні X/Y та назвати межу точності."
      : "Заповніть усі три частини повними реченнями: твердження, конкретний приклад-координату і пояснення різниці систем.";
  });

  function validFullName(value){
    const parts=value.trim().replace(/\s+/g," ").split(" ");
    return parts.length>=2 && parts.every(p=>/^[А-ЯІЇЄҐа-яіїєґA-Za-z'’\-]+$/.test(p));
  }
  let studentName="", studentClass="";
  $("#startQuiz").addEventListener("click",()=>{
    const n=$("#fullName").value,c=$("#studentClass").value;
    if(!validFullName(n)||!c){$("#gateError").textContent="Введіть ім’я, прізвище та оберіть клас.";return}
    studentName=n.trim().replace(/\s+/g," ");studentClass=c;
    $("#identityGate").hidden=true;$("#quiz").hidden=false;$("#gateError").textContent="";
    $("#quiz").scrollIntoView({behavior:"smooth",block:"start"});
  });

  function radio(name){return ($(`input[name="${name}"]:checked`)||{}).value||""}
  function exact(name,expected){
    const got=$$(`input[name="${name}"]:checked`).map(x=>x.value).sort(), exp=[...expected].sort();
    return got.length===exp.length && got.every((v,i)=>v===exp[i]);
  }

  $("#quiz").addEventListener("submit",e=>{
    e.preventDefault();let score=0;
    if(radio("q1")==="b")score++;
    if(radio("q2")==="a")score++;
    if(radio("q3")==="b")score++;
    if(radio("q4")==="b")score++;
    if(exact("q5",["angle","dms","global"]))score++;
    if(exact("q6",["basis","measure","scale"]))score++;
    const matches={m1:"a",m2:"b",m3:"c"};
    if($$("[data-match]").every(s=>s.value===matches[s.dataset.match]))score++;
    if(radio("q8")==="a")score++;
    if(radio("q9")==="a")score++;
    if(radio("q10")==="b")score++;

    $("#scoreText").textContent=`${score}/10`;
    $("#percentText").textContent=`${score*10}%`;
    $("#resultName").textContent=studentName;$("#resultClass").textContent=studentClass;
    $("#dateText").textContent=new Date().toLocaleString("uk-UA");
    $("#levelComment").textContent=score<=4?"Рівень: повторіть §2, особливо різницю φ/λ та X/Y."
      :score<=7?"Рівень: достатньо. Ще раз відпрацюйте алгоритм кілометрової сітки."
      :score<=9?"Рівень: добре. Ви впевнено розрізняєте координатні системи."
      :"Рівень: відмінно. Усі 10 завдань виконано правильно.";
    $("#resultCard").hidden=false;$("#resultCard").scrollIntoView({behavior:"smooth",block:"start"});
  });

  $("#retryQuiz").addEventListener("click",()=>{
    if(!confirm("Пройти тест ще раз? ПІБ і клас збережуться, відповіді очищено."))return;
    $("#quiz").reset();$("#resultCard").hidden=true;$("#quiz").scrollIntoView({behavior:"smooth",block:"start"});
  });
})();