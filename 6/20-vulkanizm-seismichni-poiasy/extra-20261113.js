
// Додаткові інтерактиви. Працюють без мережі; зовнішніми є лише реальні фото та джерела.
(function(){
"use strict";
const by=id=>document.getElementById(id);
const all=sel=>Array.from(document.querySelectorAll(sel));
const setStatus=(id,ok,message)=>{
  const n=by(id);if(!n)return;
  n.textContent=message;n.className="volc-status "+(ok?"correct":"incorrect");
};
// Кейс-галерея: справжній вибір ризику, не кнопка "показати".
const caseAnswers={
  kilauea:["lava","Гавайські виверження часто супроводжуються потоками базальтової лави. Також небезпечні гази та нестійкі ділянки поверхні."],
  sthelens:["pyro","1980 року Сент-Геленс пережив вибух, обвал схилу й швидкі руйнівні пірокластичні потоки. Це не типовий повільний лавовий потік."],
  iceland:["infra","Під час вивержень Рейк’янеса 2023–2024 років потоки лави загрожували дорогам, водо- й теплопостачанню та околицям Гріндавіка."],
  tonga:["tsunami","Виверження підводного вулкана 2022 року супроводжувалося потужною ударною хвилею, попелом і цунамі."],
  etna:["ash","Етна може викидати значну кількість попелу: це створює ризики для дихання, транспорту й авіації, хоча можливі також лавові потоки."]
};
all("[data-case-check]").forEach(btn=>btn.addEventListener("click",()=>{
 const id=btn.getAttribute("data-case-check"),selector=by("case-"+id),val=selector.value;
 const entry=caseAnswers[id];
 if(!val){setStatus("case-feedback-"+id,false,"Оберіть небезпеку, а потім перевіряйте.");return;}
 setStatus("case-feedback-"+id,val===entry[0],(val===entry[0]?"Вірно. ":"Ще ні. ")+entry[1]);
}));
// Схема тектонічних ситуацій: субдукція, рифт, гаряча точка, зсув.
const plates={
 subduction:{heading:"Зіткнення із зануренням (субдукція)",text:"Одна літосферна плита занурюється під іншу. Вода з порід зануреної плити сприяє плавленню в мантійному клині. Магма піднімається, утворюючи вулканічну дугу. Приклади: Анди, Японія, Каскадні гори.",note:"Не кожне зіткнення дає вулканізм: під час зіткнення двох континентів (наприклад, у Гімалаях) активні вулкани не є закономірним результатом.",scheme:1},
 spreading:{heading:"Розходження плит",text:"У рифтовій зоні плити розсуваються, а гаряча мантійна речовина піднімається. Через зменшення тиску частина речовини плавиться. Приклади: Серединно-Атлантичний хребет, Ісландія.",note:"Переважна більшість таких вулканів прихована під океаном. Ісландія особлива ще й впливом мантійного плюму.",scheme:2},
 hotspot:{heading:"Гаряча точка всередині плити",text:"Магма може підніматися і далеко від меж плит. Тихоокеанська плита рухається над гарячою точкою — так формувався Гавайський вулканічний ланцюг, до якого належить Кілауеа.",note:"Правило «всі вулкани стоять на межах плит» — помилкове. Гарячі точки є важливим винятком.",scheme:3},
 transform:{heading:"Зсувна межа плит",text:"Плити ковзають одна відносно одної. Тут часто виникають землетруси, але типового механізму масового утворення магми немає.",note:"Землетрус не дорівнює вулкану. Каліфорнійський розлом Сан-Андреас — відомий приклад зсувної межі.",scheme:4}
};

// Схеми не генеруються: використано оригінальні матеріали USGS.
const plateSchemes={
  1:"https://commons.wikimedia.org/wiki/Special:FilePath/Tectonic_plate_boundaries.png",
  2:"https://commons.wikimedia.org/wiki/Special:FilePath/Tectonic_plate_boundaries.png",
  3:"https://commons.wikimedia.org/wiki/Special:FilePath/Tectonic_plate_boundaries2.png",
  4:"https://commons.wikimedia.org/wiki/Special:FilePath/Tectonic_plate_boundaries.png"
};
function plateSVG(type) {
  return '<figure class="volc-source-figure"><img loading="lazy" src="'+plateSchemes[type]+'" alt="Оригінальна наукова схема USGS: будова і типи меж літосферних плит, гаряча точка та вулкани"><figcaption>Джерело: Jose F. Vigil / USGS, суспільне надбання. <a target="_blank" rel="noopener" href="https://www.usgs.gov/media/images/plate-boundary-types">Переглянути оригінал USGS ↗</a></figcaption></figure>';
}
all("[data-plate]").forEach(b=>b.addEventListener("click",()=>{
 const key=b.getAttribute("data-plate"),v=plates[key];
 all("[data-plate]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
 by("plate-drawing").innerHTML=plateSVG(v.scheme);
 by("plate-description").textContent=v.text;
 by("plate-heading").textContent=v.heading;
 by("plate-limit").textContent=v.note;
}));
const first=all("[data-plate]")[0];if(first)first.click();
// Перевірка механізму на прикладах.
const mappings={fuji:"subduction",kilauea:"hotspot",iceland:"spreading",sanandreas:"transform",andes:"subduction",midatlantic:"spreading"};
by("plate-check")?.addEventListener("click",()=>{
 let count=0,answered=0;
 Object.entries(mappings).forEach(([k,v])=>{
  const sel=by("plate-match-"+k),yes=sel.value===v;if(sel.value)answered++;if(yes)count++;
  sel.style.borderColor=!sel.value?"#d49a58":yes?"#69aa8b":"#d46f5a";
 });
 setStatus("plate-feedback",count===6,"Правильних відповідностей: "+count+"/6. "+(count===6?"Всі механізми зіставлено.":"Перегляньте схему й виправте підсвічені поля.")+(answered<6?" Деякі відповіді ще не вибрані.":""));
});
// Ілюстративна якісна модель: не фізичний симулятор.
function updateMagma(){
 const v=Number(by("magma-viscosity").value),g=Number(by("magma-gas").value);
 by("magma-v-value").textContent=String(v)+"/5";by("magma-g-value").textContent=String(g)+"/5";
 by("magma-vis-bar").style.width=(v*20)+"%";
 by("magma-gas-bar").style.width=(g*20)+"%";
 const danger=v*g;
 by("magma-scene").innerHTML='<figure class="volc-source-figure"><img loading="lazy" src="https://www.nps.gov/common/uploads/nri/subject/volcanoes/97716A98-AF44-B40D-7F90BC64F169FA04/97716A98-AF44-B40D-7F90BC64F169FA04.jpg?autorotate=false&maxHeight=1020&maxWidth=1300" alt="Офіційна схема будови вулкана: кратер, магма, жерло, попіл, лава, пірокластичний потік, лахар"><figcaption>Оригінальна схема NPS / USGS. Параметри ліворуч змінюють тільки текстову оцінку, а не саму схему. <a target="_blank" rel="noopener" href="https://www.nps.gov/subjects/volcanoes/anatomy-of-a-volcano.htm">Першоджерело ↗</a></figcaption></figure>';
 let trend=danger>=16?"Підвищена схильність до вибухового перебігу":"Можливий спокійніший вихід лави";
 by("magma-result").innerHTML='<strong>'+trend+'</strong><p>В’язкість: '+(v<=2?"низька":v>=4?"висока":"середня")+'. Вміст газів: '+(g<=2?"менший":g>=4?"значний":"помірний")+'. Прогноз залежить також від води, глибини, температури, складу магми та будови жерла.</p>';
}
["magma-viscosity","magma-gas"].forEach(k=>by(k)?.addEventListener("input",updateMagma));updateMagma();
by("magma-check")?.addEventListener("click",()=>{
 let ok=by("magma-example").value==="visgas";
 setStatus("magma-feedback",ok,ok?"Так: в'язка, насичена газами магма часто створює умови для вибухового виверження. Але це не правило без винятків.":"Найбільшу схильність до вибухового сценарію в спрощеній моделі дає поєднання в'язкої магми та великої кількості газів.");
});
const riskCases={a:{right:"b",text:"Місто Б розташоване на підвищенні поза долиною, тому в умовній задачі ризик лахара менший. Реальний вибір залежить від офіційної карти небезпек."},b:{right:"a",text:"За напрямку вітру на схід західна точка А зазвичай має менший ризик попелопаду. Але вітрові умови змінюються; орієнтуються на офіційні повідомлення."}};
by("risk-check")?.addEventListener("click",()=>{
 const type=by("risk-situation").value,guess=by("risk-choice").value,caseData=riskCases[type];
 if(!guess){setStatus("risk-feedback",false,"Спочатку виберіть місце.");return;}
 setStatus("risk-feedback",guess===caseData.right,(guess===caseData.right?"Обґрунтовано. ":"Спробуйте ще. ")+caseData.text);
});
by("risk-situation")?.addEventListener("change",()=>{
 by("risk-choice").value="";by("risk-feedback").textContent="Оберіть точку та перевірте.";
});
const proofCorrect=["seismic","gas","deform"];
by("proof-check")?.addEventListener("click",()=>{
 const selected=all('input[name="proof-indicator"]:checked').map(x=>x.value);
 const correct=selected.length===3&&proofCorrect.every(x=>selected.includes(x));
 setStatus("proof-feedback",correct,correct?"Так. Сейсмічність, гази і деформація схилів — незалежні інструменти моніторингу. Висновок потребує аналізу фахівців.":"Для аналізу стану вулкана обирайте вимірювання фахівців, а не легенди, форму хмар чи календар.");
});
// Зручна картка результату із часом для скриншота.
by("submitQuiz")?.addEventListener("click",()=>{
 const result=by("score"); if(!result||!by("quiz")||by("quiz").classList.contains("locked"))return;
 const text=result.textContent,match=text.match(/(\d+)\/10/),score=match?Number(match[1]):null;
 if(score===null)return;
 const student=[by("name").value.trim(),by("surname").value.trim()].join(" "),cl=by("class").value;
 const date=new Intl.DateTimeFormat("uk-UA",{dateStyle:"medium",timeStyle:"short"}).format(new Date());
 result.innerHTML="<div class='volc-indicator'><h3>Картка результату · Експрес-тест №2</h3><p>"+student+" · "+cl+"</p><p><strong>"+score+"/10 · "+(score*10)+"%</strong></p><p>Дата та час: "+date+"</p><p>Зробіть скриншот і передайте вчителю.</p></div>";
});
})();
