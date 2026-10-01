/* Mini Sudoku — 6×6 generator with unique-solution removal, original implementation */
GameFactories.sudoku = function (stage, ctx) {
  const t = ctx.t;
  const N = 6; // rows/cols, boxes are 2 wide × 3 tall
  let solution, puzzle, given, board, sel, sec, timer = null, done;

  const hud = GameKit.hud(stage, [['time', t('game_time')], ['best', t('game_best')]]);
  const fmtBest = () => { const b = GameKit.getBest('sudoku'); hud.best(b ? GameKit.fmtTime(b) : '—'); };
  fmtBest();

  const gridEl = GameKit.el('div', 'sud-grid');
  const nums = GameKit.el('div', 'sud-nums');
  stage.appendChild(gridEl); stage.appendChild(nums);

  const cellEls = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const c = GameKit.el('div', 'sud-cell');
    if (x % 2 === 1 && x !== N - 1) c.classList.add('rg');
    if (y % 3 === 2 && y !== N - 1) c.classList.add('bg');
    c.onclick = () => { if (!given[y * N + x] && !done) { sel = y * N + x; paint(); } };
    gridEl.appendChild(c); cellEls.push(c);
  }
  for (let v = 1; v <= N; v++) {
    const b = GameKit.el('button', 'sud-num', v);
    b.onclick = () => put(v);
    nums.appendChild(b);
  }
  const erase = GameKit.el('button', 'sud-num erase', '⌫');
  erase.onclick = () => put(0);
  nums.appendChild(erase);

  function ok(boxX, boxY, v) { // box coords: 3 rows of boxes, 2 cols of boxes
    return true;
  }

  function fill(b, pos) {
    if (pos === N * N) return true;
    const x = pos % N, y = Math.floor(pos / N);
    const vals = [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5);
    for (const v of vals) {
      if (rowHas(b, y, v) || colHas(b, x, v) || boxHas(b, x, y, v)) continue;
      b[pos] = v;
      if (fill(b, pos + 1)) return true;
      b[pos] = 0;
    }
    return false;
  }
  const rowHas = (b, y, v) => b.slice(y * N, y * N + N).includes(v);
  const colHas = (b, x, v) => { for (let y = 0; y < N; y++) if (b[y * N + x] === v) return true; return false; };
  const boxHas = (b, x, y, v) => {
    const bx = Math.floor(x / 2) * 2, by = Math.floor(y / 3) * 3;
    for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 2; dx++) if (b[(by + dy) * N + bx + dx] === v) return true;
    return false;
  };

  function countSolutions(b, pos, limit) {
    if (pos === N * N) return 1;
    let total = 0;
    const x = pos % N, y = Math.floor(pos / N);
    if (b[pos]) return countSolutions(b, pos + 1, limit);
    for (let v = 1; v <= N && total < limit; v++) {
      if (rowHas(b, y, v) || colHas(b, x, v) || boxHas(b, x, y, v)) continue;
      b[pos] = v;
      total += countSolutions(b, pos + 1, limit - total);
      b[pos] = 0;
    }
    return total;
  }

  function generate() {
    solution = new Array(N * N).fill(0);
    fill(solution, 0);
    puzzle = solution.slice();
    const order = [...Array(N * N).keys()].sort(() => Math.random() - 0.5);
    let removed = 0;
    for (const i of order) {
      if (removed >= 13) break;
      const keep = puzzle[i];
      puzzle[i] = 0;
      const probe = puzzle.slice();
      if (countSolutions(probe, 0, 2) !== 1) puzzle[i] = keep;
      else removed++;
    }
    given = puzzle.map(v => !!v);
  }

  function put(v) {
    if (sel == null || given[sel] || done) return;
    board[sel] = v;
    paint();
    if (board.every((c, i) => c && c === solution[i])) win();
  }

  function paint() {
    for (let i = 0; i < N * N; i++) {
      const c = cellEls[i];
      c.textContent = board[i] || '';
      c.className = 'sud-cell' + (i % 2 === 1 && i % N !== N - 1 ? ' rg' : '') +
        (Math.floor(i / N) % 3 === 2 && i < N * (N - 1) ? ' bg' : '') +
        (given[i] ? ' given' : '') +
        (board[i] && board[i] !== solution[i] ? ' err' : '') +
        (sel === i ? ' sel' : '');
    }
  }

  function start() {
    if (timer) clearInterval(timer);
    generate();
    board = puzzle.slice();
    sel = null; sec = 0; done = false;
    hud.time('0:00');
    paint();
    timer = setInterval(() => { sec++; hud.time(GameKit.fmtTime(sec)); }, 1000);
  }

  function win() {
    done = true;
    clearInterval(timer); timer = null;
    const r = GameKit.submit('sudoku', sec, false);
    fmtBest();
    stage.classList.add('win-bg');
    GameKit.overlay(stage, {
      title: t('game_win'),
      stats: [[t('game_time'), GameKit.fmtTime(sec)], [t('game_best'), GameKit.fmtTime(r.value)]],
      msg: r.isBest ? t('game_newbest') : '',
      btnLabel: t('game_again'),
      onBtn: () => { stage.classList.remove('win-bg'); ov.remove(); start(); },
    });
    const ov = stage.querySelector('.g-overlay');
  }

  start();
  return { destroy() { if (timer) clearInterval(timer); } };
};
