/* Speed Math — 60-second arithmetic sprint, original implementation */
GameFactories.speedmath = function (stage, ctx) {
  const t = ctx.t;
  const TOTAL = 60;
  let score, sec, left, streak, q, timer = null, lock = false;

  const hud = GameKit.hud(stage, [['score', t('game_score')], ['best', t('game_best')]]);
  hud.best(GameKit.getBest('speedmath'));

  const box = GameKit.el('div', 'sm-box');
  const timerBar = GameKit.el('div', 'sm-timer', '<i></i>');
  const question = GameKit.el('div', 'sm-question', '7 + 5');
  const options = GameKit.el('div', 'sm-options');
  box.appendChild(timerBar); box.appendChild(question); box.appendChild(options);
  stage.appendChild(box);

  const barEl = timerBar.querySelector('i');

  function rnd(n) { return Math.floor(Math.random() * n); }

  function makeQuestion() {
    streak = streak || 0;
    let a, b, op, ans;
    if (streak < 3) { op = '+'; a = 1 + rnd(10); b = 1 + rnd(10); ans = a + b; }
    else if (streak < 6) {
      op = Math.random() < 0.5 ? '+' : '−';
      a = 5 + rnd(20); b = 1 + rnd(15);
      if (op === '+' ) ans = a + b;
      else { if (b > a) [a, b] = [b, a]; ans = a - b; }
    } else {
      op = Math.random() < 0.55 ? '×' : '+';
      if (op === '×') { a = 2 + rnd(11); b = 2 + rnd(11); ans = a * b; }
      else { a = 10 + rnd(40); b = 10 + rnd(40); ans = a + b; }
    }
    const set = new Set([ans]);
    while (set.size < 4) {
      let d = ans + (rnd(11) - 5) + (Math.random() < 0.5 ? rnd(6) + 1 : 0);
      if (d !== ans && d >= 0) set.add(d);
    }
    q = { text: a + ' ' + op + ' ' + b, ans };
    return [...set].sort(() => Math.random() - 0.5);
  }

  function render() {
    const opts = makeQuestion();
    question.textContent = q.text;
    options.innerHTML = '';
    opts.forEach(v => {
      const b = GameKit.el('button', 'sm-opt', v);
      b.onclick = () => answer(b, v);
      options.appendChild(b);
    });
  }

  function answer(btn, v) {
    if (lock) return;
    if (v === q.ans) {
      btn.classList.add('ok');
      streak++;
      score++;
      hud.score(score);
      setTimeout(next, 220);
    } else {
      btn.classList.add('bad');
      lock = true;
      left = Math.max(0, left - 2);
      setTimeout(() => { lock = false; next(); }, 420);
    }
  }

  function next() { render(); }

  function tick() {
    sec++;
    left = TOTAL - sec;
    barEl.style.width = (left / TOTAL * 100) + '%';
    if (left <= 0) end();
  }

  function start() {
    if (timer) clearInterval(timer);
    score = 0; sec = 0; left = TOTAL; streak = 0; lock = false;
    hud.score(0);
    barEl.style.width = '100%';
    render();
    timer = setInterval(tick, 1000);
  }

  function end() {
    clearInterval(timer); timer = null;
    question.textContent = '⏱';
    options.innerHTML = '';
    const r = GameKit.submit('speedmath', score, true);
    hud.best(GameKit.getBest('speedmath'));
    GameKit.overlay(stage, {
      title: t('game_over'),
      stats: [[t('game_score'), score], [t('game_best'), r.value]],
      msg: r.isBest ? t('game_newbest') : '',
      btnLabel: t('game_again'),
      onBtn: () => { ov.remove(); start(); },
    });
    const ov = stage.querySelector('.g-overlay');
  }

  start();
  return { destroy() { if (timer) clearInterval(timer); } };
};
