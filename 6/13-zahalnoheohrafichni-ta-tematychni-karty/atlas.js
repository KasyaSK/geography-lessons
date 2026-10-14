
(()=>{
  const places={
    z:{bbox:'34.80,47.70,35.40,48.05',desc:'Запоріжжя: знайдіть Дніпро, місто, дороги й площинні об’єкти. Порівняйте їхні умовні знаки.'},
    k:{bbox:'23.65,48.23,24.65,48.82',desc:'Карпати: знайдіть річки, поселення й дороги. Що можна з’ясувати про висоти на звичайній карті, а для чого потрібна фізична/топографічна?'},
    ky:{bbox:'30.15,50.18,30.92,50.73',desc:'Київ: визначте лінійні, площинні та точкові об’єкти. Чим відрізняється зміст карти від карт густоти населення?'}
  };
  const live=document.getElementById('realAtlasOSM'), hint=document.getElementById('atlasRegionHint');
  document.querySelectorAll('[data-real-map]').forEach(b=>{
    b.addEventListener('click',()=>{
      const p=places[b.getAttribute('data-real-map')];if(!p||!live)return;
      const bb=p.bbox.split(',').join('%2C');
      live.src='https://www.openstreetmap.org/export/embed.html?bbox='+bb+'&layer=mapnik';
      live.title='OpenStreetMap: карта регіону '+b.textContent.trim();
      if(hint)hint.textContent=p.desc;
      document.querySelectorAll('[data-real-map]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
    });
  });
  const situations={
    route:{correct:'general',msg:'Для пошуку маршруту потрібні дороги й розташування об’єктів: загальногеографічна основа. Тематична карта температури сама по собі дороги не покаже.'},
    density:{correct:'people',msg:'Потрібна карта густоти населення із підписаною шкалою осіб/км²; площа зафарбованої країни тут не означає кількість її мешканців.'},
    climate:{correct:'climate',msg:'Потрібна тематична карта температури із шкалою °C та вказаним роком. Колір без легенди і періоду не доводить нічого.'}
  };
  const mission=document.getElementById('atlasMission'), feedback=document.getElementById('atlasMissionFeedback');
  if(mission&&feedback)mission.addEventListener('change',()=>{
    const task=document.getElementById('atlasQuestion').value;
    const selected=mission.value;
    if(!task||!selected){feedback.textContent='Оберіть ситуацію та джерело.';return}
    const v=situations[task];
    feedback.textContent=(selected===v.correct?'✅ Обґрунтований вибір. ':'↻ Спробуйте ще раз. ')+v.msg;
  });
  const taskField=document.getElementById('atlasQuestion');
  if(taskField&&feedback)taskField.addEventListener('change',()=>{mission.value='';feedback.textContent='Ситуацію змінено — доберіть карту заново.'});
  const check=document.getElementById('atlasEvidenceCheck');
  if(check)check.addEventListener('click',()=>{
    const a=document.getElementById('atlasDensityAnswer').value.trim();
    const b=document.getElementById('atlasTempAnswer').value.trim();
    const out=document.getElementById('atlasEvidenceFeedback');
    if(a.length<50||b.length<50){
      out.textContent='Доповніть обидва спостереження. У кожному наведіть дві країни, назву показника, одиницю вимірювання й опору на легенду (приблизно по два речення).';
      return;
    }
    out.textContent='Самоперевірка аргументу: ① обидві карти — тематичні; ② густота населення вимірюється в осіб/км², температура — в °C; ③ дані за 2025 рік; ④ темніший колір сам по собі не означає «більше» без шкали; ⑤ для висновку про причину показників однієї карти замало. Ця кнопка перевіряє заповнення, а не фактичну правильність тексту.';
  });
})();
