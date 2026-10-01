/* Quick Reflex — reaction-time test, original implementation */
GameFactories.reaction = function (stage, ctx) {
  const t = ctx.t;
  const ROUNDS = 5;
  let state, times, shownAt, goTimer = null, armTimer = null, penalty;

  const hud = GameKit.hud(stage, [['round', t('game_round')], ['avg', t('game_avg')], ['best', t('game_best')]]);

  const panel = GameKit.el('div', 'react-panel idle', t('game_tapstart'));
  const timesRow = GameKit.el('div', 'react-times');
  stage.appendChild(panel);
  stage.appendChild(timesRow);

  const fmtAvg = () => {
    if (!times.length) { hud.avg('—'); return; }
    hud.avg(Math.round(times.reduce((a, b) => a + b, 0) / times.length) + ' ms');
  };
  const fmtBest = () => { const b = GameKit.getBest('reaction'); hud.best(b ? b + ' ms' : '—'); };
  fmtBest();

  function renderTimes() {
    timesRow.innerHTML = '';
    times.forEach((ms, i) => timesRow.appendChild(GameKit.el('div', 'g-chip', (i + 1) + ': <b>' + ms + ' ms</b>')));
  }

  function idle() {
    state = 'idle';
    panel.className = 'react-panel idle';
    panel.textContent = t('game_tapstart');
  }

  function arm(keepPenalty) {
    state = 'wait';
    if (!keepPenalty) penalty = false;
    panel.className = 'react-panel wait';
    panel.textContent = t('game_ready');
    goTimer = setTimeout(() => {
      state = 'go';
      shownAt = performance.now();
      panel.className = 'react-panel go';
      panel.textContent = '👆';
    }, 1200 + Math.random() * 2400);
  }

  function click() {
    if (state === 'idle') { times = []; renderTimes(); hud.round('1/' + ROUNDS); arm(); return; }
    if (state === 'wait') {
      penalty = true;
      clearTimeout(goTimer);
      panel.textContent = t('game_tooearly');
      state = 'penalty';
      armTimer = setTimeout(() => arm(true), 1100);
      return;
    }
    if (state === 'go') {
      let ms = Math.round(performance.now() - shownAt);
      if (penalty) ms += 500;
      times.push(ms);
      renderTimes(); fmtAvg();
      panel.textContent = ms + ' ms' + (penalty ? ' +500' : '');
      state = 'shown';
      if (times.length >= ROUNDS) return end();
      hud.round((times.length + 1) + '/' + ROUNDS);
      armTimer = setTimeout(arm, 1300);
    }
  }

  function end() {
    state = 'end';
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const r = GameKit.submit('reaction', avg, false);
    fmtBest();
    GameKit.overlay(stage, {
      title: avg + ' ms',
      stats: [[t('game_avg'), avg + ' ms'], [t('game_best'), r.value + ' ms']],
      msg: r.isBest ? t('game_newbest') : '',
      btnLabel: t('game_again'),
      onBtn: () => { ov.remove(); idle(); },
    });
    const ov = stage.querySelector('.g-overlay');
  }

  panel.onclick = click;
  idle();
  return { destroy() { if (goTimer) clearTimeout(goTimer); if (armTimer) clearTimeout(armTimer); } };
};
