/* Shape Detective — sides & symmetry quiz with SVG shapes, original implementation */
GameFactories.shapespy = function (stage, ctx) {
  const t = ctx.t;
  const TOTAL = 12;
  let round, score, q, lock;

  const hud = GameKit.hud(stage, [
    ['round', t('game_round')], ['score', t('game_score')], ['best', t('game_best')],
  ]);
  hud.best(GameKit.getBest('shapespy'));

  const box = GameKit.el('div', 'sm-box');
  const shapeEl = GameKit.el('div', 'shape-stage');
  const options = GameKit.el('div', 'sm-options');
  box.appendChild(shapeEl); box.appendChild(options);
  stage.appendChild(box);

  const rnd = n => Math.floor(Math.random() * n);

  /* regular-ish polygon points helper */
  const poly = (cx, cy, r, n, rot) => {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i * 2 * Math.PI / n) + (rot || 0);
      pts.push((cx + r * Math.sin(a)).toFixed(1) + ',' + (cy - r * Math.cos(a)).toFixed(1));
    }
    return pts.join(' ');
  };

  const SHAPES = [
    { draw: '<polygon points="' + poly(50, 50, 42, 3) + '" fill="#ffd166" stroke="#454c59" stroke-width="3"/>', sides: 3, sym: 3 },
    { draw: '<rect x="14" y="14" width="72" height="72" rx="6" fill="#7ec9ff" stroke="#454c59" stroke-width="3"/>', sides: 4, sym: 4 },
    { draw: '<rect x="8" y="30" width="84" height="40" rx="4" fill="#7ec9ff" stroke="#454c59" stroke-width="3"/>', sides: 4, sym: 2 },
    { draw: '<polygon points="' + poly(50, 52, 42, 5) + '" fill="#b892ff" stroke="#454c59" stroke-width="3"/>', sides: 5, sym: 5 },
    { draw: '<polygon points="' + poly(50, 50, 43, 6) + '" fill="#7bf1a8" stroke="#454c59" stroke-width="3"/>', sides: 6, sym: 6 },
    { draw: '<polygon points="' + poly(50, 50, 44, 4, Math.PI / 4) + '" fill="#ffa8a8" stroke="#454c59" stroke-width="3"/>', sides: 4, sym: 2 },
  ];

  function makeQuestion() {
    const shape = SHAPES[rnd(SHAPES.length)];
    const mode = rnd(2) === 0 ? 'sides' : 'sym';
    const correct = mode === 'sides' ? shape.sides : shape.sym;
    const max = mode === 'sides' ? 8 : 7;
    const set = new Set([correct]);
    while (set.size < 4) {
      const v = 1 + rnd(max);
      if (v !== correct) set.add(v);
    }
    return { shape, mode, correct, opts: [...set].sort((a, b) => a - b) };
  }

  function render() {
    q = makeQuestion();
    shapeEl.innerHTML =
      '<svg viewBox="0 0 100 100">' +
      '<g class="shape-spin">' + q.shape.draw + '</g></svg>' +
      '<div class="shape-q">' + t(q.mode === 'sides' ? 'tr_sides' : 'tr_sym') + '</div>';
    options.innerHTML = '';
    q.opts.forEach(v => {
      const b = GameKit.el('button', 'sm-opt', v);
      b.onclick = () => answer(b, v);
      options.appendChild(b);
    });
  }

  function answer(btn, v) {
    if (lock) return;
    lock = true;
    if (v === q.correct) {
      btn.classList.add('ok');
      score++;
      hud.score(score);
    } else {
      btn.classList.add('bad');
      [...options.children].forEach(b => { if (+b.textContent === q.correct) b.classList.add('ok'); });
    }
    hud.round(Math.min(round, TOTAL) + '/' + TOTAL);
    setTimeout(() => {
      lock = false;
      if (round >= TOTAL) return end();
      round++;
      render();
    }, 700);
  }

  function start() {
    round = 1; score = 0; lock = false;
    hud.round('1/' + TOTAL); hud.score(0);
    render();
  }

  function end() {
    const r = GameKit.submit('shapespy', score, true);
    hud.best(GameKit.getBest('shapespy'));
    GameKit.overlay(stage, {
      title: score >= 10 ? t('game_win') : t('game_over'),
      stats: [[t('game_score'), score + '/' + TOTAL], [t('game_best'), r.value]],
      msg: r.isBest ? t('game_newbest') : '',
      btnLabel: t('game_again'),
      onBtn: () => { ov.remove(); start(); },
    });
    const ov = stage.querySelector('.g-overlay');
  }

  start();
  return { destroy() {} };
};
