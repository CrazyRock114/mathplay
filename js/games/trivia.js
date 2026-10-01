/* Math Quiz — template-generated mixed questions, original implementation */
GameFactories.trivia = function (stage, ctx) {
  const t = ctx.t;
  const TOTAL = 12, LIVES = 3;
  let qNum, lives, score, q, lock, answerTimer = null;

  const hud = GameKit.hud(stage, [
    ['q', t('game_round')], ['score', t('game_score')], ['best', t('game_best')],
  ]);
  hud.best(GameKit.getBest('trivia'));
  const hearts = GameKit.el('div', 'g-note');
  const setHearts = GameKit.lives(hearts, LIVES);

  const box = GameKit.el('div', 'sm-box');
  const question = GameKit.el('div', 'trivia-question');
  const options = GameKit.el('div', 'sm-options');
  box.appendChild(question); box.appendChild(options);
  stage.appendChild(box);
  stage.appendChild(hearts);

  const rnd = n => Math.floor(Math.random() * n);
  const opts4 = (correct, spread, min = 0) => {
    const set = new Set([correct]);
    while (set.size < 4) {
      let d = correct + (rnd(spread) - Math.floor(spread / 2));
      if (Math.random() < 0.4) d = correct + rnd(spread) + 1;
      if (d >= min && d !== correct) set.add(d);
    }
    return [...set].sort(() => Math.random() - 0.5);
  };

  function prime(n) { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }

  function makeQuestion() {
    const type = ['prime', 'even', 'double', 'half', 'square', 'minutes', 'days', 'largest', 'next', 'missing'][rnd(10)];
    let text, correct;
    if (type === 'prime') {
      const pool = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53];
      correct = pool[rnd(pool.length)];
      text = t('tr_prime');
    } else if (type === 'even') {
      correct = 2 * (2 + rnd(20));
      text = t('tr_even');
    } else if (type === 'double') {
      const n = 10 + rnd(40); correct = n * 2; text = t('tr_double', { n });
    } else if (type === 'half') {
      const n = 2 * (10 + rnd(40)); correct = n / 2; text = t('tr_half', { n });
    } else if (type === 'square') {
      const n = 4 + rnd(13); correct = n * n; text = t('tr_square', { n });
    } else if (type === 'minutes') {
      const n = 2 + rnd(7); correct = n * 60; text = t('tr_minutes', { n });
    } else if (type === 'days') {
      const n = 3 + rnd(8); correct = n * 7; text = t('tr_days', { n });
    } else if (type === 'largest') {
      const four = opts4(0, 90, 10).map(v => v + 10);
      correct = Math.max(...four);
      const set = new Set(four);
      while (set.size < 4) set.add(10 + rnd(90));
      return { text, opts: [...set].sort(() => Math.random() - 0.5), correct };
    } else if (type === 'next') {
      const a = rnd(6) + 1, step = 2 + rnd(4);
      const start = 1 + rnd(8);
      const seq = [start, start + step, start + 2 * step, start + 3 * step];
      correct = start + 4 * step;
      text = t('tr_next') + '  ' + seq.join(', ') + ', …';
    } else {
      const a = 5 + rnd(30), b = 3 + rnd(25);
      correct = b; text = t('tr_missing', { a, c: a + b });
    }
    const spread = type === 'minutes' ? 130 : type === 'square' ? 15 : 12;
    return { text, opts: opts4(correct, spread, 1), correct };
  }

  function render() {
    hud.q(qNum + '/' + TOTAL);
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
    lock = true;
    if (v === q.correct) {
      btn.classList.add('ok');
      score++;
      hud.score(score);
    } else {
      btn.classList.add('bad');
      lives--;
      setHearts(lives);
      [...options.children].forEach(b => { if (+b.textContent === q.correct) b.classList.add('ok'); });
    }
    answerTimer = setTimeout(() => {
      lock = false;
      if (lives <= 0) return end(false);
      if (qNum >= TOTAL) return end(true);
      qNum++;
      render();
    }, 650);
  }

  function start() {
    qNum = 1; lives = LIVES; score = 0; lock = false;
    hud.q('1/' + TOTAL); hud.score(0);
    setHearts(lives);
    render();
  }

  function end(done) {
    const r = GameKit.submit('trivia', score, true);
    hud.best(GameKit.getBest('trivia'));
    GameKit.overlay(stage, {
      title: done ? (score >= 10 ? t('game_win') : t('game_over')) : t('game_over'),
      stats: [[t('game_score'), score + '/' + TOTAL], [t('game_best'), r.value]],
      msg: r.isBest ? t('game_newbest') : '',
      btnLabel: t('game_again'),
      onBtn: () => { ov.remove(); start(); },
    });
    const ov = stage.querySelector('.g-overlay');
  }

  start();
  return { destroy() { if (answerTimer) clearTimeout(answerTimer); } };
};
