let mutantsData = {};
const abilityIcons = {
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

// 🔧 Corregido: los BINGO usan otra ruta
function getTypeImage(mutant) {
    const typeIcons = {
        LEGEND: "m_m_m/icon_legend",
        HEROIC: "m_m_m/icon_heroic",
        SEASONAL: "m_m_m/icon_seasonal",
        CAPTAINPEACE: "m_m_m/icon_captainpeace",
        RECIPE: "m_m_m/icon_recipe",
        VIDEOGAME: "m_m_m/icon_videogame",
        ZODIAC: "m_m_m/icon_zodiac",
        GACHA: "m_m_m/icon_gacha",
        PVP: "m_m_m/icon_pvp",
        COMMUNITY: "m_m_m/icon_community",
        BINGO: "main/picto_mutodesk" // ✅ ruta diferente
    };
    const icon = typeIcons[mutant.type];
    return icon
        ? `<img src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/${icon}.png" width="40" alt="${mutant.type}">`
        : "";
}

function getMutantImage(mutant) {
    const idLower = mutant.id.toLowerCase();
    if (["HEROIC", "LEGEND", "PVP", "RECIPE", "BINGO"].includes(mutant.type))
        return `https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_${idLower}_platinum.png`;
    if (["GACHA", "CAPTAINPEACE", "SEASONAL", "VIDEOGAME", "COMMUNITY"].includes(mutant.type))
        return `https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_${idLower}.png`;
    if (mutant.type === "ZODIAC")
        return `https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_${idLower}_silver.png`;
    return `https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_${idLower}.png`;
}

function calcStats(mutant) {
    let mult = 1;
    if (["HEROIC", "LEGEND", "PVP", "RECIPE", "BINGO"].includes(mutant.type)) mult = 2;
    else if (mutant.type === "ZODIAC") mult = 1.3;

    const base = (25 / 10) + 0.9;
    const factor = base * mult;
    return {
        atk1: parseInt(mutant.atk1 * factor),
        atk2: parseInt(mutant.atk2 * factor),
        hp: parseInt(mutant.life * factor),
        speed: parseFloat((1000 / mutant.speed).toFixed(2))
    };
}

// 📦 Cargar CSV y generar tabla
fetch("https://raw.githubusercontent.com/DustinSalinas/stats25/main/sts25.csv")
    .then(response => response.text())
    .then(csvText => {
        Papa.parse(csvText, {
            delimiter: ";",
            skipEmptyLines: true,
            complete: (results) => {
                const dataAsObject = results.data.reduce((acc, row) => {
                    if (row.length < 18) return acc;
                    const key = row[0];
                    const name = row[1]?.trim();
                    if (!key || !name || name === "No Name") return acc; // 👈 filtro directo

                    const mutant = {
                        key,
                        id: key.replace('Specimen_', ''),
                        name,
                        speed: parseFloat(row[2]),
                        life: parseInt(row[5]),
                        atk1: parseInt(row[8]),
                        atk2: parseInt(row[10]),
                        nameAbility: row[15].includes('ability_')
                            ? row[15].split('ability_')[1].split(';')[0].replace('_plus', '').trim()
                            : 'Unknown',
                        ability: parseInt(row[16]),
                        abilityp: parseInt(row[17]),
                        type: row[13].trim()
                    };

                    mutant.nameAbility = mutant.nameAbility.charAt(0).toUpperCase() + mutant.nameAbility.slice(1);
                    mutant.image = getMutantImage(mutant);
                    mutant.stats = calcStats(mutant); // precalculado 💡

                    acc[key] = mutant;
                    return acc;
                }, {});
                mutantsData = dataAsObject;
                buildMutantsTable(Object.values(mutantsData));
            }
        });
    })
    .catch(err => console.error("❌ Error al cargar o procesar el CSV:", err));

function buildMutantsTable(mutantsArray) {
    const tableContainer = document.getElementById("tableContainer");
    tableContainer.innerHTML = "";

    const table = document.createElement("table");
    table.className = "table table-hover table-bordered text-center align-middle";

    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr class="table table-bordered">
            <th>Image</th>
            <th>Name</th>
            <th>Type</th>
            <th>Gen 1</th>
            <th>Gen 2</th>
            <th>Ability</th>
            <th data-sort="hp" style="cursor:pointer;">
                <img src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/common_files/icon_hp.png" width="30" alt="HP"> ⬍
            </th>
            <th data-sort="atk1" style="cursor:pointer;">Atk 1 ⬍</th>
            <th data-sort="atk2" style="cursor:pointer;">Atk 2 ⬍</th>
            <th data-sort="speed" style="cursor:pointer;">
                <img src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/common_files/icon_speed.png" width="30" alt="Speed"> ⬍
            </th>
        </tr>
    `;

    const tbody = document.createElement("tbody");
    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);

    let currentSort = { key: null, asc: true };

    function renderTable(data) {
        const fragment = document.createDocumentFragment();
        data.forEach(mutant => {
            const stats = mutant.stats;
            const gen1Image = `https://s-ak.kobojo.com/mutants/assets/mobile/hud/fight_ui/gene_${mutant.id[0].toLowerCase()}.png`;
            let gen2Image = `https://s-ak.kobojo.com/mutants/assets/mobile/hud/fight_ui/gene_${mutant.id[1]?.toLowerCase()}.png`;
            if (/^[A-F]_/.test(mutant.id)) {
                gen2Image = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/fight_ui/gene_all.png";
            }

            const row = document.createElement("tr");
            row.innerHTML = `
                <td><img src="${mutant.image}" alt="${mutant.name}" width="50" class="rounded shadow-sm"></td>
                <td><strong>${mutant.name}</strong></td>
                <td>${getTypeImage(mutant)}</td>
                <td><img src="${gen1Image}" width="35"></td>
                <td><img src="${gen2Image}" width="35"></td>
                <td><img src="${abilityIcons[mutant.nameAbility] || ''}" width="35" alt="${mutant.nameAbility}"></td>
                <td><span class="badge bg-danger fs-6">${stats.hp}</span></td>
                <td><span class="badge bg-primary fs-6">${stats.atk1}</span></td>
                <td><span class="badge bg-primary fs-6">${stats.atk2}</span></td>
                <td><span class="badge bg-warning text-dark fs-6">${stats.speed}</span></td>
            `;
            fragment.appendChild(row);
        });
        tbody.innerHTML = "";
        tbody.appendChild(fragment);
    }

    mutantsArray.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    renderTable(mutantsArray);

    thead.addEventListener("click", e => {
        const key = e.target.closest("th")?.dataset.sort;
        if (!key) return;
        currentSort.asc = currentSort.key === key ? !currentSort.asc : true;
        currentSort.key = key;

        mutantsArray.sort((a, b) => {
            const aVal = a.stats[key];
            const bVal = b.stats[key];
            return currentSort.asc ? aVal - bVal : bVal - aVal;
        });
        renderTable(mutantsArray);
    });
}