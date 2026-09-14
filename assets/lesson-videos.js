/* Short thematic video fragments for current lessons.
 * Author: Скринченко К.А. • Василівський ліцей «Сузір’я»
 */
(() => {
  'use strict';

  const PACKS = [
    {
      match: '/5/04-fizychni-velychyny-vymiriuvannia/',
      title: 'Вимірюємо світ: два короткі пояснення',
      intro: 'Подивіться два короткі фрагменти. Після кожного назвіть: що саме вимірюємо, яким приладом і в яких одиницях.',
      videos: [
        {id:'5qhGe-lg_3o', start:0, end:170, title:'Фізичні величини та вимірювання — 5 клас', note:'Знайдіть у фрагменті щонайменше три фізичні величини та відповідні одиниці.'},
        {id:'YFyd2TaBFnE', start:0, end:180, title:'Як правильно вимірювати фізичні величини', note:'Зверніть увагу, чому результат вимірювання без одиниці — фактично незавершена відповідь.'}
      ]
    },
    {
      match: '/6/04-forma-rozmiry-zemli-magellan/',
      title: 'Земля і навколосвітня подорож: два короткі фрагменти',
      intro: 'Перший фрагмент — про форму й розміри Землі, другий — про експедицію Магеллана—Елькано. Порівняйте науковий доказ і історичний доказ.',
      videos: [
        {id:'T1VDlYot9b4', start:0, end:180, title:'Яка форма і розміри Землі', note:'Випишіть один факт про форму Землі й один числовий показник її розміру.'},
        {id:'U4GvFyRTcQ0', start:0, end:180, title:'Магеллан і перша навколосвітня експедиція', note:'Хто фактично завершив подорож і чому коректніше говорити «експедиція Магеллана—Елькано»?'}
      ]
    },
    {
      match: '/8/04-hodynni-poiasy-ukrainy/',
      title: 'Годинні пояси без зайвої магії',
      intro: 'Два короткі фрагменти допоможуть відокремити геометрію поясів від реального цивільного часу держав.',
      videos: [
        {id:'d2C5tvAlXxE', start:25, end:124, title:'Як користуватися картою годинних поясів', note:'Після перегляду поясніть правило: чому 15° довготи відповідають приблизно одній годині.'},
        {id:'pBEjuA85pvU', start:0, end:180, title:'Україна на карті годинних поясів', note:'Знайдіть у поясненні аргумент, чому офіційний час не зобов’язаний буквально повторювати межі 15-градусних смуг.'}
      ]
    },
    {
      match: '/9/03-mihratsii-statevo-vikovyi-sklad/',
      title: 'Населення в русі: міграції та вікова структура',
      intro: 'Перший фрагмент — про причини й наслідки міграцій, другий — про читання статево-вікової структури.',
      videos: [
        {id:'x-zFwLVoEDE', start:0, end:180, title:'Міграції населення: причини та вплив', note:'Назвіть один чинник, що «виштовхує» людей, і один, що «притягує» їх до нового місця.'},
        {id:'5YYaYGo3cPY', start:0, end:180, title:'Статево-віковий склад населення', note:'За якою ознакою з форми вікової піраміди можна припустити старіння або омолодження населення?'}
      ]
    },
    {
      match: '/10/05-yevropeiska-intehratsiia/',
      title: 'Євроінтеграція: процес і сучасний контекст',
      intro: 'Два короткі фрагменти: один пояснює сам процес євроінтеграції, другий показує, що реальні переговори мають кілька можливих сценаріїв.',
      videos: [
        {id:'SE1yMHQO3Cc', start:380, end:520, title:'Що означає європейська інтеграція України', note:'Виділіть політичну й економічну складові процесу. Не плутайте кандидатство з автоматичним членством.'},
        {id:'XVPFcSw5Ewk', start:0, end:150, title:'Сценарії інтеграції України до ЄС — актуальний сюжет', note:'Які варіанти розвитку подій названі? Якої інформації недостатньо, щоб прогнозувати остаточний результат?'}
      ]
    },
    {
      match: '/profesii-9/02-sylni-storony-kompetentnosti/',
      title: 'Професія починається не з назви, а з себе',
      intro: 'Подивіться два короткі фрагменти й перевірте, чи збігаються ваші уявлення про «хочу» з тим, що ви вже вмієте й готові розвивати.',
      videos: [
        {id:'aBQ4Q2Aavy0', start:0, end:180, title:'Як обрати майбутню професію — спецурок МОН', note:'Запишіть два критерії вибору професії, які залежать саме від вас, а не від моди чи чужих очікувань.'},
        {id:'fS0QI_hONdA', start:0, end:180, title:'Поради про вибір професії від фахівців', note:'Яка порада звучить практично? Яку ви б перевірили на собі, перш ніж приймати рішення?'}
      ]
    }
  ];

  const pack = PACKS.find(p => location.pathname.includes(p.match));
  if (!pack || document.getElementById('global-lesson-videos')) return;

  const mount = () => {
    if (document.getElementById('global-lesson-videos')) return;

    const style = document.createElement('style');
    style.id = 'global-lesson-videos-style';
    style.textContent = `
      #global-lesson-videos{margin:22px auto;padding:clamp(18px,3vw,28px);width:min(1080px,calc(100% - 28px));border:1px solid rgba(80,120,150,.24);border-radius:24px;background:linear-gradient(135deg,#f7fbff,#fff8ee);box-shadow:0 14px 38px rgba(24,70,100,.10);color:#17364e;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
      #global-lesson-videos .glv-kicker{font-size:.78rem;font-weight:950;letter-spacing:.09em;text-transform:uppercase;color:#0a7a67}
      #global-lesson-videos h2{margin:.3rem 0 .6rem;font-size:clamp(1.55rem,3vw,2.35rem);line-height:1.08}
      #global-lesson-videos .glv-intro{margin:0 0 15px;color:#526c7e;max-width:82ch}
      #global-lesson-videos .glv-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}
      #global-lesson-videos .glv-card{overflow:hidden;border:1px solid #d7e7ef;border-radius:18px;background:#fff}
      #global-lesson-videos iframe{display:block;width:100%;aspect-ratio:16/9;border:0;background:#101820}
      #global-lesson-videos .glv-body{padding:14px}
      #global-lesson-videos h3{margin:0 0 7px;font-size:1.05rem}
      #global-lesson-videos p{margin:7px 0;color:#526c7e;line-height:1.5}
      #global-lesson-videos a{display:inline-block;margin-top:4px;font-weight:850;color:#086da7;text-decoration:underline;text-underline-offset:3px}
      #global-lesson-videos .glv-note{margin-top:15px;padding:11px 13px;border-radius:13px;background:#eef8f5;color:#275e53;font-size:.92rem}
      @media(max-width:760px){#global-lesson-videos .glv-grid{grid-template-columns:1fr}}
      @media print{#global-lesson-videos iframe{display:none}}
    `;
    document.head.appendChild(style);

    const section = document.createElement('section');
    section.id = 'global-lesson-videos';
    section.setAttribute('aria-label','Короткі тематичні відео');
    const cards = pack.videos.map(v => {
      const params = new URLSearchParams({start:String(v.start||0), end:String(v.end||180), rel:'0', modestbranding:'1'});
      const watch = `https://www.youtube.com/watch?v=${v.id}${v.start ? `&t=${v.start}s` : ''}`;
      return `<article class="glv-card"><iframe loading="lazy" src="https://www.youtube-nocookie.com/embed/${v.id}?${params.toString()}" title="${v.title.replace(/"/g,'&quot;')}" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe><div class="glv-body"><h3>${v.title}</h3><p>${v.note}</p><a href="${watch}" target="_blank" rel="noopener noreferrer">Відкрити відео окремо ↗</a></div></article>`;
    }).join('');
    section.innerHTML = `<div class="glv-kicker">Короткі відеофрагменти • по 1–3 хв</div><h2>${pack.title}</h2><p class="glv-intro">${pack.intro}</p><div class="glv-grid">${cards}</div><div class="glv-note"><b>Правило перегляду:</b> відео не замінює завдання. Після кожного фрагмента сформулюйте один факт і один висновок.</div>`;

    const target = document.querySelector('#theory, section[id*="theory" i], #homework, #home, section[id*="homework" i], footer');
    if (target && target.parentNode) target.parentNode.insertBefore(section,target);
    else document.body.appendChild(section);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
})();
