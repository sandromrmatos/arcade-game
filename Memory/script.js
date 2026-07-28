// Paths for the pair images
let pairImagePaths = [];
const allPairImages = Array.from({ length: 18 }, (_, i) => `Pairs/${String(i + 1).padStart(2, '0')}.png`);

const backImagePath = "memory card facing down.png";

const gameBoard = document.getElementById("gameBoard");
const turnCountSpan = document.getElementById("turnCount");
const messageDiv = document.getElementById("message");
const resetButton = document.getElementById("resetButton");

let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let turns = 0;
let matchedPairs = 0;
let difficulty = "small";
let gameStarted = false;

// Menu buttons
document.getElementById("btnSmall").addEventListener("click", () => {
  startGame("small");
});

document.getElementById("btnLarge").addEventListener("click", () => {
  startGame("large");
});

function startGame(mode) {
  difficulty = mode;
  
  if (mode === "small") {
    pairImagePaths = allPairImages.slice(0, 8); // 8 pairs = 16 cards
  } else {
    pairImagePaths = allPairImages; // 18 pairs = 36 cards
  }
  
  // Hide menu
  document.getElementById("menuOverlay").style.display = "none";
  gameStarted = true;
  
  initGame();
}

function initGame() {
  // Reset state
  gameBoard.innerHTML = "";
  gameBoard.className = "game-board";
  
  // Set grid size based on difficulty
  if (difficulty === "small") {
    gameBoard.classList.add("grid-small"); // 4x4
  } else {
    gameBoard.classList.add("grid-large"); // 6x6
  }
  
  cards = [];
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  turns = 0;
  matchedPairs = 0;
  turnCountSpan.textContent = "0";
  messageDiv.textContent = "";

  // Create deck: 2 of each image
  const deck = [];
  pairImagePaths.forEach((path, index) => {
    deck.push({ id: index, img: path });
    deck.push({ id: index, img: path });
  });

  // Shuffle deck (Fisher-Yates)
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  // Create card elements
  deck.forEach((cardData, idx) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.id = cardData.id;

    const inner = document.createElement("div");
    inner.classList.add("card-inner");

    const front = document.createElement("div");
    front.classList.add("card-face", "card-front");
    const frontImg = document.createElement("img");
    frontImg.src = cardData.img;
    front.appendChild(frontImg);

    const back = document.createElement("div");
    back.classList.add("card-face", "card-back");
    const backImg = document.createElement("img");
    backImg.src = backImagePath;
    back.appendChild(backImg);

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);

    card.addEventListener("click", () => handleCardClick(card));

    gameBoard.appendChild(card);
    cards.push(card);
  });
}

function handleCardClick(card) {
  if (lockBoard) return;
  if (card === firstCard) return;
  if (card.classList.contains("matched")) return;

  card.classList.add("flipped");

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  lockBoard = true;

  // A turn is when the user clicks 2 images to reveal them
  turns++;
  turnCountSpan.textContent = String(turns);

  checkForMatch();
}

function checkForMatch() {
  const isMatch = firstCard.dataset.id === secondCard.dataset.id;

  if (isMatch) {
    disableMatchedCards();
    matchedPairs++;

    if (matchedPairs === pairImagePaths.length) {
      // All pairs found
      messageDiv.textContent = `You won in ${turns} turns`;
      
      // Save score to leaderboard
      if (window.parent && window.parent.saveGameScore) {
        window.parent.saveGameScore("Memory", {
          turns: turns,
          difficulty: difficulty
        }).then((result) => {
          console.log("Memory score saved successfully");
          if (result && result.isNewBest && window.parent.showNewBestScore) {
            window.parent.showNewBestScore("Memory", { turns: turns, difficulty: difficulty });
          }
        }).catch(err => {
          console.error("Error saving Memory score:", err);
        });
      } else {
        console.error("saveGameScore function not found in parent window");
      }
    }

    resetTurn();
  } else {
    // Flip back after delay (same as flip speed for nice feel)
    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      resetTurn();
    }, 800); // slightly longer than 0.5s for clarity
  }
}

function disableMatchedCards() {
  firstCard.classList.add("matched");
  secondCard.classList.add("matched");
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

// Reset button
resetButton.addEventListener("click", () => {
  if (gameStarted) {
    initGame();
  }
});

// Show menu on startup
document.getElementById("menuOverlay").style.display = "flex";
