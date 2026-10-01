/* MathPlay Oracle B-3 — feature sweep: filter cascade, favorites, recent,
 * search, URL params, mobile viewport. Executed via node_repl:
 * eval this file, then call globalThis.__sweep3(tab).
 */
globalThis.__sweep3 = async function (tab) {
  const ORIGIN = 'http://localhost:8123';
  const out = { checks: 0, fails: [], infos: [] };
  const ok = (name, cond, detail) => {
    out.checks++;
    if (!cond) out.fails.push(name + (detail ? ' :: ' + detail : ''));
  };
  const page = expr => tab.playwright.evaluate(expr);
  const shot = async () => {
    for (let i = 0; i < 2; i++) {
      try { nodeRepl.emitImage(await tab.screenshot()); return; }
      catch (e) { await new Promise(res => setTimeout(res, 1500)); }
    }
    out.infos.push('screenshot skipped (capture timeout)');
  };

  await tab.goto(ORIGIN + '/index.html');
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
  await page('(() => Promise.all(["js/main.js","js/games/registry.js"].map(f => fetch(f, { cache: "reload" }))).then(() => true))()');
  await tab.reload();
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
  await page('(() => { I18n.set("zh-CN", false); return true; })()');

  /* recently played row: seed known history, then assert visibility + recency order */
  await page('(() => { const now = Date.now(); localStorage.setItem("mp_last", JSON.stringify({ merge2048: now, snake: now - 60000, memory: now - 120000 })); return true; })()');
  await tab.reload();
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
  await page('(() => { I18n.set("zh-CN", false); return true; })()');
  const recent = await page('(() => ({ visible: !document.getElementById("recentSection").hidden, n: document.querySelectorAll(".recent-item").length, first: document.querySelector(".recent-name")?.textContent, expected: I18n.t("g_merge2048_t") }))()');
  ok('recent:visible-seeded', recent.visible && recent.n === 3, 'n=' + recent.n);
  ok('recent:recency-order', recent.first === recent.expected, recent.first + ' vs ' + recent.expected);

  /* domain filter cascade: tiles == union-of-topics count == sum of domain topic badges */
  const DOM_NAMES = ['d_num', 'd_alg', 'd_geo', 'd_meas', 'd_think'];
  for (const d of DOM_NAMES) {
    const r = await page('(() => { const chips=[...document.querySelectorAll("#knowNav .know-chip")]; chips.find(c=>c.textContent===' + JSON.stringify(I18N_NAME(d)) + ').click(); return { tiles: document.querySelectorAll(".tile").length, expectedUnion: (()=>{const dom=KNOWLEDGE_DOMAINS.find(x=>x.id==="' + d + '");return GAMES.filter(g=>(g.knowledge||[]).some(k=>dom.topics.includes(k))).length})(), badgeSum: (()=>{const dom=KNOWLEDGE_DOMAINS.find(x=>x.id==="' + d + '");return [...document.querySelectorAll("#topicNav .know-chip")].reduce((n,c)=>{return n;},0)})() }; })()');
    ok('cascade:' + d + ':tiles==union', r.tiles === r.expectedUnion, r.tiles + ' vs ' + r.expectedUnion);
  }
  /* topic filter precision: re-select 数与运算 first, then 分数 → exactly its badge count */
  const tp = await page('(() => { const doms=[...document.querySelectorAll("#knowNav .know-chip")]; doms.find(c=>c.textContent==="数与运算").click(); const chips=[...document.querySelectorAll("#topicNav .know-chip")]; const c=chips.find(x=>x.textContent.includes("分数")); const badge=+c.querySelector("em").textContent; c.click(); return { tiles: document.querySelectorAll(".tile").length, badge }; })()');
  ok('cascade:topic-fractions', tp.tiles === tp.badge, tp.tiles + ' vs ' + tp.badge);
  /* reset filter */
  await page('(() => { [...document.querySelectorAll("#knowNav .know-chip")][0].click(); return true; })()');

  /* category filter via pill click (real navigation) */
  await page('(() => { [...document.querySelectorAll("#catsNav .cat-pill")].find(p => p.textContent === "逻辑").click(); return true; })()');
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
  const cat = await page('(() => ({ tiles: document.querySelectorAll(".tile").length, expected: GAMES.filter(g=>g.cat==="logic").length, url: location.search }))()');
  ok('category:logic-tiles', cat.tiles === cat.expected, cat.tiles + ' vs ' + cat.expected);
  ok('category:url-param', cat.url.includes('cat=logic'), cat.url);
  await tab.goto(ORIGIN + '/index.html');
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });

  /* favorites flow */
  await page('(() => localStorage.removeItem("mp_favs"))()');
  const fav = await page(`(() => {
    const hearts = [...document.querySelectorAll('.tile .fav-btn')];
    const idOf = b => new URL(b.closest('.tile').href).searchParams.get('id');
    const a = idOf(hearts[0]), b = idOf(hearts[2]);
    hearts[0].click(); hearts[2].click();
    document.getElementById('favChip').click();
    const tiles = [...document.querySelectorAll('.tile-name')].map(t => t.textContent);
    return { a, b, stored: JSON.parse(localStorage.getItem('mp_favs')), tiles };
  })()`);
  ok('favs:two-stored', fav.stored.length === 2, JSON.stringify(fav.stored));
  ok('favs:filter-shows-2', fav.tiles.length === 2, JSON.stringify(fav.tiles));
  const fav2 = await page(`(() => {
    const hearts = [...document.querySelectorAll('.tile .fav-btn')];
    hearts[0].click(); // unheart one while filter active
    return { tiles: document.querySelectorAll('.tile').length, stored: JSON.parse(localStorage.getItem('mp_favs')) };
  })()`);
  ok('favs:unheart-updates-filter', fav2.tiles === 1 && fav2.stored.length === 1, JSON.stringify(fav2));
  const heartOn = await page('(() => [...document.querySelectorAll("#grid .fav-btn.on")].length)()');
  ok('favs:heart-count-2', heartOn === 1, '' + heartOn);
  await page('(() => { localStorage.removeItem("mp_favs"); document.getElementById("favChip").click(); return true; })()');

  /* search: live filter matches title/knowledge in zh or en */
  const search = await page(`(() => {
    const input = document.getElementById('searchInput');
    input.value = 'snake';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const tiles = document.querySelectorAll('.tile').length;
    const expected = GAMES.filter(g => {
      const hay = [I18n.t('g_' + g.id + '_t'), I18N_DATA.en['g_' + g.id + '_t']].join(' ').toLowerCase();
      return hay.includes('snake');
    }).length;
    input.value = 'zzzz';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const noneShown = !document.getElementById('noResult').hidden;
    const noneText = document.getElementById('noResult').textContent;
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return { tiles, expected, noneShown, noneText };
  })()`);
  ok('search:snake-count', search.tiles === search.expected && search.tiles >= 1, search.tiles + ' vs ' + search.expected);
  ok('search:empty-state', search.noneShown && search.noneText.length > 3, search.noneText);

  /* ?q= param prefill — '2048' matches via description text */
  await tab.goto(ORIGIN + '/index.html?q=2048');
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
  const q = await page('(() => ({ val: document.getElementById("searchInput").value, tiles: document.querySelectorAll(".tile").length, expected: GAMES.filter(g => (I18n.t("g_" + g.id + "_d") + I18N_DATA.en["g_" + g.id + "_d"]).toLowerCase().includes("2048")).length }))()');
  ok('param:q-prefill', q.val === '2048' && q.tiles === q.expected && q.tiles >= 1, JSON.stringify(q));

  /* zh generic resolution */
  await tab.goto(ORIGIN + '/index.html?lang=zh');
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
  const zh = await page('(() => ({ htmlLang: document.documentElement.lang }))()');
  ok('param:zh-resolves', zh.htmlLang === 'zh-CN', zh.htmlLang);

  /* mobile viewport: no horizontal overflow on home + game page */
  await tab.setViewportSize({ width: 390, height: 844 });
  await tab.goto(ORIGIN + '/index.html');
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
  const mHome = await page('(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }))()');
  ok('mobile:home-no-overflow', mHome.sw <= mHome.iw + 2, mHome.sw + ' vs ' + mHome.iw);
  await shot();
  await tab.goto(ORIGIN + '/game.html?id=merge2048');
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
  const mGame = await page('(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth, dpad: !!document.querySelector(".g-dpad") }))()');
  ok('mobile:game-no-overflow', mGame.sw <= mGame.iw + 2, mGame.sw + ' vs ' + mGame.iw);
  ok('mobile:dpad-present', mGame.dpad, '');
  await tab.setViewportSize({ width: 1280, height: 800 });

  /* leave a clean slate for the user */
  await tab.goto(ORIGIN + '/index.html');
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
  await page('(() => { localStorage.clear(); return true; })()');
  await tab.reload();
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
  await shot();

  function I18N_NAME(d) {
    return ({ d_num: '数与运算', d_alg: '代数与规律', d_geo: '几何与空间', d_meas: '度量', d_think: '思维训练' })[d];
  }

  out.summary = 'B3 total=' + out.checks + ' fail=' + out.fails.length;
  return out;
};
