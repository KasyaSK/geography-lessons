(() => {
  const warmFeedback = document.getElementById('warmFeedback');
  document.querySelectorAll('#warmChoices .choice button').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.choice');
      const ok = btn.dataset.answer === card.dataset.correct;
      card.dataset.state = ok ? 'ok' : 'bad';
      const explanations = {
        observation:'Щоб порівняти рівень води за тиждень, потрібні повторні спостереження та вимірювання.',
        comparison:'Порівняльний метод працює лише тоді, коли об’єкти зіставляють за однаковими критеріями.',
        remote:'Супутникові спостереження швидко охоплюють величезну територію, тому придатні для пошуку осередків пожеж.'
      };
      warmFeedback.innerHTML = ok ? '<span class="ok">Так.</span> ' + explanations[card.dataset.correct] : '<span class="bad">Не найкращий перший крок.</span> Подумайте, який метод дасть потрібні дані швидше й точніше.';
    });
  });

  const selected = new Set();
  document.querySelectorAll('#sources .source').forEach(card => {
    card.querySelector('button').addEventListener('click', () => {
      const key = card.dataset.key;
      if(selected.has(key)){ selected.delete(key); card.querySelector('button').classList.remove('selected'); card.querySelector('button').textContent='Обрати';}
      else { selected.add(key); card.querySelector('button').classList.add('selected'); card.querySelector('button').textContent='Обрано ✓';}
    });
  });
  document.getElementById('checkSources').addEventListener('click', () => {
    const ideal = ['sat','field','roads','wind'];
    const exact = selected.size===4 && ideal.every(x=>selected.has(x));
    document.getElementById('sourceFeedback').innerHTML = exact
      ? '<span class="ok">Сильний набір.</span> Супутник показує просторове поширення, поле перевіряє реальну ситуацію, карта показує об’єкти під ризиком, а вітер допомагає прогнозувати розвиток.'
      : '<span class="bad">Набір можна посилити.</span> Потрібні 4 взаємодоповнювальні джерела: супутник + польова перевірка + карта об’єктів + дані про вітер. Один неперевірений допис не замінює доказ.';
  });

  const scenarioText = {
    clear:'За ясного неба оптичний супутниковий знімок може бути дуже інформативним, але навіть він потребує правильної інтерпретації.',
    clouds:'Хмарність може приховати поверхню на оптичному знімку. Потрібні інша дата, інший сенсор або додаткове джерело — наприклад, радарні дані.',
    field:'Польова перевірка додає «дані з місця»: реальний стан об’єкта, вимірювання, фото та спостереження. Це сильний спосіб перевірити інтерпретацію дистанційних даних.',
    old:'Застаріла карта може показувати об’єкт, якого вже немає, або не містити нового. Дата джерела — частина оцінки його надійності.'
  };
  document.querySelectorAll('.scenario-controls button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.scenario-controls button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('scenarioFeedback').textContent=scenarioText[btn.dataset.scenario];
    });
  });

  document.getElementById('compareHyp').addEventListener('click',()=>{
    const hyp=document.getElementById('hyp').value.trim();
    const c=document.getElementById('cerC').value.trim();
    const e=document.getElementById('cerE').value.trim();
    const r=document.getElementById('cerR').value.trim();
    const box=document.getElementById('compareBox');
    box.classList.remove('hidden');
    if(!hyp || !c || !e || !r){
      box.innerHTML='<span class="bad">Ще не все.</span> Заповніть початкову гіпотезу та всі три частини CER.';
      return;
    }
    box.innerHTML='<b>Було:</b> '+escapeHtml(hyp)+'<br><br><b>Стало:</b> '+escapeHtml(c)+'<br><b>Доказ:</b> '+escapeHtml(e)+'<br><b>Пояснення:</b> '+escapeHtml(r)+'<br><br><span class="ok">Перевірте:</span> чи з’явився у фінальній відповіді конкретний доказ і межа висновку?';
  });

  function validFullName(value){
    const parts=value.trim().replace(/\s+/g,' ').split(' ');
    return parts.length>=2 && parts.every(p=>/^[А-ЯІЇЄҐа-яіїєґ'’\-]+$/.test(p));
  }
  const gate=document.getElementById('quizGate');
  const quiz=document.getElementById('quiz');
  const fullName=document.getElementById('fullName');
  const studentClass=document.getElementById('studentClass');
  const gateError=document.getElementById('gateError');

  document.getElementById('startQuiz').addEventListener('click',()=>{
    if(!validFullName(fullName.value) || !studentClass.value){
      gateError.textContent='Введіть ім’я, прізвище та оберіть клас.';
      return;
    }
    gateError.textContent='';
    gate.classList.add('hidden');
    quiz.classList.remove('hidden');
    document.getElementById('shuffleOrder').click();
    quiz.scrollIntoView({behavior:'smooth',block:'start'});
  });

  function move(row,dir){
    const parent=row.parentElement;
    if(dir<0 && row.previousElementSibling) parent.insertBefore(row,row.previousElementSibling);
    if(dir>0 && row.nextElementSibling) parent.insertBefore(row.nextElementSibling,row);
  }
  document.getElementById('orderList').addEventListener('click',e=>{
    const row=e.target.closest('.order-row');
    if(!row) return;
    if(e.target.classList.contains('up')) move(row,-1);
    if(e.target.classList.contains('down')) move(row,1);
  });
  document.getElementById('shuffleOrder').addEventListener('click',()=>{
    const parent=document.getElementById('orderList');
    const rows=[...parent.children];
    rows.sort(()=>Math.random()-.5).forEach(r=>parent.appendChild(r));
  });

  function selectedRadio(name){
    const el=document.querySelector('input[name="'+name+'"]:checked');
    return el?el.value:null;
  }
  function selectedChecks(name){
    return [...document.querySelectorAll('input[name="'+name+'"]:checked')].map(x=>x.value).sort();
  }
  function exactSet(a,b){return a.length===b.length && a.every((x,i)=>x===b[i]);}
  function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}

  document.getElementById('quizForm').addEventListener('submit',e=>{
    e.preventDefault();
    let complete=true;
    ['q1','q2','q3','q4','q9','q10'].forEach(n=>{if(!selectedRadio(n)) complete=false;});
    if(selectedChecks('q5').length===0 || selectedChecks('q6').length===0) complete=false;
    if(!document.getElementById('m1').value || !document.getElementById('m2').value || !document.getElementById('m3').value) complete=false;
    if(!complete){
      document.getElementById('quizMsg').innerHTML='<span class="bad">Є незаповнені завдання.</span> Перевірте всі 10 пунктів.';
      return;
    }
    let score=0;
    if(selectedRadio('q1')==='b') score++;
    if(selectedRadio('q2')==='a') score++;
    if(selectedRadio('q3')==='a') score++;
    if(selectedRadio('q4')==='b') score++;
    if(exactSet(selectedChecks('q5'),['cart','cmp','obs'])) score++;
    if(exactSet(selectedChecks('q6'),['before','field','layer'])) score++;
    if(document.getElementById('m1').value==='a' && document.getElementById('m2').value==='b' && document.getElementById('m3').value==='c') score++;
    const order=[...document.querySelectorAll('#orderList .order-row')].map(x=>x.dataset.key);
    if(JSON.stringify(order)===JSON.stringify(['question','data','analysis','conclusion'])) score++;
    if(selectedRadio('q9')==='b') score++;
    if(selectedRadio('q10')==='c') score++;

    const pct=score*10;
    let comment=score<=4?'Потрібно повторити ключові відмінності між методами й попрацювати з доказами.':
      score<=7?'Достатній результат. Зверніть увагу на перевірку джерел і межі висновків.':
      score<=9?'Добре. Ви впевнено добираєте методи й оцінюєте докази.':
      'Відмінно. Ви поєднуєте методи, оцінюєте достатність доказів і обмеження даних.';
    const now=new Date();
    const result=document.getElementById('resultCard');
    result.innerHTML=
      '<h3>Картка результату</h3>'+ 
      '<div><b>'+escapeHtml(fullName.value.trim())+'</b> • '+escapeHtml(studentClass.value)+'</div>'+ 
      '<div class="small">Тема: Методи географічних досліджень</div>'+ 
      '<div class="score">'+score+' / 10</div>'+ 
      '<div><b>'+pct+'%</b></div>'+ 
      '<p>'+comment+'</p>'+ 
      '<p class="small">Дата й час: '+now.toLocaleString('uk-UA')+'</p>'+ 
      '<div class="notice"><b>Зробіть скриншот цієї картки та надішліть учителю.</b></div>'+ 
      '<button type="button" class="secondary" onclick="window.print()" style="margin-top:10px">Друк / зберегти PDF</button>';
    result.classList.remove('hidden');
    document.getElementById('quizMsg').innerHTML='<span class="ok">Тест завершено.</span> Результат сформовано нижче.';
    result.scrollIntoView({behavior:'smooth',block:'center'});
  });
})();
