/* Sliding 15 — solvable shuffle, original implementation */
GameFactories.sliding = function (stage, ctx) {
  const t = ctx.t;
  const N = 4;
  let board, blank, moves, sec, timer = null, done;

  const hud = GameKit.hud(stage, [
    ['moves', t('game_moves')], ['time', t('game_time')], ['best', t('game_best')],
  ]);
  const fmtBest = () => { const b = GameKit.getBest('sliding'); hud.best(b ? b : '—'); };

  const gridEl = GameKit.el('div', 'slide-grid');
  stage.appendChild(gridEl);
  const tiles = [];
  for (let i = 0; i < N * N; i++) {
    const el = GameKit.el('div', 'slide-tile');
    el.onclick = () => clickMove(i);
    gridEl.appendChild(el);
    tiles.push(el);
  }

  const neighborsOf = i => {
    const x = i % N, y = Math.floor(i / N), out = [];
    if (x > 0) out.push(i - 1);
    if (x < N - 1) out.push(i + 1);
    if (y > 0) out.push(i - N);
    if (y < N - 1) out.push(i + N);
    return out;
  };

  function slide(i, count) { // move tile at i into blank
    const b = board.indexOf(0);
    if (!neighborsOf(i).includes(b)) return false;
    board[b] = board[i]; board[i] = 0;
    return true;
  }

  function shuffle() {
    board = [...Array(N * N - 1).keys()].map(v => v + 1).concat(0);
    let last = -1;
    for (let k = 0; k < 160; k++) {
      const b = board.indexOf(0);
      const opts = neighborsOf(b).filter(i => i !== last);
      const pick = opts[Math.floor(Math.random() * opts.length)];
      last = b;
      slide(pick);
    }
  }

  function paint() {
    for (let i = 0; i < N * N; i++) {
      const v = board[i];
      tiles[i].textContent = v || '';
      tiles[i].style.visibility = v ? 'visible' : 'hidden';
      tiles[i].classList.toggle('ok', !!v && v === i + 1);
    }
  }

  function clickMove(i) {
    if (done) return;
    if (!slide(i)) return;
    moves++;
    hud.moves(moves);
    paint();
    if (!started()) startTimer();
    check();
  }

  let timerStarted = false;
  function started() { return timerStarted; }
  function startTimer() {
    timerStarted = true;
    timer = setInterval(() => { sec++; hud.time(GameKit.fmtTime(sec)); }, 1000);
  }

  function check() {
    if (board.some((v, i) => i < N * N - 1 && v !== i + 1)) return;
    done = true;
    clearInterval(timer); timer = null;
    const r = GameKit.submit('sliding', moves, false);
    fmtBest();
    stage.classList.add('win-bg');
    GameKit.overlay(stage, {
      title: t('game_win'),
      stats: [[t('game_moves'), moves], [t('game_time'), GameKit.fmtTime(sec)], [t('game_best'), r.value]],
      msg: r.isBest ? t('game_newbest') : '',
      btnLabel: t('game_again'),
      onBtn: () => { stage.classList.remove('win-bg'); ov.remove(); start(); },
    });
    const ov = stage.querySelector('.g-overlay');
  }

  function start() {
    clearInterval(timer); timer = null;
    moves = 0; sec = 0; done = false; timerStarted = false;
    hud.moves(0); hud.time('0:00'); fmtBest();
    shuffle();
    paint();
  }

  const rmKeys = GameKit.keys(dir => {
    if (done) return;
    // arrows describe the direction the TILE moves into the blank
    const opposite = { left: 'right', right: 'left', up: 'down', down: 'up' };
    const b = board.indexOf(0);
    const x = b % N, y = Math.floor(b / N);
    let target = -1;
    if (dir === 'left' && x < N - 1) target = b + 1;
    else if (dir === 'right' && x > 0) target = b - 1;
    else if (dir === 'up' && y < N - 1) target = b + N;
    else if (dir === 'down' && y > 0) target = b - N;
    if (target >= 0) clickMove(target);
  });

  start();
  return { destroy() { rmKeys(); if (timer) clearInterval(timer); } };
};
