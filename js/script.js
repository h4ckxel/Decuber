/* ======================================
   DECUBER - cube cipher engine and Y2K UI
   Public codec hooks stay stable for GitHub Pages.
   ====================================== */

const INTRO_DURATION_MS = 2850;
const bootLines = [
  { text: "DECUBER CIPHER SYSTEM v2.3", cls: "" },
  { text: "Loading COLOR_ALPHA.DLL", cls: "log-ok" },
  { text: "Mounting /dev/cube0", cls: "log-ok" },
  { text: "Scanning sticker bus: W R B G O Y", cls: "log-ok" },
  { text: "Assembling 3x3 matrix", cls: "log-ok" },
  { text: "WARNING: visual codec is not encryption", cls: "log-warn" },
  { text: "Launching DECUBER.EXE", cls: "log-ok" },
];

let appStarted = false;
let statusTimer = null;
let clockTimer = null;

window.addEventListener("DOMContentLoaded", () => {
  initIntro();
});

// Intro is isolated so encode/decode behavior can remain boring and stable.
function initIntro() {
  const bootScreen = document.getElementById("bootScreen");
  const skipButton = document.getElementById("skipIntro");
  const progress = document.getElementById("bootProgress");

  if (!bootScreen) {
    startAppModules();
    return;
  }

  buildIntroCube();

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const timers = [];

  function addTimer(fn, delay) {
    const id = setTimeout(fn, delay);
    timers.push(id);
    return id;
  }

  function finish(skipped = false) {
    timers.forEach(clearTimeout);
    revealApp(skipped);
  }

  if (skipButton) {
    skipButton.addEventListener("click", () => finish(true));
  }

  if (reducedMotion) {
    bootLines.forEach(addBootLine);
    if (progress) progress.style.width = "100%";
    addTimer(() => finish(false), 650);
    return;
  }

  bootLines.forEach((line, index) => {
    addTimer(() => {
      addBootLine(line);
      if (progress) {
        const pct = Math.round(((index + 1) / bootLines.length) * 100);
        progress.style.width = `${pct}%`;
      }
    }, 240 + index * 245);
  });

  addTimer(() => finish(false), INTRO_DURATION_MS);
}

function buildIntroCube() {
  const cube = document.getElementById("introCube");
  if (!cube) return;

  const pieces = [
    ["#FFFFFF", "-280px", "-150px", "160px", "160deg", "-70deg", "-120deg"],
    ["#C41E3A", "40px", "-250px", "210px", "-130deg", "110deg", "80deg"],
    ["#0051BA", "280px", "-120px", "190px", "80deg", "-160deg", "160deg"],
    ["#009E60", "-320px", "20px", "140px", "-210deg", "70deg", "-60deg"],
    ["#FFFFFF", "0px", "0px", "260px", "250deg", "120deg", "240deg"],
    ["#FF5800", "320px", "40px", "150px", "-80deg", "-220deg", "90deg"],
    ["#FFD500", "-220px", "230px", "180px", "120deg", "180deg", "-180deg"],
    ["#C41E3A", "10px", "300px", "220px", "-160deg", "-90deg", "210deg"],
    ["#0051BA", "250px", "230px", "170px", "210deg", "60deg", "-240deg"],
  ];

  cube.innerHTML = "";
  pieces.forEach(([color, x, y, z, spinX, spinY, spinZ], index) => {
    const piece = document.createElement("span");
    piece.className = "intro-cubie";
    piece.style.setProperty("--piece-color", color);
    piece.style.setProperty("--fly-x", x);
    piece.style.setProperty("--fly-y", y);
    piece.style.setProperty("--fly-z", z);
    piece.style.setProperty("--spin-x", spinX);
    piece.style.setProperty("--spin-y", spinY);
    piece.style.setProperty("--spin-z", spinZ);
    piece.style.setProperty("--delay", `${120 + index * 82}ms`);
    cube.appendChild(piece);
  });
}

function addBootLine(line) {
  const logEl = document.getElementById("bootLog");
  if (!logEl) return;

  const span = document.createElement("span");
  span.className = `log-line ${line.cls}`;
  span.textContent = `> ${line.text}`;
  logEl.appendChild(span);
  logEl.scrollTop = logEl.scrollHeight;
}

function revealApp(skipped = false) {
  if (appStarted) return;
  appStarted = true;

  const bootScreen = document.getElementById("bootScreen");
  const mainContent = document.getElementById("mainContent");
  const progress = document.getElementById("bootProgress");

  if (progress) progress.style.width = "100%";
  if (mainContent) mainContent.classList.remove("hidden");
  if (bootScreen) {
    bootScreen.classList.add("fade-out");
    bootScreen.dataset.skipped = skipped ? "true" : "false";
    setTimeout(() => {
      bootScreen.style.display = "none";
    }, 760);
  }

  startAppModules();
}

function startAppModules() {
  startClock();
  setSessionId();
  initScrollReveal();
  startStatusCycle();
}

function startClock() {
  const el = document.getElementById("clockDisplay");
  if (!el) return;

  function tick() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    el.textContent = `${hh}:${mm}:${ss}`;
  }

  tick();
  clearInterval(clockTimer);
  clockTimer = setInterval(tick, 1000);
}

function setSessionId() {
  const el = document.getElementById("sessionId");
  if (!el) return;
  el.textContent = Math.random().toString(36).slice(2, 8).toUpperCase();
}

const statuses = ["SYS_ONLINE", "CIPHER_RDY", "CUBE_ACTIVE", "COLOR_BUS", "DECODE_OK"];
let statusIndex = 0;

function startStatusCycle() {
  const el = document.getElementById("statusText");
  if (!el) return;

  clearInterval(statusTimer);
  statusTimer = setInterval(() => {
    statusIndex = (statusIndex + 1) % statuses.length;
    el.style.opacity = "0";
    setTimeout(() => {
      el.textContent = statuses[statusIndex];
      el.style.opacity = "1";
    }, 160);
  }, 3000);
}

function initScrollReveal() {
  const els = document.querySelectorAll(".reveal-on-scroll");
  if (!("IntersectionObserver" in window)) {
    els.forEach(el => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));
}

function showTab(tabId) {
  document.querySelectorAll(".tab-panel").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(button => {
    button.classList.remove("active");
    button.setAttribute("aria-selected", "false");
  });

  const panel = document.getElementById(tabId);
  if (panel) panel.classList.add("active");

  const buttonId = tabId === "encoder" ? "tabEncode" : "tabDecode";
  const button = document.getElementById(buttonId);
  if (button) {
    button.classList.add("active");
    button.setAttribute("aria-selected", "true");
  }
}

const alphabet = " abcdefghijklmnopqrstuvwxyz.!?@#:/()";
const colors = ["white", "red", "blue", "green", "orange", "yellow"];
const colorHex = {
  white: "#FFFFFF",
  red: "#C41E3A",
  blue: "#0051BA",
  green: "#009E60",
  orange: "#FF5800",
  yellow: "#FFD500",
};
const colorShort = { w: "white", r: "red", b: "blue", g: "green", o: "orange", y: "yellow" };

const charToPair = {};
const pairToChar = {};
let idx = 0;
for (let d1 = 0; d1 < 6; d1++) {
  for (let d2 = 0; d2 < 6; d2++) {
    if (idx < alphabet.length) {
      const ch = alphabet[idx];
      const pair = [colors[d1], colors[d2]];
      charToPair[ch] = pair;
      pairToChar[pair.join("|")] = ch;
      idx++;
    }
  }
}

const positions = [
  [0, 0], [0, 1], [0, 2],
  [1, 0],         [1, 2],
  [2, 0], [2, 1], [2, 2],
];

function encode() {
  const input = document.getElementById("message").value.toLowerCase();
  const errorBox = document.getElementById("encodeError");
  const cleaned = [...input];

  if (cleaned.some(char => !alphabet.includes(char))) {
    errorBox.innerText = "ERROR: INVALID_CHAR. Allowed: a-z space . ! ? @ # : / ( )";
    document.getElementById("faces").innerHTML = "";
    document.getElementById("colorCodes").value = "";
    return;
  }

  errorBox.innerText = "";
  const blocks = [];

  for (let i = 0; i < cleaned.length; i += 4) {
    const chunk = cleaned.slice(i, i + 4).join("").padEnd(4, " ");
    const flat = [];
    for (const char of chunk) flat.push(...charToPair[char]);
    blocks.push(flat);
  }

  renderFaces(blocks, document.getElementById("faces"));
  generateColorCodes(blocks);
}

function renderFaces(blocks, container) {
  container.innerHTML = "";

  blocks.forEach((block, blockIndex) => {
    const grid = Array.from({ length: 3 }, () => Array(3).fill(""));
    positions.forEach(([row, col], posIndex) => {
      grid[row][col] = block[posIndex];
    });
    grid[1][1] = "white";

    const table = document.createElement("table");
    table.className = "cube";
    table.setAttribute("aria-label", `Encoded cube face ${blockIndex + 1}`);
    table.style.animationDelay = `${blockIndex * 70}ms`;

    grid.forEach((row, rowIndex) => {
      const tr = document.createElement("tr");
      row.forEach((color, colIndex) => {
        const td = buildStickerCell(color, blockIndex, rowIndex * 3 + colIndex);
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });

    container.appendChild(table);
  });
}

function buildStickerCell(color, blockIndex, cellIndex) {
  const td = document.createElement("td");
  const hex = colorHex[color] || "#111111";
  td.style.backgroundColor = hex;
  td.style.animationDelay = `${blockIndex * 70 + cellIndex * 24}ms`;
  td.title = color || "empty";

  const label = document.createElement("div");
  label.className = "color-label";
  label.innerText = color ? color[0].toUpperCase() : "X";
  label.style.color = color === "white" ? "#3b3b3b" : "rgba(255, 255, 255, 0.94)";
  td.appendChild(label);

  return td;
}

function generateColorCodes(blocks) {
  const codes = blocks.map(block => {
    const grid = Array(9).fill("x");
    positions.forEach(([row, col], posIndex) => {
      grid[row * 3 + col] = block[posIndex][0];
    });
    grid[4] = "w";
    return grid.join("");
  });
  document.getElementById("colorCodes").value = codes.join(" ");
}

function copyColorCodes() {
  const textarea = document.getElementById("colorCodes");
  if (navigator.clipboard) {
    navigator.clipboard.writeText(textarea.value).catch(() => fallbackCopy(textarea));
  } else {
    fallbackCopy(textarea);
  }

  textarea.style.boxShadow = "0 0 0 2px #ffe100, 0 0 22px rgba(255, 225, 0, 0.62)";
  setTimeout(() => {
    textarea.style.boxShadow = "";
  }, 420);
}

function fallbackCopy(textarea) {
  textarea.select();
  document.execCommand("copy");
}

function resetEncoder() {
  document.getElementById("message").value = "";
  document.getElementById("faces").innerHTML = "";
  document.getElementById("colorCodes").value = "";
  document.getElementById("encodeError").innerText = "";
}

function resetDecoder() {
  document.getElementById("colorInput").value = "";
  document.getElementById("decodedFaces").innerHTML = "";
  document.getElementById("decodedOutput").innerText = "";
  document.getElementById("decodeErrors").innerText = "";
}

function autoSpaceAndDecode(el) {
  const start = el.selectionStart;
  const oldValue = el.value;
  const cleaned = oldValue.replace(/[^wrbgoy]/gi, "").toLowerCase();
  const newValue = cleaned.replace(/(.{9})(?!\s)/g, "$1 ").trimEnd();

  if (el.value !== newValue) {
    el.value = newValue;
    const diff = newValue.length - oldValue.length;
    el.setSelectionRange(Math.max(0, start + diff), Math.max(0, start + diff));
    el.style.boxShadow = "0 0 0 2px #ffe100";
    setTimeout(() => {
      el.style.boxShadow = "";
    }, 250);
  }

  liveDecodePreview();
}

function liveDecodePreview() {
  const input = document.getElementById("colorInput").value.toLowerCase().trim();
  const parts = input.split(/\s+/).filter(Boolean);
  const faceContainer = document.getElementById("decodedFaces");
  const outputBox = document.getElementById("decodedOutput");
  const errorBox = document.getElementById("decodeErrors");

  faceContainer.innerHTML = "";
  outputBox.innerText = "";
  errorBox.innerText = "";

  let output = "";

  parts.forEach((part, partIndex) => {
    if (part.length > 9) {
      errorBox.innerText += `ERROR: OVERFLOW in block "${part}"\n`;
      return;
    }
    if (!/^[wrbgoy]*$/.test(part)) {
      errorBox.innerText += `ERROR: INVALID_CHAR in block "${part}"\n`;
      return;
    }

    const table = document.createElement("table");
    table.className = "cube";
    table.setAttribute("aria-label", `Decoded cube face ${partIndex + 1}`);
    table.style.animationDelay = `${partIndex * 70}ms`;

    for (let row = 0; row < 3; row++) {
      const tr = document.createElement("tr");
      for (let col = 0; col < 3; col++) {
        const cellIndex = row * 3 + col;
        const shortName = part[cellIndex] || null;
        const colorName = shortName ? colorShort[shortName] : "";
        tr.appendChild(buildStickerCell(colorName, partIndex, cellIndex));
      }
      table.appendChild(tr);
    }
    faceContainer.appendChild(table);

    const chars = [...part].filter((_, index) => index !== 4);
    for (let i = 0; i < chars.length; i += 2) {
      const first = colorShort[chars[i]];
      const second = colorShort[chars[i + 1]];
      output += (!first || !second) ? "?" : (pairToChar[`${first}|${second}`] || "?");
    }
  });

  const preview = output.replace(/\s+$/g, "");
  if (preview.length) {
    outputBox.style.animation = "none";
    void outputBox.offsetWidth;
    outputBox.style.animation = "";
    outputBox.innerText = preview;
  }
}

document.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "e") {
    event.preventDefault();
    showTab("encoder");
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
    event.preventDefault();
    showTab("decoder");
  }
});
