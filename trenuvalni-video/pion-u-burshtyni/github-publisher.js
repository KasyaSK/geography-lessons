/* Піон у бурштині — безпечна публікація сторіборду через GitHub Contents API.
   Токен зберігається лише в оперативній пам'яті відкритої вкладки. */
(function () {
  'use strict';
  const OWNER = 'KasyaSK';
  const REPO = 'geography-lessons';
  const BRANCH = 'main';
  const PROJECT = 'trenuvalni-video/pion-u-burshtyni/';
  const ROOT = 'https://api.github.com/repos/' + OWNER + '/' + REPO;
  const DATA = JSON.parse(document.getElementById('project-data').textContent);
  const repoLink = 'https://github.com/' + OWNER + '/' + REPO + '/tree/' + BRANCH + '/' + PROJECT;
  let databasePromise = null, working = false, stop = false;
  const queue = new Set();

  const style = document.createElement('style');
  style.textContent = [
    '.gh-publisher{margin:0 0 23px;padding:20px 22px;background:#edf4f0;border:1px solid #a9c4b4;border-radius:12px;box-shadow:0 2px 14px #1b3b2a08}',
    '.gh-publisher h3{margin:0 0 8px;font:23px Georgia,serif;color:#213d34}',
    '.gh-publisher p,.gh-publisher summary{font-size:12px;line-height:1.65;color:#425a51}',
    '.gh-publisher .gh-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:12px 0}',
    '.gh-publisher input[type=password]{border:1px solid #9eb5aa;border-radius:6px;padding:10px 11px;width:min(380px,100%);font:13px system-ui;background:#fff;color:#193b30}',
    '.gh-publisher button{background:#235845;color:#fff;border:0;border-radius:7px;padding:11px 14px;cursor:pointer;font-size:12px;font-weight:800}',
    '.gh-publisher button.gh-neutral{background:#e1e8e3;color:#234e3c;border:1px solid #acbcb1}',
    '.gh-publisher button:disabled{opacity:.5;cursor:wait}',
    '.gh-publisher label{display:flex;gap:7px;align-items:center;font-size:12px;color:#294a3e}',
    '.gh-publisher progress{width:100%;height:9px;accent-color:#297956}',
    '.gh-publisher a{color:#156447;text-decoration:underline;text-underline-offset:2px}',
    '.gh-publisher #ghStatus{font-size:12px;color:#254c3e;white-space:pre-wrap;min-height:18px}',
    '.gh-publisher #ghStatus[data-error=true]{color:#a63429}',
    '.gh-publisher .gh-help{margin-top:8px;font-size:11px;color:#596c60}',
    '.frame-cell.gh-local .frame-visual .dot{background:#bb893c;color:white}',
    '.frame-cell.gh-published .frame-visual .dot{background:#2a9160;color:white}',
    '@media(max-width:650px){.gh-publisher{padding:15px}.gh-publisher input[type=password]{width:100%}}'
  ].join('');
  document.head.appendChild(style);
  const panel = document.createElement('section');
  panel.className = 'gh-publisher';
  panel.id = 'ghPublisher';
  panel.setAttribute('aria-label','Публікація кадрів на GitHub');
  panel.innerHTML = [
    '<h3>Публікація кадрів на GitHub</h3>',
    '<p>Перетягніть зображення в потрібну комірку або виберіть кадр і натисніть <b>«Додати ілюстрацію»</b>. Зображення спочатку потрапляє в локальну чергу. Щоб воно з’явилося на сайті для всіх, опублікуйте його тут.</p>',
    '<div class="gh-row"><span id="ghQueueText" style="font-size:12px;font-weight:800;color:#245c45">Підготовка черги…</span>',
    '<button type="button" class="gh-neutral" id="ghScan">Оновити чергу</button>',
    '<a href="' + repoLink + '" target="_blank" rel="noopener noreferrer" style="font-size:12px">Папка на GitHub ↗</a></div>',
    '<details><summary>Підключення GitHub для запису файлів</summary>',
    '<p>На статичному GitHub Pages не можна безпечно завантажувати файли без авторизації. Створіть <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">fine-grained personal access token ↗</a> лише для репозиторію <b>' + OWNER + '/' + REPO + '</b>, із правом <b>Contents: Read and write</b>. Токен не вбудовується у сторінку, не додається до GitHub і не зберігається браузером; він використовується тільки в цій відкритій вкладці для запитів до api.github.com. Нікому його не надсилайте.</p></details>',
    '<div class="gh-row"><input id="ghToken" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="GitHub token (fine-grained)" aria-label="GitHub personal access token">',
    '<button type="button" class="gh-neutral" id="ghForget">Очистити токен</button></div>',
    '<div class="gh-row"><label><input type="checkbox" id="ghOverwrite">Дозволити заміну вже опублікованих кадрів</label>',
    '<label><input type="checkbox" id="ghAuto">Після додавання автоматично публікувати кадри</label></div>',
    '<div class="gh-row"><button type="button" id="ghPublish">Опублікувати підготовлені кадри</button>',
    '<button type="button" class="gh-neutral" id="ghStop" disabled>Зупинити після поточного</button></div>',
    '<progress id="ghProgress" max="100" value="0" aria-label="Прогрес публікації"></progress>',
    '<div id="ghStatus" role="status" aria-live="polite">Публікація працює тільки після введення токена. Локальний перегляд доступний без нього.</div>',
    '<p class="gh-help">PNG/JPG/WEBP → файл frame_NNNN.png у відповідній папці сцени. Для JPG та WEBP перед публікацією виконується перетворення у PNG. Після успішної публікації GitHub Pages може оновлюватися кілька хвилин.</p>'
  ].join('');
  const where = document.querySelector('.content .statstrip');
  if (!where) return;
  where.insertAdjacentElement('afterend', panel);
  const el = id => document.getElementById(id);
  const setStatus = (msg, error) => { const s=el('ghStatus'); s.textContent=msg;s.dataset.error=error?'true':'false'; };
  const padded = id => String(id).padStart(4,'0');
  const pathFor = id => {
    const f=DATA.frames[id-1];
    if(!f || f.id!==id || !/^frames\/scene_\d\d\/frame_\d{4}\.png$/.test(f.path))throw Error('Некоректний шлях кадру '+id);
    return PROJECT + f.path;
  };
  function openDB() {
    if (!('indexedDB' in window)) return Promise.resolve(null);
    if (!databasePromise) databasePromise = new Promise(resolve => {
      const r=indexedDB.open('pion-storyboard-assets-v1',1);
      r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('images'))r.result.createObjectStore('images',{keyPath:'frameId'});};
      r.onsuccess=()=>resolve(r.result);
      r.onerror=()=>resolve(null);
      r.onblocked=()=>resolve(null);
    });
    return databasePromise;
  }
  async function getRecord(id) {
    const db=await openDB();if(!db)return null;
    return new Promise(resolve=>{
      const req=db.transaction('images','readonly').objectStore('images').get(id);
      req.onsuccess=()=>resolve(req.result||null);
      req.onerror=()=>resolve(null);
    });
  }
  async function markPublished(id,sha){
    const db=await openDB();if(!db)return;
    return new Promise(resolve=>{
      const tx=db.transaction('images','readwrite');
      const store=tx.objectStore('images');
      const r=store.get(id);
      r.onsuccess=()=>{if(r.result){r.result.publishedSha=sha;store.put(r.result);}};
      tx.oncomplete=()=>resolve();
      tx.onerror=()=>resolve();
    });
  }
  async function scanQueue() {
    const db=await openDB();
    if(!db){setStatus('Локальне сховище недоступне. Спробуйте інший браузер або відкрийте сайт через HTTPS.',true);return;}
    const pending = new Set();
    await new Promise(resolve=>{
      const tx=db.transaction('images','readonly'),req=tx.objectStore('images').openCursor();
      req.onsuccess=()=>{
        const cur=req.result;
        if(cur){if(cur.value.blob && !cur.value.publishedSha)pending.add(cur.key);cur.continue();}
      };
      tx.oncomplete=()=>resolve();
      tx.onerror=()=>resolve();
    });
    queue.clear();pending.forEach(id=>queue.add(id));
    updateQueue();
  }
  function updateQueue(){
    el('ghQueueText').textContent='Очікують публікації: '+queue.size+' / 720';
    const ids=new Set(queue);
    document.querySelectorAll('.frame-cell').forEach(tile=>{
      const id=Number(tile.dataset.frame);
      tile.classList.toggle('gh-local',ids.has(id));
      tile.classList.toggle('gh-published',!ids.has(id)&&tile.classList.contains('filled'));
    });
    el('ghPublish').disabled=working || !queue.size;
    el('ghScan').disabled=working;
  }
  async function asPng(blob){
    if(blob.type==='image/png')return blob;
    const bitmap=await createImageBitmap(blob);
    try {
      const canvas=document.createElement('canvas');
      canvas.width=bitmap.width;canvas.height=bitmap.height;
      canvas.getContext('2d').drawImage(bitmap,0,0);
      return await new Promise((resolve,reject)=>canvas.toBlob(v=>v?resolve(v):reject(new Error('Не вдалося конвертувати у PNG')),'image/png'));
    }finally{bitmap.close();}
  }
  async function toBase64(blob){
    const bytes=new Uint8Array(await blob.arrayBuffer()),chunk=0x8000;
    const pieces=[];
    for(let i=0;i<bytes.length;i+=chunk)pieces.push(String.fromCharCode.apply(null,bytes.subarray(i,i+chunk)));
    return btoa(pieces.join(''));
  }
  async function request(url,opts){
    const token=el('ghToken').value.trim();
    if(!token)throw Error('Спочатку введіть GitHub token.');
    const r=await fetch(url,{
      method:(opts&&opts.method)||'GET',
      mode:'cors',
      credentials:'omit',
      cache:'no-store',
      headers:{'Authorization':'Bearer '+token,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},
      body:(opts&&opts.body)?JSON.stringify(opts.body):undefined
    });
    let data={};try{data=await r.json();}catch(_){}
    return {status:r.status,ok:r.ok,data};
  }
  async function upload(id){
    const rec=await getRecord(id);
    if(!rec || !rec.blob){queue.delete(id);return;}
    const path=pathFor(id);
    const url=ROOT+'/contents/'+path.split('/').map(encodeURIComponent).join('/');
    let current=await request(url);
    if(current.status!==404 && !current.ok)throw Error('GitHub: '+current.status+' '+(current.data.message||'помилка доступу'));
    const sha=current.ok?current.data.sha:null;
    if(sha && !el('ghOverwrite').checked)throw Error('Кадр '+padded(id)+' уже є в репозиторії. Для заміни ввімкніть опцію «Дозволити заміну».');
    const png=await asPng(rec.blob);
    const base64=await toBase64(png);
    const put=await request(url,{method:'PUT',body:{
      message:'Storyboard: publish frame '+padded(id)+' / scene '+String(DATA.frames[id-1].scene).padStart(2,'0'),
      content:base64,branch:BRANCH,...(sha?{sha}:{})
    }});
    if(!put.ok)throw Error('Не вдалося записати кадр '+padded(id)+': '+put.status+' '+(put.data.message||''));
    await markPublished(id,put.data.content?.sha || 'saved');
    queue.delete(id);
  }
  async function publishAll(){
    if(working)return;
    if(!el('ghToken').value.trim())return setStatus('Для публікації потрібно один раз ввести GitHub token із правом Contents: Read and write.',true);
    if(!queue.size)return setStatus('Немає нових кадрів. Спершу додайте зображення в сторіборд.');
    working=true;stop=false;el('ghStop').disabled=false;updateQueue();
    let done=0,errors=0;const total=queue.size;
    const ids=[...queue].sort((a,b)=>a-b);
    for(const id of ids){
      if(stop)break;
      setStatus('Публікується кадр '+padded(id)+' · '+(done+errors+1)+' із '+total+'…');
      try{await upload(id);done++;}
      catch(err){errors++;setStatus('Помилка кадру '+padded(id)+': '+err.message,true);
        if(/401|403|token|доступ|422/i.test(err.message))break;}
      el('ghProgress').value=Math.round(((done+errors)/total)*100);
      updateQueue();
    }
    working=false;el('ghStop').disabled=true;updateQueue();
    if(errors) setStatus('Опубліковано: '+done+'. Помилок: '+errors+'. У черзі залишилося: '+queue.size+'. Перевірте права токена і дозвіл заміни.',true);
    else setStatus('Опубліковано кадрів: '+done+'. Зміни записано у гілку main. Дочекайтеся оновлення GitHub Pages.');
  }
  el('ghPublish').addEventListener('click',publishAll);
  el('ghScan').addEventListener('click',scanQueue);
  el('ghStop').addEventListener('click',()=>{stop=true;setStatus('Зупиниться після поточного кадру.');});
  el('ghForget').addEventListener('click',()=>{el('ghToken').value='';el('ghAuto').checked=false;setStatus('Токен очищено.');});
  window.addEventListener('storyboard:asset-changed',e=>{
    const id=Number(e.detail?.frameId);
    if(id>=1&&id<=720){queue.add(id);updateQueue();if(el('ghAuto').checked&&!working&&el('ghToken').value.trim())publishAll();}
  });
  document.querySelectorAll('.frame-cell').forEach(tile=>{
    tile.title='Один клік — вибрати кадр; подвійний клік — вставити або замінити зображення; можна перетягнути файл';
    tile.addEventListener('dblclick',()=>document.getElementById('singleFile').click());
  });
  scanQueue().catch(err=>setStatus('Не вдалося прочитати чергу: '+err.message,true));
})();