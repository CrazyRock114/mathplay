/* Four in a Row vs computer — original alpha-beta implementation */
GameFactories.connect4 = function (stage, ctx) {
  const t = ctx.t;
  const W = 7, H = 6;
  let board, turn, over, busy, tally = { p: 0, c: 0, d: 0 };

  const status = GameKit.el('div', 'g-note');
  const boardEl = GameKit.el('div', 'c4-board');
  stage.appendChild(boardEl);
  stage.appendChild(status);

  const cols = [];
  for (let x = 0; x < W; x++) {
    const col = GameKit.el('div', 'c4-col');
    for (let y = 0; y < H; y++) col.appendChild(GameKit.el('div', 'c4-hole'));
    col.onclick = () => drop(x);
    boardEl.appendChild(col);
    cols.push(col);
  }

  const idx = (x, y) => y * W + x;
  const at = (b, x, y) => (x < 0 || x >= W || y < 0 || y >= H) ? 0 : b[idx(x, y)];

  function landing(b, x) {
    for (let y = H - 1; y >= 0; y--) if (!b[idx(x, y)]) return y;
    return -1;
  }

  function findWins(b) { // returns [cells] of any 4-line
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const p = at(b, x, y);
      if (!p) continue;
      for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
        const line = [[x, y]];
        for (let k = 1; k < 4; k++) line.push([x + dx * k, y + dy * k]);
        if (line.every(([lx, ly]) => at(b, lx, ly) === p)) return line;
      }
    }
    return null;
  }

  function evalBoard(b) { // positive favors the computer (2)
    let s = 0;
    const window4 = (cells) => {
      const vals = cells.map(([x, y]) => at(b, x, y));
      const me = vals.filter(v => v === 2).length, op = vals.filter(v => v === 1).length;
      if (me && op) return;
      if (me === 3) s += 60; else if (me === 2) s += 8;
      if (op === 3) s -= 80; else if (op === 2) s -= 8;
    };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (x + 3 < W) window4([[x, y], [x + 1, y], [x + 2, y], [x + 3, y]]);
      if (y + 3 < H) window4([[x, y], [x, y + 1], [x, y + 2], [x, y + 3]]);
      if (x + 3 < W && y + 3 < H) window4([[x, y], [x + 1, y + 1], [x + 2, y + 2], [x + 3, y + 3]]);
      if (x + 3 < W && y - 3 >= 0) window4([[x, y], [x + 1, y - 1], [x + 2, y - 2], [x + 3, y - 3]]);
    }
    for (let y = 0; y < H; y++) if (at(b, 3, y) === 2) s += 4; // center column preference
    return s;
  }

  function search(b, depth, alpha, beta, me) {
    if (findWins(b)) return me === 2 ? -10000 - depth : 10000 + depth;
    if (depth === 0) return evalBoard(b);
    const maxing = me === 2;
    let best = maxing ? -Infinity : Infinity;
    for (let x = 0; x < W; x++) {
      const y = landing(b, x);
      if (y < 0) continue;
      b[idx(x, y)] = me;
      const v = search(b, depth - 1, alpha, beta, me === 2 ? 1 : 2);
      b[idx(x, y)] = 0;
      if (maxing) { best = Math.max(best, v); alpha = Math.max(alpha, v); }
      else { best = Math.min(best, v); beta = Math.min(beta, v); }
      if (beta <= alpha) break;
    }
    return best;
  }

  function computerMove() {
    const b = board.slice();
    let bestX = -1, bestV = -Infinity;
    const xs = [3, 2, 4, 1, 5, 0, 6]; // try center first
    for (const x of xs) {
      const y = landing(b, x);
      if (y < 0) continue;
      b[idx(x, y)] = 2;
      const v = search(b, 4, -Infinity, Infinity, 1);
      b[idx(x, y)] = 0;
      if (v > bestV) { bestV = v; bestX = x; }
    }
    return bestX;
  }

  function drop(x) {
    if (over || busy || turn !== 1) return;
    const y = landing(board, x);
    if (y < 0) return;
    paint(x, y, 1);
    const w1 = findWins(board);
    if (w1) return finish(1, w1);
    turn = 2;
    status.textContent = t('game_thinking');
    busy = true;
    setTimeout(() => {
      if (over) return;
      const cx = computerMove();
      const cy = landing(board, cx);
      paint(cx, cy, 2);
      busy = false;
      const w2 = findWins(board);
      if (w2) return finish(2, w2);
      if (board.every(Boolean)) return finish(0);
      turn = 1;
      status.textContent = t('game_yourturn');
    }, 380);
  }

  function paint(x, y, p) {
    board[idx(x, y)] = p;
    cols[x].children[y].classList.add(p === 1 ? 'p1' : 'p2');
  }

  function start() {
    board = new Array(W * H).fill(0);
    turn = 1; over = false; busy = false;
    status.textContent = t('game_yourturn');
    cols.forEach(c => [...c.children].forEach(h => h.className = 'c4-hole'));
  }

  function finish(winner, line) {
    over = true;
    if (line) line.forEach(([x, y]) => cols[x].children[y].classList.add('winline'));
    let title;
    if (winner === 1) { tally.p++; title = t('game_win'); stage.classList.add('win-bg'); }
    else if (winner === 2) { tally.c++; title = t('game_cpuwin'); }
    else { tally.d++; title = t('game_draw'); }
    status.textContent = title;
    GameKit.overlay(stage, {
      title,
      stats: [[t('game_score'), tally.p], ['CPU', tally.c], ['—', tally.d]],
      btnLabel: t('game_again'),
      onBtn: () => { stage.classList.remove('win-bg'); ov.remove(); start(); },
    });
    const ov = stage.querySelector('.g-overlay');
  }

  start();
  return { destroy() {} };
};
