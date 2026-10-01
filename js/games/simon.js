/* Color Echo — sequence memory with pads, original implementation */
GameFactories.simon = function (stage, ctx) {
  const t = ctx.t;
  const COLORS = ['#ff5b5b', '#2ecc71', '#4aa3ff', '#ffd166'];
  const TONES = [329.63, 392.0, 261.63, 220.0];
  let seq = [], pos = 0, level = 0, playing = false, inputOn = false, audio = null;
  const timers = [];

  const hud = GameKit.hud(stage, [['level', t('game_level')], ['best', t('game_best')]]);
  hud.best(GameKit.getBest('simon'));

  const wrap = GameKit.el('div', 'simon-wrap');
  const pads = COLORS.map((c, i) => {
    const p = GameKit.el('div', 'simon-pad');
    p.style.background = c;
    p.style.color = c;
    p.onclick = () => press(i);
    wrap.appendChild(p);
    return p;
  });
  const center = GameKit.el('div', 'simon-center', '<b>—</b><small></small>');
  wrap.appendChild(center);
  stage.appendChild(wrap);

  const lvlEl = center.querySelector('b');

  function tone(i, dur) {
    try {
      if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
      const o = audio.createOscillator(), gn = audio.createGain();
      o.frequency.value = TONES[i];
      o.type = 'sine';
      gn.gain.setValueAtTime(0.12, audio.currentTime);
      gn.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + dur);
      o.connect(gn); gn.connect(audio.destination);
      o.start(); o.stop(audio.currentTime + dur);
    } catch (e) { /* audio unavailable — visual only */ }
  }

  function flash(i, dur, cb) {
    pads[i].classList.add('lit');
    tone(i, dur / 1000);
    timers.push(setTimeout(() => { pads[i].classList.remove('lit'); cb && cb(); }, dur));
  }

  function playback() {
    playing = true; inputOn = false;
    // display the current challenge size (steps to repeat), not completed rounds
    lvlEl.textContent = seq.length;
    hud.level(seq.length);
    const dur = Math.max(280, 600 - level * 22);
    seq.forEach((v, k) => {
      timers.push(setTimeout(() => {
        flash(v, dur, k === seq.length - 1 ? () => { playing = false; inputOn = true; pos = 0; } : null);
      }, k * (dur + 140)));
    });
  }

  function press(i) {
    if (!inputOn) return;
    flash(i, 180);
    if (i !== seq[pos]) return over();
    pos++;
    if (pos === seq.length) {
      inputOn = false;
      level++;
      timers.push(setTimeout(next, 650));
    }
  }

  function next() {
    seq.push(Math.floor(Math.random() * 4));
    playback();
  }

  function start() {
    timers.forEach(clearTimeout); timers.length = 0;
    seq = []; level = 0; pos = 0;
    hud.level(0);
    next();
  }

  function over() {
    inputOn = false;
    const r = GameKit.submit('simon', level, true);
    hud.best(GameKit.getBest('simon'));
    GameKit.overlay(stage, {
      title: t('game_over'),
      stats: [[t('game_level'), level], [t('game_best'), r.value]],
      msg: r.isBest ? t('game_newbest') : '',
      btnLabel: t('game_again'),
      onBtn: () => { ov.remove(); start(); },
    });
    const ov = stage.querySelector('.g-overlay');
  }

  // first playback needs a user gesture for audio; start on first tap
  GameKit.overlay(stage, {
    title: t('g_simon_t'),
    msg: t('g_simon_d'),
    btnLabel: t('game_start'),
    onBtn: () => { ov.remove(); start(); },
  });
  const ov = stage.querySelector('.g-overlay');

  return { destroy() { timers.forEach(clearTimeout); if (audio) try { audio.close(); } catch (e) {} } };
};
