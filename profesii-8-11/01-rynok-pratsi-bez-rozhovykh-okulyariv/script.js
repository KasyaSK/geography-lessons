// timer
let seconds=35*60, interval=null; const timerBtn=document.getElementById('timerBtn');
function drawTime(){let m=Math.floor(seconds/60),s=seconds%60;timerBtn.textContent=`${m}:${String(s).padStart(2,'0')}`}
timerBtn.addEventListener('click',()=>{if(interval){clearInterval(interval);interval=null;timerBtn.classList.remove('running');return}timerBtn.classList.add('running');interval=setInterval(()=>{if(seconds>0){seconds--;drawTime()}else{clearInterval(interval);interval=null;timerBtn.textContent='ЧАС';}},1000)});drawTime();
// progress
addEventListener('scroll',()=>{const h=document.documentElement.scrollHeight-innerHeight;document.getElementById('progress').style.width=(scrollY/h*100)+'%'});
// vacancy
const best={a:'ask',b:'run',c:'ask'};document.querySelectorAll('.verdictBtn').forEach(b=>b.addEventListener('click',()=>{const c=b.dataset.card;document.querySelectorAll(`[data-card="${c}"]`).forEach(x=>x.classList.remove('selected','badsel'));b.classList.add(b.dataset.v===best[c]?'selected':'badsel');document.getElementById('r'+c).classList.add('show')}));
// salary
const range=document.getElementById('salaryRange');function money(){const g=+range.value,n=Math.round(g*.77),cost=Math.round(g*1.22);document.getElementById('grossText').textContent=g.toLocaleString('uk-UA')+' грн';document.getElementById('netText').textContent=n.toLocaleString('uk-UA');document.getElementById('costText').textContent=cost.toLocaleString('uk-UA')+' грн'}range.addEventListener('input',money);money();
// law
let q=0;document.querySelectorAll('.qcard').forEach(card=>{card.querySelectorAll('.lawBtn').forEach(btn=>btn.addEventListener('click',()=>{card.querySelectorAll('.lawBtn').forEach(x=>x.classList.remove('selected','badsel'));btn.classList.add(btn.dataset.correct==='yes'?'selected':'badsel');card.querySelector('.qfeedback').classList.add('show')}))});
// skills
document.querySelectorAll('.skill-item').forEach(x=>x.addEventListener('click',()=>x.classList.toggle('open')));
// cv
document.getElementById('checkCv').addEventListener('click',()=>{const boxes=[...document.querySelectorAll('#cvOptions input')];boxes.forEach(x=>x.closest('label').style.background=x.checked?(x.value==='good'?'#efffb6':'#ffd7d7'):'white');document.getElementById('cvResult').classList.add('show')});
// offers
const offerText={A:'A дуже старанно намагається виглядати дорожчим за B, але для 16-річного учня має проблеми і з графіком, і з оформленням. Гарна цифра не лікує погані умови.',B:'B — найкращий старт із цих трьох для 16-річного учня: зрозумілі задачі, легальний час, оформлення і наставник. Так, він не кричить «45 000!!!». Саме тому його й варто дочитати.',C:'C міг би бути нормальним для дорослого за інших умов, але нічна зміна для неповнолітнього робить цей варіант неприйнятним.',N:'«Жоден» — цілком легальна відповідь, якщо умови не підходять. Тут, однак, B виглядає хорошим стартовим офером. Уміння відмовлятися від поганої пропозиції — теж кар’єрна навичка.'};document.querySelectorAll('.offerBtn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.offerBtn').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');const r=document.getElementById('offerReveal');r.innerHTML='<b>Розбір:</b> '+offerText[b.dataset.offer];r.classList.add('show')}));