(async()=>{
  const app=document.getElementById('app');
  try{
    const files=['part-1.html','part-2.html','part-3.html'];
    const parts=await Promise.all(files.map(async f=>{const r=await fetch(f);if(!r.ok)throw new Error(f+' '+r.status);return r.text();}));
    app.innerHTML=parts.join('');
    const scripts=['script.js','visual-v3.js'];
    for(const src of scripts){
      const s=document.createElement('script');
      s.src=src;
      s.defer=true;
      document.body.appendChild(s);
    }
  }catch(err){app.innerHTML='<main class="wrap"><section><h1>Не вдалося завантажити урок</h1><p>Оновіть сторінку. '+String(err)+'</p></section></main>';}
})();
