let mutantsData = {};
let selectedMutant = null;
let selectedStarLevel = null;
let lastValidLevel = 1;
let levelChangeTimeout;
let allMutantCards = [];

function findMutant(query) {
    if (!mutantsData) return null;
    const key = Object.keys(mutantsData).find(k => mutantsData[k].name.toLowerCase() === query.toLowerCase());
    return mutantsData[key];
}

document.addEventListener("DOMContentLoaded", () => {
    const mutantNameInput = document.getElementById("mutantName");
    const levelInput = document.getElementById("levelInput");
    const starLevelContainer = document.getElementById("starLevelContainer");
    const starSelectorContainer = document.querySelector(".star-selector-container");
    const starOptionsContainer = document.querySelector(".star-options");
    const starSelectorText = document.querySelector(".star-selector-text");
    const resultsContainer = document.getElementById("resultsContainer");
    const mutantsGridContainer = document.getElementById("mutantsGridContainer");
    const goldStarMutantIds = ["AF_06", "EF_14", "DE_06", "DF_11"];
    mutantsGridContainer.style.maxHeight = '450px';
    mutantsGridContainer.style.overflowY = 'auto'; 
    mutantsGridContainer.style.padding = '5px';
    // IDs especiales
    const oneBasicOneSpecialIds = ['A_01', 'B_01', 'C_01', 'AA_01', 'BB_01', 'CC_01', 'D_01', 'E_01', 'F_01', 'DD_01', 'EE_01', 'FF_01']; // <- agrega los IDs que quieras aquí
    const oneBasicOnlyIds = [
        'AB_01', 'AC_01', 'AD_01', 'AE_01', 'AF_01',
        'BA_01', 'BC_01', 'BD_01', 'BE_01', 'BF_01',
        'CA_01', 'CB_01', 'CD_01', 'CE_01', 'CF_01',
        'DA_01', 'DB_01', 'DC_01', 'DE_01', 'DF_01',
        'EA_01', 'EB_01', 'EC_01', 'ED_01', 'EF_01',
        'FA_01', 'FB_01', 'FC_01', 'FD_01', 'FE_01'
    ];

    starSelectorContainer.addEventListener('click', (event) => {
        // Toggle visibility (or just show it if you prefer not to toggle)
        starOptionsContainer.style.display = starOptionsContainer.style.display === 'block' ? 'none' : 'block';
        event.stopPropagation(); // Prevent bubbling to document click handler
    });

    starOptionsContainer.addEventListener('click', (event) => {
        const target = event.target.closest('.star-option');
        if (target) {
            const starLevel = target.dataset.star;
            const selectedIcon = target.querySelector('img');
            
            selectedStarLevel = (starLevel === "No Star") ? null : starLevel;
            
            console.log("Estrella seleccionada:", starLevel);
            
            // Cierra el menú
            starOptionsContainer.style.display = 'none';
            
            // Encuentra el elemento de la imagen del mutante
            const mutantImage = resultsContainer.querySelector('#mutantImage');
            
            // Actualiza la imagen del mutante
            if (mutantImage) {
                updateMutantImage(selectedStarLevel, mutantImage, selectedMutant);
            }
            
            // Refresca los stats (esto recrea el HTML)
            displayResults(selectedMutant, parseInt(levelInput.value));
        }
        event.stopPropagation();
    });

    document.addEventListener('click', (event) => {
        if (!starSelectorContainer.contains(event.target) && !starOptionsContainer.contains(event.target)) {
            starOptionsContainer.style.display = 'none';
        }
    });

    const starBonuses = {
        "Bronze": 1.1,
        "Silver": 1.3,
        "Gold": 1.75,
        "Easter": 1.75,
        "Platinum": 2,
        "Gacha": 2,
        "Base": 1,
        "Spring": 1.01,
        "Autumn": 1.04,
        "Winter": 0.92,
        "Winter Bug": 1.75,
        "Summer": 0.98,
        "Seasonal": 1.12
    };

    let selectedOrbs = [
        null, // slot 1 (normal)
        null, // slot 2 (normal)
        null, // slot 3 (normal)
        null  // slot 4 (especial)
    ];

    // Datos de los orbes
    const orbData = {
        basic: [
            { name: "Attack", img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_attack.png", sub: [
                { name: "Attack (+2%)", porc: 2, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_attack.png" },
                { name: "Attack (+5%)", porc: 5, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_attack_01.png" },
                { name: "Attack (+10%)", porc: 10, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_attack_02.png" },
                { name: "Attack (+12%)", porc: 12, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_attack_03.png" },
                { name: "Attack (+14%)", porc: 14, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_attack_04.png" },
                { name: "Attack (+16%)", porc: 16, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_attack_05.png" },
                { name: "Attack (+17%)", porc: 17, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_attack_06.png" },
                { name: "Attack (+18%)", porc: 18, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_attack_07.png" }
            ]},
            { name: "HP", img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_life.png", sub: [
                { name: "HP (+5%)", porc: 5, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_life.png" },
                { name: "HP (+10%)", porc: 10, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_life_01.png" },
                { name: "HP (+15%)", porc: 15, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_life_02.png" },
                { name: "HP (+20%)", porc: 20, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_life_03.png" },
                { name: "HP (+25%)", porc: 25, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_life_04.png" },
                { name: "HP (+28%)", porc: 28, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_life_05.png" },
                { name: "HP (+30%)", porc: 30, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_life_06.png" },
                { name: "HP (+35%)", porc: 35, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_life_07.png" }
            ]},
            { name: "Shield", img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_shield.png", sub: [
                { name: "Shield (+3%)", porc: 3, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_shield.png" },
                { name: "Shield (+7%)", porc: 7, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_shield_01.png" },
                { name: "Shield (+15%)", porc: 15, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_shield_02.png" },
                { name: "Shield (+19%)", porc: 19, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_shield_03.png" },
                { name: "Shield (+22%)", porc: 22, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_shield_04.png" },
                { name: "Shield (+24%)", porc: 24, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_shield_05.png" },
                { name: "Shield (+25%)", porc: 25, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_shield_06.png" }
            ]},
            { name: "Drain", img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_regenerate.png", sub: [
                { name: "Drain (+3%)", porc: 3, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_regenerate.png" },
                { name: "Drain (+7%)", porc: 7, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_regenerate_01.png" },
                { name: "Drain (+15%)", porc: 15, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_regenerate_02.png" },
                { name: "Drain (+20%)", porc: 20, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_regenerate_03.png" },
                { name: "Drain (+25%)", porc: 25, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_regenerate_04.png" },
                { name: "Drain (+28%)", porc: 28, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_regenerate_05.png" },
                { name: "Drain (+30%)", porc: 30, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_regenerate_06.png" }
            ]},
            { name: "Retaliate", img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_retaliate.png", sub: [
                { name: "Retaliate (+3%)", porc: 3, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_retaliate.png" },
                { name: "Retaliate (+7%)", porc: 7, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_retaliate_01.png" },
                { name: "Retaliate (+15%)", porc: 15, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_retaliate_02.png" },
                { name: "Retaliate (+17%)", porc: 17, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_retaliate_03.png" },
                { name: "Retaliate (+18%)", porc: 18, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_retaliate_04.png" },
                { name: "Retaliate (+19%)", porc: 19, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_retaliate_05.png" },
                { name: "Retaliate (+20%)", porc: 20, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_retaliate_06.png" }
            ]},
            { name: "Wound", img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_slash.png", sub: [
                { name: "Wound (+3%)", porc: 3, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_slash.png" },
                { name: "Wound (+7%)", porc: 7, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_slash_01.png" },
                { name: "Wound (+15%)", porc: 15, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_slash_02.png" },
                { name: "Wound (+19%)", porc: 19, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_slash_03.png" },
                { name: "Wound (+22%)", porc: 22, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_slash_04.png" },
                { name: "Wound (+24%)", porc: 24, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_slash_05.png" },
                { name: "Wound (+25%)", porc: 25, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_slash_06.png" }
            ]},
            { name: "Boost", img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_strengthen.png", sub: [
                { name: "Boost (+3%)", porc: 3, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_strengthen.png" },
                { name: "Boost (+7%)", porc: 7, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_strengthen_01.png" },
                { name: "Boost (+15%)", porc: 15, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_strengthen_02.png" },
                { name: "Boost (+19%)", porc: 19, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_strengthen_03.png" },
                { name: "Boost (+22%)", porc: 22, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_strengthen_04.png" },
                { name: "Boost (+24%)", porc: 24, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_strengthen_05.png" },
                { name: "Boost (+25%)", porc: 25, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_strengthen_06.png" }
            ]},
            { name: "Curse", img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_weaken.png", sub: [
                { name: "Curse (+3%)", porc: 3, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_weaken.png" },
                { name: "Curse (+7%)", porc: 7, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_weaken_01.png" },
                { name: "Curse (+15%)", porc: 15, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_weaken_02.png" },
                { name: "Curse (+19%)", porc: 19, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_weaken_03.png" },
                { name: "Curse (+21%)", porc: 21, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_weaken_04.png" },
                { name: "Curse (+24%)", porc: 24, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_weaken_05.png" },
                { name: "Curse (+25%)", porc: 25, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_weaken_06.png" }
            ]}
        ],
        special: [
            { name: 'Speed', img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_speed.png', sub: [
                //{ name: 'Speed (+2%)', porc: 2, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_speed.png' },
                { name: 'Speed (+5%)', porc: 5, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_speed_01.png' },
                { name: 'Speed (+10%)', porc: 10, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_speed_02.png' },
                { name: 'Speed (+15%)', porc: 15, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_speed_03.png' },
                { name: 'Speed (+18%)', porc: 18, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_speed_04.png' },
                { name: 'Speed (+20%)', porc: 20, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_speed_05.png' }
            ]},
            { name: 'Shield', img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addshield.png', sub: [
                { name: 'Shield (+2%)', porc: 2, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addshield.png' },
                { name: 'Shield (+5%)', porc: 5, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addshield_01.png' },
                { name: 'Shield (+13%)', porc: 13, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addshield_02.png' },
                { name: 'Shield (+20%)', porc: 20, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addshield_03.png' },
                { name: 'Shield (+26%)', porc: 26, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addshield_04.png' },
                { name: 'Shield (+30%)', porc: 30, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addshield_05.png' }
            ]},
            { name: 'Drain', img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addregenerate.png', sub: [
                { name: 'Drain (+2%)', porc: 2, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addregenerate.png' },
                { name: 'Drain (+5%)', porc: 5, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addregenerate_01.png' },
                { name: 'Drain (+14%)', porc: 14, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addregenerate_02.png' },
                { name: 'Drain (+22%)', porc: 22, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addregenerate_03.png' },
                { name: 'Drain (+29%)', porc: 29, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addregenerate_04.png' },
                { name: 'Drain (+35%)', porc: 35, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addregenerate_05.png' }
            ]},
            { name: 'Retaliate', img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addretaliate.png', sub: [
                { name: 'Retaliate (+1%)', porc: 1, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addretaliate.png' },
                { name: 'Retaliate (+2%)', porc: 2, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addretaliate_01.png' },
                { name: 'Retaliate (+5%)', porc: 5, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addretaliate_02.png' },
                { name: 'Retaliate (+13%)', porc: 13, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addretaliate_03.png' },
                { name: 'Retaliate (+20%)', porc: 20, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addretaliate_04.png' },
                { name: 'Retaliate (+25%)', porc: 25, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addretaliate_05.png' }
            ]},
            { name: 'Wound', img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addslash.png', sub: [
                { name: 'Wound (+2%)', porc: 2, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addslash.png' },
                { name: 'Wound (+5%)', porc: 5, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addslash_01.png' },
                { name: 'Wound (+13%)', porc: 13, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addslash_02.png' },
                { name: 'Wound (+20%)', porc: 20, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addslash_03.png' },
                { name: 'Wound (+26%)', porc: 26, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addslash_04.png' },
                { name: 'Wound (+30%)', porc: 30, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addslash_05.png' }
            ]},
            { name: 'Boost', img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addstrengthen.png', sub: [
                { name: 'Boost (+2%)', porc: 2, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addstrengthen.png' },
                { name: 'Boost (+5%)', porc: 5, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addstrengthen_01.png' },
                { name: 'Boost (+13%)', porc: 13, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addstrengthen_02.png' },
                { name: 'Boost (+20%)', porc: 20, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addstrengthen_03.png' },
                { name: 'Boost (+26%)', porc: 26, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addstrengthen_04.png' },
                { name: 'Boost (+30%)', porc: 30, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addstrengthen_05.png' }
            ]},
            { name: 'Curse', img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addweaken.png', sub: [
                { name: 'Curse (+2%)', porc: 2, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addweaken.png' },
                { name: 'Curse (+5%)', porc: 5, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addweaken_01.png' },
                { name: 'Curse (+13%)', porc: 13, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addweaken_02.png' },
                { name: 'Curse (+20%)', porc: 20, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addweaken_03.png' },
                { name: 'Curse (+26%)', porc: 26, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addweaken_04.png' },
                { name: 'Curse (+30%)', porc: 30, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addweaken_05.png' }
            ]}
        ]
    };    

    // Función para crear el HTML de los menús de orbes
    function createMenuHTML(data, menuType) {
        let menuHTML = `<div class="main-menu" data-menu-type="${menuType}">`;
        data.forEach(mainOption => {
            const hasSubmenu = mainOption.sub && mainOption.sub.length > 0;
            menuHTML += `
                <div class="menu-item main-menu-item" data-menu="${mainOption.name.toLowerCase()}" data-has-submenu="${hasSubmenu}">
                    <img src="${mainOption.img}" alt="${mainOption.name}" class="menu-icon">
                    <span class="menu-text">${mainOption.name}</span>
                </div>
            `;
        });
        menuHTML += `</div>`; // Cierre de .main-menu

        // Agregar submenús
        data.forEach(mainOption => {
            if (mainOption.sub && mainOption.sub.length > 0) {
                menuHTML += `<div class="submenu hidden" data-parent-menu="${mainOption.name.toLowerCase()}">
                    <div class="back-button">&leftarrow; Volver</div>`;
                mainOption.sub.forEach(subOption => {
                    menuHTML += `
                        <div class="menu-item submenu-item" data-orb-name="${subOption.name}" data-orb-img="${subOption.img}" data-orb-porc="${subOption.porc}">
                            <img src="${subOption.img}" alt="${subOption.name}" class="menu-icon">
                            <span class="menu-text">${subOption.name}</span>
                        </div>
                    `;
                });
                menuHTML += `</div>`; // Cierre de .submenu
            }
        });
        
        return menuHTML;
    }

    // Funciones existentes
    function renderMutantsGrid(filteredData) {
        mutantsGridContainer.innerHTML = '';
        if (Object.keys(filteredData).length === 0) {
            mutantsGridContainer.innerHTML = '<p class="text-muted text-center p-2">No se encontraron mutantes.</p>';
            return;
        }

        const grid = document.createElement("div");
        grid.classList.add("mutants-grid");
        
        grid.style.display = 'flex';
        grid.style.flexWrap = 'wrap'; // Permite que los elementos salten a la siguiente línea
        grid.style.justifyContent = 'flex-start'; // Alinea al inicio

        Object.values(filteredData).forEach(mutant => {
            const mutantCard = document.createElement("div");
            mutantCard.classList.add("mutant-card");
            
            // ELIMINAMOS TODOS LOS ESTILOS INLINE Y DEPENDEMOS DE CSS EXTERNO
            // Eliminado: mutantCard.style.width, mutantCard.style.margin, etc.
            
            const imageUrl = mutant.image || 'assets/img/mutants/default.png';
            const name = (mutant.name || '').trim();

            // Lógica para generar los iconos de genes
            const genesHtml = (mutant.genes || []).map(gene => {
                // Genera la URL: gene_a.png, gene_b.png, etc.
                const geneLetterLower = gene.toLowerCase(); 
                const geneImagePath = `https://s-ak.kobojo.com/mutants/assets/mobile/hud/fight_ui/gene_${geneLetterLower}.png`; 
                return `<img src="${geneImagePath}" alt="Gen ${gene}" class="gene-icon">`;
            }).join('');

            // Nueva estructura HTML
            mutantCard.innerHTML = `
                <img src="${imageUrl}" alt="${name}" class="mutant-card-image">
                <p class="mutant-card-name" title="${name}">
                    ${name}
                </p>
                <div class="mutant-genes">${genesHtml}</div>
            `;

            mutantCard.addEventListener("click", () => {
                mutantNameInput.value = mutant.name;
                mutantsGridContainer.style.display = 'none';
                starLevelContainer.style.display = "block";
                selectedMutant = mutant;

                levelInput.value = 1;
                lastValidLevel = 1; 

                // 👇 mantener el nivel si ya existe uno válido, si no poner 1
                let currentLevel = parseInt(levelInput.value);
                if (isNaN(currentLevel) || currentLevel <= 0) {
                    currentLevel = 1;
                }
                levelInput.value = currentLevel;

                // ✅ LIMPIEZA DEL DIV DE STAR CADA CAMBIO DE MUTANTE
                starOptionsContainer.innerHTML = "";
                starSelectorText.innerHTML = "";
                selectedStarLevel = null;
                starLevelContainer.style.pointerEvents = "auto";
                starLevelContainer.style.opacity = "1";

                updateStarLevels(mutant);

                for (let i = 0; i < selectedOrbs.length; i++) selectedOrbs[i] = null;
                displayResults(mutant, currentLevel);

                // 👇 aseguramos que el input de nivel se muestre
                levelInput.style.display = "inline-block";
            });

            grid.appendChild(mutantCard);
        });

        mutantsGridContainer.appendChild(grid);
        mutantsGridContainer.style.display = 'block';
    }

    function sortMutantsById(mutants) {
        return mutants.sort((a, b) => {
            if (a.id < b.id) return -1;
            if (a.id > b.id) return 1;
            return 0;
        });
    }

    function sortMutantsById(mutants) {
        return mutants.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    }

    function buildMutantsGrid(data) {
        mutantsGridContainer.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'mutants-grid';
        grid.style.display = 'flex';
        grid.style.flexWrap = 'wrap';
        grid.style.justifyContent = 'flex-start';
        allMutantCards = [];

        Object.values(data).filter(mutant => mutant.name && mutant.name.trim().toLowerCase() !== " No Name").forEach(mutant => {
            const name = (mutant.name || '').trim();

            const card = document.createElement('div');
            card.className = 'mutant-card';
            card.dataset.name = name.toLowerCase();
            
            // ELIMINAMOS TODOS LOS ESTILOS INLINE Y DEPENDEMOS DE CSS EXTERNO
            // Eliminado: card.style.width, card.style.margin, etc.
            
            const imageUrl = mutant.image || 'assets/img/mutants/default.png';

            // Lógica para generar los iconos de genes
            const genesHtml = (mutant.genes || []).map(gene => {
                // Genera la URL: gene_a.png, gene_b.png, etc.
                const geneLetterLower = gene.toLowerCase();
                const geneImagePath = `https://s-ak.kobojo.com/mutants/assets/mobile/hud/fight_ui/gene_${geneLetterLower}.png`;
                return `<img src="${geneImagePath}" alt="Gen ${gene}" class="gene-icon">`;
            }).join('');

            // Nueva estructura HTML
            card.innerHTML = `
                <img src="${imageUrl}" alt="${name}" class="mutant-card-image">
                <p class="mutant-card-name" title="${name}">
                    ${name}
                </p>
                <div class="mutant-genes">${genesHtml}</div>
            `;

            card.addEventListener('click', () => {
                mutantNameInput.value = name;
                mutantsGridContainer.style.display = 'none';
                starLevelContainer.style.display = 'block';
                selectedMutant = mutant;

                let currentLevel = parseInt(levelInput.value) || 1;
                levelInput.value = currentLevel;
                displayResults(mutant, currentLevel);
            });

            grid.appendChild(card);
            allMutantCards.push(card);
        });

        mutantsGridContainer.appendChild(grid);
    }

    // Filtrado rápido sin reconstruir el grid
    function filterMutants(query) {
        const q = (query || '').trim().toLowerCase();

        // Si aún no hay tarjetas construidas, no intentamos filtrar
        if (!allMutantCards.length) return;

        allMutantCards.forEach(card => {
            if (!q) {
                card.style.display = 'flex'; // mostrar todos si la query está vacía
                return;
            }
            if (card.dataset.name.includes(q)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // 🔎 EVENTO INPUT
    mutantNameInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length > 0) {
            let filteredMutants = Object.values(mutantsData).filter(mutant =>
                mutant.name !== " No Name" && mutant.name.toLowerCase().includes(query)
            );
            filteredMutants = sortMutantsById(filteredMutants);
            filterMutants(query);              // aplica el filtro rápido
            renderMutantsGrid(filteredMutants); // sigues usando tu render
        } else {
            let filteredMutants = Object.values(mutantsData).filter(mutant =>
                mutant.name !== " No Name"
            );
            filteredMutants = sortMutantsById(filteredMutants);
            filterMutants(query);              // muestra todo
            renderMutantsGrid(filteredMutants);
        }
    });

    // 🔎 EVENTO FOCUS
    mutantNameInput.addEventListener("focus", () => {
        if (mutantNameInput.value.length === 0) {
            let filteredMutants = Object.values(mutantsData).filter(mutant =>
                mutant.name !== " No Name"
            );
            filteredMutants = sortMutantsById(filteredMutants);
            filterMutants(mutantNameInput.value.toLowerCase());
            renderMutantsGrid(filteredMutants);
        }
        mutantsGridContainer.style.display = 'block';
    });

    document.addEventListener("click", (e) => {
        if (!mutantsGridContainer.contains(e.target) && !mutantNameInput.contains(e.target)) {
             if (mutantNameInput.value.trim() === "") {
                mutantsGridContainer.style.display = "none";
            }
        }
    });

    fetch("https://raw.githubusercontent.com/DustinSalinas/stats25/main/sts25.csv")
        .then(response => response.text())
        .then(csvText => {
            Papa.parse(csvText, {
                delimiter: ";",       // Indicamos que el separador es punto y coma
                skipEmptyLines: true,
                complete: (results) => {
                    // results.data es un arreglo de filas, y cada fila es un arreglo de columnas
                    const dataAsObject = results.data.reduce((acc, row) => {
                        // Verificamos que la fila tenga suficientes columnas para evitar errores
                        if (row.length < 18) return acc;

                        const key = row[0]; // Columna A: "Specimen_A_01"
                        if (!key) return acc;

                        // Mapeamos las columnas que nos diste a las propiedades del objeto
                        const mutant = {
                            key: key,
                            id: key.replace('Specimen_', ''),
                            name: row[1],
                            speed: parseFloat(row[2]),
                            life: parseInt(row[5]),
                            atk1: parseInt(row[7]),
                            atk1p: parseInt(row[8]),
                            atk2: parseInt(row[9].split(':')[0]),
                            atk2p: parseInt(row[10].split(':')[0]),
                            nameAbility: row[15].includes('ability_') ? row[15].split('ability_')[1].split(';')[0].replace('_plus', '').trim() : 'Unknown',
                            ability: parseInt(row[16]),
                            abilityp: parseInt(row[17]),
                            image: `https://s-ak.kobojo.com/mutants/assets/thumbnails/${key.toLowerCase()}.png`,
                            type: row[13].trim(),
                            stars: ["No Star", "Bronze", "Silver", "Gold", "Platinum"]
                        };
                    
                        // --- INICIO: LÓGICA PARA EXTRAER GENES (NUEVO) ---
                        // El ID (ej. 'AF_06' o 'B_01') contiene los genes.
                        const genePart = mutant.id.split('_')[0].toUpperCase();
                        let genes = [];
                        if (genePart.length === 1) {
                            genes.push(genePart); // Ejemplo: 'B' -> ['B']
                        } else if (genePart.length >= 2) {
                            // Ejemplo: 'AF' -> ['A', 'F']
                            genes.push(genePart[0]);
                            genes.push(genePart[1]);
                        }
                        mutant.genes = genes;
                        // --- FIN: LÓGICA PARA EXTRAER GENES ---

                        // Capitalizamos el nombre de la habilidad (ej. "shield" -> "Shield")
                        mutant.nameAbility = mutant.nameAbility.charAt(0).toUpperCase() + mutant.nameAbility.slice(1);
                        
                        acc[key] = mutant;
                        return acc;
                    }, {});
                    mutantsData = dataAsObject;
                    buildMutantsGrid(mutantsData); // ¡El resto de tu código funcionará!
                }
            });
        })
        .catch(error => console.error("❌ Error al cargar o procesar el archivo CSV:", error));

    levelInput.addEventListener("input", () => {
        clearTimeout(levelChangeTimeout);

        levelChangeTimeout = setTimeout(() => {
            if (!selectedMutant) {
                return;
            }

            const inputValue = levelInput.value.trim();
            let parsedLevel = parseInt(inputValue);

            if (!isNaN(parsedLevel) && parsedLevel > 0) {
                if (parsedLevel > 1000000) {
                    parsedLevel = 1000000;
                    levelInput.value = parsedLevel;
                }
                lastValidLevel = parsedLevel;
                displayResults(selectedMutant, lastValidLevel);
            } else {
                displayResults(selectedMutant, lastValidLevel);
            }
        }, 1);
    });

    starSelectorContainer.addEventListener("click", () => {
        starOptionsContainer.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest('.star-dropdown')) {
            starOptionsContainer.classList.remove("show");
        }
    });

    function updateStarLevels(mutant) {
        const TYPE = (mutant.type || "").toString().trim().toUpperCase();
        const ID   = (mutant.id || "").toString().trim();

        const clearMenu = () => {
            starOptionsContainer.innerHTML = "";
            starOptionsContainer.classList.remove("show");
            selectedStarLevel = null;
            starSelectorText.innerHTML = "";
        };

        const setBlockedBadge = (typeUpper) => {
            let imgSrc = "";
            switch (typeUpper) {
                case "CAPTAINPEACE":
                    imgSrc = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_captainpeace.png"; break;
                case "SEASONAL":
                    imgSrc = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_seasonal.png"; break;
                case "GACHA":
                    imgSrc = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_gacha.png"; break;
                case "VIDEOGAME":
                    imgSrc = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_videogame.png"; break;
                default:
                    imgSrc = "images/default.png"; break;
            }
            starSelectorText.innerHTML = `<img src="${imgSrc}" alt="${typeUpper}" class="star-icon">`;
        };

        // 🔹 Casos especiales por ID antes de cualquier TYPE
        if (["AF_06", "EF_14", "DF_11"].includes(ID)) {
            clearMenu();
            const stars = ["No Star", "Gold"];
            const starImageMap = {
                "No Star": "https://s-ak.kobojo.com/mutants/assets/mobile/hud/contextual_ui/cancel.png",
                "Gold": "https://s-ak.kobojo.com/mutants/assets/mobile/thumbnails/star_gold.png"
            };
            stars.forEach(star => {
                const starOption = document.createElement("div");
                starOption.classList.add("star-option");
                starOption.dataset.star = star;
                starOption.innerHTML = `<img src="${starImageMap[star]}" alt="${star}" class="star-icon"> ${star}`;
                starOption.addEventListener("click", () => {
                    selectedStarLevel = (star === "No Star") ? null : star;
                    starSelectorText.innerHTML = (star === "No Star") ? "" : `<img src="${starImageMap[star]}" alt="${star}" class="star-icon">`;
                    starOptionsContainer.classList.remove("show");
                    displayResults(selectedMutant, parseInt(levelInput.value));
                });
                starOptionsContainer.appendChild(starOption);
            });
            return;
        }

        if (ID === "DE_06") {
            clearMenu();
            const stars = ["No Star", "Easter"];
            const starImageMap = {
                "No Star": "https://s-ak.kobojo.com/mutants/assets/mobile/hud/contextual_ui/cancel.png",
                "Easter": "https://s-ak.kobojo.com/mutants/assets/gachacontent/icon_easter.png"
            };
            stars.forEach(star => {
                const starOption = document.createElement("div");
                starOption.classList.add("star-option");
                starOption.dataset.star = star;
                
                // 1. Añadimos la clase 'seasonal-icon' si la estrella es "Easter"
                const extraClass = (star === 'Easter') ? 'seasonal-icon' : '';

                // 2. Incluimos la variable ${extraClass} en la etiqueta de la imagen
                starOption.innerHTML = `<img src="${starImageMap[star]}" alt="${star}" class="star-icon ${extraClass}"> ${star}`;

                starOption.addEventListener("click", () => {
                    selectedStarLevel = (star === "No Star") ? null : star;
                    
                    // 3. Hacemos lo mismo para la estrella seleccionada que se muestra arriba
                    const selectedExtraClass = (star === 'Easter') ? 'seasonal-icon' : '';
                    starSelectorText.innerHTML = (star === "No Star") ? "" : `<img src="${starImageMap[star]}" alt="${star}" class="star-icon ${selectedExtraClass}">`;
                    
                    starOptionsContainer.classList.remove("show");
                    displayResults(selectedMutant, parseInt(levelInput.value));
                });
                starOptionsContainer.appendChild(starOption);
            });
            return;
        }

        // 🔮 ZODIAC: solo No Star y Silver
        if (TYPE === "ZODIAC") {
            clearMenu();
            const stars = ["No Star", "Silver"];
            const starImageMap = {
                "No Star": "https://s-ak.kobojo.com/mutants/assets/mobile/hud/contextual_ui/cancel.png",
                "Silver": "https://s-ak.kobojo.com/mutants/assets/mobile/thumbnails/star_silver.png"
            };

            stars.forEach(star => {
                const starOption = document.createElement("div");
                starOption.classList.add("star-option");
                starOption.dataset.star = star;
                starOption.innerHTML = `<img src="${starImageMap[star]}" alt="${star}" class="star-icon"> ${star}`;
                starOption.addEventListener("click", () => {
                    selectedStarLevel = (star === "No Star") ? null : star;
                    starSelectorText.innerHTML = (star === "No Star") ? "" : `<img src="${starImageMap[star]}" alt="${star}" class="star-icon">`;
                    starOptionsContainer.classList.remove("show");
                    displayResults(selectedMutant, parseInt(levelInput.value));
                });
                starOptionsContainer.appendChild(starOption);
            });
            return;
        }

        // ⭐ LEGEND y HEROIC: todas las estrellas
        if (TYPE === "LEGEND" || TYPE === "HEROIC") {
            clearMenu();
            const stars = ["No Star", "Bronze", "Silver", "Gold", "Platinum"];
            const starImageMap = {
                "No Star": "https://s-ak.kobojo.com/mutants/assets/mobile/hud/contextual_ui/cancel.png",
                "Bronze": "https://s-ak.kobojo.com/mutants/assets/mobile/thumbnails/star_bronze.png",
                "Silver": "https://s-ak.kobojo.com/mutants/assets/mobile/thumbnails/star_silver.png",
                "Gold": "https://s-ak.kobojo.com/mutants/assets/mobile/thumbnails/star_gold.png",
                "Platinum": "https://s-ak.kobojo.com/mutants/assets/mobile/thumbnails/star_platinum.png"
            };

            stars.forEach(star => {
                const starOption = document.createElement("div");
                starOption.classList.add("star-option");
                starOption.dataset.star = star;
                starOption.innerHTML = `<img src="${starImageMap[star]}" alt="${star}" class="star-icon"> ${star}`;
                starOption.addEventListener("click", () => {
                    selectedStarLevel = (star === "No Star") ? null : star;
                    starSelectorText.innerHTML = (star === "No Star") ? "" : `<img src="${starImageMap[star]}" alt="${star}" class="star-icon">`;
                    starOptionsContainer.classList.remove("show");
                    displayResults(selectedMutant, parseInt(levelInput.value));
                });
                starOptionsContainer.appendChild(starOption);
            });
            return;
        }

        // ✅ EXCEPCIÓN para el Exclusive con 7 versiones
        if (mutant.id === "FE_13") {
            starOptionsContainer.innerHTML = "";
            selectedStarLevel = null;
            starSelectorText.innerHTML = "";

            // Aquí defines sus 7 versiones manualmente
            const stars = ["No Star", "Spring", "Autumn", "Winter", "Winter Bug", "Summer", "Seasonal"]; 

            const starImageMap = {
                "No Star": "https://s-ak.kobojo.com/mutants/assets/mobile/hud/contextual_ui/cancel.png",
                "Spring": "https://s-ak.kobojo.com/mutants/assets/gachacontent/icon_spring.png",
                "Autumn": "https://s-ak.kobojo.com/mutants/assets/gachacontent/icon_autumn.png",
                "Winter": "https://s-ak.kobojo.com/mutants/assets/gachacontent/icon_winter.png",
                "Winter Bug": "https://s-ak.kobojo.com/mutants/assets/mobile/thumbnails/star_gold.png",
                "Summer": "https://s-ak.kobojo.com/mutants/assets/gachacontent/icon_summer.png",
                "Seasonal": "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_seasonal.png"
            };

            stars.forEach(star => {
                const starOption = document.createElement("div");
                starOption.classList.add("star-option");
                starOption.dataset.star = star;
                const starText = (star === "No Star") ? "No Star" : star;

                // clase especial para los de temporada
                const extraClass = ["Spring","Summer","Autumn","Winter"].includes(star) ? "seasonal-icon" : "";

                starOption.innerHTML = `
                    <img src="${starImageMap[star]}" alt="${star}" class="star-icon ${extraClass}"> ${starText}
                `;

                starOption.addEventListener("click", () => {
                    selectedStarLevel = (star === "No Star") ? null : star;

                    // Si se selecciona "No Star", vacía el contenedor
                    if (star === "No Star") {
                        starSelectorText.innerHTML = "";
                    } else {
                        // Si es cualquier otra estrella, muestra la imagen correspondiente
                        const extraClass = ["Spring","Summer","Autumn","Winter"].includes(star) ? "seasonal-icon" : "";
                        
                        // Aplica la clase especial solo si NO es "Winter Bug" (Gold) o "Seasonal"
                        const needsSpecialClass = !(star === "Winter Bug" || star === "Seasonal");
                        const specialClass = needsSpecialClass ? "special-star" : "";

                        starSelectorText.innerHTML = `
                            <img src="${starImageMap[star]}" alt="${star}" class="star-icon ${extraClass} ${specialClass}">
                        `;
                    }

                    starOptionsContainer.classList.remove("show");
                    displayResults(mutant, parseInt(levelInput.value));
                });

                starOptionsContainer.appendChild(starOption);
            });


            return; // 👈 importante
        }

        // 🔒 bloqueados: CAPTAINPEACE, GACHA, SEASONAL, VIDEOGAME
        const BLOCKED = ["CAPTAINPEACE", "GACHA", "SEASONAL", "VIDEOGAME"];
        if (BLOCKED.includes(TYPE) && !goldStarMutantIds.includes(ID)) {
            clearMenu();
            setBlockedBadge(TYPE);
            starLevelContainer.style.pointerEvents = "none";
            return;
        } else {
            starLevelContainer.style.pointerEvents = "auto";
        }

        starOptionsContainer.innerHTML = "";
        selectedStarLevel = null;
        starSelectorText.innerHTML = "";

        const stars = [];
        if (mutant.name === "Vivaldi") {
            stars.push("Base", "Spring", "Autumn", "Winter", "Summer", "Seasonal");
        } else if (mutant.type === "Gacha") {
            stars.push("Gacha");
        } else if (mutant.stars) {
            stars.push(...mutant.stars);
        } else if (goldStarMutantIds.includes(mutant.id)) {
            if (mutant.id === "DE_06") {
                stars.push("No Star", "Easter");
            } else {
                stars.push("No Star", "Gold");
            }
        } else {
            const noStarsOption = document.createElement("div");
            noStarsOption.classList.add("star-option");
            noStarsOption.textContent = "Remove";
            noStarsOption.addEventListener("click", () => {
                selectedStarLevel = null;
                starSelectorText.innerHTML = "";
                starOptionsContainer.classList.remove("show");
                displayResults(selectedMutant, parseInt(levelInput.value));
            });
            starOptionsContainer.appendChild(noStarsOption);
            return;
        }

        const starImageMap = {
            "Bronze": "https://s-ak.kobojo.com/mutants/assets/mobile/thumbnails/star_bronze.png",
            "Silver": "https://s-ak.kobojo.com/mutants/assets/mobile/thumbnails/star_silver.png",
            "Gold": "https://s-ak.kobojo.com/mutants/assets/mobile/thumbnails/star_gold.png",
            "Platinum": "https://s-ak.kobojo.com/mutants/assets/mobile/thumbnails/star_platinum.png",
            "Gacha": "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_gacha.png",
            "Base": "https://s-ak.kobojo.com/mutants/assets/mobile/hud/contextual_ui/cancel.png",
            "Spring": "https://s-ak.kobojo.com/mutants/assets/gachacontent/icon_spring.png",
            "Autumn": "https://s-ak.kobojo.com/mutants/assets/gachacontent/icon_autumn.png",
            "Winter": "https://s-ak.kobojo.com/mutants/assets/gachacontent/icon_winter.png",
            "Summer": "https://s-ak.kobojo.com/mutants/assets/gachacontent/icon_summer.png",
            "Seasonal": "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_seasonal.png",
            "Easter": "https://s-ak.kobojo.com/mutants/assets/gachacontent/icon_easter.png"
        };

        stars.forEach(star => {
            const starOption = document.createElement("div");
            starOption.classList.add("star-option");
            starOption.dataset.star = star;
            const starText = star === "Base" ? "Remove" : star;

            // 👇 Aplica clase especial solo a DE_06 con Easter
            let extraClass = "";
            if (mutant.id === "DE_06" && star === "Easter") {
                extraClass = "seasonal-icon";
            }

            starOption.innerHTML = `
                <img src="${starImageMap[star] || 'https://s-ak.kobojo.com/mutants/assets/mobile/hud/contextual_ui/cancel.png'}" 
                    alt="${star}" class="star-icon ${extraClass}"> ${starText}
            `;

            starOption.addEventListener("click", () => {
                if (star === "No Star") {
                    selectedStarLevel = null;
                    starSelectorText.innerHTML = "";
                } else {
                    selectedStarLevel = star;
                    starSelectorText.innerHTML = `<img src="${starImageMap[star]}" alt="${star}" class="star-icon ${extraClass}">`;
                }
                starOptionsContainer.classList.remove("show");
                displayResults(selectedMutant, parseInt(levelInput.value));
            });

            starOptionsContainer.appendChild(starOption);
        });
    }

    function getAbilityOrbsBonus(selectedOrbs, abilityName) {
        let sum = 0;
        selectedOrbs.forEach((orb) => {
            if (orb && orb.name && orb.porc) {
                const orbType = orb.name.split(" ")[0];

                // Coincide con la habilidad natural (ej. Boost, Retaliate, etc.)
                if (orbType === abilityName) {
                    sum += orb.porc;
                }

                // O si es un orbe de Attack, también aumenta la habilidad
                if (orbType === "Attack") {
                    sum += orb.porc;
                }
            }
        });
        return sum;
    }

    function getAttackOrbsBonus(selectedOrbs) {
    let sum = 0;
    selectedOrbs.forEach((orb) => {
        if (orb && orb.name && orb.porc) {
        const type = orb.name.split(" ")[0];
        if (type === "Attack") sum += orb.porc;
        }
    });
    return sum;
    }

    function getSameAbilityAddValue(atkBase, selectedOrbs, abilityName) {
    let add = 0;
    // Normalizamos el nombre de la habilidad para que coincida con los nombres de los orbes.
    let normalizedAbilityName = abilityName;

    if (normalizedAbilityName === "Regen") {
        normalizedAbilityName = "Drain";
    }
    if (normalizedAbilityName === "Strengthen") {
        normalizedAbilityName = "Boost";
    }
    if (normalizedAbilityName === "Weaken") {
        normalizedAbilityName = "Curse";
    }
    if (normalizedAbilityName === "Slash") {
        normalizedAbilityName = "Wound";
    }

    selectedOrbs.forEach((orb) => {
        if (orb && orb.name && orb.porc) {
            const type = orb.name.split(" ")[0]; // Ej: "Drain", "Boost"
            
            // Comparamos el tipo de orbe con la habilidad ya normalizada.
            if (type === normalizedAbilityName) {
                add += Math.floor((orb.porc / 100) * atkBase);
            }
        }
    });
    return add;
}

    function displayResults(mutant, level) {
        let statsBase = {
            life: mutant.life,
            atk1: mutant.atk1,
            atk1p: mutant.atk1p,
            atk2: mutant.atk2,
            atk2p: mutant.atk2p,
            speed: mutant.speed
        };
        
        // 🔹 Ajuste especial para AF_06
        if (mutant.id === "AF_06") {
            if (selectedStarLevel === "Gold") {
                statsBase = { life: 2181, atk1: 570, atk1p: 855, atk2: 570, atk2p: 855, speed: mutant.speed };
            }
        }

        const bonus = (mutant.type === "Gacha")
        ? starBonuses["Gacha"]
        : (starBonuses[selectedStarLevel] || 1);
        let statsWithOrbs = getStatsWithOrbs(statsBase, level, bonus, selectedOrbs);

        // Selección dinámica de ATK base según nivel
        let atkBaseRaw;
        if (level < 10) {
            atkBaseRaw = statsBase.atk1;
        }else if (level >= 10) {
            atkBaseRaw = statsBase.atk1p;
        }

        // ATK base sin orbes
        const atkBase = atkBaseRaw * ((level / 10) + 0.9) * bonus;

        // Porcentaje base de habilidad
        const abilityBasePorc = Math.abs((level < 25) ? mutant.ability : mutant.abilityp);

        // 1) valor base de la habilidad natural
        const habilidadBase = Math.floor((abilityBasePorc / 100) * atkBase);

        // 2) suma de aportes de orbes de la misma habilidad
        const addSameAbility = getSameAbilityAddValue(atkBase, selectedOrbs, mutant.nameAbility);

        // 3) bonus total de orbes de Attack/Daño
        const atkOrbsBonus = getAttackOrbsBonus(selectedOrbs);

        // 4) resultado final sin decimales ni redondeo adicional
        const habilidadFinal = Math.floor((habilidadBase + addSameAbility) * (1 + atkOrbsBonus / 100));

        let atkBaseRaw2;
        if (level < 10) {
            atkBaseRaw2 = statsBase.atk2;
        }else if (level >= 10) {
            atkBaseRaw2 = statsBase.atk2p;
        }

        // ATK base sin orbes
        const atkBase2 = atkBaseRaw2 * ((level / 10) + 0.9) * bonus;

        // 1) valor base de la habilidad natural
        const habilidadBase2 = Math.floor((abilityBasePorc / 100) * atkBase2);

        // 2) suma de aportes de orbes de la misma habilidad
        const addSameAbility2 = getSameAbilityAddValue(atkBase2, selectedOrbs, mutant.nameAbility);

        // 4) resultado final (ENTERO)
        const habilidadFinal2 = Math.round((habilidadBase2 + addSameAbility2) * (1 + atkOrbsBonus / 100));

        if (!mutant || !level) return;

        let typeImage;
        if (mutant.type === "LEGEND") {
            typeImage = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_legend.png";
        } else if (mutant.type === "HEROIC") {
            typeImage = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_heroic.png";
        } else if (mutant.type === "SEASONAL") {
            typeImage = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_seasonal.png";
        } else if (mutant.type === "CAPTAINPEACE") {
            typeImage = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_captainpeace.png";
        } else if (mutant.type === "RECIPE") {
            typeImage = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_recipe.png";
        } else if (mutant.type === "VIDEOGAME") {
            typeImage = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_videogame.png";
        } else if (mutant.type === "ZODIAC") {
            typeImage = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_zodiac.png";
        } else if (mutant.type === "GACHA") {
            typeImage = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_gacha.png";
        } else if (mutant.type === "PVP") {
            typeImage = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_pvp.png";
        } else if (mutant.type === "BINGO") {
            typeImage = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/main/picto_mutodesk.png";
        } else if (mutant.type === "COMMUNITY") {
            typeImage = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_community.png";
        }

        const mutantIdPrefix = mutant.id.split("_")[0].toLowerCase();
        const atk1Letter = mutantIdPrefix.charAt(0);
        const atk2Letter = mutantIdPrefix.charAt(1);

        const invertedGeneIds = ["EC_13", "FD_12"];
        const doubleNeutralIds = ["FF_05"];
        const GenIdMissy = ["CA_99"];
        const invertedSingleGeneIds = ["D_13"];
        const doubleSameGeneIds = ["C_14", "E_13", "A_14", "F_14"];

        let gene1Images = '';
        let gene2Images = '';

        if (doubleNeutralIds.includes(mutant.id)) {
            gene1Images = `<img src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/fight_ui/gene_all.png" alt="Gene 1" width="30">`;
            gene2Images = `<img src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/fight_ui/gene_all.png" alt="Gene 2" width="30">`;

        } else if (invertedGeneIds.includes(mutant.id)) {
            gene1Images = `<img src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/fight_ui/gene_${atk2Letter}.png" alt="Gene 1" width="30">`;
            gene2Images = `<img src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/fight_ui/gene_${atk1Letter}.png" alt="Gene 2" width="30">`;

        } else if (GenIdMissy.includes(mutant.id)) {
            gene1Images = `<img src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/fight_ui/gene_${atk2Letter}.png" alt="Gene 1" width="30">`;
            gene2Images = `<img src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/fight_ui/gene_e.png" alt="Gene 2" width="30">`;

        } else if (invertedSingleGeneIds.includes(mutant.id)) {
            gene1Images = `<img src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/fight_ui/gene_all.png" alt="Gene 1" width="30">`;
            gene2Images = `<img src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/fight_ui/gene_${atk1Letter}.png" alt="Gene 2" width="30">`;

        } else if (doubleSameGeneIds.includes(mutant.id)) {
            gene1Images = `<img src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/fight_ui/gene_${atk1Letter}.png" alt="Gene 1" width="30">`;
            gene2Images = `<img src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/fight_ui/gene_${atk1Letter}.png" alt="Gene 2" width="30">`;

        } else if (atk2Letter) {
            gene1Images = `<img src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/fight_ui/gene_${atk1Letter}.png" alt="Gene 1" width="30">`;
            gene2Images = `<img src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/fight_ui/gene_${atk2Letter}.png" alt="Gene 2" width="30">`;

        } else {
            gene1Images = `<img src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/fight_ui/gene_${atk1Letter}.png" alt="Gene 1" width="30">`;
            gene2Images = `<img src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/fight_ui/gene_all.png" alt="Gene 2" width="30">`;
        }

        let rawLife, rawAtk1, rawAtk2, rawAbility, rawAbility2;

        if (mutant.name === "Vivaldi") {
            const st = selectedStarLevel || "No Star";
            switch (st) {
                case "Spring":
                    rawLife = mutant.life * ((level / 10) + 0.9) * bonus;
                    if (level < 10) {
                        rawAtk1 = mutant.atk1 * ((level / 10) + 0.9) * bonus;
                        rawAtk2 = mutant.atk2 * ((level / 10) + 0.9) * bonus;
                    } else if (level >= 10 && level < 15) {
                        rawAtk1 = mutant.atk1p * ((level / 10) + 0.9) * bonus;
                        rawAtk2 = mutant.atk2 * ((level / 10) + 0.9) * bonus;
                    }
                    if (level >= 15) {
                        rawAtk1 = mutant.atk1p * ((level / 10) + 0.9) * bonus;
                        rawAtk2 = mutant.atk2p * ((level / 10) + 0.9) * bonus;
                    }
                    if (level < 25) {
                        rawAbility = mutant.ability / 100 * mutant.atk1 * ((level / 10) + 0.9) *  bonus;
                        rawAbility2 = mutant.ability / 100 * mutant.atk2 * ((level / 10) + 0.9) * bonus;
                    } else {
                        rawAbility = mutant.abilityp / 100 * mutant.atk1p * ((level / 10) + 0.9) * bonus;
                        rawAbility2 = mutant.abilityp / 100 * mutant.atk2p * ((level / 10) + 0.9) * bonus;
                    }
                    break;
                case "Summer":
                    rawLife = mutant.life * ((level / 10) + 0.9) * bonus;
                    if (level < 10) {
                        rawAtk1 = mutant.atk1 * ((level / 10) + 0.9) * bonus;
                        rawAtk2 = mutant.atk2 * ((level / 10) + 0.9) * bonus;
                    } else if (level >= 10 && level < 15) {
                        rawAtk1 = mutant.atk1p * ((level / 10) + 0.9) * bonus;
                        rawAtk2 = mutant.atk2 * ((level / 10) + 0.9) * bonus;
                    }
                    if (level >= 15) {
                        rawAtk1 = mutant.atk1p * ((level / 10) + 0.9) * bonus;
                        rawAtk2 = mutant.atk2p * ((level / 10) + 0.9) * bonus;
                    }
                    if (level < 25) {
                        rawAbility = mutant.ability / 100 * mutant.atk1 * ((level / 10) + 0.9) *  bonus;
                        rawAbility2 = mutant.ability / 100 * mutant.atk2 * ((level / 10) + 0.9) * bonus;
                    } else {
                        rawAbility = mutant.abilityp / 100 * mutant.atk1p * ((level / 10) + 0.9) * bonus;
                        rawAbility2 = mutant.abilityp / 100 * mutant.atk2p * ((level / 10) + 0.9) * bonus;
                    }
                    break;
                case "Autumn":
                    rawLife = mutant.life * ((level / 10) + 0.9) * bonus;
                    if (level < 10) {
                        rawAtk1 = mutant.atk1 * ((level / 10) + 0.9) * bonus;
                        rawAtk2 = mutant.atk2 * ((level / 10) + 0.9) * bonus;
                    } else if (level >= 10 && level < 15) {
                        rawAtk1 = mutant.atk1p * ((level / 10) + 0.9) * bonus;
                        rawAtk2 = mutant.atk2 * ((level / 10) + 0.9) * bonus;
                    }
                    if (level >= 15) {
                        rawAtk1 = mutant.atk1p * ((level / 10) + 0.9) * bonus;
                        rawAtk2 = mutant.atk2p * ((level / 10) + 0.9) * bonus;
                    }
                    if (level < 25) {
                        rawAbility = mutant.ability / 100 * mutant.atk1 * ((level / 10) + 0.9) *  bonus;
                        rawAbility2 = mutant.ability / 100 * mutant.atk2 * ((level / 10) + 0.9) * bonus;
                    } else {
                        rawAbility = mutant.abilityp / 100 * mutant.atk1p * ((level / 10) + 0.9) * bonus;
                        rawAbility2 = mutant.abilityp / 100 * mutant.atk2p * ((level / 10) + 0.9) * bonus;
                    }
                    break;
                case "Winter":
                    rawLife = mutant.life * ((level / 10) + 0.9) * bonus;
                    if (level < 10) {
                        rawAtk1 = mutant.atk1 * ((level / 10) + 0.9) * bonus;
                        rawAtk2 = mutant.atk2 * ((level / 10) + 0.9) * bonus;
                    } else if (level >= 10 && level < 15) {
                        rawAtk1 = mutant.atk1p * ((level / 10) + 0.9) * bonus;
                        rawAtk2 = mutant.atk2 * ((level / 10) + 0.9) * bonus;
                    }
                    if (level >= 15) {
                        rawAtk1 = mutant.atk1p * ((level / 10) + 0.9) * bonus;
                        rawAtk2 = mutant.atk2p * ((level / 10) + 0.9) * bonus;
                    }
                    if (level < 25) {
                        rawAbility = mutant.ability / 100 * mutant.atk1 * ((level / 10) + 0.9) *  bonus;
                        rawAbility2 = mutant.ability / 100 * mutant.atk2 * ((level / 10) + 0.9) * bonus;
                    } else {
                        rawAbility = mutant.abilityp / 100 * mutant.atk1p * ((level / 10) + 0.9) * bonus;
                        rawAbility2 = mutant.abilityp / 100 * mutant.atk2p * ((level / 10) + 0.9) * bonus;
                    }
                    break;
                case "Winter Bug":
                    rawLife = mutant.life * ((level / 10) + 0.9) * bonus;
                    if (level < 10) {
                        rawAtk1 = mutant.atk1 * ((level / 10) + 0.9) * bonus;
                        rawAtk2 = mutant.atk2 * ((level / 10) + 0.9) * bonus;
                    } else if (level >= 10 && level < 15) {
                        rawAtk1 = mutant.atk1p * ((level / 10) + 0.9) * bonus;
                        rawAtk2 = mutant.atk2 * ((level / 10) + 0.9) * bonus;
                    }
                    if (level >= 15) {
                        rawAtk1 = mutant.atk1p * ((level / 10) + 0.9) * bonus;
                        rawAtk2 = mutant.atk2p * ((level / 10) + 0.9) * bonus;
                    }
                    if (level < 25) {
                        rawAbility = mutant.ability / 100 * mutant.atk1 * ((level / 10) + 0.9) *  bonus;
                        rawAbility2 = mutant.ability / 100 * mutant.atk2 * ((level / 10) + 0.9) * bonus;
                    } else {
                        rawAbility = mutant.abilityp / 100 * mutant.atk1p * ((level / 10) + 0.9) * bonus;
                        rawAbility2 = mutant.abilityp / 100 * mutant.atk2p * ((level / 10) + 0.9) * bonus;
                    }
                    break;
                case "Seasonal":
                    rawLife = mutant.life * ((level / 10) + 0.9) * bonus;
                    if (level < 10) {
                        rawAtk1 = mutant.atk1 * ((level / 10) + 0.9) * bonus;
                        rawAtk2 = mutant.atk2 * ((level / 10) + 0.9) * bonus;
                    } else if (level >= 10 && level < 15) {
                        rawAtk1 = mutant.atk1p * ((level / 10) + 0.9) * bonus;
                        rawAtk2 = mutant.atk2 * ((level / 10) + 0.9) * bonus;
                    }
                    if (level >= 15) {
                        rawAtk1 = mutant.atk1p * ((level / 10) + 0.9) * bonus;
                        rawAtk2 = mutant.atk2p * ((level / 10) + 0.9) * bonus;
                    }
                    if (level < 25) {
                        rawAbility = mutant.ability / 100 * mutant.atk1 * ((level / 10) + 0.9) *  bonus;
                        rawAbility2 = mutant.ability / 100 * mutant.atk2 * ((level / 10) + 0.9) * bonus;
                    } else {
                        rawAbility = mutant.abilityp / 100 * mutant.atk1p * ((level / 10) + 0.9) * bonus;
                        rawAbility2 = mutant.abilityp / 100 * mutant.atk2p * ((level / 10) + 0.9) * bonus;
                    }
                    break;
                case "No Star":
                    rawLife = mutant.life * ((level / 10) + 0.9);
                    if (level < 10) {
                        rawAtk1 = mutant.atk1 * ((level / 10) + 0.9);
                        rawAtk2 = mutant.atk2 * ((level / 10) + 0.9);
                    } else if (level >= 10 && level < 15) {
                        rawAtk1 = mutant.atk1p * ((level / 10) + 0.9);
                        rawAtk2 = mutant.atk2 * ((level / 10) + 0.9);
                    }
                    if (level >= 15) {
                        rawAtk1 = mutant.atk1p * ((level / 10) + 0.9);
                        rawAtk2 = mutant.atk2p * ((level / 10) + 0.9);
                    }
                    if (level < 25) {
                        rawAbility = mutant.ability / 100 * mutant.atk1p * ((level / 10) + 0.9);
                        rawAbility2 = mutant.ability / 100 * mutant.atk2p * ((level / 10) + 0.9);
                    } else {
                        rawAbility = mutant.abilityp / 100 * mutant.atk1p * ((level / 10) + 0.9);
                        rawAbility2 = mutant.abilityp / 100 * mutant.atk2p * ((level / 10) + 0.9);
                    }
                    break;
            }
        } else if (mutant.type === "Gacha") {
            rawLife = mutant.life * ((level / 10) + 0.9) * bonus;
            if (level < 10) {
                rawAtk1 = mutant.atk1 * ((level / 10) + 0.9) * bonus;
                rawAtk2 = mutant.atk2 * ((level / 10) + 0.9) * bonus;
            } else if (level >= 10 && level < 15) {
                rawAtk1 = mutant.atk1p * ((level / 10) + 0.9) * bonus;
                rawAtk2 = mutant.atk2 * ((level / 10) + 0.9) * bonus;
            }
            if (level >= 15) {
                rawAtk1 = mutant.atk1p * ((level / 10) + 0.9) * bonus;
                rawAtk2 = mutant.atk2p * ((level / 10) + 0.9) * bonus;
            }
            if (level < 25) {
                rawAbility = mutant.ability / 100 * mutant.atk1 * ((level / 10) + 0.9) * bonus;
                rawAbility2 = mutant.ability / 100 * mutant.atk2 * ((level / 10) + 0.9) * bonus;
            } else {
                rawAbility = mutant.abilityp / 100 * mutant.atk1p * ((level / 10) + 0.9) * bonus;
                rawAbility2 = mutant.abilityp / 100 * mutant.atk2p * ((level / 10) + 0.9) * bonus;
            }
        } else if (mutant.id === "AF_06") {
            if (selectedStarLevel === "Gold") {
                rawLife = 2181 * ((level / 10) + 0.9) * 1.75;
                if (level < 10) {
                    rawAtk1 = 570 * ((level / 10) + 0.9) * 1.75;
                    rawAtk2 = 570 * ((level / 10) + 0.9) * 1.75;
                } else if (level >= 10 && level < 15) {
                    rawAtk1 = 855 * ((level / 10) + 0.9) * 1.75;
                    rawAtk2 = 570 * ((level / 10) + 0.9) * 1.75;
                }
                if (level >= 15) {
                    rawAtk1 = 855 * ((level / 10) + 0.9) * 1.75;
                    rawAtk2 = 855 * ((level / 10) + 0.9) * 1.75;
                }
                if (level < 25) {
                    rawAbility = 20 / 100 * 570 * ((level / 10) + 0.9)  * 1.75;
                    rawAbility2 = 20 / 100 * 570 * ((level / 10) + 0.9) * 1.75;
                } else {
                    rawAbility = 35 / 100 * 855 * ((level / 10) + 0.9) * 1.75;
                    rawAbility2 = 35 / 100 * 855 * ((level / 10) + 0.9) * 1.75;
                }
            }
            else {
                rawLife = mutant.life * ((level / 10) + 0.9);
                if (level < 10) {
                    rawAtk1 = mutant.atk1 * ((level / 10) + 0.9);
                    rawAtk2 = mutant.atk2 * ((level / 10) + 0.9);
                } else if (level >= 10 && level < 15) {
                    rawAtk1 = mutant.atk1p * ((level / 10) + 0.9);
                    rawAtk2 = mutant.atk2 * ((level / 10) + 0.9);
                }
                if (level >= 15) {
                    rawAtk1 = mutant.atk1p * ((level / 10) + 0.9);
                    rawAtk2 = mutant.atk2p * ((level / 10) + 0.9);
                }
                if (level < 25) {
                    rawAbility = mutant.ability / 100 * mutant.atk1 * ((level / 10) + 0.9);
                    rawAbility2 = mutant.ability / 100 * mutant.atk2 * ((level / 10) + 0.9);
                } else {
                    rawAbility = mutant.abilityp / 100 * mutant.atk1p * ((level / 10) + 0.9);
                    rawAbility2 = mutant.abilityp / 100 * mutant.atk2p * ((level / 10) + 0.9);
                }
            }
        } else {
            if (selectedStarLevel === null) {
                rawLife = mutant.life * ((level / 10) + 0.9);
                if (level < 10) {
                    rawAtk1 = mutant.atk1 * ((level / 10) + 0.9);
                    rawAtk2 = mutant.atk2 * ((level / 10) + 0.9);
                } else if (level >= 10 && level < 15) {
                    rawAtk1 = mutant.atk1p * ((level / 10) + 0.9);
                    rawAtk2 = mutant.atk2 * ((level / 10) + 0.9);
                }
                if (level >= 15) {
                    rawAtk1 = mutant.atk1p * ((level / 10) + 0.9);
                    rawAtk2 = mutant.atk2p * ((level / 10) + 0.9);
                }
                if (level < 25) {
                    rawAbility = mutant.ability / 100 * mutant.atk1 * ((level / 10) + 0.9);
                    rawAbility2 = mutant.ability / 100 * mutant.atk2 * ((level / 10) + 0.9);
                } else {
                    rawAbility = mutant.abilityp / 100 * mutant.atk1p * ((level / 10) + 0.9);
                    rawAbility2 = mutant.abilityp / 100 * mutant.atk2p * ((level / 10) + 0.9);
                }
            } else {
                rawLife = mutant.life * ((level / 10) + 0.9) * bonus;
                if (level < 10) {
                    rawAtk1 = mutant.atk1 * ((level / 10) + 0.9) * bonus;
                    rawAtk2 = mutant.atk2 * ((level / 10) + 0.9) * bonus;
                } else if (level >= 10 && level < 15) {
                    rawAtk1 = mutant.atk1p * ((level / 10) + 0.9) * bonus;
                    rawAtk2 = mutant.atk2 * ((level / 10) + 0.9) * bonus;
                }
                if (level >= 15) {
                    rawAtk1 = mutant.atk1p * ((level / 10) + 0.9) * bonus;
                    rawAtk2 = mutant.atk2p * ((level / 10) + 0.9) * bonus;
                }
                if (level < 25) {
                    rawAbility = mutant.ability / 100 * mutant.atk1 * ((level / 10) + 0.9) * bonus;
                    rawAbility2 = mutant.ability / 100 * mutant.atk2 * ((level / 10) + 0.9) * bonus;
                } else {
                    rawAbility = mutant.abilityp / 100 * mutant.atk1p * ((level / 10) + 0.9) * bonus;
                    rawAbility2 = mutant.abilityp / 100 * mutant.atk2p * ((level / 10) + 0.9) * bonus;
                }
            }
        }

        let coinsGenerated = 42;

        const coinMap = {
            " Randonymous": 43,
            "Supermassive Infinity": 45,
            " True Hero Reed": 50,
            "Emotional Maskerade": 84,
            " The Screencaster": 84,
            " Bounty Hunter": 105,
            " Midas": 105,
            " Banker": 210,
            " Big Bo$$": 300,
            " Zagam, Great King of Greed": 340
        };

        if (coinMap[mutant.name]) {
            coinsGenerated = coinMap[mutant.name];
        }

        coinsGenerated *= level;

        rawLife = parseInt(rawLife);
        rawAtk1 = parseInt(rawAtk1);
        rawAtk2 = parseInt(rawAtk2);
        rawAbility = parseInt(rawAbility);
        rawAbility2 = parseInt(rawAbility2);

        // Calcula stats con orbes
        statsWithOrbs = getStatsWithOrbs(statsBase, level, bonus, selectedOrbs);
        const specialAbility = getSpecialAbility(selectedOrbs);

        // Genera el HTML de los menús
        const basicMenuHTML = createMenuHTML(orbData.basic);
        const specialMenuHTML = createMenuHTML(getSpecialOrbMenu(mutant));

        // Determinar la cantidad de slots por tipo o id
        let basicSlots = 3, specialSlots = 1; // 👈 Deshabilitado (ponlo en 1 para habilitarlo de nuevo)
        if (["LEGEND", "CAPTAINPEACE", "SEASONAL", "VIDEOGAME", "ZODIAC", "PVP", "GACHA", "RECIPE"].includes(mutant.type)) {
            basicSlots = 2; specialSlots = 1; // 👈 Deshabilitado (ponlo en 1 para habilitarlo de nuevo)
        } else if (mutant.type === "HEROIC") {
            basicSlots = 3; specialSlots = 1; // 👈 Deshabilitado (ponlo en 1 para habilitarlo de nuevo)
        } else if (oneBasicOneSpecialIds.includes(mutant.id)) {
            basicSlots = 1; specialSlots = 1; // 👈 Deshabilitado (ponlo en 1 para habilitarlo de nuevo)
        } else if (oneBasicOnlyIds.includes(mutant.id)) {
            basicSlots = 1; specialSlots = 0; // Este ya estaba sin especial
        }

        selectedOrbs.length = basicSlots + specialSlots;
        for (let i = 0; i < selectedOrbs.length; i++) {
            if (typeof selectedOrbs[i] === 'undefined') selectedOrbs[i] = null;
        }

        // Genera los slots dinamicamente
        let slotsHTML = '';
        for (let i = 0; i < basicSlots; i++) {
            slotsHTML += `
                <div class="slot-item" data-slot-type="normal">
                    <div class="orb-slot-bg">
                        <img src="https://s-ak.kobojo.com/mutants/assets/orb/orb_slot.png" class="slot-bg" draggable="false">
                        <img src="" class="slot-orb" style="display:none;" draggable="false">
                    </div>
                    <div class="dropdown-menu">${basicMenuHTML}</div>
                </div>
            `;
        }
        if (specialSlots) {
            slotsHTML += `
                <div class="slot-item" data-slot-type="special">
                    <div class="orb-slot-bg">
                        <img src="https://s-ak.kobojo.com/mutants/assets/orb/orb_slot_spe.png" class="slot-bg" draggable="false">
                        <img src="" class="slot-orb" style="display:none;" draggable="false">
                    </div>
                    <div class="dropdown-menu">${specialMenuHTML}</div>
                </div>
            `;
        }

        // Encuentra el índice real del slot especial (por si son menos de 4 slots)
        const specialSlotIndex = (() => {
            // Busca todos los .slot-item y encuentra el índice del que tiene data-slot-type="special"
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = slotsHTML;
            const slotItems = tempDiv.querySelectorAll('.slot-item');
            for (let i = 0; i < slotItems.length; i++) {
                if (slotItems[i].dataset.slotType === "special") return i;
            }
            return -1; // no hay especial
        })();

        const specialSlot = selectedOrbs[specialSlotIndex];
        let showNewAbilityDiv = false;
        let newAbilityName = "";
        let newAbilityValue = 0;

        if (specialSlot && specialSlot.name && !specialSlot.name.startsWith("Speed")
        ) {
            newAbilityName = specialSlot.name.split(" ")[0];
            if (mutant.nameAbility !== newAbilityName) {
                // Es una habilidad NUEVA, no natural
                showNewAbilityDiv = true;
                const orbPorc = specialSlot.porc;
                const atkBase = statsBase.atk1p * ((level / 10) + 0.9) * bonus;
                newAbilityValue = Math.floor((orbPorc / 100) * atkBase);
            }
        }

        resultsContainer.innerHTML = `
            <div class="card p-3 shadow-lg mb-4">
                <div class="card-body text-center">
                    <img src="${mutant.image}" alt="${mutant.name}" class="mutant-image mb-3 shadow" id="mutantImage" style="width: 100px; height: 100px;">
                    <h2 class="card-title fw-bold mb-1">${mutant.name}</h2>
                    <p class="text-muted mb-2"><strong>Nivel:</strong> ${level} | <img src="${typeImage}" alt="Type" class="me-1" style="height: 20px;"></p>
                    <div class="slots-container mb-3 d-flex justify-content-center">
                        ${slotsHTML}
                    </div>
                    <hr class="my-3">

                    ${(() => {
                        const showOrbs = selectedOrbs.some(x => x !== null);
                        if (!showOrbs) {
                            return `
                            <div class="row align-items-center justify-content-center g-3">
                                <div class="col-6">
                                    <div class="stat-item p-2 rounded d-flex flex-column align-items-center">
                                        <img src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/common_files/icon_hp.png" alt="Vida" class="stat-icon" style="height: 30px;">
                                        <span class="fw-bold">${rawLife}</span>
                                    </div>
                                </div>
                                <div class="col-3">
                                    <div class="stat-item p-2 rounded d-flex flex-column align-items-center">
                                        ${gene1Images}
                                        <span class="fw-bold">${rawAtk1}</span>
                                    </div>
                                </div>
                                <div class="col-3">
                                    <div class="stat-item p-2 rounded d-flex flex-column align-items-center">
                                        ${gene2Images}
                                        <span class="fw-bold">${rawAtk2}</span>
                                    </div>
                                </div>
                            </div>
                            `;
                        } else {
                            return `
                            <div class="row align-items-center justify-content-center g-3">
                                <div class="col-6">
                                    <div class="stat-item p-2 rounded d-flex flex-column align-items-center">
                                        <img src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/common_files/icon_hp.png" alt="Vida" class="stat-icon" style="height: 30px;">
                                        <span class="fw-bold">${statsWithOrbs.hp}</span>
                                    </div>
                                </div>
                                <div class="col-3">
                                    <div class="stat-item p-2 rounded d-flex flex-column align-items-center">
                                        ${gene1Images}
                                        <span class="fw-bold">${statsWithOrbs.atk1}</span>
                                    </div>
                                </div>
                                <div class="col-3">
                                    <div class="stat-item p-2 rounded d-flex flex-column align-items-center">
                                        ${gene2Images}
                                        <span class="fw-bold">${statsWithOrbs.atk2}</span>
                                    </div>
                                </div>
                            </div>
                            `;
                        }
                    })()}

                    <hr class="my-3">

                    <div class="row align-items-center justify-content-center g-3">
                        <!-- ATK1 -->
                        <div class="col-6">
                            <div class="stat-item p-2 mb-2 rounded d-flex flex-column align-items-center">
                                <img src="${getAbilityImage(mutant.nameAbility)}" alt="Habilidad" class="stat-icon" style="height: 35px;">
                                <span class="fw-bold">${habilidadFinal}</span>
                                <small class="text-muted d-block">(Atk 1)</small>
                            </div>
                            ${specialSlotIndex !== -1 &&
                            selectedOrbs[specialSlotIndex] &&
                            selectedOrbs[specialSlotIndex].porc &&
                            !selectedOrbs[specialSlotIndex].name.startsWith("Speed") ? `
                                <div class="stat-item p-2 rounded bg-light d-flex flex-column align-items-center">
                                    <img src="${getAbilityImage(selectedOrbs[specialSlotIndex].name.split(' ')[0])}" alt="Habilidad" class="stat-icon" style="height: 35px;">
                                    <span class="fw-bold">
                                        ${(() => {
                                            const abilityName = selectedOrbs[specialSlotIndex].name.split(" ")[0];
                                            let orbPorc = selectedOrbs[specialSlotIndex].porc;

                                            selectedOrbs.forEach((orb, idx) => {
                                                if (orb && idx !== specialSlotIndex) {
                                                    const orbType = orb.name.split(" ")[0];
                                                    if (orbType === abilityName) {
                                                        orbPorc += orb.porc;
                                                    }
                                                }
                                            });

                                            const atkFinal = statsWithOrbs.atk1;
                                            return Math.floor((orbPorc / 100) * atkFinal);
                                        })()}
                                    </span>
                                    <small class="text-muted d-block">(Atk 1)</small>
                                </div>
                            ` : ""}
                        </div>

                        <!-- ATK2 -->
                        <div class="col-6">
                            <!-- Natural SOLO si no es Retaliate -->
                            ${mutant.nameAbility !== "Retaliate" ? `
                            <div class="stat-item p-2 mb-2 rounded d-flex flex-column align-items-center">
                                <img src="${getAbilityImage(mutant.nameAbility)}" alt="Habilidad ATK2" class="stat-icon" style="height: 35px;">
                                <span class="fw-bold">${habilidadFinal2}</span>
                                <small class="text-muted d-block">(Atk 2)</small>
                            </div>
                            ` : ""}
                            <!-- Nueva SOLO si el orbe no es Retaliate -->
                            ${specialSlotIndex !== -1 &&
                            selectedOrbs[specialSlotIndex] &&
                            selectedOrbs[specialSlotIndex].porc &&
                            !selectedOrbs[specialSlotIndex].name.startsWith("Speed") &&
                            !selectedOrbs[specialSlotIndex].name.startsWith("Retaliate") ? `
                                <div class="stat-item p-2 rounded d-flex flex-column align-items-center">
                                    <img src="${getAbilityImage(selectedOrbs[specialSlotIndex].name.split(' ')[0])}" alt="Habilidad Orb ATK2" class="stat-icon" style="height: 35px;">
                                    <span class="fw-bold">
                                        ${(() => {
                                            const abilityName = selectedOrbs[specialSlotIndex].name.split(" ")[0];
                                            let orbPorc = selectedOrbs[specialSlotIndex].porc;

                                            selectedOrbs.forEach((orb, idx) => {
                                                if (orb && idx !== specialSlotIndex) {
                                                    const orbType = orb.name.split(" ")[0];
                                                    if (orbType === abilityName) {
                                                        orbPorc += orb.porc;
                                                    }
                                                }
                                            });

                                            const atkFinal2 = statsWithOrbs.atk2;
                                            return Math.floor((orbPorc / 100) * atkFinal2);
                                        })()}
                                    </span>
                                    <small class="text-muted d-block">(Atk 2)</small>
                                </div>
                            ` : ""}
                        </div>
                    </div>

                    <hr class="my-3">

                    <div class="row align-items-center justify-content-center g-3 mt-3">
                        <div class="col-6">
                            <div class="stat-item p-2 rounded d-flex flex-column align-items-center">
                                <img src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/common_files/icon_speed.png" alt="Velocidad" class="stat-icon" style="height: 30px;">
                                <span class="fw-bold">${statsWithOrbs.speed}</span>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="stat-item p-2 rounded d-flex flex-column align-items-center">
                                <img src="https://s-ak.kobojo.com/mutants/assets/thumbnails/softcurrency.png" alt="Créditos" class="stat-icon" style="height: 30px;">
                                <span class="fw-bold">${coinsGenerated}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        resultsContainer.style.display = "block";

        const mutantImage = document.getElementById("mutantImage");
        updateMutantImage(selectedStarLevel, mutantImage, mutant);

        const slotItems = resultsContainer.querySelectorAll('.slot-item');
        selectedOrbs.forEach((orbObj, idx) => {
            if (!orbObj) return;
            const orbImgElem = slotItems[idx].querySelector('.slot-orb');
            orbImgElem.src = orbObj.img;
            orbImgElem.alt = orbObj.name;
            orbImgElem.style.display = 'block';
        });

        resultsContainer.prepend(starLevelContainer);
        starLevelContainer.style.display = "block";
    }

    function getAbilityImage(abilityName) {
        const abilityImages = {
            "Boost": "https://s-ak.kobojo.com/mutants/assets/mobile/hud/icons/ability_strengthen.png",
            "Retaliate": "https://s-ak.kobojo.com/mutants/assets/mobile/hud/icons/ability_retaliate.png",
            "Weaken": "https://s-ak.kobojo.com/mutants/assets/mobile/hud/icons/ability_weaken.png",
            "Slash": "https://s-ak.kobojo.com/mutants/assets/mobile/hud/icons/ability_slash.png",
            "Regen": "https://s-ak.kobojo.com/mutants/assets/mobile/hud/icons/ability_regenerate.png",
            "Shield": "https://s-ak.kobojo.com/mutants/assets/mobile/hud/icons/ability_shield.png",
            "Curse": "https://s-ak.kobojo.com/mutants/assets/mobile/hud/icons/ability_weaken.png",
            "Drain": "https://s-ak.kobojo.com/mutants/assets/mobile/hud/icons/ability_regenerate.png",
            "Strengthen": "https://s-ak.kobojo.com/mutants/assets/mobile/hud/icons/ability_strengthen.png"
        };
        return abilityImages[abilityName] || "images/default_ability.png";
    }

    function updateMutantImage(starLevel, mutantImage, mutant) {
        if (mutant) {
            const baseImageUrl = mutant.image;

            if (mutant.id === "AF_06" && starLevel === "Gold") {
                mutantImage.src = "https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_af_06_anniversary.png";
                return;
            }
            if (mutant.id === "DE_06" && starLevel === "Easter") {
                mutantImage.src = "https://user-images.githubusercontent.com/24848110/33519396-7e56363c-d79d-11e7-969b-09782f5ccbab.png";
                return;
            }

            if (starLevel === "Bronze") {
                mutantImage.src = baseImageUrl.replace(".png", "_bronze.png");
            } else if (starLevel === "Silver") {
                mutantImage.src = baseImageUrl.replace(".png", "_silver.png");
            } else if (starLevel === "Gold") {
                mutantImage.src = baseImageUrl.replace(".png", "_gold.png");
            } else if (starLevel === "Platinum") {
                mutantImage.src = baseImageUrl.replace(".png", "_platinum.png");
            } else if (starLevel === "Spring") {
                mutantImage.src = baseImageUrl.replace(".png", "_spring.png");
            } else if (starLevel === "Autumn") {
                mutantImage.src = baseImageUrl.replace(".png", "_autumn.png");
            } else if (starLevel === "Winter") {
                mutantImage.src = baseImageUrl.replace(".png", "_winter.png");
            } else if (starLevel === "Winter Bug") {
                mutantImage.src = baseImageUrl.replace(".png", "_winter.png");
            } else if (starLevel === "Summer") {
                mutantImage.src = baseImageUrl.replace(".png", "_summer.png");
            } else {
                mutantImage.src = baseImageUrl;
            }
        }
    }

    resultsContainer.addEventListener('click', (event) => {
        // Abrir submenú
        const mainMenuItem = event.target.closest('.main-menu-item');
        if (mainMenuItem) {
            // Encuentra el dropdownMenu actual
            const dropdownMenu = mainMenuItem.closest('.dropdown-menu');
            // Oculta los submenús SOLO en este dropdown
            dropdownMenu.querySelectorAll('.submenu').forEach(sm => sm.classList.add('hidden'));
            // Muestra el submenú correspondiente
            const menuType = mainMenuItem.getAttribute('data-menu');
            const submenu = dropdownMenu.querySelector(`.submenu[data-parent-menu="${menuType}"]`);
            if (submenu) submenu.classList.remove('hidden');
            // Oculta el menú principal SOLO en este dropdown
            mainMenuItem.closest('.main-menu').classList.add('hidden');
            event.stopPropagation();
            return;
        }

        // Botón volver
        const backButton = event.target.closest('.back-button');
        if (backButton) {
            const submenu = backButton.closest('.submenu');
            submenu.classList.add('hidden');
            const dropdownMenu = backButton.closest('.dropdown-menu');
            const mainMenu = dropdownMenu.querySelector('.main-menu');
            if (mainMenu) mainMenu.classList.remove('hidden');
            event.stopPropagation();
            return;
        }

        // Selección submenú
        const submenuItem = event.target.closest('.submenu-item');
        if (submenuItem) {
            const openDropdown = document.querySelector('.dropdown-menu.visible');
            if (openDropdown) {
                const slotItem = openDropdown.closest('.slot-item');
                if (slotItem) {
                    // ESTA LÍNEA DEBE SER ASÍ:
                    setSlotOrb(
                        slotItem,
                        submenuItem.dataset.orbImg,
                        submenuItem.dataset.orbName,
                        parseInt(submenuItem.dataset.orbPorc) // <-- ESTO ES CRUCIAL
                    );
                }
                openDropdown.classList.remove('visible');
            }
            // Oculta los submenús y el menú principal SOLO en el dropdown abierto
            if (openDropdown) {
                openDropdown.querySelectorAll('.submenu').forEach(sm => sm.classList.add('hidden'));
                openDropdown.querySelectorAll('.main-menu').forEach(mm => mm.classList.add('hidden'));
            }
            displayResults(selectedMutant, parseInt(levelInput.value));
            event.stopPropagation();
            return;
        }
    });
    
    // Listener para cerrar todos los menús si se hace clic fuera
    document.addEventListener('click', (event) => {
        const clickedElement = event.target;
        
        // Si se hace clic en un icono de slot, muestra el menú principal
        if (clickedElement.closest('.orb-slot-bg')) {
            const slotItem = clickedElement.closest('.slot-item');
            const dropdownMenu = slotItem.querySelector('.dropdown-menu');
            // Oculta otros menús
            document.querySelectorAll('.dropdown-menu.visible').forEach(menu => menu.classList.remove('visible'));
            // Muestra el menú actual
            dropdownMenu.classList.add('visible');
            event.stopPropagation();
            return;
        }

        // Si se hace clic en una opción principal
        if (clickedElement.closest('.dropdown-option')) {
            const dropdownOption = clickedElement.closest('.dropdown-option');
            const submenu = dropdownOption.querySelector('.submenu');

            // Si la opción tiene un submenú, lo muestra
            if (submenu) {
                dropdownOption.closest('.dropdown-menu').classList.add('submenu-visible');
                dropdownOption.classList.add('is-open');
            } else {
                // Si no tiene submenú, asume que es una selección final y cierra el menú
                const slotItem = dropdownOption.closest('.slot-item');
                const targetSlotImg = slotItem.querySelector('.slot-icon');
                const orbImgSrc = dropdownOption.querySelector('.orb-icon').src;
                if (targetSlotImg && orbImgSrc) {
                    targetSlotImg.src = orbImgSrc;
                }
                
                // Cierra el menú y restablece las clases
                const dropdownMenu = dropdownOption.closest('.dropdown-menu');
                dropdownMenu.classList.remove('visible');
                dropdownMenu.classList.remove('submenu-visible');
                dropdownMenu.querySelectorAll('.dropdown-option').forEach(opt => opt.classList.remove('is-open'));
            }
        }

        // Si se hace clic en el botón "Volver"
        if (clickedElement.closest('.back-button')) {
            const backButton = clickedElement.closest('.back-button');
            const dropdownMenu = backButton.closest('.dropdown-menu');

            // Regresa al menú principal
            dropdownMenu.classList.remove('submenu-visible');
            dropdownMenu.querySelectorAll('.dropdown-option').forEach(opt => opt.classList.remove('is-open'));
        }

        // Cierra el menú si se hace clic fuera del contenedor
        const isClickInside = event.target.closest('.slots-container');
        if (!isClickInside) {
            document.querySelectorAll('.dropdown-menu.visible').forEach(menu => {
                menu.classList.remove('visible');
                menu.classList.remove('submenu-visible');
                menu.querySelectorAll('.dropdown-option').forEach(opt => opt.classList.remove('is-open'));
            });
        }
    });

    function getSpecialOrbMenu(mutant) {
        // Mapeo de habilidades a nombres de orbe especial
        const abilityToOrb = {
            "Shield": "Shield",
            "Boost": "Boost",
            "Regeneration": "Drain",
            "Retaliate": "Retaliate",
            "Wound": "Wound",
            "Weaken": "Curse",
            "Boost": "Strengthen"
        };

        // Si el mutante tiene una habilidad que coincide con uno de los orbes especiales
        // oculta ese orbe en el menú especial
        const excludeOrb = abilityToOrb[mutant.nameAbility];
        return orbData.special.filter(orb => orb.name !== excludeOrb);
    }
    
    function setSlotOrb(slotItem, orbImg, orbName, orbPorc) {
        const orbImgElem = slotItem.querySelector('.slot-orb');
        orbImgElem.src = orbImg;
        orbImgElem.alt = orbName;
        orbImgElem.style.display = 'block';

        // Guarda el objeto orbe
        const slotItems = resultsContainer.querySelectorAll('.slot-item');
        const slotIndex = Array.from(slotItems).indexOf(slotItem);
        selectedOrbs[slotIndex] = { name: orbName, porc: orbPorc, img: orbImg };
    }

    function clearSlotOrb(slotItem) {
        const orbImgElem = slotItem.querySelector('.slot-orb');
        orbImgElem.src = '';
        orbImgElem.alt = '';
        orbImgElem.style.display = 'none';

        // Limpia el slot en el array
        const slotItems = resultsContainer.querySelectorAll('.slot-item');
        const slotIndex = Array.from(slotItems).indexOf(slotItem);
        selectedOrbs[slotIndex] = null;
    }

    // Event listener para slots con menú "Remove" integrado
    document.addEventListener('click', (event) => {
        const clickedSlot = event.target.closest('.orb-slot-bg');
        if (clickedSlot) {
            const slotItem = clickedSlot.closest('.slot-item');
            const dropdownMenu = slotItem.querySelector('.dropdown-menu');
            const isSpecial = slotItem.dataset.slotType === 'special';

            // Construir menú principal
            dropdownMenu.innerHTML = isSpecial
            ? createMenuHTML(getSpecialOrbMenu(selectedMutant))
            : createMenuHTML(orbData.basic);

            // Oculta todos los submenús en ESTE dropdown
            dropdownMenu.querySelectorAll('.submenu').forEach(sm => sm.classList.add('hidden'));
            const mainMenu = dropdownMenu.querySelector('.main-menu');
            if (mainMenu) mainMenu.classList.remove('hidden');

            // Si el slot tiene orbe, añade REMOVE solo en el menú principal
            const orbImgElem = slotItem.querySelector('.slot-orb');
            const hasOrb = orbImgElem && orbImgElem.style.display !== 'none' && orbImgElem.src;

            if (hasOrb && orbImgElem.src && !orbImgElem.src.endsWith('orb_slot.png') && !orbImgElem.src.endsWith('orb_slot_spe.png')) {
                const removeDiv = document.createElement('div');
                removeDiv.className = 'menu-item remove-orb-item';
                removeDiv.innerHTML = '<img src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/contextual_ui/cancel.png" style="width:26px; margin-right:10px;"> <span class="menu-text">Remove</span>';
                removeDiv.onclick = function(e) {
                    clearSlotOrb(slotItem);
                    dropdownMenu.classList.remove('visible');
                    displayResults(selectedMutant, parseInt(levelInput.value)); // <-- refresca los stats
                    e.stopPropagation();
                };
                // SOLO prepend en el menú principal
                dropdownMenu.querySelector('.main-menu').prepend(removeDiv);
            }

            // Oculta los demás menús
            document.querySelectorAll('.dropdown-menu.visible').forEach(menu => menu.classList.remove('visible'));
            dropdownMenu.classList.add('visible');

            event.stopPropagation();
            return;
        }
        // Cierra menús si clic fuera
        const isClickInside = event.target.closest('.slots-container');
        if (!isClickInside) {
            document.querySelectorAll('.dropdown-menu.visible').forEach(menu => {
                menu.classList.remove('visible');
            });
        }
    });

    // Cuando seleccionas un orbe (submenú)
    document.addEventListener('click', (event) => {
        const submenuItem = event.target.closest('.submenu-item');
        if (submenuItem) {
            const openDropdown = document.querySelector('.dropdown-menu.visible');
            if (openDropdown) {
                const slotItem = openDropdown.closest('.slot-item');
                if (slotItem) {
                    setSlotOrb(slotItem, submenuItem.dataset.orbImg, submenuItem.dataset.orbName, parseInt(submenuItem.dataset.orbPorc));
                }
                openDropdown.classList.remove('visible');
            }
            document.querySelectorAll('.submenu').forEach(sm => sm.classList.add('hidden'));
            document.querySelectorAll('.main-menu').forEach(mm => mm.classList.add('hidden'));
            event.stopPropagation();
            return;
        }
        // Navegación del menú/submenú/volver igual que antes
        const mainMenuItem = event.target.closest('.main-menu-item');
        if (mainMenuItem) {
            const menuType = mainMenuItem.getAttribute('data-menu');
            document.querySelectorAll('.submenu').forEach(sm => sm.classList.add('hidden'));
            const submenu = document.querySelector(`.submenu[data-parent-menu="${menuType}"]`);
            if (submenu) submenu.classList.remove('hidden');
            mainMenuItem.closest('.main-menu').classList.add('hidden');
            event.stopPropagation();
            return;
        }
        const backButton = event.target.closest('.back-button');
        if (backButton) {
            const submenu = backButton.closest('.submenu');
            submenu.classList.add('hidden');
            const mainMenu = submenu.parentNode.querySelector('.main-menu');
            if (mainMenu) mainMenu.classList.remove('hidden');
            event.stopPropagation();
            return;
        }
    });

    function getStatsWithOrbs(statsBase, level, starBonus, selectedOrbs) {
        const baseFactor = ((level / 10) + 0.9) * starBonus;

        let hpBonus = 0;
        let atkBonus = 0;
        let speedBonus = 0;

        selectedOrbs.forEach((orb) => {
            if (!orb || !orb.porc) return;
            const statType = orb.name.split(" ")[0];
            if (statType === "HP") hpBonus += orb.porc;
            else if (statType === "Attack") atkBonus += orb.porc;
            else if (statType === "Speed") speedBonus += orb.porc;
        });

        const hpMultiplier = 1 + hpBonus / 100;
        const atkMultiplier = 1 + atkBonus / 100;

        // Selección condicional de estadísticas base según nivel
        let atk1Raw, atk2Raw;
        if (level < 10) {
            atk1Raw = statsBase.atk1;
            atk2Raw = statsBase.atk2;
        } else if (level < 15) {
            atk1Raw = statsBase.atk1p;
            atk2Raw = statsBase.atk2;
        } else {
            atk1Raw = statsBase.atk1p;
            atk2Raw = statsBase.atk2p;
        }

        const hp = Math.floor(statsBase.life * baseFactor * hpMultiplier);
        const atk1 = Math.floor(atk1Raw * baseFactor * atkMultiplier);
        const atk2 = Math.floor(atk2Raw * baseFactor * atkMultiplier);

        let speed;

        if (statsBase.speed === 110 && speedBonus === 10) {
            const baseSpeed = statsBase.speed / (1 + speedBonus / 100);
            const entero = Math.floor(baseSpeed);
            const speedSemi = 1000 / entero;
            speed = Math.floor(speedSemi);
        }
        else {
            const baseSpeed = statsBase.speed / (1 + speedBonus / 100);
            const entero = Math.floor(baseSpeed);
            const speedSemi = 1000 / entero;
            speed = Math.round(speedSemi * 100) / 100; // 2 decimales
        }

        return { hp, atk1, atk2, speed };
    }


    function getSpecialAbility(selectedOrbs) {
        const orb = selectedOrbs[3];
        if (!orb) return null;
            // Extrae el nombre base, por ejemplo "Boost (+10%)" -> "Boost"
            return orb.name.split(' ')[0];
        }
    });
