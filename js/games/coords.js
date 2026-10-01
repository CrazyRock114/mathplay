/* Coordinate Hunt — grid coordinate practice, original implementation */
GameFactories.coords = function (stage, ctx) {
  const t = ctx.t;
  const N = 6, GEMS = 5, TRIES = 8;
  let gemCells, gems, tries, clue, found, done;

  const hud = GameKit.hud(stage, [
    ['gems', '💎'], ['tries', '👣'], ['best', t('game_best')],
  ]);

  const clueEl = GameKit.el('div', 'coords-clue');
  const gridEl = GameKit.el('div', 'coords-grid');
  stage.appendChild(clueEl);
  stage.appendChild(gridEl);

  // column labels row handled via CSS grid: first cell empty
  const cells = [];
  gridEl.appendChild(GameKit.el('div', 'coords-head'));
  for (let x = 0; x < N; x++) gridEl.appendChild(GameKit.el('div', 'coords-head', x + 1));
  for (let y = 0; y < N; y++) {
    gridEl.appendChild(GameKit.el('div', 'coords-head', y + 1));
    for (let x = 0; x < N; x++) {
      const c = GameKit.el('button', 'coords-cell');
      c.dataset.x = x; c.dataset.y = y;
      c.onclick = () => dig(x, y, c);
      gridEl.appendChild(c);
      cells.push(c);
    }
  }

  function newClue() {
    const remaining = gemCells.filter(g => !found.includes(g)); // global indices, actually-found excluded
    const idx = remaining[Math.floor(Math.random() * remaining.length)];
    clue = idx;
    clueEl.innerHTML = '🎯 ( <b>' + ((idx % N) + 1) + '</b> , <b>' + (Math.floor(idx / N) + 1) + '</b> )';
  }

  function dig(x, y, cell) {
    if (done) return;
    const i = y * N + x;
    if (cell.classList.contains('open')) return;
    if (i === clue) {
      cell.classList.add('gem');
      cell.textContent = '💎';
      found.push(i);
      gems++;
      hud.gems(gems);
      if (gems >= GEMS) return win();
      newClue();
    } else {
      cell.classList.add('miss');
      cell.textContent = '·';
      tries--;
      hud.tries(tries);
      if (tries <= 0) return lose();
    }
    cell.classList.add('open');
  }

  function start() {
    gemCells = [];
    const pool = [...Array(N * N).keys()];
    for (let i = 0; i < GEMS; i++) {
      const pick = Math.floor(Math.random() * pool.length);
      gemCells.push(pool[pick]);
      pool.splice(pick, 1);
    }
    gems = 0; tries = TRIES; found = []; done = false;
    hud.gems(0); hud.tries(TRIES);
    hud.best(GameKit.getBest('coords'));
    cells.forEach(c => { c.className = 'coords-cell'; c.textContent = ''; });
    newClue();
  }

  function win() {
    done = true;
    const r = GameKit.submit('coords', gems, true);
    hud.best(GameKit.getBest('coords'));
    stage.classList.add('win-bg');
    GameKit.overlay(stage, {
      title: t('game_win'),
      stats: [['💎', gems], [t('game_best'), r.value]],
      msg: r.isBest ? t('game_newbest') : '',
      btnLabel: t('game_again'),
      onBtn: () => { stage.classList.remove('win-bg'); ov.remove(); start(); },
    });
    const ov = stage.querySelector('.g-overlay');
  }

  function lose() {
    done = true;
    gemCells.forEach((i, k) => {
      if (!found.includes(i)) {
        cells[i].classList.add('gem');
        cells[i].textContent = '💎';
      }
    });
    GameKit.overlay(stage, {
      title: t('game_over'),
      stats: [['💎', gems + '/5']],
      btnLabel: t('game_again'),
      onBtn: () => { ov.remove(); start(); },
    });
    const ov = stage.querySelector('.g-overlay');
  }

  start();
  return { destroy() {} };
};
