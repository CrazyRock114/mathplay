/* MathPlay i18n core — detection, switching, DOM application */
window.I18N_LOCALES = [
  { code: 'en',    name: 'English' },
  { code: 'zh-CN', name: '简体中文' },
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'ja',    name: '日本語' },
  { code: 'zh',    name: '汉语' },
  { code: 'it',    name: 'Italiano' },
  { code: 'fr',    name: 'Français' },
  { code: 'de',    name: 'Deutsch' },
];

const I18n = {
  lang: 'en',          // stored/selected locale (may be the generic 'zh')
  resolved: 'en',      // concrete dictionary actually used
  listeners: [],

  available(code) {
    return window.I18N_LOCALES.some(l => l.code === code);
  },

  detect() {
    let c = null;
    try { c = localStorage.getItem('mp_lang'); } catch (e) { /* file:// or private mode */ }
    const u = new URLSearchParams(location.search).get('lang');
    if (u && this.available(u)) c = u;
    if (!c || !this.available(c)) {
      const n = navigator.language || 'en';
      c = this.available(n) ? n : (this.available(n.split('-')[0]) ? n.split('-')[0] : 'en');
    }
    return c;
  },

  /* generic "汉语" picks Simplified/Traditional from browser preference */
  resolve(code) {
    if (code === 'zh') {
      const n = (navigator.language || '').toLowerCase();
      return /zh-(tw|hk|mo|hant)/.test(n) ? 'zh-TW' : 'zh-CN';
    }
    return code;
  },

  set(code, save = true) {
    if (!this.available(code)) code = 'en';
    this.lang = code;
    this.resolved = this.resolve(code);
    if (save) { try { localStorage.setItem('mp_lang', code); } catch (e) {} }
    document.documentElement.lang = this.resolved;
    this.apply();
    this.listeners.forEach(fn => { try { fn(); } catch (e) { console.error(fn, e); } });
  },

  t(key, vars) {
    const dict = I18N_DATA[this.resolved] || I18N_DATA.en || {};
    let s = dict[key] != null ? dict[key] : (I18N_DATA.en[key] != null ? I18N_DATA.en[key] : key);
    if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
    return s;
  },

  name(code) {
    const l = window.I18N_LOCALES.find(l => l.code === code);
    return l ? l.name : code;
  },

  apply(root = document) {
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = this.t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = this.t(el.dataset.i18nPh); });
  },

  onChange(fn) { this.listeners.push(fn); },
};

/* colorful word-mark, shared by header and footer */
function renderLogo(node) {
  const colors = ['#ff4b57', '#ff8a3d', '#f5b40a', '#12b76a', '#2f7df6', '#8e5cf6', '#ec4899', '#0ea5a4'];
  node.innerHTML = '';
  'MathPlay'.split('').forEach((ch, i) => {
    const s = document.createElement('span');
    s.textContent = ch;
    s.style.color = colors[i % colors.length];
    node.appendChild(s);
  });
}

/* shared header behaviour: language menu, search, random, category nav */
function initHeader() {
  const logo = document.getElementById('logo');
  if (logo) renderLogo(logo);
  const footLogo = document.getElementById('footLogo');
  if (footLogo) renderLogo(footLogo);

  const menu = document.getElementById('langMenu');
  const btn = document.getElementById('langBtn');
  if (menu && btn) {
    menu.innerHTML = '';
    window.I18N_LOCALES.forEach(l => {
      const b = document.createElement('button');
      b.className = 'lang-opt' + (l.code === I18n.lang ? ' active' : '');
      b.innerHTML = '<span>' + l.name + '</span>' + (l.code === I18n.lang ? '<span class="check">✓</span>' : '');
      b.onclick = () => { I18n.set(l.code); menu.hidden = true; };
      menu.appendChild(b);
    });
    const label = document.getElementById('langName');
    if (label) label.textContent = I18n.name(I18n.lang);
    btn.onclick = e => { e.stopPropagation(); menu.hidden = !menu.hidden; };
    // bind the click-away closer exactly once (initHeader re-runs on every language change)
    if (!I18n._menuCloseBound) {
      I18n._menuCloseBound = true;
      document.addEventListener('click', () => {
        const m = document.getElementById('langMenu');
        if (m && !m.hidden) m.hidden = true;
      });
    }
  }

  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  if (form && input) {
    form.onsubmit = e => {
      e.preventDefault();
      if (!document.getElementById('grid')) { // game page → go home and search
        location.href = 'index.html?q=' + encodeURIComponent(input.value.trim());
      } else {
        input.blur();
      }
    };
  }

  const rnd = document.getElementById('randomBtn');
  if (rnd && window.GAMES) {
    rnd.onclick = () => {
      const g = window.GAMES[Math.floor(Math.random() * window.GAMES.length)];
      location.href = 'game.html?id=' + g.id;
    };
  }

  const nav = document.getElementById('catsNav');
  if (nav && window.CATS) {
    const cur = new URLSearchParams(location.search).get('cat') || 'all';
    nav.innerHTML = '';
    const mk = (label, href, active) => {
      const a = document.createElement('a');
      a.className = 'cat-pill' + (active ? ' active' : '');
      a.href = href;
      a.textContent = label;
      nav.appendChild(a);
    };
    mk(I18n.t('cat_all'), 'index.html', cur === 'all' && location.pathname.endsWith('index.html'));
    window.CATS.forEach(c => mk(I18n.t('cat_' + c.id), 'index.html?cat=' + c.id, cur === c.id));
  }
}
