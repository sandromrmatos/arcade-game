// Translations
const translations = {
    en: {
        gameTitle: "Hangman",
        wordsGuessed: "Words Guessed",
        currentStreak: "Current Streak",
        livesRemaining: "Lives Remaining",
        wrongLetters: "Wrong Letters",
        playAgain: "Play Again",
        youWon: "🎉 You Won!",
        youLost: "Game Over! The word was",
        newRecord: "NEW RECORD!",
        scoreSaved: "Score saved successfully!"
    },
    pt: {
        gameTitle: "Forca",
        wordsGuessed: "Palavras Adivinhadas",
        currentStreak: "Sequência Atual",
        livesRemaining: "Vidas Restantes",
        wrongLetters: "Letras Erradas",
        playAgain: "Jogar Novamente",
        youWon: "🎉 Você Ganhou!",
        youLost: "Fim de Jogo! A palavra era",
        newRecord: "NOVO RECORDE!",
        scoreSaved: "Pontuação salva com sucesso!"
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

// Translation function
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
            element.textContent = translations[lang][key];
        }
    });
}

// Listen for language change messages from parent
window.addEventListener('message', (event) => {
    if (event.data.type === 'languageChange') {
        updateLanguage();
    }
});

// Game State
let wordList = [];
let currentWord = '';
let guessedLetters = [];
let correctLetters = [];
let wrongLetters = [];
let lives = 6;
let wordsGuessedCount = 0;
let currentStreak = 0;
let gameActive = false;
let scoreSaved = false;

// Body parts in order
const bodyParts = ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];

// DOM Elements
const wordDisplay = document.getElementById('wordDisplay');
const keyboard = document.getElementById('keyboard');
const livesCount = document.getElementById('livesCount');
const wrongLettersDisplay = document.getElementById('wrongLetters');
const gameMessage = document.getElementById('gameMessage');
const restartBtn = document.getElementById('restartBtn');
const wordsGuessedDisplay = document.getElementById('wordsGuessedCount');
const currentStreakDisplay = document.getElementById('currentStreak');

// Load words from file
async function loadWords() {
    try {
        const response = await fetch('words.txt');
        const text = await response.text();
        wordList = text.trim().split('\n').map(word => word.trim().toUpperCase());
        console.log(`Loaded ${wordList.length} words`);
    } catch (error) {
        console.error('Error loading words:', error);
        // Fallback words if file fails to load
        wordList = ['JAVASCRIPT', 'PYTHON', 'CODING', 'GITHUB', 'BROWSER', 'WEBSITE', 'PUZZLE', 'ARCADE'];
    }
}

// Generate keyboard
function generateKeyboard() {
    keyboard.innerHTML = '';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    letters.forEach(letter => {
        const button = document.createElement('button');
        button.textContent = letter;
        button.className = 'key';
        button.addEventListener('click', () => guessLetter(letter));
        button.setAttribute('data-letter', letter);
        keyboard.appendChild(button);
    });
}

// Start new game
function startGame() {
    // Reset game state
    guessedLetters = [];
    correctLetters = [];
    wrongLetters = [];
    lives = 6;
    gameActive = true;
    scoreSaved = false;
    
    // Pick random word
    currentWord = wordList[Math.floor(Math.random() * wordList.length)];
    console.log('Current word:', currentWord); // For debugging
    
    // Reset UI
    generateKeyboard();
    updateWordDisplay();
    updateLives();
    updateWrongLetters();
    hideAllBodyParts();
    
    // Hide message and buttons
    gameMessage.classList.add('hidden');
    restartBtn.classList.add('hidden');
    saveScoreBtn.classList.add('hidden');
    
    // Update stats display
    updateStats();
}

// Update word display
function updateWordDisplay() {
    wordDisplay.innerHTML = currentWord
        .split('')
        .map(letter => {
            if (correctLetters.includes(letter)) {
                return letter;
            }
            return '_';
        })
        .join(' ');
}

// Update lives display
function updateLives() {
    livesCount.textContent = lives;
}

// Update wrong letters display
function updateWrongLetters() {
    wrongLettersDisplay.textContent = wrongLetters.length > 0 ? wrongLetters.join(', ') : '-';
}

// Update stats display
function updateStats() {
    wordsGuessedDisplay.textContent = wordsGuessedCount;
    currentStreakDisplay.textContent = currentStreak;
}

// Hide all body parts
function hideAllBodyParts() {
    bodyParts.forEach(part => {
        document.getElementById(part).classList.add('hidden');
    });
}

// Show body part
function showBodyPart(index) {
    if (index < bodyParts.length) {
        document.getElementById(bodyParts[index]).classList.remove('hidden');
    }
}

// Guess letter
function guessLetter(letter) {
    if (!gameActive) return;
    if (guessedLetters.includes(letter)) return;
    
    guessedLetters.push(letter);
    
    // Update keyboard button
    const button = document.querySelector(`[data-letter="${letter}"]`);
    
    if (currentWord.includes(letter)) {
        // Correct guess
        correctLetters.push(letter);
        button.classList.add('correct');
        button.disabled = true;
        updateWordDisplay();
        
        // Check for win
        if (checkWin()) {
            endGame(true);
        }
    } else {
        // Wrong guess
        wrongLetters.push(letter);
        button.classList.add('wrong');
        button.disabled = true;
        lives--;
        
        // Show body part
        showBodyPart(6 - lives - 1);
        
        updateLives();
        updateWrongLetters();
        
        // Check for loss
        if (lives === 0) {
            endGame(false);
        }
    }
}

// Check win condition
function checkWin() {
    return currentWord.split('').every(letter => correctLetters.includes(letter));
}

// End game
function endGame(won) {
    gameActive = false;
    
    // Disable all keyboard buttons
    document.querySelectorAll('.key').forEach(button => {
        button.disabled = true;
        if (!button.classList.contains('correct') && !button.classList.contains('wrong')) {
            button.classList.add('used');
        }
    });
    
    // Show message
    gameMessage.classList.remove('hidden');
    
    if (won) {
        gameMessage.className = 'game-message win';
        gameMessage.textContent = t('youWon');
        wordsGuessedCount++;
        currentStreak++;
        updateStats();
        
        // Auto-start next word after 2 seconds
        setTimeout(() => {
            startGame();
        }, 2000);
    } else {
        gameMessage.className = 'game-message lose';
        gameMessage.textContent = `${t('youLost')}: ${currentWord}`;
        currentStreak = 0;
        updateStats();
        
        // Auto-save score when game ends (if player guessed at least 1 word)
        if (wordsGuessedCount > 0 && !scoreSaved) {
            autoSaveScore();
        }
        
        // Show restart button
        restartBtn.classList.remove('hidden');
    }
}

// Auto-save score function
function autoSaveScore() {
    if (window.parent && window.parent.saveGameScore) {
        window.parent.saveGameScore("Hangman", {
            wordsGuessed: wordsGuessedCount
        }).then((result) => {
            scoreSaved = true;
            
            if (result && result.isNewBest) {
                // Show new record message briefly
                setTimeout(() => {
                    gameMessage.textContent = `${t('youLost')}: ${currentWord} - ${t('newRecord')}`;
                }, 500);
            }
        }).catch((error) => {
            console.error("Error saving score:", error);
        });
    } else {
        console.error("saveGameScore function not found in parent window");
    }
}

// Restart game
restartBtn.addEventListener('click', () => {
    startGame();
});

// Initialize game
document.addEventListener('DOMContentLoaded', async () => {
    updateLanguage();
    await loadWords();
    startGame();
});
