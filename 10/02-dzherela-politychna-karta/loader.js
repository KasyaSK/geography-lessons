(() => {
  const files = ['part-1.html','part-2.html','part-3.html','part-4.html','part-5.html','part-6.html'];
  Promise.all(files.map(f => fetch(f).then(r => { if(!r.ok) throw new Error(f+' '+r.status); return r.text(); })))
    .then(parts => {
      document.getElementById('app').outerHTML = parts.join('');
      const s = document.createElement('script');
      s.src = 'script.js';
      document.body.appendChild(s);
    })
    .catch(err => {
      document.getElementById('app').innerHTML = '<div style="padding:2rem;font-family:system-ui"><h1>Не вдалося завантажити урок</h1><p>'+err.message+'</p></div>';
    });
})();
