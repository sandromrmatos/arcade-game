// Load game into iframe (launch screen first)
function loadGame(name) {
  const frame = document.getElementById("game-frame");

  if (name === "home") {
    frame.src = "home.html";
  } else {
    frame.src = `launch.html?game=${name}`;
  }
}

// Build menu from games.json
async function buildMenu() {
  const menu = document.getElementById("menu");

  // Home button
  const homeBtn = document.createElement("button");
  homeBtn.textContent = "Home";
  homeBtn.onclick = () => loadGame("home");
  menu.appendChild(homeBtn);

  // Load game list
  const response = await fetch("games.json");
  const data = await response.json();

  data.games.forEach(folder => {
    const btn = document.createElement("button");

    // Icon
    const img = document.createElement("img");
    img.src = `icons/${folder}.png`;
    img.className = "menu-icon";

    // Text
    const span = document.createElement("span");
    span.textContent = folder;

    btn.appendChild(img);
    btn.appendChild(span);

    btn.onclick = () => loadGame(folder);
    menu.appendChild(btn);
  });
}

buildMenu();

// --- MUSIC PLAYER ---
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

function toggleMusic() {
  const btn = document.getElementById("music-btn");

  if (!isPlaying) {
    currentTrack = 0;
    audioPlayer.src = audioFiles[currentTrack];
    audioPlayer.play();
    isPlaying = true;
    btn.textContent = "⏸️";
  } else {
    audioPlayer.pause();
    isPlaying = false;
    btn.textContent = "▶️";
  }
}

document.getElementById("music-btn").onclick = toggleMusic;

// --- MOBILE KEYBOARD TOGGLE ---
const keyboardBtn = document.getElementById("keyboard-toggle");
const mobileControls = document.getElementById("mobile-controls");

keyboardBtn.addEventListener("click", () => {
  mobileControls.style.display =
    mobileControls.style.display === "flex" ? "none" : "flex";
});

// --- MOBILE CONTROL BUTTONS ---
document.querySelectorAll("#mobile-controls button").forEach(btn => {
  btn.addEventListener("click", () => {
    const dir = btn.dataset.dir;

    const keyMap = {
      up: "ArrowUp",
      down: "ArrowDown",
      left: "ArrowLeft",
      right: "ArrowRight",
      rotate: " " // SPACE BAR for Tetris rotation
    };

    const key = keyMap[dir];
    const frame = document.getElementById("game-frame");

    frame.contentWindow.dispatchEvent(
      new KeyboardEvent("keydown", { key })
    );
  });
});
