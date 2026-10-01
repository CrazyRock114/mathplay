/* Change Master — coin counting to exact price, original implementation */
GameFactories.changeup = function (stage, ctx) {
  const t = ctx.t;
  const COINS = [1, 0.5, 0.2, 0.1, 0.05];
  const TOTAL = 12;
  let customer, price, tray, done, score;

  const hud = GameKit.hud(stage, [
    ['n', '🛒'], ['score', t('game_score')], ['best', t('game_best')],
  ]);
  hud.best(GameKit.getBest('changeup'));

  const panel = GameKit.el('div', 'change-panel');
  const priceEl = GameKit.el('div', 'change-price');
  const trayEl = GameKit.el('div', 'change-tray');
  const traySum = GameKit.el('div', 'change-sum', '0.00');
  const coinsEl = GameKit.el('div', 'change-coins');
  const payBtn = GameKit.el('button', 'g-btn primary', '💳 ' + t('game_start'));
  panel.appendChild(priceEl); panel.appendChild(trayEl); panel.appendChild(traySum);
  panel.appendChild(coinsEl); panel.appendChild(payBtn);
  stage.appendChild(panel);

  COINS.forEach(v => {
    const c = GameKit.el('button', 'coin-btn', v.toFixed(2));
    c.onclick = () => add(v);
    coinsEl.appendChild(c);
  });

  const fmt = v => v.toFixed(2);
  const sum = () => tray.reduce((a, b) => a + b, 0);

  function add(v) {
    if (done) return;
    tray.push(v);
    trayEl.appendChild(GameKit.el('span', 'coin-mini', fmt(v)));
    traySum.textContent = fmt(sum());
  }

  function clearTray() { tray = []; trayEl.innerHTML = ''; traySum.textContent = '0.00'; }

  function newCustomer() {
    // price in 5-cent steps between 0.35 and 4.85
    price = (35 + Math.floor(Math.random() * 90) * 5) / 100;
    priceEl.textContent = '💰 ' + fmt(price);
    clearTray();
  }

  function pay() {
    if (done) return;
    const s = +sum().toFixed(2);
    if (Math.abs(s - price) < 0.001) {
      score++;
      hud.score(score);
      customer++;
      hud.n(customer + '/' + TOTAL);
      if (customer > TOTAL) return end();
      newCustomer();
    } else {
      panel.classList.add('shake-panel');
      setTimeout(() => panel.classList.remove('shake-panel'), 400);
      clearTray();
    }
  }

  function start() {
    customer = 1; score = 0; done = false;
    hud.n('1/' + TOTAL); hud.score(0);
    newCustomer();
  }

  function end() {
    done = true;
    const r = GameKit.submit('changeup', score, true);
    hud.best(GameKit.getBest('changeup'));
    GameKit.overlay(stage, {
      title: t('game_win'),
      stats: [[t('game_score'), score + '/' + TOTAL], [t('game_best'), r.value]],
      msg: r.isBest ? t('game_newbest') : '',
      btnLabel: t('game_again'),
      onBtn: () => { ov.remove(); start(); },
    });
    const ov = stage.querySelector('.g-overlay');
  }

  payBtn.onclick = pay;
  start();
  return { destroy() {} };
};
