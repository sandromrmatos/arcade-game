// ============================================
// TRANSLATIONS
// ============================================
const translations = {
    en: {
        selectLanguage: "Select Language",
        selectLevel: "Select Level",
        level: "Level",
        timer: "Timer",
        coins: "Coins",
        goal: "Goal",
        customers: "Customers",
        appliances: "Appliances",
        ingredients: "Ingredients",
        levelComplete: "Level Complete!",
        levelFailed: "Level Failed!",
        coinsEarned: "Coins Earned",
        goalWas: "Goal was",
        retry: "Retry",
        nextLevel: "Next Level",
        backToMenu: "Back to Menu",
        leaderboard: "Leaderboard",
        close: "Close",
        selectRecipe: "Select Recipe",
        selectCustomer: "Select Customer to Serve",
        cancel: "Cancel",
        serve: "Serve",
        cook: "Cook",
        ready: "Ready",
        cooking: "Cooking",
        empty: "Empty",
        slot: "Slot",
        // Customer types
        youngWoman: "Young Woman",
        youngMan: "Young Man",
        adultWoman: "Adult Woman",
        adultMan: "Adult Man",
        olderWoman: "Older Woman",
        olderMan: "Older Man",
        // Appliances
        coffeeMachine: "Coffee Machine",
        choppingBoard: "Chopping Board",
        // Ingredients
        coffeeBeans: "Coffee Beans",
        tomato: "Tomato",
        milk: "Milk",
        // Recipes
        blackAmericano: "Black Americano",
        tomatoSalad: "Tomato Salad",
        latte: "Latte",
        // Other
        ingredientsInAppliance: "Ingredients in Appliance",
        toss: "Toss",
        locked: "Locked",
        rank: "Rank",
        player: "Player",
        bestScore: "Best Score",
        viewLeaderboard: "View Leaderboard"
    },
    pt: {
        selectLanguage: "Selecionar Idioma",
        selectLevel: "Selecionar Nível",
        level: "Nível",
        timer: "Tempo",
        coins: "Moedas",
        goal: "Meta",
        customers: "Clientes",
        appliances: "Eletrodomésticos",
        ingredients: "Ingredientes",
        levelComplete: "Nível Completo!",
        levelFailed: "Nível Falhou!",
        coinsEarned: "Moedas Ganhas",
        goalWas: "Meta era",
        retry: "Tentar Novamente",
        nextLevel: "Próximo Nível",
        backToMenu: "Voltar ao Menu",
        leaderboard: "Classificação",
        close: "Fechar",
        selectRecipe: "Selecionar Receita",
        selectCustomer: "Selecionar Cliente para Servir",
        cancel: "Cancelar",
        serve: "Servir",
        cook: "Cozinhar",
        ready: "Pronto",
        cooking: "Cozinhando",
        empty: "Vazio",
        slot: "Slot",
        youngWoman: "Jovem Mulher",
        youngMan: "Jovem Homem",
        adultWoman: "Mulher Adulta",
        adultMan: "Homem Adulto",
        olderWoman: "Mulher Idosa",
        olderMan: "Homem Idoso",
        coffeeMachine: "Máquina de Café",
        choppingBoard: "Tábua de Cortar",
        coffeeBeans: "Grãos de Café",
        tomato: "Tomate",
        milk: "Leite",
        blackAmericano: "Americano Preto",
        tomatoSalad: "Salada de Tomate",
        latte: "Latte",
        ingredientsInAppliance: "Ingredientes no Eletrodoméstico",
        toss: "Descartar",
        locked: "Bloqueado",
        rank: "Rank",
        player: "Jogador",
        bestScore: "Melhor Pontuação",
        viewLeaderboard: "Ver Classificação"
    }
};

// ============================================
// LANGUAGE MANAGEMENT
// ============================================
let currentLanguage = 'en';

function getParentLanguage() {
    if (window.parent && window.parent.currentLanguage) {
        return window.parent.currentLanguage;
    }
    if (window.parent && window.parent.localStorage) {
        const lang = window.parent.localStorage.getItem('arcadeLanguage');
        if (lang === 'en' || lang === 'pt') return lang;
    }
    return 'en';
}

function t(key) {
    const lang = currentLanguage;
    return translations[lang][key] || key;
}

function updateLanguage() {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });
}

window.addEventListener('message', (event) => {
    if (event.data.type === 'languageChange') {
        currentLanguage = getParentLanguage();
        updateLanguage();
    }
});

// ============================================
// GAME DATA
// ============================================
const RECIPES = {
    blackAmericano: {
        id: 'blackAmericano',
        nameKey: 'blackAmericano',
        icon: '☕',
        ingredients: { coffeeBeans: 1 },
        appliance: 'coffeeMachine',
        prepTime: 5,
        burnTime: null,
        price: 3
    },
    tomatoSalad: {
        id: 'tomatoSalad',
        nameKey: 'tomatoSalad',
        icon: '🥗',
        ingredients: { tomato: 1 },
        appliance: 'choppingBoard',
        prepTime: 6,
        burnTime: null,
        price: 4
    },
    latte: {
        id: 'latte',
        nameKey: 'latte',
        icon: '☕',
        ingredients: { coffeeBeans: 1, milk: 1 },
        appliance: 'coffeeMachine',
        prepTime: 6,
        burnTime: null,
        price: 5
    }
};

const APPLIANCES = {
    coffeeMachine: {
        id: 'coffeeMachine',
        nameKey: 'coffeeMachine',
        icon: '☕',
        recipes: ['blackAmericano', 'latte']
    },
    choppingBoard: {
        id: 'choppingBoard',
        nameKey: 'choppingBoard',
        icon: '🔪',
        recipes: ['tomatoSalad']
    }
};

const INGREDIENTS = {
    coffeeBeans: { id: 'coffeeBeans', nameKey: 'coffeeBeans', icon: '🫘' },
    tomato: { id: 'tomato', nameKey: 'tomato', icon: '🍅' },
    milk: { id: 'milk', nameKey: 'milk', icon: '🥛' }
};

const CUSTOMER_TYPES = [
    { nameKey: 'youngWoman', icon: '👩' },
    { nameKey: 'youngMan', icon: '👨' },
    { nameKey: 'adultWoman', icon: '👩‍🦰' },
    { nameKey: 'adultMan', icon: '👨‍🦰' },
    { nameKey: 'olderWoman', icon: '👵' },
    { nameKey: 'olderMan', icon: '👴' }
];

const LEVELS = {
    1: {
        id: 1,
        timer: 180, // seconds (3 minutes)
        goal: 15,
        appliances: [
            { type: 'coffeeMachine', slots: 1 }
        ],
        ingredients: ['coffeeBeans'],
        recipes: ['blackAmericano'],
        customerSlots: 2,
        customerArrival: [3, 5], // first, second
        customerInterval: 5, // after serving
        orderDistribution: {
            blackAmericano: 1.0
        }
    },
    2: {
        id: 2,
        timer: 180, // seconds (3 minutes)
        goal: 30,
        appliances: [
            { type: 'coffeeMachine', slots: 1 },
            { type: 'choppingBoard', slots: 1 }
        ],
        ingredients: ['coffeeBeans', 'tomato'],
        recipes: ['blackAmericano', 'tomatoSalad'],
        customerSlots: 3,
        customerArrival: [3, 5, 7],
        customerInterval: 5,
        orderDistribution: {
            blackAmericano: 0.5,
            tomatoSalad: 0.5
        }
    },
    3: {
        id: 3,
        timer: 180, // seconds (3 minutes)
        goal: 50,
        appliances: [
            { type: 'coffeeMachine', slots: 2 },
            { type: 'choppingBoard', slots: 1 }
        ],
        ingredients: ['coffeeBeans', 'tomato', 'milk'],
        recipes: ['blackAmericano', 'tomatoSalad', 'latte'],
        customerSlots: 4,
        customerArrival: [3, 5, 7, 10],
        customerInterval: 5,
        orderDistribution: {
            blackAmericano: 0.25,
            tomatoSalad: 0.25,
            latte: 0.5
        }
    }
};

// ============================================
// FIREBASE CONFIGURATION
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyDNC-6v_OcYEtMfju_JLcJXPyv-pD1pj2E",
    authDomain: "arcade-sandro.firebaseapp.com",
    projectId: "arcade-sandro",
    storageBucket: "arcade-sandro.appspot.com",
    messagingSenderId: "910071936481",
    appId: "1:910071936481:web:98ee449c6a8ef62e5a97f9"
};

let db;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error("Firebase initialization error:", error);
}

// ============================================
// GAME STATE
// ============================================
let gameState = {
    level: 1,
    timeRemaining: 0,
    coins: 0,
    goal: 0,
    customers: [],
    appliances: [],
    selectedIngredient: null,
    selectedAppliance: null,
    selectedSlot: null,
    selectedDish: null,
    gameTimer: null,
    gameStartTime: null,
    gameActive: false,
    playerName: null,
    bestScores: {}
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    currentLanguage = getParentLanguage();
    updateLanguage();
    showLevelSelection();
});

// ============================================
// LEVEL SELECTION
// ============================================
async function showLevelSelection() {
    await loadBestScores();
    
    const modal = document.getElementById('levelSelectionModal');
    const buttonsContainer = document.getElementById('levelButtons');
    buttonsContainer.innerHTML = '';
    
    for (let i = 1; i <= 3; i++) {
        const level = LEVELS[i];
        const isUnlocked = i === 1 || gameState.bestScores[i - 1] >= LEVELS[i - 1].goal;
        
        const btn = document.createElement('button');
        btn.className = 'level-btn';
        btn.disabled = !isUnlocked;
        
        const bestScore = gameState.bestScores[i] || 0;
        const goalText = `${t('goal')}: £${level.goal}`;
        const bestText = bestScore > 0 ? ` | ${t('bestScore')}: £${bestScore}` : '';
        
        btn.innerHTML = `
            <div class="level-info">
                <div>${t('level')} ${i}</div>
                <div class="level-stats">${goalText}${bestText}</div>
            </div>
        `;
        
        if (isUnlocked) {
            btn.onclick = () => startLevel(i);
        }
        
        buttonsContainer.appendChild(btn);
    }
    
    // Add leaderboard button
    const leaderboardBtn = document.createElement('button');
    leaderboardBtn.className = 'level-btn';
    leaderboardBtn.textContent = t('viewLeaderboard');
    leaderboardBtn.onclick = () => {
        alert('View leaderboard from the main arcade menu!');
    };
    buttonsContainer.appendChild(leaderboardBtn);
    
    modal.classList.remove('hidden');
}

// ============================================
// GAME START
// ============================================
function startLevel(levelNum) {
    gameState.level = levelNum;
    const level = LEVELS[levelNum];
    
    gameState.timeRemaining = level.timer;
    gameState.coins = 0;
    gameState.goal = level.goal;
    gameState.customers = [];
    gameState.appliances = [];
    gameState.selectedIngredient = null;
    gameState.selectedAppliance = null;
    gameState.selectedSlot = null;
    gameState.selectedDish = null;
    gameState.gameActive = true;
    gameState.gameStartTime = Date.now();
    
    // Initialize appliances
    level.appliances.forEach(app => {
        const applianceData = {
            type: app.type,
            slots: [],
            ingredientsAdded: []
        };
        
        for (let i = 0; i < app.slots; i++) {
            applianceData.slots.push({
                index: i,
                recipe: null,
                startTime: null,
                readyTime: null,
                status: 'empty' // empty, cooking, ready
            });
        }
        
        gameState.appliances.push(applianceData);
    });
    
    // Initialize customer slots
    for (let i = 0; i < level.customerSlots; i++) {
        gameState.customers.push(null);
    }
    
    // Hide modals and show game
    document.getElementById('levelSelectionModal').classList.add('hidden');
    document.getElementById('gameContainer').classList.remove('hidden');
    
    renderGame();
    startGameTimer();
    scheduleCustomers();
}

// ============================================
// GAME TIMER
// ============================================
function startGameTimer() {
    if (gameState.gameTimer) clearInterval(gameState.gameTimer);
    
    gameState.gameTimer = setInterval(() => {
        if (!gameState.gameActive) return;
        
        gameState.timeRemaining--;
        
        // Update display
        const minutes = Math.floor(gameState.timeRemaining / 60);
        const seconds = gameState.timeRemaining % 60;
        document.getElementById('timer').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Update customers
        gameState.customers.forEach((customer, index) => {
            if (customer && !customer.consuming) {
                customer.waitTime++;
                updateCustomerDisplay(index);
            }
        });
        
        // Update cooking
        updateCooking();
        
        // Check end conditions
        if (gameState.timeRemaining <= 0) {
            endGame();
        }
    }, 1000);
}

function updateCooking() {
    const now = Date.now();
    let updated = false;
    
    gameState.appliances.forEach((appliance, appIndex) => {
        appliance.slots.forEach((slot, slotIndex) => {
            if (slot.status === 'cooking' && now >= slot.readyTime) {
                slot.status = 'ready';
                updated = true;
            }
        });
    });
    
    if (updated) {
        renderAppliances();
    }
}

// ============================================
// CUSTOMER MANAGEMENT
// ============================================
function scheduleCustomers() {
    const level = LEVELS[gameState.level];
    
    // Schedule initial customers
    level.customerArrival.forEach((delay, index) => {
        setTimeout(() => {
            if (gameState.gameActive) {
                spawnCustomer(index);
            }
        }, delay * 1000);
    });
}

function spawnCustomer(slotIndex) {
    if (!gameState.gameActive) return;
    
    const slot = gameState.customers[slotIndex];
    if (slot !== null) return; // Slot occupied
    
    const level = LEVELS[gameState.level];
    const customerType = CUSTOMER_TYPES[Math.floor(Math.random() * CUSTOMER_TYPES.length)];
    
    // Choose order based on distribution
    const order = chooseOrder(level.orderDistribution);
    
    const customer = {
        type: customerType,
        order: order,
        waitTime: 0,
        arrivalTime: Date.now(),
        consuming: false
    };
    
    gameState.customers[slotIndex] = customer;
    renderCustomers();
}

function chooseOrder(distribution) {
    const rand = Math.random();
    let cumulative = 0;
    
    for (const [recipe, prob] of Object.entries(distribution)) {
        cumulative += prob;
        if (rand <= cumulative) {
            return recipe;
        }
    }
    
    return Object.keys(distribution)[0];
}

function serveCustomer(customerIndex, recipe) {
    const customer = gameState.customers[customerIndex];
    if (!customer || customer.consuming) return;
    
    if (customer.order !== recipe) return; // Wrong order
    
    const waitTime = customer.waitTime;
    const payment = calculatePayment(recipe, waitTime);
    
    gameState.coins += payment;
    
    // Show reaction
    const reaction = getReaction(waitTime);
    customer.reaction = reaction;
    customer.consuming = true;
    
    renderCustomers();
    updateCoinsDisplay();
    
    // Customer consumes for 2 seconds then leaves
    setTimeout(() => {
        gameState.customers[customerIndex] = null;
        renderCustomers();
        
        // Spawn new customer after 5 seconds
        const level = LEVELS[gameState.level];
        setTimeout(() => {
            if (gameState.gameActive) {
                spawnCustomer(customerIndex);
            }
        }, level.customerInterval * 1000);
    }, 2000);
}

function calculatePayment(recipeId, waitTime) {
    const recipe = RECIPES[recipeId];
    const basePrice = recipe.price;
    
    if (waitTime < 20) return basePrice;
    if (waitTime < 30) return Math.floor(basePrice * 0.75);
    if (waitTime < 40) return Math.floor(basePrice * 0.50);
    if (waitTime < 50) return Math.floor(basePrice * 0.25);
    return 0;
}

function getReaction(waitTime) {
    if (waitTime < 20) return '😊'; // Happy
    if (waitTime < 30) return '🙂'; // Smile
    if (waitTime < 40) return '😐'; // Neutral
    if (waitTime < 50) return '☹️'; // Sad
    return '😠'; // Angry
}

// ============================================
// APPLIANCE & INGREDIENT MANAGEMENT
// ============================================
function selectIngredient(ingredientId) {
    if (gameState.selectedIngredient === ingredientId) {
        gameState.selectedIngredient = null;
    } else {
        gameState.selectedIngredient = ingredientId;
        gameState.selectedAppliance = null;
    }
    renderIngredients();
    renderAppliances();
}

function selectAppliance(applianceIndex) {
    // If ingredient selected, add to appliance
    if (gameState.selectedIngredient) {
        addIngredientToAppliance(applianceIndex, gameState.selectedIngredient);
        gameState.selectedIngredient = null;
        renderIngredients();
        renderAppliances();
        return;
    }
    
    // Otherwise, open appliance modal
    openApplianceModal(applianceIndex);
}

function addIngredientToAppliance(applianceIndex, ingredientId) {
    const appliance = gameState.appliances[applianceIndex];
    
    // Max 5 ingredients
    if (appliance.ingredientsAdded.length >= 5) return;
    
    appliance.ingredientsAdded.push({
        id: ingredientId,
        addedTime: Date.now()
    });
}

function tossIngredient(applianceIndex, ingredientIndex) {
    const appliance = gameState.appliances[applianceIndex];
    const ingredient = appliance.ingredientsAdded[ingredientIndex];
    
    const timeSinceAdded = (Date.now() - ingredient.addedTime) / 1000;
    if (timeSinceAdded < 5) return; // Can't toss before 5 seconds
    
    appliance.ingredientsAdded.splice(ingredientIndex, 1);
    openApplianceModal(applianceIndex);
}

function startCooking(applianceIndex, slotIndex, recipeId) {
    const appliance = gameState.appliances[applianceIndex];
    const slot = appliance.slots[slotIndex];
    const recipe = RECIPES[recipeId];
    
    // Check if we have the ingredients
    const ingredientCounts = {};
    appliance.ingredientsAdded.forEach(ing => {
        ingredientCounts[ing.id] = (ingredientCounts[ing.id] || 0) + 1;
    });
    
    for (const [ingId, count] of Object.entries(recipe.ingredients)) {
        if ((ingredientCounts[ingId] || 0) < count) {
            return; // Not enough ingredients
        }
    }
    
    // Remove used ingredients
    for (const [ingId, count] of Object.entries(recipe.ingredients)) {
        for (let i = 0; i < count; i++) {
            const index = appliance.ingredientsAdded.findIndex(ing => ing.id === ingId);
            if (index !== -1) {
                appliance.ingredientsAdded.splice(index, 1);
            }
        }
    }
    
    // Start cooking
    slot.recipe = recipeId;
    slot.status = 'cooking';
    slot.startTime = Date.now();
    slot.readyTime = Date.now() + (recipe.prepTime * 1000);
    
    closeApplianceModal();
    closeRecipeModal();
    renderAppliances();
}

function serveDish(applianceIndex, slotIndex) {
    const slot = gameState.appliances[applianceIndex].slots[slotIndex];
    if (slot.status !== 'ready') return;
    
    gameState.selectedAppliance = applianceIndex;
    gameState.selectedSlot = slotIndex;
    gameState.selectedDish = slot.recipe;
    
    openServeModal();
}

function completeServe(customerIndex) {
    if (gameState.selectedDish === null) return;
    
    // Clear the slot
    const appliance = gameState.appliances[gameState.selectedAppliance];
    const slot = appliance.slots[gameState.selectedSlot];
    slot.recipe = null;
    slot.status = 'empty';
    slot.startTime = null;
    slot.readyTime = null;
    
    // Serve customer
    serveCustomer(customerIndex, gameState.selectedDish);
    
    // Reset selection
    gameState.selectedAppliance = null;
    gameState.selectedSlot = null;
    gameState.selectedDish = null;
    
    closeServeModal();
    renderAppliances();
}

function cancelServe() {
    gameState.selectedAppliance = null;
    gameState.selectedSlot = null;
    gameState.selectedDish = null;
    closeServeModal();
}

// ============================================
// RENDERING
// ============================================
function renderGame() {
    const level = LEVELS[gameState.level];
    
    // Update top bar
    const minutes = Math.floor(gameState.timeRemaining / 60);
    const seconds = gameState.timeRemaining % 60;
    document.getElementById('timer').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    updateCoinsDisplay();
    
    renderCustomers();
    renderAppliances();
    renderIngredients();
}

function updateCoinsDisplay() {
    document.getElementById('coins').textContent = `£${gameState.coins}`;
    document.getElementById('goal').textContent = `£${gameState.goal}`;
}

function renderCustomers() {
    const container = document.getElementById('customerSlots');
    container.innerHTML = '';
    
    gameState.customers.forEach((customer, index) => {
        const slot = document.createElement('div');
        slot.className = 'customer-slot';
        
        if (customer) {
            slot.classList.add('occupied');
            if (customer.consuming) {
                slot.classList.add('customer-consuming');
            }
            
            const avatar = document.createElement('div');
            avatar.className = 'customer-avatar';
            avatar.textContent = customer.type.icon;
            slot.appendChild(avatar);
            
            if (!customer.consuming) {
                const order = document.createElement('div');
                order.className = 'customer-order';
                order.textContent = RECIPES[customer.order].icon;
                slot.appendChild(order);
                
                const timer = document.createElement('div');
                timer.className = 'customer-timer';
                if (customer.waitTime >= 40) timer.classList.add('warning');
                const mins = Math.floor(customer.waitTime / 60);
                const secs = customer.waitTime % 60;
                timer.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
                slot.appendChild(timer);
            }
            
            if (customer.reaction) {
                const reaction = document.createElement('div');
                reaction.className = 'customer-reaction';
                reaction.textContent = customer.reaction;
                slot.appendChild(reaction);
            }
        }
        
        container.appendChild(slot);
    });
}

function updateCustomerDisplay(index) {
    renderCustomers(); // Simple approach: re-render all
}

function renderAppliances() {
    const container = document.getElementById('applianceSlots');
    container.innerHTML = '';
    
    gameState.appliances.forEach((appliance, index) => {
        const applianceData = APPLIANCES[appliance.type];
        
        const slot = document.createElement('div');
        slot.className = 'appliance-slot';
        if (gameState.selectedAppliance === index) {
            slot.classList.add('selected');
        }
        slot.onclick = () => selectAppliance(index);
        
        const icon = document.createElement('div');
        icon.className = 'appliance-icon';
        icon.textContent = applianceData.icon;
        slot.appendChild(icon);
        
        const name = document.createElement('div');
        name.className = 'appliance-name';
        const ingredientCount = appliance.ingredientsAdded.length;
        name.textContent = `${t(applianceData.nameKey)} (${ingredientCount}/5)`;
        slot.appendChild(name);
        
        // Check for ready dishes
        const readyCount = appliance.slots.filter(s => s.status === 'ready').length;
        if (readyCount > 0) {
            const badge = document.createElement('div');
            badge.className = 'appliance-badge';
            badge.textContent = readyCount;
            slot.appendChild(badge);
        }
        
        // Check for cooking
        const cookingSlots = appliance.slots.filter(s => s.status === 'cooking');
        if (cookingSlots.length > 0) {
            const status = document.createElement('div');
            status.className = 'appliance-status';
            status.textContent = '🔥';
            slot.appendChild(status);
        }
        
        container.appendChild(slot);
    });
}

function renderIngredients() {
    const level = LEVELS[gameState.level];
    const container = document.getElementById('ingredientSlots');
    container.innerHTML = '';
    
    level.ingredients.forEach(ingredientId => {
        const ingredient = INGREDIENTS[ingredientId];
        
        const slot = document.createElement('div');
        slot.className = 'ingredient-slot';
        if (gameState.selectedIngredient === ingredientId) {
            slot.classList.add('selected');
        }
        slot.onclick = () => selectIngredient(ingredientId);
        
        const icon = document.createElement('div');
        icon.className = 'ingredient-icon';
        icon.textContent = ingredient.icon;
        slot.appendChild(icon);
        
        const name = document.createElement('div');
        name.className = 'ingredient-name';
        name.textContent = t(ingredient.nameKey);
        slot.appendChild(name);
        
        container.appendChild(slot);
    });
}

// ============================================
// MODAL MANAGEMENT
// ============================================
function openApplianceModal(applianceIndex) {
    const appliance = gameState.appliances[applianceIndex];
    const applianceData = APPLIANCES[appliance.type];
    
    document.getElementById('applianceName').textContent = t(applianceData.nameKey);
    
    // Show ingredients in appliance with count
    const ingredientsContainer = document.getElementById('ingredientsInAppliance');
    const ingredientCount = appliance.ingredientsAdded.length;
    ingredientsContainer.innerHTML = `<h3>${t('ingredientsInAppliance')} (${ingredientCount}/5)</h3>`;
    
    const ingredientsList = document.createElement('div');
    ingredientsList.className = 'ingredients-list';
    
    appliance.ingredientsAdded.forEach((ing, index) => {
        const ingData = INGREDIENTS[ing.id];
        const ingDiv = document.createElement('div');
        ingDiv.className = 'ingredient-in-appliance';
        
        const icon = document.createElement('div');
        icon.style.fontSize = '32px';
        icon.textContent = ingData.icon;
        ingDiv.appendChild(icon);
        
        const timeSinceAdded = (Date.now() - ing.addedTime) / 1000;
        const canToss = timeSinceAdded >= 5;
        
        const tossBtn = document.createElement('button');
        tossBtn.className = 'toss-btn';
        tossBtn.textContent = '×';
        tossBtn.disabled = !canToss;
        tossBtn.onclick = () => tossIngredient(applianceIndex, index);
        ingDiv.appendChild(tossBtn);
        
        ingredientsList.appendChild(ingDiv);
    });
    
    ingredientsContainer.appendChild(ingredientsList);
    
    renderApplianceModalSlots(applianceIndex);
    
    document.getElementById('applianceModal').classList.remove('hidden');
    
    // Start updating the modal in real-time
    startApplianceModalUpdates(applianceIndex);
}

// New function to render just the slots in the modal
function renderApplianceModalSlots(applianceIndex) {
    const appliance = gameState.appliances[applianceIndex];
    const slotsContainer = document.getElementById('applianceModalSlots');
    slotsContainer.innerHTML = '';
    
    appliance.slots.forEach((slot, slotIndex) => {
        const slotDiv = document.createElement('div');
        slotDiv.className = 'recipe-slot';
        
        const slotInfo = document.createElement('div');
        slotInfo.className = 'recipe-slot-info';
        
        if (slot.status === 'empty') {
            slotInfo.innerHTML = `<span>${t('slot')} ${slotIndex + 1}: ${t('empty')}</span>`;
            
            const actions = document.createElement('div');
            actions.className = 'recipe-actions';
            const cookBtn = document.createElement('button');
            cookBtn.textContent = t('cook');
            cookBtn.onclick = () => openRecipeModal(applianceIndex, slotIndex);
            actions.appendChild(cookBtn);
            slotDiv.appendChild(actions);
        } else if (slot.status === 'cooking') {
            const recipe = RECIPES[slot.recipe];
            const remaining = Math.max(0, Math.ceil((slot.readyTime - Date.now()) / 1000));
            slotInfo.innerHTML = `
                <div class="recipe-icon">${recipe.icon}</div>
                <div class="recipe-details">
                    <div class="recipe-name">${t(recipe.nameKey)}</div>
                    <div class="recipe-timer">${t('cooking')}: ${remaining}s</div>
                </div>
            `;
        } else if (slot.status === 'ready') {
            const recipe = RECIPES[slot.recipe];
            slotInfo.innerHTML = `
                <div class="recipe-icon">${recipe.icon}</div>
                <div class="recipe-details">
                    <div class="recipe-name">${t(recipe.nameKey)}</div>
                    <div class="recipe-timer">${t('ready')}!</div>
                </div>
            `;
            
            const actions = document.createElement('div');
            actions.className = 'recipe-actions';
            const serveBtn = document.createElement('button');
            serveBtn.textContent = t('serve');
            serveBtn.onclick = () => serveDish(applianceIndex, slotIndex);
            actions.appendChild(serveBtn);
            slotDiv.appendChild(actions);
        }
        
        slotDiv.insertBefore(slotInfo, slotDiv.firstChild);
        slotsContainer.appendChild(slotDiv);
    });
}

// New: Real-time updates for appliance modal
let applianceModalUpdateInterval = null;

function startApplianceModalUpdates(applianceIndex) {
    // Clear any existing interval
    if (applianceModalUpdateInterval) {
        clearInterval(applianceModalUpdateInterval);
    }
    
    // Immediately check for ready dishes when opening modal
    updateApplianceModalState(applianceIndex);
    
    // Update every 500ms (twice per second) for smoother updates
    applianceModalUpdateInterval = setInterval(() => {
        updateApplianceModalState(applianceIndex);
    }, 500);
}

function updateApplianceModalState(applianceIndex) {
    // Check if modal is still open
    const modal = document.getElementById('applianceModal');
    if (modal.classList.contains('hidden')) {
        clearInterval(applianceModalUpdateInterval);
        applianceModalUpdateInterval = null;
        return;
    }
    
    const appliance = gameState.appliances[applianceIndex];
    
    // Update ingredient count and toss buttons
    const ingredientCount = appliance.ingredientsAdded.length;
    const header = document.querySelector('#ingredientsInAppliance h3');
    if (header) {
        header.textContent = `${t('ingredientsInAppliance')} (${ingredientCount}/5)`;
    }
    
    // Update toss button states
    const ingredientDivs = document.querySelectorAll('.ingredient-in-appliance');
    ingredientDivs.forEach((div, index) => {
        if (index < appliance.ingredientsAdded.length) {
            const ing = appliance.ingredientsAdded[index];
            const timeSinceAdded = (Date.now() - ing.addedTime) / 1000;
            const canToss = timeSinceAdded >= 5;
            const tossBtn = div.querySelector('.toss-btn');
            if (tossBtn) {
                tossBtn.disabled = !canToss;
            }
        }
    });
    
    // Update cooking timers and check for ready dishes
    let needsRerender = false;
    const now = Date.now();
    
    appliance.slots.forEach((slot, slotIndex) => {
        if (slot.status === 'cooking') {
            // Check if cooking is done
            if (now >= slot.readyTime) {
                slot.status = 'ready';
                needsRerender = true;
            }
        }
    });
    
    // Re-render slots if any dish became ready
    if (needsRerender) {
        renderApplianceModalSlots(applianceIndex);
        renderAppliances(); // Update main board too
    } else {
        // Just update cooking timers without full re-render
        appliance.slots.forEach((slot, slotIndex) => {
            if (slot.status === 'cooking') {
                const remaining = Math.max(0, Math.ceil((slot.readyTime - now) / 1000));
                const slotDivs = document.querySelectorAll('.recipe-slot');
                const timerElem = slotDivs[slotIndex]?.querySelector('.recipe-timer');
                if (timerElem) {
                    timerElem.textContent = `${t('cooking')}: ${remaining}s`;
                }
            }
        });
    }
}

function closeApplianceModal() {
    if (applianceModalUpdateInterval) {
        clearInterval(applianceModalUpdateInterval);
        applianceModalUpdateInterval = null;
    }
    document.getElementById('applianceModal').classList.add('hidden');
}

function openRecipeModal(applianceIndex, slotIndex) {
    const appliance = gameState.appliances[applianceIndex];
    const applianceData = APPLIANCES[appliance.type];
    
    const recipeList = document.getElementById('recipeList');
    recipeList.innerHTML = '';
    
    applianceData.recipes.forEach(recipeId => {
        const recipe = RECIPES[recipeId];
        
        // Check if we have ingredients
        const ingredientCounts = {};
        appliance.ingredientsAdded.forEach(ing => {
            ingredientCounts[ing.id] = (ingredientCounts[ing.id] || 0) + 1;
        });
        
        let canMake = true;
        let ingredientText = '';
        for (const [ingId, count] of Object.entries(recipe.ingredients)) {
            const has = ingredientCounts[ingId] || 0;
            const ingData = INGREDIENTS[ingId];
            ingredientText += `${ingData.icon} ${t(ingData.nameKey)} (${has}/${count}) `;
            if (has < count) canMake = false;
        }
        
        const option = document.createElement('div');
        option.className = 'recipe-option';
        if (!canMake) option.classList.add('disabled');
        
        option.innerHTML = `
            <div class="recipe-option-header">
                <div class="recipe-option-icon">${recipe.icon}</div>
                <div class="recipe-option-name">${t(recipe.nameKey)}</div>
            </div>
            <div class="recipe-option-details">
                ${ingredientText}<br>
                ${t('timer')}: ${recipe.prepTime}s | £${recipe.price}
            </div>
        `;
        
        if (canMake) {
            option.onclick = () => startCooking(applianceIndex, slotIndex, recipeId);
        }
        
        recipeList.appendChild(option);
    });
    
    document.getElementById('recipeModal').classList.remove('hidden');
}

function closeRecipeModal() {
    document.getElementById('recipeModal').classList.add('hidden');
}

function openServeModal() {
    const customerList = document.getElementById('customerServeList');
    customerList.innerHTML = '';
    
    gameState.customers.forEach((customer, index) => {
        if (!customer || customer.consuming) return;
        
        const canServe = customer.order === gameState.selectedDish;
        
        const option = document.createElement('div');
        option.className = 'customer-serve-option';
        if (!canServe) option.classList.add('disabled');
        
        option.innerHTML = `
            <div style="font-size: 48px;">${customer.type.icon}</div>
            <div style="font-size: 24px;">${RECIPES[customer.order].icon}</div>
        `;
        
        if (canServe) {
            option.onclick = () => completeServe(index);
        }
        
        customerList.appendChild(option);
    });
    
    document.getElementById('serveModal').classList.remove('hidden');
}

function closeServeModal() {
    document.getElementById('serveModal').classList.add('hidden');
}

// ============================================
// GAME END
// ============================================
function endGame() {
    gameState.gameActive = false;
    clearInterval(gameState.gameTimer);
    
    const success = gameState.coins >= gameState.goal;
    
    if (success) {
        showVictoryModal();
        saveScore();
    } else {
        showDefeatModal();
    }
}

function showVictoryModal() {
    document.getElementById('coinsEarnedValue').textContent = `£${gameState.coins}`;
    
    const buttons = document.getElementById('victoryButtons');
    const nextLevelBtn = buttons.querySelector('[data-translate="nextLevel"]');
    
    if (gameState.level >= 3) {
        nextLevelBtn.style.display = 'none';
    } else {
        nextLevelBtn.style.display = 'inline-block';
    }
    
    document.getElementById('victoryModal').classList.remove('hidden');
}

function showDefeatModal() {
    document.getElementById('defeatCoinsValue').textContent = `£${gameState.coins}`;
    document.getElementById('goalValue').textContent = `£${gameState.goal}`;
    document.getElementById('defeatModal').classList.add('hidden');
    document.getElementById('defeatModal').classList.remove('hidden');
}

function retryLevel() {
    document.getElementById('victoryModal').classList.add('hidden');
    document.getElementById('defeatModal').classList.add('hidden');
    startLevel(gameState.level);
}

function nextLevel() {
    document.getElementById('victoryModal').classList.add('hidden');
    startLevel(gameState.level + 1);
}

function backToMenu() {
    document.getElementById('victoryModal').classList.add('hidden');
    document.getElementById('defeatModal').classList.add('hidden');
    document.getElementById('gameContainer').classList.add('hidden');
    showLevelSelection();
}

// ============================================
// FIREBASE / PLAYER DATA
// ============================================
async function getPlayerName() {
    // Get player name from parent window (arcade)
    // First try: parent localStorage with correct key 'arcadePlayerName'
    if (window.parent && window.parent.localStorage) {
        try {
            const name = window.parent.localStorage.getItem('arcadePlayerName');
            if (name) return name;
        } catch (e) {
            console.log('Cannot access parent localStorage');
        }
    }
    
    // Second try: direct property (backup method)
    if (window.parent && window.parent.playerName) {
        return window.parent.playerName;
    }
    
    // If still no name, return null (shouldn't happen in arcade)
    console.warn('No player name found from parent window');
    return null;
}

async function loadBestScores() {
    // Best scores are managed by parent window - we just need player name
    gameState.playerName = await getPlayerName();
    if (!gameState.playerName) {
        console.warn('Cannot track scores: no player name');
    }
}

async function saveScore() {
    if (!gameState.playerName) {
        console.warn('Cannot save score: no player name');
        return;
    }
    
    // Use parent window's saveGameScore function (like all other arcade games)
    if (window.parent && window.parent.saveGameScore) {
        const level = gameState.level;
        const coins = gameState.coins;
        
        // Save with level-specific data
        window.parent.saveGameScore('Restaurant', {
            score: coins,
            level: level
        }).then((result) => {
            if (result && result.isNewBest) {
                // Show celebration for new personal record
                showMessage(`🎉 ${t('newRecord')}! Level ${level}: ${coins} coins!`);
            }
        }).catch((error) => {
            console.error('Error saving score:', error);
        });
    } else {
        console.error('saveGameScore function not found in parent window');
    }
}

// ============================================
// LEADERBOARD
// ============================================
async function showLeaderboard() {
    if (!db) {
        alert('Leaderboard not available');
        return;
    }
    
    document.getElementById('levelSelectionModal').classList.add('hidden');
    
    const tabsContainer = document.getElementById('leaderboardTabs');
    tabsContainer.innerHTML = '';
    
    for (let i = 1; i <= 3; i++) {
        const tab = document.createElement('div');
        tab.className = 'leaderboard-tab';
        if (i === 1) tab.classList.add('active');
        tab.textContent = `${t('level')} ${i}`;
        tab.onclick = () => {
            document.querySelectorAll('.leaderboard-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadLeaderboardData(i);
        };
        tabsContainer.appendChild(tab);
    }
    
    document.getElementById('leaderboardModal').classList.remove('hidden');
    loadLeaderboardData(1);
}

async function loadLeaderboardData(level) {
    const tableContainer = document.getElementById('leaderboardTable');
    tableContainer.innerHTML = '<p>Loading...</p>';
    
    try {
        const snapshot = await db.collection('restaurantPlayers').get();
        
        const players = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.bestScores && data.bestScores[level]) {
                players.push({
                    name: data.playerName,
                    score: data.bestScores[level]
                });
            }
        });
        
        // Sort by score descending
        players.sort((a, b) => b.score - a.score);
        
        // Take top 10
        const top10 = players.slice(0, 10);
        
        if (top10.length === 0) {
            tableContainer.innerHTML = '<p>No scores yet for this level.</p>';
            return;
        }
        
        let html = '<table><thead><tr>';
        html += `<th>${t('rank')}</th>`;
        html += `<th>${t('player')}</th>`;
        html += `<th>${t('bestScore')}</th>`;
        html += '</tr></thead><tbody>';
        
        top10.forEach((player, index) => {
            html += '<tr>';
            html += `<td>${index + 1}</td>`;
            html += `<td>${player.name}</td>`;
            html += `<td>£${player.score}</td>`;
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        tableContainer.innerHTML = html;
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        tableContainer.innerHTML = '<p>Error loading leaderboard.</p>';
    }
}

function closeLeaderboard() {
    document.getElementById('leaderboardModal').classList.add('hidden');
    showLevelSelection();
}


function openRecipeModal(applianceIndex, slotIndex) {
    const appliance = gameState.appliances[applianceIndex];
    const applianceData = APPLIANCES[appliance.type];
    
    const recipeList = document.getElementById('recipeList');
    recipeList.innerHTML = '';
    
    applianceData.recipes.forEach(recipeId => {
        const recipe = RECIPES[recipeId];
        
        // Check if we have ingredients
        const ingredientCounts = {};
        appliance.ingredientsAdded.forEach(ing => {
            ingredientCounts[ing.id] = (ingredientCounts[ing.id] || 0) + 1;
        });
        
        let canMake = true;
        let ingredientText = '';
        for (const [ingId, count] of Object.entries(recipe.ingredients)) {
            const has = ingredientCounts[ingId] || 0;
            const ingData = INGREDIENTS[ingId];
            ingredientText += `${ingData.icon} ${t(ingData.nameKey)} (${has}/${count}) `;
            if (has < count) canMake = false;
        }
        
        const option = document.createElement('div');
        option.className = 'recipe-option';
        if (!canMake) option.classList.add('disabled');
        
        option.innerHTML = `
            <div class="recipe-option-header">
                <div class="recipe-option-icon">${recipe.icon}</div>
                <div class="recipe-option-name">${t(recipe.nameKey)}</div>
            </div>
            <div class="recipe-option-details">
                ${ingredientText}<br>
                ${t('timer')}: ${recipe.prepTime}s | £${recipe.price}
            </div>
        `;
        
        if (canMake) {
            option.onclick = () => startCooking(applianceIndex, slotIndex, recipeId);
        }
        
        recipeList.appendChild(option);
    });
    
    document.getElementById('recipeModal').classList.remove('hidden');
}

function closeRecipeModal() {
    document.getElementById('recipeModal').classList.add('hidden');
}

function openServeModal() {
    const customerList = document.getElementById('customerServeList');
    customerList.innerHTML = '';
    
    gameState.customers.forEach((customer, index) => {
        if (!customer || customer.consuming) return;
        
        const canServe = customer.order === gameState.selectedDish;
        
        const option = document.createElement('div');
        option.className = 'customer-serve-option';
        if (!canServe) option.classList.add('disabled');
        
        const mins = Math.floor(customer.waitTime / 60);
        const secs = customer.waitTime % 60;
        const waitTimeText = `${mins}:${secs.toString().padStart(2, '0')}`;
        
        option.innerHTML = `
            <div style="font-size: 48px;">${customer.type.icon}</div>
            <div style="font-size: 24px;">${RECIPES[customer.order].icon}</div>
            <div style="font-size: 14px; margin-top: 5px; color: ${customer.waitTime >= 40 ? '#ff6b6b' : '#666'};">⏱️ ${waitTimeText}</div>
        `;
        
        if (canServe) {
            option.onclick = () => completeServe(index);
        }
        
        customerList.appendChild(option);
    });
    
    document.getElementById('serveModal').classList.remove('hidden');
}

function closeServeModal() {
    document.getElementById('serveModal').classList.add('hidden');
}

function completeServe(customerIndex) {
    if (gameState.selectedDish === null) return;
    
    // Clear the slot
    const appliance = gameState.appliances[gameState.selectedAppliance];
    const slot = appliance.slots[gameState.selectedSlot];
    slot.recipe = null;
    slot.status = 'empty';
    slot.startTime = null;
    slot.readyTime = null;
    
    // Serve customer
    serveCustomer(customerIndex, gameState.selectedDish);
    
    // Reset selection
    gameState.selectedAppliance = null;
    gameState.selectedSlot = null;
    gameState.selectedDish = null;
    
    // Close both modals
    closeServeModal();
    closeApplianceModal();
    
    // Update main game display
    renderAppliances();
}

function cancelServe() {
    gameState.selectedAppliance = null;
    gameState.selectedSlot = null;
    gameState.selectedDish = null;
    closeServeModal();
}

// ============================================
// GAME END
// ============================================
function endGame() {
    gameState.gameActive = false;
    clearInterval(gameState.gameTimer);
    
    const success = gameState.coins >= gameState.goal;
    
    if (success) {
        showVictoryModal();
        saveScore();
    } else {
        showDefeatModal();
    }
}

function showVictoryModal() {
    document.getElementById('coinsEarnedValue').textContent = `£${gameState.coins}`;
    
    const buttons = document.getElementById('victoryButtons');
    const nextLevelBtn = buttons.querySelector('[data-translate="nextLevel"]');
    
    if (gameState.level >= 3) {
        nextLevelBtn.style.display = 'none';
    } else {
        nextLevelBtn.style.display = 'inline-block';
    }
    
    document.getElementById('victoryModal').classList.remove('hidden');
}

function showDefeatModal() {
    document.getElementById('defeatCoinsValue').textContent = `£${gameState.coins}`;
    document.getElementById('goalValue').textContent = `£${gameState.goal}`;
    document.getElementById('defeatModal').classList.remove('hidden');
}

function retryLevel() {
    document.getElementById('victoryModal').classList.add('hidden');
    document.getElementById('defeatModal').classList.add('hidden');
    startLevel(gameState.level);
}

function nextLevel() {
    document.getElementById('victoryModal').classList.add('hidden');
    startLevel(gameState.level + 1);
}

function backToMenu() {
    document.getElementById('victoryModal').classList.add('hidden');
    document.getElementById('defeatModal').classList.add('hidden');
    document.getElementById('gameContainer').classList.add('hidden');
    showLevelSelection();
}

// ============================================
// FIREBASE / PLAYER DATA
// ============================================
async function getPlayerName() {
    // Get player name from parent window (arcade)
    // First try: parent localStorage with correct key 'arcadePlayerName'
    if (window.parent && window.parent.localStorage) {
        try {
            const name = window.parent.localStorage.getItem('arcadePlayerName');
            if (name) return name;
        } catch (e) {
            console.log('Cannot access parent localStorage');
        }
    }
    
    // Second try: direct property (backup method)
    if (window.parent && window.parent.playerName) {
        return window.parent.playerName;
    }
    
    // If still no name, return null (shouldn't happen in arcade)
    console.warn('No player name found from parent window');
    return null;
}

async function loadBestScores() {
    // Best scores are managed by parent window - we just need player name
    gameState.playerName = await getPlayerName();
    if (!gameState.playerName) {
        console.warn('Cannot track scores: no player name');
    }
}

async function saveScore() {
    if (!gameState.playerName) {
        console.warn('Cannot save score: no player name');
        return;
    }
    
    // Use parent window's saveGameScore function (like all other arcade games)
    if (window.parent && window.parent.saveGameScore) {
        const level = gameState.level;
        const coins = gameState.coins;
        
        // Save with level-specific data
        window.parent.saveGameScore('Restaurant', {
            score: coins,
            level: level
        }).then((result) => {
            if (result && result.isNewBest) {
                // Show celebration for new personal record
                showMessage(`🎉 ${t('newRecord')}! Level ${level}: ${coins} coins!`);
            }
        }).catch((error) => {
            console.error('Error saving score:', error);
        });
    } else {
        console.error('saveGameScore function not found in parent window');
    }
}

// ============================================
// LEADERBOARD
// ============================================
async function showLeaderboard() {
    if (!db) {
        alert('Leaderboard not available');
        return;
    }
    
    document.getElementById('levelSelectionModal').classList.add('hidden');
    
    const tabsContainer = document.getElementById('leaderboardTabs');
    tabsContainer.innerHTML = '';
    
    for (let i = 1; i <= 3; i++) {
        const tab = document.createElement('div');
        tab.className = 'leaderboard-tab';
        if (i === 1) tab.classList.add('active');
        tab.textContent = `${t('level')} ${i}`;
        tab.onclick = () => {
            document.querySelectorAll('.leaderboard-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadLeaderboardData(i);
        };
        tabsContainer.appendChild(tab);
    }
    
    document.getElementById('leaderboardModal').classList.remove('hidden');
    loadLeaderboardData(1);
}

async function loadLeaderboardData(level) {
    const tableContainer = document.getElementById('leaderboardTable');
    tableContainer.innerHTML = '<p>Loading...</p>';
    
    try {
        const snapshot = await db.collection('restaurantPlayers').get();
        
        const players = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.bestScores && data.bestScores[level]) {
                players.push({
                    name: data.playerName,
                    score: data.bestScores[level]
                });
            }
        });
        
        // Sort by score descending
        players.sort((a, b) => b.score - a.score);
        
        // Take top 10
        const top10 = players.slice(0, 10);
        
        if (top10.length === 0) {
            tableContainer.innerHTML = '<p>No scores yet for this level.</p>';
            return;
        }
        
        let html = '<table><thead><tr>';
        html += `<th>${t('rank')}</th>`;
        html += `<th>${t('player')}</th>`;
        html += `<th>${t('bestScore')}</th>`;
        html += '</tr></thead><tbody>';
        
        top10.forEach((player, index) => {
            html += '<tr>';
            html += `<td>${index + 1}</td>`;
            html += `<td>${player.name}</td>`;
            html += `<td>£${player.score}</td>`;
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        tableContainer.innerHTML = html;
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        tableContainer.innerHTML = '<p>Error loading leaderboard.</p>';
    }
}

function closeLeaderboard() {
    document.getElementById('leaderboardModal').classList.add('hidden');
    showLevelSelection();
}
