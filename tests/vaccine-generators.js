/* MathPlay vaccine assertions — generator properties + gameplay-level checks.
 * Executed via node_repl: eval this file, then call globalThis.__vaccines(tab).
 * These are the regression vaccines for the OCR-review fixes (D7 series):
 * each check would have caught the original defect.
 */
globalThis.__vaccines = async function (tab) {
  const ORIGIN = 'http://localhost:8123';
  const out = { checks: 0, fails: [] };
  const ok = (name, cond, detail) => {
    out.checks++;
    if (!cond) out.fails.push(name + (detail ? ' :: ' + detail : ''));
  };
  const page = expr => tab.playwright.evaluate(expr);

  /* force-refresh every asset so vaccines never test stale code */
  await tab.goto(ORIGIN + '/index.html');
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
  await page('(() => Promise.all(["css/style.css","js/games/registry.js","js/i18n/strings-a.js","js/i18n/strings-b.js","js/i18n/strings-c.js","js/i18n/strings-d.js","js/i18n/strings-e.js","js/i18n/strings-f.js","js/i18n/core.js","js/main.js","js/game-page.js"].concat(GAMES.map(g => "js/games/" + g.id + ".js")).map(f => fetch(f, { cache: "reload" }))).then(() => true))()');

  /* V1 runner: gate generator never hangs / never negative / unique distractors.
   * Vaccine for the CRITICAL infinite loop (ans <= -5 starved the wrongs set). */
  await tab.goto(ORIGIN + '/game.html?id=runner');
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
  const v1 = await page(`(() => {
    const { makeGate } = GameFactories.runner._test;
    for (let level = 1; level <= 8; level++) {
      for (let i = 0; i < 60; i++) {
        const g = makeGate(level, 0);
        if (g.values.length !== 3) return 'values len';
        if (g.values[g.correct] !== g.values.find(v => v === g.values[g.correct])) return 'correct lane';
        if (g.values.filter(v => v === g.values[g.correct]).length !== 1) return 'duplicate of answer';
        if (g.values.some(v => typeof v !== 'number' || v < 0 || isNaN(v))) return 'negative/NaN: ' + g.text;
        if (level >= 5 && g.text.includes('−') && g.values[g.correct] < 6) return 'sub answer < 6';
      }
    }
    return null;
  })()`);
  ok('V1:runner-gates', v1 === null, String(v1));

  /* V2 balance: every equation is arithmetically consistent with its answer.
   * Vaccine for the division branch that displayed the answer as the RHS. */
  await tab.goto(ORIGIN + '/game.html?id=balance');
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
  const v2 = await page(`(() => {
    const gen = GameFactories.balance._test.makeQuestion;
    for (let i = 0; i < 80; i++) {
      const q = gen();
      let ok;
      let m;
      if ((m = q.text.match(/^x \\+ (\\d+) = (\\d+)/))) ok = +m[2] === q.correct + +m[1];
      else if ((m = q.text.match(/^x − (\\d+) = (\\d+)/))) ok = +m[2] === q.correct - +m[1];
      else if ((m = q.text.match(/^(\\d+) · x = (\\d+)/))) ok = +m[2] === +m[1] * q.correct;
      else if ((m = q.text.match(/^(\\d+) ÷ (\\d+) = \\?$/))) ok = +m[1] % +m[2] === 0 && +m[1] / +m[2] === q.correct;
      else ok = false;
      if (!ok) return 'inconsistent: ' + q.text + ' (ans ' + q.correct + ')';
    }
    return null;
  })()`);
  ok('V2:balance-equations', v2 === null, String(v2));

  /* V3 clockrush: minutes always within 0–59; options unique and valid.
   * Vaccine for the 0–145 minute generator. */
  await tab.goto(ORIGIN + '/game.html?id=clockrush');
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
  const v3 = await page(`(() => {
    const gen = GameFactories.clockrush._test.makeQuestion;
    for (let i = 0; i < 120; i++) {
      const q = gen();
      const m = q.correct.match(/^(\\d{1,2}):(\\d{2})$/);
      if (!m) return 'bad format ' + q.correct;
      if (+m[2] > 59) return 'minutes > 59: ' + q.correct;
      if (new Set(q.opts).size !== 4 || !q.opts.includes(q.correct)) return 'options';
    }
    return null;
  })()`);
  ok('V3:clockrush-minutes', v3 === null, String(v3));

  /* V4 trivia: no 'undefined' questions; exactly one valid answer per attribute type.
   * Vaccine for the missing tr_largest text and non-exclusive even/prime distractors. */
  await tab.goto(ORIGIN + '/game.html?id=trivia');
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
  const v4 = await page(`(() => {
    const { makeQuestion, prime } = GameFactories.trivia._test;
    for (let i = 0; i < 300; i++) {
      const q = makeQuestion();
      if (typeof q.text !== 'string' || q.text.length < 3 || q.text.includes('undefined')) return 'bad text';
      if (new Set(q.opts).size !== 4 || !q.opts.includes(q.correct)) return 'options';
      if (q.text.includes('偶数') || q.text.includes('even')) {
        if (q.opts.filter(v => v % 2 === 0).length !== 1) return 'multi-even: ' + q.opts;
      }
      if (q.text.includes('质数') || q.text.includes('prime')) {
        if (q.opts.filter(prime).length !== 1) return 'multi-prime: ' + q.opts;
      }
      if (q.text.includes('最大') || q.text.includes('largest')) {
        if (Math.max(...q.opts) !== q.correct) return 'largest wrong';
      }
    }
    return null;
  })()`);
  ok('V4:trivia-questions', v4 === null, String(v4));

  /* V5 coords: full gameplay — clues never point at already-open cells (softlock vaccine). */
  await tab.goto(ORIGIN + '/game.html?id=coords');
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
  const v5 = await page(`(async () => {
    for (let dig = 0; dig < 5; dig++) {
      const bs = document.querySelectorAll('.coords-clue b');
      const x = +bs[0].textContent - 1, y = +bs[1].textContent - 1;
      const cell = document.querySelectorAll('.coords-cell')[y * 6 + x];
      if (cell.classList.contains('open')) return 'clue points to open cell at dig ' + dig;
      cell.click();
      await new Promise(r => setTimeout(r, 120));
    }
    return document.querySelectorAll('.coords-cell.gem').length === 5 ? null : 'gems != 5';
  })()`);
  ok('V5:coords-no-softlock', v5 === null, String(v5));

  /* V6 connect4: a dropped disc is actually VISIBLE (i element scaled in).
   * Transitions are frozen in background tabs, so strip the transition before
   * reading the computed transform — we assert the cascade result, not the animation. */
  await tab.goto(ORIGIN + '/game.html?id=connect4');
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
  const v6 = await page(`(async () => {
    const wait = async (fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { let v; try { v = fn(); } catch (e) {} if (v) return v; await new Promise(r => setTimeout(r, 80)); } return null; };
    await wait(() => document.querySelectorAll('.c4-col')[3], 3000);
    document.querySelectorAll('.c4-col')[3].click();
    await new Promise(r => setTimeout(r, 900));
    const hole = document.querySelector('.c4-hole.p1, .c4-hole.p2');
    if (!hole) return 'no p1/p2 class';
    const i = hole.querySelector('i');
    if (!i) return 'no <i> child';
    i.style.transition = 'none';
    const tf = getComputedStyle(i).transform;
    const bg = getComputedStyle(i).backgroundImage;
    return tf === 'none' || tf === 'matrix(0, 0, 0, 0, 0, 0)' || !bg.includes('gradient') ? 'disc invisible: ' + tf : null;
  })()`);
  ok('V6:connect4-visible-disc', v6 === null, String(v6));

  /* V7 dots: exactly 24 real edges, no phantom box-center buttons, 7 grid tracks. */
  await tab.goto(ORIGIN + '/game.html?id=dots');
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
  const v7 = await page(`(() => {
    const edges = [...document.querySelectorAll('.dots-edge')];
    if (edges.length !== 24) return 'edges=' + edges.length;
    const bad = edges.find(e => !/^[hv]\\d+_\\d+$/.test(e.dataset.key));
    if (bad) return 'invalid key ' + bad.dataset.key;
    const cols = document.querySelector('.dots-board').style.gridTemplateColumns;
    if (!cols.includes('repeat(3, 44px 26px)')) return 'tracks: ' + cols;
    return null;
  })()`);
  ok('V7:dots-structure', v7 === null, String(v7));

  /* V8 search-input typing is never hijacked by game key handlers. */
  await tab.goto(ORIGIN + '/game.html?id=snake');
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
  const v8 = await page(`(() => {
    const input = document.getElementById('searchInput');
    input.focus();
    let hijacked = false;
    for (const k of ['w', 'a', 's', 'd', ' ']) {
      const ev = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
      input.dispatchEvent(ev);
      if (ev.defaultPrevented) hijacked = true;
    }
    return hijacked ? 'keydown preventDefault-ed inside search input' : null;
  })()`);
  ok('V8:search-input-not-hijacked', v8 === null, String(v8));

  /* V9 speedmath: double-click can never double-score or double-advance. */
  await tab.goto(ORIGIN + '/game.html?id=speedmath');
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
  const v9 = await page(`(async () => {
    const opts = [...document.querySelectorAll('.sm-opt')];
    const marked = document.querySelectorAll('.sm-opt.ok, .sm-opt.bad').length;
    opts[0].click(); opts[1].click(); // second click must be blocked by lock
    await new Promise(r => setTimeout(r, 120));
    return document.querySelectorAll('.sm-opt.ok, .sm-opt.bad').length === marked + 1 ? null : 'double mark';
  })()`);
  ok('V9:speedmath-single-answer', v9 === null, String(v9));

  out.summary = 'vaccines total=' + out.checks + ' fail=' + out.fails.length;
  return out;
};
