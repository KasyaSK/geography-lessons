document.addEventListener('DOMContentLoaded', async()=>{
const load=async f=>{const r=await fetch(f);if(!r.ok)throw new Error('Не вдалося завантажити '+f);return r.text()};
const a=['gallery-a.html','gallery-b.html','problem.html','videos.html'];
const b=['projectionLab.html','generalization.html','symbols.html','sorter.html'];
const c=['duel.html','summary.html','homework.html','quiz-shell.html','sources.html'];
document.getElementById('part1').innerHTML=(await Promise.all(a.map(load))).join('');
document.getElementById('part2').innerHTML=(await Promise.all(b.map(load))).join('');
document.getElementById('part3').innerHTML=(await Promise.all(c.map(load))).join('');
document.getElementById('quizQs').innerHTML=(await Promise.all(['quiz-a.html','quiz-b.html'].map(load))).join('');
await import('./logic-1.js');await import('./logic-2.js');await import('./logic-3.js');
});