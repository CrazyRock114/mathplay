/* Angle Shooter — projectile angle estimation, original implementation */
GameFactories.angles = function (stage, ctx) {
  const t = ctx.t;
  const W = 440, H = 280, G = 0.16, POWER = 8; // POWER tuned so every target (x 220–410) is reachable
  let angle = 45, shots, hits, target, flying = false, trail = [], over = false;
  const timers = [];

  const hud = GameKit.hud(stage, [
    ['hits', t('game_score')], ['shots', '🎯'], ['best', t('game_best')],
  ]);
  hud.best(GameKit.getBest('angles'));

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const cv = GameKit.el('canvas', 'snake-canvas angles-canvas');
  cv.width = W * dpr; cv.height = H * dpr;
  const g = cv.getContext('2d');
  g.scale(dpr, dpr);
  stage.appendChild(cv);

  const ctrl = GameKit.el('div', 'angles-ctrl');
  const slider = GameKit.el('input');
  slider.type = 'range'; slider.min = 10; slider.max = 80; slider.value = angle;
  const readout = GameKit.el('span', 'angles-readout', angle + '°');
  const fireBtn = GameKit.el('button', 'g-btn primary', '🔥 ' + t('g_angles_t'));
  ctrl.appendChild(slider); ctrl.appendChild(readout); ctrl.appendChild(fireBtn);
  stage.appendChild(ctrl);

  const CX = 34, CY = H - 26;

  function newTarget() {
    target = { x: 220 + Math.random() * 190, r: 22 };
  }

  function traj(ang) { // simulate until below ground or past wall
    const rad = ang * Math.PI / 180;
    const pts = [];
    let x = CX, y = CY, vx = Math.cos(rad) * POWER, vy = -Math.sin(rad) * POWER;
    for (let i = 0; i < 400; i++) {
      x += vx; y += vy; vy += G;
      if (y > CY) { pts.push([x, CY]); break; }
      pts.push([x, y]);
      if (x > W + 40) break;
    }
    return pts;
  }

  function fire() {
    if (flying || over) return;
    flying = true;
    shots++;
    hud.shots(shots);
    const pts = traj(angle);
    trail = [];
    let i = 0;
    const iv = setInterval(() => {
      const step = 3;
      for (let k = 0; k < step && i < pts.length; k++, i++) trail.push(pts[i]);
      const [hx, hy] = trail[trail.length - 1];
      if (Math.hypot(hx - target.x, hy - (H - 26 + 10)) < target.r + 8 ||
          (hy > H - 34 && Math.abs(hx - target.x) < target.r + 10)) {
        clearInterval(iv); hit(); return;
      }
      if (i >= pts.length || hx > W) { clearInterval(iv); miss(); return; }
      draw(hx, hy);
    }, 16);
    timers.push(iv);
  }

  function hit() {
    flying = false;
    hits++;
    hud.hits(hits);
    GameKit.submit('angles', hits, true);
    hud.best(GameKit.getBest('angles'));
    target.r = Math.max(12, target.r - 1.5);
    newTarget();
    draw();
  }

  function miss() {
    flying = false;
    draw();
  }

  function draw(bx, by) {
    g.fillStyle = '#0f172a';
    g.fillRect(0, 0, W, H);
    // ground
    g.fillStyle = '#1c2942';
    g.fillRect(0, CY, W, H - CY);
    g.strokeStyle = 'rgba(148,163,184,.35)';
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, CY); g.lineTo(W, CY); g.stroke();
    // target (balloon on pole)
    g.strokeStyle = 'rgba(255,255,255,.5)';
    g.beginPath(); g.moveTo(target.x, CY); g.lineTo(target.x, CY - 34); g.stroke();
    g.fillStyle = '#ff4b57';
    g.beginPath(); g.arc(target.x, CY - 44, target.r, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,.85)';
    g.beginPath(); g.arc(target.x - 6, CY - 50, 4, 0, Math.PI * 2); g.fill();
    // trail
    trail.forEach(([x, y], i) => {
      if (i % 2) return;
      g.fillStyle = 'rgba(255,255,255,.35)';
      g.fillRect(x - 1.5, y - 1.5, 3, 3);
    });
    // cannon
    const rad = angle * Math.PI / 180;
    g.save();
    g.translate(CX, CY);
    g.rotate(-rad);
    g.fillStyle = '#ffd166';
    g.fillRect(0, -5, 34, 10);
    g.restore();
    g.fillStyle = '#5f6b7a';
    g.beginPath(); g.arc(CX, CY, 12, Math.PI, 0); g.fill();
    // angle arc
    g.strokeStyle = 'rgba(255,209,102,.7)';
    g.beginPath(); g.arc(CX, CY, 22, -rad, 0); g.stroke();
    // flying ball
    if (bx != null) {
      g.fillStyle = '#38ef7d';
      g.beginPath(); g.arc(bx, by, 6, 0, Math.PI * 2); g.fill();
    }
  }

  function start() {
    shots = 0; hits = 0; trail = []; over = false; flying = false;
    hud.hits(0); hud.shots(0);
    newTarget();
    draw();
  }

  slider.oninput = () => { angle = +slider.value; readout.textContent = angle + '°'; if (!flying) draw(); };
  fireBtn.onclick = fire;
  const rmKeys = GameKit.keys(dir => {
    if (dir === 'space') fire();
    if (dir === 'left') { angle = Math.max(10, angle - 1); slider.value = angle; readout.textContent = angle + '°'; if (!flying) draw(); }
    if (dir === 'right') { angle = Math.min(80, angle + 1); slider.value = angle; readout.textContent = angle + '°'; if (!flying) draw(); }
  });

  start();
  return { destroy() { rmKeys(); timers.forEach(clearInterval); } };
};
