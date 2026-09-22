
(() => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const safeParse=(v,fallback)=>{try{return JSON.parse(v)??fallback}catch{return fallback}};

  // POLL
  const pollKey='classhour_poll_v1';
  const qLabels=[
    'Безпека в класі та на перервах',
    'Повага в класних чатах',
    'Моє «стоп» чують',
    'Знаю дорослого, до якого звернутися',
    'Можу бути собою без страху висміювання'
  ];
  const emptyPoll=()=>({count:0,qs:Array.from({length:5},()=>({yes:0,sometimes:0,no:0}))});
  const getPoll=()=>safeParse(localStorage.getItem(pollKey),emptyPoll());
  const savePoll=d=>localStorage.setItem(pollKey,JSON.stringify(d));
  const pollForm=$('#pollForm'), pass=$('#passScreen'), wrap=$('#pollFormWrap'), err=$('#pollError');
  pollForm.addEventListener('submit',e=>{
    e.preventDefault(); const vals=[];
    for(let i=1;i<=5;i++){const x=$(`input[name="q${i}"]:checked`); if(!x){err.classList.remove('hidden');return} vals.push(x.value)}
    err.classList.add('hidden'); const data=getPoll(); data.count++;
    vals.forEach((v,i)=>data.qs[i][v]++); savePoll(data); pollForm.reset(); wrap.classList.add('hidden'); pass.classList.remove('hidden');
  });
  $('#nextRespondent').addEventListener('click',()=>{pass.classList.add('hidden');wrap.classList.remove('hidden');window.scrollTo({top:$('#poll').offsetTop+120,behavior:'smooth'})});
  const dlg=$('#pollDialog');
  function renderPoll(){
    const d=getPoll(), box=$('#pollResults');
    if(!d.count){box.innerHTML='<div class="notice warn">Поки що немає збережених відповідей.</div>';return}
    box.innerHTML=`<div class="notice safe"><b>Збережено відповідей: ${d.count}</b><br>Не шукаємо, хто саме як відповів. Дивимося лише на загальну картину.</div>`+
      d.qs.map((q,i)=>{
        const yes=Math.round(q.yes/d.count*100), som=Math.round(q.sometimes/d.count*100), no=Math.round(q.no/d.count*100);
        return `<div class="result-row"><div><b>${i+1}. ${qLabels[i]}</b><div class="result-meta"><span>Так: ${q.yes}</span><span>Не завжди/не впевнений: ${q.sometimes}</span><span>Ні: ${q.no}</span></div></div><div><div class="bar"><i style="width:${yes}%"></i></div><div class="micro">Так ${yes}% • частково ${som}% • ні ${no}%</div></div></div>`
      }).join('');
  }
  $('#showPollResults').addEventListener('click',()=>{renderPoll();dlg.showModal()}); $('#closePoll').addEventListener('click',()=>dlg.close());

  // CASES
  const cases=[
    {t:'Ситуація 1',text:'Двоє учнів посперечалися, хто сяде біля вікна. Обоє сердяться, сперечаються приблизно на рівних, а через кілька хвилин домовляються.',ans:'conflict',why:'Це конфлікт: є суперечка, але немає систематичного переслідування й стійкого дисбалансу сил.'},
    {t:'Ситуація 2',text:'У чаті вже кілька днів надсилають меми про одну дитину. Вона написала, що їй неприємно, але інші продовжують і закликають друзів долучатися.',ans:'bullying',why:'Є повторюваність, шкода й перевага групи над однією людиною. Це має ознаки кібербулінгу.'},
    {t:'Ситуація 3',text:'Учень обмовився під час відповіді. Друг пожартував, усі засміялися, включно з ним. Він сказав: «Все, досить», і тема одразу закінчилася.',ans:'joke',why:'За описом це жарт: людині не завдають тривалої шкоди, а межу «досить» поважають.'},
    {t:'Ситуація 4',text:'Учень сховав пенал друга «для приколу». Побачив, що той справді засмутився, одразу повернув пенал, вибачився і більше так не робив.',ans:'joke',why:'Це невдалий жарт, який припинили після чіткої межі. Немає повторюваного переслідування чи стійкої нерівності сил.'},
    {t:'Ситуація 5',text:'Кілька дітей регулярно прибирають одного учня з групового чату, не дають йому брати участь у спільних справах і насміхаються, коли він просить припинити.',ans:'bullying',why:'Систематичне виключення + нерівність сил + шкода — типові ознаки булінгу.'},
    {t:'Ситуація 6',text:'Двоє друзів сильно посварилися й обмінялися образами. Обоє можуть відповідати, обидва зляться, а потім погоджуються поговорити окремо.',ans:'conflict',why:'Це конфлікт. Образи все одно неприйнятні, але ситуація не описує систематичне переслідування слабшої сторони.'}
  ];
  const labels={joke:'Жарт',conflict:'Конфлікт',bullying:'Булінг'};
  $('#cases').innerHTML=cases.map((c,i)=>`<article class="case" data-i="${i}"><div class="tag">${c.t}</div><p>${c.text}</p><div class="choice-row"><button class="btn tiny" data-choice="joke">🙂 Жарт</button><button class="btn tiny" data-choice="conflict">⚖️ Конфлікт</button><button class="btn tiny" data-choice="bullying">🚩 Булінг</button></div><div class="feedback"></div></article>`).join('');
  $$('.case').forEach(card=>card.addEventListener('click',e=>{const b=e.target.closest('[data-choice]');if(!b)return;const c=cases[+card.dataset.i], choice=b.dataset.choice;$$('.btn',card).forEach(x=>x.classList.remove('correct','wrong'));b.classList.add(choice===c.ans?'correct':'wrong');const f=$('.feedback',card);f.classList.add('show');f.innerHTML=`<b>${choice===c.ans?'Так.':'Не зовсім.'}</b> ${c.why}`;}));

  // WITNESS
  $('#checkWitness').addEventListener('click',()=>{let good=0,bad=0;$$('#witnessChoices .check').forEach(l=>{l.classList.remove('goodpick','badpick');const inp=$('input',l);if(inp.checked){if(inp.dataset.good==='1'){l.classList.add('goodpick');good++}else{l.classList.add('badpick');bad++}}});const f=$('#witnessFeedback');f.classList.remove('hidden');f.className='notice '+(good===4&&bad===0?'safe':'warn');f.innerHTML=good===4&&bad===0?'<b>Сильний вибір.</b> Ви не підсилюєте напад, підтримуєте людину й залучаєте допомогу.':'<b>Перегляньте вибір.</b> Безпечна допомога не повинна перетворюватися на нову публічну сварку або поширення принизливого контенту.';});
  $('#resetWitness').addEventListener('click',()=>{$$('#witnessChoices input').forEach(x=>x.checked=false);$$('#witnessChoices .check').forEach(x=>x.classList.remove('goodpick','badpick'));$('#witnessFeedback').classList.add('hidden')});

  // CYBER STEPS
  let seq=[]; const steps=$$('#cyberSteps .step');
  function renderSeq(){steps.forEach(s=>{const n=seq.indexOf(s.dataset.key);s.classList.toggle('selected',n>-1);$('.order',s).textContent=n>-1?`Крок ${n+1}`:'натисніть, щоб додати'})}
  steps.forEach(s=>s.addEventListener('click',()=>{const k=s.dataset.key,idx=seq.indexOf(k);if(idx>-1)seq.splice(idx,1);else seq.push(k);renderSeq()}));
  $('#resetCyber').addEventListener('click',()=>{seq=[];renderSeq();$('#cyberFeedback').classList.add('hidden')});
  $('#checkCyber').addEventListener('click',()=>{const f=$('#cyberFeedback');f.classList.remove('hidden');if(seq.length<4){f.className='notice warn';f.innerHTML='<b>Ще не все.</b> Для повного алгоритму потрібні всі чотири дії.';return}const ev=seq.indexOf('evidence'), bl=seq.indexOf('block'), rp=seq.indexOf('report');if(ev>bl || ev>rp){f.className='notice warn';f.innerHTML='<b>Майже.</b> Якщо це безпечно, збережіть доказ до блокування або скарги: після цього частина повідомлень чи сторінки може стати недоступною. До дорослого можна звернутися одразу — навіть першим кроком.';}else{f.className='notice safe';f.innerHTML='<b>Так.</b> Ви не вступаєте в «війну відповідей»: зберігаєте доказ до можливого зникнення контенту, обмежуєте контакт, використовуєте скаргу і залучаєте дорослого. Звернутися по допомогу можна на будь-якому етапі.';}});

  // AGREEMENT
  const agreementKey='classhour_agreement_v1';
  const ruleTexts=$$('#rules .rule').map(r=>$('b',r).textContent.trim());
  function showAgreement(arr){const box=$('#agreement');box.innerHTML=arr.length?`<b>Наш договір цифрової та класної поваги</b><ol>${arr.map(x=>`<li>${x}</li>`).join('')}</ol><p class="micro">Ми не обіцяємо ніколи не сваритися. Ми домовляємося не принижувати й знати, що робити, коли межу перейдено.</p>`:'<b>Оберіть хоча б одне правило.</b>'}
  $('#buildAgreement').addEventListener('click',()=>{const arr=$$('#rules .rule input').map((x,i)=>x.checked?ruleTexts[i]:null).filter(Boolean);localStorage.setItem(agreementKey,JSON.stringify(arr));showAgreement(arr)}); const savedAgreement=safeParse(localStorage.getItem(agreementKey),[]);if(savedAgreement.length)showAgreement(savedAgreement);

  // DREAMS
  const dreamKey='classhour_dreams_v1';
  const getDreams=()=>safeParse(localStorage.getItem(dreamKey),[]); const saveDreams=d=>localStorage.setItem(dreamKey,JSON.stringify(d));
  function renderDreams(){const ds=getDreams(),wall=$('#dreamWall');wall.innerHTML=ds.length?ds.map((d,i)=>`<div class="dream">${escapeHtml(d)}<button data-del="${i}" title="Видалити (для модерації)">видалити</button></div>`).join(''):'<div class="dream-empty">Стіна поки порожня. Перша мрія може бути зовсім маленькою — це не конкурс.</div>';}
  function escapeHtml(s){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
  $('#addDream').addEventListener('click',()=>{const inp=$('#dreamInput'),v=inp.value.trim();if(!v)return;const ds=getDreams();ds.push(v);saveDreams(ds);inp.value='';renderDreams()});$('#dreamInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('#addDream').click()}});$('#dreamWall').addEventListener('click',e=>{const b=e.target.closest('[data-del]');if(!b)return;const ds=getDreams();ds.splice(+b.dataset.del,1);saveDreams(ds);renderDreams()});renderDreams();

  // PEACE
  $$('#peaceChoices .peace-choice').forEach(b=>b.addEventListener('click',()=>{$$('#peaceChoices .peace-choice').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#peaceOutput').textContent=`Мій маленький внесок у мир у класі: ${b.textContent}.`;}));

  // RESET
  $('#resetAll').addEventListener('click',()=>{if(!confirm('Очистити анонімне опитування, договір і Стіну мрій у цьому браузері?'))return;[pollKey,agreementKey,dreamKey].forEach(k=>localStorage.removeItem(k));renderDreams();$('#agreement').innerHTML='<b>Наші правила з’являться тут.</b><p class="micro">Вони зберігаються лише в цьому браузері.</p>';alert('Локальні результати очищено.');});
})();
