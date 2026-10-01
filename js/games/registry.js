/* MathPlay — game registry, taxonomies, icons and shared game toolkit */
window.CATS = [
  { id: 'numbers',  hue: '#ff6b6b' },
  { id: 'logic',    hue: '#54a0ff' },
  { id: 'memory',   hue: '#a29bfe' },
  { id: 'skill',    hue: '#1dd1a1' },
  { id: 'strategy', hue: '#f368e0' },
  { id: 'puzzle',   hue: '#48dbfb' },
  { id: 'trivia',   hue: '#f9a825' },
  { id: 'multi',    hue: '#ff6b81' },
];

/* two-level math taxonomy: domains → knowledge points */
window.KNOWLEDGE_DOMAINS = [
  { id: 'd_num',   topics: ['addsub', 'mult', 'mixedops', 'fractions', 'decimals', 'percent', 'factors', 'powers'] },
  { id: 'd_alg',   topics: ['equations', 'patterns'] },
  { id: 'd_geo',   topics: ['geometry', 'angles', 'symmetry', 'coordinates'] },
  { id: 'd_meas',  topics: ['time', 'money'] },
  { id: 'd_think', topics: ['numsense', 'logicth', 'memory', 'reflex'] },
];

window.KNOWLEDGE = [
  { id: 'addsub',    color: '#ff6b6b' },
  { id: 'mult',      color: '#ff9f43' },
  { id: 'mixedops',  color: '#f368e0' },
  { id: 'fractions', color: '#a29bfe' },
  { id: 'decimals',  color: '#e5b200' },
  { id: 'percent',   color: '#e056fd' },
  { id: 'factors',   color: '#00c9a7' },
  { id: 'powers',    color: '#c98bd9' },
  { id: 'equations', color: '#0abde3' },
  { id: 'patterns',  color: '#1dd1a1' },
  { id: 'geometry',  color: '#54a0ff' },
  { id: 'angles',    color: '#ff9ff3' },
  { id: 'symmetry',  color: '#8d6fd1' },
  { id: 'coordinates', color: '#5f6b7a' },
  { id: 'time',      color: '#e77f67' },
  { id: 'money',     color: '#f6b93b' },
  { id: 'numsense',  color: '#00d2d3' },
  { id: 'logicth',   color: '#7d5fff' },
  { id: 'memory',    color: '#c44569' },
  { id: 'reflex',    color: '#57b96a' },
];

/* math ability taxonomy */
window.ABILITIES = [
  { id: 'calc' }, { id: 'logic' }, { id: 'spatial' }, { id: 'memory' },
  { id: 'focus' }, { id: 'reaction' }, { id: 'strategy' }, { id: 'estimation' },
];

window.GAMES = [
  { id: 'merge2048',  cat: 'numbers',  grad: ['#ff9966', '#ff5e62'], icon: 'merge',  featured: 1, hot: 1, bestHigh: 1, age: 8, diff: 2,
    knowledge: ['powers', 'mult', 'numsense'], abilities: ['calc', 'strategy', 'focus'] },
  { id: 'speedmath',  cat: 'numbers',  grad: ['#f7b733', '#fc4a1a'], icon: 'bolt',   featured: 1, hot: 1, bestHigh: 1, age: 7, diff: 2,
    knowledge: ['addsub', 'mult', 'mixedops'], abilities: ['calc', 'focus', 'reaction'] },
  { id: 'guess',      cat: 'numbers',  grad: ['#43cea2', '#185a9d'], icon: 'help',   fresh: 1, bestLow: 1, age: 6, diff: 1,
    knowledge: ['numsense'], abilities: ['logic', 'estimation'] },
  { id: 'fractions',  cat: 'numbers',  grad: ['#654ea3', '#eaafc8'], icon: 'fractions', fresh: 1, bestHigh: 1, age: 8, diff: 2,
    knowledge: ['fractions', 'numsense'], abilities: ['calc', 'estimation'] },
  { id: 'changeup',   cat: 'numbers',  grad: ['#f7971e', '#ffd200'], icon: 'coins',  fresh: 1, bestHigh: 1, age: 7, diff: 2,
    knowledge: ['money', 'decimals', 'addsub'], abilities: ['calc', 'estimation'] },
  { id: 'sequence',   cat: 'numbers',  grad: ['#2193b0', '#6dd5ed'], icon: 'sequence', fresh: 1, bestHigh: 1, age: 8, diff: 2,
    knowledge: ['patterns', 'powers', 'addsub', 'mult'], abilities: ['logic', 'estimation'] },
  { id: 'percent',    cat: 'numbers',  grad: ['#e55d87', '#5fc3e4'], icon: 'percent', fresh: 1, bestHigh: 1, age: 8, diff: 2,
    knowledge: ['percent', 'numsense'], abilities: ['calc', 'estimation'] },

  { id: 'minesweeper',cat: 'logic',    grad: ['#3a7bd5', '#00d2ff'], icon: 'mine',   bestLow: 1, age: 8, diff: 2,
    knowledge: ['logicth', 'numsense'], abilities: ['logic', 'focus'] },
  { id: 'sudoku',     cat: 'logic',    grad: ['#1d976c', '#93f9b9'], icon: 'grid6',  bestLow: 1, age: 8, diff: 3,
    knowledge: ['logicth'], abilities: ['logic', 'focus'] },
  { id: 'coords',     cat: 'logic',    grad: ['#141e30', '#4a69bd'], icon: 'coords', fresh: 1, bestHigh: 1, age: 7, diff: 2,
    knowledge: ['coordinates', 'logicth'], abilities: ['logic', 'spatial'] },
  { id: 'balance',    cat: 'logic',    grad: ['#3c4858', '#5f9ea0'], icon: 'scale',  fresh: 1, bestHigh: 1, age: 9, diff: 3,
    knowledge: ['equations', 'addsub', 'mult'], abilities: ['logic', 'calc'] },
  { id: 'clockrush',  cat: 'logic',    grad: ['#e96443', '#904e95'], icon: 'clockface', fresh: 1, bestHigh: 1, age: 6, diff: 1,
    knowledge: ['time'], abilities: ['calc', 'focus'] },
  { id: 'shapespy',   cat: 'logic',    grad: ['#4568dc', '#b06ab3'], icon: 'shapes', fresh: 1, bestHigh: 1, age: 6, diff: 1,
    knowledge: ['geometry', 'angles', 'symmetry'], abilities: ['logic', 'focus'] },

  { id: 'snake',      cat: 'skill',    grad: ['#00c9ff', '#92fe9d'], icon: 'snake',  featured: 1, hot: 1, bestHigh: 1, age: 6, diff: 2,
    knowledge: ['reflex', 'logicth'], abilities: ['reaction', 'focus'] },
  { id: 'whack',      cat: 'skill',    grad: ['#ff5858', '#f857a6'], icon: 'target', fresh: 1, bestHigh: 1, age: 5, diff: 1,
    knowledge: ['reflex'], abilities: ['reaction', 'focus'] },
  { id: 'reaction',   cat: 'skill',    grad: ['#11998e', '#38ef7d'], icon: 'clock',  fresh: 1, bestLow: 1, age: 5, diff: 1,
    knowledge: ['reflex'], abilities: ['reaction', 'focus'] },
  { id: 'runner',     cat: 'skill',    grad: ['#ff416c', '#ff4b2b'], icon: 'runner', fresh: 1, featured: 1, bestHigh: 1, age: 7, diff: 2,
    knowledge: ['addsub', 'mult', 'mixedops'], abilities: ['calc', 'reaction', 'focus'] },
  { id: 'angles',     cat: 'skill',    grad: ['#0f3443', '#34e89e'], icon: 'angles', fresh: 1, bestHigh: 1, age: 9, diff: 2,
    knowledge: ['angles', 'numsense'], abilities: ['estimation', 'spatial'] },
  { id: 'typing',     cat: 'skill',    grad: ['#7f7fd5', '#86a8e7'], icon: 'keys',   fresh: 1, bestHigh: 1, age: 6, diff: 1,
    knowledge: ['reflex', 'numsense'], abilities: ['reaction', 'focus'] },

  { id: 'memory',     cat: 'memory',   grad: ['#8e2de2', '#4a00e0'], icon: 'cards',  bestLow: 1, age: 4, diff: 1,
    knowledge: ['memory'], abilities: ['memory', 'focus'] },
  { id: 'simon',      cat: 'memory',   grad: ['#fc5c7d', '#6a82fb'], icon: 'pads',   bestHigh: 1, age: 5, diff: 2,
    knowledge: ['memory', 'patterns'], abilities: ['memory', 'focus'] },

  { id: 'tictactoe',  cat: 'strategy', grad: ['#ee0979', '#ff6a00'], icon: 'tictac', age: 5, diff: 1,
    knowledge: ['logicth'], abilities: ['strategy', 'logic'] },
  { id: 'connect4',   cat: 'strategy', grad: ['#396afc', '#2948ff'], icon: 'discs',  featured: 1, age: 6, diff: 2,
    knowledge: ['logicth'], abilities: ['strategy', 'logic', 'focus'] },
  { id: 'dots',       cat: 'strategy', grad: ['#5f2c82', '#49a09d'], icon: 'dots',   fresh: 1, bestHigh: 1, age: 7, diff: 2,
    knowledge: ['logicth', 'geometry'], abilities: ['strategy', 'logic', 'spatial'] },

  { id: 'blocks',     cat: 'puzzle',   grad: ['#4776e6', '#8e54e9'], icon: 'blocks', featured: 1, bestHigh: 1, age: 7, diff: 2,
    knowledge: ['geometry', 'symmetry', 'reflex'], abilities: ['spatial', 'focus', 'reaction'] },
  { id: 'sliding',    cat: 'puzzle',   grad: ['#ff512f', '#dd2476'], icon: 'tiles',  bestLow: 1, age: 7, diff: 2,
    knowledge: ['logicth'], abilities: ['logic', 'spatial', 'memory'] },

  { id: 'trivia',     cat: 'trivia',   grad: ['#f9a825', '#ff7043'], icon: 'quiz',   fresh: 1, hot: 1, featured: 1, bestHigh: 1, age: 7, diff: 2,
    knowledge: ['mixedops', 'factors', 'powers', 'time'], abilities: ['calc', 'memory'] },

  { id: 'duel',       cat: 'multi',    grad: ['#cb2d3e', '#ef473a'], icon: 'duel',   fresh: 1, hot: 1, age: 7, diff: 2,
    knowledge: ['addsub', 'mult', 'mixedops'], abilities: ['calc', 'reaction'] },
];

window.GameFactories = {};

/* ---------- local favorites (no account needed) ---------- */
const Favs = {
  all() { try { return JSON.parse(localStorage.getItem('mp_favs') || '[]'); } catch (e) { return []; } },
  has(id) { return this.all().includes(id); },
  toggle(id) {
    const a = this.all();
    const i = a.indexOf(id);
    if (i < 0) a.push(id); else a.splice(i, 1);
    try { localStorage.setItem('mp_favs', JSON.stringify(a)); } catch (e) {}
    return i < 0;
  },
};

/* ---------- inline SVG icons (original, drawn for MathPlay) ---------- */
const MP_ICONS = {
  merge: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="6" width="16" height="16" rx="4" fill="#fff" opacity=".55"/><rect x="26" y="6" width="16" height="16" rx="4" fill="#fff"/><rect x="6" y="26" width="16" height="16" rx="4" fill="#fff"/><rect x="26" y="26" width="16" height="16" rx="4" fill="#fff" opacity=".75"/><text x="34" y="18.5" font-size="12" font-weight="800" fill="#ff5e62" text-anchor="middle">2</text><text x="14" y="38.5" font-size="12" font-weight="800" fill="#ff5e62" text-anchor="middle">4</text></svg>',
  bolt: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M27 3 10 27h9l-3 18 22-27h-10l5-15z" fill="#fff"/></svg>',
  help: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="19" fill="#fff"/><text x="24" y="32" font-size="24" font-weight="800" fill="#185a9d" text-anchor="middle">?</text></svg>',
  snake: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 37c0-6 6-6 12-6s12 0 12-6-6-6-12-6-12 0-12-6" stroke="#fff" stroke-width="6" stroke-linecap="round"/><circle cx="9" cy="9" r="4.5" fill="#fff"/></svg>',
  target: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="19" stroke="#fff" stroke-width="3.5"/><circle cx="24" cy="24" r="11" stroke="#fff" stroke-width="3.5"/><circle cx="24" cy="24" r="4" fill="#fff"/></svg>',
  clock: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="27" r="16" stroke="#fff" stroke-width="3.5"/><path d="M24 18v9l6 4" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/><path d="M19 4h10M24 4v7" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/></svg>',
  cards: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="7" y="10" width="20" height="28" rx="4" fill="#fff" opacity=".55" transform="rotate(-8 17 24)"/><rect x="21" y="10" width="20" height="28" rx="4" fill="#fff"/><circle cx="31" cy="24" r="5" fill="#4a00e0"/></svg>',
  pads: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="6" width="17" height="17" rx="5" fill="#fff" opacity=".95"/><rect x="25" y="6" width="17" height="17" rx="5" fill="#fff" opacity=".6"/><rect x="6" y="25" width="17" height="17" rx="5" fill="#fff" opacity=".6"/><rect x="25" y="25" width="17" height="17" rx="5" fill="#fff" opacity=".95"/></svg>',
  mine: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="26" r="12" fill="#fff"/><g stroke="#fff" stroke-width="3.5" stroke-linecap="round"><path d="M24 8v6M24 38v6M6 26h6M36 26h6M11 13l4 4M37 13l-4 4M11 39l4-4M37 39l-4-4"/></g><circle cx="20" cy="22" r="3" fill="#3a7bd5"/></svg>',
  grid6: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="6" width="36" height="36" rx="5" stroke="#fff" stroke-width="3"/><path d="M18 6v36M30 6v36M6 18h36M6 30h36" stroke="#fff" stroke-width="2"/><rect x="19" y="7" width="10" height="10" fill="#fff" opacity=".85"/><rect x="31" y="31" width="10" height="10" fill="#fff" opacity=".85"/></svg>',
  tictac: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 6v36M31 6v36M6 17h36M6 31h36" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M9 8l6 6M15 8l-6 6" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="24" r="4" stroke="#fff" stroke-width="3"/><path d="M33 33l6 6M39 33l-6 6" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>',
  discs: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="36" r="6.5" fill="#fff"/><circle cx="24" cy="36" r="6.5" fill="#fff" opacity=".55"/><circle cx="24" cy="22" r="6.5" fill="#fff"/><circle cx="36" cy="22" r="6.5" fill="#fff" opacity=".55"/><circle cx="36" cy="8" r="6.5" fill="#fff"/></svg>',
  blocks: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="30" width="10" height="10" rx="2" fill="#fff"/><rect x="18" y="30" width="10" height="10" rx="2" fill="#fff" opacity=".6"/><rect x="30" y="30" width="10" height="10" rx="2" fill="#fff"/><rect x="30" y="18" width="10" height="10" rx="2" fill="#fff" opacity=".85"/><rect x="30" y="6" width="10" height="10" rx="2" fill="#fff" opacity=".6"/></svg>',
  tiles: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="6" width="16" height="16" rx="3" fill="#fff" opacity=".55"/><rect x="26" y="6" width="16" height="16" rx="3" fill="#fff"/><text x="34" y="18.5" font-size="11" font-weight="800" fill="#dd2476" text-anchor="middle">3</text><rect x="6" y="26" width="16" height="16" rx="3" fill="#fff"/><text x="14" y="38.5" font-size="11" font-weight="800" fill="#dd2476" text-anchor="middle">1</text><rect x="26" y="26" width="16" height="16" rx="3" fill="#fff" opacity=".55"/></svg>',
  quiz: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 5a12.5 12.5 0 0 0-7.5 22.5c1.2.9 2 2.2 2.3 3.5h10.4c.3-1.3 1.1-2.6 2.3-3.5A12.5 12.5 0 0 0 24 5z" fill="#fff"/><rect x="18.5" y="34" width="11" height="3.2" rx="1.6" fill="#fff"/><rect x="20" y="39.5" width="8" height="3.2" rx="1.6" fill="#fff" opacity=".7"/></svg>',
  runner: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="8" width="7" height="32" rx="3" fill="#fff" opacity=".45"/><rect x="19" y="8" width="7" height="32" rx="3" fill="#fff"/><rect x="33" y="8" width="7" height="32" rx="3" fill="#fff" opacity=".45"/><path d="M12 40h20m0 0-4.5-4.5M32 40l-4.5 4.5" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>',
  angles: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 40h34" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M12 40a26 26 0 0 1 22-22" stroke="#fff" stroke-width="2.5" stroke-dasharray="4 4"/><rect x="9" y="36" width="20" height="7" rx="2.5" fill="#fff" transform="rotate(-40 12 40)"/><circle cx="35" cy="15" r="3.5" fill="#fff"/></svg>',
  coords: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="10" width="32" height="30" rx="4" stroke="#fff" stroke-width="3"/><path d="M8 25h32M24 10v30" stroke="#fff" stroke-width="2" opacity=".7"/><circle cx="33" cy="17" r="4.5" fill="#fff"/><path d="M33 22v5" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>',
  fractions: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="22" r="15" stroke="#fff" stroke-width="3"/><path d="M24 22V7a15 15 0 0 1 15 15z" fill="#fff"/><text x="24" y="44" font-size="14" font-weight="800" fill="#fff" text-anchor="middle">1/2</text></svg>',
  clockface: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="18" stroke="#fff" stroke-width="3.5"/><path d="M24 24V13M24 24l7.5 5.5" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="24" r="2.5" fill="#fff"/></svg>',
  coins: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="17" cy="36" rx="11" ry="4.5" fill="#fff"/><path d="M6 32v4c0 2.5 4.9 4.5 11 4.5S28 38.5 28 36v-4" fill="#fff"/><ellipse cx="17" cy="32" rx="11" ry="4.5" fill="#fff" opacity=".85"/><ellipse cx="33" cy="17" rx="9" ry="3.8" fill="#fff"/><path d="M24 13.5v3.5c0 2 4 3.8 9 3.8s9-1.8 9-3.8v-3.5" fill="#fff" opacity=".8"/></svg>',
  scale: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 8v28" stroke="#fff" stroke-width="3"/><path d="M11 14h26" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M11 14l-5.5 10h11z" fill="#fff"/><path d="M37 14l-5.5 10h11z" fill="#fff"/><rect x="15" y="36" width="18" height="4.5" rx="2.2" fill="#fff"/></svg>',
  sequence: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="24" r="3.5" fill="#fff" opacity=".45"/><circle cx="19" cy="24" r="4" fill="#fff" opacity=".7"/><circle cx="31" cy="24" r="4.5" fill="#fff"/><path d="M38 24h5m0 0-3.2-3.2M43 24l-3.2 3.2" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>',
  duel: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="13" width="18" height="22" rx="5" fill="#fff"/><rect x="26" y="13" width="18" height="22" rx="5" fill="#fff" opacity=".55"/><text x="13" y="29" font-size="11" font-weight="800" fill="#cb2d3e" text-anchor="middle">P1</text><text x="35" y="29" font-size="11" font-weight="800" fill="#cb2d3e" text-anchor="middle">P2</text></svg>',
  dots: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><g fill="#fff"><circle cx="10" cy="10" r="3"/><circle cx="24" cy="10" r="3"/><circle cx="38" cy="10" r="3"/><circle cx="10" cy="24" r="3"/><circle cx="24" cy="24" r="3"/><circle cx="38" cy="24" r="3"/><circle cx="10" cy="38" r="3"/><circle cx="24" cy="38" r="3"/><circle cx="38" cy="38" r="3"/></g><path d="M10 10h14M10 24h14M10 10v14" stroke="#fff" stroke-width="2.5"/></svg>',
  shapes: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 5 34 30H6z" fill="#fff" opacity=".85"/><circle cx="32" cy="31" r="11" fill="#fff"/><rect x="7" y="30" width="13" height="13" rx="2" fill="#fff" opacity=".6"/></svg>',
  percent: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="7" stroke="#fff" stroke-width="3.5"/><circle cx="34" cy="34" r="7" stroke="#fff" stroke-width="3.5"/><path d="M38 10 10 38" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/></svg>',
  keys: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="12" width="40" height="26" rx="5" fill="#fff"/><g fill="#3c4858"><rect x="10" y="18" width="4" height="4" rx="1"/><rect x="17" y="18" width="4" height="4" rx="1"/><rect x="24" y="18" width="4" height="4" rx="1"/><rect x="31" y="18" width="4" height="4" rx="1"/><rect x="10" y="25" width="4" height="4" rx="1"/><rect x="17" y="25" width="4" height="4" rx="1"/><rect x="24" y="25" width="4" height="4" rx="1"/><rect x="31" y="25" width="4" height="4" rx="1"/><rect x="14" y="32" width="20" height="3.5" rx="1.7"/></g></svg>',
};

function mpIcon(name) { return MP_ICONS[name] || MP_ICONS.target; }

function knowledgeColor(id) {
  const k = window.KNOWLEDGE.find(k => k.id === id);
  return k ? k.color : '#69707d';
}

function domainOf(topicId) {
  const d = window.KNOWLEDGE_DOMAINS.find(d => d.topics.includes(topicId));
  return d ? d.id : null;
}

/* ---------- shared helpers ---------- */
const GameKit = {
  el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  },

  getBest(id) {
    try { return +(localStorage.getItem('mp_best_' + id) || 0); } catch (e) { return 0; }
  },

  /* submit a result; returns {isBest, value} — bestHigh for scores, bestLow for times/moves */
  submit(id, v, higherBetter) {
    const cur = this.getBest(id);
    if (v == null) return { isBest: false, value: cur };
    const better = cur === 0 ? true : (higherBetter ? v > cur : v < cur);
    if (better) {
      try { localStorage.setItem('mp_best_' + id, String(v)); } catch (e) {}
      return { isBest: true, value: v };
    }
    return { isBest: false, value: cur };
  },

  fmtTime(sec) {
    sec = Math.max(0, Math.floor(sec));
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  },

  hud(stage, chips) {
    const bar = this.el('div', 'g-hud');
    const map = {};
    chips.forEach(([key, label]) => {
      const b = this.el('b', null, '0');
      const c = this.el('div', 'g-chip', label + ' ');
      c.appendChild(b);
      bar.appendChild(c);
      map[key] = v => { b.textContent = v; };
    });
    stage.appendChild(bar);
    return map;
  },

  overlay(stage, opt) {
    const ov = this.el('div', 'g-overlay');
    const card = this.el('div', 'g-overlay-card');
    card.appendChild(this.el('div', 'g-overlay-title', opt.title));
    if (opt.stats) {
      const row = this.el('div', 'g-overlay-stats');
      opt.stats.forEach(([k, v]) => row.appendChild(this.el('div', 'g-chip', k + ' <b>' + v + '</b>')));
      card.appendChild(row);
    }
    if (opt.msg) card.appendChild(this.el('p', 'g-overlay-msg', opt.msg));
    const btn = this.el('button', 'g-btn primary', opt.btnLabel);
    btn.onclick = opt.onBtn;
    card.appendChild(btn);
    ov.appendChild(card);
    stage.appendChild(ov);
    return ov;
  },

  dpad(stage, handler, opts = {}) {
    const d = this.el('div', 'g-dpad' + (opts.rotate ? ' has-rot' : ''));
    const mk = (lbl, dir, cls) => {
      const b = this.el('button', 'g-dpad-btn ' + cls, lbl);
      b.addEventListener('pointerdown', e => { e.preventDefault(); handler(dir); });
      d.appendChild(b);
    };
    mk('▲', 'up', 'u'); mk('◀', 'left', 'l'); mk('▼', 'down', 'd'); mk('▶', 'right', 'r');
    if (opts.rotate) mk('⟳', 'rot', 'rot');
    stage.appendChild(d);
    return d;
  },

  swipe(node, cb) {
    let sx = 0, sy = 0;
    node.addEventListener('touchstart', e => {
      const t = e.touches[0]; sx = t.clientX; sy = t.clientY;
    }, { passive: true });
    node.addEventListener('touchend', e => {
      const t = e.changedTouches[0];
      const dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
      cb(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    }, { passive: true });
  },

  keys(handler) { /* arrow/wasd/space capture; returns remover */
    const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', ' ': 'space' };
    const fn = e => {
      const tgt = e.target;
      if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA' || tgt.isContentEditable)) return;
      const dir = map[e.key] || map[e.key.toLowerCase()];
      if (dir) { e.preventDefault(); handler(dir, e); }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  },

  lives(n, max) { /* hearts row updater */
    return v => {
      const full = '❤️'.repeat(v), empty = '🖤'.repeat(Math.max(0, max - v));
      n.textContent = full + empty;
    };
  },
};

/* ---------- tile renderer shared by home & related grids ---------- */
function tileEl(meta) {
  const a = GameKit.el('a', 'tile');
  a.href = 'game.html?id=' + meta.id;
  const thumb = GameKit.el('div', 'tile-thumb');
  thumb.style.background = 'linear-gradient(135deg,' + meta.grad[0] + ',' + meta.grad[1] + ')';
  thumb.innerHTML = mpIcon(meta.icon);
  thumb.appendChild(GameKit.el('span', 'tile-cat', I18n.t('cat_' + meta.cat)));
  if (meta.fresh) thumb.appendChild(GameKit.el('span', 'tile-badge new', I18n.t('tile_new')));
  else if (meta.hot) thumb.appendChild(GameKit.el('span', 'tile-badge hot', I18n.t('tile_hot')));
  const fav = GameKit.el('button', 'fav-btn' + (Favs.has(meta.id) ? ' on' : ''), Favs.has(meta.id) ? '❤️' : '♡');
  fav.title = I18n.t('fav_add');
  fav.setAttribute('aria-label', I18n.t('fav_add'));
  fav.onclick = e => {
    e.preventDefault(); e.stopPropagation();
    const on = Favs.toggle(meta.id);
    fav.classList.toggle('on', on);
    fav.textContent = on ? '❤️' : '♡';
    document.dispatchEvent(new CustomEvent('mp:favs'));
  };
  thumb.appendChild(fav);
  a.appendChild(thumb);
  a.appendChild(GameKit.el('div', 'tile-name', I18n.t('g_' + meta.id + '_t')));
  if (meta.knowledge && meta.knowledge.length) {
    const row = GameKit.el('div', 'tile-tags');
    meta.knowledge.slice(0, 2).forEach(kid => {
      row.appendChild(GameKit.el('span', 'mini-tag',
        '<i style="background:' + knowledgeColor(kid) + '"></i>' + I18n.t('kn_' + kid)));
    });
    a.appendChild(row);
  }
  return a;
}
