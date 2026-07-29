// Card database from CSV
const cardDatabase = [
    {id: "Elemental Awakening_04.png", name: "Traplet", stage: "Stage 1", hp: 60, retreat: 1, move1Cost: "M", move1Name: "Aura Whisper", move1Damage: 10, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: null},
    {id: "Elemental Awakening_05.png", name: "Traphex", stage: "Stage 2", hp: 120, retreat: 2, move1Cost: "M", move1Name: "Lunar Glow", move1Damage: 30, move1Effect: null, move2Cost: "MM", move2Name: "Ethereal Snare", move2Damage: 50, move2Effect: "cantRetreat", prevStage: "Traplet"},
    {id: "Elemental Awakening_06.png", name: "Chimerasprout", stage: "Stage 1", hp: 60, retreat: 1, move1Cost: "M", move1Name: "Psycho Drift", move1Damage: 10, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: null},
    {id: "Elemental Awakening_07.png", name: "Chimerafluff", stage: "Stage 2", hp: 90, retreat: 1, move1Cost: "MN", move1Name: "Mental Tackle", move1Damage: 30, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: "Chimerasprout"},
    {id: "Elemental Awakening_08.png", name: "Chimereal", stage: "Stage 3", hp: 140, retreat: 3, move1Cost: "MN", move1Name: "Illusion Mist", move1Damage: 40, move1Effect: null, move2Cost: "MMMN", move2Name: "Vision Beam", move2Damage: 100, move2Effect: "discard2Energy", prevStage: "Chimerafluff"},
    {id: "Elemental Awakening_12.png", name: "Spiritfoil", stage: "Stage 1", hp: 60, retreat: 1, move1Cost: "N", move1Name: "Shade Tackle", move1Damage: 10, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: null},
    {id: "Elemental Awakening_13.png", name: "Nebulicorn", stage: "Stage 2", hp: 80, retreat: 1, move1Cost: "M", move1Name: "Nebula Howl", move1Damage: 30, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: "Spiritfoil"},
    {id: "Elemental Awakening_14.png", name: "Wraithhorn", stage: "Stage 3", hp: 90, retreat: 2, move1Cost: "MM", move1Name: "Wraith Dash", move1Damage: 50, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: "Nebulicorn"},
    {id: "Elemental Awakening_15.png", name: "Zephyrquill", stage: "Stage 1", hp: 40, retreat: 1, move1Cost: "W", move1Name: "Gale Flow", move1Damage: 30, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: null},
    {id: "Elemental Awakening_17.png", name: "Stormbud", stage: "Stage 1", hp: 30, retreat: 1, move1Cost: "W", move1Name: "Budding Wind", move1Damage: 30, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: null},
    {id: "Elemental Awakening_18.png", name: "Blossomgale", stage: "Stage 2", hp: 80, retreat: 0, move1Cost: "WW", move1Name: "Gale Strike", move1Damage: 40, move1Effect: null, move2Cost: "NNN", move2Name: "Petal Tornado", move2Damage: 90, move2Effect: "recoil20", prevStage: "Stormbud"},
    {id: "Elemental Awakening_28.png", name: "Baklavaff", stage: "Stage 1", hp: 70, retreat: 1, move1Cost: "NN", move1Name: "Honey Drizzle", move1Damage: 40, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: null},
    {id: "Elemental Awakening_29.png", name: "Galaktikreme", stage: "Stage 2", hp: 110, retreat: 1, move1Cost: "NN", move1Name: "Pastry Crunch", move1Damage: 50, move1Effect: null, move2Cost: "NNNN", move2Name: "Creamy Confection", move2Damage: 80, move2Effect: "creamyConfection", prevStage: "Baklavaff"},
    {id: "Elemental Awakening_34.png", name: "Babybara", stage: "Stage 1", hp: 60, retreat: 1, move1Cost: "N", move1Name: "Muddy Tackle", move1Damage: 20, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: null},
    {id: "Elemental Awakening_35.png", name: "Carmibara", stage: "Stage 2", hp: 80, retreat: 1, move1Cost: "N", move1Name: "Crimson Chomp", move1Damage: 30, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: "Babybara"},
    {id: "Elemental Awakening_36.png", name: "Reddybara", stage: "Stage 3", hp: 130, retreat: 2, move1Cost: "NN", move1Name: "River Rush", move1Damage: 50, move1Effect: null, move2Cost: "NNNN", move2Name: "Risky Recoil", move2Damage: 130, move2Effect: "riskyRecoil", prevStage: "Carmibara"},
    {id: "Elemental Awakening_37.png", name: "Serafini", stage: "Stage 1", hp: 30, retreat: 1, move1Cost: "N", move1Name: "Heavenly Retreat", move1Damage: 0, move1Effect: "heavenlyRetreat", move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: null},
    {id: "Elemental Awakening_38.png", name: "Serafina", stage: "Stage 2", hp: 60, retreat: 2, move1Cost: "NN", move1Name: "Serene Light", move1Damage: 30, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: "Serafini"},
    {id: "Elemental Awakening_39.png", name: "Alpakina", stage: "Stage 1", hp: 120, retreat: 2, move1Cost: "NNN", move1Name: "Energy Snatch", move1Damage: 40, move1Effect: "energySnatch", move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: null},
    {id: "Elemental Awakening_40.png", name: "Floonleef", stage: "Stage 1", hp: 60, retreat: 1, move1Cost: "N", move1Name: "Swirl", move1Damage: 20, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: null},
    {id: "Elemental Awakening_41.png", name: "Aerobloom", stage: "Stage 2", hp: 80, retreat: 1, move1Cost: "C", move1Name: "Balloon Burst", move1Damage: 40, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: "Floonleef"},
    {id: "Elemental Awakening_45.png", name: "Faeclover", stage: "Stage 1", hp: 30, retreat: 1, move1Cost: "C", move1Name: "Leaf Tickle", move1Damage: 10, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: null},
    {id: "Elemental Awakening_46.png", name: "Sunbloss", stage: "Stage 2", hp: 90, retreat: 1, move1Cost: "CCC", move1Name: "Nature's Clap", move1Damage: 60, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: "Faeclover"},
    {id: "Elemental Awakening_47.png", name: "Aloebud", stage: "Stage 1", hp: 50, retreat: 1, move1Cost: "C", move1Name: "Aloe Slash", move1Damage: 20, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: null},
    {id: "Elemental Awakening_48.png", name: "Aloeflora", stage: "Stage 2", hp: 70, retreat: 1, move1Cost: "C", move1Name: "Vera Tackle", move1Damage: 40, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: "Aloebud"},
    {id: "Elemental Awakening_49.png", name: "Aloetide", stage: "Stage 3", hp: 90, retreat: 3, move1Cost: "CCC", move1Name: "Healing Sap", move1Damage: 50, move1Effect: "healingSap", move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: "Aloeflora"},
    {id: "Elemental Awakening_52.png", name: "Voltveil", stage: "Stage 1", hp: 80, retreat: 2, move1Cost: "NN", move1Name: "Iron Spin", move1Damage: 40, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: null},
    {id: "Elemental Awakening_53.png", name: "Byteblade", stage: "Stage 1", hp: 90, retreat: 3, move1Cost: "KKK", move1Name: "Shadow Byte", move1Damage: 60, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: null},
    {id: "Elemental Awakening_59.png", name: "Ponimetal", stage: "Stage 1", hp: 70, retreat: 1, move1Cost: "N", move1Name: "Iron Tail Whip", move1Damage: 10, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: null},
    {id: "Elemental Awakening_60.png", name: "Equinix", stage: "Stage 2", hp: 90, retreat: 1, move1Cost: "N", move1Name: "Titan Kick", move1Damage: 20, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: "Ponimetal"},
    {id: "Elemental Awakening_61.png", name: "Equinox", stage: "Stage 3", hp: 110, retreat: 3, move1Cost: "KNN", move1Name: "Metal Burst", move1Damage: 60, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: "Equinix"},
    {id: "Elemental Awakening_63.png", name: "Aeglet", stage: "Stage 1", hp: 60, retreat: 3, move1Cost: "KK", move1Name: "Metalic Buzz", move1Damage: 30, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: null},
    {id: "Elemental Awakening_64.png", name: "Aegiscelis", stage: "Stage 2", hp: 130, retreat: 3, move1Cost: "KK", move1Name: "Guardian Glow", move1Damage: 50, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: "Aeglet"},
    {id: "Elemental Awakening_65.png", name: "Potion", stage: "Item", hp: 0, retreat: 0, move1Cost: null, move1Name: null, move1Damage: null, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: null},
    {id: "Elemental Awakening_66.png", name: "Card Draw", stage: "Item", hp: 0, retreat: 0, move1Cost: null, move1Name: null, move1Damage: null, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: null},
    {id: "Elemental Awakening_67.png", name: "Booster", stage: "Item", hp: 0, retreat: 0, move1Cost: null, move1Name: null, move1Damage: null, move1Effect: null, move2Cost: null, move2Name: null, move2Damage: null, move2Effect: null, prevStage: null}
];

// Deck definitions
const deckTemplates = [
    {
        name: "Mystic Deck",
        cards: [
            "Elemental Awakening_04.png", "Elemental Awakening_04.png",
            "Elemental Awakening_05.png", "Elemental Awakening_05.png",
            "Elemental Awakening_06.png", "Elemental Awakening_06.png",
            "Elemental Awakening_07.png", "Elemental Awakening_07.png",
            "Elemental Awakening_08.png", "Elemental Awakening_08.png",
            "Elemental Awakening_12.png", "Elemental Awakening_12.png",
            "Elemental Awakening_13.png", "Elemental Awakening_13.png",
            "Elemental Awakening_14.png", "Elemental Awakening_14.png",
            "Elemental Awakening_65.png", "Elemental Awakening_65.png",
            "Elemental Awakening_66.png",
            "Elemental Awakening_67.png"
        ]
    },
    {
        name: "Wind Deck",
        cards: [
            "Elemental Awakening_15.png", "Elemental Awakening_15.png",
            "Elemental Awakening_17.png", "Elemental Awakening_17.png",
            "Elemental Awakening_18.png", "Elemental Awakening_18.png",
            "Elemental Awakening_28.png", "Elemental Awakening_28.png",
            "Elemental Awakening_29.png", "Elemental Awakening_29.png",
            "Elemental Awakening_34.png", "Elemental Awakening_34.png",
            "Elemental Awakening_35.png", "Elemental Awakening_35.png",
            "Elemental Awakening_36.png", "Elemental Awakening_36.png",
            "Elemental Awakening_65.png",
            "Elemental Awakening_66.png", "Elemental Awakening_66.png",
            "Elemental Awakening_67.png"
        ]
    },
    {
        name: "Celestial Deck",
        cards: [
            "Elemental Awakening_39.png",
            "Elemental Awakening_40.png", "Elemental Awakening_40.png",
            "Elemental Awakening_41.png", "Elemental Awakening_41.png",
            "Elemental Awakening_45.png", "Elemental Awakening_45.png",
            "Elemental Awakening_46.png", "Elemental Awakening_46.png",
            "Elemental Awakening_47.png", "Elemental Awakening_47.png",
            "Elemental Awakening_48.png", "Elemental Awakening_48.png",
            "Elemental Awakening_49.png", "Elemental Awakening_49.png",
            "Elemental Awakening_65.png", "Elemental Awakening_65.png",
            "Elemental Awakening_66.png",
            "Elemental Awakening_67.png", "Elemental Awakening_67.png"
        ]
    },
    {
        name: "Mechanic Deck",
        cards: [
            "Elemental Awakening_37.png",
            "Elemental Awakening_38.png",
            "Elemental Awakening_52.png", "Elemental Awakening_52.png",
            "Elemental Awakening_53.png", "Elemental Awakening_53.png",
            "Elemental Awakening_59.png", "Elemental Awakening_59.png",
            "Elemental Awakening_60.png", "Elemental Awakening_60.png",
            "Elemental Awakening_61.png", "Elemental Awakening_61.png",
            "Elemental Awakening_63.png", "Elemental Awakening_63.png",
            "Elemental Awakening_64.png", "Elemental Awakening_64.png",
            "Elemental Awakening_65.png",
            "Elemental Awakening_66.png", "Elemental Awakening_66.png",
            "Elemental Awakening_67.png"
        ]
    }
];

// Game state
const gameState = {
    player: {
        deck: [],
        hand: [],
        active: null,
        bench: [null, null, null],
        points: 0,
        energyAttachedThisTurn: false,
        hasAttacked: false,
        itemUsedThisTurn: false,
        discardPile: [],
        selectedDeck: null,
        boosterActive: false
    },
    opponent: {
        deck: [],
        hand: [],
        active: null,
        bench: [null, null, null],
        points: 0,
        energyAttachedThisTurn: false,
        hasAttacked: false,
        itemUsedThisTurn: false,
        discardPile: [],
        selectedDeck: null,
        boosterActive: false
    },
    currentTurn: null, // 'player' or 'opponent'
    turnNumber: 0,
    phase: 'deckSelection', // 'deckSelection', 'setup', 'playing', 'gameOver'
    selectedCard: null,
    selectedSlot: null,
    waitingForSelection: false,
    setupReady: {player: false, opponent: false}
};

// Track which cards were played/evolved this turn
const turnTracker = {
    playedThisTurn: new Set(),
    evolvedThisTurn: new Set()
};

// Initialize the game
function initGame() {
    setupEventListeners();
    showDeckSelection();
}

// Create decks with specified cards
function createDecks() {
    const playerDeck = deckTemplates[gameState.player.selectedDeck];
    const opponentDeck = deckTemplates[gameState.opponent.selectedDeck];
    
    gameState.player.deck = shuffleDeck([...playerDeck.cards]);
    gameState.opponent.deck = shuffleDeck([...opponentDeck.cards]);
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// Draw initial hands (ensure at least 1 Stage 1 card)
function drawInitialHands() {
    let validHand = false;
    while (!validHand) {
        gameState.player.hand = [];
        for (let i = 0; i < 5; i++) {
            const cardId = gameState.player.deck.pop();
            const cardData = getCardData(cardId);
            gameState.player.hand.push({id: cardId, data: cardData, energy: 0, damage: 0, cantRetreat: false});
        }
        validHand = gameState.player.hand.some(card => card.data.stage === "Stage 1");
    }

    validHand = false;
    while (!validHand) {
        gameState.opponent.hand = [];
        for (let i = 0; i < 5; i++) {
            const cardId = gameState.opponent.deck.pop();
            const cardData = getCardData(cardId);
            gameState.opponent.hand.push({id: cardId, data: cardData, energy: 0, damage: 0, cantRetreat: false});
        }
        validHand = gameState.opponent.hand.some(card => card.data.stage === "Stage 1");
    }
}

function getCardData(cardId) {
    return cardDatabase.find(card => card.id === cardId);
}

// Deck Selection Functions
function showDeckSelection() {
    const deckList = document.getElementById('deck-list');
    deckList.innerHTML = '';
    
    deckTemplates.forEach((deckTemplate, index) => {
        const deckOption = document.createElement('div');
        deckOption.className = 'deck-option';
        
        deckOption.innerHTML = `
            <h2>${deckTemplate.name}</h2>
            <p>20 Cards</p>
            <p style="margin-top: 10px; font-size: 14px;">Click to preview</p>
        `;
        
        deckOption.addEventListener('click', () => showDeckPreview(index));
        deckList.appendChild(deckOption);
    });
}

function showDeckPreview(deckIndex) {
    const deckTemplate = deckTemplates[deckIndex];
    const modal = document.getElementById('deck-preview-modal');
    const title = document.getElementById('deck-preview-title');
    const cardsDiv = document.getElementById('deck-preview-cards');
    const selectBtn = document.getElementById('select-deck-btn');
    
    title.textContent = deckTemplate.name;
    cardsDiv.innerHTML = '';
    
    // Count unique cards
    const cardCounts = {};
    deckTemplate.cards.forEach(cardId => {
        cardCounts[cardId] = (cardCounts[cardId] || 0) + 1;
    });
    
    // Get unique card IDs and sort by ID number
    const uniqueCards = Object.keys(cardCounts).sort((a, b) => {
        // Extract number from ID (e.g., "Elemental Awakening_04.png" -> 4)
        const numA = parseInt(a.match(/\d+/)[0]);
        const numB = parseInt(b.match(/\d+/)[0]);
        return numA - numB;
    });
    
    // Display each unique card
    uniqueCards.forEach(cardId => {
        const cardData = getCardData(cardId);
        const count = cardCounts[cardId];
        
        const previewItem = document.createElement('div');
        previewItem.className = 'deck-preview-item';
        
        const img = document.createElement('img');
        img.src = `cards/${cardId}`;
        img.alt = cardData.name;
        
        // Add hover zoom
        img.addEventListener('mouseenter', () => showCardZoom(cardId));
        img.addEventListener('mouseleave', hideCardZoom);
        
        const countDiv = document.createElement('div');
        countDiv.className = 'card-count';
        countDiv.textContent = `× ${count}`;
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'card-name';
        nameDiv.textContent = cardData.name;
        
        previewItem.appendChild(img);
        previewItem.appendChild(countDiv);
        previewItem.appendChild(nameDiv);
        cardsDiv.appendChild(previewItem);
    });
    
    selectBtn.onclick = () => selectDeck(deckIndex);
    modal.style.display = 'flex';
}

function closeDeckPreview() {
    document.getElementById('deck-preview-modal').style.display = 'none';
}

function selectDeck(deckIndex) {
    gameState.player.selectedDeck = deckIndex;
    
    // AI randomly selects a deck
    gameState.opponent.selectedDeck = Math.floor(Math.random() * deckTemplates.length);
    
    closeDeckPreview();
    
    // Hide deck selection, show game screen
    document.getElementById('deck-selection').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    
    gameState.phase = 'setup';
    createDecks();
    drawInitialHands();
    renderGame();
}

window.closeDeckPreview = closeDeckPreview;

// Setup event listeners
function setupEventListeners() {
    document.getElementById('done-btn').addEventListener('click', handleDone);
    document.getElementById('energy-btn').addEventListener('click', handleEnergyButton);
    document.getElementById('attack-btn').addEventListener('click', () => handleAttack(1));
    document.getElementById('attack2-btn').addEventListener('click', () => handleAttack(2));
    document.getElementById('retreat-btn').addEventListener('click', handleRetreatButton);
    document.getElementById('player-discard-btn').addEventListener('click', () => showDiscardPile('player'));
    document.getElementById('opponent-discard-btn').addEventListener('click', () => showDiscardPile('opponent'));
    document.getElementById('new-game-btn').addEventListener('click', resetAndStartNewGame);
}

// Render the game
function renderGame() {
    updateDeckCounts();
    updatePoints();
    updateTurnIndicator();
    renderHand('player');
    renderHand('opponent');
    renderBoard('player');
    renderBoard('opponent');
    updateActionButtons();
}

function updateDeckCounts() {
    document.getElementById('player-deck-count').textContent = gameState.player.deck.length;
    document.getElementById('opponent-deck-count').textContent = gameState.opponent.deck.length;
    document.getElementById('player-discard-btn').textContent = `Your Discard Pile (${gameState.player.discardPile.length})`;
    document.getElementById('opponent-discard-btn').textContent = `Opponent's Discard Pile (${gameState.opponent.discardPile.length})`;
}

function updatePoints() {
    document.getElementById('player-points').textContent = gameState.player.points;
    document.getElementById('opponent-points').textContent = gameState.opponent.points;
}

function updateTurnIndicator() {
    const indicator = document.getElementById('turn-indicator');
    const turnNum = document.getElementById('turn-number');
    
    turnNum.textContent = gameState.turnNumber;
    
    if (gameState.phase === 'setup') {
        indicator.textContent = 'Setup Phase - Place your active creature';
    } else if (gameState.phase === 'gameOver') {
        indicator.textContent = 'Game Over!';
    } else {
        indicator.textContent = gameState.currentTurn === 'player' ? 'Your Turn' : "Opponent's Turn";
    }
}

function renderHand(player) {
    const hand = gameState[player].hand;
    const handElement = document.getElementById(`${player}-hand`);
    handElement.innerHTML = '';

    if (player === 'opponent') {
        // Show card backs for opponent
        hand.forEach(() => {
            const cardBack = document.createElement('div');
            cardBack.className = 'card-back';
            cardBack.textContent = 'Card';
            handElement.appendChild(cardBack);
        });
    } else {
        // Show actual cards for player
        hand.forEach((card, index) => {
            const cardElement = createCardElement(card, player, 'hand', index);
            handElement.appendChild(cardElement);
        });
    }
}

function renderBoard(player) {
    // Render active card
    const activeSlot = document.querySelector(`.active-slot[data-player="${player}"]`);
    activeSlot.innerHTML = '';
    if (gameState[player].active) {
        const cardElement = createCardElement(gameState[player].active, player, 'active');
        activeSlot.appendChild(cardElement);
    }

    // Render bench
    gameState[player].bench.forEach((card, index) => {
        const benchSlot = document.querySelector(`.bench-slot[data-player="${player}"][data-slot="${index}"]`);
        benchSlot.innerHTML = '';
        if (card) {
            const cardElement = createCardElement(card, player, 'bench', index);
            benchSlot.appendChild(cardElement);
        }
    });
}

function createCardElement(card, player, location, index = null) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'game-card';
    
    const img = document.createElement('img');
    img.src = `cards/${card.id}`;
    img.alt = card.data.name;
    cardDiv.appendChild(img);

    // Add energy indicators
    if (card.energy > 0 && card.data.stage !== "Item") {
        const energyDiv = document.createElement('div');
        energyDiv.className = 'energy-indicators';
        for (let i = 0; i < card.energy; i++) {
            const energyIcon = document.createElement('div');
            energyIcon.className = 'energy-icon';
            energyDiv.appendChild(energyIcon);
        }
        cardDiv.appendChild(energyDiv);
    }

    // Add damage indicator
    if (card.damage > 0 && card.data.stage !== "Item") {
        const damageDiv = document.createElement('div');
        damageDiv.className = 'damage-indicator';
        damageDiv.textContent = card.damage;
        cardDiv.appendChild(damageDiv);
    }

    // Add HP display
    if (card.data.stage !== "Item") {
        const statsDiv = document.createElement('div');
        statsDiv.className = 'card-stats';
        const currentHp = card.data.hp - card.damage;
        statsDiv.innerHTML = `<span>HP: ${currentHp}/${card.data.hp}</span>`;
        cardDiv.appendChild(statsDiv);
    }

    // Add hover zoom effect
    cardDiv.addEventListener('mouseenter', () => showCardZoom(card.id));
    cardDiv.addEventListener('mouseleave', hideCardZoom);

    // Add click handlers
    if (player === 'player') {
        if (location === 'hand') {
            cardDiv.addEventListener('click', () => handleCardClick(card, index));
        } else if (location === 'bench' || location === 'active') {
            cardDiv.addEventListener('click', () => handleBoardCardClick(card, location, index));
        }
    }

    return cardDiv;
}

function showCardZoom(cardId) {
    const zoom = document.getElementById('card-zoom');
    const img = document.getElementById('zoom-image');
    img.src = `cards/${cardId}`;
    zoom.style.display = 'block';
}

function hideCardZoom() {
    document.getElementById('card-zoom').style.display = 'none';
}

// Discard pile functions
function showDiscardPile(player) {
    const modal = document.getElementById('discard-modal');
    const title = document.getElementById('discard-title');
    const cardsDiv = document.getElementById('discard-cards');
    
    title.textContent = player === 'player' ? 'Your Discard Pile' : "Opponent's Discard Pile";
    cardsDiv.innerHTML = '';
    
    if (gameState[player].discardPile.length === 0) {
        cardsDiv.innerHTML = '<p style="color: #fff; padding: 20px;">No cards in discard pile</p>';
    } else {
        gameState[player].discardPile.forEach(card => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'modal-card';
            
            const img = document.createElement('img');
            img.src = `cards/${card.id}`;
            img.alt = card.data.name;
            cardDiv.appendChild(img);
            
            // Add hover zoom
            cardDiv.addEventListener('mouseenter', () => showCardZoom(card.id));
            cardDiv.addEventListener('mouseleave', hideCardZoom);
            
            cardsDiv.appendChild(cardDiv);
        });
    }
    
    modal.style.display = 'flex';
}

function closeDiscardModal() {
    document.getElementById('discard-modal').style.display = 'none';
}

// Flash item card for opponent
function flashItemCard(cardId, callback) {
    const flash = document.getElementById('item-flash');
    const img = document.getElementById('flash-image');
    
    img.src = `cards/${cardId}`;
    flash.style.display = 'flex';
    
    setTimeout(() => {
        flash.style.display = 'none';
        if (callback) callback();
    }, 1500);
}

// Make closeDiscardModal available globally
window.closeDiscardModal = closeDiscardModal;

// Handle card click from hand
function handleCardClick(card, handIndex) {
    // Block all actions if game is over
    if (gameState.phase === 'gameOver') return;
    
    if (gameState.phase === 'setup') {
        handleSetupCardClick(card, handIndex);
    } else if (gameState.currentTurn === 'player' && !gameState.player.hasAttacked) {
        handlePlayCardClick(card, handIndex);
    }
}

function handleSetupCardClick(card, handIndex) {
    // Only allow Stage 1 cards during setup
    if (card.data.stage !== "Stage 1") {
        alert("You can only place Stage 1 creatures during setup!");
        return;
    }

    gameState.selectedCard = {card, handIndex};
    
    // If no active creature, force selection of active slot first
    if (!gameState.player.active) {
        document.querySelector('.active-slot[data-player="player"]').classList.add('can-place');
        // Only allow active slot
        const activeSlot = document.querySelector('.active-slot[data-player="player"]');
        activeSlot.addEventListener('click', handleSlotClick, {once: true});
    } else {
        // Active exists, can place on bench
        gameState.player.bench.forEach((slot, index) => {
            if (!slot) {
                document.querySelector(`.bench-slot[data-player="player"][data-slot="${index}"]`).classList.add('can-place');
            }
        });
        
        // Add click handlers to bench slots only
        document.querySelectorAll('.bench-slot.can-place').forEach(slot => {
            slot.addEventListener('click', handleSlotClick, {once: true});
        });
    }
}

function handleSlotClick(e) {
    const slot = e.currentTarget;
    const player = slot.dataset.player;
    
    if (player !== 'player') return;

    // Remove highlights
    document.querySelectorAll('.can-place').forEach(s => s.classList.remove('can-place'));

    if (!gameState.selectedCard) return;

    const {card, handIndex} = gameState.selectedCard;

    // Place card
    if (slot.classList.contains('active-slot')) {
        gameState.player.active = card;
        gameState.player.hand.splice(handIndex, 1);
    } else if (slot.classList.contains('bench-slot')) {
        const benchIndex = parseInt(slot.dataset.slot);
        gameState.player.bench[benchIndex] = card;
        gameState.player.hand.splice(handIndex, 1);
        turnTracker.playedThisTurn.add(card);
    }

    gameState.selectedCard = null;
    renderGame();
    checkSetupComplete();
}

function checkSetupComplete() {
    if (gameState.player.active && !gameState.setupReady.player) {
        gameState.setupReady.player = true;
    }

    // AI setup
    if (!gameState.setupReady.opponent && !gameState.opponent.active) {
        aiSetup();
    }

    // Don't auto-start - wait for player to click Done
}

function aiSetup() {
    // Find all Stage 1 cards
    const stage1Cards = gameState.opponent.hand.filter(card => card.data.stage === "Stage 1");
    
    if (stage1Cards.length === 0) return;

    // Place first Stage 1 as active
    const activeCard = stage1Cards[0];
    const activeIndex = gameState.opponent.hand.indexOf(activeCard);
    gameState.opponent.active = activeCard;
    gameState.opponent.hand.splice(activeIndex, 1);

    // Place remaining Stage 1 cards on bench
    const remainingStage1 = gameState.opponent.hand.filter(card => card.data.stage === "Stage 1");
    remainingStage1.forEach((card, i) => {
        if (i < 3) {
            const handIndex = gameState.opponent.hand.indexOf(card);
            gameState.opponent.bench[i] = card;
            gameState.opponent.hand.splice(handIndex, 1);
        }
    });

    gameState.setupReady.opponent = true;
    renderGame();
}

function startGame() {
    gameState.phase = 'playing';
    gameState.turnNumber = 0; // Start at 0, will increment to 1 when first turn starts
    gameState.currentTurn = Math.random() < 0.5 ? 'player' : 'opponent';
    
    // Clear turn tracker
    turnTracker.playedThisTurn.clear();
    turnTracker.evolvedThisTurn.clear();
    
    // Increment turn counter for first turn
    gameState.turnNumber++;
    
    renderGame();
    
    if (gameState.currentTurn === 'opponent') {
        setTimeout(aiTurn, 1000);
    }
}

// Handle playing cards during game
function handlePlayCardClick(card, handIndex) {
    if (card.data.stage === "Item") {
        // Check if item already used this turn
        if (gameState.player.itemUsedThisTurn) {
            alert("You can only use one item card per turn!");
            return;
        }
        useItemCard(card, handIndex);
    } else if (card.data.stage === "Stage 1") {
        // Can only place on empty bench slots
        gameState.selectedCard = {card, handIndex, type: 'place'};
        highlightEmptyBenchSlots('player');
    } else {
        // Evolution card - check if turn is >= 3
        if (gameState.turnNumber < 3) {
            alert("You cannot evolve creatures until turn 3!");
            return;
        }
        gameState.selectedCard = {card, handIndex, type: 'evolve'};
        highlightEvolvableCards('player');
    }
}

function highlightEmptyBenchSlots(player) {
    gameState[player].bench.forEach((slot, index) => {
        if (!slot) {
            const slotElement = document.querySelector(`.bench-slot[data-player="${player}"][data-slot="${index}"]`);
            slotElement.classList.add('can-place');
            slotElement.addEventListener('click', placeBenchCard, {once: true});
        }
    });
}

function placeBenchCard(e) {
    const slot = e.currentTarget;
    const benchIndex = parseInt(slot.dataset.slot);
    
    document.querySelectorAll('.can-place').forEach(s => s.classList.remove('can-place'));
    
    if (!gameState.selectedCard) return;

    const {card, handIndex} = gameState.selectedCard;
    gameState.player.bench[benchIndex] = card;
    gameState.player.hand.splice(handIndex, 1);
    turnTracker.playedThisTurn.add(card);
    
    gameState.selectedCard = null;
    renderGame();
}

function highlightEvolvableCards(player) {
    // Check active card
    if (gameState[player].active && canEvolve(gameState[player].active, gameState.selectedCard.card)) {
        const activeSlot = document.querySelector(`.active-slot[data-player="${player}"]`);
        activeSlot.classList.add('can-select');
        activeSlot.addEventListener('click', () => evolveCard(player, 'active', null), {once: true});
    }
    
    // Check bench
    gameState[player].bench.forEach((card, index) => {
        if (card && canEvolve(card, gameState.selectedCard.card)) {
            const benchSlot = document.querySelector(`.bench-slot[data-player="${player}"][data-slot="${index}"]`);
            benchSlot.classList.add('can-select');
            benchSlot.addEventListener('click', () => evolveCard(player, 'bench', index), {once: true});
        }
    });
}

function canEvolve(targetCard, evolutionCard) {
    // Check if evolution card's prevStage matches target card's name
    if (evolutionCard.data.prevStage !== targetCard.data.name) return false;
    
    // Can't evolve if target was played or evolved this turn
    if (turnTracker.playedThisTurn.has(targetCard) || turnTracker.evolvedThisTurn.has(targetCard)) {
        return false;
    }
    
    return true;
}

function evolveCard(player, location, index) {
    document.querySelectorAll('.can-select').forEach(s => s.classList.remove('can-select'));
    
    if (!gameState.selectedCard) return;

    const {card, handIndex} = gameState.selectedCard;
    let targetCard;
    
    if (location === 'active') {
        targetCard = gameState[player].active;
    } else {
        targetCard = gameState[player].bench[index];
    }

    // Transfer damage and energy
    card.damage = targetCard.damage;
    card.energy = targetCard.energy;
    
    // Replace the card
    if (location === 'active') {
        gameState[player].active = card;
    } else {
        gameState[player].bench[index] = card;
    }
    
    // Remove from hand
    gameState[player].hand.splice(handIndex, 1);
    
    // Mark as evolved this turn
    turnTracker.evolvedThisTurn.add(card);
    
    gameState.selectedCard = null;
    renderGame();
}

// Item cards
function useItemCard(card, handIndex) {
    if (card.data.name === "Potion") {
        usePotionCard(handIndex);
    } else if (card.data.name === "Card Draw") {
        useCardDrawCard(handIndex);
    } else if (card.data.name === "Booster") {
        useBoosterCard(handIndex);
    }
}

function usePotionCard(handIndex) {
    gameState.selectedCard = {handIndex, type: 'potion'};
    
    // Highlight damaged creatures
    if (gameState.player.active && gameState.player.active.damage > 0) {
        const activeSlot = document.querySelector('.active-slot[data-player="player"]');
        activeSlot.classList.add('can-select');
        activeSlot.addEventListener('click', () => healCard('player', 'active', null), {once: true});
    }
    
    gameState.player.bench.forEach((card, index) => {
        if (card && card.damage > 0) {
            const benchSlot = document.querySelector(`.bench-slot[data-player="player"][data-slot="${index}"]`);
            benchSlot.classList.add('can-select');
            benchSlot.addEventListener('click', () => healCard('player', 'bench', index), {once: true});
        }
    });
}

function healCard(player, location, index) {
    document.querySelectorAll('.can-select').forEach(s => s.classList.remove('can-select'));
    
    let card;
    if (location === 'active') {
        card = gameState[player].active;
    } else {
        card = gameState[player].bench[index];
    }
    
    card.damage = Math.max(0, card.damage - 20);
    
    // Add to discard pile
    const usedCard = gameState.player.hand[gameState.selectedCard.handIndex];
    gameState.player.discardPile.push(usedCard);
    
    // Remove potion from hand
    gameState.player.hand.splice(gameState.selectedCard.handIndex, 1);
    gameState.selectedCard = null;
    
    // Mark item as used
    gameState.player.itemUsedThisTurn = true;
    
    renderGame();
}

function useCardDrawCard(handIndex) {
    // Add to discard pile
    const usedCard = gameState.player.hand[handIndex];
    gameState.player.discardPile.push(usedCard);
    
    // Draw 2 cards
    drawCards('player', 2);
    
    // Remove card from hand
    gameState.player.hand.splice(handIndex, 1);
    
    // Mark item as used
    gameState.player.itemUsedThisTurn = true;
    
    renderGame();
}

function useBoosterCard(handIndex) {
    // Add to discard pile
    const usedCard = gameState.player.hand[handIndex];
    gameState.player.discardPile.push(usedCard);
    
    gameState.player.boosterActive = true;
    
    // Remove card from hand
    gameState.player.hand.splice(handIndex, 1);
    
    // Mark item as used
    gameState.player.itemUsedThisTurn = true;
    
    renderGame();
    alert("Booster activated! Your next attack will deal +20 damage.");
}

// Handle board card clicks (for energy attachment)
function handleBoardCardClick(card, location, index) {
    // Block if game is over
    if (gameState.phase === 'gameOver') return;
    
    if (gameState.waitingForSelection === 'energy') {
        attachEnergy('player', location, index);
    }
}

// Energy system
function handleEnergyButton() {
    if (gameState.player.energyAttachedThisTurn) return;
    
    // Can't attach energy during setup
    if (gameState.phase === 'setup') {
        alert("You cannot attach energy during setup!");
        return;
    }
    
    gameState.waitingForSelection = 'energy';
    
    // Highlight all creatures in play
    if (gameState.player.active) {
        const activeSlot = document.querySelector('.active-slot[data-player="player"]');
        activeSlot.classList.add('can-select');
    }
    
    gameState.player.bench.forEach((card, index) => {
        if (card) {
            const benchSlot = document.querySelector(`.bench-slot[data-player="player"][data-slot="${index}"]`);
            benchSlot.classList.add('can-select');
        }
    });
}

function attachEnergy(player, location, index) {
    document.querySelectorAll('.can-select').forEach(s => s.classList.remove('can-select'));
    
    let card;
    if (location === 'active') {
        card = gameState[player].active;
    } else {
        card = gameState[player].bench[index];
    }
    
    card.energy++;
    gameState[player].energyAttachedThisTurn = true;
    gameState.waitingForSelection = null;
    
    renderGame();
}

// Attack system
function handleAttack(moveNumber) {
    const attacker = gameState.player.active;
    const defender = gameState.opponent.active;
    
    if (!attacker || !defender) return;
    
    // Check if can attack (has enough energy)
    const moveCost = moveNumber === 1 ? attacker.data.move1Cost : attacker.data.move2Cost;
    if (!moveCost || attacker.energy < moveCost.length) {
        alert("Not enough energy to attack!");
        return;
    }
    
    let damage = moveNumber === 1 ? attacker.data.move1Damage : attacker.data.move2Damage;
    const effect = moveNumber === 1 ? attacker.data.move1Effect : attacker.data.move2Effect;
    
    // Apply booster
    if (gameState.player.boosterActive) {
        damage += 20;
        gameState.player.boosterActive = false;
    }
    
    // Apply base damage to defender
    defender.damage += damage;
    
    gameState.player.hasAttacked = true;
    renderGame();
    
    // Check if defender is knocked out by base damage
    const defenderKnockedOut = defender.damage >= defender.data.hp;
    
    if (defenderKnockedOut) {
        // Apply effect first (if any), then handle knockout
        if (effect) {
            handleMoveEffectBeforeKnockout(effect, attacker, 'player', () => {
                knockoutCreature('opponent');
            });
        } else {
            // No effect, just handle knockout
            knockoutCreature('opponent');
        }
    } else {
        // Defender survives, handle all effects normally
        handleMoveEffect(effect, attacker, defender, 'player');
    }
}

// Coin flip utility
function flipCoin() {
    return Math.random() < 0.5 ? 'heads' : 'tails';
}

// Handle attacker-only effects before knockout (when defender is already knocked out by base damage)
function handleMoveEffectBeforeKnockout(effect, attacker, attackingPlayer, callback) {
    if (!effect) {
        callback();
        return;
    }
    
    const opponent = attackingPlayer === 'player' ? 'opponent' : 'player';
    
    switch(effect) {
        case 'cantRetreat':
            // Ethereal Snare - defender can't retreat, but defender is knocked out so skip this
            setTimeout(() => {
                alert("Defender was knocked out!");
                callback();
            }, 500);
            break;
            
        case 'discard2Energy':
            // Vision Beam - attacker loses 2 energy
            attacker.energy = Math.max(0, attacker.energy - 2);
            setTimeout(() => {
                alert(`${attacker.data.name} discarded 2 energy!`);
                renderGame();
                callback();
            }, 500);
            break;
            
        case 'recoil20':
            // Petal Tornado - 20 damage to self
            attacker.damage += 20;
            setTimeout(() => {
                alert(`${attacker.data.name} took 20 recoil damage!`);
                renderGame();
                // Check if attacker knocked itself out
                if (attacker.damage >= attacker.data.hp) {
                    knockoutCreature(attackingPlayer);
                } else {
                    callback();
                }
            }, 500);
            break;
            
        case 'creamyConfection':
            // Creamy Confection - coin flip for energy attach or discard
            setTimeout(() => {
                const result = flipCoin();
                if (result === 'heads') {
                    // Attach energy to random bench
                    const bench = gameState[attackingPlayer].bench.filter(c => c !== null);
                    if (bench.length > 0) {
                        const randomBench = bench[Math.floor(Math.random() * bench.length)];
                        randomBench.energy++;
                        alert(`Coin flip: HEADS! Attached 1 energy to ${randomBench.data.name} on bench!`);
                    } else {
                        alert(`Coin flip: HEADS! But no bench creatures to attach energy to.`);
                    }
                } else {
                    // Discard 2 energy
                    attacker.energy = Math.max(0, attacker.energy - 2);
                    alert(`Coin flip: TAILS! ${attacker.data.name} discarded 2 energy!`);
                }
                renderGame();
                callback();
            }, 500);
            break;
            
        case 'riskyRecoil':
            // Risky Recoil - coin flip for random friendly damage
            setTimeout(() => {
                const result = flipCoin();
                if (result === 'tails') {
                    // Damage random friendly creature
                    const allFriendly = [gameState[attackingPlayer].active, ...gameState[attackingPlayer].bench].filter(c => c !== null);
                    if (allFriendly.length > 0) {
                        const randomTarget = allFriendly[Math.floor(Math.random() * allFriendly.length)];
                        randomTarget.damage += 50;
                        alert(`Coin flip: TAILS! ${randomTarget.data.name} took 50 damage!`);
                        renderGame();
                        // Check if that creature was knocked out
                        if (randomTarget.damage >= randomTarget.data.hp) {
                            if (randomTarget === gameState[attackingPlayer].active) {
                                knockoutCreature(attackingPlayer);
                            } else {
                                // Bench creature knocked out - remove it
                                const benchIndex = gameState[attackingPlayer].bench.indexOf(randomTarget);
                                if (benchIndex !== -1) {
                                    gameState[attackingPlayer].discardPile.push(randomTarget);
                                    gameState[attackingPlayer].bench[benchIndex] = null;
                                }
                                callback();
                            }
                        } else {
                            callback();
                        }
                    } else {
                        alert(`Coin flip: TAILS! But no creatures to damage.`);
                        callback();
                    }
                } else {
                    alert(`Coin flip: HEADS! No recoil damage.`);
                    callback();
                }
            }, 500);
            break;
            
        case 'heavenlyRetreat':
            // Heavenly Retreat - free swap (but defender is knocked out, so probably won't happen)
            const bench = gameState[attackingPlayer].bench.filter(c => c !== null);
            if (bench.length > 0) {
                showBenchSelectionModal(attackingPlayer, 'heavenlyRetreat');
                // Note: endTurn is called in the modal handler
            } else {
                alert("No bench creatures to swap with!");
                callback();
            }
            break;
            
        case 'energySnatch':
            // Energy Snatch - coin flip to remove opponent energy
            setTimeout(() => {
                const result = flipCoin();
                if (result === 'heads') {
                    const allOpponent = [gameState[opponent].active, ...gameState[opponent].bench].filter(c => c !== null && c.energy > 0);
                    if (allOpponent.length > 0) {
                        const randomTarget = allOpponent[Math.floor(Math.random() * allOpponent.length)];
                        randomTarget.energy--;
                        alert(`Coin flip: HEADS! Removed 1 energy from ${randomTarget.data.name}!`);
                    } else {
                        alert(`Coin flip: HEADS! But no opponent creatures with energy.`);
                    }
                } else {
                    alert(`Coin flip: TAILS! No energy removed.`);
                }
                renderGame();
                callback();
            }, 500);
            break;
            
        case 'healingSap':
            // Healing Sap - heal attacker 20 HP
            attacker.damage = Math.max(0, attacker.damage - 20);
            setTimeout(() => {
                alert(`${attacker.data.name} healed 20 HP!`);
                renderGame();
                callback();
            }, 500);
            break;
            
        default:
            callback();
    }
}

// Handle move effects
function handleMoveEffect(effect, attacker, defender, attackingPlayer) {
    if (!effect) {
        // No effect, check for defender knockout and end turn
        checkKnockoutsAndContinue(attackingPlayer);
        return;
    }
    
    const opponent = attackingPlayer === 'player' ? 'opponent' : 'player';
    
    switch(effect) {
        case 'cantRetreat':
            // Ethereal Snare - defender can't retreat next turn
            defender.cantRetreat = true;
            setTimeout(() => {
                alert(`${defender.data.name} can't retreat on its next turn!`);
                checkKnockoutsAndContinue(attackingPlayer);
            }, 500);
            break;
            
        case 'discard2Energy':
            // Vision Beam - attacker loses 2 energy
            attacker.energy = Math.max(0, attacker.energy - 2);
            setTimeout(() => {
                alert(`${attacker.data.name} discarded 2 energy!`);
                checkKnockoutsAndContinue(attackingPlayer);
            }, 500);
            break;
            
        case 'recoil20':
            // Petal Tornado - 20 damage to self
            attacker.damage += 20;
            setTimeout(() => {
                alert(`${attacker.data.name} took 20 recoil damage!`);
                // Check if attacker knocked itself out
                if (attacker.damage >= attacker.data.hp) {
                    knockoutCreature(attackingPlayer);
                } else {
                    checkKnockoutsAndContinue(attackingPlayer);
                }
            }, 500);
            break;
            
        case 'creamyConfection':
            // Creamy Confection - coin flip for energy attach or discard
            setTimeout(() => {
                const result = flipCoin();
                if (result === 'heads') {
                    // Attach energy to random bench
                    const bench = gameState[attackingPlayer].bench.filter(c => c !== null);
                    if (bench.length > 0) {
                        const randomBench = bench[Math.floor(Math.random() * bench.length)];
                        randomBench.energy++;
                        alert(`Coin flip: HEADS! Attached 1 energy to ${randomBench.data.name} on bench!`);
                    } else {
                        alert(`Coin flip: HEADS! But no bench creatures to attach energy to.`);
                    }
                } else {
                    // Discard 2 energy
                    attacker.energy = Math.max(0, attacker.energy - 2);
                    alert(`Coin flip: TAILS! ${attacker.data.name} discarded 2 energy!`);
                }
                checkKnockoutsAndContinue(attackingPlayer);
            }, 500);
            break;
            
        case 'riskyRecoil':
            // Risky Recoil - coin flip for random friendly damage
            setTimeout(() => {
                const result = flipCoin();
                if (result === 'tails') {
                    // Damage random friendly creature
                    const allFriendly = [gameState[attackingPlayer].active, ...gameState[attackingPlayer].bench].filter(c => c !== null);
                    if (allFriendly.length > 0) {
                        const randomTarget = allFriendly[Math.floor(Math.random() * allFriendly.length)];
                        randomTarget.damage += 50;
                        alert(`Coin flip: TAILS! ${randomTarget.data.name} took 50 damage!`);
                        // Check if that creature was knocked out
                        if (randomTarget.damage >= randomTarget.data.hp) {
                            if (randomTarget === gameState[attackingPlayer].active) {
                                knockoutCreature(attackingPlayer);
                            } else {
                                // Bench creature knocked out - remove it
                                const benchIndex = gameState[attackingPlayer].bench.indexOf(randomTarget);
                                if (benchIndex !== -1) {
                                    gameState[attackingPlayer].discardPile.push(randomTarget);
                                    gameState[attackingPlayer].bench[benchIndex] = null;
                                }
                                checkKnockoutsAndContinue(attackingPlayer);
                            }
                        } else {
                            checkKnockoutsAndContinue(attackingPlayer);
                        }
                    } else {
                        alert(`Coin flip: TAILS! But no creatures to damage.`);
                        checkKnockoutsAndContinue(attackingPlayer);
                    }
                } else {
                    alert(`Coin flip: HEADS! No recoil damage.`);
                    checkKnockoutsAndContinue(attackingPlayer);
                }
            }, 500);
            break;
            
        case 'heavenlyRetreat':
            // Heavenly Retreat - free swap
            const bench = gameState[attackingPlayer].bench.filter(c => c !== null);
            if (bench.length > 0) {
                showBenchSelectionModal(attackingPlayer, 'heavenlyRetreat');
            } else {
                alert("No bench creatures to swap with!");
                setTimeout(endTurn, 500);
            }
            break;
            
        case 'energySnatch':
            // Energy Snatch - coin flip to remove opponent energy
            setTimeout(() => {
                const result = flipCoin();
                if (result === 'heads') {
                    const allOpponent = [gameState[opponent].active, ...gameState[opponent].bench].filter(c => c !== null && c.energy > 0);
                    if (allOpponent.length > 0) {
                        const randomTarget = allOpponent[Math.floor(Math.random() * allOpponent.length)];
                        randomTarget.energy--;
                        alert(`Coin flip: HEADS! Removed 1 energy from ${randomTarget.data.name}!`);
                    } else {
                        alert(`Coin flip: HEADS! But no opponent creatures with energy.`);
                    }
                } else {
                    alert(`Coin flip: TAILS! No energy removed.`);
                }
                checkKnockoutsAndContinue(attackingPlayer);
            }, 500);
            break;
            
        case 'healingSap':
            // Healing Sap - heal attacker 20 HP
            attacker.damage = Math.max(0, attacker.damage - 20);
            setTimeout(() => {
                alert(`${attacker.data.name} healed 20 HP!`);
                checkKnockoutsAndContinue(attackingPlayer);
            }, 500);
            break;
            
        default:
            setTimeout(endTurn, 1000);
    }
}

function checkKnockoutsAndContinue(attackingPlayer) {
    const defender = attackingPlayer === 'player' ? gameState.opponent.active : gameState.player.active;
    
    // Check if defender is knocked out
    if (defender && defender.damage >= defender.data.hp) {
        const defenderPlayer = attackingPlayer === 'player' ? 'opponent' : 'player';
        knockoutCreature(defenderPlayer);
    } else {
        setTimeout(endTurn, 1000);
    }
}

// Retreat system
function handleRetreatButton() {
    const activeCard = gameState.player.active;
    if (!activeCard) return;
    
    if (activeCard.energy < activeCard.data.retreat) {
        alert("Not enough energy to retreat!");
        return;
    }
    
    // Check if there are bench creatures
    const availableBench = gameState.player.bench.filter(card => card !== null);
    if (availableBench.length === 0) {
        alert("No creatures on bench to swap with!");
        return;
    }
    
    // Show selection modal
    showBenchSelectionModal('player', 'retreat');
}

function showBenchSelectionModal(player, action) {
    const modal = document.getElementById('select-modal');
    const title = document.getElementById('modal-title');
    const options = document.getElementById('modal-options');
    
    if (action === 'retreat') {
        title.textContent = 'Select a creature to switch with';
    } else if (action === 'heavenlyRetreat') {
        title.textContent = 'Select a creature to swap with (no cost)';
    } else {
        title.textContent = 'Select a new active creature';
    }
    options.innerHTML = '';
    
    gameState[player].bench.forEach((card, index) => {
        if (card) {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'modal-card';
            
            const img = document.createElement('img');
            img.src = `cards/${card.id}`;
            img.alt = card.data.name;
            cardDiv.appendChild(img);
            
            cardDiv.addEventListener('click', () => {
                if (action === 'retreat') {
                    performRetreat(player, index);
                } else if (action === 'heavenlyRetreat') {
                    performHeavenlyRetreat(player, index);
                } else {
                    // Knockout - selecting new active
                    selectNewActiveCreature(player, index);
                    // End turn after knockout replacement
                    setTimeout(endTurn, 1000);
                }
                modal.style.display = 'none';
            });
            
            options.appendChild(cardDiv);
        }
    });
    
    modal.style.display = 'flex';
}

function performHeavenlyRetreat(player, benchIndex) {
    const activeCard = gameState[player].active;
    const benchCard = gameState[player].bench[benchIndex];
    
    // Swap without discarding energy (free retreat)
    gameState[player].active = benchCard;
    gameState[player].bench[benchIndex] = activeCard;
    
    // Mark as attacked to end turn
    gameState[player].hasAttacked = true;
    
    renderGame();
    
    // Check for knockouts and continue
    setTimeout(endTurn, 1000);
}

function performRetreat(player, benchIndex) {
    const activeCard = gameState[player].active;
    const benchCard = gameState[player].bench[benchIndex];
    
    // Discard retreat cost energy
    activeCard.energy -= activeCard.data.retreat;
    
    // Swap
    gameState[player].active = benchCard;
    gameState[player].bench[benchIndex] = activeCard;
    
    renderGame();
}

// Knockout system
function knockoutCreature(player) {
    const opponent = player === 'player' ? 'opponent' : 'player';
    
    // Add knocked out creature to discard pile
    gameState[player].discardPile.push(gameState[player].active);
    
    // Opponent gets a point
    gameState[opponent].points++;
    
    // Show point notification
    if (opponent === 'player') {
        setTimeout(() => alert("You scored a point!"), 100);
    } else {
        setTimeout(() => alert("Your opponent scored a point!"), 100);
    }
    
    // Check for game over
    if (gameState[opponent].points >= 3) {
        setTimeout(() => endGame(opponent), 500);
        return;
    }
    
    // Remove knocked out creature
    gameState[player].active = null;
    
    // Check if player has bench creatures
    const availableBench = gameState[player].bench.filter(card => card !== null);
    if (availableBench.length === 0) {
        // No bench - opponent wins
        setTimeout(() => endGame(opponent), 500);
        return;
    }
    
    // Player must select new active creature
    if (player === 'player') {
        setTimeout(() => showBenchSelectionModal(player, 'knockout'), 300);
    } else {
        // AI selects creature with highest HP
        setTimeout(() => aiSelectNewActive(), 300);
    }
}

function selectNewActiveCreature(player, benchIndex) {
    gameState[player].active = gameState[player].bench[benchIndex];
    gameState[player].bench[benchIndex] = null;
    renderGame();
}

function aiSelectNewActive() {
    let bestIndex = -1;
    let bestHp = -1;
    
    gameState.opponent.bench.forEach((card, index) => {
        if (card) {
            const currentHp = card.data.hp - card.damage;
            if (currentHp > bestHp) {
                bestHp = currentHp;
                bestIndex = index;
            }
        }
    });
    
    if (bestIndex !== -1) {
        selectNewActiveCreature('opponent', bestIndex);
        // End turn after AI selects new active from knockout
        setTimeout(endTurn, 1000);
    }
}

// Draw cards
function drawCards(player, count) {
    for (let i = 0; i < count; i++) {
        if (gameState[player].deck.length > 0) {
            const cardId = gameState[player].deck.pop();
            const cardData = getCardData(cardId);
            gameState[player].hand.push({id: cardId, data: cardData, energy: 0, damage: 0});
        }
    }
}

// Turn management
function handleDone() {
    if (gameState.phase === 'setup') {
        if (gameState.player.active && gameState.setupReady.player && gameState.setupReady.opponent) {
            startGame();
        } else if (!gameState.player.active) {
            alert("You must place an active creature first!");
        }
    } else if (gameState.currentTurn === 'player') {
        endTurn();
    }
}

function endTurn() {
    // Reset cantRetreat flags for current player's active creature (effect lasts one turn)
    if (gameState[gameState.currentTurn].active) {
        gameState[gameState.currentTurn].active.cantRetreat = false;
    }
    
    // Switch turns
    gameState.currentTurn = gameState.currentTurn === 'player' ? 'opponent' : 'player';
    
    // Increment turn counter at the start of each new turn
    gameState.turnNumber++;
    
    // Check for turn limit
    if (gameState.turnNumber > 30) {
        endGameByTurnLimit();
        return;
    }
    
    // Reset turn-specific flags
    gameState.player.energyAttachedThisTurn = false;
    gameState.player.hasAttacked = false;
    gameState.player.itemUsedThisTurn = false;
    gameState.player.boosterActive = false;
    gameState.opponent.energyAttachedThisTurn = false;
    gameState.opponent.hasAttacked = false;
    gameState.opponent.itemUsedThisTurn = false;
    gameState.opponent.boosterActive = false;
    
    // Clear turn tracker
    turnTracker.playedThisTurn.clear();
    turnTracker.evolvedThisTurn.clear();
    
    // Draw card at start of turn
    drawCards(gameState.currentTurn, 1);
    
    renderGame();
    
    // AI turn
    if (gameState.currentTurn === 'opponent') {
        setTimeout(aiTurn, 1500);
    }
}

function endGameByTurnLimit() {
    const playerPoints = gameState.player.points;
    const opponentPoints = gameState.opponent.points;
    
    if (playerPoints > opponentPoints) {
        endGame('player');
    } else if (opponentPoints > playerPoints) {
        endGame('opponent');
    } else {
        endGame('tie');
    }
}

function endGame(winner) {
    gameState.phase = 'gameOver';
    
    let message;
    let result; // 'win' or 'loss'
    
    if (winner === 'tie') {
        message = "Game Over! It's a tie!";
        result = 'tie';
    } else if (winner === 'player') {
        message = "You Win!";
        result = 'win';
    } else {
        message = "Opponent Wins!";
        result = 'loss';
    }
    
    // Save win/loss record to leaderboard
    if (result !== 'tie' && window.parent && window.parent.saveGameScore) {
        window.parent.saveGameScore("TCG Game", {
            result: result,
            playerDeck: deckTemplates[gameState.player.selectedDeck].name,
            opponentDeck: deckTemplates[gameState.opponent.selectedDeck].name
        }).then((saveResult) => {
            console.log("TCG Game result saved successfully");
            if (saveResult && saveResult.isNewBest && window.parent.showNewBestScore) {
                window.parent.showNewBestScore("TCG Game", { result: result });
            }
        }).catch(err => {
            console.error("Error saving TCG Game result:", err);
        });
    }
    
    alert(message);
    renderGame();
}

function resetAndStartNewGame() {
    // Reset game state completely
    gameState.player = {
        deck: [],
        hand: [],
        active: null,
        bench: [null, null, null],
        points: 0,
        energyAttachedThisTurn: false,
        hasAttacked: false,
        itemUsedThisTurn: false,
        discardPile: [],
        selectedDeck: null,
        boosterActive: false
    };
    gameState.opponent = {
        deck: [],
        hand: [],
        active: null,
        bench: [null, null, null],
        points: 0,
        energyAttachedThisTurn: false,
        hasAttacked: false,
        itemUsedThisTurn: false,
        discardPile: [],
        selectedDeck: null,
        boosterActive: false
    };
    gameState.currentTurn = null;
    gameState.turnNumber = 0;
    gameState.phase = 'deckSelection';
    gameState.selectedCard = null;
    gameState.selectedSlot = null;
    gameState.waitingForSelection = false;
    gameState.setupReady = {player: false, opponent: false};
    
    turnTracker.playedThisTurn.clear();
    turnTracker.evolvedThisTurn.clear();
    
    // Hide game screen, show deck selection
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('deck-selection').style.display = 'block';
    
    // Restart from deck selection
    showDeckSelection();
}

// AI Turn
function aiTurn() {
    if (gameState.currentTurn !== 'opponent' || gameState.phase === 'gameOver') return;
    
    // 1. Try to use item cards
    aiUseItems(() => {
        if (gameState.phase === 'gameOver') return;
        
        setTimeout(() => {
            // 2. Play Stage 1 cards to bench
            aiPlayStage1ToBench();
            
            if (gameState.phase === 'gameOver') return;
            
            setTimeout(() => {
                // 3. Try to evolve creatures (keep trying until no more evolutions possible)
                aiEvolveAll();
                
                if (gameState.phase === 'gameOver') return;
                
                setTimeout(() => {
                    // 4. Attach energy
                    aiAttachEnergy();
                    
                    if (gameState.phase === 'gameOver') return;
                    
                    setTimeout(() => {
                        // 5. Attack if possible
                        if (aiCanAttack()) {
                            aiAttack();
                            // Attack ends turn automatically
                        } else {
                            // End turn
                            endTurn();
                        }
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 1000);
    });
}

function aiPlayStage1ToBench() {
    // Find all Stage 1 cards in hand
    const stage1Cards = gameState.opponent.hand.filter(card => card.data.stage === "Stage 1");
    
    // Find empty bench slots
    for (let i = 0; i < gameState.opponent.bench.length; i++) {
        if (!gameState.opponent.bench[i] && stage1Cards.length > 0) {
            // Play the first Stage 1 to this bench slot
            const card = stage1Cards.shift();
            const handIndex = gameState.opponent.hand.indexOf(card);
            gameState.opponent.bench[i] = card;
            gameState.opponent.hand.splice(handIndex, 1);
            turnTracker.playedThisTurn.add(card);
        }
    }
    
    renderGame();
}

function aiEvolveAll() {
    // Keep trying to evolve until no more evolutions are possible
    let evolved = false;
    
    do {
        evolved = aiTryEvolveOnce();
    } while (evolved);
}

function aiTryEvolveOnce() {
    // Can't evolve before turn 3
    if (gameState.turnNumber < 3) return false;
    
    // Check hand for evolution cards
    for (let i = gameState.opponent.hand.length - 1; i >= 0; i--) {
        const card = gameState.opponent.hand[i];
        
        if (card.data.stage === "Stage 1") continue;
        if (card.data.stage === "Item") continue;
        
        // Try to evolve active
        if (gameState.opponent.active && canEvolve(gameState.opponent.active, card)) {
            const targetCard = gameState.opponent.active;
            card.damage = targetCard.damage;
            card.energy = targetCard.energy;
            gameState.opponent.active = card;
            gameState.opponent.hand.splice(i, 1);
            turnTracker.evolvedThisTurn.add(card);
            renderGame();
            return true;
        }
        
        // Try to evolve bench
        for (let j = 0; j < gameState.opponent.bench.length; j++) {
            const benchCard = gameState.opponent.bench[j];
            if (benchCard && canEvolve(benchCard, card)) {
                card.damage = benchCard.damage;
                card.energy = benchCard.energy;
                gameState.opponent.bench[j] = card;
                gameState.opponent.hand.splice(i, 1);
                turnTracker.evolvedThisTurn.add(card);
                renderGame();
                return true;
            }
        }
    }
    
    return false;
}

function aiUseItems(callback) {
    // Check if AI has any item cards and hasn't used one this turn
    if (gameState.opponent.itemUsedThisTurn || gameState.phase === 'gameOver') {
        callback();
        return;
    }
    
    // Find potion if active creature is damaged
    if (gameState.opponent.active && gameState.opponent.active.damage > 0) {
        const potionIndex = gameState.opponent.hand.findIndex(card => card.data.name === "Potion");
        if (potionIndex !== -1) {
            const potion = gameState.opponent.hand[potionIndex];
            flashItemCard(potion.id, () => {
                if (gameState.phase === 'gameOver') return;
                gameState.opponent.active.damage = Math.max(0, gameState.opponent.active.damage - 20);
                gameState.opponent.discardPile.push(potion);
                gameState.opponent.hand.splice(potionIndex, 1);
                gameState.opponent.itemUsedThisTurn = true;
                renderGame();
                callback();
            });
            return;
        }
    }
    
    // Use Booster if available (prioritize before Card Draw)
    const boosterIndex = gameState.opponent.hand.findIndex(card => card.data.name === "Booster");
    if (boosterIndex !== -1) {
        const booster = gameState.opponent.hand[boosterIndex];
        flashItemCard(booster.id, () => {
            if (gameState.phase === 'gameOver') return;
            gameState.opponent.boosterActive = true;
            gameState.opponent.discardPile.push(booster);
            gameState.opponent.hand.splice(boosterIndex, 1);
            gameState.opponent.itemUsedThisTurn = true;
            renderGame();
            callback();
        });
        return;
    }
    
    // Use Card Draw if available
    const cardDrawIndex = gameState.opponent.hand.findIndex(card => card.data.name === "Card Draw");
    if (cardDrawIndex !== -1) {
        const cardDraw = gameState.opponent.hand[cardDrawIndex];
        flashItemCard(cardDraw.id, () => {
            if (gameState.phase === 'gameOver') return;
            drawCards('opponent', 2);
            gameState.opponent.discardPile.push(cardDraw);
            gameState.opponent.hand.splice(cardDrawIndex, 1);
            gameState.opponent.itemUsedThisTurn = true;
            renderGame();
            callback();
        });
        return;
    }
    
    callback();
}

function aiAttachEnergy() {
    if (gameState.opponent.energyAttachedThisTurn) return;
    
    // Check if active has enough energy for all moves
    if (gameState.opponent.active) {
        const active = gameState.opponent.active;
        let maxEnergyCost = 0;
        
        if (active.data.move1Cost) {
            maxEnergyCost = Math.max(maxEnergyCost, active.data.move1Cost.length);
        }
        if (active.data.move2Cost) {
            maxEnergyCost = Math.max(maxEnergyCost, active.data.move2Cost.length);
        }
        
        // If active already has enough energy, attach to bench instead
        if (active.energy >= maxEnergyCost) {
            // Find first bench creature
            for (let i = 0; i < gameState.opponent.bench.length; i++) {
                if (gameState.opponent.bench[i]) {
                    gameState.opponent.bench[i].energy++;
                    gameState.opponent.energyAttachedThisTurn = true;
                    renderGame();
                    return;
                }
            }
        }
        
        // Otherwise attach to active
        active.energy++;
        gameState.opponent.energyAttachedThisTurn = true;
    } else if (gameState.opponent.bench[0]) {
        gameState.opponent.bench[0].energy++;
        gameState.opponent.energyAttachedThisTurn = true;
    }
    
    renderGame();
}

function aiCanAttack() {
    const attacker = gameState.opponent.active;
    if (!attacker) return false;
    
    const move1Cost = attacker.data.move1Cost;
    if (!move1Cost) return false;
    
    return attacker.energy >= move1Cost.length;
}

function aiAttack() {
    const attacker = gameState.opponent.active;
    const defender = gameState.player.active;
    
    if (!attacker || !defender) return;
    
    // Choose best move (move with highest damage that AI can afford)
    let damage = 0;
    let effect = null;
    let moveNumber = 1;
    let canUseMove2 = attacker.data.move2Cost && attacker.energy >= attacker.data.move2Cost.length;
    
    if (canUseMove2 && attacker.data.move2Damage > attacker.data.move1Damage) {
        damage = attacker.data.move2Damage;
        effect = attacker.data.move2Effect;
        moveNumber = 2;
    } else {
        damage = attacker.data.move1Damage;
        effect = attacker.data.move1Effect;
        moveNumber = 1;
    }
    
    // Apply opponent's booster if active
    if (gameState.opponent.boosterActive) {
        damage += 20;
        gameState.opponent.boosterActive = false;
    }
    
    // Apply damage to defender
    defender.damage += damage;
    
    gameState.opponent.hasAttacked = true;
    renderGame();
    
    // Check if defender is knocked out by base damage
    const defenderKnockedOut = defender.damage >= defender.data.hp;
    
    if (defenderKnockedOut) {
        // Apply effect first (if any), then handle knockout
        if (effect) {
            handleMoveEffectBeforeKnockout(effect, attacker, 'opponent', () => {
                knockoutCreature('player');
            });
        } else {
            // No effect, just handle knockout
            knockoutCreature('player');
        }
    } else {
        // Defender survives, handle all effects normally
        handleMoveEffect(effect, attacker, defender, 'opponent');
    }
}

// Update action buttons
function updateActionButtons() {
    const energyBtn = document.getElementById('energy-btn');
    const attackBtn = document.getElementById('attack-btn');
    const attack2Btn = document.getElementById('attack2-btn');
    const retreatBtn = document.getElementById('retreat-btn');
    const doneBtn = document.getElementById('done-btn');
    const newGameBtn = document.getElementById('new-game-btn');
    
    if (gameState.phase === 'setup') {
        energyBtn.disabled = true;
        attackBtn.style.display = 'none';
        attack2Btn.style.display = 'none';
        retreatBtn.style.display = 'none';
        doneBtn.textContent = 'Done';
        doneBtn.style.display = 'inline-block';
        newGameBtn.style.display = 'none';
    } else if (gameState.phase === 'gameOver') {
        energyBtn.disabled = true;
        attackBtn.style.display = 'none';
        attack2Btn.style.display = 'none';
        retreatBtn.style.display = 'none';
        doneBtn.style.display = 'none';
        newGameBtn.style.display = 'inline-block';
    } else if (gameState.currentTurn === 'player') {
        energyBtn.disabled = gameState.player.energyAttachedThisTurn || gameState.player.hasAttacked;
        doneBtn.style.display = 'inline-block';
        newGameBtn.style.display = 'none';
        
        // Check both moves
        const active = gameState.player.active;
        if (active && !gameState.player.hasAttacked) {
            const canAttack1 = active.data.move1Cost && active.energy >= active.data.move1Cost.length;
            const canAttack2 = active.data.move2Cost && active.energy >= active.data.move2Cost.length;
            
            attackBtn.style.display = canAttack1 ? 'inline-block' : 'none';
            attack2Btn.style.display = canAttack2 ? 'inline-block' : 'none';
            
            // Update button text with move names and damage
            if (canAttack1) {
                if (active.data.move1Name && active.data.move1Damage) {
                    attackBtn.textContent = `${active.data.move1Name} (${active.data.move1Damage})`;
                } else if (active.data.move1Name) {
                    attackBtn.textContent = active.data.move1Name;
                } else {
                    attackBtn.textContent = 'Attack';
                }
            }
            
            if (canAttack2) {
                if (active.data.move2Name && active.data.move2Damage) {
                    attack2Btn.textContent = `${active.data.move2Name} (${active.data.move2Damage})`;
                } else if (active.data.move2Name) {
                    attack2Btn.textContent = active.data.move2Name;
                } else {
                    attack2Btn.textContent = 'Attack 2';
                }
            }
        } else {
            attackBtn.style.display = 'none';
            attack2Btn.style.display = 'none';
        }
        
        const canRetreat = gameState.player.active &&
                          !gameState.player.active.cantRetreat &&
                          gameState.player.active.energy >= gameState.player.active.data.retreat &&
                          !gameState.player.hasAttacked &&
                          gameState.player.bench.some(card => card !== null);
        if (canRetreat) {
            retreatBtn.style.display = 'inline-block';
            retreatBtn.textContent = `Retreat (${gameState.player.active.data.retreat})`;
            retreatBtn.disabled = false;
        } else if (gameState.player.active && gameState.player.active.cantRetreat && !gameState.player.hasAttacked) {
            retreatBtn.style.display = 'inline-block';
            retreatBtn.textContent = `Retreat (Can't Retreat!)`;
            retreatBtn.disabled = true;
        } else {
            retreatBtn.style.display = 'none';
        }
        
        doneBtn.disabled = false;
        doneBtn.textContent = 'End Turn';
    } else {
        energyBtn.disabled = true;
        attackBtn.style.display = 'none';
        attack2Btn.style.display = 'none';
        retreatBtn.style.display = 'none';
        doneBtn.disabled = true;
        doneBtn.textContent = "Opponent's Turn";
        doneBtn.style.display = 'inline-block';
        newGameBtn.style.display = 'none';
    }
}

// Start the game
initGame();
