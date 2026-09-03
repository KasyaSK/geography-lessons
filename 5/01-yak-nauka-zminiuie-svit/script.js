    const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>[...root.querySelectorAll(s)];
    const showFeedback=(el,type,text)=>{el.className=`feedback show ${type}`;el.textContent=text;};

    const hyp=$('#hypothesis');
    try{hyp.value=localStorage.getItem('pp5_u1_hyp')||'';}catch(e){}
    $('#saveHyp').addEventListener('click',()=>{try{localStorage.setItem('pp5_u1_hyp',hyp.value.trim())}catch(e){} $('#hypFeedback').classList.add('show');});

    const states=['none','science','technology','both'];
    const stateNames={none:'Натисніть, щоб обрати →',science:'🔎 Наука',technology:'🛠️ Техніка',both:'🔁 Обидва'};
    $$('.sort-card').forEach(card=>card.addEventListener('click',()=>{let i=states.indexOf(card.dataset.state);i=(i+1)%states.length;card.dataset.state=states[i];$('.choice',card).textContent=stateNames[states[i]];}));
    $('#checkSort').addEventListener('click',()=>{const cards=$$('.sort-card'), done=cards.filter(c=>c.dataset.state!=='none').length, right=cards.filter(c=>c.dataset.state===c.dataset.answer).length; const box=$('#sortFeedback'); if(done<cards.length)showFeedback(box,'warn',`Ще не розподілено ${cards.length-done} карток.`); else if(right===cards.length)showFeedback(box,'good','6/6. Ви відрізнили здобуття знань від їх практичного застосування. У реальному житті наука й техніка дуже часто працюють разом.'); else showFeedback(box,'warn',`${right}/6. Перевірте правило: наука насамперед з’ясовує «як/чому?», техніка — «як це використати?».`);});

    const sat={jan:{src:'https://assets.science.nasa.gov/dynamicimage/assets/science/esd/eo/content-feature/bluemarble/images/alps_01_lrg.jpg',cap:'Альпи • січень 2004 • NASA Earth Observatory'},jul:{src:'https://assets.science.nasa.gov/dynamicimage/assets/science/esd/eo/content-feature/bluemarble/images/alps_07_lrg.jpg',cap:'Альпи • липень 2004 • NASA Earth Observatory'}};
    $$('.sat-tabs button').forEach(b=>b.addEventListener('click',()=>{$$('.sat-tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');const d=sat[b.dataset.sat];$('#satImage').src=d.src;$('#satCaption').textContent=d.cap;}));
    $('#checkEvidence').addEventListener('click',()=>{const vals=$$('#evidenceOptions input:checked').map(x=>x.value).sort().join(','), box=$('#evidenceFeedback'); if(vals==='1,3')showFeedback(box,'good','Так. Знімки підтримують спостереження сезонної зміни. Але вони не дають точних температур кожного міста і не дозволяють передбачити наступний рік.'); else showFeedback(box,'warn','Спробуйте ще раз. Оберіть лише те, що безпосередньо видно з двох знімків або випливає з способу їх отримання. Не робіть прогнозів, яких дані не підтримують.');});
    $('#checkSources').addEventListener('click',()=>{const vals=$$('#sourceGrid input:checked').map(x=>x.value).sort().join(','),box=$('#sourceFeedback'); if(vals==='nasa,textbook')showFeedback(box,'good','Сильний вибір. В обох випадках відомі автори/установа, можна простежити походження інформації й перевірити її.'); else showFeedback(box,'warn','Найкраще почати з джерел, де відомі автори або установа і можна перевірити походження даних. Популярність повідомлення не замінює доказів.');});

    $$('.mission-tabs button').forEach(b=>b.addEventListener('click',()=>{$$('.mission-tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');$$('.mission-pane').forEach(p=>p.classList.remove('active'));$(`#mission-${b.dataset.mission}`).classList.add('active');}));

    $$('.field-btn').forEach(b=>b.addEventListener('click',()=>{b.classList.toggle('active');const active=$$('.field-btn.active');if(active.length>2)active[0].classList.remove('active');}));
    $('#checkFields').addEventListener('click',()=>{const vals=$$('.field-btn.active').map(x=>x.dataset.field).sort().join(','),box=$('#fieldFeedback'); if(vals==='bio,chem')showFeedback(box,'good','Так. Біологія допоможе дослідити організми у воді, а хімія — речовини й поживні сполуки. Інші науки теж можуть бути корисними, але ці дві дають найпряміші дані для старту.'); else showFeedback(box,'warn','Подумайте: треба з’ясувати, які організми розмножилися і які речовини могли сприяти цьому. Які дві науки працюють з цими об’єктами найпряміше?');});

    $$('[data-duel]').forEach(b=>b.addEventListener('click',()=>{const correct=b.dataset.duel==='true'; showFeedback($('#duelFeedback'),correct?'good':'warn',correct?'Саме так. Науковість визначається не популярністю, а перевірюваністю: хто стверджує, на яких даних і чи можна перевірити незалежно.':'Популярність може привернути увагу, але не є доказом. Потрібні автор, джерело даних і можливість перевірки.');}));
    $('#compareHyp').addEventListener('click',()=>{let old='';try{old=localStorage.getItem('pp5_u1_hyp')||''}catch(e){} const now=$('#cerClaim').value.trim();const text=old?`На початку Ви записали: «${old}». Тепер Ваше твердження: «${now||'ще не заповнено'}». Що стало точнішим після роботи з доказами?`:'Першу гіпотезу не було збережено. Сформулюйте її усно й порівняйте з теперішнім твердженням.';showFeedback($('#compareFeedback'),'warn',text);});

    function validFullName(value){const parts=value.trim().replace(/\s+/g,' ').split(' ');return parts.length>=2&&parts.every(p=>/^[А-ЯІЇЄҐа-яіїєґ'’\-]+$/.test(p));}
    $('#startQuiz').addEventListener('click',()=>{const name=$('#fullName').value.trim().replace(/\s+/g,' '),cl=$('#studentClass').value.trim();if(!validFullName(name)||!cl){showFeedback($('#gateError'),'bad','Введіть ім’я, прізвище та клас. У ПІБ не використовуйте цифри.');return;}$('#gateError').className='feedback bad';$('#identityGate').style.display='none';$('#quiz').classList.add('open');$('#quiz').scrollIntoView({behavior:'smooth',block:'start'});});

    const exactSet=(name,expected)=>{const got=$$(`input[name="${name}"]:checked`).map(x=>x.value).sort();const exp=[...expected].sort();return got.length===exp.length&&got.every((v,i)=>v===exp[i]);};
    $('#quiz').addEventListener('submit',e=>{e.preventDefault();let score=0;
      const ans={q1:'b',q2:'c',q3:'b',q4:'a',q9:'b',q10:'b'};
      Object.entries(ans).forEach(([q,a])=>{const x=$(`input[name="${q}"]:checked`);if(x&&x.value===a)score++;});
      if(exactSet('q5',['a','b','d']))score++;
      if(exactSet('q6',['a','b']))score++;
      if($('#q7a').value==='bio'&&$('#q7b').value==='chem'&&$('#q7c').value==='phys'&&$('#q7d').value==='astro')score++;
      if($('#q8_1').value==='Б'&&$('#q8_2').value==='Г'&&$('#q8_3').value==='А'&&$('#q8_4').value==='В')score++;
      const percent=score*10; const name=$('#fullName').value.trim().replace(/\s+/g,' '),cl=$('#studentClass').value.trim();
      $('#scoreText').textContent=`${score}/10`;$('#rName').textContent=name;$('#rClass').textContent=cl;$('#rPercent').textContent=`${percent}%`;$('#rDate').textContent=new Intl.DateTimeFormat('uk-UA',{dateStyle:'medium',timeStyle:'short'}).format(new Date());
      $('#rComment').textContent=score<=4?'Потрібно повторити: наука/техніка, ознаки надійного джерела та межі висновку.':score<=7?'Достатній результат. Повторіть ті завдання, де треба було оцінювати докази, а не просто пригадувати термін.':score<=9?'Добре. Ви впевнено працюєте з фактами й джерелами; звертайте увагу на межі даних.':'Відмінно: 10/10. Ви правильно розрізнили знання, технології, джерела та силу доказів.';
      $('#resultCard').classList.add('show');$('#resultCard').scrollIntoView({behavior:'smooth',block:'center'});
    });
    $('#printResult').addEventListener('click',()=>window.print());
    $('#retryQuiz').addEventListener('click',()=>{if(!confirm('Пройти тест ще раз? Ім’я та клас залишаться, а відповіді буде очищено.'))return;$('#quiz').reset();$('#resultCard').classList.remove('show');$('#quiz').scrollIntoView({behavior:'smooth',block:'start'});});
  