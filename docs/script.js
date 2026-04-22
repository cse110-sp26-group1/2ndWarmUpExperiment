"use strict";

/**
 * Core slot game configuration. Payouts are bet multipliers.
 * @typedef {Object} SymbolDefinition
 * @property {string} id
 * @property {string} label
 * @property {string} className
 * @property {number} weight
 * @property {{3: number, 4: number, 5: number}} payouts
 */

const MIN_BET = 10;
const MAX_BET = 100;
const BET_STEP = 10;
const DEFAULT_BALANCE = 1000;
const REEL_COUNT = 5;
const ROW_COUNT = 3;
const WILD_ID = "wild";
const SCATTER_ID = "scatter";
const FAST_PLAY_STORAGE_KEY = "gunslinger-gold-fast-play";

/** @type {SymbolDefinition[]} */
const SYMBOLS = [
  { id: "badge", label: "Sheriff", className: "symbol-badge", weight: 5, payouts: { 3: 6, 4: 18, 5: 70 } },
  { id: "boots", label: "Boots", className: "symbol-boots", weight: 6, payouts: { 3: 5, 4: 15, 5: 55 } },
  { id: "cowboy", label: "Cowboy", className: "symbol-cowboy", weight: 5, payouts: { 3: 7, 4: 22, 5: 90 } },
  { id: "wanted", label: "Wanted", className: "symbol-wanted", weight: 7, payouts: { 3: 4, 4: 12, 5: 42 } },
  { id: "cactus", label: "Cactus", className: "symbol-cactus", weight: 8, payouts: { 3: 3, 4: 10, 5: 32 } },
  { id: "dynamite", label: "Dynamite", className: "symbol-dynamite", weight: 7, payouts: { 3: 4, 4: 14, 5: 46 } },
  { id: SCATTER_ID, label: "Scatter", className: "symbol-scatter", weight: 4, payouts: { 3: 2, 4: 8, 5: 35 } },
  { id: WILD_ID, label: "Wild", className: "symbol-wild", weight: 4, payouts: { 3: 8, 4: 24, 5: 100 } },
  { id: "a", label: "A", className: "symbol-letter", weight: 10, payouts: { 3: 2, 4: 6, 5: 18 } },
  { id: "k", label: "K", className: "symbol-letter", weight: 11, payouts: { 3: 2, 4: 5, 5: 16 } },
  { id: "q", label: "Q", className: "symbol-letter", weight: 12, payouts: { 3: 1, 4: 4, 5: 14 } },
  { id: "j", label: "J", className: "symbol-letter", weight: 13, payouts: { 3: 1, 4: 3, 5: 12 } },
  { id: "10", label: "10", className: "symbol-number", weight: 14, payouts: { 3: 1, 4: 3, 5: 10 } }
];

/** @type {{name: string, rows: number[]}[]} */
const PAYLINES = [
  { name: "top", rows: [0, 0, 0, 0, 0] },
  { name: "middle", rows: [1, 1, 1, 1, 1] },
  { name: "bottom", rows: [2, 2, 2, 2, 2] },
  { name: "v", rows: [0, 1, 2, 1, 0] },
  { name: "chevron", rows: [2, 1, 0, 1, 2] }
];

/** @type {Record<string, SymbolDefinition>} */
const SYMBOL_MAP = SYMBOLS.reduce((map, symbol) => {
  map[symbol.id] = symbol;
  return map;
}, {});

/** @type {string[]} */
const WEIGHTED_SYMBOL_IDS = SYMBOLS.flatMap((symbol) => Array.from({ length: symbol.weight }, () => symbol.id));

/**
 * @typedef {Object} WinResult
 * @property {number} totalWin
 * @property {number} freeSpinsAwarded
 * @property {{reel: number, row: number}[]} winningCells
 * @property {string[]} activeHorizontalLines
 */

/**
 * @typedef {Object} SlotState
 * @property {number} balance
 * @property {number} bet
 * @property {boolean} isSpinning
 * @property {number} freeSpins
 * @property {string[][]} board
 */

/** @type {SlotState} */
const state = {
  balance: DEFAULT_BALANCE,
  bet: MIN_BET,
  isSpinning: false,
  freeSpins: 0,
  board: createBoard(),
  fastPlayEnabled: false
};

let audioContext = null;
let popupTimeout = 0;
let bigWinTimeout = 0;
let activeSpin = null;

/**
 * Reads the saved fast play preference.
 * @returns {boolean}
 */
function loadFastPlayPreference() {
  try {
    return window.localStorage.getItem(FAST_PLAY_STORAGE_KEY) === "true";
  } catch (error) {
    return false;
  }
}

/**
 * Saves the fast play preference.
 * @param {boolean} value
 */
function saveFastPlayPreference(value) {
  try {
    window.localStorage.setItem(FAST_PLAY_STORAGE_KEY, String(value));
  } catch (error) {
    // Ignore storage failures so gameplay continues normally.
  }
}

/**
 * Returns a random integer between zero and maxExclusive minus one.
 * @param {number} maxExclusive
 * @returns {number}
 */
function randomInteger(maxExclusive) {
  return Math.floor(Math.random() * maxExclusive);
}

/**
 * Chooses a symbol id using configured symbol weights.
 * @returns {string}
 */
function getRandomSymbolId() {
  return WEIGHTED_SYMBOL_IDS[randomInteger(WEIGHTED_SYMBOL_IDS.length)];
}

/**
 * Creates a 3 x 5 board represented as rows containing reel results.
 * @returns {string[][]}
 */
function createBoard() {
  return Array.from({ length: ROW_COUNT }, () => (
    Array.from({ length: REEL_COUNT }, () => getRandomSymbolId())
  ));
}

/**
 * Clamps a bet value to supported bet bounds.
 * @param {number} value
 * @returns {number}
 */
function clampBet(value) {
  return Math.min(MAX_BET, Math.max(MIN_BET, value));
}

/**
 * Gets the best payline match from the leftmost reel.
 * @param {string[]} lineSymbols
 * @returns {{symbolId: string, count: number} | null}
 */
function getLeftToRightMatch(lineSymbols) {
  const firstNonWild = lineSymbols.find((symbolId) => symbolId !== WILD_ID && symbolId !== SCATTER_ID);
  const targetId = firstNonWild || WILD_ID;
  let count = 0;

  for (const symbolId of lineSymbols) {
    if (symbolId === SCATTER_ID) {
      break;
    }

    if (symbolId === targetId || symbolId === WILD_ID) {
      count += 1;
      continue;
    }

    break;
  }

  return count >= 3 ? { symbolId: targetId, count } : null;
}

/**
 * Counts a symbol anywhere on the board.
 * @param {string[][]} board
 * @param {string} symbolId
 * @returns {number}
 */
function countSymbol(board, symbolId) {
  return board.flat().filter((currentId) => currentId === symbolId).length;
}

/**
 * Evaluates line and scatter wins for a board.
 * @param {string[][]} board
 * @param {number} bet
 * @returns {WinResult}
 */
function evaluateBoard(board, bet) {
  const winningCellKeys = new Set();
  const activeHorizontalLines = new Set();
  let totalWin = 0;

  for (const payline of PAYLINES) {
    const lineSymbols = payline.rows.map((row, reel) => board[row][reel]);
    const match = getLeftToRightMatch(lineSymbols);

    if (!match) {
      continue;
    }

    const symbol = SYMBOL_MAP[match.symbolId];
    totalWin += bet * symbol.payouts[match.count];

    for (let reel = 0; reel < match.count; reel += 1) {
      winningCellKeys.add(`${reel}:${payline.rows[reel]}`);
    }

    if (payline.name === "top" || payline.name === "middle" || payline.name === "bottom") {
      activeHorizontalLines.add(payline.name);
    }
  }

  const scatterCount = countSymbol(board, SCATTER_ID);
  const scatterPayout = SYMBOL_MAP[SCATTER_ID].payouts[Math.min(scatterCount, 5)] || 0;
  let freeSpinsAwarded = 0;

  if (scatterCount >= 3) {
    totalWin += bet * scatterPayout;
    freeSpinsAwarded = 1;

    board.forEach((row, rowIndex) => {
      row.forEach((symbolId, reel) => {
        if (symbolId === SCATTER_ID) {
          winningCellKeys.add(`${reel}:${rowIndex}`);
        }
      });
    });
  }

  return {
    totalWin,
    freeSpinsAwarded,
    winningCells: Array.from(winningCellKeys).map((key) => {
      const [reel, row] = key.split(":").map(Number);
      return { reel, row };
    }),
    activeHorizontalLines: Array.from(activeHorizontalLines)
  };
}

/**
 * Builds one symbol cell for the reel display.
 * @param {string} symbolId
 * @param {number} reel
 * @param {number} row
 * @returns {HTMLDivElement}
 */
function createSymbolCell(symbolId, reel, row) {
  const symbol = SYMBOL_MAP[symbolId];
  const cell = document.createElement("div");
  const artText = symbol.className === "symbol-letter" || symbol.className === "symbol-number" ? symbol.label : "";

  cell.className = `symbol-cell ${symbol.className}`;
  cell.dataset.reel = String(reel);
  cell.dataset.row = String(row);
  cell.dataset.symbol = symbol.id;
  cell.innerHTML = `
    <div class="symbol-stack">
      <span class="symbol-art" aria-hidden="true">${artText}</span>
      <span class="symbol-label">${symbol.label}</span>
    </div>
  `;
  return cell;
}

/**
 * Renders the current board into all reel containers.
 * @param {string[][]} board
 */
function renderBoard(board) {
  const reels = document.querySelectorAll(".reel");
  reels.forEach((reelElement, reelIndex) => {
    reelElement.innerHTML = "";

    for (let row = 0; row < ROW_COUNT; row += 1) {
      reelElement.appendChild(createSymbolCell(board[row][reelIndex], reelIndex, row));
    }
  });
}

/**
 * Updates text displays and disabled states.
 */
function updateDisplays() {
  const spinButton = document.getElementById("spinButton");

  document.getElementById("balanceDisplay").textContent = String(state.balance);
  document.getElementById("betDisplay").textContent = String(state.bet);
  document.getElementById("decreaseBetButton").disabled = state.isSpinning || state.bet <= MIN_BET;
  document.getElementById("increaseBetButton").disabled = state.isSpinning || state.bet >= MAX_BET;
  spinButton.disabled = !state.isSpinning && state.balance < state.bet && state.freeSpins === 0;
  spinButton.textContent = state.isSpinning ? "Skip" : "Spin";
}

/**
 * Clears visible win styling.
 */
function clearWinHighlights() {
  document.querySelectorAll(".symbol-cell.win").forEach((cell) => cell.classList.remove("win"));
  document.querySelectorAll(".payline-guide.active").forEach((line) => line.classList.remove("active"));
}

/**
 * Highlights winning symbols and horizontal paylines.
 * @param {WinResult} result
 */
function highlightWins(result) {
  for (const cell of result.winningCells) {
    const element = document.querySelector(`[data-reel="${cell.reel}"][data-row="${cell.row}"]`);
    if (element) {
      element.classList.add("win");
    }
  }

  for (const lineName of result.activeHorizontalLines) {
    const line = document.querySelector(`.payline-guide-${lineName}`);
    if (line) {
      line.classList.add("active");
    }
  }
}

/**
 * Gets a shared audio context after user interaction allows playback.
 * @returns {AudioContext | null}
 */
function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

/**
 * Schedules one compact synth tone.
 * @param {AudioContext} context
 * @param {number} start
 * @param {number} duration
 * @param {number} startFrequency
 * @param {number} endFrequency
 * @param {OscillatorType} type
 * @param {number} volume
 */
function playTone(context, start, duration, startFrequency, endFrequency, type, volume) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const end = start + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(startFrequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(endFrequency, end);
  gain.gain.setValueAtTime(0.001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.001, end);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(end + 0.02);
}

/**
 * Generates a short animated strip in one reel while it spins.
 * @param {Element} reelElement
 * @param {number} reelIndex
 */
function renderSpinStrip(reelElement, reelIndex) {
  reelElement.innerHTML = "";
  reelElement.classList.add("spinning");

  for (let row = 0; row < ROW_COUNT; row += 1) {
    reelElement.appendChild(createSymbolCell(getRandomSymbolId(), reelIndex, row));
  }
}

/**
 * Plays synthesized game effects without external audio files.
 * @param {"spin" | "reelStop" | "win" | "bigWin" | "jackpot"} type
 */
function playSound(type) {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  try {
    const now = context.currentTime;

    if (type === "spin") {
      for (let step = 0; step < 8; step += 1) {
        playTone(context, now + step * 0.055, 0.075, 210 + step * 18, 120 + step * 10, "sawtooth", 0.028);
      }
      return;
    }

    if (type === "reelStop") {
      playTone(context, now, 0.07, 330, 180, "square", 0.035);
      return;
    }

    if (type === "bigWin") {
      [392, 523, 659, 784, 988, 1319].forEach((frequency, index) => {
        playTone(context, now + index * 0.08, 0.2, frequency, frequency * 1.28, "sawtooth", 0.065);
      });
      playTone(context, now, 0.62, 164, 392, "triangle", 0.045);
      playTone(context, now + 0.16, 0.54, 246, 523, "square", 0.03);
      return;
    }

    if (type === "jackpot") {
      [523, 659, 784, 1047, 1319].forEach((frequency, index) => {
        playTone(context, now + index * 0.095, 0.18, frequency, frequency * 1.18, "triangle", 0.07);
      });
      playTone(context, now + 0.08, 0.5, 196, 392, "sine", 0.035);
      return;
    }

    [523, 659, 784].forEach((frequency, index) => {
      playTone(context, now + index * 0.09, 0.16, frequency, frequency * 1.08, "triangle", 0.06);
    });
  } catch (error) {
    console.warn("Audio playback failed.", error);
  }
}

/**
 * Sets the main game message.
 * @param {string} text
 * @param {boolean} isBigWin
 */
function setMessage(text, isBigWin = false) {
  const message = document.getElementById("statusMessage");
  message.textContent = text;
  message.classList.toggle("big-win", isBigWin);
}

/**
 * Shows positive win feedback in a temporary popup.
 * @param {string} label
 * @param {number} amount
 * @param {"default" | "jackpot" | "big-win"} variant
 */
function showWinPopup(label, amount, variant = "default") {
  const popup = document.getElementById("winPopup");
  const popupLabel = document.getElementById("winPopupLabel");
  const popupAmount = document.getElementById("winPopupAmount");

  window.clearTimeout(popupTimeout);
  popupLabel.textContent = label;
  popupAmount.textContent = String(amount);
  popup.classList.remove("jackpot", "big-win");
  if (variant === "jackpot") {
    popup.classList.add("jackpot");
  }
  if (variant === "big-win") {
    popup.classList.add("big-win");
  }
  popup.classList.remove("show");
  popup.setAttribute("aria-hidden", "false");

  window.requestAnimationFrame(() => {
    popup.classList.add("show");
  });

  popupTimeout = window.setTimeout(() => {
    popup.classList.remove("show");
    popup.setAttribute("aria-hidden", "true");
  }, 2300);
}

/**
 * Hides any active win popup.
 */
function hideWinPopup() {
  const popup = document.getElementById("winPopup");

  window.clearTimeout(popupTimeout);
  popup.classList.remove("show", "jackpot", "big-win");
  popup.setAttribute("aria-hidden", "true");
}

/**
 * Clears the active big win celebration visuals.
 */
function clearBigWinCelebration() {
  const celebration = document.getElementById("bigWinCelebration");

  window.clearTimeout(bigWinTimeout);
  celebration.classList.remove("show");
  celebration.setAttribute("aria-hidden", "true");
  celebration.innerHTML = "";
}

/**
 * Triggers the specialized big win feedback loop.
 * @param {number} amount
 */
function triggerBigWinFeedback(amount) {
  const celebration = document.getElementById("bigWinCelebration");

  clearBigWinCelebration();
  setMessage("Big Win", true);
  showWinPopup("Big Win", amount, "big-win");
  playSound("bigWin");

  for (let index = 0; index < 22; index += 1) {
    const coin = document.createElement("span");
    coin.className = "coin-burst";
    coin.style.setProperty("--coin-x", `${4 + randomInteger(92)}vw`);
    coin.style.setProperty("--coin-drift", `${randomInteger(18) - 9}vw`);
    coin.style.setProperty("--coin-scale", `${0.8 + Math.random() * 0.8}`);
    coin.style.setProperty("--coin-duration", `${1.9 + Math.random() * 1.2}s`);
    coin.style.setProperty("--coin-delay", `${Math.random() * 0.65}s`);
    celebration.appendChild(coin);
  }

  celebration.classList.add("show");
  celebration.setAttribute("aria-hidden", "false");
  bigWinTimeout = window.setTimeout(clearBigWinCelebration, 2600);
}

/**
 * Handles the end of a spin once all reels have stopped.
 * @param {string[][]} board
 * @param {boolean} usedFreeSpin
 */
function settleSpin(board, usedFreeSpin) {
  const result = evaluateBoard(board, state.bet);
  state.balance += result.totalWin;
  state.freeSpins += result.freeSpinsAwarded;
  state.isSpinning = false;
  activeSpin = null;

  if (usedFreeSpin) {
    state.freeSpins = Math.max(0, state.freeSpins);
  }

  highlightWins(result);

  if (result.totalWin >= state.bet * 20) {
    triggerBigWinFeedback(result.totalWin);
  } else if (result.totalWin > 0) {
    const label = result.freeSpinsAwarded > 0 ? "Win + Free Spin" : "Win";
    setMessage(result.freeSpinsAwarded > 0 ? "Free spin awarded" : "Win paid");
    showWinPopup(label, result.totalWin);
    playSound("win");
  } else {
    setMessage("No win this round");
  }

  updateDisplays();
}

/**
 * Finalizes an active spin immediately.
 */
function finishActiveSpin() {
  if (!activeSpin) {
    return;
  }

  activeSpin.intervals.forEach((intervalId) => window.clearInterval(intervalId));
  activeSpin.timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));

  activeSpin.reels.forEach((reelElement, reelIndex) => {
    reelElement.classList.remove("spinning");
    reelElement.innerHTML = "";

    for (let row = 0; row < ROW_COUNT; row += 1) {
      reelElement.appendChild(createSymbolCell(activeSpin.nextBoard[row][reelIndex], reelIndex, row));
    }
  });

  state.board = activeSpin.nextBoard;
  settleSpin(activeSpin.nextBoard, activeSpin.usedFreeSpin);
}

/**
 * Opens or closes the settings overlay.
 * @param {boolean} isOpen
 */
function setSettingsOpen(isOpen) {
  const overlay = document.getElementById("settingsOverlay");
  overlay.classList.toggle("show", isOpen);
  overlay.setAttribute("aria-hidden", String(!isOpen));
}

/**
 * Starts one complete spin sequence.
 */
function spin() {
  const usedFreeSpin = state.freeSpins > 0;

  if (state.isSpinning || (!usedFreeSpin && state.balance < state.bet)) {
    return;
  }

  state.isSpinning = true;
  clearWinHighlights();
  hideWinPopup();
  clearBigWinCelebration();
  setMessage(usedFreeSpin ? "Free spin rolling" : "Reels spinning");

  if (usedFreeSpin) {
    state.freeSpins -= 1;
  } else {
    state.balance -= state.bet;
  }

  updateDisplays();
  playSound("spin");

  const nextBoard = createBoard();
  const reels = Array.from(document.querySelectorAll(".reel"));
  const intervals = [];
  const timeouts = [];

  activeSpin = {
    usedFreeSpin,
    nextBoard,
    reels,
    intervals,
    timeouts
  };

  if (state.fastPlayEnabled) {
    finishActiveSpin();
    return;
  }

  reels.forEach((reelElement, reelIndex) => {
    const interval = window.setInterval(() => renderSpinStrip(reelElement, reelIndex), 86);
    const stopDelay = 650 + reelIndex * 260;
    const timeoutId = window.setTimeout(() => {
      if (!activeSpin || activeSpin.nextBoard !== nextBoard) {
        return;
      }

      window.clearInterval(interval);
      reelElement.classList.remove("spinning");
      reelElement.innerHTML = "";

      for (let row = 0; row < ROW_COUNT; row += 1) {
        reelElement.appendChild(createSymbolCell(nextBoard[row][reelIndex], reelIndex, row));
      }

      playSound("reelStop");

      if (reelIndex === reels.length - 1) {
        state.board = nextBoard;
        settleSpin(nextBoard, usedFreeSpin);
      }
    }, stopDelay);

    intervals.push(interval);
    timeouts.push(timeoutId);
  });
}

/**
 * Starts a spin or skips the current one depending on game state.
 */
function handleSpinButtonClick() {
  if (state.isSpinning) {
    finishActiveSpin();
    return;
  }

  spin();
}

/**
 * Changes the active bet by one step.
 * @param {number} direction
 */
function changeBet(direction) {
  if (state.isSpinning) {
    return;
  }

  state.bet = clampBet(state.bet + direction * BET_STEP);
  updateDisplays();
}

/**
 * Wires UI events once the document is ready.
 */
function initializeGame() {
  state.fastPlayEnabled = loadFastPlayPreference();
  renderBoard(state.board);
  updateDisplays();
  document.getElementById("fastPlayToggle").checked = state.fastPlayEnabled;
  document.getElementById("spinButton").addEventListener("click", handleSpinButtonClick);
  document.getElementById("decreaseBetButton").addEventListener("click", () => changeBet(-1));
  document.getElementById("increaseBetButton").addEventListener("click", () => changeBet(1));
  document.getElementById("settingsButton").addEventListener("click", () => {
    const overlay = document.getElementById("settingsOverlay");
    setSettingsOpen(overlay.getAttribute("aria-hidden") === "true");
  });
  document.getElementById("settingsOverlay").addEventListener("click", (event) => {
    if (event.target.id === "settingsOverlay") {
      setSettingsOpen(false);
    }
  });
  document.getElementById("fastPlayToggle").addEventListener("change", (event) => {
    state.fastPlayEnabled = event.target.checked;
    saveFastPlayPreference(state.fastPlayEnabled);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setSettingsOpen(false);
      return;
    }

    if (event.repeat || event.key.toLowerCase() !== "j") {
      return;
    }

    triggerBigWinFeedback(state.bet * 20);
  });
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initializeGame);
}

if (typeof module !== "undefined") {
  module.exports = {
    MIN_BET,
    MAX_BET,
    SYMBOLS,
    PAYLINES,
    clampBet,
    countSymbol,
    evaluateBoard,
    getLeftToRightMatch
  };
}
