(() => {
  'use strict';
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const setFb = (id, text, kind='') => {
    const el = document.getElementById(id); if(!el) return;
    el.textContent = text; el.className = 'feedback' + (kind ? ' ' + kind : '');
  };

  // Початкова гіпотеза
  $$('#hypothesisChoices .choice-btn').forEach(btn => btn.addEventListener('click', () => {
    $$('#hypothesisChoices .choice-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    const v = btn.dataset.hyp;
    if(v === 'definitions') setFb('hypothesisFeedback','Сильна гіпотеза: спершу треба зіставити визначення та одиниці обліку. Фінальний доказ ще попереду.','success');
    else setFb('hypothesisFeedback','Це можлива стартова версія, але вона передчасно звинувачує джерело. Перевіримо методику обох.','warn');
  }));

  // Швидкий вибір джерел
  const sourceAnswers = {a:'un', b:'wb', c:'remote'};
  const sourceMessages = {
    a:{ok:'Так. Для актуальної політичної карти міжнародного рівня UN Geospatial — сильне базове джерело.',bad:'Це джерело не дає достатньо надійної та актуальної основи для міжнародного політичного звіту.'},
    b:{ok:'Так. World Bank спеціально збирає та методично описує економічні показники.',bad:'Це джерело не вимірює ВНД на душу населення.'},
    c:{ok:'Так. Порівняння геоприв’язаних знімків/шарів різних років показує просторову зміну.',bad:'Для динаміки забудови потрібні просторові дані різних дат, а не лише опис.'}
  };
  $$('.source-pick').forEach(btn => btn.addEventListener('click', () => {
    const c = btn.dataset.case; const ok = btn.dataset.val === sourceAnswers[c];
    setFb('sourceFb'+c.toUpperCase(), ok ? sourceMessages[c].ok : sourceMessages[c].bad, ok ? 'success' : 'warn');
  }));

  // Лабораторія доказів
  const exactEvidence = ['unMembers','wbDefinition','unObservers'];
  $('#checkEvidence').addEventListener('click', () => {
    const selected = $$('#evidenceCards input:checked').map(x => x.value).sort();
    const right = exactEvidence.slice().sort();
    const exact = selected.length === right.length && selected.every((v,i)=>v===right[i]);
    if(exact) setFb('evidenceFeedback','Точно. Ви поєднали членство в ООН, статус спостерігачів і методику World Bank. Разом вони пояснюють, чому різні числа не обов’язково суперечать одне одному.','success');
    else if(selected.length !== 3) setFb('evidenceFeedback','Потрібно рівно три джерела. Подумайте: членство + особливі статуси + методика статистичної бази.','warn');
    else setFb('evidenceFeedback','У наборі є джерело, яке не пояснює різницю одиниць обліку. Перевірте, чи кожен обраний пункт додає окрему частину доказу.','warn');
  });
  $('#resetEvidence').addEventListener('click', () => { $$('#evidenceCards input').forEach(x=>x.checked=false); setFb('evidenceFeedback','Потрібні три взаємодоповнювальні джерела, а не три однакові.'); });

  // Рівні місії
  const missionMap = {base:'missionBase',mid:'missionMid',high:'missionHigh'};
  $$('.mission-tabs button').forEach(btn => btn.addEventListener('click', () => {
    $$('.mission-tabs button').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
    Object.values(missionMap).forEach(id=>document.getElementById(id).hidden=true);
    document.getElementById(missionMap[btn.dataset.mission]).hidden=false;
  }));

  // Карти-шари
  const layerMap = {sovereign:'mapSovereign',flags:'mapFlags',osm:'mapOsm'};
  $$('.layer-tabs button').forEach(btn => btn.addEventListener('click', () => {
    $$('.layer-tabs button').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
    Object.values(layerMap).forEach(id=>document.getElementById(id).hidden=true);
    document.getElementById(layerMap[btn.dataset.layer]).hidden=false;
  }));

  // Логічний двобій
  $$('#mythChoices .choice-btn').forEach(btn => btn.addEventListener('click', () => {
    $$('#mythChoices .choice-btn').forEach(b=>b.classList.remove('selected')); btn.classList.add('selected');
    if(btn.dataset.myth==='b') setFb('mythFeedback','Так. Логічна помилка — прирівняти статистичну одиницю «country/economy» до незалежної держави без перевірки методики.','success');
    else setFb('mythFeedback','Слабкий аргумент. Дата або авторитетність джерела не замінюють визначення того, що саме рахується.','warn');
  }));

  // CER
  $('#checkCer').addEventListener('click', () => {
    const c=$('#cerClaim').value.trim(), e=$('#cerEvidence').value.trim(), r=$('#cerReason').value.trim();
    if(c.length<18 || e.length<18 || r.length<28) setFb('cerFeedback','CER ще неповний: сформулюйте чітке твердження, конкретний доказ (ООН/World Bank/карта) і пояснення з обмеженням.','warn');
    else setFb('cerFeedback','Структура CER повна. Перевірте останнє: чи доказ конкретний, а пояснення показує зв’язок і межу висновку.','success');
  });

  // Шлюз тесту
  const fullName=$('#fullName'), studentClass=$('#studentClass'), gate=$('#identityGate'), quiz=$('#quiz'), gateError=$('#gateError');
  function validFullName(value){
    const cleaned=value.trim().replace(/\s+/g,' ');
    const parts=cleaned.split(' ');
    return parts.length>=2 && parts.every(p=>/^[A-Za-zА-Яа-яІіЇїЄєҐґ'’\-]+$/u.test(p));
  }
  $('#startQuiz').addEventListener('click', () => {
    if(!validFullName(fullName.value) || !studentClass.value.trim()) {gateError.hidden=false; return;}
    gateError.hidden=true; gate.hidden=true; quiz.hidden=false; quiz.scrollIntoView({behavior:'smooth',block:'start'});
  });

  // Послідовність q8
  let sequence=[];
  const seqLabels={question:'що рахуємо',sources:'2 джерела',method:'методика',compare:'порівняння'};
  function renderSeq(){
    $('#seqAnswer').textContent = sequence.length ? sequence.map((x,i)=>(i+1)+'. '+seqLabels[x]).join(' → ') : 'Послідовність ще не складена.';
    $$('#seqPool button').forEach(b=>b.disabled=sequence.includes(b.dataset.seq));
  }
  $$('#seqPool button').forEach(btn=>btn.addEventListener('click',()=>{ if(!sequence.includes(btn.dataset.seq)){sequence.push(btn.dataset.seq);renderSeq();}}));
  $('#resetSeq').addEventListener('click',()=>{sequence=[];renderSeq();});

  function radioVal(name){ const x=$(`input[name="${name}"]:checked`); return x?x.value:null; }
  function exactChecks(name, expected){
    const got=$$(`input[name="${name}"]:checked`).map(x=>x.value).sort(); const exp=expected.slice().sort();
    return got.length===exp.length && got.every((v,i)=>v===exp[i]);
  }
  function matchesOk(){ return $('#m1').value==='map' && $('#m2').value==='income' && $('#m3').value==='sat' && $('#m4').value==='status'; }
  function seqOk(){ const exp=['question','sources','method','compare']; return sequence.length===4 && sequence.every((v,i)=>v===exp[i]); }

  quiz.addEventListener('submit', (ev) => {
    ev.preventDefault();
    let score=0;
    if(radioVal('q1')==='b') score++;
    if(radioVal('q2')==='b') score++;
    if(radioVal('q3')==='a') score++;
    if(radioVal('q4')==='b') score++;
    if(exactChecks('q5',['author','date','method'])) score++;
    if(exactChecks('q6',['un193','observer','wbEconomy'])) score++;
    if(matchesOk()) score++;
    if(seqOk()) score++;
    if(radioVal('q9')==='c') score++;
    if(radioVal('q10')==='b') score++;
    const pct=score*10;
    let comment=score<=4?'Потрібно повторити: джерело, методика, одиниця обліку та політичний статус.' : score<=7?'Достатній рівень: базова логіка джерел засвоєна; попрацюйте з обмеженнями висновку.' : score<=9?'Добре: Ви коректно розрізняєте джерело, методику й політичний статус.' : 'Відмінно: Ви не лише читаєте дані, а й перевіряєте, що саме вони доводять.';
    $('#resultScore').textContent=`${score}/10 • ${pct}%`;
    $('#resultName').textContent=fullName.value.trim().replace(/\s+/g,' ');
    $('#resultClass').textContent=studentClass.value.trim();
    $('#resultComment').textContent=comment;
    $('#resultTime').textContent='Дата і час: '+new Date().toLocaleString('uk-UA');
    quiz.hidden=true; $('#resultCard').hidden=false; $('#resultCard').scrollIntoView({behavior:'smooth',block:'start'});
  });
  $('#printResult').addEventListener('click',()=>window.print());
  $('#retryQuiz').addEventListener('click',()=>{
    if(!confirm('Пройти тест ще раз? Ім’я та клас залишаться, відповіді буде очищено.')) return;
    quiz.reset(); sequence=[];renderSeq(); $('#resultCard').hidden=true; quiz.hidden=false; quiz.scrollIntoView({behavior:'smooth',block:'start'});
  });
})();
