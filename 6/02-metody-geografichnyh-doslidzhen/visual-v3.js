(() => {
  // Map tabs
  document.querySelectorAll('.map-tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.map-tabs button').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected','false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected','true');
      const key = btn.dataset.map;
      document.querySelectorAll('[data-mapframe]').forEach(frame => {
        frame.classList.toggle('active', frame.dataset.mapframe === key);
      });
    });
  });

  // Click-to-enlarge for lesson images (except map iframe)
  const style = document.createElement('style');
  style.textContent = `
    .lesson-lightbox{position:fixed;inset:0;z-index:9999;background:rgba(8,27,43,.88);display:none;align-items:center;justify-content:center;padding:22px}
    .lesson-lightbox.open{display:flex}
    .lesson-lightbox figure{margin:0;max-width:min(1100px,96vw);max-height:92vh;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.35)}
    .lesson-lightbox img{display:block;max-width:96vw;max-height:78vh;object-fit:contain;background:#081b2b}
    .lesson-lightbox figcaption{padding:12px 16px;color:#17324d}
    .lesson-lightbox .close-lightbox{position:fixed;right:22px;top:18px;width:48px;height:48px;border-radius:50%;font-size:1.4rem;background:#fff;color:#17324d;box-shadow:0 8px 28px rgba(0,0,0,.25)}
    .gallery-card img,.hero-photo img,.satellite-case img,.choice.with-photo img,.map-frame img{cursor:zoom-in}
  `;
  document.head.appendChild(style);

  const box = document.createElement('div');
  box.className = 'lesson-lightbox';
  box.setAttribute('role','dialog');
  box.setAttribute('aria-modal','true');
  box.setAttribute('aria-label','Збільшене зображення');
  box.innerHTML = '<button class="close-lightbox" aria-label="Закрити">×</button><figure><img alt=""><figcaption></figcaption></figure>';
  document.body.appendChild(box);

  const big = box.querySelector('img');
  const cap = box.querySelector('figcaption');
  function closeBox(){ box.classList.remove('open'); document.body.style.overflow=''; }
  document.querySelectorAll('.gallery-card img,.hero-photo img,.satellite-case img,.choice.with-photo img,.map-frame img').forEach(img => {
    img.tabIndex = 0;
    img.setAttribute('role','button');
    img.setAttribute('aria-label',(img.alt || 'Зображення') + '. Натисніть, щоб збільшити');
    const open = () => {
      big.src = img.src;
      big.alt = img.alt;
      const figure = img.closest('figure');
      const card = img.closest('.gallery-card');
      const text = figure?.querySelector('figcaption')?.textContent || card?.querySelector('.caption')?.textContent || img.alt;
      cap.textContent = text.trim();
      box.classList.add('open');
      document.body.style.overflow='hidden';
      box.querySelector('.close-lightbox').focus();
    };
    img.addEventListener('click',open);
    img.addEventListener('keydown',e=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); open(); } });
  });
  box.querySelector('.close-lightbox').addEventListener('click',closeBox);
  box.addEventListener('click',e=>{ if(e.target===box) closeBox(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeBox(); });
})();
