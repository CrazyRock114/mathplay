/* Number Merge — classic tile-merge mechanics, original implementation */
GameFactories.merge2048 = function (stage, ctx) {
  const t = ctx.t;
  const N = 4;
  let board = [], score = 0, over = false, won = false;
  const timers = [];

  const hud = GameKit.hud(stage, [
    ['score', t('game_score')],
    ['best', t('game_best')],
  ]);
  hud.best(GameKit.getBest('merge2048'));

  const boardEl = GameKit.el('div', 'm2048-board');
  stage.appendChild(boardEl);
  const cells = [];
  for (let i = 0; i < N * N; i++) {
    const c = GameKit.el('div', 'm2048-cell');
    boardEl.appendChild(c); cells.push(c);
  }

  function render() {
    for (let i = 0; i < N * N; i++) {
      const v = board[i] || 0;
      const c = cells[i];
      c.className = 'm2048-cell ' + (v ? (v <= 2048 ? 'v' + v : 'vbig') : '');
      c.textContent = v || '';
    }
    hud.score(score);
  }

  function addTile() {
    const empty = [];
    board.forEach((v, i) => { if (!v) empty.push(i); });
    if (!empty.length) return;
    board[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < 0.9 ? 2 : 4;
  }

  function line(i, k) { // extract one line as array
    const out = [];
    for (let j = 0; j < N; j++) out.push(board[i * N + j * k]);
    return out;
  }
  function putLine(i, k, arr) {
    for (let j = 0; j < N; j++) board[i * N + j * k] = arr[j];
  }

  function slide(arr) { // slide+merge one line toward index 0
    let a = arr.filter(v => v);
    const out = [];
    for (let i = 0; i < a.length; i++) {
      if (a[i] === a[i + 1]) { out.push(a[i] * 2); score += a[i] * 2; i++; }
      else out.push(a[i]);
    }
    while (out.length < N) out.push(0);
    return out;
  }

  function move(dir) {
    if (over) return;
    const before = board.join(',');
    for (let i = 0; i < N; i++) {
      // dir: 0=up 1=right 2=down 3=left  → (line index, step, reverse?)
      const rev = dir === 1 || dir === 2;
      const k = (dir === 0 || dir === 2) ? N : 1; // vertical lines step N
      let arr = line(i, k);
      if (rev) arr.reverse();
      arr = slide(arr);
      if (rev) arr.reverse();
      putLine(i, k, arr);
    }
    if (board.join(',') !== before) {
      addTile();
      render();
      if (!won && board.includes(2048)) { won = true; finish(true); return; }
      if (!canMove()) { over = true; finish(false); }
    }
  }

  function canMove() {
    if (board.includes(0)) return true;
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const v = board[r * N + c];
      if (c < N - 1 && board[r * N + c + 1] === v) return true;
      if (r < N - 1 && board[(r + 1) * N + c] === v) return true;
    }
    return false;
  }

  function start() {
    board = new Array(N * N).fill(0);
    score = 0; over = false; won = false;
    addTile(); addTile();
    render();
  }

  function finish(win) {
    const r = GameKit.submit('merge2048', score, true);
    hud.best(GameKit.getBest('merge2048'));
    if (r.isBest) stage.classList.add('win-bg');
    GameKit.overlay(stage, {
      title: win ? t('game_win') : t('game_over'),
      stats: [[t('game_score'), score], [t('game_best'), r.value]],
      msg: r.isBest ? t('game_newbest') : '',
      btnLabel: t('game_again'),
      onBtn: () => { stage.classList.remove('win-bg'); ov.remove(); start(); },
    });
    const ov = stage.querySelector('.g-overlay');
  }

  const rmKeys = GameKit.keys(dir => {
    const m = { left: 3, right: 1, up: 0, down: 2 };
    if (m[dir] != null) move(m[dir]);
  });
  GameKit.swipe(boardEl, dir => move({ left: 3, right: 1, up: 0, down: 2 }[dir]));
  GameKit.dpad(stage, dir => move({ left: 3, right: 1, up: 0, down: 2 }[dir]));

  start();
  return { destroy() { rmKeys(); } };
};
