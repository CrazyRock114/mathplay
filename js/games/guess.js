/* Guess the Number — original implementation */
GameFactories.guess = function (stage, ctx) {
  const t = ctx.t;
  const MAX = 100;
  let secret, tries, lo, hi, done;

  const hud = GameKit.hud(stage, [['tries', t('game_round')], ['best', t('game_best')]]);
  const fmtBest = () => { const b = GameKit.getBest('guess'); hud.best(b ? b : '—'); };
  fmtBest();

  const panel = GameKit.el('div', 'guess-panel');
  const range = GameKit.el('div', 'guess-range');
  const hint = GameKit.el('div', 'guess-hint');
  const row = GameKit.el('div', 'guess-row');
  const input = GameKit.el('input', 'guess-input');
  input.type = 'number'; input.min = 1; input.max = MAX; input.placeholder = '?';
  const btn = GameKit.el('button', 'g-btn primary', t('game_start'));
  row.appendChild(input); row.appendChild(btn);
  panel.appendChild(range); panel.appendChild(hint); panel.appendChild(row);
  stage.appendChild(panel);

  function fmtRange() { range.textContent = lo + ' – ' + hi; }

  function start() {
    secret = 1 + Math.floor(Math.random() * MAX);
    tries = 0; lo = 1; hi = MAX; done = false;
    hud.tries(0);
    hint.className = 'guess-hint';
    hint.textContent = t('game_tapstart');
    btn.textContent = t('g_guess_t');
    fmtRange();
  }

  function guess() {
    if (done) return;
    const v = parseInt(input.value, 10);
    if (!v || v < 1 || v > MAX) { input.focus(); return; }
    input.value = '';
    tries++;
    hud.tries(tries);
    if (v === secret) return win();
    if (v < secret) { lo = Math.max(lo, v + 1); hint.textContent = t('game_higher'); hint.className = 'guess-hint up'; }
    else { hi = Math.min(hi, v - 1); hint.textContent = t('game_lower'); hint.className = 'guess-hint down'; }
    fmtRange();
    input.focus();
  }

  function win() {
    done = true;
    hint.textContent = '🎉 ' + secret;
    hint.className = 'guess-hint hit';
    const r = GameKit.submit('guess', tries, false);
    fmtBest();
    stage.classList.add('win-bg');
    GameKit.overlay(stage, {
      title: secret + ' — ' + t('game_win'),
      stats: [[t('game_round'), tries], [t('game_best'), r.value]],
      msg: r.isBest ? t('game_newbest') : '',
      btnLabel: t('game_again'),
      onBtn: () => { stage.classList.remove('win-bg'); ov.remove(); start(); },
    });
    const ov = stage.querySelector('.g-overlay');
  }

  btn.onclick = guess;
  input.onkeydown = e => { if (e.key === 'Enter') guess(); };
  start();
  return { destroy() {} };
};
