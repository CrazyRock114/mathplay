/* Dots & Boxes vs computer — classic paper game, original implementation */
GameFactories.dots = function (stage, ctx) {
  const t = ctx.t;
  const D = 4;                 // 4×4 dots → 3×3 boxes
  const BOXES = D - 1;
  let edges, owners, myTurn, over, captureChain;

  const hud = GameKit.hud(stage, [['you', t('players_p1')], ['cpu', t('players_p2')]]);

  const boardEl = GameKit.el('div', 'dots-board');
  stage.appendChild(boardEl);
  stage.appendChild(GameKit.el('div', 'g-note', '👆'));

  /* edges: horizontal[D][BOXES] and vertical[BOXES][D]; stored flat */
  const H = (r, c) => 'h' + r + '_' + c;
  const V = (r, c) => 'v' + r + '_' + c;
  const edgeOwner = k => edges[k];
  const boxEdges = (r, c) => [H(r, c), H(r + 1, c), V(r, c), V(r, c + 1)];
  const boxComplete = (r, c) => boxEdges(r, c).every(k => edges[k]);
  const boxCount = (r, c) => boxEdges(r, c).filter(k => edges[k]).length;

  function buildDOM() {
    boardEl.innerHTML = '';
    boardEl.style.gridTemplateColumns = '26px repeat(' + BOXES + ', 44px) 26px';
    boardEl.style.gridTemplateRows = '26px repeat(' + BOXES + ', 44px) 26px';
    const dotAt = (gr, gc) => (gr % 2 === 0 && gc % 2 === 0);
    for (let gr = 0; gr < 2 * D - 1; gr++) {
      for (let gc = 0; gc < 2 * D - 1; gc++) {
        if (dotAt(gr, gc)) {
          boardEl.appendChild(GameKit.el('div', 'dots-dot'));
          continue;
        }
        let key;
        if (gr % 2 === 0) key = H(gr / 2, (gc - 1) / 2);       // horizontal edge
        else key = V((gr - 1) / 2, gc / 2);                     // vertical edge
        const e = GameKit.el('button', 'dots-edge' + (gr % 2 === 0 ? ' h' : ' v'));
        e.dataset.key = key;
        e.onclick = () => takeEdge(key, e);
        boardEl.appendChild(e);
      }
    }
    // box owner cells overlay
    for (let r = 0; r < BOXES; r++) {
      for (let c = 0; c < BOXES; c++) {
        const cell = GameKit.el('div', 'dots-box', '');
        cell.dataset.box = r + '_' + c;
        boardEl.appendChild(cell);
      }
    }
    // order overlay cells absolutely via CSS grid positioning
    const overlay = boardEl.querySelectorAll('.dots-box');
    overlay.forEach(cell => {
      const [r, c] = cell.dataset.box.split('_').map(Number);
      cell.style.gridRow = (2 * r + 2) + ' / span 1';
      cell.style.gridColumn = (2 * c + 2) + ' / span 1';
    });
  }

  function paint() {
    boardEl.querySelectorAll('.dots-edge').forEach(e => {
      if (edges[e.dataset.key]) e.classList.add('taken');
    });
    boardEl.querySelectorAll('.dots-box').forEach(cell => {
      const [r, c] = cell.dataset.box.split('_').map(Number);
      const o = owners[r * BOXES + c];
      cell.className = 'dots-box' + (o === 1 ? ' mine' : o === 2 ? ' theirs' : '');
      cell.textContent = o === 1 ? '1' : o === 2 ? '2' : '';
    });
  }

  function allEdges() {
    const keys = [];
    for (let r = 0; r < D; r++) for (let c = 0; c < BOXES; c++) if (!edges[H(r, c)]) keys.push(H(r, c));
    for (let r = 0; r < BOXES; r++) for (let c = 0; c < D; c++) if (!edges[V(r, c)]) keys.push(V(r, c));
    return keys;
  }

  function completesAny(k) { // would taking edge k complete boxes?
    for (let r = 0; r < BOXES; r++) for (let c = 0; c < BOXES; c++) {
      if (boxEdges(r, c).includes(k) && boxCount(r, c) === 3) return [r, c];
    }
    return null;
  }

  function applyEdge(k, player) {
    edges[k] = player;
    let extra = false;
    for (let r = 0; r < BOXES; r++) for (let c = 0; c < BOXES; c++) {
      if (boxEdges(r, c).includes(k) && boxComplete(r, c) && !owners[r * BOXES + c]) {
        owners[r * BOXES + c] = player;
        extra = true;
      }
    }
    return extra;
  }

  function takeEdge(key, el) {
    if (over || !myTurn || edges[key]) return;
    const extra = applyEdge(key, 1);
    paint();
    updateHud();
    if (checkEnd()) return;
    if (extra) return;           // capturing grants another turn
    myTurn = false;
    setTimeout(computerTurn, 450);
  }

  function computerTurn() {
    if (over) return;
    const keys = allEdges();
    // 1. take any completing edge
    let pick = keys.find(k => completesAny(k));
    // 2. avoid handing a 3-sided box
    if (!pick) {
      const safe = keys.filter(k => !givesThird(k));
      pick = (safe.length ? safe : keys)[Math.floor(Math.random() * (safe.length || keys.length))];
    }
    const extra = applyEdge(pick, 2);
    paint();
    updateHud();
    if (checkEnd()) return;
    if (extra) return setTimeout(computerTurn, 450);
    myTurn = true;
  }

  function givesThird(k) {
    for (let r = 0; r < BOXES; r++) for (let c = 0; c < BOXES; c++) {
      if (boxEdges(r, c).includes(k) && boxCount(r, c) === 2) return true;
    }
    return false;
  }

  function updateHud() {
    hud.you(owners.filter(o => o === 1).length);
    hud.cpu(owners.filter(o => o === 2).length);
  }

  function checkEnd() {
    if (owners.some(o => !o)) return false;
    over = true;
    const mine = owners.filter(o => o === 1).length;
    const its = owners.filter(o => o === 2).length;
    const r = GameKit.submit('dots', mine, true);
    if (mine > its) stage.classList.add('win-bg');
    GameKit.overlay(stage, {
      title: mine > its ? t('game_win') : mine < its ? t('game_cpuwin') : t('game_draw'),
      stats: [[t('players_p1'), mine], [t('players_p2'), its], [t('game_best'), r.value]],
      msg: r.isBest ? t('game_newbest') : '',
      btnLabel: t('game_again'),
      onBtn: () => { stage.classList.remove('win-bg'); ov.remove(); start(); },
    });
    const ov = stage.querySelector('.g-overlay');
    return true;
  }

  function start() {
    edges = {}; owners = new Array(BOXES * BOXES).fill(0);
    myTurn = true; over = false;
    buildDOM();
    updateHud();
  }

  start();
  return { destroy() {} };
};
