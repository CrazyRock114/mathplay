/* Number Typer — digit typing speed, original implementation */
GameFactories.typing = function (stage, ctx) {
  const t = ctx.t;
  const TOTAL = 30;
  let score, sec, target, typed, timer = null, done;

  const hud = GameKit.hud(stage, [['score', t('game_score')], ['best', t('game_best')]]);
  hud.best(GameKit.getBest('typing'));

  const box = GameKit.el('div', 'sm-box type-box');
  const display = GameKit.el('div', 'type-display');
  const hint = GameKit.el('input', 'type-input');
  hint.type = 'text'; hint.inputMode = 'numeric'; hint.autocomplete = 'off';
  box.appendChild(display);
  box.appendChild(hint);
  stage.appendChild(box);

  const rnd = n => Math.floor(Math.random() * n);

  function newTarget() {
    const len = 3 + rnd(3); // 3–5 digits
    target = String(1 + rnd(9));
    for (let i = 1; i < len; i++) target += rnd(10);
    typed = '';
    hint.value = '';
    render();
    hint.focus();
  }

  function render() {
    let html = '';
    for (let i = 0; i < target.length; i++) {
      if (i < typed.length) html += '<span class="ok">' + target[i] + '</span>';
      else if (i === typed.length) html += '<span class="cur">' + target[i] + '</span>';
      else html += '<span>' + target[i] + '</span>';
    }
    display.innerHTML = html;
  }

  function onInput() {
    if (done) return;
    const v = hint.value.replace(/\D/g, '');
    typed = v;
    // mismatch check
    for (let i = 0; i < v.length; i++) {
      if (v[i] !== target[i]) {
        display.classList.add('shake');
        setTimeout(() => display.classList.remove('shake'), 300);
        typed = v.slice(0, i);
        hint.value = typed;
        render();
        return;
      }
    }
    render();
    if (typed.length === target.length) {
      score++;
      hud.score(score);
      GameKit.submit('typing', score, true);
      hud.best(GameKit.getBest('typing'));
      newTarget();
    }
  }

  function tick() {
    sec++;
    if (sec >= TOTAL) end();
  }

  function start() {
    if (timer) clearInterval(timer);
    score = 0; sec = 0; done = false;
    hud.score(0);
    newTarget();
    timer = setInterval(tick, 1000);
  }

  function end() {
    done = true;
    clearInterval(timer); timer = null;
    hint.blur();
    const r = GameKit.submit('typing', score, true);
    hud.best(GameKit.getBest('typing'));
    GameKit.overlay(stage, {
      title: t('game_over'),
      stats: [[t('game_score'), score], [t('game_best'), r.value]],
      msg: r.isBest ? t('game_newbest') : '',
      btnLabel: t('game_again'),
      onBtn: () => { ov.remove(); start(); },
    });
    const ov = stage.querySelector('.g-overlay');
  }

  hint.addEventListener('input', onInput);
  const onDown = () => { if (!done) hint.focus(); };
  stage.addEventListener('pointerdown', onDown);

  start();
  return { destroy() { if (timer) clearInterval(timer); stage.removeEventListener('pointerdown', onDown); } };
};
