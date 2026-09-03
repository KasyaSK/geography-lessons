'use strict';

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    function safeText(value, fallback = '—') {
      const trimmed = String(value || '').trim();
      return trimmed || fallback;
    }

    function setFeedback(element, message, tone = 'neutral') {
      element.innerHTML = message;
      element.classList.remove('correct', 'incorrect');
      if (tone === 'correct') element.classList.add('correct');
      if (tone === 'incorrect') element.classList.add('incorrect');
    }

    window.addEventListener('scroll', () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const value = max > 0 ? (doc.scrollTop / max) * 100 : 0;
      $('#scrollBar').style.width = value + '%';
    }, { passive: true });

    $$('#problemChoices .choice').forEach((button) => {
      button.addEventListener('click', () => {
        $$('#problemChoices .choice').forEach((item) => item.classList.remove('is-selected'));
        button.classList.add('is-selected');
        setFeedback($('#problemFeedback'), button.dataset.feedback + '<br><strong>Для пари:</strong> який факт міг би змінити Вашу позицію?');
      });
    });

    $('#checkSort').addEventListener('click', () => {
      const cards = $$('#sortGrid .sort-card');
      let correct = 0;
      let empty = 0;
      cards.forEach((card) => {
        const select = $('select', card);
        card.classList.remove('correct', 'incorrect');
        if (!select.value) empty += 1;
        if (select.value === card.dataset.answer) {
          correct += 1;
          card.classList.add('correct');
        } else {
          card.classList.add('incorrect');
        }
      });
      if (empty) {
        setFeedback($('#sortFeedback'), `Не завершено: залишилося обрати ${empty}. Підказка: сфера — найширше поняття, посада — конкретна роль в організації.`, 'incorrect');
      } else if (correct === cards.length) {
        setFeedback($('#sortFeedback'), '<strong>6 із 6.</strong> Професія описує тип кваліфікованої роботи, посада — конкретну роль, сфера — ширше поле діяльності.', 'correct');
      } else {
        setFeedback($('#sortFeedback'), `<strong>${correct} із ${cards.length}.</strong> Перевірте, де названо конкретну роль в установі, а де — широке поле роботи.`, 'incorrect');
      }
    });

    $('#resetSort').addEventListener('click', () => {
      $$('#sortGrid .sort-card').forEach((card) => {
        $('select', card).value = '';
        card.classList.remove('correct', 'incorrect');
      });
      setFeedback($('#sortFeedback'), 'Оберіть категорію для всіх шести прикладів.');
    });

    const sectors = $$('#sectorGrid .sector');
    function updateSectorResult() {
      const active = sectors.filter((button) => button.getAttribute('aria-pressed') === 'true');
      if (!active.length) {
        setFeedback($('#sectorResult'), 'Оберіть один або два сектори. Важливе не «подобається назва», а «цікаво виконати такі завдання».');
        return;
      }
      const content = active.map((button) => `<strong>${button.dataset.sector}</strong>: ${button.dataset.task}. Приклади: ${button.dataset.examples}.`).join('<br>');
      setFeedback($('#sectorResult'), `${content}<br><small>Запитання: яке коротке завдання могло б перевірити Ваш інтерес до цього сектора?</small>`);
    }
    sectors.forEach((button) => {
      button.addEventListener('click', () => {
        const active = sectors.filter((item) => item.getAttribute('aria-pressed') === 'true');
        const isPressed = button.getAttribute('aria-pressed') === 'true';
        if (!isPressed && active.length >= 2) {
          setFeedback($('#sectorResult'), 'Для цього етапу оберіть не більше двох секторів: обмеження змушує порівняти пріоритети.', 'incorrect');
          return;
        }
        button.setAttribute('aria-pressed', String(!isPressed));
        button.classList.toggle('is-active', !isPressed);
        updateSectorResult();
      });
    });

    const evidenceCards = $$('#evidenceGrid .evidence-card');
    function updateEvidenceCount() {
      const count = evidenceCards.filter((card) => card.getAttribute('aria-pressed') === 'true').length;
      $('#evidenceCount').textContent = `Обрано: ${count} із 4`;
    }
    evidenceCards.forEach((card) => {
      card.addEventListener('click', () => {
        const activeCount = evidenceCards.filter((item) => item.getAttribute('aria-pressed') === 'true').length;
        const pressed = card.getAttribute('aria-pressed') === 'true';
        if (!pressed && activeCount >= 4) {
          setFeedback($('#evidenceFeedback'), 'Можна обрати лише чотири матеріали. Щоб додати інший, спершу зніміть один вибір.', 'incorrect');
          return;
        }
        card.setAttribute('aria-pressed', String(!pressed));
        updateEvidenceCount();
      });
    });
    $('#checkEvidence').addEventListener('click', () => {
      const chosen = evidenceCards.filter((card) => card.getAttribute('aria-pressed') === 'true');
      if (chosen.length !== 4) {
        setFeedback($('#evidenceFeedback'), `Потрібно обрати рівно чотири матеріали. Зараз обрано: ${chosen.length}.`, 'incorrect');
        return;
      }
      const strongCount = chosen.filter((card) => card.dataset.strong === 'true').length;
      if (strongCount === 4) {
        setFeedback($('#evidenceFeedback'), '<strong>Добір доказовий.</strong> Разом матеріали показують продукт, роль, зовнішній відгук і рефлексію. Саме поєднання джерел робить висновок сильнішим.', 'correct');
      } else {
        setFeedback($('#evidenceFeedback'), `<strong>Сильних матеріалів: ${strongCount} із 4.</strong> Приберіть твердження без прикладу та матеріали, які не показують внеску Марти.`, 'incorrect');
      }
    });

    const today = new Date();
    const dateField = $('#portfolioDate');
    dateField.value = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');

    function renderPortfolio() {
      $('#previewName').textContent = safeText($('#portfolioName').value, 'Моя перша доказова картка');
      $('#previewDate').textContent = 'Дата: ' + safeText($('#portfolioDate').value);
      $('#previewInterest').textContent = safeText($('#portfolioInterest').value);
      $('#previewProof').textContent = safeText($('#portfolioProof').value);
      $('#previewNext').textContent = safeText($('#portfolioNext').value);
    }
    $('#portfolioForm').addEventListener('submit', (event) => {
      event.preventDefault();
      renderPortfolio();
      const filled = ['portfolioInterest', 'portfolioProof', 'portfolioNext'].filter((id) => safeText($('#' + id).value, '')).length;
      if (filled === 3) setFeedback($('#portfolioFeedback'), '<strong>Картку створено.</strong> Перевірте, чи доказ містить Вашу дію і результат, а наступний крок можна виконати найближчим часом.', 'correct');
      else setFeedback($('#portfolioFeedback'), `Картку оновлено, але заповнено ${filled} із 3 змістових полів. Додайте відсутнє, щоб запис був придатним для портфоліо.`, 'incorrect');
    });
    $('#savePortfolio').addEventListener('click', () => {
      renderPortfolio();
      const data = {
        name: $('#portfolioName').value,
        date: $('#portfolioDate').value,
        interest: $('#portfolioInterest').value,
        proof: $('#portfolioProof').value,
        next: $('#portfolioNext').value
      };
      try {
        localStorage.setItem('profesii9_portfolio_001', JSON.stringify(data));
        setFeedback($('#portfolioFeedback'), '<strong>Збережено на цьому пристрої.</strong> Запис залишиться у браузері, доки не буде очищено його дані.', 'correct');
      } catch (error) {
        setFeedback($('#portfolioFeedback'), 'Браузер не дозволив локальне збереження. Зробіть скриншот або скористайтеся друком.', 'incorrect');
      }
    });
    $('#clearPortfolio').addEventListener('click', () => {
      try {
        localStorage.removeItem('profesii9_portfolio_001');
        setFeedback($('#portfolioFeedback'), 'Локально збережений запис видалено. Поточний текст у полях залишився, щоб Ви не втратили роботу до закриття сторінки.', 'correct');
      } catch (error) {
        setFeedback($('#portfolioFeedback'), 'Не вдалося змінити локальне сховище браузера.', 'incorrect');
      }
    });
    $('#printPortfolio').addEventListener('click', () => {
      renderPortfolio();
      document.body.classList.add('print-portfolio');
      window.print();
      document.body.classList.remove('print-portfolio');
    });
    try {
      const stored = JSON.parse(localStorage.getItem('profesii9_portfolio_001') || 'null');
      if (stored) {
        $('#portfolioName').value = stored.name || '';
        $('#portfolioDate').value = stored.date || dateField.value;
        $('#portfolioInterest').value = stored.interest || '';
        $('#portfolioProof').value = stored.proof || '';
        $('#portfolioNext').value = stored.next || '';
        renderPortfolio();
        setFeedback($('#portfolioFeedback'), 'Відновлено локально збережену картку. Дані не передавалися в інтернет.', 'correct');
      }
    } catch (error) {
      // Якщо локальний запис пошкоджений, сторінка просто починає з чистої картки.
    }

    $$('.myth-card').forEach((card) => {
      $$('.myth-actions button', card).forEach((button) => {
        button.addEventListener('click', () => {
          const correctChoice = button.dataset.vote === card.dataset.truth;
          const truth = card.dataset.truth === 'true';
          $('.myth-result', card).innerHTML = correctChoice
            ? `<strong>Так.</strong> ${truth ? 'Це коректне узагальнення, але воно не обіцяє автоматичного успіху.' : 'У твердженні зроблено ширший висновок, ніж дозволяє доказ.'}`
            : `<strong>Перевірте ще раз.</strong> ${truth ? 'Твердження допускає різні шляхи й не перебільшує доказ.' : 'Окремої ознаки недостатньо для такого широкого висновку.'}`;
          card.classList.toggle('correct', correctChoice);
          card.classList.toggle('incorrect', !correctChoice);
        });
      });
    });

    const cerIds = ['cerClaim', 'cerEvidence', 'cerReason', 'cerLimit'];
    $('#checkCer').addEventListener('click', () => {
      const missing = cerIds.filter((id) => $('#' + id).value.trim().length < 12);
      if (!missing.length) {
        setFeedback($('#cerFeedback'), '<strong>Структура повна.</strong> Тепер перевірте найважливіше: чи названо конкретний доказ і чи справді пояснено його зв’язок із твердженням.', 'correct');
      } else {
        setFeedback($('#cerFeedback'), `Потрібно конкретизувати частини відповіді: ${missing.length}. У кожній має бути змістовна фраза, а не одне слово.`, 'incorrect');
      }
    });
    $('#copyCer').addEventListener('click', async () => {
      const labels = ['Твердження', 'Доказ', 'Пояснення', 'Обмеження'];
      const text = cerIds.map((id, index) => `${labels[index]}: ${safeText($('#' + id).value)}`).join('\n');
      try {
        await navigator.clipboard.writeText(text);
        setFeedback($('#cerFeedback'), 'CER-висновок скопійовано.', 'correct');
      } catch (error) {
        setFeedback($('#cerFeedback'), 'Автоматичне копіювання недоступне. Виділіть текст у полях і скопіюйте вручну.', 'incorrect');
      }
    });

    function validFullName(value) {
      const parts = value.trim().replace(/\s+/g, ' ').split(' ');
      return parts.length >= 2 && parts.every((part) => /^[А-ЯІЇЄҐа-яіїєґA-Za-z'’\-]+$/.test(part));
    }

    $('#startQuiz').addEventListener('click', () => {
      const name = $('#fullName').value;
      const classValue = $('#studentClass').value.trim();
      if (!validFullName(name) || !classValue) {
        setFeedback($('#gateFeedback'), 'Введіть ім’я та прізвище щонайменше двома словами без цифр, а також клас.', 'incorrect');
        return;
      }
      $('#identityGate').hidden = true;
      $('#quizForm').hidden = false;
      $('#quizForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    function radioValue(name) {
      const selected = $(`input[name="${name}"]:checked`);
      return selected ? selected.value : '';
    }
    function checkboxValues(name) {
      return $$(`input[name="${name}"]:checked`).map((input) => input.value).sort();
    }
    function sameSet(actual, expected) {
      return actual.length === expected.length && actual.every((value, index) => value === expected.slice().sort()[index]);
    }
    function markQuestion(key, isCorrect) {
      const card = $(`[data-question="${key}"]`);
      card.classList.remove('correct', 'incorrect');
      card.classList.add(isCorrect ? 'correct' : 'incorrect');
      $('.quiz-status', card).textContent = isCorrect ? 'Зараховано: 1 бал.' : 'Не зараховано. Поверніться до понять і логіки доказів.';
    }

    $('#quizForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const results = {
        q1: radioValue('q1') === 'b',
        q2: radioValue('q2') === 'c',
        q3: radioValue('q3') === 'b',
        q4: radioValue('q4') === 'c',
        q5: sameSet(checkboxValues('q5'), ['artifact', 'reflection', 'feedback'].sort()),
        q6: sameSet(checkboxValues('q6'), ['requirements', 'conditions', 'sources'].sort()),
        q7: $('#q7a').value === 'profession' && $('#q7b').value === 'position' && $('#q7c').value === 'sphere',
        q8: $('#q8a').value === '1' && $('#q8b').value === '2' && $('#q8c').value === '3' && $('#q8d').value === '4',
        q9: radioValue('q9') === 'c',
        q10: radioValue('q10') === 'b'
      };
      Object.entries(results).forEach(([key, value]) => markQuestion(key, value));
      const score = Object.values(results).filter(Boolean).length;
      const percent = score * 10;
      let comment = 'Варто повторити поняття й логіку доказів.';
      if (score >= 5) comment = 'Достатній рівень: основна логіка засвоєна.';
      if (score >= 8) comment = 'Добрий результат: Ви впевнено працюєте з доказами.';
      if (score === 10) comment = 'Відмінний результат: усі рішення логічно точні.';
      $('#scoreText').textContent = `${score}/10 · ${percent}%`;
      $('#scoreComment').textContent = comment;
      $('#resultName').textContent = $('#fullName').value.trim().replace(/\s+/g, ' ');
      $('#resultClass').textContent = $('#studentClass').value.trim();
      $('#resultDate').textContent = new Intl.DateTimeFormat('uk-UA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());
      $('#resultCard').hidden = false;
      $('#resultCard').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    $('#printResult').addEventListener('click', () => {
      document.body.classList.add('print-result');
      window.print();
      document.body.classList.remove('print-result');
    });
    $('#retryQuiz').addEventListener('click', () => {
      const confirmed = window.confirm('Розпочати тест ще раз? Ім’я та клас залишаться заповненими, а відповіді буде очищено.');
      if (!confirmed) return;
      $('#quizForm').reset();
      $$('.quiz-question').forEach((card) => {
        card.classList.remove('correct', 'incorrect');
        $('.quiz-status', card).textContent = '';
      });
      $('#resultCard').hidden = true;
      $('#quizForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
