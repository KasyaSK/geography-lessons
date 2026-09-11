/*
 * Site-wide textbook access fallback for geography-lessons.
 * Ensures every published lesson in grades 5–11 has a stable, visible route
 * to the official textbook even when an embedded PDF/viewer is blocked.
 * Author: Скринченко К.А. • Василівський ліцей «Сузір’я»
 */
(() => {
  'use strict';

  const BOOKS = {
    '5': {
      title: '«Пізнаємо природу», 5 клас',
      authors: 'Д. Біда, Т. Гільберг, Я. Колісник',
      url: 'https://www.geneza.ua/sites/default/files/ebooks/%D0%9F%D1%96%D0%B7%D0%BD%D0%B0%D1%94%D0%BC%D0%BE%20%D0%9F%D1%80%D0%B8%D1%80%D0%BE%D0%B4%D1%83_5%D0%BA%D0%BB_%D0%93%D0%B5%D0%BD%D0%B5%D0%B7%D0%B0.pdf',
      source: 'https://www.geneza.ua/product/1095',
      sourceLabel: 'Офіційна сторінка видавництва «Генеза»'
    },
    '6': {
      title: '«Географія», 6 клас',
      authors: 'С. Запотоцький, М. Зінкевич, О. Романишин та ін.',
      url: 'https://lib.imzo.gov.ua/wa-data/public/site/books2/6-kl-23/pr-galuz/%D0%90%D0%A1%D0%A2%D0%9E%D0%9D_%D0%93%D0%B5%D0%BE%D0%B3%D1%80%D0%B0%D1%84%D1%96%D1%8F_6_%D0%BA%D0%BB_%D0%97%D0%B0%D0%BF%D0%BE%D1%82%D0%BE%D1%86%D1%8C%D0%BA%D0%B8%D0%B9_%D1%82%D0%B0_%D1%96%D0%BD_2023.pdf',
      source: 'https://lib.imzo.gov.ua/',
      sourceLabel: 'Електронна бібліотека ІМЗО'
    },
    '7': {
      title: '«Географія», 7 клас',
      authors: 'Т. Гільберг, А. Довгань, В. Совенко',
      url: 'https://www.geneza.ua/sites/default/files/ebooks/%D0%93%D1%96%D0%BB%D1%8C%D0%B1%D0%B5%D1%80%D0%B3_%D0%93%D0%B5%D0%BE%D0%B3%D1%80%D0%B0%D1%84_%D0%9F_7_%28047-23%29_S.pdf',
      source: 'https://www.geneza.ua/product/1154',
      sourceLabel: 'Офіційна сторінка видавництва «Генеза»'
    },
    '8': {
      title: '«Географія», 8 клас',
      authors: 'Т. Гільберг, А. Довгань, І. Савчук',
      url: 'https://www.geneza.ua/sites/default/files/ebooks/%D0%93%D1%96%D0%BB%D1%8C%D0%B1%D0%B5%D1%80%D0%B3_%D0%93%D0%B5%D0%BE%D0%B3%D1%80%D0%B0%D1%84%D1%96%D1%8F_%D0%9F_8_%28069-24%29_S.pdf',
      source: 'https://www.geneza.ua/product/1207',
      sourceLabel: 'Офіційна сторінка видавництва «Генеза»'
    },
    '9': {
      title: '«Географія», 9 клас',
      authors: 'Т. Гільберг, А. Довгань, І. Савчук',
      url: 'https://drive.google.com/drive/folders/1Cu2kU1lm8IpwuWn7Z0boDZMKupdpdRlu?usp=sharing',
      source: 'https://www.geneza.ua/product/1287',
      sourceLabel: 'Офіційна сторінка видавництва «Генеза»'
    },
    '10': {
      title: '«Географія: регіони та країни», 10 клас',
      authors: 'Т. Гільберг, І. Савчук, В. Совенко',
      url: 'https://lib.imzo.gov.ua/wa-data/public/site/books2/pidruchnyky-10-klas-2018/20-geografiya-10-klas/10kl-geografy-standart.pdf',
      source: 'https://lib.imzo.gov.ua/',
      sourceLabel: 'Електронна бібліотека ІМЗО'
    },
    '11': {
      title: '«Географічний простір Землі», 11 клас',
      authors: 'Т. Гільберг, І. Савчук, В. Совенко',
      url: 'https://lib.imzo.gov.ua/wa-data/public/site/books2/pidruchnyky-11-klas-2019/17-geografiya-11-klas/11-kl-geografy.pdf',
      source: 'https://lib.imzo.gov.ua/',
      sourceLabel: 'Електронна бібліотека ІМЗО'
    }
  };

  const segments = location.pathname.split('/').filter(Boolean);
  if (segments.some(s => s.startsWith('profesii-'))) return;

  const gradeIndex = segments.findIndex(s => Object.prototype.hasOwnProperty.call(BOOKS, s));
  if (gradeIndex < 0) return;

  const grade = segments[gradeIndex];
  // Do not add the widget to the grade catalogue itself; only lesson pages.
  if (!segments[gradeIndex + 1] || segments[gradeIndex + 1] === 'index.html') return;

  const book = BOOKS[grade];
  if (document.getElementById('global-textbook-access')) return;

  const style = document.createElement('style');
  style.id = 'global-textbook-access-style';
  style.textContent = `
    #global-textbook-access{position:fixed;right:16px;bottom:16px;z-index:2147483000;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#17344c}
    #global-textbook-access .gtb-toggle{display:flex;align-items:center;gap:8px;min-height:48px;border:0;border-radius:999px;padding:11px 16px;background:#0d6b55;color:#fff;font:800 15px/1.2 inherit;box-shadow:0 10px 30px rgba(0,0,0,.22);cursor:pointer}
    #global-textbook-access .gtb-panel{display:none;position:absolute;right:0;bottom:58px;width:min(360px,calc(100vw - 32px));padding:16px;border:1px solid #d5e5df;border-radius:18px;background:#fff;box-shadow:0 18px 46px rgba(0,0,0,.22)}
    #global-textbook-access[data-open="true"] .gtb-panel{display:block}
    #global-textbook-access h3{margin:0 0 6px;font-size:17px;line-height:1.25;color:#17344c}
    #global-textbook-access p{margin:5px 0 11px;font-size:13px;line-height:1.45;color:#556b78}
    #global-textbook-access .gtb-actions{display:grid;gap:8px}
    #global-textbook-access a{display:block;text-align:center;text-decoration:none;border-radius:12px;padding:10px 12px;font-weight:800;font-size:14px}
    #global-textbook-access .gtb-primary{background:#0d6b55;color:#fff}
    #global-textbook-access .gtb-secondary{border:1px solid #c9ddd6;color:#0d6b55;background:#f7fffc}
    #global-textbook-access .gtb-note{margin:10px 0 0;font-size:12px;color:#687b86}
    #global-textbook-access button:focus-visible,#global-textbook-access a:focus-visible{outline:3px solid #ffbf47;outline-offset:3px}
    .global-textbook-home-card{margin:14px 0;padding:16px;border:1px solid #bfe1d5;border-radius:16px;background:#f3fffa;color:#17344c}
    .global-textbook-home-card h3{margin:0 0 6px!important}
    .global-textbook-home-card p{margin:6px 0!important}
    .global-textbook-home-card a{font-weight:800;color:#0d6b55;text-decoration:underline;text-underline-offset:3px}
    @media(max-width:560px){#global-textbook-access{right:10px;bottom:10px}#global-textbook-access .gtb-toggle{min-height:46px;padding:10px 14px}}
    @media print{#global-textbook-access{display:none!important}}
    @media(prefers-reduced-motion:reduce){#global-textbook-access *{scroll-behavior:auto!important;transition:none!important}}
  `;
  document.head.appendChild(style);

  const aside = document.createElement('aside');
  aside.id = 'global-textbook-access';
  aside.setAttribute('aria-label', 'Доступ до електронного підручника');
  aside.dataset.open = 'false';
  aside.innerHTML = `
    <div class="gtb-panel" id="global-textbook-panel">
      <h3>📘 ${book.title}</h3>
      <p>${book.authors}</p>
      <div class="gtb-actions">
        <a class="gtb-primary" href="${book.url}" target="_blank" rel="noopener noreferrer">Відкрити електронний підручник ↗</a>
        <a class="gtb-secondary" href="${book.source}" target="_blank" rel="noopener noreferrer">${book.sourceLabel} ↗</a>
      </div>
      <p class="gtb-note">Це резервний прямий доступ. Він працює окремо від вбудованого переглядача, тому підручник залишається доступним, навіть якщо браузер не показує PDF усередині сторінки.</p>
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
      toggle.focus();
    }
  });

  // Add a visible fallback card to the homework/resources area when it appears.
  const addHomeworkCard = () => {
    if (document.querySelector('.global-textbook-home-card')) return true;
    const homework = document.querySelector('#homework, section[id*="homework" i], section[id*="dz" i]');
    if (!homework) return false;
    const card = document.createElement('div');
    card.className = 'global-textbook-home-card';
    card.setAttribute('role', 'note');
    card.innerHTML = `<h3>📘 Надійний доступ до підручника</h3><p><strong>${book.title}</strong> — ${book.authors}.</p><p><a href="${book.url}" target="_blank" rel="noopener noreferrer">Відкрити електронний підручник ↗</a> · <a href="${book.source}" target="_blank" rel="noopener noreferrer">Офіційне джерело ↗</a></p><p>Якщо PDF не показується всередині уроку, відкрийте його цією кнопкою в окремій вкладці.</p>`;
    homework.insertBefore(card, homework.firstChild);
    return true;
  };

  if (!addHomeworkCard()) {
    const observer = new MutationObserver(() => {
      if (addHomeworkCard()) observer.disconnect();
    });
    observer.observe(document.documentElement, {childList:true, subtree:true});
    setTimeout(() => observer.disconnect(), 20000);
  }
})();
