(async()=>{
  const root=document.getElementById("lesson-root");
  try{
    const files=["part-1.html","part-2.html","part-3.html","part-4.html","part-5.html"];
    const chunks=[];
    for(const f of files){const r=await fetch(f,{cache:"no-store"});if(!r.ok)throw new Error(`${f}: ${r.status}`);chunks.push(await r.text());}
    root.innerHTML=chunks.join("\n");
    const s=document.createElement("script");s.src="script.js";s.defer=true;document.body.appendChild(s);
  }catch(err){root.innerHTML=`<main style="font-family:system-ui;padding:2rem;max-width:800px;margin:auto"><h1>Урок тимчасово не завантажився</h1><p>Оновіть сторінку. Якщо проблема повторюється, повідомте вчителю.</p><pre>${String(err)}</pre></main>`;}
})();
