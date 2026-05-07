/* ======================================
   DECUBER — script.js
   h4ckxel :: cube cipher engine
   90s edition
   ====================================== */

// ── BOOT SEQUENCE ──────────────────────
const bootLines = [
  { text: "DECUBER CIPHER SYSTEM v2.0", cls: "" },
  { text: "Copyright (C) 1998 h4ckxel. All Rights Reserved.", cls: "" },
  { text: "", cls: "" },
  { text: "Checking memory............. 640K OK", cls: "" },
  { text: "Loading CUBE_MAP.SYS........ OK", cls: "log-ok" },
  { text: "Loading COLOR_ALPHA.DLL..... OK", cls: "log-ok" },
  { text: "Initializing cipher engine.. OK", cls: "log-ok" },
  { text: "Mounting /dev/cube0......... OK", cls: "log-ok" },
  { text: "Checking entropy source..... /dev/urandom", cls: "" },
  { text: "WARNING: Channel not encrypted. Proceed with caution.", cls: "log-warn" },
  { text: "", cls: "" },
  { text: "System ready. Launching DECUBER.EXE...", cls: "log-ok" },
];

window.addEventListener("DOMContentLoaded", () => {
  const logEl      = document.getElementById("bootLog");
  const bootScreen = document.getElementById("bootScreen");
  const mainContent= document.getElementById("mainContent");
  let i = 0;

  function typeLine() {
    if (i >= bootLines.length) {
      setTimeout(() => {
        bootScreen.classList.add("fade-out");
        mainContent.classList.remove("hidden");
        // después del wipe, ocultar
        setTimeout(() => bootScreen.style.display = "none", 600);
        startClock();
        setSessionId();
        initScrollReveal();
        startStatusCycle();
      }, 500);
      return;
    }
    const { text, cls } = bootLines[i++];
    const span = document.createElement("span");
    span.className = "log-line " + cls;
    span.textContent = text ? "> " + text : " ";
    logEl.appendChild(span);
    logEl.scrollTop = logEl.scrollHeight;
    // velocidad irregular — más auténtico
    const delay = text === "" ? 40 : 80 + Math.random() * 100;
    setTimeout(typeLine, delay);
  }

  setTimeout(typeLine, 400);
});

// ── CLOCK ──────────────────────────────
function startClock() {
  const el = document.getElementById("clockDisplay");
  function tick() {
    const n  = new Date();
    const hh = String(n.getHours()).padStart(2,"0");
    const mm = String(n.getMinutes()).padStart(2,"0");
    const ss = String(n.getSeconds()).padStart(2,"0");
    el.textContent = `${hh}:${mm}:${ss}`;
  }
  tick();
  setInterval(tick, 1000);
}

// ── SESSION ID ─────────────────────────
function setSessionId() {
  const id = Math.random().toString(36).substring(2, 8).toUpperCase();
  document.getElementById("sessionId").textContent = id;
}

// ── STATUS CYCLE ───────────────────────
const statuses = ["SYS_ONLINE", "CIPHER_RDY", "CUBE_ACTIVE", "ENCODING.."];
let si = 0;
function startStatusCycle() {
  setInterval(() => {
    si = (si + 1) % statuses.length;
    const el = document.getElementById("statusText");
    if (el) {
      // Parpadeo previo al cambio — 90s
      el.style.opacity = "0";
      setTimeout(() => {
        el.textContent = statuses[si];
        el.style.opacity = "1";
      }, 200);
    }
  }, 3000);
}

// ── SCROLL REVEAL ──────────────────────
function initScrollReveal() {
  const els = document.querySelectorAll(".reveal-on-scroll");
  if (!("IntersectionObserver" in window)) {
    els.forEach(el => el.classList.add("visible"));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
}

// ── TABS ───────────────────────────────
function showTab(tabId) {
  document.querySelectorAll(".tab-panel").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  const btnId = tabId === "encoder" ? "tabEncode" : "tabDecode";
  document.getElementById(btnId).classList.add("active");
}

// ── CIPHER TABLES ──────────────────────
const alphabet  = " abcdefghijklmnopqrstuvwxyz.!?@#:/()";
const colors    = ["white","red","blue","green","orange","yellow"];
const colorHex  = {
  white:"#FFFFFF", red:"#C41E3A", blue:"#0051BA",
  green:"#009E60", orange:"#FF5800", yellow:"#FFD500"
};
const colorShort = { w:"white", r:"red", b:"blue", g:"green", o:"orange", y:"yellow" };

const charToPair = {}, pairToChar = {};
let idx = 0;
for (let d1 = 0; d1 < 6; d1++) {
  for (let d2 = 0; d2 < 6; d2++) {
    if (idx < alphabet.length) {
      const ch   = alphabet[idx];
      const pair = [colors[d1], colors[d2]];
      charToPair[ch]         = pair;
      pairToChar[pair.join("|")] = ch;
      idx++;
    }
  }
}

const positions = [
  [0,0],[0,1],[0,2],
  [1,0],     [1,2],
  [2,0],[2,1],[2,2]
];

// ── ENCODE ─────────────────────────────
function encode() {
  const input    = document.getElementById("message").value.toLowerCase();
  const errorBox = document.getElementById("encodeError");
  const cleaned  = [...input];

  if (cleaned.some(c => !alphabet.includes(c))) {
    errorBox.innerText = "ERROR: INVALID_CHAR detected. Allowed: a-z space . ! ? @ # : / ( )";
    document.getElementById("faces").innerHTML = "";
    document.getElementById("colorCodes").value = "";
    return;
  }

  errorBox.innerText = "";
  const blocks = [];

  for (let i = 0; i < cleaned.length; i += 4) {
    const chunk = cleaned.slice(i, i+4).join("").padEnd(4," ");
    const flat  = [];
    for (const char of chunk) flat.push(...charToPair[char]);
    blocks.push(flat);
  }

  renderFaces(blocks, document.getElementById("faces"));
  generateColorCodes(blocks);
}

// ── RENDER CUBES ───────────────────────
function renderFaces(blocks, container) {
  container.innerHTML = "";
  blocks.forEach((block, bIdx) => {
    const grid = Array.from({length:3}, () => Array(3).fill(""));
    positions.forEach(([r,c], i) => grid[r][c] = block[i]);
    grid[1][1] = "white";

    const table = document.createElement("table");
    table.className = "cube";
    table.style.animationDelay = `${bIdx * 0.06}s`;

    for (const row of grid) {
      const tr = document.createElement("tr");
      for (const color of row) {
        const td  = document.createElement("td");
        const hex = colorHex[color] || "#111";
        td.style.backgroundColor = hex;
        // Sombra inset plástica 90s
        td.style.boxShadow = `inset 3px 3px 5px rgba(255,255,255,0.35), inset -2px -2px 4px rgba(0,0,0,0.5)`;

        const lbl = document.createElement("div");
        lbl.className = "color-label";
        lbl.innerText = color ? color[0].toUpperCase() : "X";
        lbl.style.color = color === "white" ? "#444" : "rgba(255,255,255,0.9)";
        td.appendChild(lbl);
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    container.appendChild(table);
  });
}

// ── COLOR CODES ────────────────────────
function generateColorCodes(blocks) {
  const codes = blocks.map(block => {
    const grid = Array(9).fill("x");
    positions.forEach(([r,c], i) => { grid[r*3+c] = block[i][0]; });
    grid[4] = "w";
    return grid.join("");
  });
  document.getElementById("colorCodes").value = codes.join(" ");
}

// ── COPY ───────────────────────────────
function copyColorCodes() {
  const ta = document.getElementById("colorCodes");
  if (navigator.clipboard) {
    navigator.clipboard.writeText(ta.value).catch(() => fallbackCopy(ta));
  } else {
    fallbackCopy(ta);
  }
  // Flash 90s: cambia borde a amarillo instantáneo, sin transition
  ta.style.borderColor = "#FFFF00";
  ta.style.color = "#FFFF00";
  setTimeout(() => {
    ta.style.borderColor = "";
    ta.style.color = "";
  }, 400);
}

function fallbackCopy(ta) {
  ta.select();
  document.execCommand("copy");
}

// ── RESETS ─────────────────────────────
function resetEncoder() {
  document.getElementById("message").value        = "";
  document.getElementById("faces").innerHTML      = "";
  document.getElementById("colorCodes").value     = "";
  document.getElementById("encodeError").innerText= "";
}

function resetDecoder() {
  document.getElementById("colorInput").value        = "";
  document.getElementById("decodedFaces").innerHTML  = "";
  document.getElementById("decodedOutput").innerText = "";
  document.getElementById("decodeErrors").innerText  = "";
}

// ── AUTO SPACE + DECODE ────────────────
function autoSpaceAndDecode(el) {
  const start    = el.selectionStart;
  const oldValue = el.value;
  const cleaned  = oldValue.replace(/[^wrbgoy]/gi, "").toLowerCase();
  const newValue = cleaned.replace(/(.{9})(?!\s)/g, "$1 ").trimEnd();

  if (el.value !== newValue) {
    el.value = newValue;
    const diff = newValue.length - oldValue.length;
    el.setSelectionRange(start + diff, start + diff);
    // Flash amarillo instantáneo (sin transition)
    el.style.borderColor = "#FFFF00";
    setTimeout(() => el.style.borderColor = "", 250);
  }
  liveDecodePreview();
}

// ── LIVE DECODE ────────────────────────
function liveDecodePreview() {
  const input         = document.getElementById("colorInput").value.toLowerCase().trim();
  const parts         = input.split(/\s+/).filter(Boolean);
  const faceContainer = document.getElementById("decodedFaces");
  const outputBox     = document.getElementById("decodedOutput");
  const errorBox      = document.getElementById("decodeErrors");

  faceContainer.innerHTML = "";
  outputBox.innerText     = "";
  errorBox.innerText      = "";

  let output = "";

  parts.forEach((part, pIdx) => {
    if (part.length > 9) {
      errorBox.innerText += `ERROR: OVERFLOW in block "${part}"\n`; return;
    }
    if (!/^[wrbgoy]*$/.test(part)) {
      errorBox.innerText += `ERROR: INVALID_CHAR in block "${part}"\n`; return;
    }

    const table = document.createElement("table");
    table.className = "cube";
    table.style.animationDelay = `${pIdx * 0.06}s`;

    for (let r = 0; r < 3; r++) {
      const tr = document.createElement("tr");
      for (let c = 0; c < 3; c++) {
        const i   = r * 3 + c;
        const cl  = part[i] || null;
        const td  = document.createElement("td");
        const lbl = document.createElement("div");
        lbl.className = "color-label";

        if (cl && colorShort[cl]) {
          const cn  = colorShort[cl];
          const hex = colorHex[cn];
          td.style.backgroundColor = hex;
          td.style.boxShadow = `inset 3px 3px 5px rgba(255,255,255,0.35), inset -2px -2px 4px rgba(0,0,0,0.5)`;
          lbl.innerText  = cl.toUpperCase();
          lbl.style.color = cn === "white" ? "#444" : "rgba(255,255,255,0.9)";
        } else {
          td.style.backgroundColor = "#111";
          lbl.innerText  = "X"; lbl.style.color = "#333";
        }

        td.appendChild(lbl); tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    faceContainer.appendChild(table);

    const chars = [...part].filter((_, i) => i !== 4);
    for (let i = 0; i < chars.length; i += 2) {
      const a = colorShort[chars[i]];
      const b = colorShort[chars[i+1]];
      output += (!a || !b) ? "?" : (pairToChar[`${a}|${b}`] || "?");
    }
  });

  if (output.trim()) {
    // Re-trigger animation — 90s typewriter effect
    outputBox.style.animation = "none";
    void outputBox.offsetWidth; // reflow
    outputBox.style.animation = "";
    outputBox.innerText = output.trim();
  }
}

// ── KEYBOARD SHORTCUTS ─────────────────
document.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.key === "e") { e.preventDefault(); showTab("encoder"); }
  if ((e.ctrlKey || e.metaKey) && e.key === "d") { e.preventDefault(); showTab("decoder"); }
});
