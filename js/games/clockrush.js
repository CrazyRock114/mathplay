/* Clock Rush — analog clock reading, original implementation */
GameFactories.clockrush = function (stage, ctx) {
  const t = ctx.t;
  const TOTAL = 60;
  let score, sec, q, lock, timer = null, hardMode;

  const hud = GameKit.hud(stage, [['score', t('game_score')], ['best', t('game_best')]]);
  hud.best(GameKit.getBest('clockrush'));

  const box = GameKit.el('div', 'sm-box');
  const clockEl = GameKit.el('div', 'clock-face');
  clockEl.innerHTML =
    '<svg viewBox="0 0 200 200">' +
    '<circle cx="100" cy="100" r="92" fill="#fff" stroke="#454c59" stroke-width="6"/>' +
    '<g id="ticks" stroke="#454c59"></g>' +
    '<line id="hh" x1="100" y1="100" x2="100" y2="58" stroke="#1f2430" stroke-width="8" stroke-linecap="round"/>' +
    '<line id="mh" x1="100" y1="100" x2="100" y2="32" stroke="#ff4b57" stroke-width="5" stroke-linecap="round"/>' +
    '<circle cx="100" cy="100" r="7" fill="#1f2430"/></svg>';
  const options = GameKit.el('div', 'sm-options');
  box.appendChild(clockEl); box.appendChild(options);
  stage.appendChild(box);

  const svg = clockEl.querySelector('svg');
  const ticks = clockEl.querySelector('#ticks');
  let tickHtml = '';
  for (let i = 0; i < 60; i += 5) {
    const a = i * 6 * Math.PI / 180;
    const x1 = 100 + Math.sin(a) * 78, y1 = 100 - Math.cos(a) * 78;
    tickHtml += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + (100 + Math.sin(a) * 86) + '" y2="' + (100 - Math.cos(a) * 86) + '" stroke-width="3"/>';
  }
  ticks.innerHTML = tickHtml;
  const hh = clockEl.querySelector('#hh'), mh = clockEl.querySelector('#mh');

  const rnd = n => Math.floor(Math.random() * n);
  const pad = v => String(v).padStart(2, '0');

  function setHands(h, m) {
    const ha = ((h % 12) + m / 60) * 30 * Math.PI / 180;
    const ma = m * 6 * Math.PI / 180;
    hh.setAttribute('x2', 100 + Math.sin(ha) * 42);
    hh.setAttribute('y2', 100 - Math.cos(ha) * 42);
    mh.setAttribute('x2', 100 + Math.sin(ma) * 68);
    mh.setAttribute('y2', 100 - Math.cos(ma) * 68);
  }

  function makeQuestion() {
    const h = 1 + rnd(12);
    let m;
    if (!hardMode) m = 5 * rnd(12);
    else if (hardMode < 3) m = rnd(24) * 5 + (rnd(2) ? 30 : 0); // quarter-ish
    else m = rnd(60);
    const correct = pad(h) + ':' + pad(m);
    const set = new Set([correct]);
    while (set.size < 4) {
      const fh = 1 + rnd(12);
      const fm = hardMode ? rnd(60) : 5 * rnd(12);
      const cand = pad(fh) + ':' + pad(fm);
      if (cand !== correct) set.add(cand);
    }
    return { h, m, opts: [...set].sort(() => Math.random() - 0.5), correct };
  }

  function render() {
    q = makeQuestion();
    setHands(q.h, q.m);
    options.innerHTML = '';
    q.opts.forEach(v => {
      const b = GameKit.el('button', 'sm-opt', v);
      b.style.fontSize = '19px';
      b.onclick = () => answer(b, v);
      options.appendChild(b);
    });
  }

  function answer(btn, v) {
    if (lock) return;
    if (v === q.correct) {
      btn.classList.add('ok');
      score++;
      hud.score(score);
      hardMode = 1 + Math.floor(score / 4);
      lock = true;
      setTimeout(() => { lock = false; render(); }, 250);
    } else {
      btn.classList.add('bad');
      sec = Math.min(TOTAL, sec + 3); // wrong answers cost 3 seconds
    }
  }

  function tick() {
    sec++;
    if (sec >= TOTAL) end();
  }

  function start() {
    if (timer) clearInterval(timer);
    score = 0; sec = 0; lock = false; hardMode = 0;
    hud.score(0);
    render();
    timer = setInterval(tick, 1000);
  }

  function end() {
    clearInterval(timer); timer = null;
    options.innerHTML = '';
    const r = GameKit.submit('clockrush', score, true);
    hud.best(GameKit.getBest('clockrush'));
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
