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

/**
 * @typedef {Object} BoardCellFeature
 * @property {number} multiplier
 */

/**
 * @typedef {Object} LineWin
 * @property {string} lineName
 * @property {string} symbolId
 * @property {number} count
 * @property {number} baseWin
 * @property {number} payout
 * @property {number} multiplier
 */

/**
 * @typedef {Object} WinResult
 * @property {number} totalWin
 * @property {number} freeSpinsAwarded
 * @property {number} appliedMultiplier
 * @property {number} scatterCount
 * @property {boolean} bonusTriggered
 * @property {{reel: number, row: number}[]} winningCells
 * @property {string[]} activeHorizontalLines
 * @property {LineWin[]} lineWins
 */

/**
 * @typedef {Object} BonusPrize
 * @property {"coins" | "multiplier" | "free-spins" | "collect"} type
 * @property {string} label
 * @property {number} value
 */

/**
 * @typedef {Object} BonusRoundState
 * @property {boolean} active
 * @property {number} totalCoins
 * @property {number} freeSpinsAwarded
 * @property {number} bonusMultiplier
 * @property {number} picksMade
 * @property {boolean[]} revealedCrates
 * @property {BonusPrize[]} prizes
 */

/**
 * @typedef {Object} SlotState
 * @property {number} balance
 * @property {number} bet
 * @property {boolean} isSpinning
 * @property {number} freeSpins
 * @property {string[][]} board
 * @property {(BoardCellFeature | null)[][]} boardFeatures
 * @property {boolean} fastPlayEnabled
 * @property {boolean} isBonusActive
 * @property {BonusRoundState | null} bonusRound
 * @property {{mini: number, major: number, grand: number}} jackpots
 */

const GAME_LIMITS = {
  minBet: 10,
  maxBet: 100,
  betStep: 10,
  defaultBalance: 1000,
  reelCount: 5,
  rowCount: 3
};

const SYMBOL_IDS = {
  wild: "wild",
  scatter: "scatter",
  dynamite: "dynamite"
};

const STORAGE_KEYS = {
  fastPlay: "gunslinger-gold-fast-play",
  jackpots: "gunslinger-gold-jackpots"
};

const MULTIPLIER_CONFIG = {
  values: [2, 3, 5],
  cap: 25,
  wildChance: 0.32
};

const FREE_SPIN_CONFIG = {
  multiplier: 2,
  awards: {
    3: 8,
    4: 12,
    5: 20
  }
};

const JACKPOT_CONFIG = {
  startingValues: {
    mini: 500,
    major: 2500,
    grand: 25000
  },
  contributionRates: {
    mini: 0.04,
    major: 0.01,
    grand: 0.002
  },
  randomOdds: {
    mini: 400,
    major: 2500
  },
  celebrationCoins: 34
};

const BONUS_CONFIG = {
  triggerCount: 3,
  maxPicks: 3,
  crateCount: 6,
  labels: {
    coinsSmall: "Small Coins",
    coinsMedium: "Medium Coins",
    coinsLarge: "Large Coins",
    multiplier: "Multiplier Boost",
    freeSpins: "Extra Free Spins",
    collect: "Collect & Exit"
  },
  values: {
    coinsSmallMultiplier: 8,
    coinsMediumMultiplier: 16,
    coinsLargeMultiplier: 28,
    bonusMultiplier: 2,
    bonusFreeSpins: 6
  }
};

/** @type {SymbolDefinition[]} */
const SYMBOLS = [
  { id: "badge", label: "Sheriff", className: "symbol-badge", weight: 7, payouts: { 3: 6, 4: 18, 5: 70 } },
  { id: "boots", label: "Boots", className: "symbol-boots", weight: 8, payouts: { 3: 5, 4: 15, 5: 55 } },
  { id: "cowboy", label: "Cowboy", className: "symbol-cowboy", weight: 7, payouts: { 3: 7, 4: 22, 5: 90 } },
  { id: "wanted", label: "Wanted", className: "symbol-wanted", weight: 8, payouts: { 3: 4, 4: 12, 5: 42 } },
  { id: "cactus", label: "Cactus", className: "symbol-cactus", weight: 8, payouts: { 3: 3, 4: 10, 5: 32 } },
  { id: SYMBOL_IDS.dynamite, label: "Dynamite", className: "symbol-dynamite", weight: 7, payouts: { 3: 4, 4: 14, 5: 46 } },
  { id: SYMBOL_IDS.scatter, label: "Scatter", className: "symbol-scatter", weight: 4, payouts: { 3: 2, 4: 8, 5: 35 } },
  { id: SYMBOL_IDS.wild, label: "Wild", className: "symbol-wild", weight: 5, payouts: { 3: 8, 4: 24, 5: 100 } },
  { id: "a", label: "A", className: "symbol-letter", weight: 7, payouts: { 3: 2, 4: 6, 5: 18 } },
  { id: "k", label: "K", className: "symbol-letter", weight: 8, payouts: { 3: 2, 4: 5, 5: 16 } },
  { id: "q", label: "Q", className: "symbol-letter", weight: 8, payouts: { 3: 1, 4: 4, 5: 14 } },
  { id: "j", label: "J", className: "symbol-letter", weight: 9, payouts: { 3: 1, 4: 3, 5: 12 } },
  { id: "10", label: "10", className: "symbol-number", weight: 10, payouts: { 3: 1, 4: 3, 5: 10 } }
];

/** @type {{name: string, rows: number[]}[]} */
const PAYLINES = [
  { name: "top", rows: [0, 0, 0, 0, 0] },
  { name: "middle", rows: [1, 1, 1, 1, 1] },
  { name: "bottom", rows: [2, 2, 2, 2, 2] },
  { name: "v", rows: [0, 1, 2, 1, 0] },
  { name: "chevron", rows: [2, 1, 0, 1, 2] },
  { name: "trail-up", rows: [2, 2, 1, 0, 0] },
  { name: "trail-down", rows: [0, 0, 1, 2, 2] }
];

const HORIZONTAL_PAYLINES = ["top", "middle", "bottom"];

/** @type {Record<string, SymbolDefinition>} */
const SYMBOL_MAP = SYMBOLS.reduce((map, symbol) => {
  map[symbol.id] = symbol;
  return map;
}, {});

/** @type {string[]} */
const WEIGHTED_SYMBOL_IDS = buildWeightedSymbolIds(SYMBOLS);

/** @type {SlotState} */
const state = {
  balance: GAME_LIMITS.defaultBalance,
  bet: GAME_LIMITS.minBet,
  isSpinning: false,
  freeSpins: 0,
  board: [],
  boardFeatures: [],
  fastPlayEnabled: false,
  isBonusActive: false,
  bonusRound: null,
  jackpots: { ...JACKPOT_CONFIG.startingValues }
};

let audioContext = null;
let popupTimeout = 0;
let bigWinTimeout = 0;
let activeSpin = null;

state.board = createBoard();
state.boardFeatures = createBoardFeatureGrid(state.board);

/**
 * Builds the weighted lookup array used by spins.
 * @param {SymbolDefinition[]} symbols
 * @returns {string[]}
 */
function buildWeightedSymbolIds(symbols) {
  return symbols.flatMap((symbol) => Array.from({ length: symbol.weight }, () => symbol.id));
}

/**
 * Reads the saved fast play preference.
 * @returns {boolean}
 */
function loadFastPlayPreference() {
  try {
    return window.localStorage.getItem(STORAGE_KEYS.fastPlay) === "true";
  } catch (_error) {
    return false;
  }
}

/**
 * Saves the fast play preference.
 * @param {boolean} value
 */
function saveFastPlayPreference(value) {
  try {
    window.localStorage.setItem(STORAGE_KEYS.fastPlay, String(value));
  } catch (_error) {
    // Ignore storage failures so gameplay continues normally.
  }
}

/**
 * Loads persisted jackpot values if they are available.
 * @returns {{mini: number, major: number, grand: number}}
 */
function loadJackpotPots() {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEYS.jackpots);
    if (!rawValue) {
      return { ...JACKPOT_CONFIG.startingValues };
    }

    const parsedValue = JSON.parse(rawValue);
    return {
      mini: Number.isFinite(parsedValue.mini) ? Math.max(JACKPOT_CONFIG.startingValues.mini, parsedValue.mini) : JACKPOT_CONFIG.startingValues.mini,
      major: Number.isFinite(parsedValue.major) ? Math.max(JACKPOT_CONFIG.startingValues.major, parsedValue.major) : JACKPOT_CONFIG.startingValues.major,
      grand: Number.isFinite(parsedValue.grand) ? Math.max(JACKPOT_CONFIG.startingValues.grand, parsedValue.grand) : JACKPOT_CONFIG.startingValues.grand
    };
  } catch (_error) {
    return { ...JACKPOT_CONFIG.startingValues };
  }
}

/**
 * Persists jackpot values across browser sessions.
 * @param {{mini: number, major: number, grand: number}} jackpots
 */
function saveJackpotPots(jackpots) {
  try {
    window.localStorage.setItem(STORAGE_KEYS.jackpots, JSON.stringify(jackpots));
  } catch (_error) {
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
 * Returns a randomly selected item from a list.
 * @template T
 * @param {T[]} values
 * @returns {T}
 */
function pickRandom(values) {
  return values[randomInteger(values.length)];
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
  return Array.from({ length: GAME_LIMITS.rowCount }, () => (
    Array.from({ length: GAME_LIMITS.reelCount }, () => getRandomSymbolId())
  ));
}

/**
 * Creates an empty board-feature grid.
 * @returns {(BoardCellFeature | null)[][]}
 */
function createEmptyFeatureGrid() {
  return Array.from({ length: GAME_LIMITS.rowCount }, () => Array.from({ length: GAME_LIMITS.reelCount }, () => null));
}

/**
 * Creates per-cell metadata for special variants such as multiplier wilds.
 * @param {string[][]} board
 * @returns {(BoardCellFeature | null)[][]}
 */
function createBoardFeatureGrid(board) {
  const features = createEmptyFeatureGrid();

  board.forEach((row, rowIndex) => {
    row.forEach((symbolId, reelIndex) => {
      if (symbolId === SYMBOL_IDS.wild && Math.random() < MULTIPLIER_CONFIG.wildChance) {
        features[rowIndex][reelIndex] = { multiplier: pickRandom(MULTIPLIER_CONFIG.values) };
      }
    });
  });

  return features;
}

/**
 * Clamps a bet value to supported bet bounds.
 * @param {number} value
 * @returns {number}
 */
function clampBet(value) {
  return Math.min(GAME_LIMITS.maxBet, Math.max(GAME_LIMITS.minBet, value));
}

/**
 * Gets the best payline match from the leftmost reel.
 * @param {string[]} lineSymbols
 * @returns {{symbolId: string, count: number} | null}
 */
function getLeftToRightMatch(lineSymbols) {
  const firstNonWild = lineSymbols.find((symbolId) => symbolId !== SYMBOL_IDS.wild && symbolId !== SYMBOL_IDS.scatter);
  const targetId = firstNonWild || SYMBOL_IDS.wild;
  let count = 0;

  for (const symbolId of lineSymbols) {
    if (symbolId === SYMBOL_IDS.scatter) {
      break;
    }

    if (symbolId === targetId || symbolId === SYMBOL_IDS.wild) {
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
 * Returns a free-spin award count based on scatter count.
 * @param {number} scatterCount
 * @returns {number}
 */
function getFreeSpinAward(scatterCount) {
  return FREE_SPIN_CONFIG.awards[Math.min(scatterCount, GAME_LIMITS.reelCount)] || 0;
}

/**
 * Reads feature metadata for a single cell.
 * @param {(BoardCellFeature | null)[][] | undefined} boardFeatures
 * @param {number} row
 * @param {number} reel
 * @returns {BoardCellFeature | null}
 */
function getCellFeature(boardFeatures, row, reel) {
  if (!boardFeatures || !boardFeatures[row]) {
    return null;
  }

  return boardFeatures[row][reel] || null;
}

/**
 * Computes the multiplier applied to a matching payline.
 * @param {string[]} lineSymbols
 * @param {number[]} rows
 * @param {(BoardCellFeature | null)[][] | undefined} boardFeatures
 * @param {number} count
 * @param {boolean} isFreeSpinRound
 * @returns {number}
 */
function getLineMultiplier(lineSymbols, rows, boardFeatures, count, isFreeSpinRound) {
  let multiplier = 1;

  for (let reel = 0; reel < count; reel += 1) {
    if (lineSymbols[reel] !== SYMBOL_IDS.wild) {
      continue;
    }

    const feature = getCellFeature(boardFeatures, rows[reel], reel);
    if (feature && feature.multiplier > 1) {
      multiplier *= feature.multiplier;
      multiplier = Math.min(multiplier, MULTIPLIER_CONFIG.cap);
    }
  }

  if (isFreeSpinRound) {
    multiplier *= FREE_SPIN_CONFIG.multiplier;
  }

  return multiplier;
}

/**
 * Evaluates line and scatter wins for a board.
 * @param {string[][]} board
 * @param {number} bet
 * @param {{boardFeatures?: (BoardCellFeature | null)[][], isFreeSpinRound?: boolean}} [options]
 * @returns {WinResult}
 */
function evaluateBoard(board, bet, options = {}) {
  const winningCellKeys = new Set();
  const activeHorizontalLines = new Set();
  const lineWins = [];
  let totalWin = 0;
  let appliedMultiplier = 1;

  for (const payline of PAYLINES) {
    const lineSymbols = payline.rows.map((row, reel) => board[row][reel]);
    const match = getLeftToRightMatch(lineSymbols);

    if (!match) {
      continue;
    }

    const symbol = SYMBOL_MAP[match.symbolId];
    const baseWin = bet * symbol.payouts[match.count];
    const multiplier = getLineMultiplier(
      lineSymbols,
      payline.rows,
      options.boardFeatures,
      match.count,
      Boolean(options.isFreeSpinRound)
    );
    const payout = baseWin * multiplier;

    lineWins.push({
      lineName: payline.name,
      symbolId: match.symbolId,
      count: match.count,
      baseWin,
      payout,
      multiplier
    });
    totalWin += payout;
    appliedMultiplier = Math.max(appliedMultiplier, multiplier);

    for (let reel = 0; reel < match.count; reel += 1) {
      winningCellKeys.add(`${reel}:${payline.rows[reel]}`);
    }

    if (HORIZONTAL_PAYLINES.includes(payline.name)) {
      activeHorizontalLines.add(payline.name);
    }
  }

  const scatterCount = countSymbol(board, SYMBOL_IDS.scatter);
  const scatterPayout = SYMBOL_MAP[SYMBOL_IDS.scatter].payouts[Math.min(scatterCount, GAME_LIMITS.reelCount)] || 0;
  const freeSpinsAwarded = getFreeSpinAward(scatterCount);

  if (scatterCount >= 3) {
    totalWin += bet * scatterPayout;

    board.forEach((row, rowIndex) => {
      row.forEach((symbolId, reel) => {
        if (symbolId === SYMBOL_IDS.scatter) {
          winningCellKeys.add(`${reel}:${rowIndex}`);
        }
      });
    });
  }

  return {
    totalWin,
    freeSpinsAwarded,
    appliedMultiplier,
    scatterCount,
    bonusTriggered: countSymbol(board, SYMBOL_IDS.dynamite) >= BONUS_CONFIG.triggerCount,
    winningCells: Array.from(winningCellKeys).map((key) => {
      const [reel, row] = key.split(":").map(Number);
      return { reel, row };
    }),
    activeHorizontalLines: Array.from(activeHorizontalLines),
    lineWins
  };
}

/**
 * Checks whether a row contains five wilds.
 * @param {string[][]} board
 * @param {number} rowIndex
 * @returns {boolean}
 */
function isWildHorizontalLine(board, rowIndex) {
  return board[rowIndex].every((symbolId) => symbolId === SYMBOL_IDS.wild);
}

/**
 * Determines whether the board awards a jackpot tier.
 * @param {string[][]} board
 * @returns {"mini" | "major" | "grand" | null}
 */
function determineJackpotTier(board) {
  const allRowsWild = board.every((row) => row.every((symbolId) => symbolId === SYMBOL_IDS.wild));
  if (allRowsWild) {
    return "grand";
  }

  if (isWildHorizontalLine(board, 0) || isWildHorizontalLine(board, 2)) {
    return "major";
  }

  if (isWildHorizontalLine(board, 1)) {
    return "mini";
  }

  return null;
}

/**
 * Resolves rare random jackpot hits for paid spins.
 * @returns {"mini" | "major" | null}
 */
function rollRandomJackpotTier() {
  if (randomInteger(JACKPOT_CONFIG.randomOdds.major) === 0) {
    return "major";
  }

  if (randomInteger(JACKPOT_CONFIG.randomOdds.mini) === 0) {
    return "mini";
  }

  return null;
}

/**
 * Applies per-spin contributions to progressive jackpots.
 * @param {number} bet
 */
function contributeToJackpots(bet) {
  state.jackpots.mini += Math.max(1, Math.round(bet * JACKPOT_CONFIG.contributionRates.mini));
  state.jackpots.major += Math.max(1, Math.round(bet * JACKPOT_CONFIG.contributionRates.major));
  state.jackpots.grand += Math.max(1, Math.round(bet * JACKPOT_CONFIG.contributionRates.grand));
  saveJackpotPots(state.jackpots);
}

/**
 * Awards a jackpot and resets the affected pot.
 * @param {"mini" | "major" | "grand"} tier
 * @returns {number}
 */
function awardJackpot(tier) {
  const amount = state.jackpots[tier];
  state.balance += amount;
  state.jackpots[tier] = JACKPOT_CONFIG.startingValues[tier];
  saveJackpotPots(state.jackpots);
  return amount;
}

/**
 * Builds one symbol cell for the reel display.
 * @param {string} symbolId
 * @param {number} reel
 * @param {number} row
 * @param {BoardCellFeature | null} feature
 * @returns {HTMLDivElement}
 */
function createSymbolCell(symbolId, reel, row, feature = null) {
  const symbol = SYMBOL_MAP[symbolId];
  const cell = document.createElement("div");
  const artText = symbol.className === "symbol-letter" || symbol.className === "symbol-number" ? symbol.label : "";
  const multiplierBadge = feature && feature.multiplier > 1 ? `<span class="multiplier-badge">x${feature.multiplier}</span>` : "";

  cell.className = `symbol-cell ${symbol.className}`;
  cell.dataset.reel = String(reel);
  cell.dataset.row = String(row);
  cell.dataset.symbol = symbol.id;
  cell.innerHTML = `
    ${multiplierBadge}
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
 * @param {(BoardCellFeature | null)[][]} [boardFeatures]
 */
function renderBoard(board, boardFeatures = state.boardFeatures) {
  const reels = document.querySelectorAll(".reel");
  reels.forEach((reelElement, reelIndex) => {
    reelElement.innerHTML = "";

    for (let row = 0; row < GAME_LIMITS.rowCount; row += 1) {
      reelElement.appendChild(createSymbolCell(board[row][reelIndex], reelIndex, row, getCellFeature(boardFeatures, row, reelIndex)));
    }
  });
}

/**
 * Updates text displays and disabled states.
 */
function updateDisplays() {
  const spinButton = document.getElementById("spinButton");
  const freeSpinsMeter = document.getElementById("freeSpinsMeter");
  const freeSpinsDisplay = document.getElementById("freeSpinsDisplay");

  document.getElementById("balanceDisplay").textContent = String(state.balance);
  document.getElementById("betDisplay").textContent = String(state.bet);
  document.getElementById("miniJackpotDisplay").textContent = String(state.jackpots.mini);
  document.getElementById("majorJackpotDisplay").textContent = String(state.jackpots.major);
  document.getElementById("grandJackpotDisplay").textContent = String(state.jackpots.grand);
  document.getElementById("decreaseBetButton").disabled = state.isSpinning || state.bet <= GAME_LIMITS.minBet || state.isBonusActive;
  document.getElementById("increaseBetButton").disabled = state.isSpinning || state.bet >= GAME_LIMITS.maxBet || state.isBonusActive;
  spinButton.disabled = state.isBonusActive || (!state.isSpinning && state.balance < state.bet && state.freeSpins === 0);
  spinButton.textContent = state.isSpinning ? "Skip" : "Spin";

  if (state.freeSpins > 0) {
    freeSpinsMeter.hidden = false;
    freeSpinsDisplay.textContent = `${state.freeSpins} (x${FREE_SPIN_CONFIG.multiplier})`;
  } else {
    freeSpinsMeter.hidden = true;
    freeSpinsDisplay.textContent = "0";
  }
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

  for (let row = 0; row < GAME_LIMITS.rowCount; row += 1) {
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
 * Clears the active celebration visuals for the provided overlay.
 * @param {string} overlayId
 */
function clearCelebration(overlayId) {
  const celebration = document.getElementById(overlayId);
  celebration.classList.remove("show");
  celebration.setAttribute("aria-hidden", "true");
  celebration.innerHTML = "";
}

/**
 * Clears the active big win celebration visuals.
 */
function clearBigWinCelebration() {
  window.clearTimeout(bigWinTimeout);
  clearCelebration("bigWinCelebration");
  clearCelebration("jackpotCelebration");
}

/**
 * Appends animated coin sprites to a celebration overlay.
 * @param {HTMLElement} celebration
 * @param {number} coinCount
 */
function populateCoinBurst(celebration, coinCount) {
  for (let index = 0; index < coinCount; index += 1) {
    const coin = document.createElement("span");
    coin.className = "coin-burst";
    coin.style.setProperty("--coin-x", `${4 + randomInteger(92)}vw`);
    coin.style.setProperty("--coin-drift", `${randomInteger(18) - 9}vw`);
    coin.style.setProperty("--coin-scale", `${0.8 + Math.random() * 0.8}`);
    coin.style.setProperty("--coin-duration", `${1.9 + Math.random() * 1.2}s`);
    coin.style.setProperty("--coin-delay", `${Math.random() * 0.65}s`);
    celebration.appendChild(coin);
  }
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
  populateCoinBurst(celebration, 22);
  celebration.classList.add("show");
  celebration.setAttribute("aria-hidden", "false");
  bigWinTimeout = window.setTimeout(clearBigWinCelebration, 2600);
}

/**
 * Triggers jackpot-specific celebration visuals.
 * @param {"mini" | "major" | "grand"} tier
 * @param {number} amount
 */
function triggerJackpotFeedback(tier, amount) {
  const celebration = document.getElementById("jackpotCelebration");

  clearBigWinCelebration();
  celebration.innerHTML = `
    <div class="jackpot-banner">
      <span class="jackpot-tier">${tier.toUpperCase()} JACKPOT!</span>
      <strong class="jackpot-amount">${amount}</strong>
    </div>
  `;
  populateCoinBurst(celebration, JACKPOT_CONFIG.celebrationCoins);
  celebration.classList.add("show");
  celebration.setAttribute("aria-hidden", "false");
  setMessage(`${tier.toUpperCase()} jackpot paid`, true);
  showWinPopup(`${tier.toUpperCase()} Jackpot`, amount, "jackpot");
  playSound("jackpot");
  bigWinTimeout = window.setTimeout(clearBigWinCelebration, 3400);
}

/**
 * Formats the win message with the applied multiplier.
 * @param {WinResult} result
 * @returns {string}
 */
function getWinLabel(result) {
  const multiplierText = result.appliedMultiplier > 1 ? ` x${result.appliedMultiplier}` : "";
  if (result.freeSpinsAwarded > 0) {
    return `Win${multiplierText} + Free Spins`;
  }

  return `Win${multiplierText}`;
}

/**
 * Returns a status line that summarizes the win state.
 * @param {WinResult} result
 * @returns {string}
 */
function getStatusMessage(result) {
  const fragments = [];

  if (result.totalWin > 0) {
    fragments.push(result.appliedMultiplier > 1 ? `Win x${result.appliedMultiplier}` : "Win paid");
  }

  if (result.freeSpinsAwarded > 0) {
    fragments.push(`${result.freeSpinsAwarded} free spins awarded`);
  }

  return fragments.join(" | ") || "No win this round";
}

/**
 * Creates a deterministic set of bonus prizes for the next bonus round.
 * @param {number} bet
 * @returns {BonusPrize[]}
 */
function createBonusPrizes(bet) {
  const coinValue = (multiplier) => bet * multiplier;
  return shuffleArray([
    { type: "coins", label: BONUS_CONFIG.labels.coinsSmall, value: coinValue(BONUS_CONFIG.values.coinsSmallMultiplier) },
    { type: "coins", label: BONUS_CONFIG.labels.coinsMedium, value: coinValue(BONUS_CONFIG.values.coinsMediumMultiplier) },
    { type: "coins", label: BONUS_CONFIG.labels.coinsLarge, value: coinValue(BONUS_CONFIG.values.coinsLargeMultiplier) },
    { type: "multiplier", label: BONUS_CONFIG.labels.multiplier, value: BONUS_CONFIG.values.bonusMultiplier },
    { type: "free-spins", label: BONUS_CONFIG.labels.freeSpins, value: BONUS_CONFIG.values.bonusFreeSpins },
    { type: "collect", label: BONUS_CONFIG.labels.collect, value: 0 }
  ]);
}

/**
 * Returns a shuffled copy of an array.
 * @template T
 * @param {T[]} values
 * @returns {T[]}
 */
function shuffleArray(values) {
  const nextValues = [...values];

  for (let index = nextValues.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInteger(index + 1);
    const currentValue = nextValues[index];
    nextValues[index] = nextValues[swapIndex];
    nextValues[swapIndex] = currentValue;
  }

  return nextValues;
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
 * Opens or closes the bonus overlay.
 * @param {boolean} isOpen
 */
function setBonusOpen(isOpen) {
  const overlay = document.getElementById("bonusOverlay");
  overlay.classList.toggle("show", isOpen);
  overlay.setAttribute("aria-hidden", String(!isOpen));
}

/**
 * Renders bonus-round status and crate state.
 */
function renderBonusRound() {
  const bonusState = state.bonusRound;
  if (!bonusState) {
    return;
  }

  const crateContainer = document.getElementById("bonusCrates");
  const bonusStatus = document.getElementById("bonusStatus");
  crateContainer.innerHTML = "";

  bonusStatus.textContent = `Total ${bonusState.totalCoins} | Free Spins +${bonusState.freeSpinsAwarded} | Bonus x${bonusState.bonusMultiplier} | Picks ${bonusState.picksMade}/${BONUS_CONFIG.maxPicks}`;

  bonusState.prizes.forEach((prize, index) => {
    const button = document.createElement("button");
    const isRevealed = bonusState.revealedCrates[index];
    button.className = "crate-button";
    button.type = "button";
    button.dataset.crateIndex = String(index);
    button.textContent = isRevealed
      ? (prize.type === "coins" ? `${prize.label}: ${prize.value}` : `${prize.label}${prize.value > 0 ? `: ${prize.value}` : ""}`)
      : `Crate ${index + 1}`;

    if (isRevealed) {
      button.disabled = true;
      button.classList.add("revealed");
    }

    crateContainer.appendChild(button);
  });
}

/**
 * Starts the pick-a-crate bonus round.
 */
function startBonusRound() {
  state.isBonusActive = true;
  state.bonusRound = {
    active: true,
    totalCoins: 0,
    freeSpinsAwarded: 0,
    bonusMultiplier: 1,
    picksMade: 0,
    revealedCrates: Array.from({ length: BONUS_CONFIG.crateCount }, () => false),
    prizes: createBonusPrizes(state.bet)
  };

  setMessage("Pick a crate for bonus loot");
  setBonusOpen(true);
  renderBonusRound();
  updateDisplays();
}

/**
 * Finalizes the bonus round and applies its rewards.
 */
function finishBonusRound() {
  const bonusState = state.bonusRound;
  if (!bonusState) {
    return;
  }

  state.balance += bonusState.totalCoins;
  state.freeSpins += bonusState.freeSpinsAwarded;
  state.isBonusActive = false;
  state.bonusRound = null;
  setBonusOpen(false);

  const freeSpinText = bonusState.freeSpinsAwarded > 0 ? ` + ${bonusState.freeSpinsAwarded} free spins` : "";
  setMessage(`Bonus win ${bonusState.totalCoins}${freeSpinText}`);
  showWinPopup(`Bonus Win x${bonusState.bonusMultiplier}`, bonusState.totalCoins);
  updateDisplays();
}

/**
 * Applies a selected crate prize to the active bonus round.
 * @param {number} crateIndex
 */
function resolveBonusPick(crateIndex) {
  const bonusState = state.bonusRound;
  if (!bonusState || !bonusState.prizes[crateIndex]) {
    return;
  }

  const prize = bonusState.prizes[crateIndex];
  const crateButtons = Array.from(document.querySelectorAll(".crate-button"));
  const button = crateButtons[crateIndex];

  if (!button || button.disabled || bonusState.revealedCrates[crateIndex]) {
    return;
  }

  bonusState.revealedCrates[crateIndex] = true;
  button.disabled = true;
  button.classList.add("revealed");
  button.textContent = prize.type === "coins" ? `${prize.label}: ${prize.value}` : `${prize.label}${prize.value > 0 ? `: ${prize.value}` : ""}`;

  if (prize.type === "coins") {
    bonusState.totalCoins += prize.value * bonusState.bonusMultiplier;
    bonusState.picksMade += 1;
  } else if (prize.type === "multiplier") {
    bonusState.bonusMultiplier *= prize.value;
    bonusState.picksMade += 1;
  } else if (prize.type === "free-spins") {
    bonusState.freeSpinsAwarded += prize.value;
    bonusState.picksMade += 1;
  }

  const shouldFinish = prize.type === "collect" || bonusState.picksMade >= BONUS_CONFIG.maxPicks;
  const resultMessage = prize.type === "collect" ? "Bonus collected" : `Revealed ${prize.label}`;
  setMessage(resultMessage);
  renderBonusRound();

  if (shouldFinish) {
    finishBonusRound();
  }
}

/**
 * Handles the end of a spin once all reels have stopped.
 * @param {string[][]} board
 * @param {(BoardCellFeature | null)[][]} boardFeatures
 * @param {boolean} usedFreeSpin
 */
function settleSpin(board, boardFeatures, usedFreeSpin) {
  const result = evaluateBoard(board, state.bet, { boardFeatures, isFreeSpinRound: usedFreeSpin });
  let jackpotTier = null;
  let jackpotAmount = 0;

  state.balance += result.totalWin;
  state.freeSpins += result.freeSpinsAwarded;
  state.isSpinning = false;
  activeSpin = null;

  highlightWins(result);

  if (!usedFreeSpin) {
    jackpotTier = determineJackpotTier(board) || rollRandomJackpotTier();
  }

  if (jackpotTier) {
    jackpotAmount = awardJackpot(jackpotTier);
  }

  if (result.totalWin >= state.bet * 20) {
    triggerBigWinFeedback(result.totalWin);
  } else if (result.totalWin > 0) {
    setMessage(getStatusMessage(result));
    showWinPopup(getWinLabel(result), result.totalWin);
    playSound("win");
  } else if (result.freeSpinsAwarded > 0) {
    setMessage(getStatusMessage(result));
  } else {
    setMessage("No win this round");
  }

  if (jackpotTier) {
    triggerJackpotFeedback(jackpotTier, jackpotAmount);
  }

  updateDisplays();

  if (result.bonusTriggered) {
    startBonusRound();
  }
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

    for (let row = 0; row < GAME_LIMITS.rowCount; row += 1) {
      reelElement.appendChild(
        createSymbolCell(
          activeSpin.nextBoard[row][reelIndex],
          reelIndex,
          row,
          getCellFeature(activeSpin.nextBoardFeatures, row, reelIndex)
        )
      );
    }
  });

  state.board = activeSpin.nextBoard;
  state.boardFeatures = activeSpin.nextBoardFeatures;
  settleSpin(activeSpin.nextBoard, activeSpin.nextBoardFeatures, activeSpin.usedFreeSpin);
}

/**
 * Starts one complete spin sequence.
 */
function spin() {
  const usedFreeSpin = state.freeSpins > 0;

  if (state.isSpinning || state.isBonusActive || (!usedFreeSpin && state.balance < state.bet)) {
    return;
  }

  state.isSpinning = true;
  clearWinHighlights();
  hideWinPopup();
  clearBigWinCelebration();
  setMessage(usedFreeSpin ? `Free spin rolling (x${FREE_SPIN_CONFIG.multiplier})` : "Reels spinning");

  if (usedFreeSpin) {
    state.freeSpins -= 1;
  } else {
    state.balance -= state.bet;
    contributeToJackpots(state.bet);
  }

  updateDisplays();
  playSound("spin");

  const nextBoard = createBoard();
  const nextBoardFeatures = createBoardFeatureGrid(nextBoard);
  const reels = Array.from(document.querySelectorAll(".reel"));
  const intervals = [];
  const timeouts = [];

  activeSpin = {
    usedFreeSpin,
    nextBoard,
    nextBoardFeatures,
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

      for (let row = 0; row < GAME_LIMITS.rowCount; row += 1) {
        reelElement.appendChild(createSymbolCell(nextBoard[row][reelIndex], reelIndex, row, getCellFeature(nextBoardFeatures, row, reelIndex)));
      }

      playSound("reelStop");

      if (reelIndex === reels.length - 1) {
        state.board = nextBoard;
        state.boardFeatures = nextBoardFeatures;
        settleSpin(nextBoard, nextBoardFeatures, usedFreeSpin);
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
  if (state.isSpinning || state.isBonusActive) {
    return;
  }

  state.bet = clampBet(state.bet + direction * GAME_LIMITS.betStep);
  updateDisplays();
}

/**
 * Wires UI events once the document is ready.
 */
function initializeGame() {
  try {
    state.fastPlayEnabled = loadFastPlayPreference();
    state.jackpots = loadJackpotPots();
    renderBoard(state.board, state.boardFeatures);
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
    document.getElementById("bonusCrates").addEventListener("click", (event) => {
      const button = event.target.closest(".crate-button");
      if (!button) {
        return;
      }

      resolveBonusPick(Number(button.dataset.crateIndex));
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
  } catch (error) {
    console.error("Failed to initialize Gunslinger Gold.", error);
    setMessage("Game setup failed. Refresh to retry.");
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initializeGame);
}

if (typeof module !== "undefined") {
  module.exports = {
    BONUS_CONFIG,
    FREE_SPIN_CONFIG,
    GAME_LIMITS,
    JACKPOT_CONFIG,
    MULTIPLIER_CONFIG,
    PAYLINES,
    SYMBOLS,
    clampBet,
    countSymbol,
    createBoardFeatureGrid,
    createBonusPrizes,
    createEmptyFeatureGrid,
    determineJackpotTier,
    evaluateBoard,
    getFreeSpinAward,
    getLeftToRightMatch,
    getLineMultiplier,
    isWildHorizontalLine
  };
}
