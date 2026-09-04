(() => {
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];

  $$('.vote').forEach(btn=>btn.addEventListener('click',()=>{
    $$('.vote').forEach(x=>x.classList.remove('active')); btn.classList.add('active');
    $('#voteFeedback').classList.add('show'); localStorage.setItem('prof8_vote',btn.dataset.vote);
  }));

  const skillText={
    tech:'<b>Швидко зростають:</b> ШІ й великі дані, мережі та кібербезпека, технологічна грамотність.',
    human:'<b>Людські навички не зникають:</b> творче й аналітичне мислення, лідерство, співпраця, стійкість і гнучкість.',
    learn:'<b>Навичка, яка підтримує інші:</b> допитливість і навчання впродовж життя — тому професійний вибір не закінчується після школи.'
  };
  $$('.skill-tab').forEach(b=>b.addEventListener('click',()=>{ $$('.skill-tab').forEach(x=>x.classList.remove('active')); b.classList.add('active'); $('#skillPanel').innerHTML=skillText[b.dataset.skill]; }));

  const selectedExpect=new Set();
  $$('.expect').forEach((b,i)=>b.addEventListener('click',()=>{
    if(selectedExpect.has(i)){selectedExpect.delete(i); b.classList.remove('selected');}
    else if(selectedExpect.size<3){selectedExpect.add(i); b.classList.add('selected');}
    $('#expectCounter').textContent=`Обрано: ${selectedExpect.size} / 3${selectedExpect.size===3?' — готово':''}`;
  }));

  $$('#evidenceGrid .ev button').forEach(b=>b.addEventListener('click',()=>{
    const card=b.closest('.ev'), ok=b.dataset.choice===card.dataset.answer;
    card.classList.add('resolved');
    $('.ev-note',card).textContent=ok ? 'Так. Це відповідає логіці курсу: дослідження, рефлексія, перевірка даних і корекція цілей.' : 'Не зовсім. Курс не гарантує долю чи зарплату; він розвиває здатність приймати більш обґрунтовані рішення.';
  }));

  let seq=[];
  $$('#sequence .seq-item').forEach(b=>b.addEventListener('click',()=>{
    if(b.classList.contains('chosen')) return; seq.push(Number(b.dataset.step)); b.classList.add('chosen'); b.textContent=`${seq.length}. ${b.textContent}`;
  }));
  $('#checkSequence').addEventListener('click',()=>{ $('#sequenceMsg').textContent=JSON.stringify(seq)==='[1,2,3,4]'?'✅ Логіка зібрана: спочатку дані, потім зіставлення, далі план і повторна перевірка.':'Спробуйте ще раз: план не повинен з’являтися раніше, ніж дані про себе та світ праці.'; });
  $('#resetSequence').addEventListener('click',()=>{seq=[]; $$('#sequence .seq-item').forEach(b=>{b.classList.remove('chosen'); b.textContent=b.textContent.replace(/^\d+\.\s/,'');}); $('#sequenceMsg').textContent='';});

  $$('.level-check').forEach(b=>b.addEventListener('click',()=>{
    const lvl=b.dataset.level;
    if(lvl==='basic'){
      const v=$$('.basic:checked').map(x=>x.value).sort().join(','); $('#basicResult').textContent=v==='self,world'?'✅ Саме так: потрібні дані і про себе, і про реальність праці.':'Підказка: «модність» не замінює дослідження.';
    } else if(lvl==='mid'){
      const v=$('input[name="mid"]:checked'); $('#midResult').textContent=v&&v.value==='b'?'✅ Сильніше рішення перевіряє задачі, умови й навички, а не лише назву професії.':'Потрібно не додати ще одну здогадку, а зібрати дані.';
    } else {
      const v=$('input[name="high"]:checked'); $('#highResult').textContent=v&&v.value==='b'?'✅ Один тест — лише одне джерело; висновок потребує підтвердження іншими даними.':'Один показник не дає права робити остаточний професійний висновок.';
    }
  }));

  $$('#duelOptions button').forEach(b=>b.addEventListener('click',()=>{
    $$('#duelOptions button').forEach(x=>x.classList.remove('correct','wrong')); b.classList.add(b.dataset.correct==='true'?'correct':'wrong');
    $('#duelMsg').textContent=b.dataset.correct==='true'?'Це сильний контраргумент: він не заперечує важливість вибору, а уточнює, якою має бути робота над ним зараз.':'Цей аргумент занадто абсолютний і не пояснює, як приймати кращі рішення.';
  }));

  $('#saveCer').addEventListener('click',()=>{
    const data={claim:$('#claim').value,evidence:$('#evidenceText').value,reasoning:$('#reasoning').value}; localStorage.setItem('prof8_cer',JSON.stringify(data)); $('#cerMsg').textContent='Збережено локально в браузері.';
  });
  try{const d=JSON.parse(localStorage.getItem('prof8_cer')||'null'); if(d){$('#claim').value=d.claim||'';$('#evidenceText').value=d.evidence||'';$('#reasoning').value=d.reasoning||'';}}catch(e){}

  $('#makeGoal').addEventListener('click',()=>{
    const g=$('#goal').value.trim(), e=$('#goalEvidence').value.trim(), f=$('#firstStep').value.trim();
    if(!g||!e||!f){$('#goalPreview').classList.add('show'); $('#goalPreview').innerHTML='<b>Заповніть усі три поля.</b>'; return;}
    localStorage.setItem('prof8_goal',JSON.stringify({g,e,f}));
    $('#goalPreview').classList.add('show'); $('#goalPreview').innerHTML=`<div class="kicker">Моя стартова ціль</div><h3>${escapeHtml(g)}</h3><p><b>Доказ прогресу:</b> ${escapeHtml(e)}</p><p><b>Перший крок:</b> ${escapeHtml(f)}</p><p class="mini">Поверніться до цієї картки наприкінці семестру й перевірте, що змінилося.</p>`;
  });
  function escapeHtml(s){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

  function validFullName(value){const parts=value.trim().replace(/\s+/g,' ').split(' ');return parts.length>=2&&parts.every(p=>/^[А-ЯІЇЄҐа-яіїєґ'’\-]+$/.test(p));}
  $('#startQuiz').addEventListener('click',()=>{
    const n=$('#fullName').value, c=$('#studentClass').value;
    if(!validFullName(n)||!c){$('#gateError').textContent='Введіть ім’я та прізвище українськими літерами та оберіть клас.';return;}
    $('#gateError').textContent=''; $('#identityGate').style.display='none'; $('#quiz').classList.add('show');
  });
  const exact=(name,arr)=>$$(`input[name="${name}"]:checked`).map(x=>x.value).sort().join('|')===arr.sort().join('|');
  $('#submitQuiz').addEventListener('click',()=>{
    let s=0;
    if($('input[name="q1"]:checked')?.value==='b')s++;
    if($('input[name="q2"]:checked')?.value==='a')s++;
    if($('input[name="q3"]:checked')?.value==='c')s++;
    if($('input[name="q4"]:checked')?.value==='a')s++;
    if(exact('q5',['self','world','path']))s++;
    if(exact('q6',['tasks','skills','conditions']))s++;
    if($('[name="q7a"]').value==='interests'&&$('[name="q7b"]').value==='vacancies'&&$('[name="q7c"]').value==='rights'&&$('[name="q7d"]').value==='plan')s++;
    if($('[name="q8"]').value==='b')s++;
    if($('input[name="q9"]:checked')?.value==='a')s++;
    if($('input[name="q10"]:checked')?.value==='b')s++;
    const pct=s*10; const comment=s<=4?'Потрібно ще раз пройти логіку курсу: «дані → зіставлення → план → перевірка».':s<=7?'Достатній старт: основна логіка зрозуміла, але варто уважніше відрізняти доказ від припущення.':s<=9?'Добрий результат: Ви впевнено розрізняєте функції курсу та сильні професійні аргументи.':'Відмінно: логіка усвідомленого професійного вибору засвоєна без помилок.';
    $('#scoreText').textContent=`${s}/10`; $('#resultName').textContent=$('#fullName').value.trim(); $('#resultClass').textContent=$('#studentClass').value; $('#resultPercent').textContent=pct+'%'; $('#resultTime').textContent=new Date().toLocaleString('uk-UA'); $('#resultComment').textContent=comment; $('#resultCard').classList.add('show'); $('#resultCard').scrollIntoView({behavior:'smooth',block:'center'});
  });
  $('#printResult').addEventListener('click',()=>window.print());
  $('#retryQuiz').addEventListener('click',()=>{ if(confirm('Очистити відповіді тесту? Ім’я та клас залишаться.')){ $('#quiz').reset(); $('#resultCard').classList.remove('show'); $('#quiz').scrollIntoView({behavior:'smooth'}); } });
})();
