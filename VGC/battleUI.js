// VGC Battle UI
// Manages the battle interface, displays creatures, HP, and handles player input

class BattleUI {
    constructor() {
        this.battle = null;
        this.playerActions = [null, null]; // Actions for 2 active creatures
        this.waitingForPlayer = false;
        this.currentSelectingCreature = null; // 0 or 1 for which active slot is selecting
        this.messageQueue = []; // Queue of messages to show
        this.showingMessage = false;
    }

    // Start battle with selected teams
    startBattle(playerBattleTeam, opponentBattleTeam) {
        // Create BattleCreature instances
        const playerTeam = playerBattleTeam.map(c => 
            new BattleCreature(c, c.selectedMoves, c.selectedAbility, c.allocatedStats)
        );
        const opponentTeam = opponentBattleTeam.map(c => 
            new BattleCreature(c, c.selectedMoves, c.selectedAbility, c.allocatedStats)
        );
        
        this.battle = new Battle(playerTeam, opponentTeam);
        this.showBattleScreen();
        this.captureBattleLog(); // Capture battle log messages
        this.renderBattle();
        
        // Start first turn
        setTimeout(() => this.startPlayerTurn(), 500);
    }

    // Show battle screen
    showBattleScreen() {
        document.getElementById('pre-battle').style.display = 'none';
        document.getElementById('battle-screen').style.display = 'block';
        
        // Add message modal to the battle screen
        const battleScreen = document.getElementById('battle-screen');
        const modal = document.createElement('div');
        modal.id = 'battle-message-modal';
        modal.className = 'battle-message-modal';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="battle-message-content">
                <p id="battle-message-text"></p>
                <button id="battle-message-ok" class="btn-primary">OK</button>
            </div>
        `;
        battleScreen.appendChild(modal);
    }

    // Render entire battle state
    renderBattle() {
        this.renderOpponentSide();
        this.renderPlayerSide();
        this.renderTurnInfo();
        this.renderBattleLog();
    }

    // Render opponent's creatures
    renderOpponentSide() {
        const container = document.getElementById('opponent-side');
        container.innerHTML = '<h3>Opponent</h3>';
        
        // Active creatures
        const activeDiv = document.createElement('div');
        activeDiv.className = 'active-creatures opponent-active';
        
        this.battle.opponentActive.forEach((creature, index) => {
            if (creature && creature.isAlive()) {
                activeDiv.appendChild(this.createCreatureCard(creature, 'opponent', true, index));
            } else {
                activeDiv.appendChild(this.createEmptySlot());
            }
        });
        
        container.appendChild(activeDiv);
        
        // Bench creatures
        const benchDiv = document.createElement('div');
        benchDiv.className = 'bench-creatures';
        benchDiv.innerHTML = '<h4>Bench</h4>';
        const benchList = document.createElement('div');
        benchList.className = 'bench-list';
        
        this.battle.opponentBench.forEach((creature, index) => {
            if (creature && creature.isAlive()) {
                benchList.appendChild(this.createBenchCard(creature));
            }
        });
        
        benchDiv.appendChild(benchList);
        container.appendChild(benchDiv);
    }

    // Render player's creatures
    renderPlayerSide() {
        const container = document.getElementById('player-side');
        container.innerHTML = '<h3>Your Team</h3>';
        
        // Active creatures
        const activeDiv = document.createElement('div');
        activeDiv.className = 'active-creatures player-active';
        
        this.battle.playerActive.forEach((creature, index) => {
            if (creature && creature.isAlive()) {
                activeDiv.appendChild(this.createCreatureCard(creature, 'player', true, index));
            } else {
                activeDiv.appendChild(this.createEmptySlot());
            }
        });
        
        container.appendChild(activeDiv);
        
        // Bench creatures
        const benchDiv = document.createElement('div');
        benchDiv.className = 'bench-creatures';
        benchDiv.innerHTML = '<h4>Bench</h4>';
        const benchList = document.createElement('div');
        benchList.className = 'bench-list';
        
        this.battle.playerBench.forEach((creature, index) => {
            if (creature && creature.isAlive()) {
                benchList.appendChild(this.createBenchCard(creature));
            }
        });
        
        benchDiv.appendChild(benchList);
        container.appendChild(benchDiv);
    }

    // Create creature card
    createCreatureCard(creature, side, isActive, slotIndex) {
        const card = document.createElement('div');
        card.className = `creature-card ${side}-creature`;
        
        const hpPercent = (creature.currentHP / creature.maxStats.hp) * 100;
        
        // Get stat modifiers display
        const statModsHTML = this.getStatModifiersHTML(creature);
        
        card.innerHTML = `
            <div class="creature-sprite">
                <img src="images/${creature.sprite}" alt="${creature.name}">
            </div>
            <div class="creature-details">
                <div class="creature-header">
                    <strong>${creature.name}</strong>
                    <span class="type-badge type-${creature.type.toLowerCase()}">${creature.type}</span>
                </div>
                <div class="hp-bar-container">
                    <div class="hp-bar" style="width: ${hpPercent}%"></div>
                </div>
                <div class="hp-text">${creature.currentHP} / ${creature.maxStats.hp} HP</div>
                ${statModsHTML}
            </div>
        `;
        
        // Add click handler for player active creatures during action selection
        if (side === 'player' && isActive && this.waitingForPlayer) {
            card.classList.add('selectable');
            card.onclick = () => this.selectPlayerCreature(slotIndex);
        }
        
        return card;
    }
    
    // Get stat modifiers HTML
    getStatModifiersHTML(creature) {
        const modifiers = [];
        
        // Check each stat for modifications
        const statNames = {
            attack: 'Attack',
            defense: 'Defense',
            specialAttack: 'Sp. Attack',
            specialDefense: 'Sp. Defense',
            speed: 'Speed'
        };
        
        for (const [stat, name] of Object.entries(statNames)) {
            const modifier = creature.statModifiers[stat];
            if (modifier !== 1.0) {
                const percentChange = Math.round((modifier - 1.0) * 100);
                const sign = percentChange > 0 ? '+' : '';
                const className = percentChange > 0 ? 'stat-buff' : 'stat-debuff';
                modifiers.push(`<span class="${className}">${sign}${percentChange}% ${name}</span>`);
            }
        }
        
        if (modifiers.length === 0) {
            return '';
        }
        
        return `<div class="stat-modifiers">${modifiers.join('')}</div>`;
    }

    // Create bench card (smaller)
    createBenchCard(creature) {
        const card = document.createElement('div');
        card.className = 'bench-card';
        
        const hpPercent = (creature.currentHP / creature.maxStats.hp) * 100;
        
        card.innerHTML = `
            <img src="images/${creature.sprite}" alt="${creature.name}">
            <div class="bench-info">
                <strong>${creature.name}</strong>
                <div class="hp-bar-small">
                    <div class="hp-bar" style="width: ${hpPercent}%"></div>
                </div>
                <small>${creature.currentHP}/${creature.maxStats.hp}</small>
            </div>
        `;
        
        return card;
    }

    // Create empty slot placeholder
    createEmptySlot() {
        const slot = document.createElement('div');
        slot.className = 'creature-card empty-slot';
        slot.innerHTML = '<span>Empty</span>';
        return slot;
    }

    // Render turn info and field effects
    renderTurnInfo() {
        const container = document.getElementById('turn-info');
        container.innerHTML = `
            <div class="turn-counter">
                <h3>Turn ${this.battle.turnNumber} / ${this.battle.maxTurns}</h3>
            </div>
            <div class="field-effects">
                <div class="player-effects">
                    <strong>Your Effects:</strong>
                    ${this.renderFieldEffects(this.battle.playerFieldEffects)}
                </div>
                <div class="opponent-effects">
                    <strong>Opponent Effects:</strong>
                    ${this.renderFieldEffects(this.battle.opponentFieldEffects)}
                </div>
            </div>
        `;
    }

    // Render field effects list
    renderFieldEffects(effects) {
        if (effects.length === 0) {
            return '<span class="no-effects">None</span>';
        }
        return effects.map(e => `<span class="effect-badge">${e.name} (${e.duration} turns)</span>`).join('');
    }

    // Render battle log
    renderBattleLog() {
        const container = document.getElementById('battle-log');
        const logMessages = this.battle.battleLog.slice(-10); // Last 10 messages
        
        container.innerHTML = '<h4>Battle Log</h4>' + 
            logMessages.map(msg => `<div class="log-entry">${msg}</div>`).join('');
        
        // Auto-scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    // Start player's turn (choose actions)
    startPlayerTurn() {
        if (this.battle.battleOver) {
            this.showBattleEnd();
            return;
        }
        
        this.waitingForPlayer = true;
        this.playerActions = [null, null];
        this.currentSelectingCreature = 0;
        
        this.renderBattle();
        
        // Find first alive creature to select
        while (this.currentSelectingCreature < this.battle.playerActive.length) {
            const creature = this.battle.playerActive[this.currentSelectingCreature];
            if (creature && creature.isAlive()) {
                break;
            }
            this.currentSelectingCreature++;
        }
        
        if (this.currentSelectingCreature >= this.battle.playerActive.length) {
            // No alive creatures to select (shouldn't happen)
            this.executePlayerTurn();
        } else {
            this.showActionPanel();
        }
    }

    // Show action selection panel
    showActionPanel() {
        const panel = document.getElementById('action-panel');
        const creature = this.battle.playerActive[this.currentSelectingCreature];
        
        if (!creature || !creature.isAlive()) {
            // Skip to next creature or execute turn
            this.currentSelectingCreature++;
            if (this.currentSelectingCreature >= this.battle.playerActive.length) {
                this.executePlayerTurn();
            } else {
                this.showActionPanel();
            }
            return;
        }
        
        panel.innerHTML = `
            <h3>Choose action for ${creature.name} (Slot ${this.currentSelectingCreature + 1})</h3>
            <div class="action-buttons">
                <button class="btn-action btn-fight" id="btn-fight">Fight</button>
                <button class="btn-action btn-switch" id="btn-switch">Switch</button>
            </div>
            <div id="action-details"></div>
        `;
        
        panel.style.display = 'block';
        
        document.getElementById('btn-fight').onclick = () => this.showMoveSelection(creature);
        document.getElementById('btn-switch').onclick = () => this.showSwitchSelection(creature);
    }

    // Show move selection
    showMoveSelection(creature) {
        const detailsDiv = document.getElementById('action-details');
        detailsDiv.innerHTML = '<h4>Select a move:</h4>';
        
        const movesDiv = document.createElement('div');
        movesDiv.className = 'move-selection';
        
        creature.moves.forEach((move, index) => {
            const moveBtn = document.createElement('button');
            moveBtn.className = 'move-button';
            
            // Check if move has secondary effects
            const hasSecondary = move.secondaryEffects && move.secondaryEffects.trim() !== '';
            
            moveBtn.innerHTML = `
                <div class="move-name">
                    <strong>${move.name}</strong>
                    <span class="type-badge type-${move.type.toLowerCase()}">${move.type}</span>
                </div>
                <div class="move-stats">
                    ${move.category} | Power: ${move.power} | Acc: ${move.accuracy}%
                </div>
                ${hasSecondary ? `<div class="move-secondary-tooltip">${move.secondaryEffects}</div>` : ''}
            `;
            moveBtn.onclick = () => this.selectMove(creature, index);
            movesDiv.appendChild(moveBtn);
        });
        
        detailsDiv.appendChild(movesDiv);
        
        // Add target selection for single-target moves
        const targetDiv = document.createElement('div');
        targetDiv.id = 'target-selection';
        targetDiv.style.display = 'none';
        detailsDiv.appendChild(targetDiv);
    }

    // Select a move and target
    selectMove(creature, moveIndex) {
        const move = creature.moves[moveIndex];
        
        if (move.targetingType === 'Single') {
            // Show target selection
            this.showTargetSelection(creature, moveIndex);
        } else {
            // Auto-target for non-single target moves
            const action = new BattleAction(creature, 'move', null, moveIndex);
            this.playerActions[this.currentSelectingCreature] = action;
            this.nextCreatureAction();
        }
    }

    // Show target selection
    showTargetSelection(creature, moveIndex) {
        const targetDiv = document.getElementById('target-selection');
        targetDiv.style.display = 'block';
        targetDiv.innerHTML = '<h4>Select target:</h4>';
        
        const targets = document.createElement('div');
        targets.className = 'target-selection';
        
        this.battle.opponentActive.forEach((target, index) => {
            if (target && target.isAlive()) {
                const btn = document.createElement('button');
                btn.className = 'target-button';
                btn.textContent = `${target.name} (Slot ${index + 1})`;
                btn.onclick = () => {
                    const action = new BattleAction(creature, 'move', index, moveIndex);
                    this.playerActions[this.currentSelectingCreature] = action;
                    this.nextCreatureAction();
                };
                targets.appendChild(btn);
            }
        });
        
        targetDiv.appendChild(targets);
    }

    // Show switch selection
    showSwitchSelection(creature) {
        const detailsDiv = document.getElementById('action-details');
        detailsDiv.innerHTML = '<h4>Switch to:</h4>';
        
        const switchDiv = document.createElement('div');
        switchDiv.className = 'switch-selection';
        
        this.battle.playerBench.forEach((benchCreature, index) => {
            if (benchCreature && benchCreature.isAlive()) {
                const btn = document.createElement('button');
                btn.className = 'switch-button';
                btn.innerHTML = `
                    <img src="images/${benchCreature.sprite}" alt="${benchCreature.name}">
                    <div>
                        <strong>${benchCreature.name}</strong>
                        <span>${benchCreature.currentHP}/${benchCreature.maxStats.hp} HP</span>
                    </div>
                `;
                btn.onclick = () => {
                    const action = new BattleAction(creature, 'switch', null, null, index);
                    this.playerActions[this.currentSelectingCreature] = action;
                    this.nextCreatureAction();
                };
                switchDiv.appendChild(btn);
            }
        });
        
        if (switchDiv.children.length === 0) {
            switchDiv.innerHTML = '<p>No creatures available to switch!</p>';
        }
        
        detailsDiv.appendChild(switchDiv);
    }

    // Move to next creature action selection
    nextCreatureAction() {
        this.currentSelectingCreature++;
        
        // Skip over fainted or null creatures
        while (this.currentSelectingCreature < this.battle.playerActive.length) {
            const creature = this.battle.playerActive[this.currentSelectingCreature];
            if (creature && creature.isAlive()) {
                this.showActionPanel();
                return;
            }
            this.currentSelectingCreature++;
        }
        
        // All creatures have been assigned actions
        this.executePlayerTurn();
    }

    // Execute player turn (with AI actions)
    executePlayerTurn() {
        this.waitingForPlayer = false;
        document.getElementById('action-panel').style.display = 'none';
        
        // Generate AI actions
        const opponentActions = this.generateAIActions();
        
        // Execute turn with animations
        this.executeTurnWithAnimation(this.playerActions, opponentActions);
    }

    // Execute turn with animations
    async executeTurnWithAnimation(playerActions, opponentActions) {
        // Clear message queue
        this.messageQueue = [];
        
        // Increment turn counter
        this.battle.turnNumber++;
        
        // Add turn separator to log
        this.battle.log(`=== Turn ${this.battle.turnNumber} ===`);
        
        // Process turn header
        await this.processMessageQueue();
        
        // Reset turn flags for all creatures
        [...this.battle.playerActive, ...this.battle.opponentActive].forEach(c => {
            if (c) {
                c.switchedInThisTurn = false;
                c.isProtected = false; // Protection only lasts one turn
                c.usedMovesLastTurn.clear(); // Clear last turn's moves (Shield can be used again after skipping a turn)
            }
        });
        
        // Process switches first
        this.battle.processSwitches(playerActions, opponentActions);
        await this.processMessageQueue();
        this.renderBattle();
        
        // Collect all move actions
        const allActions = [];
        
        playerActions.forEach(action => {
            if (action && action.actionType === 'move' && action.creature && action.creature.isAlive()) {
                allActions.push({ ...action, side: 'player' });
            }
        });
        
        opponentActions.forEach(action => {
            if (action && action.actionType === 'move' && action.creature && action.creature.isAlive()) {
                allActions.push({ ...action, side: 'opponent' });
            }
        });
        
        // Sort by priority then speed
        allActions.sort((a, b) => {
            const moveA = a.creature.moves[a.moveIndex];
            const moveB = b.creature.moves[b.moveIndex];
            
            // Priority first
            if (moveB.priority !== moveA.priority) {
                return moveB.priority - moveA.priority;
            }
            
            // Speed second
            const speedA = a.creature.getCurrentStat('speed');
            const speedB = b.creature.getCurrentStat('speed');
            if (speedB !== speedA) {
                return speedB - speedA;
            }
            
            // Random tiebreaker
            return Math.random() - 0.5;
        });
        
        // Execute moves one by one with message popups
        for (const action of allActions) {
            if (action.creature.isAlive()) {
                this.battle.executeMove(action);
                await this.processMessageQueue();
                this.renderBattle();
            }
        }
        
        // Handle fainting
        this.battle.handleFainting();
        await this.processMessageQueue();
        this.renderBattle();
        
        // Apply field effect healing (Nebula Veil)
        this.battle.applyEndOfTurnFieldEffects();
        await this.processMessageQueue();
        this.renderBattle();
        
        // Update field effects
        this.battle.updateFieldEffects();
        await this.processMessageQueue();
        
        // Check for battle end
        if (this.battle.checkBattleEnd()) {
            await this.processMessageQueue();
            this.showBattleEnd();
            return;
        }
        
        // Check if player needs to replace fainted creatures
        const needsReplacement = this.battle.playerActive.some((c, idx) => !c || !c.isAlive());
        if (needsReplacement) {
            await this.handlePlayerReplacements();
        } else {
            // Start next turn
            this.startNewTurn();
        }
    }
    
    // Start a new turn
    startNewTurn() {
        setTimeout(() => this.startPlayerTurn(), 500);
    }

    // Handle player replacements for fainted creatures
    async handlePlayerReplacements() {
        const emptySlots = [];
        
        // Find empty active slots
        this.battle.playerActive.forEach((creature, index) => {
            if (!creature || !creature.isAlive()) {
                emptySlots.push(index);
            }
        });
        
        // Check if there are alive bench creatures
        const aliveBench = this.battle.playerBench.filter(c => c && c.isAlive());
        
        if (emptySlots.length > 0 && aliveBench.length > 0) {
            // Need to prompt player for replacements
            this.showReplacementPanel(emptySlots[0]);
        } else {
            // No replacements needed
            this.startNewTurn();
        }
    }

    // Show replacement selection panel
    showReplacementPanel(slotIndex) {
        const panel = document.getElementById('action-panel');
        
        panel.innerHTML = `
            <h3>Choose a replacement for Slot ${slotIndex + 1}</h3>
            <div id="replacement-selection" class="switch-selection"></div>
        `;
        
        panel.style.display = 'block';
        
        const selectionDiv = document.getElementById('replacement-selection');
        
        this.battle.playerBench.forEach((benchCreature, index) => {
            if (benchCreature && benchCreature.isAlive()) {
                const btn = document.createElement('button');
                btn.className = 'switch-button';
                btn.innerHTML = `
                    <img src="images/${benchCreature.sprite}" alt="${benchCreature.name}">
                    <div>
                        <strong>${benchCreature.name}</strong>
                        <span>${benchCreature.currentHP}/${benchCreature.maxStats.hp} HP</span>
                    </div>
                `;
                btn.onclick = () => {
                    this.selectReplacement(slotIndex, index);
                };
                selectionDiv.appendChild(btn);
            }
        });
    }

    // Select replacement creature
    async selectReplacement(slotIndex, benchIndex) {
        this.battle.manualSwitchFainted(slotIndex, benchIndex);
        await this.processMessageQueue();
        this.renderBattle();
        
        document.getElementById('action-panel').style.display = 'none';
        
        await this.delay(500);
        
        // Check if there are more empty slots needing replacement
        const stillNeedsReplacement = this.battle.playerActive.some((c, idx) => !c || !c.isAlive());
        const aliveBench = this.battle.playerBench.filter(c => c && c.isAlive());
        
        if (stillNeedsReplacement && aliveBench.length > 0) {
            // Handle next replacement
            await this.handlePlayerReplacements();
        } else {
            // All replacements done or no more bench creatures, continue
            this.startNewTurn();
        }
    }

    // Delay helper for animations
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Show battle message modal
    showBattleMessage(message) {
        return new Promise((resolve) => {
            const modal = document.getElementById('battle-message-modal');
            const text = document.getElementById('battle-message-text');
            const okBtn = document.getElementById('battle-message-ok');
            
            text.textContent = message;
            modal.style.display = 'flex';
            
            okBtn.onclick = () => {
                modal.style.display = 'none';
                resolve();
            };
        });
    }

    // Process message queue
    async processMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            
            // Skip empty messages and separators
            if (message.trim() === '' || message.includes('━━━')) {
                continue;
            }
            
            await this.showBattleMessage(message);
            this.renderBattle(); // Update UI after each message
        }
    }

    // Override battle log to capture messages
    captureBattleLog() {
        const originalLog = this.battle.log.bind(this.battle);
        this.battle.log = (message) => {
            originalLog(message);
            this.messageQueue.push(message);
        };
    }

    // Generate AI actions (simple random AI)
    generateAIActions() {
        const actions = [];
        
        this.battle.opponentActive.forEach((creature, index) => {
            if (creature && creature.isAlive()) {
                // 80% chance to attack, 20% chance to switch if bench available
                const shouldSwitch = Math.random() < 0.2 && 
                    this.battle.opponentBench.some(c => c && c.isAlive());
                
                if (shouldSwitch) {
                    // Find alive bench creature
                    const benchIndex = this.battle.opponentBench.findIndex(c => c && c.isAlive());
                    actions.push(new BattleAction(creature, 'switch', null, null, benchIndex));
                } else {
                    // Random move
                    const moveIndex = Math.floor(Math.random() * creature.moves.length);
                    const move = creature.moves[moveIndex];
                    
                    let target = null;
                    if (move.targetingType === 'Single') {
                        // Random target
                        const aliveTargets = this.battle.playerActive
                            .map((c, i) => c && c.isAlive() ? i : -1)
                            .filter(i => i !== -1);
                        target = aliveTargets[Math.floor(Math.random() * aliveTargets.length)];
                    }
                    
                    actions.push(new BattleAction(creature, 'move', target, moveIndex));
                }
            } else {
                actions.push(null);
            }
        });
        
        return actions;
    }

    // Show battle end screen
    showBattleEnd() {
        // Save battle result to leaderboard
        saveBattleResult(this.battle.winner);
        
        const panel = document.getElementById('action-panel');
        panel.innerHTML = `
            <div class="battle-end">
                <h2>${this.battle.winner === 'player' ? 'Victory!' : 
                       this.battle.winner === 'opponent' ? 'Defeat!' : 'Draw!'}</h2>
                <p>${this.getBattleEndMessage()}</p>
                <button class="btn-primary" onclick="location.reload()">Return to Team Building</button>
            </div>
        `;
        panel.style.display = 'block';
    }

    // Get battle end message
    getBattleEndMessage() {
        if (this.battle.winner === 'player') {
            return 'Congratulations! You defeated the opponent!';
        } else if (this.battle.winner === 'opponent') {
            return 'Your team was defeated. Better luck next time!';
        } else {
            return 'The battle ended in a draw!';
        }
    }

    // Select player creature (for action selection)
    selectPlayerCreature(slotIndex) {
        this.currentSelectingCreature = slotIndex;
        this.showActionPanel();
    }
}

// Pre-battle selection screen
function showPreBattleSelection(playerTeam, opponentTeam) {
    document.getElementById('team-builder').style.display = 'none';
    const container = document.getElementById('pre-battle');
    container.style.display = 'block';
    
    container.innerHTML = `
        <div class="pre-battle-container">
            <h2>Pre-Battle Selection</h2>
            <p>Select 4 creatures to bring into battle. The first 2 will start active.</p>
            
            <div class="team-selection">
                <div class="selection-side">
                    <h3>Your Team</h3>
                    <div id="player-selection-grid" class="selection-grid"></div>
                    <div id="player-selected-list" class="selected-list">
                        <h4>Selected (0/4):</h4>
                        <div id="player-selected-creatures"></div>
                    </div>
                </div>
                
                <div class="selection-side">
                    <h3>Opponent's Team</h3>
                    <div id="opponent-team-display" class="team-display"></div>
                </div>
            </div>
            
            <button id="start-battle-btn" class="btn-success" disabled>Start Battle</button>
        </div>
    `;
    
    const selectedCreatures = [];
    
    // Render player's team for selection
    const playerGrid = document.getElementById('player-selection-grid');
    playerTeam.forEach((creature, index) => {
        const card = document.createElement('div');
        card.className = 'selection-card';
        card.innerHTML = `
            <img src="images/${creature.sprite}" alt="${creature.name}">
            <strong>${creature.name}</strong>
            <span class="type-badge type-${creature.type.toLowerCase()}">${creature.type}</span>
        `;
        card.onclick = () => {
            if (selectedCreatures.includes(index)) {
                // Deselect
                selectedCreatures.splice(selectedCreatures.indexOf(index), 1);
                card.classList.remove('selected');
            } else if (selectedCreatures.length < 4) {
                // Select
                selectedCreatures.push(index);
                card.classList.add('selected');
            }
            updateSelectedList();
        };
        playerGrid.appendChild(card);
    });
    
    // Show opponent's team
    const opponentDisplay = document.getElementById('opponent-team-display');
    opponentTeam.forEach(creature => {
        const card = document.createElement('div');
        card.className = 'opponent-display-card';
        card.innerHTML = `
            <img src="images/${creature.sprite}" alt="${creature.name}">
            <strong>${creature.name}</strong>
            <span class="type-badge type-${creature.type.toLowerCase()}">${creature.type}</span>
        `;
        opponentDisplay.appendChild(card);
    });
    
    function updateSelectedList() {
        const listContainer = document.getElementById('player-selected-creatures');
        listContainer.innerHTML = '';
        
        selectedCreatures.forEach(index => {
            const creature = playerTeam[index];
            const item = document.createElement('span');
            item.className = 'selected-item';
            item.textContent = creature.name;
            listContainer.appendChild(item);
        });
        
        document.querySelector('#player-selected-list h4').textContent = 
            `Selected (${selectedCreatures.length}/4):`;
        
        document.getElementById('start-battle-btn').disabled = selectedCreatures.length !== 4;
    }
    
    document.getElementById('start-battle-btn').onclick = () => {
        // Create battle teams in selected order
        const playerBattleTeam = selectedCreatures.map(i => playerTeam[i]);
        
        // AI selects 4 random creatures
        const opponentSelection = [...opponentTeam].sort(() => Math.random() - 0.5).slice(0, 4);
        
        // Start battle
        const battleUI = new BattleUI();
        battleUI.startBattle(playerBattleTeam, opponentSelection);
    };
}

// Global battle UI instance
let battleUI = null;
