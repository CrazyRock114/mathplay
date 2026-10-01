/* Next Number — sequence pattern reasoning, original implementation */
GameFactories.sequence = function (stage, ctx) {
  const t = ctx.t;
  let score, streak, q, lock;

  const hud = GameKit.hud(stage, [['score', t('game_score')], ['best', t('game_best')]]);
  hud.best(GameKit.getBest('sequence'));

  const box = GameKit.el('div', 'sm-box');
  const seqEl = GameKit.el('div', 'seq-row');
  const options = GameKit.el('div', 'sm-options');
  box.appendChild(seqEl); box.appendChild(options);
  stage.appendChild(box);

  const rnd = n => Math.floor(Math.random() * n);

  function makeQuestion() {
    const lvl = Math.min(3, 1 + Math.floor(streak / 3));
    const kinds = lvl === 1 ? ['arith'] : lvl === 2 ? ['arith', 'geo', 'alt'] : ['geo', 'square', 'fib', 'arith2'];
    const kind = kinds[rnd(kinds.length)];
    let seq = [], correct;
    if (kind === 'arith') {
      const a = rnd(8) + 1, d = 2 + rnd(6);
      seq = [a, a + d, a + 2 * d, a + 3 * d];
      correct = a + 4 * d;
    } else if (kind === 'arith2') {
      const a = 2 + rnd(10), d = 5 + rnd(10);
      seq = [a, a + d, a + 2 * d, a + 3 * d];
      correct = a + 4 * d;
    } else if (kind === 'geo') {
      const a = 1 + rnd(4), r = rnd(2) ? 2 : 3;
      seq = [a, a * r, a * r * r, a * r * r * r];
      correct = a * r * r * r * r;
    } else if (kind === 'square') {
      const s = 1 + rnd(5);
      seq = [s * s, (s + 1) * (s + 1), (s + 2) * (s + 2), (s + 3) * (s + 3)];
      correct = (s + 4) * (s + 4);
    } else if (kind === 'fib') {
      let a = rnd(3), b = 1 + rnd(4);
      seq = [a, b, a + b, a + 2 * b];
      correct = a + 3 * b;
    } else { // alt: +a −b alternating
      const a = 3 + rnd(6), b = 1 + rnd(3);
      let v = 1 + rnd(5);
      seq = [];
      for (let i = 0; i < 4; i++) { seq.push(v); v = i % 2 === 0 ? v + a : v - b; }
      correct = v;
    }
    const set = new Set([correct]);
    while (set.size < 4) {
      const d = correct + (rnd(11) - 5);
      if (d !== correct && d >= 0) set.add(d);
    }
    return { seq, correct, opts: [...set].sort((x, y) => x - y) };
  }

  function render() {
    q = makeQuestion();
    seqEl.innerHTML = '';
    q.seq.forEach(v => seqEl.appendChild(GameKit.el('span', 'seq-cell', v)));
    seqEl.appendChild(GameKit.el('span', 'seq-cell q', '?'));
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
      streak++;
      hud.score(score);
    } else {
      btn.classList.add('bad');
      streak = 0;
      [...options.children].forEach(b => { if (+b.textContent === q.correct) b.classList.add('ok'); });
    }
    setTimeout(() => { lock = false; render(); }, 600);
  }

  function start() {
    score = 0; streak = 0; lock = false;
    hud.score(0);
    render();
  }

  function idleOver() {} // endless: use HUD best only

  // endless mode: no overlay until closed; record best continuously
  const origAnswer = answer;
  answer = function (btn, v) {
    origAnswer(btn, v);
    GameKit.submit('sequence', score, true);
    hud.best(GameKit.getBest('sequence'));
  };

  start();
  return { destroy() {} };
};
