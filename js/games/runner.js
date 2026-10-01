/* Number Runner — pick the correct-answer gate, original implementation */
GameFactories.runner = function (stage, ctx) {
  const t = ctx.t;
  const W = 420, H = 300, LANES = 3, LANE_H = H / LANES;
  let lane = 1, score, level, gates, over, dist, tick = null;

  const hud = GameKit.hud(stage, [['score', t('game_score')], ['level', t('game_level')], ['best', t('game_best')]]);
  hud.best(GameKit.getBest('runner'));

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const cv = GameKit.el('canvas', 'snake-canvas runner-canvas');
  cv.width = W * dpr; cv.height = H * dpr;
  stage.appendChild(cv);
  const g = cv.getContext('2d');
  g.scale(dpr, dpr);

  const GATE_GAP = 260, GATE_W = 64;

  function makeGate(level, x) {
    const correct = Math.floor(Math.random() * LANES);
    let a, b, ans, text;
    if (level < 3) { a = 1 + Math.floor(Math.random() * 15); b = 1 + Math.floor(Math.random() * 15); ans = a + b; text = a + '+' + b; }
    else if (level < 5) { a = 2 + Math.floor(Math.random() * 10); b = 2 + Math.floor(Math.random() * 10); ans = a * b; text = a + '×' + b; }
    else { // subtraction: b < a - 5 keeps ans >= 6 so distractors always exist
      a = 25 + Math.floor(Math.random() * 35);
      b = Math.floor(Math.random() * (a - 5));
      ans = a - b; text = a + '−' + b;
    }
    const wrongs = new Set();
    let guard = 80;
    while (wrongs.size < LANES - 1 && guard-- > 0) {
      const d = ans + Math.floor(Math.random() * 11) - 5;
      if (d !== ans && d >= 0) wrongs.add(d);
    }
    let k = 1;
    while (wrongs.size < LANES - 1) wrongs.add(ans + k++);
    const wArr = [...wrongs];
    const values = [];
    let wi = 0;
    for (let i = 0; i < LANES; i++) values.push(i === correct ? ans : wArr[wi++]);
    return { x, correct, values, text, hit: false };
  }
  GameFactories.runner._test = { makeGate };

  function draw() {
    g.fillStyle = '#10162b';
    g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(148,163,184,.25)';
    g.lineWidth = 2;
    for (let i = 1; i < LANES; i++) {
      g.beginPath(); g.moveTo(0, i * LANE_H); g.lineTo(W, i * LANE_H); g.stroke();
    }
    gates.forEach(gate => {
      gate.values.forEach((v, i) => {
        const y = i * LANE_H + 6, h = LANE_H - 12;
        const isCorrect = i === gate.correct;
        g.fillStyle = gate.hit && isCorrect ? 'rgba(29,209,161,.9)' : 'rgba(255,255,255,.14)';
        g.strokeStyle = gate.hit && isCorrect ? '#1dd1a1' : 'rgba(255,255,255,.5)';
        g.lineWidth = 2;
        g.beginPath();
        g.roundRect ? g.roundRect(gate.x, y, GATE_W, h, 10) : g.rect(gate.x, y, GATE_W, h);
        g.fill(); g.stroke();
        g.fillStyle = '#fff';
        g.font = '800 17px -apple-system,Segoe UI,sans-serif';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(v, gate.x + GATE_W / 2, y + h / 2);
      });
      g.fillStyle = 'rgba(255,255,255,.85)';
      g.font = '800 15px -apple-system,Segoe UI,sans-serif';
      g.fillText(gate.text, gate.x + GATE_W / 2, 12);
    });
    // player
    const py = lane * LANE_H + LANE_H / 2;
    g.save();
    g.shadowColor = '#ff4b57'; g.shadowBlur = 12;
    g.fillStyle = '#ff4b57';
    g.beginPath(); g.arc(48, py, 13, 0, Math.PI * 2); g.fill();
    g.restore();
    g.fillStyle = '#fff';
    g.beginPath(); g.arc(48, py - 3, 3, 0, Math.PI * 2); g.fill();
  }

  function loop() {
    if (over) return;
    const v = 2 + level * 0.55;
    gates.forEach(gate => { gate.x -= v; });
    dist += v;
    if (dist > GATE_GAP) {
      dist = 0;
      gates.push(makeGate(level, W + 30));
    }
    gates = gates.filter(gate => gate.x > -GATE_W - 10);
    // collision
    for (const gate of gates) {
      if (!gate.hit && gate.x <= 48 + 13 && gate.x + GATE_W >= 48 - 13) {
        gate.hit = true;
        if (gate.correct === lane) {
          score++;
          hud.score(score);
          const newLevel = 1 + Math.floor(score / 4);
          if (newLevel !== level) { level = newLevel; hud.level(level); }
        } else return crash();
      }
    }
    draw();
  }

  function crash() {
    over = true;
    draw();
    const r = GameKit.submit('runner', score, true);
    hud.best(GameKit.getBest('runner'));
    GameKit.overlay(stage, {
      title: t('game_over'),
      stats: [[t('game_score'), score], [t('game_level'), level], [t('game_best'), r.value]],
      msg: r.isBest ? t('game_newbest') : '',
      btnLabel: t('game_again'),
      onBtn: () => { ov.remove(); start(); },
    });
    const ov = stage.querySelector('.g-overlay');
  }

  function setLane(l) { if (!over) lane = Math.max(0, Math.min(LANES - 1, l)); }

  function start() {
    score = 0; level = 1; gates = []; dist = 0; over = false;
    hud.score(0); hud.level(1);
    gates.push(makeGate(level, W));
    draw();
  }

  const rmKeys = GameKit.keys(dir => {
    if (dir === 'up') setLane(lane - 1);
    if (dir === 'down') setLane(lane + 1);
  });
  cv.addEventListener('pointerdown', e => {
    const rect = cv.getBoundingClientRect();
    const y = (e.clientY - rect.top) * (H / rect.height);
    setLane(Math.floor(y / LANE_H));
  });

  start();
  tick = setInterval(loop, 1000 / 60);
  return { destroy() { rmKeys(); if (tick) clearInterval(tick); } };
};
