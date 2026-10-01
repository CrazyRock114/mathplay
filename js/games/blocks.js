/* Block Drop — falling-block stacker, original implementation */
GameFactories.blocks = function (stage, ctx) {
  const t = ctx.t;
  const COLS = 10, ROWS = 20, CELL = 16, W = COLS * CELL, H = ROWS * CELL;
  const SHAPES = [
    { cells: [[0,0],[1,0],[2,0],[3,0]], c: '#4aa3ff' }, // I
    { cells: [[0,0],[1,0],[2,0],[2,1]], c: '#ff9f43' }, // J
    { cells: [[0,0],[1,0],[2,0],[0,1]], c: '#a29bfe' }, // L
    { cells: [[0,0],[1,0],[0,1],[1,1]], c: '#ffd166' }, // O
    { cells: [[1,0],[2,0],[0,1],[1,1]], c: '#2ecc71' }, // S
    { cells: [[0,0],[1,0],[1,1],[2,1]], c: '#ff5b5b' }, // Z
    { cells: [[1,0],[0,1],[1,1],[2,1]], c: '#f368e0' }, // T
  ];
  let grid, piece, nextPiece, score, lines, over, timer = null;

  const hud = GameKit.hud(stage, [
    ['score', t('game_score')], ['lines', t('game_lines')], ['best', t('game_best')],
  ]);
  hud.best(GameKit.getBest('blocks'));

  const wrap = GameKit.el('div', 'blocks-wrap');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const cv = GameKit.el('canvas', 'blocks-canvas');
  cv.width = W * dpr; cv.height = H * dpr;
  const side = GameKit.el('div', 'blocks-side');
  const nextCv = GameKit.el('canvas');
  nextCv.width = 84 * dpr; nextCv.height = 84 * dpr;
  side.appendChild(nextCv);
  side.appendChild(GameKit.el('small', null, 'NEXT'));
  wrap.appendChild(cv); wrap.appendChild(side);
  stage.appendChild(wrap);

  const g = cv.getContext('2d'); g.scale(dpr, dpr);
  const gn = nextCv.getContext('2d'); gn.scale(dpr, dpr);

  function spawn() {
    const s = nextPiece || SHAPES[Math.floor(Math.random() * SHAPES.length)];
    nextPiece = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    piece = { cells: s.cells.map(c => c.slice()), c: s.c, x: 3, y: -1 };
    drawNext();
    if (collide(piece.x, piece.y)) return die();
  }

  function collide(px, py, cells) {
    return (cells || piece.cells).some(([cx, cy]) => {
      const x = px + cx, y = py + cy;
      if (x < 0 || x >= COLS || y >= ROWS) return true;
      return y >= 0 && grid[y][x];
    });
  }

  function rotate() {
    const rot = piece.cells.map(([x, y]) => [y, -x]);
    const maxY = Math.max(...rot.map(c => c[1]));
    const off = maxY < 0 ? -maxY : 0;
    if (!collide(piece.x, piece.y + off, rot)) piece.cells = rot.map(([x, y]) => [x, y + off]);
    else if (!collide(piece.x + 1, piece.y, rot)) { piece.cells = rot; piece.x++; }
    draw();
  }

  function step() {
    if (!collide(piece.x, piece.y + 1)) { piece.y++; draw(); return; }
    // lock
    piece.cells.forEach(([cx, cy]) => {
      const y = piece.y + cy, x = piece.x + cx;
      if (y >= 0) grid[y][x] = piece.c;
    });
    // clear rows
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (grid[y].every(Boolean)) { grid.splice(y, 1); grid.unshift(new Array(COLS).fill(null)); cleared++; y++; }
    }
    if (cleared) {
      lines += cleared;
      score += [0, 100, 300, 500, 800][cleared];
      hud.lines(lines); hud.score(score);
      schedule(); // re-arm the gravity interval so speed-up takes effect
    }
    spawn();
    draw();
  }

  function move(dx) {
    if (!collide(piece.x + dx, piece.y)) { piece.x += dx; draw(); }
  }
  function drop() { while (!collide(piece.x, piece.y + 1)) piece.y++; step(); }

  function draw() {
    g.fillStyle = '#10162b';
    g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(148,163,184,.07)';
    for (let i = 1; i < COLS; i++) { g.beginPath(); g.moveTo(i * CELL, 0); g.lineTo(i * CELL, H); g.stroke(); }
    for (let i = 1; i < ROWS; i++) { g.beginPath(); g.moveTo(0, i * CELL); g.lineTo(W, i * CELL); g.stroke(); }
    const block = (x, y, color) => {
      g.fillStyle = color;
      g.beginPath();
      g.roundRect ? g.roundRect(x + 1, y + 1, CELL - 2, CELL - 2, 3) : g.rect(x + 1, y + 1, CELL - 2, CELL - 2);
      g.fill();
    };
    grid.forEach((row, y) => row.forEach((c, x) => { if (c) block(x * CELL, y * CELL, c); }));
    piece && piece.cells.forEach(([cx, cy]) => {
      const y = piece.y + cy;
      if (y >= 0) block((piece.x + cx) * CELL, y * CELL, piece.c);
    });
  }

  function drawNext() {
    gn.clearRect(0, 0, 84, 84);
    if (!nextPiece) return;
    const cs = nextPiece.cells;
    const xs = cs.map(c => c[0]), ys = cs.map(c => c[1]);
    const ox = (84 - (Math.max(...xs) + 1) * 16) / 2, oy = (84 - (Math.max(...ys) + 1) * 16) / 2;
    gn.fillStyle = nextPiece.c;
    cs.forEach(([x, y]) => gn.fillRect(ox + x * 16 + 1, oy + y * 16 + 1, 14, 14));
  }

  function schedule() {
    if (timer) clearInterval(timer);
    timer = setInterval(step, Math.max(140, 620 - Math.floor(lines / 5) * 60));
  }

  function start() {
    grid = Array.from({ length: ROWS }, () => new Array(COLS).fill(null));
    score = 0; lines = 0; over = false; nextPiece = null;
    hud.score(0); hud.lines(0);
    spawn(); draw(); schedule();
  }

  function die() {
    over = true;
    if (timer) clearInterval(timer);
    const r = GameKit.submit('blocks', score, true);
    hud.best(GameKit.getBest('blocks'));
    GameKit.overlay(stage, {
      title: t('game_over'),
      stats: [[t('game_score'), score], [t('game_lines'), lines], [t('game_best'), r.value]],
      msg: r.isBest ? t('game_newbest') : '',
      btnLabel: t('game_again'),
      onBtn: () => { ov.remove(); start(); },
    });
    const ov = stage.querySelector('.g-overlay');
  }

  const rmKeys = GameKit.keys((dir, e) => {
    if (over || !piece) return;
    if (dir === 'left') move(-1);
    else if (dir === 'right') move(1);
    else if (dir === 'down') step();
    else if (dir === 'up') rotate();
    else if (dir === 'space') drop();
  });
  GameKit.dpad(stage, dir => {
    if (over || !piece) return;
    if (dir === 'left') move(-1);
    else if (dir === 'right') move(1);
    else if (dir === 'down') step();
    else if (dir === 'up') rotate();
    else if (dir === 'rot') rotate();
  }, { rotate: true });

  start();
  return { destroy() { rmKeys(); if (timer) clearInterval(timer); } };
};
