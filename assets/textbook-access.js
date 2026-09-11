/*
 * Site-wide electronic textbook access for geography-lessons.
 * Every published lesson in grades 5–11 points to a browser-readable online
 * version of the textbook rather than to a PDF file or download link.
 * Author: Скринченко К.А. • Василівський ліцей «Сузір’я»
 */
(() => {
  'use strict';

  const BOOKS = {
    '5': {
      title: '«Пізнаємо природу», 5 клас',
      authors: 'Д. Біда, Т. Гільберг, Я. Колісник',
      url: 'https://uahistory.co/pidruchniki/bida-explore-nature-integrated-course-5-class-2022/'
    },
    '6': {
      title: '«Географія», 6 клас',
      authors: 'С. Запотоцький, М. Зінкевич, О. Романишин та ін.',
      url: 'https://uahistory.co/pidruchniki/zapotozkii-geography-6-class-2023/'
    },
    '7': {
      title: '«Географія», 7 клас',
      authors: 'Т. Гільберг, А. Довгань, В. Совенко',
      url: 'https://uahistory.co/pidruchniki/gilberg-geography-7-class-2024-reissue/'
    },
    '8': {
      title: '«Географія», 8 клас',
      authors: 'Т. Гільберг, А. Довгань, І. Савчук',
      url: 'https://uahistory.co/pidruchniki/gilberg-geography-8-class-2025-reissue/'
    },
    '9': {
      title: '«Географія», 9 клас',
      authors: 'Т. Гільберг, А. Довгань, І. Савчук',
      url: 'https://uahistory.co/pidruchniki/gilberg-geography-9-class-2026-reissue/'
    },
    '10': {
      title: '«Географія: регіони та країни», 10 клас',
      authors: 'Т. Гільберг, І. Савчук, В. Совенко',
      url: 'https://uahistory.co/pidruchniki/gilberg-geography-10-class-2018-standard-level/'
    },
    '11': {
      title: '«Географічний простір Землі», 11 клас',
      authors: 'Т. Гільберг, І. Савчук, В. Совенко',
      url: 'https://uahistory.co/pidruchniki/gilberg-geography-11-class-2019-standard-level/'
    }
  };

  const segments = location.pathname.split('/').filter(Boolean);
  if (segments.some(s => s.startsWith('profesii-'))) return;

  const gradeIndex = segments.findIndex(s => Object.prototype.hasOwnProperty.call(BOOKS, s));
  if (gradeIndex < 0) return;

  const grade = segments[gradeIndex];
  if (!segments[gradeIndex + 1] || segments[gradeIndex + 1] === 'index.html') return;

  const book = BOOKS[grade];

  const style = document.createElement('style');
  style.id = 'global-textbook-access-style';
  style.textContent = `
    #global-textbook-access{position:fixed;right:16px;bottom:16px;z-index:2147483000;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#17344c}
    #global-textbook-access .gtb-toggle{display:flex;align-items:center;gap:8px;min-height:48px;border:0;border-radius:999px;padding:11px 16px;background:#0d6b55;color:#fff;font:800 15px/1.2 inherit;box-shadow:0 10px 30px rgba(0,0,0,.22);cursor:pointer}
    #global-textbook-access .gtb-panel{display:none;position:absolute;right:0;bottom:58px;width:min(370px,calc(100vw - 32px));padding:16px;border:1px solid #d5e5df;border-radius:18px;background:#fff;box-shadow:0 18px 46px rgba(0,0,0,.22)}
    #global-textbook-access[data-open="true"] .gtb-panel{display:block}
    #global-textbook-access h3{margin:0 0 6px;font-size:17px;line-height:1.25;color:#17344c}
    #global-textbook-access p{margin:5px 0 11px;font-size:13px;line-height:1.45;color:#556b78}
    #global-textbook-access a{display:block;text-align:center;text-decoration:none;border-radius:12px;padding:10px 12px;font-weight:800;font-size:14px;background:#0d6b55;color:#fff}
    #global-textbook-access .gtb-note{margin:10px 0 0;font-size:12px;color:#687b86}
    #global-textbook-access button:focus-visible,#global-textbook-access a:focus-visible{outline:3px solid #ffbf47;outline-offset:3px}
    .global-textbook-home-card{margin:14px 0;padding:16px;border:1px solid #bfe1d5;border-radius:16px;background:#f3fffa;color:#17344c}
    .global-textbook-home-card h3{margin:0 0 6px!important}
    .global-textbook-home-card p{margin:6px 0!important}
    .global-textbook-home-card a{font-weight:800;color:#0d6b55;text-decoration:underline;text-underline-offset:3px}
    @media(max-width:560px){#global-textbook-access{right:10px;bottom:10px}#global-textbook-access .gtb-toggle{min-height:46px;padding:10px 14px}}
    @media print{#global-textbook-access{display:none!important}}
  `;
  if (!document.getElementById(style.id)) document.head.appendChild(style);

  const isTextbookContext = (el) => {
    const own = (el.textContent || '').toLowerCase();
    const box = el.closest('article,section,.homecard,.card,.resource,.material,.homework,.task,.panel');
    const ctx = ((box && box.textContent) || '').toLowerCase();
    return own.includes('підруч') || ctx.includes('підручник');
  };

  const rewriteLegacyTextbookLinks = (root = document) => {
    if (!root.querySelectorAll) return;
    root.querySelectorAll('a[href]').forEach(a => {
      if (!isTextbookContext(a)) return;
      const href = (a.getAttribute('href') || '').toLowerCase();
      const isLegacyFile = href.includes('.pdf') || href.includes('drive.google.com') || href.includes('lib.imzo.gov.ua') || href.includes('/sites/default/files/ebooks/');
      if (!isLegacyFile) return;
      a.href = book.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = 'Читати електронний підручник онлайн ↗';
      a.dataset.textbookOnline = 'true';
    });
  };

  rewriteLegacyTextbookLinks();

  if (!document.getElementById('global-textbook-access')) {
    const aside = document.createElement('aside');
    aside.id = 'global-textbook-access';
    aside.setAttribute('aria-label', 'Доступ до електронного підручника');
    aside.dataset.open = 'false';
    aside.innerHTML = `
      <div class="gtb-panel" id="global-textbook-panel">
        <h3>📘 ${book.title}</h3>
        <p>${book.authors}</p>
        <a href="${book.url}" target="_blank" rel="noopener noreferrer">Читати електронний підручник онлайн ↗</a>
        <p class="gtb-note">Відкривається веб-версія з навігацією між параграфами та сторінками. Це не файл для завантаження.</p>
      </div>
      <button class="gtb-toggle" type="button" aria-expanded="false" aria-controls="global-textbook-panel">📘 Підручник</button>
    `;
    document.body.appendChild(aside);

    const toggle = aside.querySelector('.gtb-toggle');
    toggle.addEventListener('click', () => {
      const open = aside.dataset.open !== 'true';
      aside.dataset.open = String(open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && aside.dataset.open === 'true') {
        aside.dataset.open = 'false';
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const addHomeworkCard = () => {
    if (document.querySelector('.global-textbook-home-card')) return;
    const homework = document.querySelector('#homework, section[id*="homework" i], section[id*="dz" i]');
    if (!homework) return;
    const card = document.createElement('div');
    card.className = 'global-textbook-home-card';
    card.setAttribute('role', 'note');
    card.innerHTML = `<h3>📘 Електронний підручник</h3><p><strong>${book.title}</strong> — ${book.authors}.</p><p><a href="${book.url}" target="_blank" rel="noopener noreferrer">Читати онлайн у браузері ↗</a></p><p>Веб-версія з переходами між параграфами; не потрібно завантажувати файл.</p>`;
    homework.insertBefore(card, homework.firstChild);
  };

  addHomeworkCard();

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) rewriteLegacyTextbookLinks(node);
      });
    }
    rewriteLegacyTextbookLinks();
    addHomeworkCard();
  });
  observer.observe(document.documentElement, {childList:true, subtree:true});
})();
