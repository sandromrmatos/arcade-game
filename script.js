// Load game into iframe
function loadGame(name) {
  const frame = document.getElementById("game-frame");
  frame.src = name === "home" ? "home.html" : `launch.html?game=${name}`;
}

// Build menu
async function buildMenu() {
  const menu = document.getElementById("menu");

  const homeBtn = document.createElement("button");
  homeBtn.textContent = "Home";
  homeBtn.onclick = () => loadGame("home");
  menu.appendChild(homeBtn);

  const response = await fetch("games.json");
  const data = await response.json();

  data.games.forEach(folder => {
    const btn = document.createElement("button");

    const img = document.createElement("img");
    img.src = `icons/${folder}.png`;
    img.className = "menu-icon";

    const span = document.createElement("span");
    span.textContent = folder;

    btn.appendChild(img);
    btn.appendChild(span);

    btn.onclick = () => loadGame(folder);
    menu.appendChild(btn);
  });
}

buildMenu();

// MUSIC PLAYER
const audioFiles = [
  "audio/Moss_Path.mp3",
  "audio/Poisonous_Lavender.mp3",
  "audio/Sunlight_Sprout.mp3",
  "audio/Voltage_Collapse.mp3",
  "audio/Haunted_Corridor.mp3",
  "audio/Hidden_Glade.mp3",
  "audio/Pocket_Kingdom.mp3"
];

let currentTrack = 0;
let isPlaying = false;
let audioPlayer = new Audio();

audioPlayer.addEventListener("ended", () => {
  currentTrack = (currentTrack + 1) % audioFiles.length;
  audioPlayer.src = audioFiles[currentTrack];
  audioPlayer.play();
});

document.getElementById("music-btn").onclick = () => {
  const btn = document.getElementById("music-btn");

  if (!isPlaying) {
    audioPlayer.src = audioFiles[currentTrack];
    audioPlayer.play();
    isPlaying = true;
    btn.textContent = "⏸️";
  } else {
    audioPlayer.pause();
    isPlaying = false;
    btn.textContent = "▶️";
  }
};

// MOBILE KEYBOARD INPUT
const keyboardBtn = document.getElementById("keyboard-toggle");
const mobileInput = document.getElementById("mobile-keyboard-input");

keyboardBtn.addEventListener("click", () => {
  if (mobileInput.style.display === "none") {
    mobileInput.style.display = "block";
    mobileInput.focus();
  } else {
    mobileInput.style.display = "none";
  }
});

// Map mobile keys → Arrow keys
mobileInput.addEventListener("keydown", e => {
  const frame = document.getElementById("game-frame");

  const map = {
    "a": "ArrowLeft",
    "s": "ArrowRight",
    "w": "ArrowUp",
    "z": "ArrowDown",
    " ": " "
  };

  const key = map[e.key.toLowerCase()];
  if (!key) return;

  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true
  });

  frame.contentWindow.document.dispatchEvent(event);
});
