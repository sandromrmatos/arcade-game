// Paths for the 8 pair images (duplicated to make 16 cards)
const pairImagePaths = [
  "Pairs/01.png",
  "Pairs/02.png",
  "Pairs/03.png",
  "Pairs/04.png",
  "Pairs/05.png",
  "Pairs/06.png",
  "Pairs/07.png",
  "Pairs/08.png"
];

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

function initGame() {
  // Reset state
  gameBoard.innerHTML = "";
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
resetButton.addEventListener("click", initGame);

// Auto-shuffle and start on load
window.addEventListener("DOMContentLoaded", initGame);
