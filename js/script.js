// alfabeto y colores estilo rubik
const alphabet = " abcdefghijklmnopqrstuvwxyz.!?@#:/()";
const colors = ["white", "red", "blue", "green", "orange", "yellow"];
const colorHex = {
  white: "#FFFFFF", red: "#C41E3A", blue: "#0051BA",
  green: "#009E60", orange: "#FF5800", yellow: "#FFD500"
};
const colorShort = { w: "white", r: "red", b: "blue", g: "green", o: "orange", y: "yellow" };

// mapeo de caracteres a pares
const charToPair = {}, pairToChar = {};
let index = 0;
for (let d1 = 0; d1 < 6; d1++) {
  for (let d2 = 0; d2 < 6; d2++) {
    if (index < alphabet.length) {
      const char = alphabet[index];
      const pair = [colors[d1], colors[d2]];
      charToPair[char] = pair;
      pairToChar[pair.join("|")] = char;
      index++;
    }
  }
}

// posiciones de caras
const positions = [
  [0, 0], [0, 1], [0, 2],
  [1, 0],        [1, 2],
  [2, 0], [2, 1], [2, 2]
];

// tabs con efecto neon
function showTab(tabId) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  const btn = document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`);
  btn.classList.add("active");
  btn.style.boxShadow = "0 0 10px #0ff";
  setTimeout(() => btn.style.boxShadow = "", 500);
}

// encodea texto -> cubos
function encode() {
  const input = document.getElementById("message").value.toLowerCase();
  const errorBox = document.getElementById("encodeError");
  const cleaned = [...input];

  if (cleaned.some(c => !alphabet.includes(c))) {
    errorBox.innerText = "❌ Invalid characters detected.";
    errorBox.style.color = "#f33";
    errorBox.style.textShadow = "0 0 6px #f00";
    document.getElementById("faces").innerHTML = "";
    document.getElementById("colorCodes").value = "";
    return;
  }

  errorBox.innerText = "";
  const blocks = [];

  for (let i = 0; i < cleaned.length; i += 4) {
    const chunk = cleaned.slice(i, i + 4).join("").padEnd(4, " ");
    const flatColors = [];
    for (let char of chunk) {
      const pair = charToPair[char];
      flatColors.push(...pair);
    }
    blocks.push(flatColors);
  }

  renderFaces(blocks, document.getElementById("faces"));
  generateColorCodes(blocks);
}

// pinta cubos con labels estilo neon
function renderFaces(blocks, container) {
  container.innerHTML = "";
  for (const block of blocks) {
    const grid = Array.from({ length: 3 }, () => Array(3).fill(""));
    positions.forEach(([r, c], i) => grid[r][c] = block[i]);
    grid[1][1] = "white";

    const table = document.createElement("table");
    table.className = "cube";
    for (let row of grid) {
      const tr = document.createElement("tr");
      for (let color of row) {
        const td = document.createElement("td");
        td.style.backgroundColor = colorHex[color] || "#333";
        td.style.boxShadow = `0 0 6px ${colorHex[color] || "#000"}`;
        const label = document.createElement("div");
        label.className = "color-label";
        label.innerText = color ? color[0] : "x";
        label.style.color = color === "white" ? "#666" : "rgba(255,255,255,0.7)";
        label.style.textShadow = `0 0 4px ${colorHex[color] || "#0ff"}`;
        td.appendChild(label);
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    container.appendChild(table);
  }
}

// convierte pares a código corto
function getColorShort(color) {
  return color[0];
}

function generateColorCodes(blocks) {
  const codes = [];
  for (const block of blocks) {
    const grid = Array(9).fill("x");
    positions.forEach(([r, c], i) => {
      const pos = r * 3 + c;
      grid[pos] = getColorShort(block[i]);
    });
    grid[4] = "w";
    codes.push(grid.join(""));
  }
  document.getElementById("colorCodes").value = codes.join(" ");
}

// clipboard con flash verde
function copyColorCodes() {
  const textarea = document.getElementById("colorCodes");
  textarea.select();
  document.execCommand("copy");
  textarea.style.background = "#0f0";
  setTimeout(() => textarea.style.background = "#111", 400);
}

// resets
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

// autoespaciado con glow
function autoSpaceAndDecode(el) {
  const start = el.selectionStart;
  const oldValue = el.value;
  let cleaned = oldValue.replace(/[^wrbgoy]/gi, '').toLowerCase();

  let newValue = cleaned.replace(/(.{9})(?!\s)/g, '$1 ').trimEnd();
  if (el.value !== newValue) {
    el.value = newValue;
    let diff = newValue.length - oldValue.length;
    el.setSelectionRange(start + diff, start + diff);
    el.style.boxShadow = "0 0 8px #ff0";
    setTimeout(() => el.style.boxShadow = "", 400);
  }

  liveDecodePreview();
}

// decodifica en vivo
function liveDecodePreview() {
  const input = document.getElementById("colorInput").value.toLowerCase().trim();
  const parts = input.split(/\s+/);
  const faceContainer = document.getElementById("decodedFaces");
  const outputBox = document.getElementById("decodedOutput");
  const errorBox = document.getElementById("decodeErrors");

  faceContainer.innerHTML = "";
  outputBox.innerText = "";
  errorBox.innerText = "";

  let output = "";

  for (const part of parts) {
    if (part.length > 9) {
      errorBox.innerText += `❌ Too many characters in cube: "${part}"\n`;
      errorBox.style.color = "#f33";
      continue;
    }
    if (!/^[wrbgoy]*$/.test(part)) {
      errorBox.innerText += `❌ Invalid characters in cube: "${part}"\n`;
      errorBox.style.color = "#f33";
      continue;
    }

    const table = document.createElement("table");
    table.className = "cube";

    for (let r = 0; r < 3; r++) {
      const tr = document.createElement("tr");
      for (let c = 0; c < 3; c++) {
        const i = r * 3 + c;
        const colorLetter = part[i] || null;
        const td = document.createElement("td");
        const label = document.createElement("div");
        label.className = "color-label";

        if (colorLetter && colorShort[colorLetter]) {
          const colorName = colorShort[colorLetter];
          td.style.backgroundColor = colorHex[colorName];
          td.style.boxShadow = `0 0 6px ${colorHex[colorName]}`;
          label.innerText = colorLetter;
          label.style.color = colorName === "white" ? "#666" : "rgba(255,255,255,0.7)";
          label.style.textShadow = `0 0 4px ${colorHex[colorName]}`;
        } else {
          td.style.backgroundColor = "#333";
          label.innerText = "x";
          label.style.color = "#777";
        }

        td.appendChild(label);
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }

    faceContainer.appendChild(table);

    const chars = [...part].filter((_, i) => i !== 4);
    for (let i = 0; i < chars.length; i += 2) {
      const a = colorShort[chars[i]];
      const b = colorShort[chars[i + 1]];
      if (!a || !b) {
        output += "?";
      } else {
        const key = `${a}|${b}`;
        output += pairToChar[key] || "?";
      }
    }
  }

  outputBox.innerText = output.trim();
  outputBox.style.textShadow = "0 0 8px #0f0";
}
