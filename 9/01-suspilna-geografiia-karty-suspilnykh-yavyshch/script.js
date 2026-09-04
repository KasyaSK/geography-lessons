const $$=(s,p=document)=>[...p.querySelectorAll(s)];
  const $=(s,p=document)=>p.querySelector(s);

  // Warm-up
  $$('#warmChoices .choice').forEach(b=>b.addEventListener('click',()=>{
    b.classList.toggle('selected');
    const selected=$$('#warmChoices .selected');
    if(selected.length>2){b.classList.remove('selected')}
  }));
  $('#checkWarm').addEventListener('click',()=>{
    const vals=$$('#warmChoices .selected').map(b=>b.dataset.key).sort().join('');
    const fb=$('#warmFeedback');
    if(vals==='ac'){fb.className='feedback good';fb.innerHTML='<strong>Так.</strong> Просторовий рисунок і кластери — сильна сторона карти. Але карта не створює причинності й не робить вихідні дані автоматично точними.'}
    else{fb.className='feedback warn';fb.innerHTML='Перевірте логіку: карта особливо сильна там, де важливі <strong>просторові відмінності</strong>. Причинність і якість даних вона сама по собі не гарантує.'}
  });

  // Real map checks
  $$('.map-check').forEach(btn=>btn.addEventListener('click',()=>{
    const card=btn.closest('.map-card'), sel=$('.map-select',card), fb=$('.map-fb',card);
    if(!sel.value){fb.className='feedback warn';fb.textContent='Спочатку оберіть спосіб за легендою карти.';return}
    if(sel.value===card.dataset.correct){fb.className='feedback good';fb.innerHTML='<strong>Влучно.</strong> Тепер назвіть одне обмеження цієї карти: дата, масштаб, територіальні одиниці або тип показника.'}
    else{fb.className='feedback bad';fb.innerHTML='Не зовсім. Подивіться, <strong>що саме змінюється</strong>: колір усієї території чи розмір окремого символу/діаграми.'}
  }));

  // Mini map dataset
  const regions={
    A:{population:920,density:92,birthrate:8.2},B:{population:2100,density:47,birthrate:10.1},C:{population:640,density:80,birthrate:14.5},
    D:{population:1200,density:17,birthrate:11.0},E:{population:1800,density:90,birthrate:7.3},F:{population:550,density:110,birthrate:15.2}
  };
  const modes={
    population:{label:'тис.',q:'Питання: де живе найбільше людей?',ex:'Для абсолютної кількості населення площа регіону не є знаменником. Порівнюємо самі значення.'},
    density:{label:'ос./км²',q:'Питання: де люди живуть найщільніше?',ex:'Тепер важливий знаменник — площа. Малий регіон може мати менше людей, але вищу густоту.'},
    birthrate:{label:'‰',q:'Питання: де найвища інтенсивність народжуваності?',ex:'Коефіцієнт на 1000 осіб дозволяє порівнювати регіони різної людності; абсолютна кількість народжень дала б іншу картину.'}
  };
  const palettes=['#edf4ff','#cfe0ff','#9dbdff','#6d98f2','#3f6ed6','#23479c'];
  function renderMini(mode){
    const vals=Object.values(regions).map(r=>r[mode]), min=Math.min(...vals), max=Math.max(...vals);
    Object.entries(regions).forEach(([k,r])=>{
      const idx=Math.min(5,Math.floor(((r[mode]-min)/(max-min||1))*5.99));
      $('#r'+k).style.fill=palettes[idx]; $('#v'+k).textContent=r[mode]+' '+modes[mode].label;
    });
    $('#labQuestion').textContent=modes[mode].q; $('#labExplain').textContent=modes[mode].ex;
  }
  $$('.lab-btn').forEach(b=>b.addEventListener('click',()=>{$$('.lab-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderMini(b.dataset.mode)}));
  renderMini('population');

  // Mission tabs
  $$('.level-tab').forEach(t=>t.addEventListener('click',()=>{
    $$('.level-tab').forEach(x=>x.classList.remove('active')); $$('.level-panel').forEach(x=>x.classList.remove('active'));
    t.classList.add('active'); $('#level-'+t.dataset.level).classList.add('active');
  }));
  $$('.mission-choice').forEach(b=>b.addEventListener('click',()=>{
    $$('.mission-choice').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');
    const fb=$('.mission-fb'); if(b.dataset.answer==='yes'){fb.className='feedback good mission-fb';fb.innerHTML='Так: частка (%) — відносний показник для територіальних одиниць, тому картограма доречна.'}else{fb.className='feedback warn mission-fb';fb.innerHTML='Подумайте про тип показника: це частка, а не абсолютна кількість.'}
  }));
  $$('.mission-toggle').forEach(b=>b.addEventListener('click',()=>b.classList.toggle('selected')));
  $('#checkMid').addEventListener('click',()=>{const keys=$$('.mission-toggle.selected').map(x=>x.dataset.key).sort().join(',');const fb=$('#midFb');if(keys==='rail,roads'){fb.className='feedback good';fb.innerHTML='Влучно: два транспортні шари безпосередньо відповідають на питання доступності. Опади й ґрунти тут не є мінімально необхідними доказами.'}else{fb.className='feedback warn';fb.innerHTML='Потрібні саме два шари, які прямо описують транспортну мережу.'}});
  $('#checkHigh').addEventListener('click',()=>{const t=$('#highText').value.trim().toLowerCase(),fb=$('#highFb');const hasLimit=t.length>90&&(t.includes('кореля')||t.includes('причин')||t.includes('не довод'))&&(t.includes('населен')||t.includes('туризм')||t.includes('транспорт')||t.includes('доход')||t.includes('потріб'));if(hasLimit){fb.className='feedback good';fb.innerHTML='Структура є: ви відокремили зв’язок від причинності й запропонували додаткові дані. Саме це і є високий рівень.'}else{fb.className='feedback warn';fb.innerHTML='Додайте два елементи: <strong>1)</strong> чому збіг не доводить причину; <strong>2)</strong> конкретний додатковий показник для перевірки (людність, туризм, транспортний вузол, доходи тощо).'}});

  // Duel
  $$('.duel-options button').forEach(b=>b.addEventListener('click',()=>{const fb=$('#duelFb');if(b.dataset.duel==='correct'){fb.className='feedback good';fb.innerHTML='<strong>Точно.</strong> «Кількість» і «рівень» — різні показники. Для рівня потрібна база порівняння/знаменник.'}else{fb.className='feedback bad';fb.innerHTML='Цей аргумент не перевіряє зміст показника. Запитайте: <strong>яке число показане і на що воно поділене?</strong>'}}));

  // CER
  $('#checkCer').addEventListener('click',()=>{const a=$('#cerClaim').value.trim(),b=$('#cerEvidence').value.trim(),c=$('#cerReason').value.trim(),fb=$('#cerFb');if(a.length>25&&b.length>25&&c.length>35){fb.className='feedback good';fb.innerHTML='CER структурно повний. Фінальна перевірка: чи доказ конкретний, а пояснення показує <strong>чому</strong> він підтримує твердження?'}else{fb.className='feedback warn';fb.innerHTML='Ще не повністю: кожен блок має виконувати свою роль. Твердження = відповідь; доказ = конкретний факт/карта; пояснення = логічний міст між ними.'}});

  // Quiz gate
  function validFullName(value){const parts=value.trim().replace(/\s+/g,' ').split(' ');return parts.length>=2&&parts.every(p=>/^[А-ЯІЇЄҐа-яіїєґ'’\-]+$/.test(p));}
  $('#startQuiz').addEventListener('click',()=>{const name=$('#fullName').value,cl=$('#studentClass').value.trim(),fb=$('#gateFb');if(!validFullName(name)||!cl){fb.style.display='block';fb.className='feedback bad';fb.textContent='Введіть ім’я, прізвище та клас. У ПІБ має бути щонайменше два слова без цифр.';return}fb.style.display='none';$('#quiz').style.display='block';$('#quiz').scrollIntoView({behavior:'smooth',block:'start'});});
  function radio(name){return document.querySelector(`input[name="${name}"]:checked`)?.value||''}
  function checks(name){return $$(`input[name="${name}"]:checked`).map(x=>x.value).sort().join(',')}
  $('#submitQuiz').addEventListener('click',()=>{
    let s=0;
    if(radio('q1')==='b')s++; if(radio('q2')==='b')s++; if(radio('q3')==='a')s++; if(radio('q4')==='b')s++;
    if(checks('q5')==='a,b,c')s++; if(checks('q6')==='a,b')s++;
    if($('#q7a').value==='kgram'&&$('#q7b').value==='kdiag'&&$('#q7c').value==='lines')s++;
    if($('#q8a').value==='title'&&$('#q8b').value==='legend'&&$('#q8c').value==='pattern'&&$('#q8d').value==='conclusion')s++;
    if(radio('q9')==='b')s++; if(radio('q10')==='b')s++;
    const pct=s*10; $('#scoreText').textContent=`${s}/10 • ${pct}%`; $('#resName').textContent=$('#fullName').value.trim().replace(/\s+/g,' ');$('#resClass').textContent=$('#studentClass').value.trim();$('#resDate').textContent=new Date().toLocaleString('uk-UA');
    let comment=s<=4?'Потрібно повторити: показник, легенда, різниця між абсолютним і відносним.':s<=7?'Достатній рівень: основна логіка карти зрозуміла, але варто допрацювати межі висновку.':s<=9?'Добре: ви читаєте карту як джерело даних і помічаєте логічні пастки.':'Відмінно: ви відокремлюєте спосіб зображення, доказ, причинність і межі висновку.';
    $('#levelComment').textContent=comment;$('#resultCard').style.display='block';$('#resultCard').scrollIntoView({behavior:'smooth',block:'center'});
  });
  $('#printResult').addEventListener('click',()=>window.print());
  $('#retryQuiz').addEventListener('click',()=>{if(confirm('Очистити відповіді тесту? ПІБ і клас залишаться.')){$('#quiz').reset();$('#resultCard').style.display='none';$('#quiz').scrollIntoView({behavior:'smooth'})}});

  // Accessibility tools
  $('#textSize').addEventListener('click',()=>document.body.classList.toggle('large-text'));
  $('#toTop').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
