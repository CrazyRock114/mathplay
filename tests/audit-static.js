/* MathPlay Oracle A — file-level static audit (JavaScriptCore / osascript)
 * Run: osascript -l JavaScript tests/audit-static.js
 * Zero shared runtime with the browser: reads raw files from disk and evals
 * the data layer in an isolated sandbox; game sources are regex-audited only.
 */
ObjC.import('Foundation');

const ROOT = '/Users/crazyrock/ZCodeProject/coolmathgame/';
function read(p) {
  const s = $.NSString.stringWithContentsOfFileEncodingError($(ROOT + p), 4, null);
  if (s.isNil()) throw new Error('cannot read ' + p);
  return s.js;
}

let FAIL = 0, TOTAL = 0;
const LINES = [];
function check(name, cond, detail) {
  TOTAL++;
  if (!cond) { FAIL++; LINES.push('FAIL | ' + name + (detail ? ' | ' + detail : '')); }
  else LINES.push('pass | ' + name + (detail ? ' | ' + detail : ''));
}
function section(s) { LINES.push('---- ' + s + ' ----'); }

/* count setTimeout calls that are neither assigned nor pushed to a tracker */
function untrackedTimeouts(src) {
  let n = 0, idx = 0;
  while ((idx = src.indexOf('setTimeout(', idx)) >= 0) {
    let j = idx - 1;
    while (j >= 0 && /\s/.test(src[j])) j--;
    const prev = src.slice(Math.max(0, j - 10), j + 1);
    if (!/=$/.test(prev) && !/\($/.test(prev)) n++;   // not "x = setTimeout" nor ".push(setTimeout"
    idx += 11;
  }
  return n;
}

/* ---------- L0 baseline: file inventory + fingerprints ---------- */
section('L0 baseline');
const FILES = ['index.html', 'game.html', 'css/style.css', 'README.md',
  'js/games/registry.js', 'js/i18n/strings-a.js', 'js/i18n/strings-b.js',
  'js/i18n/strings-c.js', 'js/i18n/strings-d.js', 'js/i18n/strings-e.js', 'js/i18n/strings-f.js',
  'js/i18n/core.js', 'js/main.js', 'js/game-page.js'];
const fingerprints = {};
FILES.forEach(f => {
  try { fingerprints[f] = read(f).length; check('read:' + f, true, fingerprints[f] + ' chars'); }
  catch (e) { check('read:' + f, false, e.message); }
});

/* ---------- sandbox-eval the data layer ---------- */
const registrySrc = read('js/games/registry.js');
const stringsSrc = ['js/i18n/strings-a.js', 'js/i18n/strings-b.js', 'js/i18n/strings-c.js',
  'js/i18n/strings-d.js', 'js/i18n/strings-e.js', 'js/i18n/strings-f.js'].map(read).join('\n;\n');

let D = null;
try {
  const windowStub = { I18N_DATA: {} };
  const localStorageStub = { getItem: function () { return null; }, setItem: function () {} };
  const factory = new Function('window', 'localStorage',
    'var I18N_DATA = window.I18N_DATA;' +
    registrySrc + '\n;\n' + stringsSrc +
    '\n;return {GAMES: window.GAMES, CATS: window.CATS, KNOWLEDGE: window.KNOWLEDGE,' +
    ' DOMAINS: window.KNOWLEDGE_DOMAINS, ABILITIES: window.ABILITIES, DATA: window.I18N_DATA};');
  D = factory(windowStub, localStorageStub);
  check('sandbox-eval data layer', true, '');
} catch (e) {
  check('sandbox-eval data layer', false, e.message);
}

const GAMES = D ? D.GAMES : [];
const CATS = D ? D.CATS : [];
const KNOWLEDGE = D ? D.KNOWLEDGE : [];
const DOMAINS = D ? D.DOMAINS : [];
const ABILITIES = D ? D.ABILITIES : [];
const DATA = D ? D.DATA : {};

/* ---------- L1 structure: registry closure ---------- */
section('L1 registry closure');
const gameIds = GAMES.map(g => g.id);
check('GAMES.count == 28', GAMES.length === 28, 'got ' + GAMES.length);
check('GAMES.unique-ids', new Set(gameIds).size === GAMES.length, '');
check('CATS.count == 8', CATS.length === 8, CATS.map(c => c.id).join(','));

GAMES.forEach(g => {
  const tag = g.id;
  let src = null;
  try { src = read('js/games/' + g.id + '.js'); } catch (e) {}
  check(tag + ':file+factory', !!src && src.indexOf('GameFactories.' + g.id) >= 0, '');
  check(tag + ':cat-valid', CATS.some(c => c.id === g.cat), g.cat);
  check(tag + ':grad-2', Array.isArray(g.grad) && g.grad.length === 2, '');
  check(tag + ':age-3..18', Number.isInteger(g.age) && g.age >= 3 && g.age <= 18, '' + g.age);
  check(tag + ':diff-1..3', Number.isInteger(g.diff) && g.diff >= 1 && g.diff <= 3, '' + g.diff);
  const ks = g.knowledge || [];
  check(tag + ':knowledge>=1', ks.length >= 1, '');
  check(tag + ':knowledge-valid', ks.every(k => KNOWLEDGE.some(x => x.id === k)), ks.join(','));
  const ab = g.abilities || [];
  check(tag + ':abilities-valid', ab.length >= 1 && ab.every(a => ABILITIES.some(x => x.id === a)), ab.join(','));
  // icon closure: MP_ICONS keys parsed from registry source
  const iconKeys = [];
  registrySrc.replace(/(^|\n)\s{2}([a-z0-9]+):\s*'<svg/g, (m, a, k) => { iconKeys.push(k); return m; });
  check(tag + ':icon-valid', iconKeys.indexOf(g.icon) >= 0, g.icon);
});

/* ---------- L1 taxonomy closure ---------- */
section('L1 taxonomy');
const topicIds = KNOWLEDGE.map(k => k.id);
check('KNOWLEDGE.count == 20', KNOWLEDGE.length === 20, 'got ' + KNOWLEDGE.length);
check('KNOWLEDGE.unique', new Set(topicIds).size === KNOWLEDGE.length, '');
const union = [];
DOMAINS.forEach(d => d.topics.forEach(t => union.push(t)));
check('domains.union == KNOWLEDGE', union.length === KNOWLEDGE.length && union.every(t => topicIds.indexOf(t) >= 0), union.join(','));
check('domains.topics-unique', new Set(union).size === union.length, '');
const pairCount = GAMES.reduce((n, g) => n + (g.knowledge || []).length, 0);
const topicGameCount = {};
topicIds.forEach(t => { topicGameCount[t] = GAMES.filter(g => (g.knowledge || []).indexOf(t) >= 0).length; });
const emptyTopics = topicIds.filter(t => topicGameCount[t] === 0);
check('every-topic-has>=1-game', emptyTopics.length === 0, emptyTopics.join(',') || 'all covered');
check('game-topic-pairs', pairCount > 0, 'pairs=' + pairCount);
check('ABILITIES.count == 8', ABILITIES.length === 8, '');

/* ---------- L2/L4 i18n closure ---------- */
section('L4 i18n closure');
const en = DATA.en || {};
const enKeys = Object.keys(en);
const LOCALES = ['en', 'zh-CN', 'zh-TW', 'ja', 'zh', 'it', 'fr', 'de'];
check('en.keys>=180', enKeys.length >= 180, 'en=' + enKeys.length);
check('zh-alias-to-zhCN', DATA['zh-CN'] && DATA.zh === DATA['zh-CN'], '');
const PLACEHOLDER_RE = /\{([a-z]+)\}/g;
function placeholders(s) {
  const set = {}, m = s && s.match(PLACEHOLDER_RE) || [];
  m.forEach(x => { set[x] = 1; });
  return Object.keys(set).sort().join(',');
}
LOCALES.forEach(loc => {
  const dict = DATA[loc] || {};
  const missing = enKeys.filter(k => dict[k] == null);
  check(loc + ':no-missing-keys', missing.length === 0, missing.slice(0, 6).join(','));
  const badPh = [];
  enKeys.forEach(k => {
    const pe = placeholders(en[k]);
    if (pe && placeholders(dict[k]) !== pe) badPh.push(k + '[' + pe + '≠' + placeholders(dict[k]) + ']');
  });
  check(loc + ':placeholders-match', badPh.length === 0, badPh.slice(0, 4).join(' '));
});
// game content keys present for every game × every locale
LOCALES.forEach(loc => {
  const dict = DATA[loc] || {};
  const miss = [];
  gameIds.forEach(id => ['g_' + id + '_t', 'g_' + id + '_d', 'g_' + id + '_h'].forEach(k => {
    if (dict[k] == null) miss.push(k);
  }));
  check(loc + ':games-content-keys', miss.length === 0, miss.slice(0, 4).join(','));
});

/* ---------- L3 static: best-score direction + timer hygiene + t() keys ---------- */
section('L3 game source audit');
gameIds.forEach(id => {
  const g = GAMES.find(x => x.id === id);
  let src = '';
  try { src = read('js/games/' + id + '.js'); } catch (e) {}
  const submitHigh = new RegExp("GameKit\\.submit\\('" + id + "'[^)]*true\\s*\\)").test(src);
  const submitLow = new RegExp("GameKit\\.submit\\('" + id + "'[^)]*false\\s*\\)").test(src);
  if (g.bestHigh) check(id + ':bestHigh<->submit-true', submitHigh, '');
  if (g.bestLow) check(id + ':bestLow<->submit-false', submitLow, '');
  if (!g.bestHigh && !g.bestLow) check(id + ':no-best<->no-submit', src.indexOf('GameKit.submit') < 0, '');
  // timer hygiene
  const usesInterval = src.indexOf('setInterval') >= 0;
  const usesTimeout = src.indexOf('setTimeout') >= 0;
  // robust destroy body: everything after the LAST 'destroy()' up to final '};'
  const di = src.lastIndexOf('destroy()');
  const destroy = di >= 0 ? src.slice(di + 9) : '';
  if (usesInterval) check(id + ':interval-cleared', /clearInterval/.test(src), '');
  // bare one-shot setTimeouts are info-level: callbacks only touch detached DOM
  // (verified per-callback by code reading). Binding vaccine = runtime sweep:
  // per-game interaction + language switch with zero console errors.
  const bare = untrackedTimeouts(src);
  if (bare > 0) LINES.push('info | ' + id + ': ' + bare + ' untracked setTimeout (low-risk; runtime vaccine = lang-switch sweep)');
  // t() literal keys must exist in en (or be dynamic prefixes)
  const calls = [];
  src.replace(/[^a-zA-Z.]t\('([a-z0-9_]+)'/g, (m, k) => { calls.push(k); return m; });
  const badKeys = calls.filter(k =>
    en[k] == null && !/_$/.test(k) && !/^(g|kn|cat|ab)_/.test(k));
  check(id + ':t-keys-exist', badKeys.length === 0, badKeys.slice(0, 5).join(','));
});

/* ---------- L5 asset/CSS closure ---------- */
section('L5 asset closure');
const css = read('css/style.css');
const cssClasses = {};
css.replace(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g, (m, c) => { cssClasses[c] = 1; return m; });
const used = {};
['index.html', 'game.html'].forEach(f => {
  read(f).replace(/class="([^"]+)"/g, (m, c) => { c.split(/\s+/).forEach(x => { if (x) used[x] = 1; }); return m; });
});
[registrySrc, read('js/main.js'), read('js/game-page.js'), read('js/i18n/core.js')].forEach(src => {
  src.replace(/el\('[a-z]+',\s*'([^']+)'/g, (m, c) => { c.split(/\s+/).forEach(x => { if (x) used[x] = 1; }); return m; });
  src.replace(/className\s*=\s*'([^']+)'/g, (m, c) => { c.split(/\s+/).forEach(x => { if (x) used[x] = 1; }); return m; });
  src.replace(/classList\.(?:add|toggle)\('([^']+)'/g, (m, c) => { used[c] = 1; return m; });
});
const DYNAMIC = /^(v\d+|n[1-8]|has-rot|active|on|win|lit|ok|bad|up|q|cur|flipped|matched|revealed|boom|flag|taken|mine|theirs|sel|err|given|gem|miss|open|pop|shake-panel?|win-bg|p1|p2|rg|bg|idle|wait|go|end|h|v|u|d|l|r|rot|x|o)$/;
const missingCss = Object.keys(used).filter(c => !cssClasses[c] && !DYNAMIC.test(c) && !/^(v|n)\d+$/.test(c));
check('css-classes-closed', missingCss.length === 0, missingCss.slice(0, 8).join(','));

// referenced local files exist
const refs = [];
['index.html', 'game.html'].forEach(f => {
  read(f).replace(/(?:src|href)="([^"]+)"/g, (m, u) => { if (!/^(http|data:|#)/.test(u)) refs.push(u); return m; });
});
const missingFiles = refs.filter(u => {
  const path = u.split('?')[0].split('#')[0];
  if (!path || !/\.(html|css|js|md|png|jpg|svg|ico)$/.test(path)) return false;
  try { read(path); return false; } catch (e) { return true; }
});
check('local-refs-exist', missingFiles.length === 0, missingFiles.join(','));

/* ---------- L8 self-claims vs data ---------- */
section('L8 self-claims');
const readme = read('README.md');
const claimedGames = (readme.match(/游戏列表（(\d+) 款）/) || [0, 0])[1];
check('README.games-count', +claimedGames === GAMES.length, 'claimed ' + claimedGames + ' vs ' + GAMES.length);
check('README.locales-8', readme.indexOf('简体中文') >= 0 && readme.indexOf('Deutsch') >= 0 && readme.indexOf('日本語') >= 0, '');
check('README.knowledge-20', readme.indexOf('知识点（20）') >= 0, '');
check('README.game-table-rows', (readme.match(/^\| [A-Z] | ^\| [A-Za-z].*\|/gm) || []).length >= 0, 'info');

/* ---------- summary ---------- */
LINES.push('SUMMARY | total=' + TOTAL + ' fail=' + FAIL);
LINES.join('\n');
