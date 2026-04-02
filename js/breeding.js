/* ============================================================
   MGG TOOLS — Breeding Simulator  v9
   js/breeding.js
   ============================================================ */

const CSV_URL_BR    = 'https://raw.githack.com/DustinSalinas/stats25/main/stats25.csv';
const BASE_IMG_BR   = 'https://s-ak.kobojo.com/mutants/assets/mobile/hud/';
const BASE_THUMB_BR = 'https://s-ak.kobojo.com/mutants/assets/thumbnails/';

const GENE_LETTERS = { A:'Cyber', B:'Zombie', C:'Saber', D:'Zoomorph', E:'Galactic', F:'Mythic' };
const GENE_COLORS  = { A:'#185FA5', B:'#3B6D11', C:'#854F0B', D:'#993C1D', E:'#534AB7', F:'#993556' };
const GENE_IMG     = l => `${BASE_IMG_BR}fight_ui/gene_${l.toLowerCase()}.png`;

const NON_RESULT_TYPES = new Set([
  'SEASONAL','VIDEOGAME','CAPTAINPEACE','ZODIAC','COMMUNITY','GACHA'
]);

let allMutants   = [];
let breedingData = { genes:{}, legend_hybrid:[], recipes:[] };
let parent       = [null, null];
let activeSlot   = 0;
let geneFilter   = '';
let searchQuery  = '';
let panelOpen    = false;
let starLevel    = ''; /* vacío = imagen base */

const STAR_BLOCKED_TYPES = new Set(['SEASONAL','CAPTAINPEACE']); /* no pueden ser padres en plata/oro/platino */

/* ── Helpers ── */
function getGenes(id) {
  const p = id.split('_')[0].toUpperCase();
  if (p.length === 1) return [p];
  if (p.length === 2) return [p[0], p[1]];
  return [];
}

function getMutantThumb(m, star) {
  const id = m.id.toLowerCase();
  const s  = star || starLevel;
  if (!s) return `${BASE_THUMB_BR}specimen_${id}.png`;
  return `${BASE_THUMB_BR}specimen_${id}_${s}.png`;
}

function getMutantThumbBase(m) {
  /* Sin estrella: para el panel de selección */
  const id = m.id.toLowerCase();
  return `${BASE_THUMB_BR}specimen_${id}.png`;
}

function getMName(m) {
  return (typeof getMutantName === 'function') ? getMutantName(m) : m.name;
}

/* ── CSV parse — semicolon delimiter via PapaParse ── */
function parseBreedingCSV(csvText) {
  const result = Papa.parse(csvText, { delimiter: ';', skipEmptyLines: true });
  return result.data.reduce((acc, row) => {
    if (row.length < 14) return acc;
    const key  = row[0];
    const name = row[1]?.trim();
    if (!key || !name || name === 'No Name') return acc;
    acc.push({
      key,
      id:   key.replace('Specimen_', ''),
      name,
      type: row[13].trim().toUpperCase(),
    });
    return acc;
  }, []);
}

/* ════════════════════════════════════════════════════════════
   BREEDING CORE LOGIC
   ════════════════════════════════════════════════════════════
   Rule: child gets exactly 1 gene from Parent1 + 1 gene from Parent2.

   e.g. P1=AA (genes=[A]), P2=BC (genes=[B,C])
        valid combos = { AB, AC }
        → only mutants with genes AB or AC can appear
        → pure A needs combo AA (both parents give A)

   Categories:
   - NORMAL / BINGO / LEGEND hibridable (req=null):
       filtered by gene combo match
   - LEGEND especial / HEROIC (req=their own ID):
       filtered only by parent ID — gene combo irrelevant
       can appear even if they ARE one of the parents
   - SECRET:
       specific pair of parent IDs (any order)
       appears alongside bingo/legend results
   ════════════════════════════════════════════════════════════ */

function getValidCombos(p1id, p2id) {
  const g1 = [...new Set(getGenes(p1id))];
  const g2 = [...new Set(getGenes(p2id))];
  const combos = new Set();
  for (const a of g1) {
    for (const b of g2) {
      combos.add(a + b); /* P1gen+P2gen */
      combos.add(b + a); /* P2gen+P1gen */
    }
  }
  return combos;
}

function matchesCombo(mutantId, validCombos) {
  const genes = getGenes(mutantId);
  if (genes.length === 1) return validCombos.has(genes[0] + genes[0]);
  return validCombos.has(genes[0] + genes[1]);
}

function computeResults(p1, p2) {

  /* ── SEASONAL/CAPTAINPEACE bloqueados solo en plata, oro y platino ── */
  if (starLevel === 'silver' || starLevel === 'gold' || starLevel === 'platinum') {
    const blocked = STAR_BLOCKED_TYPES.has(p1.type) ? p1 : STAR_BLOCKED_TYPES.has(p2.type) ? p2 : null;
    if (blocked) {
      return { normal:[], bingo:[], legend_hybrid:[], legend:[], heroic:[], recipe:[], starBlocked: true, blockedMutant: blocked };
    }
  }

  /* ── PLATINO: ambos padres iguales → solo sale ese mutante en platino ── */
  if (starLevel === 'platinum') {
    if (p1.id !== p2.id) {
      return { normal:[], bingo:[], legend_hybrid:[], legend:[], heroic:[], recipe:[], platinumError: true };
    }
    return { normal:[], bingo:[p1], legend_hybrid:[], legend:[], heroic:[], recipe:[], platinum: true };
  }

  const validCombos = getValidCombos(p1.id, p2.id);
  const res = { normal:[], bingo:[], legend_hybrid:[], legend:[], heroic:[], pvp:[], recipe:[] };

  const hybridSet = new Set(breedingData.legend_hybrid || []);

  for (const m of allMutants) {
    if (NON_RESULT_TYPES.has(m.type)) continue;
    const t = m.type;

    /* ── RECIPE ── */
    if (t === 'RECIPE') {
      const rec = (breedingData.recipes || []).find(r => r.id === m.id);
      if (!rec) continue;
      const matched = rec.parents.some(pair => {
        const [a, b] = pair;
        return (p1.id === a && p2.id === b) || (p1.id === b && p2.id === a);
      });
      if (matched) res.recipe.push(m);
      continue;
    }

    /* ── PVP ─────────────────────────────────────────────────────
       Solo sale si uno de los padres ES ese mutante PVP. */
    if (t === 'PVP') {
      if (p1.id !== m.id && p2.id !== m.id) continue;
      res.pvp.push(m);
      continue;
    }

    /* ── HEROICO ── */
    if (t === 'HEROIC') {
      if (p1.id !== m.id && p2.id !== m.id) continue;
      res.heroic.push(m);
      continue;
    }

    if (t === 'LEGEND') {
      if (hybridSet.has(m.id)) {
        if (!matchesCombo(m.id, validCombos)) continue;
        res.legend_hybrid.push(m);
        continue;
      }
      if (p1.id !== m.id && p2.id !== m.id) continue;
      res.legend.push(m);
      continue;
    }

    /* ── BINGO ── */
    if (t === 'BINGO') {
      if (!matchesCombo(m.id, validCombos)) continue;
      res.bingo.push(m);
      continue;
    }

    /* ── NORMAL ── */
    if (m.id === p1.id || m.id === p2.id) continue;
    if (!matchesCombo(m.id, validCombos)) continue;
    res.normal.push(m);
  }

  /* Deduplicar por nombre dentro de cada categoría */
  const dedup = arr => {
    const seen = new Set();
    return arr.filter(m => {
      const name = getMName(m);
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  };

  res.normal        = dedup(res.normal);
  res.bingo         = dedup(res.bingo);
  res.legend_hybrid = dedup(res.legend_hybrid);
  res.legend        = dedup(res.legend);
  res.heroic        = dedup(res.heroic);
  res.pvp           = dedup(res.pvp);
  res.recipe        = dedup(res.recipe);

  return res;
}

const STAR_LABELS = () => ({
  bronze:   (typeof MGG !== 'undefined') ? MGG.t('brStarBronze')   : 'Bronce',
  silver:   (typeof MGG !== 'undefined') ? MGG.t('brStarSilver')   : 'Plata',
  gold:     (typeof MGG !== 'undefined') ? MGG.t('brStarGold')     : 'Oro',
  platinum: (typeof MGG !== 'undefined') ? MGG.t('brStarPlatinum') : 'Platino',
});
const T = key => (typeof MGG !== 'undefined') ? MGG.t(key) : key;

const CAT_ICONS = {
  bingo:         'https://s-ak.kobojo.com/mutants/assets/mobile/hud/main/picto_mutodesk.png',
  heroic:        'https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_heroic.png',
  pvp:           'https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_pvp.png',
  legend:        'https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_legend.png',
  legend_hybrid: 'https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_legend.png',
  recipe:        'https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_recipe.png',
  normal:        '',
};

/* ── Render result row (Opción B — tabla compacta con icono categoría) ── */
function renderRow(m, cat, starOverride) {
  const genes = getGenes(m.id);
  const genesHtml = genes.map(g =>
    `<img src="${GENE_IMG(g)}" alt="${GENE_LETTERS[g]||g}" title="${GENE_LETTERS[g]||g}" class="rr-gene">`
  ).join('');
  const catIcon = CAT_ICONS[cat] || '';
  const catIconHtml = catIcon
    ? `<img src="${catIcon}" alt="${cat}" class="rr-cat-icon" onerror="this.style.display='none'">`
    : '';
  return `
    <div class="result-row ${cat}">
      <img src="${getMutantThumb(m, starOverride)}" alt="${getMName(m)}" class="rr-thumb"
           onerror="this.src='https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_default.png';this.onerror=null">
      <div class="rr-name">${getMName(m)}</div>
      <div class="rr-genes">${genesHtml}</div>
      ${catIconHtml}
    </div>`;
}

function renderResults() {
  const el = document.getElementById('breedResults');
  const totalEl = document.getElementById('totalResults');
  if (!parent[0] || !parent[1]) {
    el.innerHTML = `<div class="breed-empty">${T('brSelectBoth')}</div>`;
    if (totalEl) totalEl.textContent = '';
    return;
  }

  const res = computeResults(parent[0], parent[1]);

  /* Errores especiales de estrella */
  if (res.platinumError) {
    if (totalEl) totalEl.textContent = '';
    el.innerHTML = `
      <div class="breed-empty" style="display:flex;flex-direction:column;align-items:center;gap:12px;">
        <img src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/pvp/presentator_no.png"
             style="width:80px;height:80px;object-fit:contain;" onerror="this.style.display='none'">
        <span>⚠️ ${T('brPlatinumError')}</span>
      </div>`;
    return;
  }
  if (res.starBlocked) {
    if (totalEl) totalEl.textContent = '';
    const blockedName = getMName(res.blockedMutant);
    const starName = STAR_LABELS()[starLevel];
    el.innerHTML = `
      <div class="breed-empty" style="display:flex;flex-direction:column;align-items:center;gap:12px;">
        <img src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/pvp/presentator_no.png"
             style="width:80px;height:80px;object-fit:contain;" onerror="this.style.display='none'">
        <span>⚠️ ${T('brStarBlockedMutant').replace('{name}', blockedName).replace('{star}', starName)}</span>
      </div>`;
    return;
  }

  /* Resultado platino especial */
  if (res.platinum) {
    if (totalEl) totalEl.textContent = `1 ${T('brResult')}`;
    el.innerHTML = `
      <div class="results-table" style="max-width:600px;margin:0 auto;">
        <div class="results-table-header">
          <span>${T('brColIcon')}</span>
          <span>${T('brColName')}</span>
          <span>${T('brColGenes')}</span>
          <span>${T('brColCategory')}</span>
        </div>
        <div class="results-table-body">
          ${renderRow(res.bingo[0], 'bingo', 'platinum')}
        </div>
      </div>`;
    return;
  }

  const total = res.normal.length + res.bingo.length + res.legend_hybrid.length + res.legend.length + res.heroic.length + res.pvp.length + res.recipe.length;
  if (totalEl) totalEl.textContent = `${total} ${total !== 1 ? T('brResults') : T('brResult')}`;

  if (total === 0) {
    el.innerHTML = `<div class="breed-empty">${T('brNoResults')}</div>`;
    return;
  }

  const groups = [
    { key:'recipe',       rows: res.recipe       },
    { key:'bingo',        rows: res.bingo        },
    { key:'heroic',       rows: res.heroic       },
    { key:'pvp',          rows: res.pvp          },
    { key:'legend',       rows: res.legend       },
    { key:'legend_hybrid',rows: res.legend_hybrid },
    { key:'normal',       rows: res.normal       },
  ];

  /* Cabecera de tabla */
  let html = `
    <div class="results-table">
      <div class="results-table-header">
        <span>${T('brColIcon')}</span>
        <span>${T('brColName')}</span>
        <span>${T('brColGenes')}</span>
        <span>${T('brColCategory')}</span>
      </div>
      <div class="results-table-body">`;

  for (const g of groups) {
    for (const m of g.rows) {
      html += renderRow(m, g.key);
    }
  }

  html += `</div></div>`;
  el.innerHTML = html;
}

/* ── Slot rendering ── */
function renderSlot(idx) {
  const slot = document.getElementById(`slot-${idx}`);
  const m = parent[idx];
  if (!m) {
    slot.classList.remove('filled');
    slot.style.background = '';
    slot.innerHTML = `
      <img src="https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_default.png" alt="?" class="slot-unknown" onerror="this.style.opacity='0.2'">
      <span class="slot-ph">${T('brSelectMutant')}</span>`;
    return;
  }
  slot.classList.add('filled');
  const genes = getGenes(m.id);
  const c1 = GENE_COLORS[genes[0]] || '#333';
  const c2 = genes[1] ? GENE_COLORS[genes[1]] : c1;
  slot.style.background = `linear-gradient(160deg, ${c1}40 0%, ${c2}20 60%, transparent 100%)`;
  slot.style.setProperty('--slot-tint', c1);
  const genesHtml = genes.map(g =>
    `<img src="${GENE_IMG(g)}" alt="${GENE_LETTERS[g]}" class="slot-gene-img">`
  ).join('');
  slot.innerHTML = `
    <button class="slot-clear" onclick="clearParent(${idx},event)" title="Quitar">✕</button>
    <img src="${getMutantThumbBase(m)}" alt="${getMName(m)}" class="slot-mutant-img"
         onerror="this.src='https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_default.png';this.onerror=null">
    <div class="slot-name">${getMName(m)}</div>
    <div class="slot-genes">${genesHtml}</div>`;
}

function clearParent(idx, e) {
  e.stopPropagation();
  parent[idx] = null;
  renderSlot(idx);
  renderResults();
}

/* ── Panel open/close ── */
function togglePanel(forceOpen) {
  panelOpen = (forceOpen !== undefined) ? forceOpen : !panelOpen;
  const panel     = document.getElementById('breedingPanel');
  const page      = document.getElementById('breedingPage');
  const toggleBtn = document.getElementById('panelToggleBtn');
  if (panelOpen) {
    panel.style.display = '';
    page.style.gridTemplateColumns = '1fr 320px';
    if (toggleBtn) toggleBtn.textContent = '✕ Cerrar panel';
  } else {
    panel.style.display = 'none';
    page.style.gridTemplateColumns = '1fr';
    if (toggleBtn) toggleBtn.textContent = '☰ Mutantes';
  }
}

/* ── Right panel: mutant search grid ── */
function renderSearchPanel() {
  const container = document.getElementById('searchPanelGrid');
  if (!container) return;
  const q = searchQuery.toLowerCase().trim();

  let pool = allMutants.filter(m => {
    return true; /* Todos pueden ser padres */
  });
  if (geneFilter) pool = pool.filter(m => getGenes(m.id)[0] === geneFilter);
  if (q) pool = pool.filter(m =>
    getMName(m).toLowerCase().includes(q) || m.id.toLowerCase().includes(q)
  );

  const GENE_ORDER = 'ABCDEF';
  pool.sort((a, b) => {
    const ga = getGenes(a.id);
    const gb = getGenes(b.id);
    /* Primer gen */
    const g1a = GENE_ORDER.indexOf(ga[0]);
    const g1b = GENE_ORDER.indexOf(gb[0]);
    if (g1a !== g1b) return g1a - g1b;
    /* Puro (1 gen) antes que híbrido (2 genes) */
    if (ga.length !== gb.length) return ga.length - gb.length;
    /* Segundo gen por orden ABCDEF */
    if (ga.length === 2 && gb.length === 2) {
      const g2a = GENE_ORDER.indexOf(ga[1]);
      const g2b = GENE_ORDER.indexOf(gb[1]);
      if (g2a !== g2b) return g2a - g2b;
    }
    /* Mismo prefijo de gen → ordenar por número en el ID */
    const numA = parseInt(a.id.split('_')[1]) || 0;
    const numB = parseInt(b.id.split('_')[1]) || 0;
    if (numA !== numB) return numA - numB;
    /* Mismo número → alfabético por nombre */
    return getMName(a).localeCompare(getMName(b));
  });

  if (!pool.length) {
    container.innerHTML = `<div class="panel-empty">${T('brNoMutants')}</div>`;
    return;
  }

  const NON_RESULT_SET = new Set(['SEASONAL','CAPTAINPEACE','GACHA','ZODIAC','VIDEOGAME','COMMUNITY']);

  container.innerHTML = pool.slice(0, 300).map(m => {
    const genes = getGenes(m.id);
    const genesHtml = genes.map(g =>
      `<img src="${GENE_IMG(g)}" alt="${GENE_LETTERS[g]||g}">`
    ).join('');
    const isBlocked = NON_RESULT_SET.has(m.type);
    const blockedStyle = isBlocked ? 'opacity:0.7;' : '';
    return `
      <div class="panel-card" onclick="selectMutant('${m.id}')" style="${blockedStyle}">
        <img src="${getMutantThumbBase(m)}" alt="${getMName(m)}" class="panel-thumb"
             onerror="this.src='../img/unknown.png';this.onerror=null">
        <div class="panel-name">${getMName(m)}</div>
        <div class="panel-genes">${genesHtml}</div>
      </div>`;
  }).join('');
}

function selectMutant(id) {
  const m = allMutants.find(x => x.id === id);
  if (!m) return;
  parent[activeSlot] = m;
  renderSlot(activeSlot);
  /* Auto-advance to the other slot if it's empty, otherwise close panel */
  const other = activeSlot === 0 ? 1 : 0;
  if (!parent[other]) {
    setActiveSlot(other);
  } else {
    togglePanel(false);
  }
  renderResults();
}

function toggleStarMenu(e) {
  e.stopPropagation();
  document.getElementById('starMenu').classList.toggle('open');
}

function pickStar(level, label, btn) {
  starLevel = level;
  const img = document.getElementById('starSelectedImg');
  img.src = `https://s-ak.kobojo.com/mutants/assets/mobile/thumbnails/star_${level}.png`;
  img.style.display = 'block';
  document.getElementById('starClearBtn').style.display = 'flex';
  document.getElementById('starMenu').classList.remove('open');
  renderResults();
}

function clearStar(e) {
  e.stopPropagation();
  starLevel = '';
  const img = document.getElementById('starSelectedImg');
  img.src = '';
  img.style.display = 'none';
  document.getElementById('starClearBtn').style.display = 'none';
  renderResults();
}

/* Cerrar el menú si se hace clic fuera */
document.addEventListener('click', () => {
  const menu = document.getElementById('starMenu');
  if (menu) menu.classList.remove('open');
});

function setStarLevel(level, btn) {
  starLevel = level;
  renderResults();
}

function setActiveSlot(idx) {
  activeSlot = idx;
  [0, 1].forEach(i => {
    document.getElementById(`slot-${i}`)?.classList.toggle('slot-active', i === idx);
    document.getElementById(`ind-${i}`)?.classList.toggle('active', i === idx);
  });
  if (!panelOpen) togglePanel(true);
}

/* ── Gene filter buttons ── */
function buildGeneFilters() {
  const wrap = document.getElementById('geneBtns');
  if (!wrap) return;
  const allBtn = `<button class="fg-btn active" data-gene="" onclick="setGF(this,'')">Todos</button>`;
  const geneBtns = Object.entries(GENE_LETTERS).map(([l, name]) =>
    `<button class="fg-btn" data-gene="${l}" onclick="setGF(this,'${l}')" title="${name}">
      <img src="${GENE_IMG(l)}" alt="${name}">
    </button>`
  ).join('');
  wrap.innerHTML = allBtn + geneBtns;
}

function setGF(btn, gene) {
  document.querySelectorAll('.fg-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  geneFilter = gene;
  renderSearchPanel();
}

/* ── Init ── */
async function initBreeding() {
  const gridEl = document.getElementById('searchPanelGrid');
  if (gridEl) gridEl.innerHTML = '<div class="panel-empty">Cargando mutantes...</div>';

  try {
    // Usar datos de breeding desde variable global (breeding-data.js)
    breedingData = window.BREEDING_DATA || { genes:{}, legend_hybrid:[], recipes:[] };

    const csvRes = await fetch(CSV_URL_BR);
    if (!csvRes.ok) throw new Error('CSV error: ' + csvRes.status);
    const csvText = await csvRes.text();
    allMutants       = parseBreedingCSV(csvText);

    if (!allMutants.length) throw new Error('No mutants parsed');

    buildGeneFilters();

    [0, 1].forEach(idx => {
      const slot = document.getElementById(`slot-${idx}`);
      if (slot) slot.addEventListener('click', () => setActiveSlot(idx));
      renderSlot(idx);
    });

    /* Marcar slot 0 como activo visualmente SIN abrir el panel */
    document.getElementById('slot-0')?.classList.add('slot-active');
    document.getElementById('ind-0')?.classList.add('active');

    const si = document.getElementById('panelSearch');
    if (si) si.addEventListener('input', e => { searchQuery = e.target.value; renderSearchPanel(); });

    renderSearchPanel();
    renderResults();

    /* Re-renderizar cuando cambia el idioma */
    if (typeof MGG !== 'undefined' && MGG.onLangChange) {
      MGG.onLangChange(() => {
        renderSearchPanel();
        renderResults();
        [0, 1].forEach(idx => renderSlot(idx));
      });
    }

  } catch (err) {
    console.error('Breeding init error:', err);
    if (gridEl) gridEl.innerHTML =
      `<div class="panel-empty" style="color:var(--accent-danger)">Error: ${err.message}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', initBreeding);
