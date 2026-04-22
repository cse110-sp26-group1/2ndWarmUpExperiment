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
 * @property {number} matchLength
 * @property {{reel: number, row: number}[]} matchedPositions
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
 * @typedef {Object} NearMissTimingConfig
 * @property {number} teaseHoldMs
 * @property {number} slideMs
 * @property {number} slideDistanceRows
 * @property {string[]} frames
 */

/**
 * @typedef {Object} NearMissPattern
 * @property {string} id
 * @property {string} lineName
 * @property {number} matchCount
 * @property {number} missReel
 * @property {string[]} eligibleSymbolIds
 */

/**
 * @typedef {Object} NearMissConfig
 * @property {boolean} enabled
 * @property {number} probability
 * @property {boolean} paidSpinsOnly
 * @property {boolean} disableDuringFastPlay
 * @property {NearMissTimingConfig} timing
 * @property {NearMissPattern[]} patterns
 */

/**
 * @typedef {Object} NearMissPlan
 * @property {string} patternId
 * @property {string} lineName
 * @property {number} reel
 * @property {number} row
 * @property {string} symbolId
 * @property {string} actualSymbolId
 * @property {NearMissTimingConfig} timing
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
 * @typedef {Object} RewardGrant
 * @property {"balance" | "free-spins"} type
 * @property {number} amount
 * @property {"daily-login" | "spin-award" | "bonus-round"} source
 */

/**
 * @typedef {Object} KeyboardShortcutConfig
 * @property {string} spinButtonId
 * @property {string[]} spinKeys
 * @property {string} closeSettingsKey
 * @property {string} bigWinKey
 * @property {string} blockedShortcutSelector
 * @property {string} editableShortcutSelector
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
  jackpots: "gunslinger-gold-jackpots",
  lastLoginDate: "gunslinger-gold-last-login-date"
};

const MULTIPLIER_CONFIG = {
  values: [2, 3, 5],
  cap: 25,
  wildChance: 0.4
};

const FREE_SPIN_CONFIG = {
  multiplier: 2,
  awards: {
    3: 8,
    4: 12,
    5: 20
  }
};

const DEFAULT_NEAR_MISS_TIMING = {
  teaseHoldMs: 260,
  slideMs: 220,
  slideDistanceRows: 1,
  frames: ["tease", "slide", "settle"]
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
    mini: 120,
    major: 650
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

const RETENTION_CONFIG = {
  feedbackDurationMs: 3200,
  dailyLoginReward: {
    type: "free-spins",
    amount: 3,
    source: "daily-login"
  },
  feedbackMessages: {
    defaultLabel: "Reward Added",
    defaultDescription: "Added to your account",
    sources: {
      "daily-login": {
        label: "Daily Reward",
        descriptions: {
          balance: "Added for today's login",
          "free-spins": "Added for today's login"
        }
      },
      "spin-award": {
        label: "Free Spins Added",
        descriptions: {
          "free-spins": "Scatter reward added to your meter"
        }
      },
      "bonus-round": {
        label: "Bonus Reward",
        descriptions: {
          balance: "Bonus balance added",
          "free-spins": "Bonus free spins added to your meter"
        }
      }
    }
  }
};

/** @type {KeyboardShortcutConfig} */
const KEYBOARD_CONFIG = {
  spinButtonId: "spinButton",
  spinKeys: [" ", "Spacebar"],
  closeSettingsKey: "Escape",
  bigWinKey: "j",
  blockedShortcutSelector: [
    "button",
    "input",
    "textarea",
    "select",
    "[role='button']",
    "[role='checkbox']",
    "[role='combobox']",
    "[role='menuitem']",
    "[role='option']",
    "[role='radio']",
    "[role='searchbox']",
    "[role='slider']",
    "[role='spinbutton']",
    "[role='switch']",
    "[role='textbox']"
  ].join(", "),
  editableShortcutSelector: "[contenteditable]"
};

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** @type {SymbolDefinition[]} */
const SYMBOLS = [
  { id: "badge", label: "Sheriff", className: "symbol-badge", weight: 10, payouts: { 3: 6, 4: 18, 5: 70 } },
  { id: "boots", label: "Boots", className: "symbol-boots", weight: 10, payouts: { 3: 5, 4: 15, 5: 55 } },
  { id: "cowboy", label: "Cowboy", className: "symbol-cowboy", weight: 10, payouts: { 3: 7, 4: 22, 5: 90 } },
  { id: "wanted", label: "Wanted", className: "symbol-wanted", weight: 9, payouts: { 3: 4, 4: 12, 5: 42 } },
  { id: "cactus", label: "Cactus", className: "symbol-cactus", weight: 9, payouts: { 3: 3, 4: 10, 5: 32 } },
  { id: SYMBOL_IDS.dynamite, label: "Dynamite", className: "symbol-dynamite", weight: 10, payouts: { 3: 4, 4: 14, 5: 46 } },
  { id: SYMBOL_IDS.scatter, label: "Scatter", className: "symbol-scatter", weight: 7, payouts: { 3: 2, 4: 8, 5: 35 } },
  { id: SYMBOL_IDS.wild, label: "Wild", className: "symbol-wild", weight: 9, payouts: { 3: 8, 4: 24, 5: 100 } },
  { id: "a", label: "A", className: "symbol-letter", weight: 5, payouts: { 3: 2, 4: 6, 5: 18 } },
  { id: "k", label: "K", className: "symbol-letter", weight: 5, payouts: { 3: 2, 4: 5, 5: 16 } },
  { id: "q", label: "Q", className: "symbol-letter", weight: 5, payouts: { 3: 1, 4: 4, 5: 14 } },
  { id: "j", label: "J", className: "symbol-letter", weight: 6, payouts: { 3: 1, 4: 3, 5: 12 } },
  { id: "10", label: "10", className: "symbol-number", weight: 6, payouts: { 3: 1, 4: 3, 5: 10 } }
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

/** @type {NearMissConfig} */
const NEAR_MISS_CONFIG = {
  enabled: false,
  probability: 0.18,
  paidSpinsOnly: true,
  disableDuringFastPlay: true,
  timing: { ...DEFAULT_NEAR_MISS_TIMING },
  patterns: [
    {
      id: "top-line-third-reel-slide",
      lineName: "top",
      matchCount: 2,
      missReel: 2,
      eligibleSymbolIds: ["badge", "boots", "cowboy", "wanted", "cactus", "a", "k", "q", "j", "10"]
    },
    {
      id: "middle-line-third-reel-slide",
      lineName: "middle",
      matchCount: 2,
      missReel: 2,
      eligibleSymbolIds: ["badge", "boots", "cowboy", "wanted", "cactus", "a", "k", "q", "j", "10"]
    },
    {
      id: "bottom-line-third-reel-slide",
      lineName: "bottom",
      matchCount: 2,
      missReel: 2,
      eligibleSymbolIds: ["badge", "boots", "cowboy", "wanted", "cactus", "a", "k", "q", "j", "10"]
    }
  ]
};

const HORIZONTAL_PAYLINES = ["top", "middle", "bottom"];
const NEAR_MISS_SPECIAL_SYMBOL_IDS = [SYMBOL_IDS.wild, SYMBOL_IDS.scatter, SYMBOL_IDS.dynamite];
const NEAR_MISS_FRAME_NAMES = ["tease", "slide", "settle"];

const PAYLINE_RENDER_CONFIG = {
  segmentClass: "payline-segment",
  activeSegmentClass: "active",
  reelWindowId: "reelWindow"
};

const BADGE_ART_CONFIG = Object.freeze({
  attributeName: "data-badge-text",
  symbolId: "badge",
  text: "S"
});

/**
 * @typedef {Object} SymbolArtConfig
 * @property {string} viewBox
 * @property {string} className
 * @property {string} title
 */

/**
 * @typedef {Object} SymbolArtContent
 * @property {string} markup
 * @property {"svg" | "text"} mode
 */

/** @type {Record<string, SymbolArtConfig>} */
const SYMBOL_ART_CONFIG = {
  boots: {
    viewBox: "0 0 96 80",
    className: "slot-icon slot-icon-boots",
    title: "Cowboy boots"
  },
  [SYMBOL_IDS.dynamite]: {
    viewBox: "0 0 96 80",
    className: "slot-icon slot-icon-dynamite",
    title: "Dynamite"
  },
  [SYMBOL_IDS.wild]: {
    viewBox: "0 0 96 80",
    className: "slot-icon slot-icon-wild",
    title: "Wild"
  }
};

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
let rewardFeedbackTimeout = 0;
let activeSpin = null;
let keyboardShortcutCleanup = null;
let pagehideCleanupRegistered = false;

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
 * Escapes text content before it is inserted into HTML.
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Resolves a symbol definition while guarding against invalid ids.
 * @param {string} symbolId
 * @returns {SymbolDefinition}
 */
function getSymbolDefinition(symbolId) {
  const fallbackSymbol = SYMBOLS[0];

  if (typeof symbolId !== "string") {
    console.warn("Expected a string symbol id while rendering.", symbolId);
    return fallbackSymbol;
  }

  if (!SYMBOL_MAP[symbolId]) {
    console.warn(`Unknown symbol id "${symbolId}" while rendering. Falling back to ${fallbackSymbol.id}.`);
    return fallbackSymbol;
  }

  return SYMBOL_MAP[symbolId];
}

/**
 * Wraps SVG symbol markup in a consistent inline SVG shell.
 * @param {SymbolArtConfig} config
 * @param {string} bodyMarkup
 * @param {string} symbolId
 * @returns {string}
 */
function createInlineSymbolSvg(config, bodyMarkup, symbolId) {
  return `
    <svg class="${escapeHtml(config.className)}" viewBox="${escapeHtml(config.viewBox)}" role="img" aria-label="${escapeHtml(config.title)}" data-symbol-icon="${escapeHtml(symbolId)}" xmlns="http://www.w3.org/2000/svg">
      ${bodyMarkup}
    </svg>
  `;
}

/**
 * Builds the wild sign art.
 * @param {SymbolArtConfig} config
 * @returns {string}
 */
function createWildSymbolArt(config) {
  return createInlineSymbolSvg(config, `
    <path d="M16 18 L78 12 L84 22 L82 60 L18 66 L12 56 L14 24 Z" fill="#5a2d18" stroke="#c38a43" stroke-width="3.5" stroke-linejoin="round" />
    <path d="M20 22 L76 18 L78 56 L20 60 Z" fill="#733a1f" opacity="0.55" />
    <path d="M23 24 L72 20" stroke="#b87b43" stroke-width="2.5" stroke-linecap="round" opacity="0.5" />
    <path d="M25 51 C39 44 52 44 69 48" stroke="#a86433" stroke-width="2.4" stroke-linecap="round" fill="none" opacity="0.62" />
    <path d="M19 18 L28 10 L36 18" fill="#d3a055" stroke="#81501f" stroke-width="2" stroke-linejoin="round" />
    <path d="M68 13 L76 6 L84 14" fill="#d3a055" stroke="#81501f" stroke-width="2" stroke-linejoin="round" />
    <text x="48" y="45" text-anchor="middle" fill="#ffeaa3" font-size="18" font-weight="900" font-family="Georgia, serif" letter-spacing="2.2">WILD</text>
  `, SYMBOL_IDS.wild);
}

/**
 * Builds the dynamite art from the provided western reference.
 * @param {SymbolArtConfig} config
 * @returns {string}
 */
function createDynamiteSymbolArt(config) {
  return createInlineSymbolSvg(config, `
    <g transform="translate(6 2)">
      <path d="M18 26 C17 14 24 10 31 12 C39 14 44 20 47 27" fill="none" stroke="#2d2622" stroke-width="5" stroke-linecap="round" />
      <path d="M18 26 C17 14 24 10 31 12 C39 14 44 20 47 27" fill="none" stroke="#cfd2d6" stroke-width="2.6" stroke-linecap="round" />
      <path d="M4 26 L9 20 L11 25 L18 22 L16 29 L23 32 L15 35 L16 42 L10 37 L5 42 L5 35 L-2 34 L4 29 L-1 24 Z" fill="#ffe252" stroke="#62310c" stroke-width="2" stroke-linejoin="round" data-icon-detail="spark" />
      <path d="M34 12 L55 10 C59 10 62 12 64 15 L74 59 C75 64 71 69 66 69 L48 70 C43 70 39 67 38 62 L28 19 C27 15 30 12 34 12 Z" fill="#d81a12" stroke="#5c0d0d" stroke-width="2.4" stroke-linejoin="round" />
      <ellipse cx="45" cy="15" rx="11" ry="5" fill="#ff412c" stroke="#6f0f0f" stroke-width="2" />
      <path d="M37 18 L55 66" stroke="#ff8b79" stroke-opacity="0.32" stroke-width="4" stroke-linecap="round" />
    </g>
  `, SYMBOL_IDS.dynamite);
}

/**
 * Builds the cowboy boots art from the provided western reference.
 * @param {SymbolArtConfig} config
 * @returns {string}
 */
function createBootsSymbolArt(config) {
  return createInlineSymbolSvg(config, `
    <g transform="translate(2 0)">
      <path d="M18 13 C18 9 21 7 24 7 L35 7 C41 7 45 11 45 17 L45 41 C45 50 38 56 29 56 L21 56 C16 56 12 52 12 47 L12 18 C12 16 14 13 18 13 Z" fill="#93603b" stroke="#4c2c1b" stroke-width="2.2" />
      <path d="M49 11 C49 8 52 6 56 6 L68 6 C74 6 78 10 78 16 L78 45 C78 51 73 56 67 56 L56 56 C49 56 44 51 44 44 L44 16 C44 13 46 11 49 11 Z" fill="#93603b" stroke="#4c2c1b" stroke-width="2.2" />
      <path d="M14 49 C22 47 30 49 37 54 C42 58 44 61 49 61 L60 61 C63 61 65 63 64 66 C61 74 53 77 40 75 L20 73 C13 72 8 68 8 62 C8 57 10 52 14 49 Z" fill="#5c3925" stroke="#3f2417" stroke-width="2.2" />
      <path d="M40 54 C49 48 57 47 67 50 C74 52 79 56 85 57 C89 58 90 62 87 65 C81 70 70 72 55 71 C48 70 43 67 39 62 Z" fill="#8b5838" stroke="#4c2c1b" stroke-width="2.2" />
      <path d="M16 16 L39 16 L39 44 L16 44 Z" fill="#b67d53" opacity="0.14" />
      <path d="M48 14 L72 14 L72 44 L48 44 Z" fill="#b67d53" opacity="0.14" />
      <path d="M11 64 L24 64 L20 74 L7 74 Z" fill="#654130" stroke="#3f2417" stroke-width="2" />
      <path d="M10 62 L26 62" stroke="#c69a6b" stroke-width="1.6" stroke-linecap="round" opacity="0.45" />
      <path d="M19 19 C23 16 27 16 31 20" fill="none" stroke="#d9a06b" stroke-width="1.8" stroke-linecap="round" opacity="0.8" />
      <path d="M18 27 C22 24 26 24 30 28" fill="none" stroke="#d9a06b" stroke-width="1.8" stroke-linecap="round" opacity="0.75" />
      <path d="M52 17 C56 14 61 14 65 18" fill="none" stroke="#d9a06b" stroke-width="1.8" stroke-linecap="round" opacity="0.8" />
      <path d="M51 26 C56 23 61 23 66 27" fill="none" stroke="#d9a06b" stroke-width="1.8" stroke-linecap="round" opacity="0.75" />
      <path d="M48 53 C55 48 64 47 73 50" fill="none" stroke="#3f2417" stroke-width="2" stroke-linecap="round" opacity="0.68" />
      <path d="M47 58 C55 53 65 52 75 55" fill="none" stroke="#3f2417" stroke-width="2" stroke-linecap="round" opacity="0.68" />
    </g>
  `, "boots");
}

/** @type {Record<string, (config: SymbolArtConfig) => string>} */
const SYMBOL_ART_BUILDERS = {
  boots: createBootsSymbolArt,
  [SYMBOL_IDS.dynamite]: createDynamiteSymbolArt,
  [SYMBOL_IDS.wild]: createWildSymbolArt
};

/**
 * Builds the markup used inside a symbol art container.
 * @param {SymbolDefinition} symbol
 * @returns {{markup: string, mode: "svg" | "text"}}
 */
function createSymbolArtContent(symbol) {
  const builder = SYMBOL_ART_BUILDERS[symbol.id];

  if (!builder) {
    const artText = symbol.className === "symbol-letter" || symbol.className === "symbol-number" ? symbol.label : "";
    return {
      markup: escapeHtml(artText),
      mode: "text"
    };
  }

  try {
    return {
      markup: builder(SYMBOL_ART_CONFIG[symbol.id]),
      mode: "svg"
    };
  } catch (error) {
    console.warn(`Failed to build art for symbol "${symbol.id}".`, error);
    return {
      markup: escapeHtml(symbol.label),
      mode: "text"
    };
  }
}

/**
 * Resolves the visible badge text for sheriff symbol art.
 * @param {SymbolDefinition} symbol
 * @returns {string}
 */
function resolveBadgeArtText(symbol) {
  if (symbol.id !== BADGE_ART_CONFIG.symbolId) {
    return "";
  }

  if (typeof BADGE_ART_CONFIG.text === "string" && BADGE_ART_CONFIG.text.trim().length === 1) {
    return BADGE_ART_CONFIG.text.trim();
  }

  const fallbackText = typeof symbol.label === "string" ? symbol.label.trim().charAt(0).toUpperCase() : "";
  console.warn(`Invalid badge art text configured for symbol "${symbol.id}". Falling back to label initial.`);
  return fallbackText;
}

/**
 * Builds extra HTML attributes for a symbol art container.
 * @param {SymbolDefinition} symbol
 * @returns {Record<string, string>}
 */
function getSymbolArtAttributes(symbol) {
  const badgeText = resolveBadgeArtText(symbol);

  if (!badgeText) {
    return {};
  }

  return {
    [BADGE_ART_CONFIG.attributeName]: badgeText
  };
}

/**
 * Serializes HTML attributes for insertion into inline markup.
 * @param {Record<string, string>} attributes
 * @returns {string}
 */
function serializeHtmlAttributes(attributes) {
  return Object.entries(attributes)
    .filter(([, value]) => typeof value === "string" && value.length > 0)
    .map(([name, value]) => `${escapeHtml(name)}="${escapeHtml(value)}"`)
    .join(" ");
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
 * Reads a localStorage value for retention features.
 * @param {string} key
 * @returns {{available: boolean, value: string | null}}
 */
function readStorageValue(key) {
  try {
    return {
      available: true,
      value: window.localStorage.getItem(key)
    };
  } catch (_error) {
    return {
      available: false,
      value: null
    };
  }
}

/**
 * Writes a localStorage value for retention features.
 * @param {string} key
 * @param {string} value
 * @returns {boolean}
 */
function writeStorageValue(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (_error) {
    return false;
  }
}

/**
 * Formats the current local date into a storage-safe YYYY-MM-DD key.
 * @param {Date} date
 * @returns {string}
 */
function createDateKey(date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Checks whether a stored date key matches the supported format.
 * @param {string | null} value
 * @returns {boolean}
 */
function isValidDateKey(value) {
  return typeof value === "string" && DATE_KEY_PATTERN.test(value);
}

/**
 * Determines whether the player should receive today's daily reward.
 * @param {string | null} lastLoginDateKey
 * @param {string} todayDateKey
 * @returns {boolean}
 */
function shouldGrantDailyReward(lastLoginDateKey, todayDateKey) {
  if (!isValidDateKey(todayDateKey)) {
    return false;
  }

  return lastLoginDateKey !== todayDateKey;
}

/**
 * Resolves the configured daily login reward if the player is eligible.
 * @param {string | null} lastLoginDateKey
 * @param {string} todayDateKey
 * @returns {{reward: RewardGrant, lastLoginDateKey: string} | null}
 */
function resolveDailyLoginReward(lastLoginDateKey, todayDateKey) {
  if (!shouldGrantDailyReward(lastLoginDateKey, todayDateKey)) {
    return null;
  }

  return {
    reward: { ...RETENTION_CONFIG.dailyLoginReward },
    lastLoginDateKey: todayDateKey
  };
}

/**
 * Applies a balance or free-spin reward to the provided slot state.
 * @param {Pick<SlotState, "balance" | "freeSpins">} slotState
 * @param {RewardGrant} reward
 * @returns {boolean}
 */
function applyRewardToState(slotState, reward) {
  if (!reward || !Number.isFinite(reward.amount) || reward.amount <= 0) {
    return false;
  }

  if (reward.type === "balance") {
    slotState.balance += reward.amount;
    return true;
  }

  if (reward.type === "free-spins") {
    slotState.freeSpins += reward.amount;
    return true;
  }

  return false;
}

/**
 * Reverts a reward from the provided slot state when persistence fails.
 * @param {Pick<SlotState, "balance" | "freeSpins">} slotState
 * @param {RewardGrant} reward
 */
function revertRewardFromState(slotState, reward) {
  if (reward.type === "balance") {
    slotState.balance -= reward.amount;
    return;
  }

  if (reward.type === "free-spins") {
    slotState.freeSpins -= reward.amount;
  }
}

/**
 * Creates view-model content for inline reward feedback.
 * @param {RewardGrant} reward
 * @returns {{label: string, amountText: string, description: string, variant: "balance" | "free-spins"}}
 */
function createRewardFeedbackContent(reward) {
  const sourceConfig = RETENTION_CONFIG.feedbackMessages.sources[reward.source];
  const label = sourceConfig ? sourceConfig.label : RETENTION_CONFIG.feedbackMessages.defaultLabel;
  const description = sourceConfig && sourceConfig.descriptions[reward.type]
    ? sourceConfig.descriptions[reward.type]
    : RETENTION_CONFIG.feedbackMessages.defaultDescription;
  const amountSuffix = reward.type === "balance" ? "balance" : "free spins";

  return {
    label,
    amountText: `+${reward.amount} ${amountSuffix}`,
    description,
    variant: reward.type
  };
}

/**
 * Hides the inline reward feedback banner.
 */
function hideRewardFeedback() {
  const feedback = document.getElementById("rewardFeedback");

  window.clearTimeout(rewardFeedbackTimeout);
  if (!feedback) {
    return;
  }

  feedback.classList.remove("show", "balance", "free-spins");
  feedback.hidden = true;
  feedback.setAttribute("aria-hidden", "true");
}

/**
 * Shows non-intrusive inline feedback for balance or free-spin rewards.
 * @param {RewardGrant} reward
 */
function showRewardFeedback(reward) {
  const feedback = document.getElementById("rewardFeedback");
  const feedbackLabel = document.getElementById("rewardFeedbackLabel");
  const feedbackAmount = document.getElementById("rewardFeedbackAmount");
  const feedbackText = document.getElementById("rewardFeedbackText");

  if (!feedback || !feedbackLabel || !feedbackAmount || !feedbackText) {
    return;
  }

  const content = createRewardFeedbackContent(reward);

  window.clearTimeout(rewardFeedbackTimeout);
  feedbackLabel.textContent = content.label;
  feedbackAmount.textContent = content.amountText;
  feedbackText.textContent = content.description;
  feedback.classList.remove("show", "balance", "free-spins");
  feedback.classList.add(content.variant);
  feedback.hidden = false;
  feedback.setAttribute("aria-hidden", "false");

  window.requestAnimationFrame(() => {
    feedback.classList.add("show");
  });

  rewardFeedbackTimeout = window.setTimeout(hideRewardFeedback, RETENTION_CONFIG.feedbackDurationMs);
}

/**
 * Shows inline feedback for newly awarded free spins.
 * @param {number} amount
 * @param {"daily-login" | "spin-award" | "bonus-round"} source
 */
function showFreeSpinRewardFeedback(amount, source) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return;
  }

  showRewardFeedback({
    type: "free-spins",
    amount,
    source
  });
}

/**
 * Grants the configured daily login reward if the saved day differs from today.
 * @param {Date} [currentDate]
 * @returns {RewardGrant | null}
 */
function grantDailyLoginReward(currentDate = new Date()) {
  const storageState = readStorageValue(STORAGE_KEYS.lastLoginDate);
  const todayDateKey = createDateKey(currentDate);

  if (!storageState.available) {
    return null;
  }

  const lastLoginDateKey = isValidDateKey(storageState.value) ? storageState.value : null;
  const rewardResolution = resolveDailyLoginReward(lastLoginDateKey, todayDateKey);

  if (!rewardResolution || !applyRewardToState(state, rewardResolution.reward)) {
    return null;
  }

  if (!writeStorageValue(STORAGE_KEYS.lastLoginDate, rewardResolution.lastLoginDateKey)) {
    revertRewardFromState(state, rewardResolution.reward);
    return null;
  }

  return rewardResolution.reward;
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
 * Builds the exact contiguous reel positions counted for a payline match.
 * @param {number[]} paylineRows
 * @param {number} matchLength
 * @returns {{reel: number, row: number}[]}
 */
function createMatchedPositions(paylineRows, matchLength) {
  if (!Array.isArray(paylineRows) || !Number.isInteger(matchLength) || matchLength < 1) {
    return [];
  }

  return paylineRows.slice(0, matchLength).map((row, reel) => ({ reel, row }));
}

/**
 * Checks whether a grid coordinate can map to a rendered slot cell.
 * @param {{reel?: number, row?: number} | null | undefined} position
 * @returns {boolean}
 */
function isValidWinPosition(position) {
  return Boolean(
    position
    && Number.isInteger(position.reel)
    && Number.isInteger(position.row)
    && position.reel >= 0
    && position.reel < GAME_LIMITS.reelCount
    && position.row >= 0
    && position.row < GAME_LIMITS.rowCount
  );
}

/**
 * Checks whether payline positions exactly cover reels 0 through matchLength - 1.
 * @param {{reel?: number, row?: number}[]} positions
 * @param {number} matchLength
 * @returns {boolean}
 */
function hasContiguousMatchedPositions(positions, matchLength) {
  if (!Array.isArray(positions) || !Number.isInteger(matchLength) || positions.length !== matchLength) {
    return false;
  }

  const seenKeys = new Set();
  return positions.every((position, index) => {
    if (!isValidWinPosition(position) || position.reel !== index) {
      return false;
    }

    const key = `${position.reel}:${position.row}`;
    if (seenKeys.has(key)) {
      return false;
    }

    seenKeys.add(key);
    return true;
  });
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
 * Clamps a probability into the supported 0-1 range.
 * @param {number} value
 * @returns {number}
 */
function clampProbability(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

/**
 * Finds a configured payline by name.
 * @param {string} lineName
 * @returns {{name: string, rows: number[]} | null}
 */
function getPaylineByName(lineName) {
  return PAYLINES.find((payline) => payline.name === lineName) || null;
}

/**
 * Checks whether a near-miss pattern can map to the current reel layout.
 * @param {NearMissPattern} pattern
 * @returns {boolean}
 */
function isValidNearMissPattern(pattern) {
  const payline = pattern && getPaylineByName(pattern.lineName);
  return Boolean(
    payline
    && typeof pattern.id === "string"
    && pattern.id.length > 0
    && Number.isInteger(pattern.matchCount)
    && pattern.matchCount >= 1
    && pattern.matchCount < GAME_LIMITS.reelCount
    && Number.isInteger(pattern.missReel)
    && pattern.missReel >= pattern.matchCount
    && pattern.missReel < GAME_LIMITS.reelCount
    && Array.isArray(pattern.eligibleSymbolIds)
    && pattern.eligibleSymbolIds.some((symbolId) => SYMBOL_MAP[symbolId] && !NEAR_MISS_SPECIAL_SYMBOL_IDS.includes(symbolId))
  );
}

/**
 * Returns a defensive near-miss timing config.
 * @param {Partial<NearMissTimingConfig>} timing
 * @returns {NearMissTimingConfig}
 */
function validateNearMissTiming(timing = {}) {
  const frameValues = Array.isArray(timing.frames)
    ? timing.frames.filter((frameName) => NEAR_MISS_FRAME_NAMES.includes(frameName))
    : DEFAULT_NEAR_MISS_TIMING.frames;

  return {
    teaseHoldMs: Number.isFinite(timing.teaseHoldMs) && timing.teaseHoldMs >= 0
      ? timing.teaseHoldMs
      : DEFAULT_NEAR_MISS_TIMING.teaseHoldMs,
    slideMs: Number.isFinite(timing.slideMs) && timing.slideMs >= 0
      ? timing.slideMs
      : DEFAULT_NEAR_MISS_TIMING.slideMs,
    slideDistanceRows: Number.isFinite(timing.slideDistanceRows) && timing.slideDistanceRows > 0
      ? timing.slideDistanceRows
      : DEFAULT_NEAR_MISS_TIMING.slideDistanceRows,
    frames: frameValues.length > 0 ? frameValues : DEFAULT_NEAR_MISS_TIMING.frames
  };
}

/**
 * Validates and normalizes the near-miss configuration.
 * @param {Partial<NearMissConfig>} config
 * @returns {NearMissConfig}
 */
function validateNearMissConfig(config = NEAR_MISS_CONFIG) {
  const source = config && typeof config === "object" ? config : {};
  const sourcePatterns = Array.isArray(source.patterns) ? source.patterns : [];
  const patterns = sourcePatterns
    .filter(isValidNearMissPattern)
    .map((pattern) => ({
      id: pattern.id,
      lineName: pattern.lineName,
      matchCount: pattern.matchCount,
      missReel: pattern.missReel,
      eligibleSymbolIds: pattern.eligibleSymbolIds.filter((symbolId) => SYMBOL_MAP[symbolId] && !NEAR_MISS_SPECIAL_SYMBOL_IDS.includes(symbolId))
    }));

  return {
    enabled: source.enabled === true,
    probability: clampProbability(source.probability),
    paidSpinsOnly: source.paidSpinsOnly !== false,
    disableDuringFastPlay: source.disableDuringFastPlay !== false,
    timing: validateNearMissTiming(source.timing),
    patterns
  };
}

/**
 * Checks whether the spin result can show a near-miss tease.
 * @param {{result?: WinResult, usedFreeSpin?: boolean, fastPlayEnabled?: boolean, jackpotTier?: string | null}} spinContext
 * @param {Partial<NearMissConfig>} config
 * @returns {boolean}
 */
function isNearMissEligible(spinContext, config = NEAR_MISS_CONFIG) {
  const safeConfig = validateNearMissConfig(config);
  const result = spinContext && spinContext.result;

  if (!safeConfig.enabled || safeConfig.probability <= 0 || safeConfig.patterns.length === 0 || !result) {
    return false;
  }

  if (safeConfig.paidSpinsOnly && spinContext.usedFreeSpin) {
    return false;
  }

  if (safeConfig.disableDuringFastPlay && spinContext.fastPlayEnabled) {
    return false;
  }

  return result.totalWin === 0
    && result.freeSpinsAwarded === 0
    && !result.bonusTriggered
    && !spinContext.jackpotTier;
}

/**
 * Returns the symbol that can form a two-reel near miss, if one exists.
 * @param {string[]} matchSymbols
 * @param {string[]} eligibleSymbolIds
 * @returns {string | null}
 */
function getNearMissMatchSymbol(matchSymbols, eligibleSymbolIds) {
  const [targetSymbolId] = matchSymbols;

  if (!targetSymbolId || NEAR_MISS_SPECIAL_SYMBOL_IDS.includes(targetSymbolId) || !eligibleSymbolIds.includes(targetSymbolId)) {
    return null;
  }

  return matchSymbols.every((symbolId) => symbolId === targetSymbolId) ? targetSymbolId : null;
}

/**
 * Builds a near-miss plan for a specific pattern if the final board already supports it.
 * @param {string[][]} board
 * @param {NearMissPattern} pattern
 * @param {NearMissTimingConfig} timing
 * @returns {NearMissPlan | null}
 */
function createNearMissPlanForPattern(board, pattern, timing) {
  const payline = getPaylineByName(pattern.lineName);

  if (!payline || !board || !board[0]) {
    return null;
  }

  const lineSymbols = payline.rows.map((row, reel) => board[row] && board[row][reel]);
  const symbolId = getNearMissMatchSymbol(lineSymbols.slice(0, pattern.matchCount), pattern.eligibleSymbolIds);
  const row = payline.rows[pattern.missReel];
  const actualSymbolId = lineSymbols[pattern.missReel];

  if (!symbolId || !actualSymbolId || actualSymbolId === symbolId || NEAR_MISS_SPECIAL_SYMBOL_IDS.includes(actualSymbolId)) {
    return null;
  }

  return {
    patternId: pattern.id,
    lineName: pattern.lineName,
    reel: pattern.missReel,
    row,
    symbolId,
    actualSymbolId,
    timing
  };
}

/**
 * Selects a near-miss plan without changing the final board or win result.
 * @param {string[][]} board
 * @param {WinResult} result
 * @param {{usedFreeSpin?: boolean, fastPlayEnabled?: boolean, jackpotTier?: string | null}} spinContext
 * @param {Partial<NearMissConfig>} config
 * @param {() => number} randomFn
 * @returns {NearMissPlan | null}
 */
function selectNearMissPlan(board, result, spinContext = {}, config = NEAR_MISS_CONFIG, randomFn = Math.random) {
  const safeConfig = validateNearMissConfig(config);
  const context = { ...spinContext, result };

  if (!isNearMissEligible(context, safeConfig)) {
    return null;
  }

  const roll = typeof randomFn === "function" ? clampProbability(randomFn()) : 1;
  if (roll >= safeConfig.probability) {
    return null;
  }

  const candidates = safeConfig.patterns
    .map((pattern) => createNearMissPlanForPattern(board, pattern, safeConfig.timing))
    .filter(Boolean);

  if (candidates.length === 0) {
    return null;
  }

  const candidateRoll = typeof randomFn === "function" ? clampProbability(randomFn()) : 0;
  return candidates[Math.min(candidates.length - 1, Math.floor(candidateRoll * candidates.length))];
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
    const matchedPositions = createMatchedPositions(payline.rows, match.count);
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
      matchLength: match.count,
      matchedPositions,
      baseWin,
      payout,
      multiplier
    });
    totalWin += payout;
    appliedMultiplier = Math.max(appliedMultiplier, multiplier);

    for (const position of matchedPositions) {
      winningCellKeys.add(`${position.reel}:${position.row}`);
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
  const symbol = getSymbolDefinition(symbolId);
  const cell = document.createElement("div");
  const multiplierBadge = feature && feature.multiplier > 1 ? `<span class="multiplier-badge">x${feature.multiplier}</span>` : "";
  const art = createSymbolArtContent(symbol);
  const artAttributes = serializeHtmlAttributes(getSymbolArtAttributes(symbol));
  const artAttributeMarkup = artAttributes ? ` ${artAttributes}` : "";

  cell.className = `symbol-cell ${symbol.className}`;
  cell.dataset.reel = String(reel);
  cell.dataset.row = String(row);
  cell.dataset.symbol = symbol.id;
  cell.innerHTML = `
    ${multiplierBadge}
    <div class="symbol-stack">
      <span class="symbol-art" data-art-mode="${art.mode}" aria-hidden="true"${artAttributeMarkup}>${art.markup}</span>
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
 * Removes any transient near-miss classes from reel DOM.
 * @param {Element[] | NodeListOf<Element>} [reels]
 */
function clearNearMissVisuals(reels = document.querySelectorAll(".reel")) {
  reels.forEach((reelElement) => {
    reelElement.classList.remove("near-miss-reel", "near-miss-finished");
    reelElement.querySelectorAll(".symbol-cell").forEach((cell) => {
      cell.classList.remove("near-miss-tease", "near-miss-slide", "near-miss-settle");
      cell.removeAttribute("data-near-miss");
      cell.removeAttribute("style");
    });
  });
}

/**
 * Renders one reel in its final settled state.
 * @param {Element} reelElement
 * @param {number} reelIndex
 * @param {string[][]} board
 * @param {(BoardCellFeature | null)[][]} boardFeatures
 */
function renderSettledReel(reelElement, reelIndex, board, boardFeatures) {
  if (!reelElement || !board || !board[0]) {
    return;
  }

  reelElement.classList.remove("spinning");
  reelElement.innerHTML = "";

  for (let row = 0; row < GAME_LIMITS.rowCount; row += 1) {
    reelElement.appendChild(createSymbolCell(board[row][reelIndex], reelIndex, row, getCellFeature(boardFeatures, row, reelIndex)));
  }
}

/**
 * Checks whether a near-miss visual frame is enabled for the current plan.
 * @param {NearMissPlan} plan
 * @param {"tease" | "slide" | "settle"} frameName
 * @returns {boolean}
 */
function shouldShowNearMissFrame(plan, frameName) {
  return Boolean(plan && plan.timing.frames.includes(frameName));
}

/**
 * Adds CSS timing values to the teased symbol cell.
 * @param {Element} cell
 * @param {NearMissTimingConfig} timing
 */
function applyNearMissCellTiming(cell, timing) {
  cell.style.setProperty("--near-miss-slide-distance", `calc(${timing.slideDistanceRows} * (var(--cell-size) + var(--reel-gap)))`);
  cell.style.setProperty("--near-miss-slide-ms", `${timing.slideMs}ms`);
}

/**
 * Renders the near-miss reel as if the missing payline symbol had stopped in view.
 * @param {Element} reelElement
 * @param {number} reelIndex
 * @param {string[][]} board
 * @param {(BoardCellFeature | null)[][]} boardFeatures
 * @param {NearMissPlan} plan
 */
function renderNearMissTeaseReel(reelElement, reelIndex, board, boardFeatures, plan) {
  if (!reelElement || !plan || reelIndex !== plan.reel) {
    return;
  }

  reelElement.classList.remove("spinning");
  reelElement.classList.add("near-miss-reel");
  reelElement.innerHTML = "";

  for (let row = 0; row < GAME_LIMITS.rowCount; row += 1) {
    const symbolId = row === plan.row ? plan.symbolId : board[row][reelIndex];
    const cell = createSymbolCell(symbolId, reelIndex, row, getCellFeature(boardFeatures, row, reelIndex));

    if (row === plan.row && shouldShowNearMissFrame(plan, "tease")) {
      cell.classList.add("near-miss-tease");
      cell.dataset.nearMiss = "tease";
      applyNearMissCellTiming(cell, plan.timing);
    }

    reelElement.appendChild(cell);
  }
}

/**
 * Starts the slide-away portion of a near-miss tease.
 * @param {Element} reelElement
 * @param {NearMissPlan} plan
 */
function applyNearMissSlideFrame(reelElement, plan) {
  if (!reelElement || !shouldShowNearMissFrame(plan, "slide")) {
    return;
  }

  const teasedCell = reelElement.querySelector(`[data-reel="${plan.reel}"][data-row="${plan.row}"]`);
  if (teasedCell) {
    teasedCell.classList.add("near-miss-slide");
    teasedCell.dataset.nearMiss = "slide";
  }
}

/**
 * Renders the final missed symbol after the near-miss slide finishes.
 * @param {Element} reelElement
 * @param {number} reelIndex
 * @param {string[][]} board
 * @param {(BoardCellFeature | null)[][]} boardFeatures
 * @param {NearMissPlan} plan
 */
function renderNearMissFinalReel(reelElement, reelIndex, board, boardFeatures, plan) {
  renderSettledReel(reelElement, reelIndex, board, boardFeatures);

  if (!reelElement || !plan || !shouldShowNearMissFrame(plan, "settle")) {
    return;
  }

  reelElement.classList.add("near-miss-reel", "near-miss-finished");
  const missedCell = reelElement.querySelector(`[data-reel="${plan.reel}"][data-row="${plan.row}"]`);
  if (missedCell) {
    missedCell.classList.add("near-miss-settle");
    missedCell.dataset.nearMiss = "settle";
  }
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
  document.querySelectorAll(`.${PAYLINE_RENDER_CONFIG.segmentClass}`).forEach((line) => line.remove());
}

/**
 * Filters a mixed position list down to valid slot coordinates.
 * @param {unknown} positions
 * @returns {{reel: number, row: number}[]}
 */
function getRenderableWinPositions(positions) {
  if (!Array.isArray(positions)) {
    return [];
  }

  return positions.filter(isValidWinPosition);
}

/**
 * Returns the exact matched payline positions if the win data is internally consistent.
 * @param {Partial<LineWin>} lineWin
 * @returns {{lineName: string, matchLength: number, matchedPositions: {reel: number, row: number}[]} | null}
 */
function getRenderableLineWin(lineWin) {
  if (!lineWin || typeof lineWin.lineName !== "string") {
    return null;
  }

  const matchLength = Number.isInteger(lineWin.matchLength) ? lineWin.matchLength : lineWin.count;
  const matchedPositions = Array.isArray(lineWin.matchedPositions) ? lineWin.matchedPositions : [];

  if (!hasContiguousMatchedPositions(matchedPositions, matchLength)) {
    return null;
  }

  return {
    lineName: lineWin.lineName,
    matchLength,
    matchedPositions
  };
}

/**
 * Gets a rendered cell element for a validated slot coordinate.
 * @param {{reel: number, row: number}} position
 * @returns {Element | null}
 */
function getRenderedCell(position) {
  if (!isValidWinPosition(position)) {
    return null;
  }

  return document.querySelector(`[data-reel="${position.reel}"][data-row="${position.row}"]`);
}

/**
 * Calculates a cell center relative to its payline container.
 * @param {Element} cell
 * @param {DOMRect} containerRect
 * @returns {{x: number, y: number}}
 */
function getCellCenter(cell, containerRect) {
  const cellRect = cell.getBoundingClientRect();

  return {
    x: cellRect.left - containerRect.left + cellRect.width / 2,
    y: cellRect.top - containerRect.top + cellRect.height / 2
  };
}

/**
 * Builds one overlay segment between two adjacent matched payline cells.
 * @param {Element} container
 * @param {{lineName: string, matchLength: number}} lineWin
 * @param {{reel: number, row: number}} fromPosition
 * @param {{reel: number, row: number}} toPosition
 * @param {number} segmentIndex
 * @returns {HTMLDivElement | null}
 */
function createPaylineSegment(container, lineWin, fromPosition, toPosition, segmentIndex) {
  const fromCell = getRenderedCell(fromPosition);
  const toCell = getRenderedCell(toPosition);

  if (!container || !fromCell || !toCell) {
    return null;
  }

  const containerRect = container.getBoundingClientRect();
  const start = getCellCenter(fromCell, containerRect);
  const end = getCellCenter(toCell, containerRect);
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const segment = document.createElement("div");

  segment.className = `${PAYLINE_RENDER_CONFIG.segmentClass} ${PAYLINE_RENDER_CONFIG.activeSegmentClass}`;
  segment.dataset.lineName = lineWin.lineName;
  segment.dataset.matchLength = String(lineWin.matchLength);
  segment.dataset.segmentIndex = String(segmentIndex);
  segment.dataset.startReel = String(fromPosition.reel);
  segment.dataset.endReel = String(toPosition.reel);
  segment.style.left = `${start.x}px`;
  segment.style.top = `${start.y}px`;
  segment.style.width = `${Math.hypot(deltaX, deltaY)}px`;
  segment.style.transform = `rotate(${Math.atan2(deltaY, deltaX)}rad)`;

  return segment;
}

/**
 * Draws payline overlay segments from exact matched positions only.
 * @param {Partial<LineWin>[]} lineWins
 */
function renderPaylineSegments(lineWins) {
  const container = document.getElementById(PAYLINE_RENDER_CONFIG.reelWindowId);

  if (!container || !Array.isArray(lineWins)) {
    return;
  }

  for (const lineWin of lineWins) {
    const renderableLineWin = getRenderableLineWin(lineWin);

    if (!renderableLineWin) {
      continue;
    }

    for (let index = 1; index < renderableLineWin.matchedPositions.length; index += 1) {
      const segment = createPaylineSegment(
        container,
        renderableLineWin,
        renderableLineWin.matchedPositions[index - 1],
        renderableLineWin.matchedPositions[index],
        index - 1
      );

      if (segment) {
        container.appendChild(segment);
      }
    }
  }
}

/**
 * Highlights winning symbols and exact payline segments.
 * @param {Partial<WinResult> | null | undefined} result
 */
function highlightWins(result) {
  if (!result || typeof result !== "object") {
    return;
  }

  for (const cell of getRenderableWinPositions(result.winningCells)) {
    const element = getRenderedCell(cell);
    if (element) {
      element.classList.add("win");
    }
  }

  renderPaylineSegments(Array.isArray(result.lineWins) ? result.lineWins : []);
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

  if (bonusState.freeSpinsAwarded > 0) {
    showFreeSpinRewardFeedback(bonusState.freeSpinsAwarded, "bonus-round");
  }
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
 * @param {{jackpotTier?: "mini" | "major" | "grand" | null}} [options]
 */
function settleSpin(board, boardFeatures, usedFreeSpin, options = {}) {
  const result = evaluateBoard(board, state.bet, { boardFeatures, isFreeSpinRound: usedFreeSpin });
  let jackpotTier = null;
  let jackpotAmount = 0;
  const hasResolvedJackpot = Object.prototype.hasOwnProperty.call(options, "jackpotTier");

  state.balance += result.totalWin;
  state.freeSpins += result.freeSpinsAwarded;
  state.isSpinning = false;
  activeSpin = null;

  highlightWins(result);

  if (!usedFreeSpin) {
    jackpotTier = hasResolvedJackpot ? options.jackpotTier : determineJackpotTier(board) || rollRandomJackpotTier();
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

  if (result.freeSpinsAwarded > 0) {
    showFreeSpinRewardFeedback(result.freeSpinsAwarded, "spin-award");
  }

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

  const spinToFinish = activeSpin;

  spinToFinish.intervals.forEach((intervalId) => window.clearInterval(intervalId));
  spinToFinish.timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
  clearNearMissVisuals(spinToFinish.reels);

  spinToFinish.reels.forEach((reelElement, reelIndex) => {
    renderSettledReel(reelElement, reelIndex, spinToFinish.nextBoard, spinToFinish.nextBoardFeatures);
  });

  state.board = spinToFinish.nextBoard;
  state.boardFeatures = spinToFinish.nextBoardFeatures;
  settleSpin(spinToFinish.nextBoard, spinToFinish.nextBoardFeatures, spinToFinish.usedFreeSpin, {
    jackpotTier: spinToFinish.jackpotTier
  });
}

/**
 * Completes the spin after the last reel has reached its final visual state.
 * @param {number} reelIndex
 * @param {Element[]} reels
 * @param {string[][]} nextBoard
 * @param {(BoardCellFeature | null)[][]} nextBoardFeatures
 * @param {boolean} usedFreeSpin
 */
function completeSpinAfterReelStop(reelIndex, reels, nextBoard, nextBoardFeatures, usedFreeSpin) {
  if (reelIndex !== reels.length - 1) {
    return;
  }

  const spinToSettle = activeSpin;
  state.board = nextBoard;
  state.boardFeatures = nextBoardFeatures;
  settleSpin(nextBoard, nextBoardFeatures, usedFreeSpin, {
    jackpotTier: spinToSettle ? spinToSettle.jackpotTier : null
  });
}

/**
 * Confirms that a delayed reel action still belongs to the active spin.
 * @param {string[][]} nextBoard
 * @returns {boolean}
 */
function isCurrentSpinBoard(nextBoard) {
  return Boolean(activeSpin && activeSpin.nextBoard === nextBoard);
}

/**
 * Plays the near-miss choreography for a single reel before rendering the final miss.
 * @param {Element} reelElement
 * @param {number} reelIndex
 * @param {Element[]} reels
 * @param {string[][]} nextBoard
 * @param {(BoardCellFeature | null)[][]} nextBoardFeatures
 * @param {boolean} usedFreeSpin
 * @param {NearMissPlan} nearMissPlan
 */
function stopReelWithNearMiss(reelElement, reelIndex, reels, nextBoard, nextBoardFeatures, usedFreeSpin, nearMissPlan) {
  renderNearMissTeaseReel(reelElement, reelIndex, nextBoard, nextBoardFeatures, nearMissPlan);

  const slideTimeoutId = window.setTimeout(() => {
    if (!isCurrentSpinBoard(nextBoard)) {
      return;
    }

    applyNearMissSlideFrame(reelElement, nearMissPlan);

    const settleTimeoutId = window.setTimeout(() => {
      if (!isCurrentSpinBoard(nextBoard)) {
        return;
      }

      renderNearMissFinalReel(reelElement, reelIndex, nextBoard, nextBoardFeatures, nearMissPlan);
      playSound("reelStop");
      completeSpinAfterReelStop(reelIndex, reels, nextBoard, nextBoardFeatures, usedFreeSpin);
    }, nearMissPlan.timing.slideMs);

    if (activeSpin) {
      activeSpin.timeouts.push(settleTimeoutId);
    }
  }, nearMissPlan.timing.teaseHoldMs);

  if (activeSpin) {
    activeSpin.timeouts.push(slideTimeoutId);
  }
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
  clearNearMissVisuals();
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
  const nextResult = evaluateBoard(nextBoard, state.bet, { boardFeatures: nextBoardFeatures, isFreeSpinRound: usedFreeSpin });
  const jackpotTier = usedFreeSpin ? null : determineJackpotTier(nextBoard) || rollRandomJackpotTier();
  const nearMissPlan = selectNearMissPlan(nextBoard, nextResult, {
    usedFreeSpin,
    fastPlayEnabled: state.fastPlayEnabled,
    jackpotTier
  });
  const reels = Array.from(document.querySelectorAll(".reel"));
  const intervals = [];
  const timeouts = [];

  activeSpin = {
    usedFreeSpin,
    nextBoard,
    nextBoardFeatures,
    jackpotTier,
    nearMissPlan,
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
    let stopDelay = 650 + reelIndex * 260;

    if (nearMissPlan && reelIndex > nearMissPlan.reel) {
      stopDelay += nearMissPlan.timing.teaseHoldMs + nearMissPlan.timing.slideMs;
    }

    const timeoutId = window.setTimeout(() => {
      if (!activeSpin || activeSpin.nextBoard !== nextBoard) {
        return;
      }

      window.clearInterval(interval);

      if (activeSpin.nearMissPlan && activeSpin.nearMissPlan.reel === reelIndex) {
        stopReelWithNearMiss(reelElement, reelIndex, reels, nextBoard, nextBoardFeatures, usedFreeSpin, activeSpin.nearMissPlan);
        return;
      }

      renderSettledReel(reelElement, reelIndex, nextBoard, nextBoardFeatures);
      playSound("reelStop");
      completeSpinAfterReelStop(reelIndex, reels, nextBoard, nextBoardFeatures, usedFreeSpin);
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
 * Normalizes an event target to an element that can be selector-matched.
 * @param {EventTarget | null} target
 * @returns {Element | null}
 */
function getShortcutTargetElement(target) {
  if (!target || typeof target !== "object") {
    return null;
  }

  if (typeof target.closest === "function") {
    return target;
  }

  if (target.parentElement && typeof target.parentElement.closest === "function") {
    return target.parentElement;
  }

  return null;
}

/**
 * Checks whether a keyboard shortcut originated inside editable content.
 * @param {Element} element
 * @param {KeyboardShortcutConfig} config
 * @returns {boolean}
 */
function isEditableShortcutTarget(element, config = KEYBOARD_CONFIG) {
  const editableElement = element.closest(config.editableShortcutSelector);

  if (!editableElement) {
    return false;
  }

  if (typeof editableElement.getAttribute !== "function") {
    return true;
  }

  return editableElement.getAttribute("contenteditable") !== "false";
}

/**
 * Checks whether a keyboard shortcut should yield to focused interactive UI.
 * @param {EventTarget | null} target
 * @param {KeyboardShortcutConfig} config
 * @returns {boolean}
 */
function isKeyboardShortcutBlockedTarget(target, config = KEYBOARD_CONFIG) {
  const element = getShortcutTargetElement(target);

  if (!element) {
    return false;
  }

  return isEditableShortcutTarget(element, config) || Boolean(element.closest(config.blockedShortcutSelector));
}

/**
 * Checks whether an event is a configured spin shortcut key.
 * @param {{key: string}} event
 * @param {KeyboardShortcutConfig} config
 * @returns {boolean}
 */
function isSpinShortcutEvent(event, config = KEYBOARD_CONFIG) {
  return config.spinKeys.includes(event.key);
}

/**
 * Checks whether the spin shortcut can run without interfering with page input.
 * @param {{key: string, repeat: boolean, target: EventTarget | null}} event
 * @param {KeyboardShortcutConfig} config
 * @returns {boolean}
 */
function shouldHandleSpinShortcut(event, config = KEYBOARD_CONFIG) {
  return isSpinShortcutEvent(event, config)
    && !event.repeat
    && !isKeyboardShortcutBlockedTarget(event.target, config);
}

/**
 * Uses the spin button as the single activation path for pointer and keyboard spins.
 * @param {KeyboardShortcutConfig} config
 * @returns {boolean}
 */
function triggerSpinButtonClick(config = KEYBOARD_CONFIG) {
  try {
    const spinButton = document.getElementById(config.spinButtonId);

    if (!spinButton || spinButton.disabled || typeof spinButton.click !== "function") {
      return false;
    }

    spinButton.click();
    return true;
  } catch (error) {
    console.warn("Keyboard spin activation failed.", error);
    return false;
  }
}

/**
 * Handles global keyboard shortcuts without replacing native control behavior.
 * @param {KeyboardEvent} event
 */
function handleDocumentKeydown(event) {
  if (event.key === KEYBOARD_CONFIG.closeSettingsKey) {
    setSettingsOpen(false);
    return;
  }

  if (isSpinShortcutEvent(event)) {
    if (shouldHandleSpinShortcut(event) && triggerSpinButtonClick() && typeof event.preventDefault === "function") {
      event.preventDefault();
    }
    return;
  }

  if (event.repeat || event.key.toLowerCase() !== KEYBOARD_CONFIG.bigWinKey) {
    return;
  }

  triggerBigWinFeedback(state.bet * 20);
}

/**
 * Adds keyboard shortcuts and returns the matching cleanup function.
 * @param {Document} eventTarget
 * @returns {() => void}
 */
function wireKeyboardShortcuts(eventTarget = document) {
  eventTarget.addEventListener("keydown", handleDocumentKeydown);

  return () => {
    eventTarget.removeEventListener("keydown", handleDocumentKeydown);
  };
}

/**
 * Removes active keyboard shortcuts when the document is unloaded.
 */
function cleanupKeyboardShortcuts() {
  if (!keyboardShortcutCleanup) {
    return;
  }

  keyboardShortcutCleanup();
  keyboardShortcutCleanup = null;
}

/**
 * Mounts the global keyboard shortcuts once the UI is ready.
 */
function mountKeyboardShortcuts() {
  cleanupKeyboardShortcuts();
  keyboardShortcutCleanup = wireKeyboardShortcuts();

  if (!pagehideCleanupRegistered) {
    window.addEventListener("pagehide", cleanupKeyboardShortcuts);
    pagehideCleanupRegistered = true;
  }
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
    const dailyReward = grantDailyLoginReward();
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
    mountKeyboardShortcuts();

    if (dailyReward) {
      showRewardFeedback(dailyReward);
    }
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
    KEYBOARD_CONFIG,
    RETENTION_CONFIG,
    STORAGE_KEYS,
    MULTIPLIER_CONFIG,
    NEAR_MISS_CONFIG,
    BADGE_ART_CONFIG,
    PAYLINES,
    PAYLINE_RENDER_CONFIG,
    SYMBOL_ART_CONFIG,
    SYMBOLS,
    applyRewardToState,
    clampBet,
    countSymbol,
    createDateKey,
    createBoardFeatureGrid,
    createBonusPrizes,
    createBootsSymbolArt,
    createEmptyFeatureGrid,
    createMatchedPositions,
    createNearMissPlanForPattern,
    createRewardFeedbackContent,
    createDynamiteSymbolArt,
    createInlineSymbolSvg,
    createSymbolArtContent,
    createWildSymbolArt,
    determineJackpotTier,
    escapeHtml,
    evaluateBoard,
    getSymbolDefinition,
    getSymbolArtAttributes,
    getFreeSpinAward,
    getLeftToRightMatch,
    getLineMultiplier,
    hasContiguousMatchedPositions,
    isNearMissEligible,
    isKeyboardShortcutBlockedTarget,
    isSpinShortcutEvent,
    isValidWinPosition,
    isWildHorizontalLine,
    resolveDailyLoginReward,
    resolveBadgeArtText,
    serializeHtmlAttributes,
    selectNearMissPlan,
    shouldHandleSpinShortcut,
    shouldGrantDailyReward,
    validateNearMissConfig
  };
}
