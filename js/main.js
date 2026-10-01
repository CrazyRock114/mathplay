/* MathPlay home page — carousel, category + domain/topic filters, favorites, search */
(function () {
  const state = { cat: 'all', knowledge: 'all', fav: false, q: '' };
  const params = new URLSearchParams(location.search);
  if (params.get('cat') && CATS.some(c => c.id === params.get('cat'))) state.cat = params.get('cat');
  if (params.get('q')) {
    state.q = params.get('q');
    const input = document.getElementById('searchInput');
    if (input) input.value = state.q;
  }

  I18n.set(I18n.detect(), false);
  I18n.apply();
  initHeader();
  addFavChip();

  const hero = document.getElementById('hero');
  const grid = document.getElementById('grid');
  const knowNav = document.getElementById('knowNav');
  const topicNav = document.getElementById('topicNav');
  const recentSection = document.getElementById('recentSection');
  const recentRow = document.getElementById('recentRow');
  const noResult = document.getElementById('noResult');
  let heroTimer = null, heroIdx = 0, heroCount = 0;

  /* ---------- favorites chip lives at the head of the category row ---------- */
  function addFavChip() {
    const nav = document.getElementById('catsNav');
    if (!nav) return;
    const old = document.getElementById('favChip');
    if (old) old.remove();
    const b = GameKit.el('button', 'cat-pill' + (state.fav ? ' active' : ''), '❤️ ' + I18n.t('fav_title'));
    b.id = 'favChip';
    b.onclick = () => { state.fav = !state.fav; addFavChip(); renderGrid(); };
    nav.prepend(b);
  }

  /* ---------- domain → topic two-level filter ---------- */
  function activeDomain() {
    if (state.knowledge === 'all') return null;
    if (state.knowledge.startsWith('d_')) return state.knowledge;
    return domainOf(state.knowledge);
  }

  function renderKnowledgeRows() {
    if (knowNav) {
      knowNav.innerHTML = '';
      const mkDomain = (id, active) => {
        const label = id === 'all' ? I18n.t('cat_all') : I18n.t(id);
        const b = GameKit.el('button', 'know-chip domain' + (active ? ' active' : ''), label);
        b.onclick = () => {
          state.knowledge = id;
          renderKnowledgeRows(); renderGrid();
        };
        knowNav.appendChild(b);
      };
      mkDomain('all', state.knowledge === 'all');
      KNOWLEDGE_DOMAINS.forEach(d => mkDomain(d.id, activeDomain() === d.id));
    }
    if (topicNav) {
      topicNav.innerHTML = '';
      const dom = activeDomain();
      const domains = dom ? KNOWLEDGE_DOMAINS.filter(d => d.id === dom) : KNOWLEDGE_DOMAINS;
      domains.forEach(d => {
        d.topics.forEach(tid => {
          const count = GAMES.filter(g => (g.knowledge || []).includes(tid)).length;
          const b = GameKit.el('button', 'know-chip' + (state.knowledge === tid ? ' active' : ''),
            '<i style="background:' + knowledgeColor(tid) + '"></i>' + I18n.t('kn_' + tid) + '<em>' + count + '</em>');
          if (state.knowledge === tid) b.style.borderColor = knowledgeColor(tid);
          b.onclick = () => { state.knowledge = tid; renderKnowledgeRows(); renderGrid(); };
          topicNav.appendChild(b);
        });
      });
    }
  }

  /* ---------- recently played row ---------- */
  function renderRecent() {
    if (!recentSection || !recentRow) return;
    let last = {};
    try { last = JSON.parse(localStorage.getItem('mp_last') || '{}'); } catch (e) {}
    const ids = Object.keys(last).sort((a, b) => last[b] - last[a]).slice(0, 8)
      .map(id => GAMES.find(g => g.id === id)).filter(Boolean);
    recentSection.hidden = ids.length === 0;
    recentRow.innerHTML = '';
    ids.forEach(g => {
      const a = GameKit.el('a', 'recent-item');
      a.href = 'game.html?id=' + g.id;
      const th = GameKit.el('div', 'recent-thumb');
      th.style.background = 'linear-gradient(135deg,' + g.grad[0] + ',' + g.grad[1] + ')';
      th.innerHTML = mpIcon(g.icon);
      a.appendChild(th);
      a.appendChild(GameKit.el('span', 'recent-name', I18n.t('g_' + g.id + '_t')));
      recentRow.appendChild(a);
    });
  }

  function renderCarousel() {
    if (heroTimer) clearInterval(heroTimer);
    heroIdx = 0;
    const featured = GAMES.filter(g => g.featured);
    heroCount = featured.length;
    const track = GameKit.el('div', 'hero-track');
    featured.forEach(g => {
      const slide = GameKit.el('div', 'hero-slide');
      slide.style.background = 'linear-gradient(120deg,' + g.grad[0] + ',' + g.grad[1] + ')';
      slide.innerHTML =
        '<div class="hero-info">' +
        '<div class="hero-kicker">' + I18n.t('home_featured') + '</div>' +
        '<div class="hero-title">' + I18n.t('g_' + g.id + '_t') + '</div>' +
        '<p class="hero-desc">' + I18n.t('g_' + g.id + '_d') + '</p>' +
        '<a class="btn-play" href="game.html?id=' + g.id + '">▶ ' + I18n.t('play_now') + '</a>' +
        '</div>' +
        '<div class="hero-art">' + mpIcon(g.icon) + '</div>';
      track.appendChild(slide);
    });
    const frame = GameKit.el('div', 'hero-frame');
    frame.appendChild(track);
    frame.insertAdjacentHTML('beforeend',
      '<button class="hero-arrow prev" aria-label="prev">‹</button>' +
      '<button class="hero-arrow next" aria-label="next">›</button>' +
      '<div class="hero-dots">' + featured.map(() => '<span class="dot"></span>').join('') + '</div>');
    hero.innerHTML = '';
    hero.appendChild(frame);

    const dots = frame.querySelectorAll('.dot');
    const show = i => {
      heroIdx = (i + heroCount) % heroCount;
      track.style.transform = 'translateX(-' + heroIdx * 100 + '%)';
      dots.forEach((d, k) => d.classList.toggle('active', k === heroIdx));
    };
    frame.querySelector('.prev').onclick = () => show(heroIdx - 1);
    frame.querySelector('.next').onclick = () => show(heroIdx + 1);
    dots.forEach((d, k) => d.onclick = () => show(k));
    show(0);
    heroTimer = setInterval(() => show(heroIdx + 1), 5000);
  }

  function renderGrid() {
    grid.innerHTML = '';
    const q = state.q.trim().toLowerCase();
    const list = GAMES.filter(g => {
      if (state.cat !== 'all' && g.cat !== state.cat) return false;
      if (state.fav && !Favs.has(g.id)) return false;
      if (state.knowledge !== 'all') {
        const ks = g.knowledge || [];
        if (state.knowledge.startsWith('d_')) {
          if (!ks.some(k => domainOf(k) === state.knowledge)) return false;
        } else if (!ks.includes(state.knowledge)) return false;
      }
      if (!q) return true;
      const haystack = [
        I18n.t('g_' + g.id + '_t'),
        I18N_DATA.en['g_' + g.id + '_t'],
        I18n.t('g_' + g.id + '_d'),
        I18N_DATA.en['g_' + g.id + '_d'],
        I18n.t('cat_' + g.cat),
        ...(g.knowledge || []).map(k => I18n.t('kn_' + k)),
      ].join(' ').toLowerCase();
      return haystack.includes(q);
    });
    list.forEach(g => grid.appendChild(tileEl(g)));
    noResult.hidden = list.length > 0;
    if (!noResult.hidden && state.fav) noResult.textContent = I18n.t('fav_empty');
    else if (!noResult.hidden) noResult.textContent = I18n.t('search_none');
  }

  document.getElementById('searchInput').addEventListener('input', e => {
    state.q = e.target.value;
    renderGrid();
  });

  document.addEventListener('mp:favs', renderGrid);

  I18n.onChange(() => {
    I18n.apply();
    initHeader();
    addFavChip();
    document.title = I18n.t('title_home');
    renderCarousel();
    renderKnowledgeRows();
    renderRecent();
    renderGrid();
  });

  document.title = I18n.t('title_home');
  renderCarousel();
  renderKnowledgeRows();
  renderRecent();
  renderGrid();
})();
