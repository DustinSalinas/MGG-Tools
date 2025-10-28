document.addEventListener("DOMContentLoaded", () => {

    // --- 1. Definiciones de Genes y Combate ---
    const geneNames = {
        'A': 'Cyber', 'B': 'Necro', 'C': 'Saber',
        'D': 'Zoomorph', 'E': 'Galactic', 'F': 'Mythic', 'N': 'Neutro'
    };
    const combatAdvantages = {
        'A': { 'A': 1.0, 'B': 0.75, 'C': 1.25, 'D': 1.5,  'E': 0.5,  'F': 1.0 },
        'B': { 'A': 1.25, 'B': 1.0,  'C': 0.75, 'D': 1.0,  'E': 1.5,  'F': 0.5 },
        'C': { 'A': 0.75, 'B': 1.25, 'C': 1.0,  'D': 0.5,  'E': 1.0,  'F': 1.5 },
        'D': { 'A': 0.5,  'B': 1.0,  'C': 1.5,  'D': 1.0,  'E': 0.75, 'F': 1.25 },
        'E': { 'A': 1.5,  'B': 0.5,  'C': 1.0,  'D': 1.25, 'E': 1.0,  'F': 0.75 },
        'F': { 'A': 1.0,  'B': 1.5,  'C': 0.5,  'D': 0.75, 'E': 1.25, 'F': 1.0 }
    };

    // --- 2. Variables Globales y Definiciones de IDs Especiales ---
    let mutantsData = {};
    let allMutantCardsAttacker = [];
    let allMutantCardsDefender = [];
    
    let isCalculatedOnce = false; 

    // IDs con ataques especiales (se mantienen igual)
    const customAttackGeneIds = {
        inverted: ["EC_13", "FD_12"],
        doubleNeutral: ["FF_05"],
        missy: ["CA_99"], 
        invertedSingle: ["D_13"], 
        doubleSame: ["C_14", "E_13", "A_14", "F_14"] 
    };

    // --- 3. Funciones de Utilidad ---
    
    function getGeneImageUrl(geneLetter) {
        if (geneLetter === 'N') {
            return 'https://s-ak.kobojo.com/mutants/assets/mobile/hud/fight_ui/gene_all.png';
        }
        const geneLetterLower = geneLetter.toLowerCase();
        return `https://s-ak.kobojo.com/mutants/assets/mobile/hud/fight_ui/gene_${geneLetterLower}.png`;
    }

    function getMutantAttackGenes(mutantId, genes) {
        const [atk1Letter, atk2Letter] = genes;
        let attackGenes = []; 

        if (customAttackGeneIds.doubleNeutral.includes(mutantId)) {
            attackGenes = ['N', 'N']; 
        } else if (customAttackGeneIds.inverted.includes(mutantId)) {
            attackGenes = [atk2Letter, atk1Letter]; 
        } else if (customAttackGeneIds.missy.includes(mutantId)) {
            attackGenes = [atk2Letter, 'E']; 
        } else if (customAttackGeneIds.invertedSingle.includes(mutantId)) {
            attackGenes = ['N', atk1Letter]; 
        } else if (customAttackGeneIds.doubleSame.includes(mutantId)) {
            attackGenes = [atk1Letter, atk1Letter]; 
        } else if (atk2Letter) {
            attackGenes = [atk1Letter, atk2Letter]; 
        } else {
            attackGenes = [atk1Letter, 'N']; 
        }
        return attackGenes;
    }

    function buildMutantImageUrl(key, mutantType) {
        const normalTypes = ["CAPTAINPEACE", "SEASONAL", "VIDEOGAME", "GACHA", "COMMUNITY"];
        if (normalTypes.includes(mutantType)) {
            return `https://s-ak.kobojo.com/mutants/assets/thumbnails/${key.toLowerCase()}.png`;
        }
        
        if (mutantType === "ZODIAC") {
            return `https://s-ak.kobojo.com/mutants/assets/thumbnails/${key.toLowerCase()}_silver.png`;
        }
        
        return `https://s-ak.kobojo.com/mutants/assets/thumbnails/${key.toLowerCase()}_platinum.png`;
    }

    function updateMutantImage(mutantName, imageDivId) {
        const mutant = findMutantByName(mutantName);
        const imageDiv = document.getElementById(imageDivId);
        
        if (!imageDiv) return;

        if (mutant && mutant.imageURL) {
            imageDiv.innerHTML = `<img src="${mutant.imageURL}" alt="${mutant.name}" class="selected-mutant-image">`;
            imageDiv.style.display = 'flex';
        } else {
            imageDiv.innerHTML = '';
            imageDiv.style.display = 'none';
        }
    }
    
    /** * Función de comparación para ordenar mutantes:
     * 1. Gen Principal (A antes de B)
     * 2. Número de genes (1 gen antes de 2 genes: A_01 antes de AA_01)
     * 3. Segundo Gen (si existe, AA antes de AB)
     * 4. Índice Numérico (01 antes de 02)
     */
    function sortMutants(mutantA, mutantB) {
        const [genePartA, indexA] = mutantA.id.split('_');
        const [genePartB, indexB] = mutantB.id.split('_');

        const gen1A = genePartA[0] || '';
        const gen2A = genePartA.length > 1 ? genePartA[1] : ''; 
        
        const gen1B = genePartB[0] || '';
        const gen2B = genePartB.length > 1 ? genePartB[1] : '';

        // 1. Comparación por Gen 1 (Letra Principal)
        if (gen1A < gen1B) return -1;
        if (gen1A > gen1B) return 1;

        // 2. Comparación por Número de Genes (1 gen vs 2 genes)
        if (genePartA.length < genePartB.length) return -1; // A_01 (length 1) antes de AA_01 (length 2)
        if (genePartA.length > genePartB.length) return 1;
        
        // 3. Comparación por Gen 2 (Solo si ambos tienen 2 genes)
        if (gen2A < gen2B) return -1;
        if (gen2A > gen2B) return 1;
        
        // 4. Comparación por Índice Numérico
        const numIndexA = parseInt(indexA, 10);
        const numIndexB = parseInt(indexB, 10);
        
        if (numIndexA < numIndexB) return -1;
        if (numIndexA > numIndexB) return 1;

        return 0;
    }


    // --- 4. Carga de Datos ---

    function fetchMutantData() {
        // Usar la ruta absoluta a tu CSV o un mock de datos si no está disponible en la web.
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
                            if (!key) return acc;

                            const mutantType = row[13] ? row[13].trim().toUpperCase() : ''; 
                            
                            const mutant = {
                                key: key,
                                id: key.replace('Specimen_', ''),
                                name: row[1].trim(), 
                                imageURL: buildMutantImageUrl(key, mutantType), 
                            };

                            const genePart = mutant.id.split('_')[0].toUpperCase();
                            let genes = [];
                            if (genePart.length === 1) {
                                genes.push(genePart);
                            } else if (genePart.length >= 2) {
                                genes.push(genePart[0]);
                                genes.push(genePart[1]);
                            }
                            mutant.genes = genes; 
                            mutant.attackGenes = getMutantAttackGenes(mutant.id, genes);
                            
                            acc[key] = mutant;
                            return acc;
                        }, {});

                        mutantsData = dataAsObject;
                        
                        buildMutantGrid(
                            document.getElementById('mutantsGridContainerAttacker'),
                            document.getElementById('mutantName'),
                            allMutantCardsAttacker
                        );
                        buildMutantGrid(
                            document.getElementById('mutantsGridContainerDefender'),
                            document.getElementById('mutantNameRival'),
                            allMutantCardsDefender
                        );
                        // Inicializa los botones y bloques condicionales
                        updateAttackerGeneButtons(document.getElementById('mutantName').value);
                        updateDefenderLifeBlock(document.getElementById('mutantNameRival').value);
                    }
                });
            })
            .catch(error => console.error("❌ Error al cargar o procesar el archivo CSV:", error));
    }

    // --- 5. Funciones de Interfaz (Bloques Condicionales y Botones de Gen) ---

    // Maneja la visibilidad del bloque de vida del defensor (Mutante Rival)
    function updateDefenderLifeBlock(defenderName) {
        const defender = findMutantByName(defenderName);
        const lifeBlock = document.getElementById('defenderLifeBlock');
        
        if (defender) {
            lifeBlock.style.display = 'block';
        } else {
            lifeBlock.style.display = 'none';
        }
    }


    // Maneja la visibilidad del bloque de ataque del atacante (Tu Mutante)
    function updateAttackerGeneButtons(attackerName) {
        const attacker = findMutantByName(attackerName);
        const attackBlock = document.getElementById('attackerAttackBlock');
        const gene1Button = document.getElementById('gene1Button');
        const gene2Button = document.getElementById('gene2Button');
        const activeGeneIndexInput = document.getElementById('activeGeneIndex');

        if (!attacker || !attacker.attackGenes || attacker.attackGenes.length === 0) {
            attackBlock.style.display = 'none';
            return;
        }

        attackBlock.style.display = 'block'; // Muestra el bloque

        const attackGene1 = attacker.attackGenes[0]; 
        const attackGene2 = attacker.attackGenes[1]; 

        const gene1ImageUrl = getGeneImageUrl(attackGene1);
        const gene2ImageUrl = getGeneImageUrl(attackGene2);

        gene1Button.innerHTML = `<img src="${gene1ImageUrl}" alt="Ataque 1 (${attackGene1})" class="gene-button-img">`;
        gene2Button.innerHTML = `<img src="${gene2ImageUrl}" alt="Ataque 2 (${attackGene2})" class="gene-button-img">`;
        
        gene1Button.disabled = false;
        gene2Button.disabled = false;
        
        const activeIndex = activeGeneIndexInput.value;
        const allButtons = [gene1Button, gene2Button];
        
        allButtons.forEach((btn, index) => {
            const img = btn.querySelector('.gene-button-img');
            btn.classList.remove('active-gene-btn', 'inactive-gene-btn');
            
            if (index.toString() === activeIndex) {
                btn.classList.add('active-gene-btn');
                img.classList.remove('grayscale-filter'); 
            } else {
                btn.classList.add('inactive-gene-btn');
                img.classList.add('grayscale-filter'); 
            }
        });
    }

    function handleGeneButtonClick(button, index, allButtons, calculateHandler) {
        document.getElementById('activeGeneIndex').value = index.toString();
        
        allButtons.forEach(btn => {
            const img = btn.querySelector('.gene-button-img');
            btn.classList.remove('active-gene-btn', 'inactive-gene-btn');
            
            if (btn === button) {
                btn.classList.add('active-gene-btn');
                img.classList.remove('grayscale-filter'); 
            } else {
                btn.classList.add('inactive-gene-btn');
                img.classList.add('grayscale-filter'); 
            }
        });
        
        calculateHandler(false); 
    }
    
    
    function buildMutantGrid(gridContainer, inputElement, cardArray) {
        gridContainer.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'mutants-grid';
        cardArray.length = 0; 

        // APLICA EL ORDENAMIENTO
        const sortedMutants = Object.values(mutantsData)
            .filter(mutant => mutant.name && mutant.name.trim().toLowerCase() !== "no name")
            .sort(sortMutants); 

        sortedMutants.forEach(mutant => {
            const name = mutant.name;
            const card = document.createElement('div');
            card.className = 'mutant-card';
            card.dataset.name = name.toLowerCase();

            const imageUrl = mutant.imageURL || 'assets/img/mutants/default.png'; 

            const genesHtml = (mutant.genes || []).map(gene => {
                // Si el gen es 'N' (Neutro), usa la imagen de 'all'
                const geneIconLetter = (gene === 'N') ? 'all' : gene.toLowerCase();
                const geneImagePath = `https://s-ak.kobojo.com/mutants/assets/mobile/hud/fight_ui/gene_${geneIconLetter}.png`;
                return `<img src="${geneImagePath}" alt="Gen ${gene}" class="gene-icon">`;
            }).join('');

            card.innerHTML = `
                <img src="${imageUrl}" alt="${name}" class="mutant-card-image">
                <p class="mutant-card-name" title="${name}">
                    ${name}
                </p>
                <div class="mutant-genes">${genesHtml}</div>
            `;

            card.addEventListener('click', () => {
                inputElement.value = name;
                gridContainer.style.display = 'none';
                
                const isAttacker = inputElement.id === 'mutantName';
                
                if (isAttacker) {
                    updateAttackerGeneButtons(name);
                    updateMutantImage(name, 'mutantImageAttacker'); 
                } else {
                    updateDefenderLifeBlock(name); 
                    updateMutantImage(name, 'mutantImageDefender'); 
                }
                
                // Despacha el evento 'change' para que se activen otros listeners si es necesario
                inputElement.dispatchEvent(new Event('change'));
            });

            grid.appendChild(card);
            cardArray.push(card);
        });

        gridContainer.appendChild(grid);
    }

    function filterMutants(query, cardArray) {
        const q = (query || '').trim().toLowerCase();
        if (!cardArray.length) return;
        cardArray.forEach(card => {
            if (card.dataset.name.includes(q)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // --- 6. Funciones de Lógica de Combate ---
    
    function findMutantByName(name) {
        if (!name) return null;
        const lowerName = name.toLowerCase().trim();
        return Object.values(mutantsData).find(m => m.name.toLowerCase() === lowerName);
    }

    function calculateDamageMod(attackerGene, defenderGenes) {
        const defGene = defenderGenes[0]; 
        let currentMod = 1.0; 
        
        if (combatAdvantages[attackerGene] && combatAdvantages[attackerGene][defGene] !== undefined) {
            currentMod = combatAdvantages[attackerGene][defGene];
        }

        let bestInteraction = { type: 'Normal', mod: currentMod, genes: 'Sin ventaja' };
        
        const interactionText = `${geneNames[attackerGene]} (Atacante) vs ${geneNames[defGene]} (Defensor)`;
        
        bestInteraction.mod = currentMod;
        
        switch (currentMod) {
            case 1.5:  bestInteraction.type = 'Brutal'; break;
            case 1.25: bestInteraction.type = 'Fuerte'; break;
            case 0.75: bestInteraction.type = 'Débil'; break;
            case 0.5:  bestInteraction.type = 'Patético'; break;
            default:   
                bestInteraction.type = 'Normal'; 
        }
        
        bestInteraction.genes = interactionText;

        return bestInteraction;
    }

    function runSimulation(attackerName, baseAttackStr, defenderName, baseLifeStr, resultsDiv, activeGeneIndex, isManualClick = false) {
        const baseAttack = parseFloat(baseAttackStr);
        const baseLife = parseFloat(baseLifeStr);

        const hasValues = !isNaN(baseAttack) && baseAttack > 0 && !isNaN(baseLife) && baseLife > 0;
        const attacker = findMutantByName(attackerName);
        const defender = findMutantByName(defenderName);
        const hasMutants = attacker && defender;
        
        const isValidInput = hasValues && hasMutants;

        if (!isManualClick && !isCalculatedOnce) {
            return;
        }

        if (!isValidInput) {
            if (isManualClick) {
                resultsDiv.innerHTML = '<p class="text-danger">Por favor, introduce valores numéricos válidos para Ataque, Vida y selecciona ambos mutantes.</p>';
            } else if (isCalculatedOnce) {
                // Si ya se calculó una vez pero los inputs no son válidos ahora (ej. el usuario borró un número)
                resultsDiv.innerHTML = '<p>Esperando cálculo...</p>';
            }
            return;
        }

        const activeAttackerGene = attacker.attackGenes[activeGeneIndex]; 
        const defenderGeneForCalculation = [defender.genes[0]]; 
        
        let geneResult;

        if (activeAttackerGene === 'N') {
            geneResult = { 
                type: 'Neutro', 
                mod: 1.0, 
                genes: `Ataque Neutro vs. Gen Defensor ${geneNames[defenderGeneForCalculation[0]]}` 
            };
        } else {
            geneResult = calculateDamageMod(activeAttackerGene, defenderGeneForCalculation);
        }

        const finalDamage = Math.round(baseAttack * geneResult.mod);
        
        const remainingLife = Math.max(0, baseLife - finalDamage); 
        
        // CORRECCIÓN: Se asegura que hitsToWin esté declarada correctamente.
        const hitsToWin = (finalDamage <= 0) ? "Infinitos" : Math.ceil(baseLife / finalDamage);

        displaySimulationResult(resultsDiv, geneResult, baseAttack, finalDamage, baseLife, remainingLife, hitsToWin, activeAttackerGene);
    }

    function displaySimulationResult(resultsDiv, result, baseAtk, finalDmg, baseLife, remainingLife, hits, activeAttackerGene) {
        let resultClass = 'text-dark'; 
        let bonusText = '';
        let headerText = 'Ventaja de Gen'; 
        let typeText = ''; 
        const mod = result.mod;
        const percentage = (mod - 1) * 100;

        const modDisplay = (mod === 1.0) ? '1x' : `${mod.toFixed(2)}x`; 

        if (result.type === 'Neutro' || result.type === 'Normal') {
            headerText = 'Sin Ventaja de Gen';
            typeText = result.type; 
            resultClass = (result.type === 'Neutro') ? 'text-info fw-bold' : 'text-light fw-bold';
            bonusText = '(0%)';
        } else if (percentage > 0) {
            headerText = 'Ventaja de Gen';
            typeText = `${result.type}`;
            bonusText = `(+${percentage.toFixed(0)}%)`;
            resultClass = mod === 1.5 ? 'text-success fw-bold' : 'text-primary';
        } else if (percentage < 0) {
            headerText = 'Desventaja de Gen';
            typeText = `${result.type}`;
            bonusText = `(${percentage.toFixed(0)}%)`;
            resultClass = mod === 0.5 ? 'text-danger fw-bold' : 'text-warning';
        }

        resultsDiv.innerHTML = `
            <h5 class="${resultClass}">${headerText}: ${typeText} ${bonusText} [${modDisplay}]</h5>
            <p class="mb-1"><small>Mejor Interacción: ${result.genes}</small></p>
            <hr class="my-2">
            <p class="mb-1"><strong>Cálculo de Daño:</strong> ${baseAtk.toLocaleString()} (Ataque Base) &times; ${mod} (Gen) = <strong class="fs-6">${finalDmg.toLocaleString()}</strong> Daño Final</p>
            <p class="mb-1"><strong>Resultado en 1 Hit:</strong> ${baseLife.toLocaleString()} (Vida Rival) - ${finalDmg.toLocaleString()} (Daño) = <strong class="fs-6">${remainingLife.toLocaleString()}</strong> HP Restante</p>
            <hr class="my-2">
            <p class="mb-0"><strong>Hits para derrotar al rival:</strong> <span class="fs-5">${hits}</span></p>
        `;
    }


    // --- 7. Configuración del Simulador y Eventos ---
    
    function setupSimulator() {
        const attackerNameInput = document.getElementById('mutantName');
        const defenderNameInput = document.getElementById('mutantNameRival');
        const defenderLifeInput = document.getElementById('life');
        const calculateButton = document.querySelector('.btn.btn-primary[type="button"]');
        const resultsDiv = document.getElementById('battle-results-body');
        const gridAttacker = document.getElementById('mutantsGridContainerAttacker');
        const gridDefender = document.getElementById('mutantsGridContainerDefender');
        
        const attackerAttackBlock = document.getElementById('attackerAttackBlock'); 
        const defenderLifeBlock = document.getElementById('defenderLifeBlock'); 
        
        const geneButtons = [
            document.getElementById('gene1Button'),
            document.getElementById('gene2Button')
        ];
        const attackInputs = [
            document.getElementById('attackGene1'),
            document.getElementById('attackGene2')
        ];
        const activeGeneIndexInput = document.getElementById('activeGeneIndex');

        const calculateHandler = (isManualClick = false) => {
            const activeGeneIndex = parseInt(activeGeneIndexInput.value || '0', 10);
            const activeAttackInput = attackInputs[activeGeneIndex] || { value: '0' };

            runSimulation(
                attackerNameInput.value,
                activeAttackInput.value, 
                defenderNameInput.value,
                defenderLifeInput.value,
                resultsDiv,
                activeGeneIndex,
                isManualClick 
            );
        };


        // LISTENERS DE INPUTS Y GRIDS 
        attackerNameInput.addEventListener('focus', () => {
            gridAttacker.style.display = 'block';
            filterMutants(attackerNameInput.value, allMutantCardsAttacker);
            attackerAttackBlock.style.display = 'none'; // Oculta los ataques al buscar
        });
        attackerNameInput.addEventListener('input', () => {
            gridAttacker.style.display = 'block';
            filterMutants(attackerNameInput.value, allMutantCardsAttacker);
            // No llama a updateAttackerGeneButtons aquí, se hace al salir del foco para evitar destellos.
        });

        defenderNameInput.addEventListener('focus', () => {
            gridDefender.style.display = 'block';
            filterMutants(defenderNameInput.value, allMutantCardsDefender);
            defenderLifeBlock.style.display = 'none'; // Oculta la vida al buscar
        });
        defenderNameInput.addEventListener('input', () => {
            gridDefender.style.display = 'block';
            filterMutants(defenderNameInput.value, allMutantCardsDefender);
            // No llama a updateDefenderLifeBlock aquí, se hace al salir del foco.
        });
        
        document.addEventListener('click', (e) => {
            // Cierra grid atacante y muestra/oculta botones de ataque
            const isClickInsideAttackerArea = gridAttacker.contains(e.target) || attackerNameInput.contains(e.target) || geneButtons.some(btn => btn.contains(e.target));
            if (!isClickInsideAttackerArea) {
                gridAttacker.style.display = 'none';
                updateAttackerGeneButtons(attackerNameInput.value);
            }
            
            // Cierra grid defensor y muestra/oculta campo de vida
            const isClickInsideDefenderArea = gridDefender.contains(e.target) || defenderNameInput.contains(e.target) || defenderLifeInput.contains(e.target);
            if (!isClickInsideDefenderArea) {
                gridDefender.style.display = 'none';
                updateDefenderLifeBlock(defenderNameInput.value);
            }
        });

        // --- LISTENERS DE ACTUALIZACIÓN CONDICIONAL Y IMAGEN ---
        
        attackerNameInput.addEventListener('change', () => {
            updateAttackerGeneButtons(attackerNameInput.value);
            updateMutantImage(attackerNameInput.value, 'mutantImageAttacker'); 
            calculateHandler(false);
        });
        
        defenderNameInput.addEventListener('change', () => {
            updateDefenderLifeBlock(defenderNameInput.value); 
            updateMutantImage(defenderNameInput.value, 'mutantImageDefender'); 
            calculateHandler(false);
        });
        
        // Ejecuta el cálculo al cambiar vida o ataque.
        defenderLifeInput.addEventListener('input', () => {
            calculateHandler(false);
        });
        
        attackInputs.forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    calculateHandler(false);
                });
            }
        });

        calculateButton.addEventListener('click', () => {
            isCalculatedOnce = true;
            calculateHandler(true); 
        });

        geneButtons.forEach((button, index) => {
            if (button) {
                button.addEventListener('click', () => {
                    if(isCalculatedOnce) {
                        handleGeneButtonClick(button, index, geneButtons, calculateHandler);
                    } else {
                        handleGeneButtonClick(button, index, geneButtons, () => {});
                    }
                });
            }
        });

        // Inicializa estado de bloques al cargar
        attackerAttackBlock.style.display = 'none';
        defenderLifeBlock.style.display = 'none';
    }

    // --- 8. Inicialización ---
    fetchMutantData();
    setupSimulator();

});