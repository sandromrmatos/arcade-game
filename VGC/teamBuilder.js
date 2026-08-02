// VGC Team Builder
// UI for building a team of 6 creatures with customization

class TeamBuilder {
    constructor() {
        this.playerTeam = []; // Array of customized creatures (max 6)
        this.opponentTeam = []; // AI team
        this.currentEditingIndex = null;
        this.currentCreatureData = null;
        this.selectedMoves = [];
        this.selectedAbility = null;
        this.allocatedStats = {
            hp: 0,
            attack: 0,
            defense: 0,
            specialAttack: 0,
            specialDefense: 0,
            speed: 0
        };
        this.savedTeams = this.loadSavedTeams();
    }

    // Load saved teams from localStorage
    loadSavedTeams() {
        const saved = localStorage.getItem('vgc_saved_teams');
        return saved ? JSON.parse(saved) : [];
    }

    // Save teams to localStorage
    saveTeamsToStorage() {
        localStorage.setItem('vgc_saved_teams', JSON.stringify(this.savedTeams));
    }

    // Show team builder screen
    showTeamBuilder() {
        const container = document.getElementById('team-builder');
        container.innerHTML = `
            <div class="team-builder-container">
                <h2>Build Your Team</h2>
                <div class="team-summary">
                    <h3>Your Team (${this.playerTeam.length}/6)</h3>
                    <div id="team-list" class="team-list"></div>
                    <div class="team-actions">
                        <button id="add-creature-btn" class="btn-primary" ${this.playerTeam.length >= 6 ? 'disabled' : ''}>
                            Add Creature
                        </button>
                        <button id="save-team-btn" class="btn-secondary" ${this.playerTeam.length < 6 ? 'disabled' : ''}>
                            Save Team
                        </button>
                        <button id="load-team-btn" class="btn-secondary" ${this.savedTeams.length === 0 ? 'disabled' : ''}>
                            Load Team
                        </button>
                        <button id="debug-battle-btn" class="btn-debug" ${this.savedTeams.length < 1 ? 'disabled' : ''}>
                            🐛 Debug Battle
                        </button>
                        <button id="finalize-team-btn" class="btn-success" ${this.playerTeam.length < 6 ? 'disabled' : ''}>
                            Finalize Team
                        </button>
                    </div>
                </div>
                
                <div id="saved-teams-panel" class="saved-teams-panel" style="display: none;">
                    <h3>Saved Teams</h3>
                    <div id="saved-teams-list"></div>
                    <button id="close-saved-teams-btn" class="btn-secondary">Close</button>
                </div>
                
                <div id="debug-battle-panel" class="debug-battle-panel" style="display: none;">
                    <h3>🐛 Debug Battle Mode</h3>
                    <p>Select teams to battle. You can choose the same team for both sides to test mirror matches!</p>
                    <div class="debug-team-selection">
                        <div class="debug-team-side">
                            <h4>Player Team</h4>
                            <div id="debug-player-team-list"></div>
                        </div>
                        <div class="debug-team-side">
                            <h4>AI Team</h4>
                            <div id="debug-ai-team-list"></div>
                        </div>
                    </div>
                    <div class="debug-actions">
                        <button id="start-debug-battle-btn" class="btn-success" disabled>Start Debug Battle</button>
                        <button id="close-debug-panel-btn" class="btn-secondary">Cancel</button>
                    </div>
                </div>
                
                <div id="creature-selector" class="creature-selector" style="display: none;">
                    <h3>Select a Creature</h3>
                    <div id="creature-grid" class="creature-grid"></div>
                </div>
                
                <div id="creature-customizer" class="creature-customizer" style="display: none;">
                    <h3>Customize <span id="creature-name"></span></h3>
                    <div class="customizer-content">
                        <div class="stats-section">
                            <h4>Allocate Stats (30 points, max 20 per stat)</h4>
                            <div id="stat-allocators"></div>
                            <p>Points Remaining: <span id="points-remaining">30</span></p>
                        </div>
                        
                        <div class="moves-section">
                            <h4>Select 4 Moves</h4>
                            <div id="move-selector" class="move-selector"></div>
                        </div>
                        
                        <div class="ability-section">
                            <h4>Select 1 Ability</h4>
                            <div id="ability-selector" class="ability-selector"></div>
                        </div>
                        
                        <div class="customizer-actions">
                            <button id="save-creature-btn" class="btn-success">Save Creature</button>
                            <button id="cancel-customize-btn" class="btn-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.renderTeamList();
        this.attachTeamBuilderEvents();
    }

    // Render the team list
    renderTeamList() {
        const teamList = document.getElementById('team-list');
        if (!teamList) return;
        
        teamList.innerHTML = '';
        
        this.playerTeam.forEach((creature, index) => {
            const card = document.createElement('div');
            card.className = 'team-creature-card';
            card.innerHTML = `
                <img src="images/${creature.sprite}" alt="${creature.name}">
                <div class="creature-info">
                    <strong>${creature.name}</strong>
                    <span class="type-badge type-${creature.type.toLowerCase()}">${creature.type}</span>
                </div>
                <div class="creature-actions">
                    <button class="btn-small btn-edit" data-index="${index}">Edit</button>
                    <button class="btn-small btn-remove" data-index="${index}">Remove</button>
                </div>
            `;
            teamList.appendChild(card);
        });
        
        // Attach edit and remove events after rendering
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.onclick = (e) => {
                const index = parseInt(e.target.dataset.index);
                this.editCreature(index);
            };
        });
        
        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.onclick = (e) => {
                const index = parseInt(e.target.dataset.index);
                this.removeCreature(index);
            };
        });
        
        // Update button states
        const addBtn = document.getElementById('add-creature-btn');
        const saveTeamBtn = document.getElementById('save-team-btn');
        const loadTeamBtn = document.getElementById('load-team-btn');
        const debugBtn = document.getElementById('debug-battle-btn');
        const finalizeBtn = document.getElementById('finalize-team-btn');
        
        if (addBtn) addBtn.disabled = this.playerTeam.length >= 6;
        if (saveTeamBtn) saveTeamBtn.disabled = this.playerTeam.length < 6;
        if (loadTeamBtn) loadTeamBtn.disabled = this.savedTeams.length === 0;
        if (debugBtn) debugBtn.disabled = this.savedTeams.length < 1;
        if (finalizeBtn) finalizeBtn.disabled = this.playerTeam.length < 6;
    }

    // Attach event listeners
    attachTeamBuilderEvents() {
        const addBtn = document.getElementById('add-creature-btn');
        if (addBtn) {
            addBtn.onclick = () => this.showCreatureSelector();
        }
        
        const saveTeamBtn = document.getElementById('save-team-btn');
        if (saveTeamBtn) {
            saveTeamBtn.onclick = () => this.saveCurrentTeam();
        }
        
        const loadTeamBtn = document.getElementById('load-team-btn');
        if (loadTeamBtn) {
            loadTeamBtn.onclick = () => this.showSavedTeams();
        }
        
        const debugBtn = document.getElementById('debug-battle-btn');
        if (debugBtn) {
            debugBtn.onclick = () => this.showDebugBattlePanel();
        }
        
        const finalizeBtn = document.getElementById('finalize-team-btn');
        if (finalizeBtn) {
            finalizeBtn.onclick = () => this.finalizeTeam();
        }
    }

    // Show creature selector
    showCreatureSelector() {
        const selector = document.getElementById('creature-selector');
        const grid = document.getElementById('creature-grid');
        
        selector.style.display = 'block';
        grid.innerHTML = '';
        
        gameData.creatures.forEach(creature => {
            // Check if creature is already in team
            const alreadyInTeam = this.playerTeam.some(c => c.name === creature.name);
            
            const card = document.createElement('div');
            card.className = `creature-select-card ${alreadyInTeam ? 'already-selected' : ''}`;
            card.innerHTML = `
                <img src="images/${creature.sprite}" alt="${creature.name}">
                <h4>${creature.name}</h4>
                <span class="type-badge type-${creature.type.toLowerCase()}">${creature.type}</span>
                <div class="base-stats">
                    <small>HP: ${creature.baseStats.hp} | ATK: ${creature.baseStats.attack} | DEF: ${creature.baseStats.defense}</small>
                    <small>SPATK: ${creature.baseStats.specialAttack} | SPDEF: ${creature.baseStats.specialDefense} | SPD: ${creature.baseStats.speed}</small>
                </div>
                ${alreadyInTeam ? '<div class="already-in-team-badge">Already in Team</div>' : ''}
            `;
            
            if (!alreadyInTeam) {
                card.onclick = () => this.selectCreature(creature);
            } else {
                card.style.cursor = 'not-allowed';
            }
            
            grid.appendChild(card);
        });
    }

    // Select a creature to customize
    selectCreature(creatureData) {
        this.currentCreatureData = creatureData;
        this.selectedMoves = [];
        this.selectedAbility = null;
        this.allocatedStats = {
            hp: 0, attack: 0, defense: 0,
            specialAttack: 0, specialDefense: 0, speed: 0
        };
        
        document.getElementById('creature-selector').style.display = 'none';
        this.showCustomizer();
    }

    // Show creature customizer
    showCustomizer() {
        const customizer = document.getElementById('creature-customizer');
        customizer.style.display = 'block';
        
        document.getElementById('creature-name').textContent = this.currentCreatureData.name;
        
        // Render stat allocators
        this.renderStatAllocators();
        
        // Render move selector
        this.renderMoveSelector();
        
        // Render ability selector
        this.renderAbilitySelector();
        
        // Attach events
        const saveBtn = document.getElementById('save-creature-btn');
        saveBtn.onclick = () => this.saveCreature();
        
        const cancelBtn = document.getElementById('cancel-customize-btn');
        cancelBtn.onclick = () => this.cancelCustomize();
    }

    // Render stat allocators
    renderStatAllocators() {
        const container = document.getElementById('stat-allocators');
        container.innerHTML = '';
        
        const statNames = [
            { key: 'hp', label: 'HP' },
            { key: 'attack', label: 'Attack' },
            { key: 'defense', label: 'Defense' },
            { key: 'specialAttack', label: 'Special Attack' },
            { key: 'specialDefense', label: 'Special Defense' },
            { key: 'speed', label: 'Speed' }
        ];
        
        statNames.forEach(({ key, label }) => {
            const baseStat = this.currentCreatureData.baseStats[key];
            const allocated = this.allocatedStats[key];
            const total = baseStat + allocated;
            
            const div = document.createElement('div');
            div.className = 'stat-allocator';
            div.innerHTML = `
                <label>${label}: ${baseStat} + ${allocated} = ${total}</label>
                <div class="stat-controls">
                    <button class="btn-stat" data-stat="${key}" data-change="-1">-</button>
                    <span class="stat-value">${allocated}</span>
                    <button class="btn-stat" data-stat="${key}" data-change="1">+</button>
                </div>
            `;
            container.appendChild(div);
        });
        
        // Attach stat change events
        document.querySelectorAll('.btn-stat').forEach(btn => {
            btn.onclick = (e) => {
                const stat = e.target.dataset.stat;
                const change = parseInt(e.target.dataset.change);
                this.changeStatAllocation(stat, change);
            };
        });
        
        this.updatePointsRemaining();
    }

    // Change stat allocation
    changeStatAllocation(stat, change) {
        const newValue = this.allocatedStats[stat] + change;
        const totalUsed = Object.values(this.allocatedStats).reduce((a, b) => a + b, 0);
        
        // Check constraints
        if (newValue < 0 || newValue > 20) return;
        if (change > 0 && totalUsed >= 30) return;
        
        this.allocatedStats[stat] = newValue;
        this.renderStatAllocators();
    }

    // Update points remaining display
    updatePointsRemaining() {
        const totalUsed = Object.values(this.allocatedStats).reduce((a, b) => a + b, 0);
        const remaining = 30 - totalUsed;
        document.getElementById('points-remaining').textContent = remaining;
    }

    // Render move selector
    renderMoveSelector() {
        const container = document.getElementById('move-selector');
        container.innerHTML = '';
        
        this.currentCreatureData.learnableMoves.forEach(moveName => {
            const moveData = gameData.getMoveByName(moveName);
            if (!moveData) return;
            
            const isSelected = this.selectedMoves.includes(moveName);
            const div = document.createElement('div');
            div.className = `move-option ${isSelected ? 'selected' : ''}`;
            
            // Format secondary effects display
            const secondaryEffects = moveData.secondaryEffects && moveData.secondaryEffects.trim() !== '' 
                ? `<div class="move-secondary">${moveData.secondaryEffects}</div>` 
                : '';
            
            div.innerHTML = `
                <div class="move-header">
                    <strong>${moveData.name}</strong>
                    <span class="type-badge type-${moveData.type.toLowerCase()}">${moveData.type}</span>
                </div>
                <div class="move-details">
                    <span>${moveData.category} | Power: ${moveData.power} | Acc: ${moveData.accuracy}%</span>
                    <span>Priority: ${moveData.priority}</span>
                </div>
                ${secondaryEffects}
            `;
            div.onclick = () => this.toggleMove(moveName);
            container.appendChild(div);
        });
    }

    // Toggle move selection
    toggleMove(moveName) {
        const index = this.selectedMoves.indexOf(moveName);
        if (index > -1) {
            this.selectedMoves.splice(index, 1);
        } else {
            if (this.selectedMoves.length < 4) {
                this.selectedMoves.push(moveName);
            } else {
                alert('You can only select 4 moves!');
                return;
            }
        }
        this.renderMoveSelector();
    }

    // Render ability selector
    renderAbilitySelector() {
        const container = document.getElementById('ability-selector');
        container.innerHTML = '';
        
        this.currentCreatureData.abilities.forEach(abilityName => {
            const abilityData = gameData.getAbilityByName(abilityName);
            if (!abilityData) return;
            
            const isSelected = this.selectedAbility === abilityName;
            const div = document.createElement('div');
            div.className = `ability-option ${isSelected ? 'selected' : ''}`;
            div.innerHTML = `
                <strong>${abilityData.name}</strong>
                <p>${abilityData.description}</p>
            `;
            div.onclick = () => this.selectAbility(abilityName);
            container.appendChild(div);
        });
    }

    // Select ability
    selectAbility(abilityName) {
        this.selectedAbility = abilityName;
        this.renderAbilitySelector();
    }

    // Save creature to team
    saveCreature() {
        // Validate
        if (this.selectedMoves.length !== 4) {
            alert('You must select exactly 4 moves!');
            return;
        }
        if (!this.selectedAbility) {
            alert('You must select an ability!');
            return;
        }
        const totalUsed = Object.values(this.allocatedStats).reduce((a, b) => a + b, 0);
        if (totalUsed !== 30) {
            alert('You must use all 30 stat points!');
            return;
        }
        
        // Create creature object
        const creature = {
            ...this.currentCreatureData,
            selectedMoves: [...this.selectedMoves],
            selectedAbility: this.selectedAbility,
            allocatedStats: { ...this.allocatedStats }
        };
        
        if (this.currentEditingIndex !== null) {
            this.playerTeam[this.currentEditingIndex] = creature;
            this.currentEditingIndex = null;
        } else {
            this.playerTeam.push(creature);
        }
        
        this.cancelCustomize();
        this.renderTeamList();
    }

    // Cancel customization
    cancelCustomize() {
        document.getElementById('creature-customizer').style.display = 'none';
        this.currentCreatureData = null;
        this.currentEditingIndex = null;
    }

    // Edit creature
    editCreature(index) {
        const creature = this.playerTeam[index];
        this.currentEditingIndex = index;
        this.currentCreatureData = gameData.getCreatureByName(creature.name);
        this.selectedMoves = [...creature.selectedMoves];
        this.selectedAbility = creature.selectedAbility;
        this.allocatedStats = { ...creature.allocatedStats };
        
        document.getElementById('creature-selector').style.display = 'none';
        this.showCustomizer();
    }

    // Remove creature
    removeCreature(index) {
        if (confirm('Remove this creature from your team?')) {
            this.playerTeam.splice(index, 1);
            this.renderTeamList();
        }
    }

    // Finalize team and generate AI team
    finalizeTeam() {
        if (this.playerTeam.length !== 6) {
            alert('You must have exactly 6 creatures!');
            return;
        }
        
        // Generate AI team
        this.generateAITeam();
        
        // Show pre-battle selection screen
        showPreBattleSelection(this.playerTeam, this.opponentTeam);
    }

    // Generate AI team randomly
    generateAITeam() {
        this.opponentTeam = [];
        const availableCreatures = [...gameData.creatures];
        
        for (let i = 0; i < 6; i++) {
            const randomIndex = Math.floor(Math.random() * availableCreatures.length);
            const creature = availableCreatures.splice(randomIndex, 1)[0];
            
            // Random moves (4 out of 12)
            const shuffledMoves = [...creature.learnableMoves].sort(() => Math.random() - 0.5);
            const selectedMoves = shuffledMoves.slice(0, 4);
            
            // Random ability
            const selectedAbility = creature.abilities[Math.floor(Math.random() * creature.abilities.length)];
            
            // Random stat allocation
            const allocatedStats = {
                hp: 0, attack: 0, defense: 0,
                specialAttack: 0, specialDefense: 0, speed: 0
            };
            const statKeys = Object.keys(allocatedStats);
            let pointsLeft = 30;
            
            while (pointsLeft > 0) {
                const stat = statKeys[Math.floor(Math.random() * statKeys.length)];
                if (allocatedStats[stat] < 20) {
                    const toAdd = Math.min(Math.floor(Math.random() * 5) + 1, 20 - allocatedStats[stat], pointsLeft);
                    allocatedStats[stat] += toAdd;
                    pointsLeft -= toAdd;
                }
            }
            
            this.opponentTeam.push({
                ...creature,
                selectedMoves,
                selectedAbility,
                allocatedStats
            });
        }
    }

    // Save current team
    saveCurrentTeam() {
        if (this.playerTeam.length !== 6) {
            alert('You must have a complete team of 6 creatures to save!');
            return;
        }

        const teamName = `Team ${this.savedTeams.length + 1}`;
        const teamData = {
            name: teamName,
            creatures: JSON.parse(JSON.stringify(this.playerTeam)),
            savedAt: new Date().toISOString()
        };

        this.savedTeams.push(teamData);
        this.saveTeamsToStorage();
        
        alert(`Team saved as "${teamName}"!`);
        this.renderTeamList();
    }

    // Show saved teams panel
    showSavedTeams() {
        const panel = document.getElementById('saved-teams-panel');
        const list = document.getElementById('saved-teams-list');
        
        panel.style.display = 'block';
        list.innerHTML = '';

        if (this.savedTeams.length === 0) {
            list.innerHTML = '<p class="no-saved-teams">No saved teams yet.</p>';
        } else {
            this.savedTeams.forEach((team, index) => {
                const teamCard = document.createElement('div');
                teamCard.className = 'saved-team-card';
                
                const creatureNames = team.creatures.map(c => c.name).join(', ');
                const savedDate = new Date(team.savedAt).toLocaleString();
                
                teamCard.innerHTML = `
                    <div class="saved-team-header">
                        <h4>${team.name}</h4>
                        <span class="saved-date">${savedDate}</span>
                    </div>
                    <div class="saved-team-creatures">
                        ${team.creatures.map(c => `
                            <img src="images/${c.sprite}" alt="${c.name}" title="${c.name}">
                        `).join('')}
                    </div>
                    <div class="saved-team-actions">
                        <button class="btn-small btn-primary load-team-btn" data-index="${index}">Load</button>
                        <button class="btn-small btn-remove delete-team-btn" data-index="${index}">Delete</button>
                    </div>
                `;
                
                list.appendChild(teamCard);
            });

            // Attach load and delete events
            document.querySelectorAll('.load-team-btn').forEach(btn => {
                btn.onclick = (e) => {
                    const index = parseInt(e.target.dataset.index);
                    this.loadTeam(index);
                };
            });

            document.querySelectorAll('.delete-team-btn').forEach(btn => {
                btn.onclick = (e) => {
                    const index = parseInt(e.target.dataset.index);
                    this.deleteTeam(index);
                };
            });
        }

        const closeBtn = document.getElementById('close-saved-teams-btn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                panel.style.display = 'none';
            };
        }
    }

    // Load a saved team
    loadTeam(index) {
        if (index < 0 || index >= this.savedTeams.length) return;

        const team = this.savedTeams[index];
        this.playerTeam = JSON.parse(JSON.stringify(team.creatures));
        
        document.getElementById('saved-teams-panel').style.display = 'none';
        this.renderTeamList();
        
        alert(`Loaded "${team.name}"!`);
    }

    // Delete a saved team
    deleteTeam(index) {
        if (index < 0 || index >= this.savedTeams.length) return;

        const team = this.savedTeams[index];
        if (confirm(`Delete "${team.name}"?`)) {
            this.savedTeams.splice(index, 1);
            
            // Renumber remaining teams
            this.savedTeams.forEach((t, i) => {
                t.name = `Team ${i + 1}`;
            });
            
            this.saveTeamsToStorage();
            this.showSavedTeams();
            this.renderTeamList();
        }
    }

    // Show debug battle panel
    showDebugBattlePanel() {
        const panel = document.getElementById('debug-battle-panel');
        panel.style.display = 'block';
        
        this.selectedPlayerTeamIndex = null;
        this.selectedAITeamIndex = null;
        
        this.renderDebugTeamLists();
        
        const startBtn = document.getElementById('start-debug-battle-btn');
        startBtn.onclick = () => this.startDebugBattle();
        
        const closeBtn = document.getElementById('close-debug-panel-btn');
        closeBtn.onclick = () => {
            panel.style.display = 'none';
        };
    }

    // Render debug team selection lists
    renderDebugTeamLists() {
        const playerList = document.getElementById('debug-player-team-list');
        const aiList = document.getElementById('debug-ai-team-list');
        
        playerList.innerHTML = '';
        aiList.innerHTML = '';
        
        this.savedTeams.forEach((team, index) => {
            // Player team option
            const playerCard = this.createDebugTeamCard(team, index, 'player');
            playerList.appendChild(playerCard);
            
            // AI team option
            const aiCard = this.createDebugTeamCard(team, index, 'ai');
            aiList.appendChild(aiCard);
        });
    }

    // Create debug team card
    createDebugTeamCard(team, index, side) {
        const card = document.createElement('div');
        const isSelected = (side === 'player' && this.selectedPlayerTeamIndex === index) ||
                          (side === 'ai' && this.selectedAITeamIndex === index);
        
        card.className = `debug-team-card ${isSelected ? 'selected' : ''}`;
        card.innerHTML = `
            <h5>${team.name}</h5>
            <div class="debug-team-creatures">
                ${team.creatures.map(c => `
                    <img src="images/${c.sprite}" alt="${c.name}" title="${c.name}">
                `).join('')}
            </div>
        `;
        
        card.onclick = () => {
            if (side === 'player') {
                this.selectedPlayerTeamIndex = index;
            } else {
                this.selectedAITeamIndex = index;
            }
            this.renderDebugTeamLists();
            this.updateDebugBattleButton();
        };
        
        return card;
    }

    // Update debug battle button state
    updateDebugBattleButton() {
        const startBtn = document.getElementById('start-debug-battle-btn');
        if (startBtn) {
            startBtn.disabled = this.selectedPlayerTeamIndex === null || this.selectedAITeamIndex === null;
        }
    }

    // Start debug battle
    startDebugBattle() {
        if (this.selectedPlayerTeamIndex === null || this.selectedAITeamIndex === null) {
            alert('Please select both player and AI teams!');
            return;
        }
        
        const playerTeam = JSON.parse(JSON.stringify(this.savedTeams[this.selectedPlayerTeamIndex].creatures));
        const aiTeam = JSON.parse(JSON.stringify(this.savedTeams[this.selectedAITeamIndex].creatures));
        
        document.getElementById('debug-battle-panel').style.display = 'none';
        
        // Show pre-battle selection screen
        showPreBattleSelection(playerTeam, aiTeam);
    }
}

// Global team builder instance
const teamBuilder = new TeamBuilder();
