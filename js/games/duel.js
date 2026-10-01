/* Math Duel — local two-player speed math, original implementation */
GameFactories.duel = function (stage, ctx) {
  const t = ctx.t;
  const TARGET = 10;
  let scores, q, frozen, over;

  const bar = GameKit.el('div', 'duel-score');
  const p1 = GameKit.el('div', 'duel-side p1', '<b>1</b>');
  const mid = GameKit.el('div', 'duel-mid', '<span class="duel-q"></span>');
  const p2 = GameKit.el('div', 'duel-side p2', '<b>2</b>');
  bar.appendChild(p1); bar.appendChild(mid); bar.appendChild(p2);
  stage.appendChild(bar);

  const qEl = mid.querySelector('.duel-q');
  const cols = {};
  ['p1', 'p2'].forEach(pid => {
    const col = GameKit.el('div', 'duel-opts ' + pid);
    stage.appendChild(col);
    cols[pid] = col;
  });

  const rnd = n => Math.floor(Math.random() * n);

  function makeQuestion() {
    const kind = rnd(3);
    let a, b, ans, text;
    if (kind === 0) { a = 5 + rnd(30); b = 5 + rnd(30); ans = a + b; text = a + '+' + b; }
    else if (kind === 1) { a = 20 + rnd(50); b = 5 + rnd(Math.min(20, a - 9)); ans = a - b; text = a + '−' + b; }
    else { a = 3 + rnd(9); b = 3 + rnd(9); ans = a * b; text = a + '×' + b; }
    const set = new Set([ans]);
    while (set.size < 4) {
      const d = ans + (rnd(13) - 6);
      if (d !== ans && d >= 0) set.add(d);
    }
    return { text, ans, opts: [...set].sort(() => Math.random() - 0.5) };
  }

  function render() {
    q = makeQuestion();
    qEl.textContent = q.text;
    ['p1', 'p2'].forEach(pid => {
      const col = cols[pid];
      col.innerHTML = '';
      q.opts.forEach((v, i) => {
        const b = GameKit.el('button', 'duel-opt', v);
        b.onclick = () => pick(pid, v, b);
        col.appendChild(b);
      });
    });
  }

  function pick(pid, v, btn) {
    if (over || frozen[pid]) return;
    if (v === q.ans) {
      scores[pid]++;
      btn.classList.add('ok');
      updateScore();
      qEl.textContent = '✓';
      frozen.p1 = frozen.p2 = true;
      setTimeout(() => {
        frozen.p1 = frozen.p2 = false;
        if (scores[pid] >= TARGET) return finish(pid);
        render();
      }, 550);
    } else {
      btn.classList.add('bad');
      frozen[pid] = true;
      setTimeout(() => { frozen[pid] = false; btn.classList.remove('bad'); }, 1000);
    }
  }

  function updateScore() {
    p1.querySelector('b').textContent = scores.p1;
    p2.querySelector('b').textContent = scores.p2;
  }

  function finish(winner) {
    over = true;
    const winName = winner === 'p1' ? t('players_p1') : t('players_p2');
    stage.classList.add('win-bg');
    GameKit.overlay(stage, {
      title: '🏆 ' + winName + ' ' + t('game_win'),
      stats: [[t('players_p1'), scores.p1], [t('players_p2'), scores.p2]],
      btnLabel: t('game_again'),
      onBtn: () => { stage.classList.remove('win-bg'); ov.remove(); start(); },
    });
    const ov = stage.querySelector('.g-overlay');
  }

  function start() {
    scores = { p1: 0, p2: 0 };
    frozen = { p1: false, p2: false };
    over = false;
    updateScore();
    render();
  }

  const KEYMAP = { '1': ['p1', 0], '2': ['p1', 1], '3': ['p1', 2], '4': ['p1', 3], '7': ['p2', 0], '8': ['p2', 1], '9': ['p2', 2], '0': ['p2', 3] };
  const onKey = e => {
    const m = KEYMAP[e.key];
    if (!m || over || frozen[m[0]]) return;
    const btn = cols[m[0]].children[m[1]];
    if (btn) pick(m[0], +btn.textContent, btn);
  };
  window.addEventListener('keydown', onKey);

  start();
  return { destroy() { window.removeEventListener('keydown', onKey); } };
};
