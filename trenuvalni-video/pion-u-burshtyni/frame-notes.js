(() => {
"use strict";
const dataUrl="frame-directions.json";
const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
let directions=null;
const css=document.createElement("style");
css.textContent=`
.frame-director{margin:28px 0;background:#fffdf9;border:1px solid #d4d3c9;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px #0000000b}
.frame-director header{background:#162b33;color:#f9f5eb;padding:19px 23px;display:flex;gap:15px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.frame-director header strong{display:block;font:26px Georgia,serif}
.frame-director header small{color:#c7d1d1;font-size:12px}
.frame-director header a{font-size:12px;color:#f7d29b;border:1px solid #9b8061;border-radius:6px;padding:9px 12px;text-decoration:none}
.frame-director .director-columns{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)}
.frame-director .director-focus{padding:23px 24px;border-right:1px solid #e7e4dc}
.frame-director .director-constants{padding:23px 24px;background:#f7f6f1}
.frame-director .director-id{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#996c37;font-weight:800;margin-bottom:7px}
.frame-director h3{font:24px Georgia,serif;margin:0 0 13px}
.frame-director h4{font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#926a38;margin:19px 0 6px}
.frame-director p{font-size:13px;line-height:1.7;color:#42505a;margin:0 0 12px}
.frame-director .director-main{font-size:16px;font-weight:650;line-height:1.6;color:#1e323b}
.frame-director .director-meta{display:flex;gap:7px;flex-wrap:wrap}
.frame-director .director-meta span{font:11px system-ui;color:#20464b;background:#e7f0ed;border-radius:6px;padding:6px 8px}
.frame-director .director-hint{font-size:11px;color:#778281}
.frame-director .director-step{height:7px;background:#e1e2dc;border-radius:6px;overflow:hidden;margin:11px 0 16px}
.frame-director .director-step i{display:block;height:100%;background:#bf8c47;transition:width .12s}
.frame-director details{border-top:1px solid #e2e1db;padding:12px 24px;background:#faf9f5}
.frame-director summary{cursor:pointer;font-size:13px;font-weight:800;color:#244047}
.frame-director .director-beats{padding:8px 0 2px}
.frame-director .beat-row{display:grid;grid-template-columns:95px minmax(0,1fr);gap:14px;padding:10px 0;border-bottom:1px solid #e5e6df}
.frame-director .beat-row:last-child{border-bottom:none}
.frame-director .beat-row b{font-size:12px;color:#816037}
.frame-director .beat-row p{font-size:12px;margin:3px 0}
.frame-director .directed{font-weight:700;color:#a16b30}
@media(max-width:830px){.frame-director .director-columns{grid-template-columns:1fr}.frame-director .director-focus{border-right:0;border-bottom:1px solid #e7e4dc}.frame-director header strong{font-size:21px}}
`;
document.head.appendChild(css);
const board=document.createElement("section");
board.className="frame-director";
board.id="frameDirectionPanel";
board.setAttribute("aria-label","Мікрорежисура кадру");
board.innerHTML='<header><div><small>ВИРОБНИЧИЙ ПЛАН • 720 ФРЕЙМІВ</small><strong>Мікрорежисура обраного кадру</strong></div><a href="frame-directions.md" target="_blank" rel="noopener noreferrer">Повний документ 720 кадрів ↗</a></header><div id="directorActive" class="director-columns"><div class="director-focus"><p>Завантаження описів…</p></div></div><details><summary>Послідовність дії всередині обраної сцени</summary><div class="director-beats" id="directorBeats"></div></details>';
const target=document.querySelector(".frames-area");
if(!target)return;
target.parentNode.insertBefore(board,target);
function update(){
 if(!directions)return;
 const id=Number(document.getElementById("frameId")?.textContent.match(/\d+/)?.[0]??1);
 if(!Number.isInteger(id)||id<1||id>720)return;
 const f=directions.frames[id-1],s=directions.scenes[f.scene-1];
 const html=`
 <div class="director-focus">
  <div class="director-id">Сцена ${String(f.scene).padStart(2,"0")} / 22 · фрейм ${String(f.id).padStart(4,"0")} / 720</div>
  <h3>${esc(s.title)}</h3>
  <div class="director-meta"><span>${esc(f.timeStart)} → ${esc(f.timeEnd)}</span><span>8 кадрів/с</span><span>${esc(f.beat)}</span><span>Фаза ${f.phase}/${f.phaseCount}</span></div>
  <h4>Що зображувати саме в цьому фреймі</h4>
  <p class="director-main">${esc(f.action)}</p>
  <p><strong>Міжкадрова зміна:</strong> ${esc(f.delta)}</p>
  <div class="director-step"><i style="width:${f.trajectoryPercent}%"></i></div>
  <p><strong>Стикування з попереднім:</strong> ${esc(f.previous)}</p>
  <p><strong>Підготовка наступного:</strong> ${esc(f.next)}</p>
 </div>
 <div class="director-constants">
  <h4>Камера і простір</h4><p>${esc(f.camera)}</p>
  <h4>Безперервність</h4><p>${esc(f.space)}</p>
  <h4>Світло</h4><p>${esc(f.lighting)}</p>
  <h4>Звук і діалог</h4><p>${esc(f.sound)}</p>
  <h4>Заборони і канон</h4><p>${esc(f.prohibitions)}</p>
  <p class="director-hint">Опис — постановочна інструкція, а не підтвердження створеного зображення. Усі комірки залишаються порожніми до завантаження ілюстрацій.</p>
 </div>`;
 document.getElementById("directorActive").innerHTML=html;
 const currentScene=board.dataset.scene||"";
 if(currentScene!==String(f.scene)){
   board.dataset.scene=String(f.scene);
   document.getElementById("directorBeats").innerHTML=s.beats.map((b,i)=>
    '<div class="beat-row"><b>'+esc(b.start.toFixed(3))+'–'+esc(b.end.toFixed(3))+'</b><div><strong>'+esc(b.description)+'</strong><p>'+esc(s.storyboardActions[i].join(" → "))+'</p><p><em>'+esc(s.detailedCamera[i])+'</em></p></div></div>'
   ).join("");
 }
}
function addCellDetails(){
 directions.frames.forEach(f=>{
  const tile=document.getElementById("frame-"+f.id);
  if(!tile)return;
  const small=tile.querySelector(".frame-meta small");
  if(small)small.textContent=f.action;
  tile.title="Фрейм "+String(f.id).padStart(4,"0")+" • "+f.timeStart+"–"+f.timeEnd+"\n"+f.action+"\n"+f.camera;
 });
}
fetch(dataUrl,{cache:"no-cache"}).then(r=>{
 if(!r.ok)throw new Error("HTTP "+r.status);
 return r.json();
}).then(d=>{
 if(d.frames?.length!==720||d.scenes?.length!==22)throw new Error("Некоректний виробничий маніфест");
 directions=d;addCellDetails();
 const obs=new MutationObserver(()=>update());
 obs.observe(document.getElementById("frameId"),{subtree:true,childList:true,characterData:true});
 document.querySelectorAll(".frame-cell,.scene-link,.overviewsegment").forEach(e=>e.addEventListener("click",()=>queueMicrotask(update)));
 document.getElementById("scrub")?.addEventListener("input",()=>queueMicrotask(update));
 update();
}).catch(e=>{
 document.getElementById("directorActive").innerHTML='<div class="director-focus"><p>Не вдалося завантажити детальні описи: '+esc(e.message)+'. <a href="frame-directions.json">Відкрити JSON із 720 фреймами.</a></p></div>';
});
})();