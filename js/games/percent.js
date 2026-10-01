/* Percent Dash — percentage quick-fire, original implementation */
GameFactories.percent = function (stage, ctx) {
  const t = ctx.t;
  const TOTAL = 60;
  let score, sec, q, lock, timer = null;

  const hud = GameKit.hud(stage, [['score', t('game_score')], ['best', t('game_best')]]);
  hud.best(GameKit.getBest('percent'));

  const box = GameKit.el('div', 'sm-box');
  const timerBar = GameKit.el('div', 'sm-timer', '<i></i>');
  const question = GameKit.el('div', 'sm-question');
  const options = GameKit.el('div', 'sm-options');
  box.appendChild(timerBar); box.appendChild(question); box.appendChild(options);
  stage.appendChild(box);
  const barEl = timerBar.querySelector('i');

  const rnd = n => Math.floor(Math.random() * n);

  function makeQuestion() {
    const p = [10, 20, 25, 50, 75][rnd(5)];
    let n, ans;
    if (p === 10) { n = 10 * (1 + rnd(30)); ans = n / 10; }
    else if (p === 20) { n = 5 * (1 + rnd(20)); ans = n / 5; }
    else if (p === 25) { n = 4 * (2 + rnd(24)); ans = n / 4; }
    else if (p === 50) { n = 2 * (1 + rnd(50)); ans = n / 2; }
    else { n = 4 * (2 + rnd(25)); ans = n * 0.75; }
    const set = new Set([ans]);
    while (set.size < 4) {
      const d = ans + (rnd(11) - 5);
      if (d !== ans && d >= 0) set.add(d);
    }
    return { text: t('pc_of', { p, n }), ans, opts: [...set].sort(() => Math.random() - 0.5) };
  }

  function render() {
    q = makeQuestion();
    question.textContent = q.text;
    options.innerHTML = '';
    q.opts.forEach(v => {
      const b = GameKit.el('button', 'sm-opt', v);
      b.onclick = () => answer(b, v);
      options.appendChild(b);
    });
  }

  function answer(btn, v) {
    if (lock) return;
    if (v === q.ans) {
      btn.classList.add('ok');
      score++;
      hud.score(score);
      lock = true;
      setTimeout(() => { lock = false; render(); }, 220);
    } else {
      btn.classList.add('bad');
      lock = true;
      sec = Math.min(TOTAL, sec + 2);
      setTimeout(() => { lock = false; }, 420);
    }
  }

  function tick() {
    sec++;
    barEl.style.width = Math.max(0, (TOTAL - sec) / TOTAL * 100) + '%';
    if (sec >= TOTAL) end();
  }

  function start() {
    if (timer) clearInterval(timer);
    score = 0; sec = 0; lock = false;
    hud.score(0);
    barEl.style.width = '100%';
    render();
    timer = setInterval(tick, 1000);
  }

  function end() {
    clearInterval(timer); timer = null;
    question.textContent = '⏱';
    options.innerHTML = '';
    const r = GameKit.submit('percent', score, true);
    hud.best(GameKit.getBest('percent'));
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
