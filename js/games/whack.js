/* Dot Whack — 30-second reflex arcade, original implementation */
GameFactories.whack = function (stage, ctx) {
  const t = ctx.t;
  const TOTAL = 30;
  let score, left, sec, upTimer = null, clockTimer = null, active = -1;

  const hud = GameKit.hud(stage, [['score', t('game_score')], ['time', t('game_time')], ['best', t('game_best')]]);
  const fmtBest = () => hud.best(GameKit.getBest('whack'));

  const grid = GameKit.el('div', 'whack-grid');
  stage.appendChild(grid);
  const holes = [];
  for (let i = 0; i < 9; i++) {
    const h = GameKit.el('div', 'whack-hole', '<div class="whack-dot"></div>');
    h.onclick = () => hit(i);
    grid.appendChild(h);
    holes.push(h);
  }
  const dots = holes.map(h => h.querySelector('.whack-dot'));

  function popTime() { return Math.max(450, 950 - sec * 17); }
  function spawnEvery() { return Math.max(330, 640 - sec * 10); }

  function pop() {
    if (active >= 0) dots[active].classList.remove('up');
    const free = holes.map((_, i) => i).filter(i => i !== active);
    const pick = free[Math.floor(Math.random() * free.length)];
    active = pick;
    dots[pick].classList.add('up');
    upTimer = setTimeout(pop, popTime() + spawnEvery());
  }

  function hit(i) {
    if (i !== active || !dots[i].classList.contains('up')) return;
    dots[i].classList.remove('up');
    active = -1;
    score++;
    hud.score(score);
  }

  function tick() {
    sec++;
    left = TOTAL - sec;
    hud.time(GameKit.fmtTime(left));
    if (left <= 0) end();
  }

  function start() {
    clearTimeout(upTimer); clearInterval(clockTimer);
    score = 0; sec = 0; left = TOTAL; active = -1;
    dots.forEach(d => d.classList.remove('up'));
    hud.score(0); hud.time(GameKit.fmtTime(TOTAL)); fmtBest();
    clockTimer = setInterval(tick, 1000);
    upTimer = setTimeout(pop, 500);
  }

  function end() {
    clearTimeout(upTimer); clearInterval(clockTimer);
    dots.forEach(d => d.classList.remove('up'));
    const r = GameKit.submit('whack', score, true);
    fmtBest();
    GameKit.overlay(stage, {
      title: t('game_over'),
      stats: [[t('game_score'), score], [t('game_best'), r.value]],
      msg: r.isBest ? t('game_newbest') : '',
      btnLabel: t('game_again'),
      onBtn: () => { ov.remove(); start(); },
    });
    const ov = stage.querySelector('.g-overlay');
  }

  start();
  return { destroy() { clearTimeout(upTimer); clearInterval(clockTimer); } };
};
