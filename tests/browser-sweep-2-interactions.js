/* MathPlay Oracle B-2 — interaction sweep (browser runtime)
 * Executed via node_repl: eval this file, then call
 * globalThis.__sweep2(tab, from, to). Per-game oracle asserts a real delta.
 * Also acts as the runtime vaccine for untracked setTimeouts:
 * every game gets a language switch mid-session with zero console errors.
 */
globalThis.__sweep2 = async function (tab, from, to) {
  const ORIGIN = 'http://localhost:8123';
  const out = { checks: 0, fails: [], infos: [] };
  const ok = (name, cond, detail) => {
    out.checks++;
    if (!cond) out.fails.push(name + (detail ? ' :: ' + detail : ''));
  };
  const page = expr => tab.playwright.evaluate(expr);

  await tab.goto(ORIGIN + '/index.html');
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
  await page('(() => { localStorage.clear(); return true; })()');
  await tab.reload();
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
  const rb = await page('(() => ({ lang: localStorage.getItem("mp_lang"), favs: localStorage.getItem("mp_favs") }))()');
  ok('baseline-clean', rb.lang === null && rb.favs === null, JSON.stringify(rb));

  /* force-refresh every asset in the HTTP cache so sweeps never test stale code */
  await page('(() => Promise.all(["css/style.css","js/games/registry.js","js/i18n/strings-a.js","js/i18n/strings-b.js","js/i18n/strings-c.js","js/i18n/strings-d.js","js/i18n/strings-e.js","js/i18n/strings-f.js","js/i18n/core.js","js/main.js","js/game-page.js"].concat(GAMES.map(g => "js/games/" + g.id + ".js")).map(f => fetch(f, { cache: "reload" }))).then(() => true))()');
  await page('(() => { I18n.set("zh-CN", false); return true; })()');

  const INTERACT = `
  (async () => {
    const id = new URLSearchParams(location.search).get('id');
    const $ = s => document.querySelector(s);
    const $$ = s => [...document.querySelectorAll(s)];
    const wait = (fn, ms) => new Promise(res => {
      const t0 = Date.now();
      const iv = setInterval(() => {
        let v = null;
        try { v = fn(); } catch (e) { v = null; }
        if (v) { clearInterval(iv); res(v); }
        else if (Date.now() - t0 > ms) { clearInterval(iv); res(null); }
      }, 90);
    });
    const key = k => window.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    const cvSig = sel => {
      const cv = document.querySelector(sel);
      if (!cv) return -1;
      const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
      let h = 0;
      for (let i = 0; i < d.length; i += 997) h = (h * 31 + d[i]) | 0;
      return h;
    };
    const chips = () => $$('.g-chip b').map(b => b.textContent);
    const r = { id, ok: false, detail: '' };
    try {
      switch (id) {
        case 'merge2048': {
          const b0 = $$('.m2048-cell').filter(c => c.textContent).length;
          ['ArrowLeft','ArrowUp','ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].forEach(key);
          const b1 = $$('.m2048-cell').filter(c => c.textContent).length;
          r.ok = b1 >= 3 && b1 > b0; r.detail = b0 + '->' + b1; break;
        }
        case 'snake': case 'runner': case 'blocks': {
          const s1 = cvSig('canvas');
          await new Promise(res => setTimeout(res, 650));
          const s2 = cvSig('canvas');
          r.ok = s1 !== -1 && s1 !== s2; r.detail = s1 + ' vs ' + s2; break;
        }
        case 'memory': {
          $$('.mem-card')[0].click(); $$('.mem-card')[1].click();
          const v = await wait(() => $$('.mem-card.flipped').length === 2, 800);
          r.ok = !!v; break;
        }
        case 'speedmath': case 'fractions': case 'clockrush': case 'balance':
        case 'sequence': case 'shapespy': case 'percent': {
          $('.sm-opt').click();
          const v = await wait(() => $$('.sm-opt.ok, .sm-opt.bad').length >= 1, 900);
          r.ok = !!v; break;
        }
        case 'trivia': {
          $('.sm-opt').click();
          const v = await wait(() => (chips()[0] || '').startsWith('2/12'), 1400);
          r.ok = !!v; r.detail = chips()[0]; break;
        }
        case 'minesweeper': {
          $$('.ms-cell')[40].click();
          const v = await wait(() => $$('.ms-cell.revealed').length >= 1, 600);
          r.ok = !!v; break;
        }
        case 'tictactoe': {
          $$('.ttt-cell')[4].click();
          const v = await wait(() => $$('.ttt-cell.o').length >= 1, 1200);
          r.ok = $$('.ttt-cell.x').length === 1 && !!v; break;
        }
        case 'simon': {
          $('.g-overlay .g-btn').click();
          const v = await wait(() => chips()[0] === '1', 3000);
          r.ok = !!v; r.detail = chips()[0]; break;
        }
        case 'sudoku': {
          const cell = $$('.sud-cell').find(c => !c.classList.contains('given'));
          cell.click();
          $$('button.sud-num').find(b => b.textContent === '3').click();
          const v = await wait(() => cell.textContent === '3', 600);
          r.ok = !!v; break;
        }
        case 'reaction': {
          $('.react-panel').click();
          const green = await wait(() => document.querySelector('.react-panel.go'), 8000);
          if (green) green.click();
          const v = await wait(() => $$('.react-times .g-chip').length >= 1, 1500);
          r.ok = !!green && !!v; r.detail = 'green=' + !!green; break;
        }
        case 'connect4': {
          $$('.c4-col')[3].click();
          const v = await wait(() => $$('.c4-hole.p1, .c4-hole.p2').length >= 2, 1500);
          r.ok = !!v; break;
        }
        case 'sliding': {
          const tiles = $$('.slide-tile');
          const blank = tiles.findIndex(t => t.style.visibility === 'hidden');
          const N = 4, bx = blank % N, by = Math.floor(blank / N);
          const nb = [];
          if (bx > 0) nb.push(blank - 1);
          if (bx < N - 1) nb.push(blank + 1);
          if (by > 0) nb.push(blank - N);
          if (by < N - 1) nb.push(blank + N);
          tiles[nb[0]].click();
          const v = await wait(() => chips()[0] === '1', 600);
          r.ok = !!v; break;
        }
        case 'guess': {
          const inp = $('.guess-input');
          inp.value = '50';
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          $('.guess-row .g-btn').click();
          const v = await wait(() => chips()[0] === '1', 700);
          r.ok = !!v; break;
        }
        case 'whack': {
          const dot = await wait(() => document.querySelector('.whack-dot.up'), 9000);
          if (dot) { dot.parentElement.click(); }
          const v = await wait(() => chips()[0] === '1', 500);
          r.ok = !!dot && !!v; break;
        }
        case 'angles': {
          $('.angles-ctrl .g-btn').click();
          const v = await wait(() => chips()[1] === '1', 3500);
          r.ok = !!v; break;
        }
        case 'coords': {
          const xs = $$('.coords-clue b');
          const x = +xs[0].textContent - 1, y = +xs[1].textContent - 1;
          $$('.coords-cell')[y * 6 + x].click();
          const v = await wait(() => $$('.coords-cell.gem').length === 1, 600);
          r.ok = !!v; break;
        }
        case 'changeup': {
          $$('.coin-btn')[0].click();
          const t1 = $$('.change-tray').length && $$('.change-tray')[0].children.length === 1;
          $('.change-panel .g-btn').click();
          const v = await wait(() => $$('.change-tray')[0].children.length === 0, 700);
          r.ok = !!t1 && !!v; break;
        }
        case 'duel': {
          key('1');
          const v = await wait(() => $$('.duel-opt.ok, .duel-opt.bad').length >= 1, 600);
          r.ok = !!v; break;
        }
        case 'dots': {
          const e = $$('.dots-edge').find(x => !x.classList.contains('taken'));
          e.click();
          const v = await wait(() => $$('.dots-edge.taken').length >= 1, 900);
          r.ok = !!v; break;
        }
        case 'typing': {
          const target = $('.type-display').textContent;
          const inp = $('.type-input');
          inp.value = target;
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          const v = await wait(() => chips()[0] === '1', 700);
          r.ok = !!v; break;
        }
        default: r.ok = false; r.detail = 'no interaction oracle';
      }
    } catch (e) { r.ok = false; r.detail = 'THROW ' + e.message; }
    return r;
  })()`;

  const VACCINE = `
  (async () => {
    const errs = [];
    const onErr = e => errs.push(String(e.message || e));
    window.addEventListener('error', onErr);
    window.addEventListener('unhandledrejection', e => errs.push('rej:' + e.reason));
    const before = document.querySelectorAll('#stage > *').length;
    I18n.set('en', false);
    await new Promise(res => setTimeout(res, 1400));
    const after = document.querySelectorAll('#stage > *').length;
    I18n.set('zh-CN', false);
    await new Promise(res => setTimeout(res, 500));
    return { errs, before, after };
  })()`;

  const ids = await page('(() => GAMES.map(g => g.id))()');
  const slice = ids.slice(from, to);
  for (const id of slice) {
    await tab.goto(ORIGIN + '/game.html?id=' + id);
    await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
    const r = await page(INTERACT);
    ok('interact:' + id, r && r.ok === true, r ? r.detail : 'no result');
    const v = await page(VACCINE);
    ok('vaccine:' + id + ':no-errors', v.errs.length === 0, v.errs.slice(0, 2).join(' | '));
    ok('vaccine:' + id + ':rebuilt', v.after > 0, 'before=' + v.before + ' after=' + v.after);
  }

  out.summary = 'B2 games[' + slice.join(',') + '] total=' + out.checks + ' fail=' + out.fails.length;
  return out;
};
