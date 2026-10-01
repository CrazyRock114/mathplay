/* Minesweeper — original implementation, 9×9 / 10 mines, first click safe */
GameFactories.minesweeper = function (stage, ctx) {
  const t = ctx.t;
  const W = 9, H = 9, MINES = 10;
  let grid, revealed, flagged, placed, dead, wonFlag, sec, timer = null, flags;

  const hud = GameKit.hud(stage, [
    ['mines', '💣'],
    ['time', t('game_time')],
    ['best', t('game_best')],
  ]);

  const gridEl = GameKit.el('div', 'ms-grid');
  stage.appendChild(gridEl);

  function fmtBest() {
    const b = GameKit.getBest('minesweeper');
    hud.best(b ? GameKit.fmtTime(b) : '—');
  }

  function idx(x, y) { return y * W + x; }
  function neighbors(i) {
    const x = i % W, y = Math.floor(i / W), out = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < W && ny < H) out.push(idx(nx, ny));
    }
    return out;
  }

  function start() {
    if (timer) { clearInterval(timer); timer = null; }
    grid = new Array(W * H).fill(0);
    revealed = new Array(W * H).fill(false);
    flagged = new Array(W * H).fill(false);
    placed = false; dead = false; wonFlag = false; sec = 0; flags = 0;
    hud.mines(MINES); hud.time('0:00'); fmtBest();
    buildDOM();
  }

  function buildDOM() {
    gridEl.innerHTML = '';
    for (let i = 0; i < W * H; i++) {
      const c = GameKit.el('div', 'ms-cell');
      c.onclick = () => reveal(i);
      c.oncontextmenu = e => { e.preventDefault(); toggleFlag(i); };
      let pressT = null;
      c.addEventListener('touchstart', () => { pressT = setTimeout(() => toggleFlag(i), 350); }, { passive: true });
      c.addEventListener('touchend', () => clearTimeout(pressT));
      c.addEventListener('touchmove', () => clearTimeout(pressT));
      gridEl.appendChild(c);
    }
  }

  function placeMines(safe) {
    const banned = new Set([safe, ...neighbors(safe)]);
    let n = 0;
    while (n < MINES) {
      const i = Math.floor(Math.random() * W * H);
      if (banned.has(i) || grid[i] === -1) continue;
      grid[i] = -1; n++;
    }
    for (let i = 0; i < W * H; i++) {
      if (grid[i] === -1) continue;
      grid[i] = neighbors(i).filter(j => grid[j] === -1).length;
    }
  }

  function toggleFlag(i) {
    if (dead || wonFlag || revealed[i]) return;
    flagged[i] = !flagged[i];
    flags += flagged[i] ? 1 : -1;
    hud.mines(MINES - flags);
    paint(i);
  }

  function reveal(i) {
    if (dead || wonFlag || flagged[i] || revealed[i]) return;
    if (!placed) { placeMines(i); placed = true; timer = setInterval(() => { sec++; hud.time(GameKit.fmtTime(sec)); }, 1000); }
    if (grid[i] === -1) return boom(i);
    const stack = [i];
    while (stack.length) {
      const j = stack.pop();
      if (revealed[j] || flagged[j]) continue;
      revealed[j] = true;
      paint(j);
      if (grid[j] === 0) neighbors(j).forEach(k => { if (!revealed[k]) stack.push(k); });
    }
    checkWin();
  }

  function boom(hit) {
    dead = true;
    if (timer) clearInterval(timer);
    for (let i = 0; i < W * H; i++) {
      if (grid[i] === -1) { revealed[i] = true; paint(i); }
    }
    gridEl.children[hit].classList.add('boom');
    GameKit.overlay(stage, {
      title: '💥 ' + t('game_over'),
      stats: [[t('game_time'), GameKit.fmtTime(sec)]],
      btnLabel: t('game_again'),
      onBtn: () => { ov.remove(); start(); },
    });
    const ov = stage.querySelector('.g-overlay');
  }

  function checkWin() {
    const safe = W * H - MINES;
    if (revealed.filter(Boolean).length !== safe) return;
    wonFlag = true;
    if (timer) clearInterval(timer);
    for (let i = 0; i < W * H; i++) if (grid[i] === -1 && !flagged[i]) { flagged[i] = true; paint(i); }
    hud.mines(0);
    const r = GameKit.submit('minesweeper', sec, false);
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

  function paint(i) {
    const c = gridEl.children[i];
    c.textContent = '';
    c.className = 'ms-cell';
    if (flagged[i]) { c.classList.add('flag'); c.textContent = '🚩'; return; }
    if (!revealed[i]) return;
    c.classList.add('revealed');
    if (grid[i] > 0) { c.textContent = grid[i]; c.classList.add('n' + Math.min(8, grid[i])); }
    if (grid[i] === -1) c.textContent = '💣';
  }

  start();
  return { destroy() { if (timer) clearInterval(timer); } };
};
