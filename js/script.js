
const alphabet = " abcdefghijklmnopqrstuvwxyz.!?@#:/()";
const colors = ["white", "red", "blue", "green", "orange", "yellow"];
const colorHex = {
  white: "#FFFFFF", red: "#C41E3A", blue: "#0051BA",
  green: "#009E60", orange: "#FF5800", yellow: "#FFD500"
};
const colorShort = { w: "white", r: "red", b: "blue", g: "green", o: "orange", y: "yellow" };

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

const positions = [
  [0, 0], [0, 1], [0, 2],
  [1, 0],        [1, 2],
  [2, 0], [2, 1], [2, 2]
];

function showTab(tabId) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add("active");
}

function encode() {
  const input = document.getElementById("message").value.toLowerCase();
  const errorBox = document.getElementById("encodeError");
  const cleaned = [...input];

  if (cleaned.some(c => !alphabet.includes(c))) {
    errorBox.innerText = "❌ Invalid characters detected.";
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
        const label = document.createElement("div");
        label.className = "color-label";
        label.innerText = color ? color[0] : "x";
        label.style.color = color === "white" ? "#666" : "rgba(255,255,255,0.4)";
        td.appendChild(label);
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    container.appendChild(table);
  }
}

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

function copyColorCodes() {
  const textarea = document.getElementById("colorCodes");
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
  let cleaned = oldValue.replace(/[^wrbgoy]/gi, '').toLowerCase();

  // Espacio después de nueve carácteres
  let newValue = cleaned.replace(/(.{9})(?!\s)/g, '$1 ').trimEnd();

  // Solo evalua si cambió
  if (el.value !== newValue) {
    el.value = newValue;

    // Intento de reinicio de cursor
    let diff = newValue.length - oldValue.length;
    el.setSelectionRange(start + diff, start + diff);
  }

  liveDecodePreview();
}

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
      continue;
    }
    if (!/^[wrbgoy]*$/.test(part)) {
      errorBox.innerText += `❌ Invalid characters in cube: "${part}"\n`;
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
          label.innerText = colorLetter;
          label.style.color = colorName === "white" ? "#666" : "rgba(255,255,255,0.4)";
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
}
