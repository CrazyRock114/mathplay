/* Tic Tac Toe vs computer — original minimax implementation */
GameFactories.tictactoe = function (stage, ctx) {
  const t = ctx.t;
  let cells, turn, over, tally = { x: 0, o: 0, d: 0 };

  const status = GameKit.el('div', 'g-note');
  const grid = GameKit.el('div', 'ttt-grid');
  stage.appendChild(grid);
  stage.appendChild(status);

  const X = '<svg viewBox="0 0 48 48" class="mark" fill="none"><path d="M12 12 36 36M36 12 12 36" stroke-width="7" stroke-linecap="round"/></svg>';
  const O = '<svg viewBox="0 0 48 48" class="mark" fill="none"><circle cx="24" cy="24" r="13" stroke-width="7"/></svg>';

  const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  function winner(b) {
    for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return { p: b[a], line: [a, c, d] };
    return b.every(Boolean) ? { p: 'draw', line: [] } : null;
  }

  function minimax(b, me) {
    const w = winner(b);
    if (w) return { score: w.p === 'O' ? 10 : w.p === 'X' ? -10 : 0 };
    let best = null;
    for (let i = 0; i < 9; i++) {
      if (b[i]) continue;
      b[i] = me;
      const r = minimax(b, me === 'O' ? 'X' : 'O');
      const sc = r.score - Math.sign(r.score) * 0.1; // prefer faster wins
      if (!best || (me === 'O' ? sc > best.score : sc < best.score)) best = { i, score: sc };
      b[i] = null;
    }
    return best;
  }

  function start() {
    cells = new Array(9).fill(null);
    turn = 'X'; over = false;
    status.textContent = t('game_yourturn');
    grid.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const c = GameKit.el('div', 'ttt-cell');
      c.onclick = () => play(i);
      grid.appendChild(c);
    }
  }

  function play(i) {
    if (over || cells[i] || turn !== 'X') return;
    put(i, 'X');
    const w1 = winner(cells);
    if (w1) return finish(w1);
    turn = 'O';
    status.textContent = t('game_thinking');
    setTimeout(() => {
      if (over) return;
      // small chance of a random move so it's beatable
      let mv;
      const empties = cells.map((v, j) => v ? null : j).filter(v => v != null);
      if (Math.random() < 0.15) mv = empties[Math.floor(Math.random() * empties.length)];
      else mv = minimax(cells.slice(), 'O').i;
      put(mv, 'O');
      const w2 = winner(cells);
      if (w2) return finish(w2);
      turn = 'X';
      status.textContent = t('game_yourturn');
    }, 350);
  }

  function put(i, p) {
    cells[i] = p;
    grid.children[i].innerHTML = p === 'X' ? X : O;
    grid.children[i].classList.add(p.toLowerCase());
  }

  function finish(w) {
    over = true;
    w.line.forEach(i => grid.children[i].classList.add('win'));
    if (w.p === 'X') { tally.x++; status.textContent = t('game_win'); stage.classList.add('win-bg'); }
    else if (w.p === 'O') { tally.o++; status.textContent = t('game_cpuwin'); }
    else { tally.d++; status.textContent = t('game_draw'); }
    GameKit.overlay(stage, {
      title: w.p === 'X' ? t('game_win') : w.p === 'O' ? t('game_cpuwin') : t('game_draw'),
      stats: [['X', tally.x], ['O', tally.o], ['—', tally.d]],
      btnLabel: t('game_again'),
      onBtn: () => { stage.classList.remove('win-bg'); ov.remove(); start(); },
    });
    const ov = stage.querySelector('.g-overlay');
  }

  start();
  return { destroy() {} };
};
