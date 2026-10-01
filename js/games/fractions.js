/* Fraction Match — equivalent fraction practice, original implementation */
GameFactories.fractions = function (stage, ctx) {
  const t = ctx.t;
  const TOTAL = 10, LIVES = 3;
  let round, lives, score, q, lock;
  const timers = [];

  const hud = GameKit.hud(stage, [
    ['round', t('game_round')], ['score', t('game_score')], ['best', t('game_best')],
  ]);
  hud.best(GameKit.getBest('fractions'));
  const hearts = GameKit.el('div', 'g-note');
  const setHearts = GameKit.lives(hearts, LIVES);

  const box = GameKit.el('div', 'sm-box');
  const targetEl = GameKit.el('div', 'frac-target');
  const options = GameKit.el('div', 'sm-options');
  box.appendChild(targetEl); box.appendChild(options);
  stage.appendChild(box);
  stage.appendChild(hearts);

  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const rnd = n => Math.floor(Math.random() * n);

  function fracHTML(n, d) { return '<span class="frac"><i>' + n + '</i><i>' + d + '</i></span>'; }

  function makeQuestion() {
    const base = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [1, 5], [2, 7], [3, 8]][rnd(10)];
    const [a, b] = base;
    const k = 2 + rnd(3);
    const target = [a * k, b * k];
    const correct = [a, b];
    const wrongs = new Set();
    const key = v => v[0] / v[1];
    while (wrongs.size < 3) {
      const cand = [[a + rnd(2) + 1, b], [a, b + rnd(2) + 1], [a + 1, b + 1], [a * 2, b + rnd(2) + 1]][rnd(4)];
      if (Math.abs(key(cand) - key(correct)) > 0.02) wrongs.add(cand[0] + '/' + cand[1]);
    }
    const opts = [[...correct], ...[...wrongs].map(s => s.split('/').map(Number))]
      .sort(() => Math.random() - 0.5);
    return { target, correct, opts };
  }

  function render() {
    q = makeQuestion();
    targetEl.innerHTML = fracHTML(q.target[0], q.target[1]) + ' = ?';
    options.innerHTML = '';
    q.opts.forEach(f => {
      const b = GameKit.el('button', 'sm-opt frac-opt', fracHTML(f[0], f[1]));
      b.dataset.v = f.join('/');
      b.onclick = () => answer(b, f);
      options.appendChild(b);
    });
  }

  function answer(btn, f) {
    if (lock) return;
    lock = true;
    if (f[0] === q.correct[0] && f[1] === q.correct[1]) {
      btn.classList.add('ok');
      score++;
      hud.score(score);
    } else {
      btn.classList.add('bad');
      lives--;
      setHearts(lives);
      [...options.children].forEach(b => { if (b.dataset.v === q.correct.join('/')) b.classList.add('ok'); });
    }
    hud.round(Math.min(round, TOTAL) + '/' + TOTAL);
    timers.push(setTimeout(() => {
      lock = false;
      if (lives <= 0) return end(false);
      if (round >= TOTAL) return end(true);
      round++;
      render();
    }, 700));
  }

  function start() {
    round = 1; lives = LIVES; score = 0; lock = false;
    hud.round('1/' + TOTAL); hud.score(0);
    setHearts(lives);
    render();
  }

  function end(done) {
    const r = GameKit.submit('fractions', score, true);
    hud.best(GameKit.getBest('fractions'));
    GameKit.overlay(stage, {
      title: done && score >= 8 ? t('game_win') : t('game_over'),
      stats: [[t('game_score'), score + '/' + TOTAL], [t('game_best'), r.value]],
      msg: r.isBest ? t('game_newbest') : '',
      btnLabel: t('game_again'),
      onBtn: () => { ov.remove(); start(); },
    });
    const ov = stage.querySelector('.g-overlay');
  }

  start();
  return { destroy() { timers.forEach(clearTimeout); } };
};
