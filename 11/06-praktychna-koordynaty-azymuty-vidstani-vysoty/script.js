(()=>{
  const saveEls=[...document.querySelectorAll('[data-save]')];
  const key='geo11_practical_topo_v2';
  function save(){
    const data={};
    saveEls.forEach((el,i)=>{
      const k=el.name?('name:'+el.name):('i:'+i);
      if(el.type==='radio'){ if(el.checked)data[k]=el.value; }
      else data[k]=el.value;
    });
    localStorage.setItem(key,JSON.stringify(data)); updateProgress();
  }
  function load(){
    let data={}; try{data=JSON.parse(localStorage.getItem(key)||'{}')}catch(e){}
    saveEls.forEach((el,i)=>{
      const k=el.name?('name:'+el.name):('i:'+i);
      if(!(k in data))return;
      if(el.type==='radio')el.checked=(el.value===data[k]); else el.value=data[k];
    }); updateProgress();
  }
  saveEls.forEach(el=>el.addEventListener(el.type==='radio'?'change':'input',save));
  function isFilled(el){ if(el.type==='radio')return [...document.querySelectorAll(`input[name="${el.name}"]`)].some(x=>x.checked); return String(el.value||'').trim().length>0; }
  function updateProgress(){
    const required=[...document.querySelectorAll('[data-required]')];
    const groups=new Set(); let total=0,filled=0;
    required.forEach(el=>{ if(el.type==='radio'){ if(groups.has(el.name))return; groups.add(el.name); total++; if(isFilled(el))filled++; } else {total++; if(isFilled(el))filled++;} });
    const pct=total?Math.round(filled/total*100):0; document.getElementById('progressBar').style.width=pct+'%'; document.getElementById('progressText').textContent=pct+'%';
    return {total,filled,pct};
  }
  load();

  // map controls
  const map=document.getElementById('topoMap'),fallback=document.getElementById('mapFallback'); let zoom=1,rot=90;
  function applyMap(){map.style.transform=`rotate(${rot}deg) scale(${zoom})`;}
  document.getElementById('zoomIn').onclick=()=>{zoom=Math.min(2.2,zoom+.15);applyMap()};
  document.getElementById('zoomOut').onclick=()=>{zoom=Math.max(.65,zoom-.15);applyMap()};
  document.getElementById('rotateBtn').onclick=()=>{rot=(rot+90)%360;applyMap()};
  document.getElementById('resetMap').onclick=()=>{zoom=1;rot=90;applyMap()};
  map.onerror=()=>{map.style.display='none';fallback.style.display='block'};
  const modal=document.getElementById('mapModal');
  document.getElementById('openModal').onclick=()=>{modal.classList.add('show');modal.setAttribute('aria-hidden','false')};
  document.getElementById('modalClose').onclick=()=>{modal.classList.remove('show');modal.setAttribute('aria-hidden','true')};
  modal.addEventListener('click',e=>{if(e.target===modal){modal.classList.remove('show');modal.setAttribute('aria-hidden','true')}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')modal.classList.remove('show')});

  // timer
  let seconds=45*60,interval=null,running=false; const timerBtn=document.getElementById('timerBtn');
  function renderTimer(){const m=Math.floor(seconds/60),s=seconds%60;timerBtn.textContent=`⏱ ${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} • ${running?'пауза':'старт'}`; if(seconds<=300)timerBtn.style.background='#8a4f22';}
  timerBtn.onclick=()=>{running=!running;if(running){interval=setInterval(()=>{if(seconds>0){seconds--;renderTimer()}else{clearInterval(interval);running=false;timerBtn.textContent='⏱ 00:00 • час';alert('45 хвилин минули. Завершуйте висновок і перевірте, чи підписані одиниці вимірювання.')}},1000)}else{clearInterval(interval)}renderTimer()};renderTimer();

  // completeness
  document.getElementById('checkBtn').onclick=()=>{
    const p=updateProgress(),box=document.getElementById('completionResult'); box.classList.add('show');
    if(p.pct===100)box.innerHTML='<b>Основна форма заповнена.</b> Тепер перевірте три речі: одиниці вимірювання, знак магнітного схилення і наявність доказу в завданні 8. Це не автоматична перевірка правильності чисел.';
    else box.innerHTML=`Заповнено <b>${p.filled} із ${p.total}</b> обов’язкових полів (${p.pct}%). Порожні поля підсвічено. Завдання 9–10 не вважаються обов’язковими для базових 10 балів.`;
    document.querySelectorAll('[data-required]').forEach(el=>{ if(el.type!=='radio')el.style.borderColor=isFilled(el)?'#bfcfc2':'#b45a4d'; });
  };

  function report(){
    const val=(selector)=>document.querySelector(selector)?.value?.trim()||'—';
    const student=document.getElementById('student').value||'Учень/учениця';
    let lines=[`Практична робота №1 — ${student}, ${document.getElementById('studentClass').value||'11-Б'}`,''];
    [...document.querySelectorAll('.task')].forEach((task,idx)=>{
      const title=task.querySelector('h3')?.innerText.replace(/\s+/g,' ').trim()||`Завдання ${idx+1}`; lines.push(title);
      [...task.querySelectorAll('input,textarea')].forEach(el=>{if(el.type==='radio')return;const lab=el.closest('div')?.querySelector('label')?.innerText||'Відповідь'; if(el.value.trim())lines.push(`• ${lab}: ${el.value.trim()}`)});
      const checked=task.querySelector('input[type=radio]:checked'); if(checked)lines.push(`• Вибір: ${checked.value}`); lines.push('');
    });
    lines.push('Висновок: '+val('#conclusion')); return lines.join('\n');
  }
  document.getElementById('copyBtn').onclick=async()=>{try{await navigator.clipboard.writeText(report());const b=document.getElementById('completionResult');b.classList.add('show');b.textContent='Звіт скопійовано в буфер обміну.'}catch(e){prompt('Скопіюйте звіт:',report())}};
  document.getElementById('clearBtn').onclick=()=>{if(confirm('Очистити всі збережені відповіді цієї практичної?')){localStorage.removeItem(key);saveEls.forEach(el=>{if(el.type==='radio')el.checked=false;else if(el.id!=='studentClass')el.value='';});document.getElementById('studentClass').value='11-Б';updateProgress();}};

  // teacher score
  const scores=[...document.querySelectorAll('.score')],scoreTotal=document.getElementById('scoreTotal');
  scores.forEach(s=>s.addEventListener('input',()=>{let sum=0;scores.forEach(x=>{let v=parseFloat(x.value);const m=parseFloat(x.dataset.max);if(Number.isFinite(v)){v=Math.max(0,Math.min(m,v));sum+=v;}});scoreTotal.textContent=(Math.round(sum*2)/2).toString().replace('.',',')+' / 12';}));
})();
