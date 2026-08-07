// Translations for bilingual support (EN/PT)
const translations = {
    en: {
        gameTitle: "Guess Who",
        timeLabel: "Time:",
        askQuestion: "Ask a Question",
        selectAttribute: "Select Attribute:",
        chooseAttribute: "-- Choose --",
        hair: "Hair",
        age: "Age",
        skin: "Skin Colour",
        gender: "Gender",
        glasses: "Glasses",
        selectValue: "Select Value:",
        chooseValue: "-- Choose --",
        askBtn: "Ask Question",
        readyGuess: "Start Eliminating",
        stopEliminating: "Stop Eliminating",
        instructions: "Ask questions to eliminate characters. Click on faces to grey them out. Win by having only the AI's character remaining!",
        victoryTitle: "You Won!",
        victoryMessage: "Congratulations! You found the correct person!",
        yourTime: "Your Time:",
        newRecord: "🎉 NEW BEST TIME! 🎉",
        playAgain: "Play Again",
        returnMenu: "Return to Menu",
        defeatTitle: "Wrong Guess!",
        defeatMessage: "That wasn't the correct person. Try again!",
        tryAgain: "Try Again",
        // Attribute values
        blonde: "Blonde",
        brown: "Brown",
        black: "Black",
        young: "Young",
        old: "Old",
        light: "Light",
        dark: "Dark",
        female: "Female",
        male: "Male",
        yes: "Yes",
        no: "No",
        // Question and answer templates
        questionTemplate: "Is the person's {attribute} {value}?",
        answerYes: "YES - The person's {attribute} is {value}",
        answerNo: "NO - The person's {attribute} is NOT {value}",
        person: "Person"
    },
    pt: {
        gameTitle: "Quem É?",
        timeLabel: "Tempo:",
        askQuestion: "Faça uma Pergunta",
        selectAttribute: "Selecione Atributo:",
        chooseAttribute: "-- Escolha --",
        hair: "Cabelo",
        age: "Idade",
        skin: "Cor da Pele",
        gender: "Gênero",
        glasses: "Óculos",
        selectValue: "Selecione Valor:",
        chooseValue: "-- Escolha --",
        askBtn: "Perguntar",
        readyGuess: "Começar Eliminação",
        stopEliminating: "Parar Eliminação",
        instructions: "Faça perguntas para eliminar personagens. Clique nos rostos para cinzá-los. Ganhe tendo apenas o personagem da IA restante!",
        victoryTitle: "Você Ganhou!",
        victoryMessage: "Parabéns! Você encontrou a pessoa correta!",
        yourTime: "Seu Tempo:",
        newRecord: "🎉 NOVO MELHOR TEMPO! 🎉",
        playAgain: "Jogar Novamente",
        returnMenu: "Voltar ao Menu",
        defeatTitle: "Palpite Errado!",
        defeatMessage: "Essa não era a pessoa correta. Tente novamente!",
        tryAgain: "Tentar Novamente",
        // Attribute values
        blonde: "Loiro",
        brown: "Castanho",
        black: "Preto",
        young: "Jovem",
        old: "Idoso",
        light: "Clara",
        dark: "Escura",
        female: "Feminino",
        male: "Masculino",
        yes: "Sim",
        no: "Não",
        // Question and answer templates
        questionTemplate: "A pessoa tem {attribute} {value}?",
        answerYes: "SIM - A pessoa tem {attribute} {value}",
        answerNo: "NÃO - A pessoa NÃO tem {attribute} {value}",
        person: "Pessoa"
    }
};

// Get current language from parent window
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

// Translation helper function
function t(key) {
    const lang = getParentLanguage();
    return translations[lang][key] || key;
}

// Update all elements with data-translate attribute
function updateLanguage() {
    const lang = getParentLanguage();
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            if (element.tagName === 'OPTION' || element.tagName === 'SELECT') {
                element.textContent = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });
    
    // Update value options if attribute is selected
    const attributeSelect = document.getElementById('attributeSelect');
    if (attributeSelect.value) {
        updateValueOptions(attributeSelect.value);
    }
}

// Listen for language change messages from parent
window.addEventListener('message', (event) => {
    if (event.data.type === 'languageChange') {
        updateLanguage();
    }
});

// Character data - 24 people with their attributes (from CSV)
const characters = [
    { id: 1, hair: 'blonde', age: 'young', skin: 'light', gender: 'female', glasses: 'no' },
    { id: 2, hair: 'blonde', age: 'young', skin: 'light', gender: 'male', glasses: 'yes' },
    { id: 3, hair: 'blonde', age: 'young', skin: 'light', gender: 'male', glasses: 'no' },
    { id: 4, hair: 'blonde', age: 'young', skin: 'dark', gender: 'female', glasses: 'no' },
    { id: 5, hair: 'blonde', age: 'young', skin: 'dark', gender: 'male', glasses: 'no' },
    { id: 6, hair: 'blonde', age: 'old', skin: 'light', gender: 'female', glasses: 'no' },
    { id: 7, hair: 'blonde', age: 'old', skin: 'light', gender: 'male', glasses: 'yes' },
    { id: 8, hair: 'blonde', age: 'old', skin: 'dark', gender: 'male', glasses: 'yes' },
    { id: 9, hair: 'brown', age: 'young', skin: 'light', gender: 'female', glasses: 'no' },
    { id: 10, hair: 'brown', age: 'young', skin: 'light', gender: 'male', glasses: 'no' },
    { id: 11, hair: 'brown', age: 'young', skin: 'dark', gender: 'female', glasses: 'no' },
    { id: 12, hair: 'brown', age: 'young', skin: 'dark', gender: 'male', glasses: 'no' },
    { id: 13, hair: 'brown', age: 'old', skin: 'light', gender: 'female', glasses: 'yes' },
    { id: 14, hair: 'brown', age: 'old', skin: 'light', gender: 'female', glasses: 'no' },
    { id: 15, hair: 'brown', age: 'old', skin: 'light', gender: 'male', glasses: 'no' },
    { id: 16, hair: 'brown', age: 'old', skin: 'dark', gender: 'female', glasses: 'no' },
    { id: 17, hair: 'black', age: 'young', skin: 'light', gender: 'female', glasses: 'no' },
    { id: 18, hair: 'black', age: 'young', skin: 'light', gender: 'male', glasses: 'no' },
    { id: 19, hair: 'black', age: 'young', skin: 'dark', gender: 'female', glasses: 'no' },
    { id: 20, hair: 'black', age: 'young', skin: 'dark', gender: 'male', glasses: 'yes' },
    { id: 21, hair: 'black', age: 'young', skin: 'dark', gender: 'female', glasses: 'yes' },
    { id: 22, hair: 'black', age: 'old', skin: 'light', gender: 'male', glasses: 'no' },
    { id: 23, hair: 'black', age: 'old', skin: 'dark', gender: 'female', glasses: 'no' },
    { id: 24, hair: 'black', age: 'old', skin: 'dark', gender: 'male', glasses: 'yes' }
];

// Attribute value options
const attributeValues = {
    hair: ['blonde', 'brown', 'black'],
    age: ['young', 'old'],
    skin: ['light', 'dark'],
    gender: ['female', 'male'],
    glasses: ['yes', 'no']
};

// Game state
let gameState = {
    targetCharacter: null,
    timerStarted: false,
    startTime: null,
    timerInterval: null,
    eliminationMode: false,
    currentLanguage: 'en'
};

// Initialize game
function initGame() {
    gameState.currentLanguage = getParentLanguage();
    updateLanguage();
    
    // Choose random character for AI
    gameState.targetCharacter = characters[Math.floor(Math.random() * characters.length)];
    console.log('AI selected character:', gameState.targetCharacter.id); // For debugging
    
    // Create character cards
    createCharacterCards();
    
    // Setup event listeners
    setupEventListeners();
}

// Create character cards on the board
function createCharacterCards() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';
    
    characters.forEach((char) => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.dataset.id = char.id;
        
        // Create SVG face
        const faceContainer = document.createElement('div');
        faceContainer.className = 'character-face';
        faceContainer.innerHTML = createFaceSVG(char);
        
        const name = document.createElement('div');
        name.className = 'character-name';
        name.textContent = `${t('person')} ${char.id}`;
        
        card.appendChild(faceContainer);
        card.appendChild(name);
        
        card.addEventListener('click', () => handleCardClick(card, char));
        
        board.appendChild(card);
    });
}

// Create SVG representation of a character's face
function createFaceSVG(char) {
    // Skin colors
    const skinColors = {
        light: '#FFE0BD',
        dark: '#8D5524'
    };
    
    // Hair colors
    const hairColors = {
        blonde: '#FFD700',
        brown: '#8B4513',
        black: '#2C2C2C'
    };
    
    const skinColor = skinColors[char.skin];
    const hairColor = hairColors[char.hair];
    
    // CLEAR age difference - young faces are MUCH smaller
    const isYoung = char.age === 'young';
    const faceX = 60;
    const faceY = 60;
    const faceRX = isYoung ? 20 : 32;  // Young: smaller, Old: larger
    const faceRY = isYoung ? 23 : 37;
    const eyeY = isYoung ? 55 : 58;
    const eyeSpacing = isYoung ? 10 : 14;
    const eyeSize = isYoung ? 2.5 : 3.5;
    
    // Hair style based on age and gender
    let hairStyle = '';
    if (char.gender === 'female') {
        // Female - longer hair
        if (isYoung) {
            hairStyle = `
                <ellipse cx="${faceX}" cy="${faceY - 25}" rx="24" ry="28" fill="${hairColor}"/>
                <ellipse cx="${faceX}" cy="${faceY - 15}" rx="26" ry="18" fill="${hairColor}"/>
            `;
        } else {
            hairStyle = `
                <ellipse cx="${faceX}" cy="${faceY - 25}" rx="38" ry="42" fill="${hairColor}"/>
                <ellipse cx="${faceX}" cy="${faceY - 15}" rx="42" ry="25" fill="${hairColor}"/>
            `;
        }
    } else {
        // Male - shorter hair
        if (isYoung) {
            hairStyle = `
                <ellipse cx="${faceX}" cy="${faceY - 28}" rx="22" ry="20" fill="${hairColor}"/>
            `;
        } else {
            hairStyle = `
                <ellipse cx="${faceX}" cy="${faceY - 28}" rx="35" ry="28" fill="${hairColor}"/>
            `;
        }
    }
    
    // Glasses SVG - adjusted for face size
    const glassesY = eyeY - 8;
    const glassesWidth = isYoung ? 14 : 18;
    const glassesHeight = isYoung ? 12 : 16;
    const glassesLeftX = faceX - eyeSpacing - glassesWidth/2 - 3;
    const glassesRightX = faceX + eyeSpacing - glassesWidth/2 + 3;
    const bridgeLeft = faceX - 4;
    const bridgeRight = faceX + 4;
    
    const glasses = char.glasses === 'yes' ? `
        <g class="glasses">
            <rect x="${glassesLeftX}" y="${glassesY}" width="${glassesWidth}" height="${glassesHeight}" fill="none" stroke="#333" stroke-width="2" rx="3"/>
            <rect x="${glassesRightX}" y="${glassesY}" width="${glassesWidth}" height="${glassesHeight}" fill="none" stroke="#333" stroke-width="2" rx="3"/>
            <line x1="${bridgeLeft}" y1="${eyeY}" x2="${bridgeRight}" y2="${eyeY}" stroke="#333" stroke-width="2"/>
        </g>
    ` : '';
    
    const noseLength = isYoung ? 6 : 10;
    const mouthY = eyeY + (isYoung ? 15 : 22);
    const mouthWidth = isYoung ? 8 : 10;
    
    return `
        <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <!-- Hair (behind) -->
            ${hairStyle}
            
            <!-- Face -->
            <ellipse cx="${faceX}" cy="${faceY}" rx="${faceRX}" ry="${faceRY}" fill="${skinColor}" stroke="#333" stroke-width="1.5"/>
            
            <!-- Eyes -->
            <circle cx="${faceX - eyeSpacing}" cy="${eyeY}" r="${eyeSize}" fill="#333"/>
            <circle cx="${faceX + eyeSpacing}" cy="${eyeY}" r="${eyeSize}" fill="#333"/>
            
            <!-- Nose -->
            <line x1="${faceX}" y1="${eyeY + 3}" x2="${faceX}" y2="${eyeY + 3 + noseLength}" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>
            
            <!-- Mouth -->
            <path d="M ${faceX - mouthWidth} ${mouthY} Q ${faceX} ${mouthY + 4} ${faceX + mouthWidth} ${mouthY}" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>
            
            <!-- Glasses (if applicable) -->
            ${glasses}
        </svg>
    `;
}

// Setup event listeners
function setupEventListeners() {
    const attributeSelect = document.getElementById('attributeSelect');
    const valueSelect = document.getElementById('valueSelect');
    const askButton = document.getElementById('askButton');
    const readyToGuess = document.getElementById('readyToGuess');
    
    attributeSelect.addEventListener('change', (e) => {
        if (e.target.value) {
            valueSelect.disabled = false;
            updateValueOptions(e.target.value);
        } else {
            valueSelect.disabled = true;
            valueSelect.innerHTML = `<option value="">${t('chooseValue')}</option>`;
            askButton.disabled = true;
        }
    });
    
    valueSelect.addEventListener('change', (e) => {
        askButton.disabled = !e.target.value;
    });
    
    askButton.addEventListener('click', askQuestion);
    readyToGuess.addEventListener('click', enableEliminationMode);
    
    // Modal buttons
    document.getElementById('playAgainBtn').addEventListener('click', resetGame);
    document.getElementById('tryAgainBtn').addEventListener('click', resetGame);
    document.getElementById('returnMenuBtn').addEventListener('click', returnToMenu);
    document.getElementById('returnMenuBtn2').addEventListener('click', returnToMenu);
}

// Update value options based on selected attribute
function updateValueOptions(attribute) {
    const valueSelect = document.getElementById('valueSelect');
    valueSelect.innerHTML = `<option value="">${t('chooseValue')}</option>`;
    
    const values = attributeValues[attribute];
    values.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = t(value);
        valueSelect.appendChild(option);
    });
}

// Ask question to AI
function askQuestion() {
    // Start timer on first question
    if (!gameState.timerStarted) {
        startTimer();
        gameState.timerStarted = true;
    }
    
    const attribute = document.getElementById('attributeSelect').value;
    const value = document.getElementById('valueSelect').value;
    
    if (!attribute || !value) return;
    
    // Check if AI's character matches the question
    const answer = gameState.targetCharacter[attribute] === value;
    
    // Display answer
    const answerDisplay = document.getElementById('answerDisplay');
    answerDisplay.classList.add('show');
    
    const attributeLabel = t(attribute);
    const valueLabel = t(value);
    
    if (answer) {
        answerDisplay.textContent = t('answerYes')
            .replace('{attribute}', attributeLabel)
            .replace('{value}', valueLabel);
        answerDisplay.style.background = '#d1fae5';
        answerDisplay.style.borderColor = '#10b981';
    } else {
        answerDisplay.textContent = t('answerNo')
            .replace('{attribute}', attributeLabel)
            .replace('{value}', valueLabel);
        answerDisplay.style.background = '#fee2e2';
        answerDisplay.style.borderColor = '#ef4444';
    }
    
    // Reset selectors
    document.getElementById('attributeSelect').value = '';
    document.getElementById('valueSelect').value = '';
    document.getElementById('valueSelect').disabled = true;
    document.getElementById('askButton').disabled = true;
}

// Enable/disable elimination mode (toggle)
function enableEliminationMode() {
    gameState.eliminationMode = !gameState.eliminationMode;
    
    const button = document.getElementById('readyToGuess');
    const cards = document.querySelectorAll('.character-card:not(.greyed-out)');
    
    if (gameState.eliminationMode) {
        // Entering elimination mode
        button.textContent = t('stopEliminating');
        button.style.background = '#ef4444'; // Red color
        cards.forEach(card => card.classList.add('eliminated-mode'));
    } else {
        // Exiting elimination mode
        button.textContent = t('readyGuess');
        button.style.background = '#10b981'; // Green color
        cards.forEach(card => card.classList.remove('eliminated-mode'));
        
        // Check victory condition when stopping elimination
        checkVictoryCondition();
    }
}

// Handle card click
function handleCardClick(card, character) {
    if (gameState.eliminationMode && !card.classList.contains('greyed-out')) {
        card.classList.toggle('greyed-out');
        card.classList.remove('eliminated-mode');
    }
}

// Check victory condition
function checkVictoryCondition() {
    const activeCards = document.querySelectorAll('.character-card:not(.greyed-out)');
    
    if (activeCards.length === 1) {
        const remainingId = parseInt(activeCards[0].dataset.id);
        
        if (remainingId === gameState.targetCharacter.id) {
            // Victory!
            stopTimer();
            showVictoryModal();
        } else {
            // Wrong guess!
            showDefeatModal();
        }
    }
}

// Timer functions
function startTimer() {
    gameState.startTime = Date.now();
    gameState.timerInterval = setInterval(updateTimer, 100);
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('timerDisplay').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function getElapsedTime() {
    return Math.floor((Date.now() - gameState.startTime) / 1000);
}

// Show victory modal
async function showVictoryModal() {
    const finalTime = getElapsedTime();
    const minutes = Math.floor(finalTime / 60);
    const seconds = finalTime % 60;
    const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    document.getElementById('finalTime').textContent = timeString;
    
    // Save score (bestTime - lower is better)
    if (window.parent && window.parent.saveGameScore) {
        try {
            const result = await window.parent.saveGameScore("Guess Who", {
                bestTime: finalTime
            });
            
            if (result && result.isNewBest) {
                document.getElementById('newRecordMessage').classList.remove('hidden');
            } else {
                document.getElementById('newRecordMessage').classList.add('hidden');
            }
        } catch (error) {
            console.error("Error saving score:", error);
            document.getElementById('newRecordMessage').classList.add('hidden');
        }
    } else {
        document.getElementById('newRecordMessage').classList.add('hidden');
    }
    
    document.getElementById('victoryModal').classList.remove('hidden');
}

// Show defeat modal
function showDefeatModal() {
    document.getElementById('defeatModal').classList.remove('hidden');
}

// Reset game
function resetGame() {
    // Hide modals
    document.getElementById('victoryModal').classList.add('hidden');
    document.getElementById('defeatModal').classList.add('hidden');
    
    // Reset game state
    gameState.timerStarted = false;
    gameState.startTime = null;
    gameState.eliminationMode = false;
    stopTimer();
    
    // Reset timer display
    document.getElementById('timerDisplay').textContent = '00:00';
    
    // Reset answer display
    document.getElementById('answerDisplay').classList.remove('show');
    
    // Reset selectors
    document.getElementById('attributeSelect').value = '';
    document.getElementById('valueSelect').value = '';
    document.getElementById('valueSelect').disabled = true;
    document.getElementById('askButton').disabled = true;
    
    // Reset elimination button
    const button = document.getElementById('readyToGuess');
    button.textContent = t('readyGuess');
    button.style.background = '#10b981';
    
    // Reinitialize game
    initGame();
}

// Return to menu
function returnToMenu() {
    if (window.parent && window.parent.location) {
        window.parent.location.href = 'index.html';
    } else {
        window.location.href = '../index.html';
    }
}

// Start game when page loads
document.addEventListener('DOMContentLoaded', () => {
    gameState.currentLanguage = getParentLanguage();
    updateLanguage();
    initGame();
});
