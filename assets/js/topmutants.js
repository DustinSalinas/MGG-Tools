document.addEventListener("DOMContentLoaded", () => {
    const topMutantsByGene = {
        'A': {
            name: 'Cyber',
            ids: ['Specimen_AF_14', 'Specimen_AF_06', 'Specimen_A_13', 'Specimen_AA_12', 'Specimen_AC_11', 'Specimen_AD_12', 'Specimen_AA_11', 'Specimen_AE_11', 'Specimen_AB_13', 'Specimen_AF_13']
        },
        'B': {
            name: 'Necro',
            ids: ['Specimen_B_13', 'Specimen_BB_13', 'Specimen_B_05', 'Specimen_BC_11', 'Specimen_BD_07', 'Specimen_B_12', 'Specimen_BA_10', 'Specimen_BC_13', 'Specimen_BD_12', 'Specimen_BB_10']
        },
        'C': {
            name: 'Saber',
            ids: ['Specimen_CA_14', 'Specimen_CB_14', 'Specimen_CF_13', 'Specimen_C_13', 'Specimen_CC_13', 'Specimen_CF_12', 'Specimen_CE_13', 'Specimen_CC_12', 'Specimen_CC_03', 'Specimen_CC_09']
        },
        'D': {
            name: 'Zoomorph',
            ids: ['Specimen_DD_13', 'Specimen_DD_11', 'Specimen_DB_13', 'Specimen_DD_08', 'Specimen_DA_12', 'Specimen_DA_11', 'Specimen_DE_12', 'Specimen_DA_13', 'Specimen_DC_13', 'Specimen_DD_14']
        },
        'E': {
            name: 'Galactic',
            ids: ['Specimen_EA_13', 'Specimen_EE_11', 'Specimen_EC_06', 'Specimen_EF_11', 'Specimen_EB_12', 'Specimen_EE_13', 'Specimen_EE_10', 'Specimen_ED_12', 'Specimen_E_13', 'Specimen_EC_12']
        },
        'F': {
            name: 'Mythic',
            ids: ['Specimen_FF_12', 'Specimen_FB_11', 'Specimen_FF_11', 'Specimen_FB_12', 'Specimen_FF_05', 'Specimen_FA_12', 'Specimen_FA_11', 'Specimen_FA_10', 'Specimen_FB_13', 'Specimen_FC_99']
        }
    };

    const orbData = {
        basic: [
            { name: "Attack", level: "Lvl 6", porc: 17, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_attack_06.png" },
            { name: "HP", level: "Lvl 6", porc: 30, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_life_06.png" },
            { name: "Shield", level: "Lvl 6", porc: 25, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_shield_06.png" },
            { name: "Drain", level: "Lvl 6", porc: 30, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_regenerate_06.png" },
            { name: "Retaliate", level: "Lvl 6", porc: 20, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_retaliate_06.png" },
            { name: "Wound", level: "Lvl 6", porc: 25, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_slash_06.png" },
            { name: "Boost", level: "Lvl 6", porc: 25, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_strengthen_06.png" },
            { name: "Curse", level: "Lvl 6", porc: 25, img: "https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_basic_weaken_06.png" }
        ],
        special: [
            { name: 'Speed', level: 'Lvl 4', porc: 18, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_speed_04.png' },
            { name: 'Shield', level: 'Lvl 4', porc: 20, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addshield_03.png' },
            { name: 'Drain', level: 'Lvl 4', porc: 22, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addregenerate_03.png' },
            { name: 'Retaliate', level: 'Lvl 4', porc: 13, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addretaliate_03.png' },
            { name: 'Wound', level: 'Lvl 4', porc: 20, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addslash_03.png' },
            { name: 'Boost', level: 'Lvl 4', porc: 20, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addstrengthen_03.png' },
            { name: 'Curse', level: 'Lvl 4', porc: 20, img: 'https://s-ak.kobojo.com/mutants/assets/thumbnails/orb_special_addweaken_03.png' }
        ]
    };

    let allMutantsData = {};
    const tableContainer = document.getElementById('mutant-table-container');

    // Funciones auxiliares para encontrar orbes
    const findBasicOrb = (name) => orbData.basic.find(o => o.name === name);
    const findSpecialOrb = (name) => orbData.special.find(o => o.name === name) || orbData.special.find(o => o.name === 'Speed');

    // ------------------------------------
    // --- FUNCIONES AUXILIARES (IMAGEN Y TIPO) ---
    // ------------------------------------

    function getMutantImage(mutant) {
        const idLower = mutant.id.toLowerCase();
        if (mutant.key === 'Specimen_AF_06') {
            return `https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_af_06_anniversary.png`;
        }
        if (["HEROIC", "LEGEND", "PVP", "RECIPE", "BINGO"].includes(mutant.type)) {
            return `https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_${idLower}_platinum.png`;
        }
        if (["GACHA", "CAPTAINPEACE", "SEASONAL", "VIDEOGAME", "COMMUNITY"].includes(mutant.type)) {
            return `https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_${idLower}.png`;
        }
        if (mutant.type === "ZODIAC") {
            return `https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_${idLower}_silver.png`;
        }
        return `https://s-ak.kobojo.com/mutants/assets/thumbnails/specimen_${idLower}.png`;
    }

    function getTypeImage(mutant) {
        let typeImage = "";
        switch(mutant.type) {
            case "LEGEND":
                typeImage = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_legend.png"; break;
            case "HEROIC":
                typeImage = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_heroic.png"; break;
            case "SEASONAL":
                typeImage = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_seasonal.png"; break;
            case "CAPTAINPEACE":
                typeImage = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_captainpeace.png"; break;
            case "RECIPE":
                typeImage = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_recipe.png"; break;
            case "VIDEOGAME":
                typeImage = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_videogame.png"; break;
            case "ZODIAC":
                typeImage = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_zodiac.png"; break;
            case "GACHA":
                typeImage = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_gacha.png"; break;
            case "PVP":
                typeImage = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_pvp.png"; break;
            case "BINGO":
                typeImage = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/main/picto_mutodesk.png"; break;
            case "COMMUNITY":
                typeImage = "https://s-ak.kobojo.com/mutants/assets/mobile/hud/m_m_m/icon_community.png"; break;
            default:
                typeImage = ""; break;
        }
        return `<img src="${typeImage}" width="40" alt="${mutant.type}">`;
    }
    
    // ------------------------------------
    // --- LÓGICA DE ORBES Y CÁLCULOS ---
    // ------------------------------------

    function getNonRedundantSpecialOrb(baseAbilityName, preferredOrbName = 'Speed') {
        // 1. Intenta encontrar el orbe preferido (por defecto Speed), SÓLO si es diferente a la base
        if (preferredOrbName !== baseAbilityName) {
            const preferredOrb = findSpecialOrb(preferredOrbName);
            if (preferredOrb) return preferredOrb;
        }

        // 2. Si hay redundancia o el orbe preferido no existe, intenta el Orbe por defecto (Speed)
        const speedOrb = findSpecialOrb('Speed');
        if (speedOrb && speedOrb.name !== baseAbilityName) {
            return speedOrb;
        }
        
        // 3. Como último recurso, busca cualquier orbe diferente a la habilidad base
        return orbData.special.find(o => o.name !== baseAbilityName) || speedOrb; 
    }

    function getOrbCombinations(mutant) {
    const stats = calcStats(mutant);
    const isHeroic = mutant.type === "HEROIC";
    const basicSlots = isHeroic ? 3 : 2;
    const baseAbilityName = mutant.baseAbility.trim();
    
    let combinations = [];

    if (isHeroic && stats.speed < 5 && stats.hp > 5000) {
        if (baseAbilityName === 'Shield') {
            combinations.push({
                name: "Vida x2 + Forta x2",
                basic: [findBasicOrb('HP'), findBasicOrb('HP'), findBasicOrb('Boost')].slice(0, basicSlots),
                special: findSpecialOrb('Boost')
            });
            combinations.push({
                name: "Vida + Forta + Shield + Forta",
                basic: [findBasicOrb('HP'), findBasicOrb('Boost'), findBasicOrb('Shield')].slice(0, basicSlots),
                special: findSpecialOrb('Boost')
            });
            combinations.push({
                name: "Vida x2 + Shield + Forta",
                basic: [findBasicOrb('HP'), findBasicOrb('HP'), findBasicOrb('Shield')].slice(0, basicSlots),
                special: findSpecialOrb('Boost')
            });
        } else if (baseAbilityName === 'Retaliate') {
            combinations.push({
                name: "Vida x2 + Forta x2",
                basic: [findBasicOrb('HP'), findBasicOrb('HP'), findBasicOrb('Boost')].slice(0, basicSlots),
                special: findSpecialOrb('Boost')
            });
            combinations.push({
                name: "Vida + Forta + Retaliate + Forta",
                basic: [findBasicOrb('HP'), findBasicOrb('Boost'), findBasicOrb('Retaliate')].slice(0, basicSlots),
                special: findSpecialOrb('Boost')
            });
            combinations.push({
                name: "Vida x2 + Retaliate + Velocidad",
                basic: [findBasicOrb('HP'), findBasicOrb('HP'), findBasicOrb('Retaliate')].slice(0, basicSlots),
                special: findSpecialOrb('Speed')
            });
        } else if (baseAbilityName === 'Boost') {
            combinations.push({
                name: "Vida x2 + Forta + Velocidad",
                basic: [findBasicOrb('HP'), findBasicOrb('HP'), findBasicOrb('Boost')].slice(0, basicSlots),
                special: findSpecialOrb('Speed')
            });
            combinations.push({
                name: "Vida + Forta + Shield x2",
                basic: [findBasicOrb('HP'), findBasicOrb('Boost'), findBasicOrb('Shield')].slice(0, basicSlots),
                special: findSpecialOrb('Shield')
            });
            combinations.push({
                name: "Vida x2 + Vida + Velocidad",
                basic: [findBasicOrb('HP'), findBasicOrb('HP'), findBasicOrb('HP')].slice(0, basicSlots),
                special: findSpecialOrb('Speed')
            });
        } else {
            // resto de habilidades Heroic lentos
            combinations.push({
                name: "Vida x2 + Forta x2",
                basic: [findBasicOrb('HP'), findBasicOrb('HP'), findBasicOrb('Boost')].slice(0, basicSlots),
                special: findSpecialOrb('Boost')
            });
            combinations.push({
                name: "Vida x3 + Forta",
                basic: [findBasicOrb('HP'), findBasicOrb('HP'), findBasicOrb('HP')].slice(0, basicSlots),
                special: findSpecialOrb('Boost')
            });
            combinations.push({
                name: "Vida + Forta x2",
                basic: [findBasicOrb('HP'), findBasicOrb('Boost'), findBasicOrb('Boost')].slice(0, basicSlots),
                special: findSpecialOrb('Boost')
            });
        }

        return combinations;

    } else if (isHeroic && stats.speed > 5 && stats.hp > 5000) {
        if (baseAbilityName === 'Shield') {
            combinations.push({
                name: "Vida x2 + Forta x2",
                basic: [findBasicOrb('HP'), findBasicOrb('HP'), findBasicOrb('Boost')].slice(0, basicSlots),
                special: findSpecialOrb('Boost')
            });
            combinations.push({
                name: "Vida + Forta + Shield + Forta",
                basic: [findBasicOrb('HP'), findBasicOrb('Boost'), findBasicOrb('Shield')].slice(0, basicSlots),
                special: findSpecialOrb('Boost')
            });
            combinations.push({
                name: "Vida x2 + Shield + Forta",
                basic: [findBasicOrb('HP'), findBasicOrb('HP'), findBasicOrb('Shield')].slice(0, basicSlots),
                special: findSpecialOrb('Boost')
            });
        } else if (baseAbilityName === 'Retaliate') {
            combinations.push({
                name: "Vida x2 + Forta x2",
                basic: [findBasicOrb('HP'), findBasicOrb('HP'), findBasicOrb('Boost')].slice(0, basicSlots),
                special: findSpecialOrb('Boost')
            });
            combinations.push({
                name: "Vida + Forta + Retaliate + Forta",
                basic: [findBasicOrb('HP'), findBasicOrb('Boost'), findBasicOrb('Retaliate')].slice(0, basicSlots),
                special: findSpecialOrb('Boost')
            });
            combinations.push({
                name: "Vida x2 + Retaliate + Velocidad",
                basic: [findBasicOrb('HP'), findBasicOrb('HP'), findBasicOrb('Retaliate')].slice(0, basicSlots),
                special: findSpecialOrb('Speed')
            });
        } else if (baseAbilityName === 'Boost') {
            combinations.push({
                name: "Vida x2 + Forta + Velocidad",
                basic: [findBasicOrb('HP'), findBasicOrb('HP'), findBasicOrb('Boost')].slice(0, basicSlots),
                special: findSpecialOrb('Speed')
            });
            combinations.push({
                name: "Vida + Forta + Shield x2",
                basic: [findBasicOrb('HP'), findBasicOrb('Boost'), findBasicOrb('Shield')].slice(0, basicSlots),
                special: findSpecialOrb('Shield')
            });
            combinations.push({
                name: "Vida x2 + Vida + Velocidad",
                basic: [findBasicOrb('HP'), findBasicOrb('HP'), findBasicOrb('HP')].slice(0, basicSlots),
                special: findSpecialOrb('Speed')
            });
        } else {
            // resto de habilidades Heroic lentos
            combinations.push({
                name: "Vida x2 + Forta x2",
                basic: [findBasicOrb('HP'), findBasicOrb('HP'), findBasicOrb('Boost')].slice(0, basicSlots),
                special: findSpecialOrb('Boost')
            });
            combinations.push({
                name: "Vida x3 + Forta",
                basic: [findBasicOrb('HP'), findBasicOrb('HP'), findBasicOrb('HP')].slice(0, basicSlots),
                special: findSpecialOrb('Boost')
            });
            combinations.push({
                name: "Vida + Forta x2",
                basic: [findBasicOrb('HP'), findBasicOrb('Boost'), findBasicOrb('Boost')].slice(0, basicSlots),
                special: findSpecialOrb('Boost')
            });
        }

        return combinations; // TERMINA AQUÍ SI SE CUMPLE LA NUEVA CONDICIÓN
    }

    if (stats.speed > 5 && isHeroic) {
        const specialSpeed = getNonRedundantSpecialOrb(baseAbilityName, 'Speed');
        const attackOrb = findBasicOrb('Attack');
        const hpOrb = findBasicOrb('HP');
        const boostOrb = findBasicOrb('Boost');

        // 1. Full Attack (prioridad)
        combinations.push({
            name: "Velocidad Full Daño (Full Attack)",
            basic: [attackOrb, attackOrb, attackOrb].slice(0, basicSlots),
            special: specialSpeed
        });

        // 2. Attack + HP balanceado
        combinations.push({
            name: "Velocidad Equilibrada (HP/Attack)",
            basic: [attackOrb, attackOrb, hpOrb].slice(0, basicSlots),
            special: specialSpeed
        });

        // 3. Boost combinado
        combinations.push({
            name: "Velocidad/Daño (Boosted Attack)",
            basic: [hpOrb, boostOrb, boostOrb].slice(0, basicSlots),
            special: getNonRedundantSpecialOrb(baseAbilityName, 'Boost')
        });
    } else if (stats.speed > 5) {
        const specialSpeed = getNonRedundantSpecialOrb(baseAbilityName, 'Speed');
        
        combinations.push({
            name: "Velocidad Full Daño (Fast Attacker)",
            basic: [findBasicOrb('Attack'), findBasicOrb('Attack'), findBasicOrb('HP')].slice(0, basicSlots),
            special: specialSpeed
        });

        combinations.push({
            name: "Velocidad Equilibrada (Hybrid Fast)",
            basic: [findBasicOrb('Attack'), findBasicOrb('HP'), findBasicOrb('Attack')].slice(0, basicSlots),
            special: specialSpeed
        });
        
        const specialBoost = getNonRedundantSpecialOrb(baseAbilityName, 'Boost');
        const basicBoost = findBasicOrb('Boost');
        combinations.push({
            name: "Velocidad/Daño (Boosted Attack)",
            basic: [findBasicOrb('HP'), basicBoost, basicBoost].slice(0, basicSlots),
            special: specialBoost
        });
        
    } else if (stats.hp > 4000) {
        const specialBoost = getNonRedundantSpecialOrb(baseAbilityName, 'Boost');
        const specialShield = getNonRedundantSpecialOrb(baseAbilityName, 'Shield');
        const basicShield = findBasicOrb('Shield');
        const basicBoost = findBasicOrb('Boost');
        
        combinations.push({
            name: "Tanque Ofensivo (Boosted HP)",
            basic: [findBasicOrb('HP'), basicBoost, basicBoost].slice(0, basicSlots),
            special: specialBoost
        });

        combinations.push({
            name: "Doble Vida (Maximum HP)",
            basic: [findBasicOrb('HP'), findBasicOrb('HP'), basicBoost].slice(0, basicSlots),
            special: specialBoost
        });

        let combo3Basics = [findBasicOrb('HP'), basicShield, basicShield].slice(0, basicSlots);
        let combo3Name = "Tanque Defensivo (Shield)";
        let combo3Special = specialShield;

        if (baseAbilityName === 'Shield') {
            combo3Basics = [findBasicOrb('HP'), basicBoost, basicBoost].slice(0, basicSlots);
            combo3Name = "Tanque Defensivo (HP/Boost)";
            combo3Special = specialBoost;
        }

        combinations.push({
            name: combo3Name,
            basic: combo3Basics,
            special: combo3Special
        });
    
    } else {
        const baseOrb = findBasicOrb(baseAbilityName) || findBasicOrb('Attack');
        const defaultSpecialOrb = getNonRedundantSpecialOrb(baseAbilityName, baseAbilityName); 

        const combo1Basics = [];
        for (let i = 0; i < basicSlots; i++) {
            combo1Basics.push(baseOrb);
        }
        combinations.push({
            name: `Base Puro (${baseAbilityName})`,
            basic: combo1Basics,
            special: defaultSpecialOrb
        });

        const combo2Basics = [];
        if (basicSlots >= 1) combo2Basics.push(baseOrb);
        if (basicSlots >= 2) combo2Basics.push(findBasicOrb('HP'));
        if (basicSlots >= 3) combo2Basics.push(findBasicOrb('Attack'));
        combinations.push({
            name: `Híbrido HP/Ataque`,
            basic: combo2Basics,
            special: defaultSpecialOrb
        });

        let unlockedSpecialOrb = getNonRedundantSpecialOrb(baseAbilityName, 'Boost');
        let unlockedBasicOrb = findBasicOrb('Boost');
        
        const combo3Basics = [];
        combo3Basics.push(unlockedBasicOrb);
        if (basicSlots >= 2) combo3Basics.push(findBasicOrb('Attack')); 
        if (basicSlots >= 3) combo3Basics.push(findBasicOrb('HP'));

        combinations.push({
            name: `Ofensivo (Desbloquea Boost)`,
            basic: combo3Basics,
            special: unlockedSpecialOrb
        });
    }

    return combinations;
}


    function calcStats(mutant) {
        let atk1Calc, atk2Calc, lifeCalc, rawSpeed;
        const levelMultiplier = 3.4;
        let typeMultiplier = 1;

        let life = mutant.life;
        let atk1 = mutant.atk1;
        let atk2 = mutant.atk2;
        let speed = mutant.speed;

        if (mutant.key === 'Specimen_AF_06') {
            life = 2181;
            atk1 = 855;
            atk2 = 855;
            typeMultiplier = 1.75;
        } else if (["HEROIC", "LEGEND", "PVP", "RECIPE", "BINGO"].includes(mutant.type)) {
            typeMultiplier = 2;
        } else if (mutant.type === "ZODIAC") {
            typeMultiplier = 1.3;
        }

        atk1Calc = atk1 * levelMultiplier * typeMultiplier;
        atk2Calc = atk2 * levelMultiplier * typeMultiplier;
        lifeCalc = life * levelMultiplier * typeMultiplier;

        rawSpeed = (1000 / speed);
        const speedCalc = Number.isInteger(rawSpeed) ? parseInt(rawSpeed) : parseFloat(rawSpeed.toFixed(2));

        return {
            atk1: parseInt(atk1Calc),
            atk2: parseInt(atk2Calc),
            hp: parseInt(lifeCalc),
            speed: speedCalc
        };
    }


    function createOrbListHTML(orbs, isSpecial = false) {
        const slotImage = isSpecial 
            ? 'https://s-ak.kobojo.com/mutants/assets/orb/orb_slot_spe.png'
            : 'https://s-ak.kobojo.com/mutants/assets/orb/orb_slot.png';

        return orbs.map(orb => `
            <div class="col-auto text-center orb-display">
                <div class="orb-slot" style="background-image: url('${slotImage}')">
                    <img src="${orb.img}" alt="${orb.name}">
                </div>
                <div class="text-white small mt-1"><strong>${orb.name}</strong></div>
                </div>
        `).join('');
    }

    function showOrbModal(mutantId) {
        const mutant = allMutantsData[mutantId];
        if (!mutant) return;

        const stats = calcStats(mutant); 
        const combinations = getOrbCombinations(mutant);
        const isHeroic = mutant.type === "HEROIC";
        const basicSlots = isHeroic ? 3 : 2;

        let modalBodyContent = `
            <p class="text-warning small text-center mb-3">Las combinaciones se basan en la habilidad base y/o el perfil de stats (Fast/Tank).</p>
        `;

        combinations.forEach((combo, index) => {
            const basicOrbsHTML = createOrbListHTML(combo.basic, false); 
            const specialOrbHTML = createOrbListHTML([combo.special], true); 

            modalBodyContent += `
                <div class="card bg-secondary text-white mb-3 shadow-lg">
                    <div class="card-header bg-dark text-center">
                        <h5 class="mb-0 text-info">${index + 1}. ${combo.name}</h5>
                    </div>
                    <div class="card-body p-3">
                        
                        <div class="row justify-content-center align-items-center g-0"> <div class="col-auto d-flex align-items-center">
                                <div class="row g-1"> 
                                    ${basicOrbsHTML}
                                </div>
                            </div>
                            
                            <div class="col-auto d-flex flex-column align-items-center ms-1"> 
                                ${specialOrbHTML}
                            </div>

                        </div>
                        
                    </div>
                </div>
            `;
        });

        const modalHtml = `
            <div class="modal fade" id="orbModal" tabindex="-1" aria-labelledby="orbModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content bg-dark text-white">
                        <div class="modal-header bg-primary">
                            <h5 class="modal-title text-white" id="orbModalLabel">Combinaciones para ${mutant.name}</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            ${modalBodyContent}
                        </div>
                        </div>
                </div>
            </div>
        `;

        const existingModal = document.getElementById('orbModal');
        if (existingModal) existingModal.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const orbModal = new bootstrap.Modal(document.getElementById('orbModal'));
        orbModal.show();
    }
    
    function updateTable(geneKey) {
        const geneInfo = topMutantsByGene[geneKey];
        const geneIcon = `https://s-ak.kobojo.com/mutants/assets/mobile/hud/fight_ui/gene_${geneKey.toLowerCase()}.png`;

        tableContainer.innerHTML = `
            <div class="gene-section">
                <h2><img src="${geneIcon}" width="40" alt="${geneInfo.name}"> ${geneInfo.name}</h2>
                <div class="table-responsive">
                    <table class="table table-hover table-bordered text-center align-middle">
                        <thead class="table-dark">
                            <tr>
                                <th>Top</th> <th>Image</th>
                                <th>Name</th>
                                <th>Type</th>
                                <th>HP</th>
                                <th>Attack 1</th>
                                <th>Attack 2</th>
                                <th>Speed</th>
                                <th>Orbs</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        const tbody = tableContainer.querySelector('tbody');
        if (!tbody) return;

        geneInfo.ids.forEach((mutantId, index) => {
            const mutantData = allMutantsData[mutantId];
            if (mutantData) {
                const stats = calcStats(mutantData);
                const imageURL = getMutantImage(mutantData); 
                
                const rank = index + 1;
                
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td><strong>${rank}</strong></td> <td><img src="${imageURL}" width="50" class="rounded shadow-sm" alt="${mutantData.name}"></td>
                    <td><strong>${mutantData.name}</strong></td>
                    <td>${getTypeImage(mutantData)}</td>
                    <td><span class="badge bg-danger fs-6">${stats.hp}</span></td>
                    <td><span class="badge bg-primary fs-6">${stats.atk1}</span></td>
                    <td><span class="badge bg-primary fs-6">${stats.atk2}</span></td>
                    <td><span class="badge bg-warning text-dark fs-6">${stats.speed}</span></td>
                    <td><button class="btn btn-primary me-1 mb-1 btn-orb view-orbes" data-mutant-id="${mutantId}">
                        <img src="https://s-ak.kobojo.com/mutants/assets/mobile/hud/main/picto_mutodesk.png" width="18" alt="Orbe"> Ver Orbes
                    </button></td>
                `;
            }
        });
        
        tbody.querySelectorAll('.view-orbes').forEach(button => {
            button.addEventListener('click', (event) => {
                const mutantId = event.currentTarget.getAttribute('data-mutant-id');
                showOrbModal(mutantId);
            });
        });
    }

    function setupGeneButtons() {
        const buttons = document.querySelectorAll('#gene-selector button');
        const geneSelector = document.getElementById('gene-selector');

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                buttons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                if (!geneSelector.classList.contains('has-selection')) {
                    geneSelector.classList.add('has-selection');
                }

                const geneKey = button.getAttribute('data-gene');
                updateTable(geneKey);
            });
        });
    }

    fetch("https://raw.githubusercontent.com/DustinSalinas/stats25/main/sts25.csv")
        .then(response => response.text())
        .then(csvText => {
            Papa.parse(csvText, {
                delimiter: ";",
                skipEmptyLines: true,
                complete: (results) => {
                    allMutantsData = results.data.reduce((acc, row) => {
                        if (row.length < 18) return acc;
                        const key = row[0];
                        if (!key || row[1] === "No Name") return acc;
                        let nameAbilityRaw = row[15].includes('ability_') ? 
                            row[15].split('ability_')[1].split(';')[0].replace('_plus','').trim() : 
                            'attack';
                        
                        let baseAbility = nameAbilityRaw.charAt(0).toUpperCase() + nameAbilityRaw.slice(1);

                        if (baseAbility === 'Regenerate') baseAbility = 'Drain';
                        if (baseAbility === 'Slash') baseAbility = 'Wound';
                        if (baseAbility === 'Strengthen') baseAbility = 'Boost';
                        if (baseAbility === 'Weaken') baseAbility = 'Curse';
                        if (baseAbility === 'Retaliate') baseAbility = 'Retaliate';                        
                        if (!orbData.basic.some(orb => orb.name === baseAbility)) {
                            baseAbility = 'Attack'; 
                        }
                        
                        acc[key] = {
                            key: key,
                            id: key.replace('Specimen_', ''),
                            name: row[1],
                            speed: parseFloat(row[2]),
                            life: parseInt(row[5]),
                            atk1: parseInt(row[8]),
                            atk2: parseInt(row[10]),
                            type: row[13].trim(),
                            baseAbility: baseAbility 
                        };
                        return acc;
                    }, {});

                    tableContainer.innerHTML = `<p class="text-center text-muted mt-5">Selecciona un gen para ver el Top 10 de mutantes.</p>`;
                    setupGeneButtons();
                }
            });
        })
        .catch(err => console.error("❌ Error loading or processing CSV:", err));
});