/* Memory Match — original card-matching implementation */
GameFactories.memory = function (stage, ctx) {
  const t = ctx.t;
  const EMOJI = ['🐶', '🐱', '🦊', '🐼', '🦁', '🐸', '🐵', '🦄'];
  let deck, first, lock, moves, matched, sec, timer = null, started = false;

  const hud = GameKit.hud(stage, [
    ['moves', t('game_moves')],
    ['time', t('game_time')],
    ['best', t('game_best')],
  ]);

  const grid = GameKit.el('div', 'mem-grid');
  stage.appendChild(grid);

  function fmtBest() {
    const b = GameKit.getBest('memory');
    hud.best(b ? b + ' ' + t('game_moves').toLowerCase() : '—');
  }

  function start() {
    if (timer) { clearInterval(timer); timer = null; }
    started = false; first = null; lock = false;
    moves = 0; matched = 0; sec = 0;
    hud.moves(0); hud.time('0:00');
    fmtBest();
    deck = EMOJI.concat(EMOJI).map(e => ({ e, id: Math.random() }))
      .sort((a, b) => a.id - b.id);
    grid.innerHTML = '';
    deck.forEach((card, idx) => {
      const c = GameKit.el('div', 'mem-card');
      c.innerHTML = '<div class="mem-inner"><div class="mem-face mem-back"></div>' +
        '<div class="mem-face mem-front">' + card.e + '</div></div>';
      c.onclick = () => flip(c, card.e);
      grid.appendChild(c);
    });
  }

  function startTimer() {
    started = true;
    timer = setInterval(() => { sec++; hud.time(GameKit.fmtTime(sec)); }, 1000);
  }

  function flip(card, emoji) {
    if (lock || card.classList.contains('flipped')) return;
    if (!started) startTimer();
    card.classList.add('flipped');
    if (!first) { first = { card, emoji }; return; }
    moves++;
    hud.moves(moves);
    if (first.emoji === emoji) {
      first.card.classList.add('matched');
      card.classList.add('matched');
      first = null;
      matched++;
      if (matched === EMOJI.length) win();
    } else {
      lock = true;
      const a = first.card; first = null;
      setTimeout(() => { a.classList.remove('flipped'); card.classList.remove('flipped'); lock = false; }, 700);
    }
  }

  function win() {
    clearInterval(timer); timer = null;
    const r = GameKit.submit('memory', moves, false);
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

  start();
  return { destroy() { if (timer) clearInterval(timer); } };
};
