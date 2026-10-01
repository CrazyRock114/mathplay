/* MathPlay Oracle B-1 — content & render sweep (browser runtime)
 * Executed via node_repl by reading this file and eval'ing it, then calling
 * globalThis.__sweep1(tab). Asserts rendered DOM across locales + interlock counts.
 */
globalThis.__sweep1 = async function (tab) {
  const ORIGIN = 'http://localhost:8123';
  const out = { checks: 0, fails: [], notes: [] };
  const ok = (name, cond, detail) => {
    out.checks++;
    if (!cond) out.fails.push(name + (detail ? ' :: ' + detail : ''));
  };
  const page = fn => tab.playwright.evaluate(fn);

  /* clean baseline + read back */
  await tab.goto(ORIGIN + '/index.html');
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
  await page(() => { localStorage.clear(); });
  await tab.reload();
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
  const baseline = await page(() => ({
    lang: localStorage.getItem('mp_lang'),
    favs: localStorage.getItem('mp_favs'),
    plays: localStorage.getItem('mp_plays'),
  }));
  ok('baseline-clean-readback', baseline.lang === null && baseline.favs === null && baseline.plays === null,
    JSON.stringify(baseline));

  /* home default state */
  const home = await page(() => ({
    tiles: document.querySelectorAll('.tile').length,
    games: GAMES.length,
    domainChips: document.querySelectorAll('#knowNav .know-chip').length,
    topicChips: document.querySelectorAll('#topicNav .know-chip').length,
    badgeSum: [...document.querySelectorAll('#topicNav .know-chip em')]
      .reduce((n, e) => n + (+e.textContent || 0), 0),
    pairs: GAMES.reduce((n, g) => n + (g.knowledge || []).length, 0),
    catPills: document.querySelectorAll('#catsNav .cat-pill').length,
  }));
  ok('interlock:home-tiles==games', home.tiles === home.games, home.tiles + ' vs ' + home.games);
  ok('interlock:badgeSum==pairs', home.badgeSum === home.pairs, home.badgeSum + ' vs ' + home.pairs);
  ok('home:domain-chips==6', home.domainChips === 6, '' + home.domainChips);
  ok('home:topic-chips==20', home.topicChips === 20, '' + home.topicChips);
  ok('home:cat-pills==10', home.catPills === 10, '' + home.catPills);

  /* 8-locale home render sweep */
  const LOCALES = ['en', 'zh-CN', 'zh-TW', 'ja', 'zh', 'it', 'fr', 'de'];
  for (const loc of LOCALES) {
    await page('(() => { I18n.set(' + JSON.stringify(loc) + ', false); return document.documentElement.lang; })()');
    const st = await page(() => {
      const text = document.body.innerText;
      const bareKey = /\b(g_[a-z0-9]+_t|kn_[a-z]+|cat_[a-z]+|ab_[a-z]+|fav_[a-z]+|tr_[a-z]+)\b/.test(text);
      return {
        lang: document.documentElement.lang,
        title: document.title,
        expectedTitle: I18n.t('title_home'),
        firstTile: document.querySelector('.tile-name')?.textContent,
        expectedTile: I18n.t('g_merge2048_t'),
        langLabel: document.getElementById('langName')?.textContent,
        bareKey,
        heroN: document.querySelectorAll('.hero-slide').length,
      };
    });
    ok(loc + ':html-lang', st.lang === (loc === 'zh' ? 'zh-CN' : loc), st.lang);
    ok(loc + ':title==dict', st.title === st.expectedTitle, st.title + ' vs ' + st.expectedTitle);
    ok(loc + ':first-tile==dict', st.firstTile === st.expectedTile, st.firstTile + ' vs ' + st.expectedTile);
    ok(loc + ':lang-label', st.langLabel === ({ en: 'English', 'zh-CN': '简体中文', 'zh-TW': '繁體中文', ja: '日本語', zh: '汉语', it: 'Italiano', fr: 'Français', de: 'Deutsch' })[loc], st.langLabel);
    ok(loc + ':no-bare-keys', !st.bareKey, '');
    ok(loc + ':hero-7-slides', st.heroN === 7, '' + st.heroN);
  }

  /* 28 game pages in zh-CN: boot + tags card + localized title */
  await page(() => { I18n.set('zh-CN', false); });
  const ids = await page(() => GAMES.map(g => g.id));
  for (const id of ids) {
    await tab.goto(ORIGIN + '/game.html?id=' + id);
    await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
    const st = await page(() => ({
      stageN: document.querySelectorAll('#stage > *').length,
      tagRows: document.querySelectorAll('.tag-row').length,
      title: document.getElementById('gTitle')?.textContent,
      howLen: (document.getElementById('gHow')?.textContent || '').length,
      meta: (document.getElementById('gAge')?.textContent || '').length > 0,
      factoryKnown: !!GameFactories[GAMES.find(g => g.id === new URLSearchParams(location.search).get('id'))?.id],
    }));
    ok('boot:' + id + ':stage', st.stageN > 0, 'children=' + st.stageN);
    ok('boot:' + id + ':tags>=1', st.tagRows >= 1, '' + st.tagRows);
    ok('boot:' + id + ':title-localized', st.title && !/^[a-z_]+$/.test(st.title), st.title);
    ok('boot:' + id + ':how>10chars', st.howLen > 10, '' + st.howLen);
    ok('boot:' + id + ':age-meta', st.meta, '');
  }

  /* sample 4 games × (ja, de, zh-TW) render */
  for (const loc of ['ja', 'de', 'zh-TW']) {
    for (const id of ['merge2048', 'coords', 'balance', 'typing']) {
      await page('(() => { I18n.set(' + JSON.stringify(loc) + ', false); })()');
      await tab.goto(ORIGIN + '/game.html?id=' + id);
      await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
      const st = await page(() => ({
        title: document.getElementById('gTitle')?.textContent,
        chips: [...document.querySelectorAll('.g-chip')].map(c => c.textContent).join('/'),
        bareKey: /(_t|kn_|cat_[a-z]+$|ab_[a-z]+$|tr_)/.test(document.body.innerText),
      }));
      ok(loc + ':' + id + ':title', st.title && !/^[a-z_]+$/.test(st.title), st.title);
      ok(loc + ':' + id + ':no-bare-keys', !st.bareKey, '');
    }
  }

  /* 404 page */
  await tab.goto(ORIGIN + '/game.html?id=does-not-exist');
  await tab.playwright.waitForLoadState({ state: 'domcontentloaded' });
  const nf = await page(() => ({
    text: document.getElementById('stage')?.innerText || '',
    back: !!document.querySelector('#stage a'),
  }));
  ok('404:message-shown', nf.text.length > 5 && nf.back, nf.text.slice(0, 40));

  out.summary = 'B1 total=' + out.checks + ' fail=' + out.fails.length;
  return out;
};
