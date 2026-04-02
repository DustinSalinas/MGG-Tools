const recipesData = [
    { id: "CB_02", parents: [["AC_01","BA_01"],["CE_01","EB_01"]] },
    { id: "BA_02", parents: [["BD_01","DA_01"],["CB_02","AC_01"]] },
    { id: "AC_02", parents: [["CE_01","AA_01"],["BA_02","CB_02"]] },
    { id: "AB_02", parents: [["FB_01","AF_01"],["CB_02","AC_02"]] },
    { id: "BC_02", parents: [["CC_01","BD_01"],["AB_02","AC_02"]] },
    { id: "CA_02", parents: [["FC_01","AF_01"],["BA_02","BC_02"]] },
    { id: "FD_02", parents: [["ED_01","FE_01"],["FF_01","DF_01"]] },
    { id: "EB_03", parents: [["EA_01","BA_01"],["FE_03","BA_02"]] },
    { id: "BE_04", parents: [["BC_02","EB_03"],["CB_01","CE_01"]] },
    { id: "AE_05", parents: [["AB_02","BE_04"],["AE_01","FE_01"]] },
    { id: "DA_03", parents: [["DC_01","AC_01"],["CA_02","FD_02"]] }
];

/* ============================================================
   MGG TOOLS — Guía de Obtención v6.0 (Full Pagination & Logic)
   ============================================================ */

let allMutants = [];
let obtainData = [];
let currentFilter = 'all';

// Configuración de Paginación
let currentPage = 1;
const ITEMS_PER_PAGE = 16; 

function getRecipeById(id) {
    return recipesData.find(r => r.id.toUpperCase() === id.toUpperCase());
}

function getDisplayName(id) {
    const m = allMutants.find(x => x.id.toUpperCase() === id.toUpperCase());
    if (!m) return id;
    // Usar nombres en español si está disponible y el idioma es ES
    if (typeof window.getMutantName === 'function') return window.getMutantName(m);
    return m.name;
}

/**
 * Inicialización de la App
 */
async function init() {
    try {
        // Datos de obtención desde variable global (howtoget-data.js)
        obtainData = window.HOW_TO_GET_DATA || [];

        // Cargar CSV de nombres
        const csvRes = await fetch('https://raw.githack.com/DustinSalinas/stats25/main/stats25.csv');
        const csvText = await csvRes.text();
        
        // Procesar CSV de nombres
        const rows = csvText.split('\n').slice(1);
        allMutants = rows.map(r => {
            const c = r.split(';');
            if(!c[0]) return null;
            const cleanId = c[0].replace('Specimen_', '').trim();
            return { id: cleanId, name: c[1]?.trim() };
        }).filter(m => m !== null);

        // Listeners para búsqueda y filtros
        setupEventListeners();

        // Render inicial
        render();
    } catch (err) {
        console.error("Error cargando base de datos:", err);
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById('getSearch');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentPage = 1; // Reiniciar a página 1 al buscar
            render();
        });
    }

    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.method;
            currentPage = 1; // Reiniciar a página 1 al filtrar
            render();
        });
    });
}

function sortMutants(a, b) {
    const parse = (id) => {
        const [letters, num] = id.split('_');
        return {
            letters,
            num: parseInt(num)
        };
    };

    const A = parse(a);
    const B = parse(b);

    // 1. Orden alfabético REAL (A, AA, AB, B...)
    const letterCompare = A.letters.localeCompare(B.letters);
    if (letterCompare !== 0) return letterCompare;

    // 2. Luego número (_01, _02...)
    return A.num - B.num;
}

/**
 * Función Principal de Renderizado
 */
function render() {
    const container = document.getElementById('obtainGrid');
    const search = document.getElementById('getSearch').value.toLowerCase();

    // 1. Filtrado de datos según búsqueda y categoría
    const filtered = obtainData
    .filter(item => {
        const mutant = allMutants.find(m => m.id.toUpperCase() === item.id.toUpperCase());
        const mutantName = mutant ? getDisplayName(item.id).toLowerCase() : (item.name ? item.name.toLowerCase() : '');
        
        const matchesSearch = mutantName.includes(search) || item.id.toLowerCase().includes(search);
        const matchesMethod =
        currentFilter === 'all' ||

        (currentFilter === 'unavailable' && item.obtain.includes("Not Available")) ||

        (currentFilter !== 'unavailable' && item.obtain.includes(currentFilter));
        
        return matchesSearch && matchesMethod;
    })
    .sort((a, b) => sortMutants(a.id, b.id));

    // 2. Lógica de Paginación
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // 3. Dibujar Tarjetas
    if (paginatedItems.length === 0) {
        container.innerHTML = `<div class="no-results">No se encontraron mutantes con esos criterios.</div>`;
    } else {
        container.innerHTML = paginatedItems.map(item => {
            const mutant = allMutants.find(m => m.id.toUpperCase() === item.id.toUpperCase());
            const displayName = mutant ? getDisplayName(item.id) : (item.name || 'Desconocido');
            
            // Generar badges de métodos de obtención
            const obtainLabels = {
                shop: "Shop",
                shop_rotation: "Rotation",
                raid: "Raid",
                event: "Events",
                reactor: "Reactor",
                bingo: "Bingo",
                breeding: "Breeding"
            };

            const badges = item.obtain.map(m => {
                const label = obtainLabels[m] || m.toUpperCase();
                return `<span class="get-badge badge-${m}">${label}</span>`;
            }).join('');

            return `
                <div class="get-card">
                    <div class="badge-container">${badges}</div>
                    <img src="https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_${item.id.toLowerCase()}.png" 
                         class="get-img" 
                         onerror="this.src='../img/unknown.png'">
                    <div class="get-name">${displayName}</div>
                    <button onclick="openRecipeModal('${item.id}')" class="get-link">Detalles de Obtención</button>
                </div>
            `;
        }).join('');
    }

    // 3.5 Contador de resultados
    const countEl = document.getElementById('resultsCount');
    if (countEl) {
        countEl.innerHTML = `Mostrando <strong>${paginatedItems.length}</strong> de <strong>${filtered.length}</strong> mutantes`;
    }

    // 4. Dibujar Controles de Paginación
    renderPagination(totalPages);
}

/**
 * Dibuja los botones de cambio de página
 */
function renderPagination(totalPages) {
    const container = document.getElementById('paginationControls');
    if (!container || totalPages <= 1) {
        if(container) container.innerHTML = '';
        return;
    }

    let html = '';
    
    // Botón Anterior
    html += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : `onclick="changePage(${currentPage - 1})"`}>&laquo;</button>`;

    // Números de página con lógica de elipsis (...)
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="pagination-ellipsis">...</span>`;
        }
    }

    // Botón Siguiente
    html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : `onclick="changePage(${currentPage + 1})"`}>&raquo;</button>`;

    container.innerHTML = html;
}

/**
 * Cambia la página y hace scroll al inicio de la lista
 */
window.changePage = function(page) {
    currentPage = page;
    render();
    window.scrollTo({ top: document.querySelector('.filter-bar').offsetTop - 100, behavior: 'smooth' });
};

/**
 * Lógica del Modal de Detalles
 */
function openRecipeModal(mutantId) {
    const itemData = obtainData.find(i => i.id.toUpperCase() === mutantId.toUpperCase());
    const mutant = allMutants.find(m => m.id.toUpperCase() === mutantId.toUpperCase());
    const modal = document.getElementById('recipeModal');
    
    if (!itemData || !modal) return;

    document.getElementById('modalMutantName').textContent = mutant ? getDisplayName(mutantId) : (itemData.name || 'Mutante');
    
    const tabContainer = document.getElementById('modalTabs');
    const contentContainer = document.getElementById('modalDynamicContent');
    
    tabContainer.innerHTML = '';
    contentContainer.innerHTML = '';

    // Mostrar pestañas solo si hay más de un método
    tabContainer.style.display = itemData.obtain.length > 1 ? 'flex' : 'none';

    itemData.obtain.forEach((method, index) => {
        // Crear Botón de Tab
        const btn = document.createElement('button');
        btn.className = `tab-btn ${index === 0 ? 'active' : ''}`;
        btn.innerHTML = `${getMethodIcon(method)} ${method.toUpperCase()}`;
        btn.onclick = () => switchTab(index);
        tabContainer.appendChild(btn);

        // Crear Contenedor de Contenido
        const section = document.createElement('div');
        section.className = `tab-content ${index === 0 ? 'active' : ''}`;
        section.id = `tab-item-${index}`;

        // Lógica de visualización según el método
        if (method === 'breeding') {

            const recipeData = getRecipeById(mutantId);

            // 🔥 SI TIENE RECETA ESPECIAL → usar recipes
            if (recipeData) {

                section.innerHTML = `
                    <div class="recipes-container">
                        ${recipeData.parents.map(combo => `
                            
                            <div class="recipe-row">
                                
                                <div class="parent-card" onclick="openRecipeModal('${combo[0]}')">
                                    <img src="https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_${combo[0].toLowerCase()}.png"
                                        onerror="this.src='../img/unknown.png'">
                                </div>

                                <div class="plus-sign">+</div>

                                <div class="parent-card" onclick="openRecipeModal('${combo[1]}')">
                                    <img src="https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_${combo[1].toLowerCase()}.png"
                                        onerror="this.src='../img/unknown.png'">
                                </div>

                            </div>

                        `).join('')}
                    </div>
                `;

            } else {

                // 🧬 TU BREEDING NORMAL
                const genes = mutantId.split('_')[0];
                const p1 = `${genes[0]}_01`, p2 = `${genes[1] || genes[0]}_01`;

                section.innerHTML = `
                    <div class="breeding-container">
                        <div class="parent-card">
                            <img src="https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_${p1.toLowerCase()}.png" onerror="this.src='../img/unknown.png'">
                            <p>${getGeneName(genes[0])}</p>
                        </div>
                        <div class="plus-sign">+</div>
                        <div class="parent-card">
                            <img src="https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_${p2.toLowerCase()}.png" onerror="this.src='../img/unknown.png'">
                            <p>${getGeneName(genes[1] || genes[0])}</p>
                        </div>
                    </div>
                `;
            }
        } else if (method === 'shop') {
            section.innerHTML = `
                <div class="bingo-container">

                    <img src="https://s-ak.kobojo.com/mutants/assets/larvas/larva_${mutantId.toLowerCase()}.png"
                        class="bingo-img"
                        onerror="this.src='../img/unknown.png'">

                    <div class="info-card">
                        <p class="info-label">Shop</p>

                        <div class="shop-prices">
                            ${itemData.gold > 0 ? `
                                <div class="price-line">
                                    <img src="../img/gold.png">
                                    <span>${itemData.gold.toLocaleString()}</span>
                                </div>` : ''}

                            ${itemData.credit > 0 ? `
                                <div class="price-line">
                                    <img src="../img/credits.png">
                                    <span>${itemData.credit.toLocaleString()}</span>
                                </div>` : ''}

                            ${(itemData.gold === 0 && itemData.credit === 0) ? `
                                <p class="info-value">Llega ocasionalmente a tienda (crédito/oro/dinero)</p>` : ''}
                        </div>

                    </div>

                </div>
            `;
        } else if (method === 'raid') {
            section.innerHTML = `
                <div class="bingo-container">
                    <img src="https://s-ak.kobojo.com/mutants/assets/larvas/larva_${mutantId.toLowerCase()}.png"
                        class="bingo-img"
                        onerror="this.src='img/unknown.png'">
                    
                    <div class="info-card">
                        <p class="info-label">Obtención</p>
                        <p class="info-value">Disponible cuando esta Raid está en rotación (cambia periódicamente)</p>
                    </div>
                </div>
            `;
        } else if (method === 'reactor') {
            section.innerHTML = `
                <div class="bingo-container">

                    <img src="https://s-ak.kobojo.com/mutants/assets/larvas/larva_${mutantId.toLowerCase()}.png"
                        class="bingo-img"
                        onerror="this.src='img/unknown.png'">

                    <div class="info-card">
                        <p class="info-label">Reactor</p>

                        <p class="info-value">
                            Solo disponible cuando el Reactor está activo (rotación periódica)
                        </p>

                        <div class="shop-prices">
                            ${itemData.reactor_cost ? `
                                <div class="price-line">
                                    <img src="https://s-ak.kobojo.com/mutants/assets/thumbnails/material_gacha_token.png">
                                    <span>${itemData.reactor_cost}</span>
                                </div>
                            ` : ''}
                        </div>

                    </div>

                </div>
            `;
        } else if (method === 'bingo') {
            section.innerHTML = `
                <div class="bingo-container">

                    <img src="https://s-ak.kobojo.com/mutants/assets/larvas/larva_${mutantId.toLowerCase()}.png"
                        class="bingo-img"
                        onerror="this.src='../img/unknown.png'">

                    <div class="info-card">
                        <p class="info-label">Obtención</p>
                        <p class="info-value">Completando una fila de bingo</p>
                    </div>

                </div>
            `;
        } else if (method === 'Not Available') {
            section.innerHTML = `
                <div class="bingo-container">

                    <img src="https://s-ak.kobojo.com/mutants/assets/larvas/larva_${mutantId.toLowerCase()}.png"
                        class="bingo-img"
                        onerror="this.src='../img/unknown.png'">

                    <div class="info-card">
                        <p class="info-label">Obtención</p>
                        <p class="info-value">Ya no se puede conseguir</p>
                    </div>

                </div>
            `;
        } else if (method === 'exchange') {
            section.innerHTML = `
                <div class="bingo-container">

                    <img src="https://s-ak.kobojo.com/mutants/assets/larvas/larva_${mutantId.toLowerCase()}.png"
                        class="bingo-img"
                        onerror="this.src='../img/unknown.png'">

                    <div class="info-card">
                        <p class="info-label">Exchange</p>

                        <div class="shop-prices">
                            ${itemData.exchange ? `
                                <div class="price-line">
                                    <img src="https://s-ak.kobojo.com/mutants/assets/thumbnails/material_event_token.png">
                                    <span>${itemData.exchange.toLocaleString()}</span>
                                </div>
                            ` : `
                                <p class="info-value">Disponible en Exchange</p>
                            `}
                        </div>

                    </div>

                </div>
            `;
        } else {
            // EVENT, BINGO
            section.innerHTML = `
                <div class="special-info">
                    <div class="info-card">
                        <p class="info-label">Obtención</p>
                        <p class="info-value">${itemData.event_name || 'Disponible solo en eventos temporales'}</p>
                    </div>
                </div>`;
        }
        contentContainer.appendChild(section);
    });

    modal.classList.add('open');
}

function getMethodIcon(m) {
    const icons = { 'breeding': '🧬', 'shop': '🛒', 'event': '📅', 'reactor': '☢️', 'bingo': '🎰' };
    return icons[m] || '✨';
}

function switchTab(index) {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    tabs.forEach((b, i) => b.classList.toggle('active', i === index));
    contents.forEach((c, i) => c.classList.toggle('active', i === index));
}

function getGeneName(l) {
    const n = { 'A':'Cyber', 'B':'Zombie', 'C':'Saber', 'D':'Zoomorph', 'E':'Galactic', 'F':'Mythic' };
    return n[l] || 'Especial';
}

/**
 * Cierre del Modal
 */
function closeModal() {
    document.getElementById('recipeModal').classList.remove('open');
}

// Cerrar si se hace click fuera del contenido del modal
window.onclick = function(event) {
    const modal = document.getElementById('recipeModal');
    if (event.target == modal) closeModal();
};

// Re-renderizar tarjetas cuando cambia el idioma
if (typeof MGG !== 'undefined' && MGG.onLangChange) {
    MGG.onLangChange(() => render());
}

// Iniciar aplicación al cargar el script
init();