/* Balance Scales — simple equation solving, original implementation */
GameFactories.balance = function (stage, ctx) {
  const t = ctx.t;
  const TOTAL = 10, LIVES = 3;
  let round, lives, score, q, lock;
  const timers = [];

  const hud = GameKit.hud(stage, [
    ['round', t('game_round')], ['score', t('game_score')], ['best', t('game_best')],
  ]);
  hud.best(GameKit.getBest('balance'));
  const hearts = GameKit.el('div', 'g-note');
  const setHearts = GameKit.lives(hearts, LIVES);

  const box = GameKit.el('div', 'sm-box');
  const scaleEl = GameKit.el('div', 'balance-svg');
  scaleEl.innerHTML =
    '<svg viewBox="0 0 260 150">' +
    '<path d="M130 20v80" stroke="#8a93a6" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M50 34h160" stroke="#8a93a6" stroke-width="6" stroke-linecap="round"/>' +
    '<g id="leftPan"><path d="M50 34 L32 66 h36 z" fill="none" stroke="#8a93a6" stroke-width="4"/><rect id="leftBox" x="30" y="72" width="40" height="24" rx="5" fill="#ffd166"/></g>' +
    '<g id="rightPan"><path d="M210 34 L192 66 h36 z" fill="none" stroke="#8a93a6" stroke-width="4"/><rect id="rightBox" x="190" y="72" width="40" height="24" rx="5" fill="#7ec9ff"/></g>' +
    '<rect x="106" y="104" width="48" height="10" rx="4" fill="#8a93a6"/><rect x="80" y="114" width="100" height="8" rx="4" fill="#69707d"/>' +
    '<text id="eqText" x="130" y="20" font-size="17" font-weight="800" fill="#fff" text-anchor="middle"></text></svg>';
  const options = GameKit.el('div', 'sm-options');
  box.appendChild(scaleEl); box.appendChild(options);
  stage.appendChild(box);
  stage.appendChild(hearts);

  const eqText = scaleEl.querySelector('#eqText');

  const rnd = n => Math.floor(Math.random() * n);
  const opts4 = (correct) => {
    const set = new Set([correct]);
    while (set.size < 4) {
      const d = correct + (rnd(9) - 4);
      if (d !== correct && d >= 0) set.add(d);
    }
    return [...set].sort(() => Math.random() - 0.5);
  };

  function makeQuestion() {
    const type = round <= 3 ? 'add' : ['add', 'sub', 'mul', 'div'][rnd(4)];
    let x, a, text;
    if (type === 'add') { x = 2 + rnd(15); a = 2 + rnd(12); text = 'x + ' + a + ' = ' + (x + a); }
    else if (type === 'sub') { x = 6 + rnd(20); a = 2 + rnd(5); text = 'x − ' + a + ' = ' + (x - a); }
    else if (type === 'mul') { x = 2 + rnd(10); a = 2 + rnd(8); text = a + ' · x = ' + (a * x); }
    else { x = 2 + rnd(10); a = 2 + rnd(6); text = (x * a) + ' ÷ ' + a + ' = ?'; }
    return { correct: x, text };
  }
  GameFactories.balance._test = { makeQuestion };

  function render() {
    q = makeQuestion();
    eqText.textContent = q.text;
    options.innerHTML = '';
    opts4(q.correct).forEach(v => {
      const b = GameKit.el('button', 'sm-opt', 'x = ' + v);
      b.onclick = () => answer(b, v);
      options.appendChild(b);
    });
  }

  function answer(btn, v) {
    if (lock) return;
    lock = true;
    const tilt = scaleEl.querySelector('svg');
    if (v === q.correct) {
      btn.classList.add('ok');
      score++;
      hud.score(score);
      tilt.style.transform = 'rotate(0deg)';
    } else {
      btn.classList.add('bad');
      lives--;
      setHearts(lives);
      tilt.style.transform = 'rotate(' + (Math.random() < 0.5 ? -6 : 6) + 'deg)';
      [...options.children].forEach(b => { if (b.textContent === 'x = ' + q.correct) b.classList.add('ok'); });
    }
    hud.round(Math.min(round, TOTAL) + '/' + TOTAL);
    timers.push(setTimeout(() => {
      lock = false;
      tilt.style.transform = 'rotate(0deg)';
      if (lives <= 0) return end(false);
      if (round >= TOTAL) return end(true);
      round++;
      render();
    }, 750));
  }

  function start() {
    round = 1; lives = LIVES; score = 0; lock = false;
    hud.round('1/' + TOTAL); hud.score(0);
    setHearts(lives);
    render();
  }

  function end(done) {
    const r = GameKit.submit('balance', score, true);
    hud.best(GameKit.getBest('balance'));
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
