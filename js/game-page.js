/* MathPlay game page — loads a game by ?id=, renders tags, favorites and the game */
(function () {
  I18n.set(I18n.detect(), false);
  I18n.apply();
  initHeader();

  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const meta = GAMES.find(g => g.id === id) || null;

  const stage = document.getElementById('stage');
  const titleEl = document.getElementById('gTitle');
  const catEl = document.getElementById('gCat');
  const thumbEl = document.getElementById('gThumb');
  const playsEl = document.getElementById('gPlays');
  const ageEl = document.getElementById('gAge');
  const diffEl = document.getElementById('gDiff');
  const favBtn = document.getElementById('favBtn');
  const howEl = document.getElementById('gHow');
  const tagsCard = document.getElementById('tagsCard');
  const relatedGrid = document.getElementById('relatedGrid');
  let instance = null;

  function addPlay() {
    if (!meta) return;
    let p = {}, last = {};
    try { p = JSON.parse(localStorage.getItem('mp_plays') || '{}'); } catch (e) {}
    try { last = JSON.parse(localStorage.getItem('mp_last') || '{}'); } catch (e) {}
    p[meta.id] = (p[meta.id] || 0) + 1;
    last[meta.id] = Date.now();
    try { localStorage.setItem('mp_plays', JSON.stringify(p)); } catch (e) {}
    try { localStorage.setItem('mp_last', JSON.stringify(last)); } catch (e) {}
    return p[meta.id];
  }
  function getPlays() {
    try { return (JSON.parse(localStorage.getItem('mp_plays') || '{}'))[meta.id] || 0; }
    catch (e) { return 0; }
  }

  function renderFav() {
    if (!meta || !favBtn) return;
    const on = Favs.has(meta.id);
    favBtn.textContent = on ? '❤️ ' + I18n.t('fav_saved') : '♡ ' + I18n.t('fav_add');
    favBtn.classList.toggle('on', on);
  }

  function renderRelated() {
    if (!meta) return;
    const same = GAMES.filter(g => g.id !== meta.id && g.cat === meta.cat);
    const rest = GAMES.filter(g => g.id !== meta.id && g.cat !== meta.cat);
    const pick = same.concat(rest.sort(() => Math.random() - 0.5)).slice(0, 8);
    relatedGrid.innerHTML = '';
    pick.forEach(g => relatedGrid.appendChild(tileEl(g)));
  }

  /* tags card, knowledge chips grouped by domain */
  function renderTags() {
    if (!meta) return;
    tagsCard.innerHTML = '';
    tagsCard.appendChild(GameKit.el('h2', null, '🏷️ ' + I18n.t('game_tags')));

    const ks = meta.knowledge || [];
    KNOWLEDGE_DOMAINS.forEach(d => {
      const inDom = d.topics.filter(tid => ks.includes(tid));
      if (!inDom.length) return;
      const row = GameKit.el('div', 'tag-row');
      row.appendChild(GameKit.el('span', 'tag-label', I18n.t(d.id)));
      const chips = GameKit.el('div', 'tag-chips');
      inDom.forEach(tid => {
        chips.appendChild(GameKit.el('span', 'tag-chip',
          '<i style="background:' + knowledgeColor(tid) + '"></i>' + I18n.t('kn_' + tid)));
      });
      row.appendChild(chips);
      tagsCard.appendChild(row);
    });

    if ((meta.abilities || []).length) {
      const rowA = GameKit.el('div', 'tag-row');
      rowA.appendChild(GameKit.el('span', 'tag-label', I18n.t('tags_ability')));
      const chipsA = GameKit.el('div', 'tag-chips');
      meta.abilities.forEach(aid => {
        chipsA.appendChild(GameKit.el('span', 'tag-chip gray', I18n.t('ab_' + aid)));
      });
      rowA.appendChild(chipsA);
      tagsCard.appendChild(rowA);
    }
  }

  function renderTexts() {
    if (!meta) return;
    document.title = I18n.t('title_game', { game: I18n.t('g_' + meta.id + '_t') });
    titleEl.textContent = I18n.t('g_' + meta.id + '_t');
    const cat = CATS.find(c => c.id === meta.cat);
    catEl.textContent = I18n.t('cat_' + meta.cat);
    catEl.style.background = cat ? cat.hue : '#69707d';
    playsEl.textContent = I18n.t('game_plays', { n: getPlays() });
    ageEl.textContent = '🎂 ' + I18n.t('game_age', { n: meta.age });
    diffEl.textContent = '⭐ ' + I18n.t('game_difficulty') + ' ' + '★'.repeat(meta.diff) + '☆'.repeat(3 - meta.diff);
    howEl.textContent = I18n.t('g_' + meta.id + '_h');
    renderTags();
    renderFav();
  }

  if (!meta) {
    stage.innerHTML = '';
    stage.appendChild(GameKit.el('div', 'g-overlay-card',
      '<div class="g-overlay-title">🎲 ' + I18n.t('game_notfound') + '</div>' +
      '<p class="g-overlay-msg">' + I18n.t('game_notfound_hint') + '</p>' +
      '<a class="g-btn primary" href="index.html">' + I18n.t('game_back') + '</a>'));
    document.title = I18n.t('title_home');
  } else {
    thumbEl.style.background = 'linear-gradient(135deg,' + meta.grad[0] + ',' + meta.grad[1] + ')';
    thumbEl.innerHTML = mpIcon(meta.icon);
    renderTexts();
    addPlay();
    playsEl.textContent = I18n.t('game_plays', { n: getPlays() });

    if (favBtn) favBtn.onclick = () => { Favs.toggle(meta.id); renderFav(); };

    const s = document.createElement('script');
    s.src = 'js/games/' + meta.id + '.js';
    s.onload = () => {
      if (instance && instance.destroy) instance.destroy();
      stage.innerHTML = '';
      instance = GameFactories[meta.id](stage, { t: (k, v) => I18n.t(k, v), meta });
    };
    s.onerror = () => {
      stage.innerHTML = '';
      stage.appendChild(GameKit.el('div', 'g-overlay-card',
        '<div class="g-overlay-title">' + I18n.t('game_notfound') + '</div>'));
    };
    document.head.appendChild(s);
  }

  I18n.onChange(() => {
    I18n.apply();
    initHeader();
    renderTexts();
    renderRelated();
    // rebuild the running game so its labels follow the new language
    if (meta && GameFactories[meta.id]) {
      if (instance && instance.destroy) instance.destroy();
      stage.innerHTML = '';
      instance = GameFactories[meta.id](stage, { t: (k, v) => I18n.t(k, v), meta });
    }
  });

  if (meta) renderRelated();
})();
