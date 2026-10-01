/* Neon Snake — original canvas implementation */
GameFactories.snake = function (stage, ctx) {
  const t = ctx.t;
  const COLS = 21, ROWS = 21, CELL = 18, W = COLS * CELL, H = ROWS * CELL;
  let snake, dir, pendingDir, food, score, alive, speed, timer = null;
  const timers = [];

  const hud = GameKit.hud(stage, [['score', t('game_score')], ['best', t('game_best')]]);
  hud.best(GameKit.getBest('snake'));

  const wrap = GameKit.el('div', 'snake-wrap');
  const cv = GameKit.el('canvas', 'snake-canvas');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = W * dpr; cv.height = H * dpr;
  const g = cv.getContext('2d');
  g.scale(dpr, dpr);
  wrap.appendChild(cv);
  stage.appendChild(wrap);

  function start() {
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    dir = { x: 1, y: 0 }; pendingDir = null;
    score = 0; alive = true; speed = 150;
    placeFood();
    hud.score(0);
    schedule();
  }

  function schedule() {
    if (timer) clearInterval(timer);
    timer = setInterval(tick, speed);
  }

  function placeFood() {
    do { food = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
    while (snake.some(s => s.x === food.x && s.y === food.y));
  }

  function tick() {
    if (!alive) return;
    if (pendingDir) { dir = pendingDir; pendingDir = null; }
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS ||
        snake.some(s => s.x === head.x && s.y === head.y)) return die();
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score++;
      hud.score(score);
      if (score % 5 === 0 && speed > 70) { speed -= 12; schedule(); }
      placeFood();
    } else snake.pop();
    draw();
  }

  function die() {
    alive = false;
    draw();
    const r = GameKit.submit('snake', score, true);
    hud.best(GameKit.getBest('snake'));
    GameKit.overlay(stage, {
      title: t('game_over'),
      stats: [[t('game_score'), score], [t('game_best'), r.value]],
      msg: r.isBest ? t('game_newbest') : '',
      btnLabel: t('game_again'),
      onBtn: () => { ov.remove(); start(); },
    });
    const ov = stage.querySelector('.g-overlay');
  }

  function draw() {
    g.fillStyle = '#0f172a';
    g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(148,163,184,.08)';
    g.lineWidth = 1;
    for (let i = 1; i < COLS; i++) { g.beginPath(); g.moveTo(i * CELL, 0); g.lineTo(i * CELL, H); g.stroke(); }
    for (let i = 1; i < ROWS; i++) { g.beginPath(); g.moveTo(0, i * CELL); g.lineTo(W, i * CELL); g.stroke(); }
    // food
    g.save();
    g.shadowColor = '#38ef7d'; g.shadowBlur = 10;
    g.fillStyle = '#38ef7d';
    g.beginPath();
    g.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL * 0.32, 0, Math.PI * 2);
    g.fill();
    g.restore();
    // snake
    snake.forEach((s, i) => {
      const pad = i === 0 ? 1.5 : 2.5;
      g.fillStyle = i === 0 ? '#a7f3d0' : 'hsl(' + (160 + i * 3) + ',70%,' + Math.max(40, 62 - i * 1.2) + '%)';
      const r = 5;
      const x = s.x * CELL + pad, y = s.y * CELL + pad, w = CELL - pad * 2;
      g.beginPath();
      g.roundRect ? g.roundRect(x, y, w, w, r) : g.rect(x, y, w, w);
      g.fill();
    });
    // eyes
    const h = snake[0];
    g.fillStyle = '#0f172a';
    const ex = h.x * CELL + CELL / 2, ey = h.y * CELL + CELL / 2;
    g.beginPath(); g.arc(ex - 3 + dir.x * 3, ey - 3 + dir.y * 3, 1.6, 0, 7); g.fill();
    g.beginPath(); g.arc(ex + 3 + dir.x * 3, ey + 3 + dir.y * 3, 1.6, 0, 7); g.fill();
  }

  function turn(name) {
    const dirs = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
    const nd = dirs[name];
    if (!nd || !alive) return;
    if (nd.x === -dir.x && nd.y === -dir.y) return; // no 180° turns
    pendingDir = nd;
  }

  const rmKeys = GameKit.keys(d => turn(d));
  GameKit.swipe(cv, d => turn(d));
  GameKit.dpad(stage, d => turn(d));

  start();
  return { destroy() { rmKeys(); if (timer) clearInterval(timer); } };
};
