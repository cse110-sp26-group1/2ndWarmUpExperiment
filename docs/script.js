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
 * @typedef {Object} AudioSettings
 * @property {number} volume
 * @property {boolean} isMuted
 * @property {number} previousVolume
 */

/**
 * @typedef {"slow" | "normal" | "fast" | "skip"} SpinSpeedMode
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
 * @property {SpinSpeedMode} spinSpeed
 * @property {AudioSettings} audioSettings
 * @property {boolean} isBonusActive
 * @property {BonusRoundState | null} bonusRound
 * @property {{mini: number, major: number, grand: number}} jackpots
 */

/**
 * Shared numeric gameplay limits used across board generation, betting, and rendering.
 */
const GAME_LIMITS = {
  minBet: 10,
  maxBet: 100,
  betStep: 10,
  defaultBalance: 1000,
  reelCount: 5,
  rowCount: 3
};

/**
 * Canonical ids for every symbol used by the slot machine.
 */
const SYMBOL_IDS = {
  badge: "badge",
  boots: "boots",
  cowboy: "cowboy",
  wanted: "wanted",
  cactus: "cactus",
  wild: "wild",
  scatter: "scatter",
  dynamite: "dynamite",
  a: "a",
  k: "k",
  q: "q",
  j: "j",
  ten: "10"
};

/**
 * Stable reward identifiers used by the bonus round.
 */
const BONUS_REWARD_TYPES = Object.freeze({
  coins: "coins",
  multiplier: "multiplier",
  freeSpins: "free-spins",
  collect: "collect"
});

/**
 * Named audio cue ids used by synthesized playback.
 */
const AUDIO_CUES = Object.freeze({
  spin: "spin",
  reelStop: "reelStop",
  win: "win",
  bigWin: "bigWin",
  jackpot: "jackpot"
});

const SOUNDS = AUDIO_CUES;

/**
 * Centralized user-facing and diagnostic strings.
 */
const UI_TEXT = Object.freeze({
  warnings: {
    expectedStringSymbolId: "Expected a string symbol id while rendering.",
    unknownSymbolId: "Unknown symbol id",
    unknownBonusPrizeType: "Unknown bonus prize type",
    audioPlaybackFailed: "Audio playback failed.",
    keyboardSpinActivationFailed: "Keyboard spin activation failed.",
    initializeFailed: "Failed to initialize Gunslinger Gold."
  },
  messages: {
    noWin: "No win this round",
    bigWin: "Big Win",
    reelsSpinning: "Reels spinning",
    pickCrate: "Pick a crate for bonus loot",
    bonusCollected: "Bonus collected",
    bonusWinPrefix: "Bonus win",
    jackpotPaidSuffix: "jackpot paid"
  }
});

const JACKPOTS = Object.freeze({
  mini: "mini",
  major: "major",
  grand: "grand"
});

const STORAGE_KEYS = {
  spinSpeed: "gunslinger-gold-spin-speed",
  audioSettings: "gunslinger-gold-audio-settings",
  jackpots: "gunslinger-gold-jackpots",
  lastLoginDate: "gunslinger-gold-last-login-date"
};

const AUDIO_SETTINGS_CONFIG = Object.freeze({
  defaultVolume: 0.6,
  minVolume: 0,
  maxVolume: 1,
  step: 0.05,
  sliderScale: 100,
  lowVolumeThreshold: 0.5,
  sliderId: "volumeSlider",
  muteButtonId: "volumeMuteButton",
  muteLabel: "Mute volume",
  unmuteLabel: "Restore volume"
});

const SPIN_SPEED_CONFIG = Object.freeze({
  defaultMode: "normal",
  modes: {
    slow: {
      spinStripIntervalMs: 118,
      reelStopBaseMs: 910,
      reelStopStepMs: 360
    },
    normal: {
      spinStripIntervalMs: 86,
      reelStopBaseMs: 650,
      reelStopStepMs: 260
    },
    fast: {
      spinStripIntervalMs: 54,
      reelStopBaseMs: 390,
      reelStopStepMs: 160
    },
    skip: {
      spinStripIntervalMs: 0,
      reelStopBaseMs: 0,
      reelStopStepMs: 0
    }
  },
  buttonIds: {
    slow: "spinSpeedSlow",
    normal: "spinSpeedNormal",
    fast: "spinSpeedFast",
    skip: "spinSpeedSkip"
  }
});

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
  minimumContribution: 1,
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

const FEEDBACK_CONFIG = Object.freeze({
  winPopupDurationMs: 2300,
  bigWinThresholdBetMultiplier: 20,
  bigWinCelebrationCoins: 22,
  bigWinCelebrationDurationMs: 2600,
  jackpotCelebrationDurationMs: 3400
});

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

const BONUS_CRATE_STATE_KEYS = Object.freeze({
  default: "default",
  hover: "hover",
  focus: "focus",
  selected: "selected",
  opened: "opened",
  disabled: "disabled",
  revealed: "revealed"
});

const BONUS_UI_CONFIG = Object.freeze({
  elementIds: {
    overlay: "bonusOverlay",
    panel: "bonusPanel",
    status: "bonusStatus",
    crates: "bonusCrates"
  },
  classNames: {
    overlayVisible: "show",
    status: "bonus-status",
    statusGrid: "bonus-status-grid",
    stat: "bonus-stat",
    statLabel: "bonus-stat-label",
    statValue: "bonus-stat-value",
    crateButton: "crate-button",
    crateContent: "crate-content",
    crateTopline: "crate-topline",
    crateTitle: "crate-title",
    crateValue: "crate-value",
    crateMeta: "crate-meta",
    iconShell: "bonus-icon",
    rewardBadge: "crate-reward-badge"
  },
  selectors: {
    crateButton: ".crate-button"
  },
  stateClassNames: {
    default: "crate-button--default",
    hover: "crate-button--hover",
    focus: "crate-button--focus",
    selected: "crate-button--selected",
    opened: "crate-button--opened",
    disabled: "crate-button--disabled",
    revealed: "crate-button--revealed"
  },
  separators: {
    className: " ",
    picks: "/",
    aria: ", "
  },
  events: {
    click: "click",
    pointerOver: "pointerover",
    pointerOut: "pointerout",
    focusIn: "focusin",
    focusOut: "focusout"
  },
  fallbackRewardType: "mystery",
  fallbackIconKey: "mystery",
  crate: {
    indexBase: 1,
    hiddenIconKey: "crate",
    hiddenTitle: "Sealed Crate",
    hiddenValueText: "Mystery Loot",
    hiddenMeta: "Bonus Reward",
    indexLabel: "Crate",
    revealedMeta: "Revealed",
    ariaHiddenSuffix: "sealed mystery reward",
    ariaRevealedPrefix: "revealed reward"
  },
  messages: {
    chooseCrates: "Choose up to three crates.",
    missingElement: "Missing bonus UI element",
    invalidState: "Invalid bonus round state while rendering.",
    unknownRewardType: "Unknown bonus reward type while rendering."
  },
  stats: [
    {
      key: "totalCoins",
      valueKey: "totalCoins",
      label: "Total Winnings",
      prefix: "",
      suffix: "",
      className: "bonus-stat--coins"
    },
    {
      key: "freeSpinsAwarded",
      valueKey: "freeSpinsAwarded",
      label: "Free Spins",
      prefix: "+",
      suffix: "",
      className: "bonus-stat--free-spins"
    },
    {
      key: "bonusMultiplier",
      valueKey: "bonusMultiplier",
      label: "Bonus Multiplier",
      prefix: "x",
      suffix: "",
      className: "bonus-stat--multiplier"
    },
    {
      key: "picksMade",
      valueKey: "picksMade",
      label: "Picks Used",
      prefix: "",
      suffix: "",
      className: "bonus-stat--picks",
      maxValue: BONUS_CONFIG.maxPicks
    }
  ],
  rewardTypes: {
    coins: {
      iconKey: "coin-stack",
      className: "bonus-reward--coins",
      label: "Coins",
      valuePrefix: "",
      valueSuffix: "",
      emptyValueText: "0"
    },
    multiplier: {
      iconKey: "multiplier",
      className: "bonus-reward--multiplier",
      label: "Multiplier",
      valuePrefix: "x",
      valueSuffix: "",
      emptyValueText: "x1"
    },
    "free-spins": {
      iconKey: "free-spins",
      className: "bonus-reward--free-spins",
      label: "Free Spins",
      valuePrefix: "+",
      valueSuffix: "",
      emptyValueText: "+0"
    },
    collect: {
      iconKey: "jackpot-star",
      className: "bonus-reward--collect",
      label: "Collect",
      valuePrefix: "",
      valueSuffix: "",
      emptyValueText: "Collect"
    },
    mystery: {
      iconKey: "mystery",
      className: "bonus-reward--mystery",
      label: "Mystery",
      valuePrefix: "",
      valueSuffix: "",
      emptyValueText: "Mystery"
    }
  },
  icons: {
    crate: {
      key: "crate",
      title: "Sealed crate",
      className: "bonus-icon--crate",
      viewBox: "0 0 64 64",
      markup: `
        <path d="M10 21h44v34H10z" fill="#7b421f" stroke="#32180b" stroke-width="3" />
        <path d="M13 24h38v28H13z" fill="#9d5a2a" opacity="0.76" />
        <path d="M10 21l8-10h28l8 10" fill="#b87332" stroke="#32180b" stroke-width="3" stroke-linejoin="round" />
        <path d="M18 11v44M46 11v44M10 38h44M15 25l34 25M49 25L15 50" stroke="#3b1d0d" stroke-width="3" stroke-linecap="round" opacity="0.72" />
        <path d="M20 16h24" stroke="#ffd978" stroke-width="3" stroke-linecap="round" opacity="0.82" />
      `
    },
    "coin-stack": {
      key: "coin-stack",
      title: "Coin stack",
      className: "bonus-icon--coin-stack",
      viewBox: "0 0 64 64",
      markup: `
        <ellipse cx="31" cy="16" rx="17" ry="7" fill="#ffeaa0" stroke="#8b5516" stroke-width="3" />
        <path d="M14 16v22c0 4 8 7 17 7s17-3 17-7V16" fill="#d89424" stroke="#8b5516" stroke-width="3" />
        <path d="M14 25c0 4 8 7 17 7s17-3 17-7M14 34c0 4 8 7 17 7s17-3 17-7" fill="none" stroke="#fff0a8" stroke-width="2.5" opacity="0.7" />
        <circle cx="44" cy="41" r="10" fill="#ffd658" stroke="#8b5516" stroke-width="3" />
        <path d="M44 35v12M38 41h12" stroke="#8b5516" stroke-width="2.5" stroke-linecap="round" />
      `
    },
    "free-spins": {
      key: "free-spins",
      title: "Free spins",
      className: "bonus-icon--free-spins",
      viewBox: "0 0 64 64",
      markup: `
        <path d="M18 21a19 19 0 0 1 30 3" fill="none" stroke="#fff0a8" stroke-width="5" stroke-linecap="round" />
        <path d="M47 14l2 11-11-1" fill="#fff0a8" stroke="#6a3515" stroke-width="2" stroke-linejoin="round" />
        <path d="M46 43a19 19 0 0 1-30-3" fill="none" stroke="#f6cb58" stroke-width="5" stroke-linecap="round" />
        <path d="M17 50l-2-11 11 1" fill="#f6cb58" stroke="#6a3515" stroke-width="2" stroke-linejoin="round" />
        <text x="32" y="38" text-anchor="middle" fill="#321509" font-size="16" font-weight="900" font-family="Georgia, serif">FS</text>
      `
    },
    multiplier: {
      key: "multiplier",
      title: "Multiplier",
      className: "bonus-icon--multiplier",
      viewBox: "0 0 64 64",
      markup: `
        <path d="M32 7l6 15 16 2-12 11 3 16-13-8-13 8 3-16L10 24l16-2z" fill="#ffe47a" stroke="#704017" stroke-width="3" stroke-linejoin="round" />
        <circle cx="32" cy="32" r="13" fill="#9a4f20" stroke="#fff0a8" stroke-width="3" />
        <text x="32" y="38" text-anchor="middle" fill="#fff5c8" font-size="18" font-weight="900" font-family="Georgia, serif">x</text>
      `
    },
    "jackpot-star": {
      key: "jackpot-star",
      title: "Jackpot starburst",
      className: "bonus-icon--jackpot-star",
      viewBox: "0 0 64 64",
      markup: `
        <path d="M32 5l6 13 14-5-5 14 12 7-14 5 4 15-13-7-10 12-3-15-15 1 9-12-9-11 15 1 3-15z" fill="#ffd658" stroke="#6a3515" stroke-width="3" stroke-linejoin="round" />
        <circle cx="32" cy="32" r="12" fill="#8f3d1a" stroke="#fff0a8" stroke-width="3" />
        <path d="M26 32l4 4 9-10" fill="none" stroke="#fff5c8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      `
    },
    mystery: {
      key: "mystery",
      title: "Mystery reward",
      className: "bonus-icon--mystery",
      viewBox: "0 0 64 64",
      markup: `
        <path d="M16 15h32v34H16z" fill="#6f3d1f" stroke="#32180b" stroke-width="3" />
        <path d="M20 19h24v26H20z" fill="#ad6830" opacity="0.8" />
        <path d="M25 28c1-6 6-9 12-7 5 2 7 7 4 11-2 3-6 4-7 8" fill="none" stroke="#fff0a8" stroke-width="4" stroke-linecap="round" />
        <circle cx="33" cy="46" r="3" fill="#fff0a8" />
      `
    }
  }
});

const BONUS_MODAL_LAYOUT_CONFIG = Object.freeze({
  compactBreakpointPx: 720,
  minimumPanelHeightPx: 280,
  scrollRegionTabIndex: 0,
  viewportPaddingPx: 24
});

const FOCUS_TRAP_CONFIG = Object.freeze({
  focusableSelector: [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(", "),
  blockedElementSelector: ".game-shell"
});

const RETENTION_CONFIG = {
  feedbackDurationMs: 3200,
  dailyLoginReward: {
    type: BONUS_REWARD_TYPES.freeSpins,
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
  { id: SYMBOL_IDS.badge, label: "Sheriff", className: "symbol-badge", weight: 10, payouts: { 3: 6, 4: 18, 5: 70 } },
  { id: SYMBOL_IDS.boots, label: "Boots", className: "symbol-boots", weight: 10, payouts: { 3: 5, 4: 15, 5: 55 } },
  { id: SYMBOL_IDS.cowboy, label: "Cowboy", className: "symbol-cowboy", weight: 10, payouts: { 3: 7, 4: 22, 5: 90 } },
  { id: SYMBOL_IDS.wanted, label: "Wanted", className: "symbol-wanted", weight: 9, payouts: { 3: 4, 4: 12, 5: 42 } },
  { id: SYMBOL_IDS.cactus, label: "Cactus", className: "symbol-cactus", weight: 9, payouts: { 3: 3, 4: 10, 5: 32 } },
  { id: SYMBOL_IDS.dynamite, label: "Dynamite", className: "symbol-dynamite", weight: 10, payouts: { 3: 4, 4: 14, 5: 46 } },
  { id: SYMBOL_IDS.scatter, label: "Scatter", className: "symbol-scatter", weight: 7, payouts: { 3: 2, 4: 8, 5: 35 } },
  { id: SYMBOL_IDS.wild, label: "Wild", className: "symbol-wild", weight: 9, payouts: { 3: 8, 4: 24, 5: 100 } },
  { id: SYMBOL_IDS.a, label: "A", className: "symbol-letter", weight: 5, payouts: { 3: 2, 4: 6, 5: 18 } },
  { id: SYMBOL_IDS.k, label: "K", className: "symbol-letter", weight: 5, payouts: { 3: 2, 4: 5, 5: 16 } },
  { id: SYMBOL_IDS.q, label: "Q", className: "symbol-letter", weight: 5, payouts: { 3: 1, 4: 4, 5: 14 } },
  { id: SYMBOL_IDS.j, label: "J", className: "symbol-letter", weight: 6, payouts: { 3: 1, 4: 3, 5: 12 } },
  { id: SYMBOL_IDS.ten, label: "10", className: "symbol-number", weight: 6, payouts: { 3: 1, 4: 3, 5: 10 } }
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
      eligibleSymbolIds: [SYMBOL_IDS.badge, SYMBOL_IDS.boots, SYMBOL_IDS.cowboy, SYMBOL_IDS.wanted, SYMBOL_IDS.cactus, SYMBOL_IDS.a, SYMBOL_IDS.k, SYMBOL_IDS.q, SYMBOL_IDS.j, SYMBOL_IDS.ten]
    },
    {
      id: "middle-line-third-reel-slide",
      lineName: "middle",
      matchCount: 2,
      missReel: 2,
      eligibleSymbolIds: [SYMBOL_IDS.badge, SYMBOL_IDS.boots, SYMBOL_IDS.cowboy, SYMBOL_IDS.wanted, SYMBOL_IDS.cactus, SYMBOL_IDS.a, SYMBOL_IDS.k, SYMBOL_IDS.q, SYMBOL_IDS.j, SYMBOL_IDS.ten]
    },
    {
      id: "bottom-line-third-reel-slide",
      lineName: "bottom",
      matchCount: 2,
      missReel: 2,
      eligibleSymbolIds: [SYMBOL_IDS.badge, SYMBOL_IDS.boots, SYMBOL_IDS.cowboy, SYMBOL_IDS.wanted, SYMBOL_IDS.cactus, SYMBOL_IDS.a, SYMBOL_IDS.k, SYMBOL_IDS.q, SYMBOL_IDS.j, SYMBOL_IDS.ten]
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

const COWBOY_ART_CONFIG = Object.freeze({
  symbolId: "cowboy",
  crownDetailAttribute: "data-icon-detail",
  crownDetailValue: "hat-crown",
  faceDetailValue: "hat-face",
  palette: {
    hatBase: "#6e4228",
    hatShadow: "#4f2d1b",
    hatHighlight: "#b87f47",
    band: "#d6a154",
    face: "#c78a62",
    faceShadow: "#a86d49",
    shirt: "#325880",
    shirtShadow: "#1c2f4c",
    neckerchief: "#a33328",
    outline: "#3d2115"
  }
});

const CACTUS_ART_CONFIG = Object.freeze({
  symbolId: "cactus",
  bodyDetailAttribute: "data-icon-detail",
  bodyDetailValue: "cactus-body",
  armDetailValue: "cactus-arm",
  palette: {
    bodyLight: "#63c662",
    bodyMid: "#3d9d47",
    bodyDark: "#28703a",
    outline: "#16492b",
    spine: "#dfe7b0",
    ground: "#8e5b2c",
    groundShadow: "#5f3817"
  }
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
  cowboy: {
    viewBox: "0 0 96 80",
    className: "slot-icon slot-icon-cowboy",
    title: "Cowboy hat"
  },
  cactus: {
    viewBox: "0 0 96 80",
    className: "slot-icon slot-icon-cactus",
    title: "Cactus"
  },
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
  spinSpeed: SPIN_SPEED_CONFIG.defaultMode,
  audioSettings: createDefaultAudioSettings(),
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
let activeFocusTrap = null;
let isGameInitialized = false;
const managedEventCleanups = [];

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
    console.warn(UI_TEXT.warnings.expectedStringSymbolId, symbolId);
    return fallbackSymbol;
  }

  if (!SYMBOL_MAP[symbolId]) {
    console.warn(`${UI_TEXT.warnings.unknownSymbolId} "${symbolId}" while rendering. Falling back to ${fallbackSymbol.id}.`);
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
 * Builds the cowboy hat art in the same western SVG style as the other refreshed symbols.
 * @param {SymbolArtConfig} config
 * @returns {string}
 */
function createCowboySymbolArt(config) {
  return createInlineSymbolSvg(config, `
    <g transform="translate(4 4)">
      <path d="M18 26 C20 13 32 7 46 7 C61 7 73 13 75 26 C72 34 61 40 46 40 C32 40 21 34 18 26 Z" fill="${COWBOY_ART_CONFIG.palette.hatBase}" stroke="${COWBOY_ART_CONFIG.palette.outline}" stroke-width="2.6" stroke-linejoin="round" data-icon-detail="${COWBOY_ART_CONFIG.crownDetailValue}" />
      <path d="M26 24 C28 16 36 12 46 12 C57 12 65 16 67 24 C65 30 57 34 46 34 C36 34 28 30 26 24 Z" fill="${COWBOY_ART_CONFIG.palette.hatHighlight}" opacity="0.78" />
      <path d="M20 28 C27 22 38 20 46 20 C56 20 66 23 74 28 C68 23 60 19 46 19 C34 19 25 22 20 28 Z" fill="${COWBOY_ART_CONFIG.palette.hatShadow}" opacity="0.92" />
      <path d="M29 28 C34 26 40 25 46 25 C52 25 58 26 63 28 L61 32 C55 30 51 29 46 29 C41 29 37 30 31 32 Z" fill="${COWBOY_ART_CONFIG.palette.band}" stroke="${COWBOY_ART_CONFIG.palette.outline}" stroke-width="1.5" stroke-linejoin="round" />
      <path d="M4 39 C11 31 22 29 34 30 C40 24 48 23 58 25 C66 27 72 31 81 34 C86 36 88 41 84 44 C76 49 67 50 57 48 C49 53 37 54 27 52 C18 50 10 47 6 44 C2 42 1 40 4 39 Z" fill="${COWBOY_ART_CONFIG.palette.hatBase}" stroke="${COWBOY_ART_CONFIG.palette.outline}" stroke-width="2.8" stroke-linejoin="round" />
      <path d="M10 40 C19 35 29 35 39 38 C47 34 57 34 68 37 C74 39 79 39 84 38 C80 42 73 44 66 43 C57 41 49 40 40 43 C30 46 20 45 10 40 Z" fill="${COWBOY_ART_CONFIG.palette.hatShadow}" opacity="0.85" />
      <path d="M40 39 C42 36 46 35 50 36 C53 37 55 39 56 43 C54 48 51 52 47 56 C45 58 42 58 40 56 C36 52 33 48 32 43 C33 40 36 38 40 39 Z" fill="${COWBOY_ART_CONFIG.palette.face}" stroke="${COWBOY_ART_CONFIG.palette.outline}" stroke-width="2" stroke-linejoin="round" data-icon-detail="${COWBOY_ART_CONFIG.faceDetailValue}" />
      <path d="M37 44 C40 41 44 40 47 40 C50 40 53 41 55 43 C52 42 49 42 46 42 C43 42 40 42 37 44 Z" fill="${COWBOY_ART_CONFIG.palette.faceShadow}" opacity="0.72" />
      <path d="M37 58 L45 48 L54 58 Z" fill="${COWBOY_ART_CONFIG.palette.neckerchief}" stroke="${COWBOY_ART_CONFIG.palette.outline}" stroke-width="1.8" stroke-linejoin="round" />
      <path d="M30 70 C34 61 39 57 46 57 C53 57 58 61 62 70" fill="${COWBOY_ART_CONFIG.palette.shirt}" stroke="${COWBOY_ART_CONFIG.palette.outline}" stroke-width="2.2" stroke-linecap="round" />
      <path d="M34 67 C38 61 42 59 46 59 C50 59 54 61 58 67" fill="none" stroke="${COWBOY_ART_CONFIG.palette.shirtShadow}" stroke-width="2.2" stroke-linecap="round" opacity="0.7" />
    </g>
  `, COWBOY_ART_CONFIG.symbolId);
}

/**
 * Builds the cactus art with attached arms and shared body shading.
 * @param {SymbolArtConfig} config
 * @returns {string}
 */
function createCactusSymbolArt(config) {
  return createInlineSymbolSvg(config, `
    <g transform="translate(10 4)">
      <path d="M28 73 C30 63 31 48 31 36 C31 31 35 27 40 27 C45 27 49 31 49 36 C49 48 50 63 52 73 Z" fill="${CACTUS_ART_CONFIG.palette.bodyMid}" stroke="${CACTUS_ART_CONFIG.palette.outline}" stroke-width="2.6" stroke-linejoin="round" data-icon-detail="${CACTUS_ART_CONFIG.bodyDetailValue}" />
      <path d="M22 42 C17 42 13 38 13 33 L13 25 C13 20 17 16 22 16 C27 16 31 20 31 25 L31 55 C31 60 27 64 22 64 C17 64 13 60 13 55 L13 48" fill="${CACTUS_ART_CONFIG.palette.bodyMid}" stroke="${CACTUS_ART_CONFIG.palette.outline}" stroke-width="2.6" stroke-linejoin="round" data-icon-detail="${CACTUS_ART_CONFIG.armDetailValue}" />
      <path d="M58 47 C63 47 67 43 67 38 L67 30 C67 25 63 21 58 21 C53 21 49 25 49 30 L49 60 C49 65 53 69 58 69 C63 69 67 65 67 60 L67 53" fill="${CACTUS_ART_CONFIG.palette.bodyMid}" stroke="${CACTUS_ART_CONFIG.palette.outline}" stroke-width="2.6" stroke-linejoin="round" data-icon-detail="${CACTUS_ART_CONFIG.armDetailValue}" />
      <path d="M17 60 C21 59 25 57 28 54 L28 28 C28 24 30 20 34 18 C36 17 38 17 40 17 L40 73 L28 73 C27 64 23 61 17 60 Z" fill="${CACTUS_ART_CONFIG.palette.bodyLight}" opacity="0.78" />
      <path d="M49 73 L40 73 L40 17 C43 17 45 18 48 20 C51 23 52 26 52 31 L52 58 C57 59 61 61 64 65 C61 64 57 65 54 67 C52 68 51 70 49 73 Z" fill="${CACTUS_ART_CONFIG.palette.bodyDark}" opacity="0.56" />
      <path d="M19 23 C21 21 23 21 25 23" fill="none" stroke="${CACTUS_ART_CONFIG.palette.spine}" stroke-width="1.5" stroke-linecap="round" />
      <path d="M19 34 C21 32 23 32 25 34" fill="none" stroke="${CACTUS_ART_CONFIG.palette.spine}" stroke-width="1.5" stroke-linecap="round" />
      <path d="M38 22 C40 20 42 20 44 22" fill="none" stroke="${CACTUS_ART_CONFIG.palette.spine}" stroke-width="1.5" stroke-linecap="round" />
      <path d="M38 35 C40 33 42 33 44 35" fill="none" stroke="${CACTUS_ART_CONFIG.palette.spine}" stroke-width="1.5" stroke-linecap="round" />
      <path d="M38 48 C40 46 42 46 44 48" fill="none" stroke="${CACTUS_ART_CONFIG.palette.spine}" stroke-width="1.5" stroke-linecap="round" />
      <path d="M57 28 C59 26 61 26 63 28" fill="none" stroke="${CACTUS_ART_CONFIG.palette.spine}" stroke-width="1.5" stroke-linecap="round" />
      <path d="M57 39 C59 37 61 37 63 39" fill="none" stroke="${CACTUS_ART_CONFIG.palette.spine}" stroke-width="1.5" stroke-linecap="round" />
      <path d="M24 76 C34 72 47 72 57 76" fill="none" stroke="${CACTUS_ART_CONFIG.palette.groundShadow}" stroke-width="5" stroke-linecap="round" opacity="0.42" />
      <path d="M20 75 C31 70 49 70 61 75" fill="none" stroke="${CACTUS_ART_CONFIG.palette.ground}" stroke-width="3" stroke-linecap="round" />
    </g>
  `, CACTUS_ART_CONFIG.symbolId);
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
  cowboy: createCowboySymbolArt,
  cactus: createCactusSymbolArt,
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
 * Resolves the configured presentation for a bonus reward type, falling back safely for unknown prizes.
 * @param {string} rewardType
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {{iconKey: string, className: string, label: string, valuePrefix: string, valueSuffix: string, emptyValueText: string}}
 */
function getBonusRewardUiConfig(rewardType, config = BONUS_UI_CONFIG) {
  const fallbackConfig = config.rewardTypes[config.fallbackRewardType];

  if (typeof rewardType !== "string" || !config.rewardTypes[rewardType]) {
    console.warn(config.messages.unknownRewardType, rewardType);
    return fallbackConfig;
  }

  return config.rewardTypes[rewardType];
}

/**
 * Resolves the icon key configured for a bonus reward type.
 * @param {string} rewardType
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {string}
 */
function getBonusRewardIconKey(rewardType, config = BONUS_UI_CONFIG) {
  return getBonusRewardUiConfig(rewardType, config).iconKey;
}

/**
 * Resolves the CSS class configured for a bonus reward type.
 * @param {string} rewardType
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {string}
 */
function getBonusRewardClassName(rewardType, config = BONUS_UI_CONFIG) {
  return getBonusRewardUiConfig(rewardType, config).className;
}

/**
 * Resolves a crate state CSS class from the configured state map.
 * @param {string} stateKey
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {string}
 */
function getBonusCrateStateClass(stateKey, config = BONUS_UI_CONFIG) {
  if (!config.stateClassNames[stateKey]) {
    return config.stateClassNames[BONUS_CRATE_STATE_KEYS.default];
  }

  return config.stateClassNames[stateKey];
}

/**
 * Builds the complete CSS class string for a crate button from its visual state.
 * @param {{isRevealed?: boolean, isSelected?: boolean, isDisabled?: boolean}} crateState
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {string}
 */
function getBonusCrateStateClasses(crateState, config = BONUS_UI_CONFIG) {
  const classes = [config.classNames.crateButton];

  if (crateState.isRevealed) {
    classes.push(
      getBonusCrateStateClass(BONUS_CRATE_STATE_KEYS.opened, config),
      getBonusCrateStateClass(BONUS_CRATE_STATE_KEYS.revealed, config)
    );
  } else if (crateState.isSelected) {
    classes.push(
      getBonusCrateStateClass(BONUS_CRATE_STATE_KEYS.selected, config),
      getBonusCrateStateClass(BONUS_CRATE_STATE_KEYS.opened, config)
    );
  } else {
    classes.push(getBonusCrateStateClass(BONUS_CRATE_STATE_KEYS.default, config));
  }

  if (crateState.isDisabled || crateState.isRevealed) {
    classes.push(getBonusCrateStateClass(BONUS_CRATE_STATE_KEYS.disabled, config));
  }

  return classes.join(config.separators.className);
}

/**
 * Builds inline SVG markup for a configured bonus icon.
 * @param {string} iconKey
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {string}
 */
function createBonusIconMarkup(iconKey, config = BONUS_UI_CONFIG) {
  const iconConfig = config.icons[iconKey] || config.icons[config.fallbackIconKey];

  return `
    <span class="${escapeHtml(config.classNames.iconShell)} ${escapeHtml(iconConfig.className)}" data-bonus-icon="${escapeHtml(iconConfig.key)}" aria-hidden="true">
      <svg viewBox="${escapeHtml(iconConfig.viewBox)}" focusable="false" xmlns="http://www.w3.org/2000/svg">
        ${iconConfig.markup}
      </svg>
    </span>
  `;
}

/**
 * Formats the visible value for a revealed bonus prize.
 * @param {BonusPrize} prize
 * @param {typeof BONUS_UI_CONFIG.rewardTypes.coins} rewardConfig
 * @returns {string}
 */
function formatBonusPrizeValue(prize, rewardConfig) {
  const numericValue = Number(prize.value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return rewardConfig.emptyValueText;
  }

  return `${rewardConfig.valuePrefix}${numericValue}${rewardConfig.valueSuffix}`;
}

/**
 * Creates the stat view models rendered in the bonus modal header.
 * @param {BonusRoundState} bonusState
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {{key: string, label: string, value: string, className: string}[]}
 */
function createBonusStatusViewModel(bonusState, config = BONUS_UI_CONFIG) {
  return config.stats.map((statConfig) => {
    const rawValue = Number(bonusState[statConfig.valueKey]);
    const value = Number.isFinite(rawValue) ? rawValue : 0;
    const valueText = typeof statConfig.maxValue === "number"
      ? `${value}${config.separators.picks}${statConfig.maxValue}`
      : `${statConfig.prefix}${value}${statConfig.suffix}`;

    return {
      key: statConfig.key,
      label: statConfig.label,
      value: valueText,
      className: statConfig.className
    };
  });
}

/**
 * Creates the render model for one crate tile.
 * @param {BonusPrize} prize
 * @param {number} index
 * @param {BonusRoundState} bonusState
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {{ariaLabel: string, className: string, iconKey: string, indexLabel: string, isRevealed: boolean, rewardClassName: string, rewardLabel: string, title: string, valueText: string, metaText: string}}
 */
function createBonusCrateViewModel(prize, index, bonusState, config = BONUS_UI_CONFIG) {
  const safePrize = prize || {
    type: config.fallbackRewardType,
    label: config.rewardTypes[config.fallbackRewardType].label,
    value: 0
  };
  const isRevealed = Boolean(bonusState.revealedCrates[index]);
  const rewardConfig = getBonusRewardUiConfig(safePrize.type, config);
  const indexLabel = `${config.crate.indexLabel} ${index + config.crate.indexBase}`;
  const rewardLabel = typeof safePrize.label === "string" ? safePrize.label : rewardConfig.label;
  const valueText = isRevealed ? formatBonusPrizeValue(safePrize, rewardConfig) : config.crate.hiddenValueText;
  const title = isRevealed ? rewardLabel : config.crate.hiddenTitle;
  const metaText = isRevealed ? config.crate.revealedMeta : config.crate.hiddenMeta;
  const ariaFragments = isRevealed
    ? [indexLabel, rewardLabel, `${config.crate.ariaRevealedPrefix} ${valueText}`]
    : [indexLabel, config.crate.ariaHiddenSuffix];

  return {
    ariaLabel: ariaFragments.join(config.separators.aria),
    className: getBonusCrateStateClasses({ isRevealed }, config),
    iconKey: isRevealed ? rewardConfig.iconKey : config.crate.hiddenIconKey,
    indexLabel,
    isRevealed,
    rewardClassName: rewardConfig.className,
    rewardLabel,
    title,
    valueText,
    metaText
  };
}

/**
 * Validates the minimum bonus state shape needed by the modal renderer.
 * @param {BonusRoundState | null} bonusState
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {boolean}
 */
function isValidBonusRoundState(bonusState, config = BONUS_UI_CONFIG) {
  const isValid = Boolean(
    bonusState
    && Array.isArray(bonusState.prizes)
    && Array.isArray(bonusState.revealedCrates)
    && Number.isFinite(Number(bonusState.totalCoins))
    && Number.isFinite(Number(bonusState.freeSpinsAwarded))
    && Number.isFinite(Number(bonusState.bonusMultiplier))
    && Number.isFinite(Number(bonusState.picksMade))
  );

  if (!isValid) {
    console.warn(config.messages.invalidState, bonusState);
  }

  return isValid;
}

/**
 * Finds the required bonus modal nodes without throwing when markup is missing.
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {{overlay: HTMLElement, panel: HTMLElement, status: HTMLElement, crates: HTMLElement} | null}
 */
function getBonusRoundElements(config = BONUS_UI_CONFIG) {
  if (typeof document === "undefined") {
    return null;
  }

  const overlay = document.getElementById(config.elementIds.overlay);
  const panel = document.getElementById(config.elementIds.panel);
  const status = document.getElementById(config.elementIds.status);
  const crates = document.getElementById(config.elementIds.crates);

  if (!overlay || !panel || !status || !crates) {
    console.warn(config.messages.missingElement, config.elementIds);
    return null;
  }

  return { overlay, panel, status, crates };
}

/**
 * Builds responsive layout values for the Pick-a-Crate modal.
 * @param {number} viewportWidth
 * @param {number} viewportHeight
 * @param {typeof BONUS_MODAL_LAYOUT_CONFIG} [config]
 * @returns {{isCompact: boolean, maxPanelHeightPx: number, scrollRegionTabIndex: number}}
 */
function createBonusModalLayoutState(viewportWidth, viewportHeight, config = BONUS_MODAL_LAYOUT_CONFIG) {
  const safeWidth = Number(viewportWidth);
  const safeHeight = Number(viewportHeight);
  const viewportPaddingPx = Math.max(0, Number(config.viewportPaddingPx) || 0);
  const fallbackHeight = Math.max(0, Number(config.minimumPanelHeightPx) || 0);
  const availableHeight = Number.isFinite(safeHeight)
    ? safeHeight - (viewportPaddingPx * 2)
    : fallbackHeight;
  const maxPanelHeightPx = Number.isFinite(safeHeight)
    ? Math.min(safeHeight, Math.max(fallbackHeight, availableHeight))
    : fallbackHeight;

  return {
    isCompact: Number.isFinite(safeWidth) ? safeWidth <= config.compactBreakpointPx : false,
    maxPanelHeightPx,
    scrollRegionTabIndex: config.scrollRegionTabIndex
  };
}

/**
 * Applies the responsive Pick-a-Crate modal layout attributes and sizing.
 * @param {{overlay: HTMLElement, panel: HTMLElement, status: HTMLElement, crates: HTMLElement} | null} bonusElements
 * @param {typeof BONUS_MODAL_LAYOUT_CONFIG} [config]
 * @returns {{isCompact: boolean, maxPanelHeightPx: number, scrollRegionTabIndex: number} | null}
 */
function syncBonusModalLayout(bonusElements = getBonusRoundElements(), config = BONUS_MODAL_LAYOUT_CONFIG) {
  if (!bonusElements || typeof window === "undefined") {
    return null;
  }

  const layoutState = createBonusModalLayoutState(window.innerWidth, window.innerHeight, config);
  const { overlay, panel, crates } = bonusElements;

  overlay.dataset.bonusLayout = layoutState.isCompact ? "compact" : "default";
  panel.style.setProperty("--bonus-panel-max-height", `${layoutState.maxPanelHeightPx}px`);
  crates.tabIndex = layoutState.scrollRegionTabIndex;
  crates.dataset.scrollable = "true";

  return layoutState;
}

/**
 * Renders the bonus status stat tiles.
 * @param {HTMLElement} statusElement
 * @param {BonusRoundState} bonusState
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {void}
 */
function renderBonusStatus(statusElement, bonusState, config = BONUS_UI_CONFIG) {
  const stats = createBonusStatusViewModel(bonusState, config);
  statusElement.className = [config.classNames.status, config.classNames.statusGrid].join(config.separators.className);
  statusElement.innerHTML = stats.map((stat) => `
    <div class="${escapeHtml(config.classNames.stat)} ${escapeHtml(stat.className)}" data-bonus-stat="${escapeHtml(stat.key)}">
      <span class="${escapeHtml(config.classNames.statLabel)}">${escapeHtml(stat.label)}</span>
      <strong class="${escapeHtml(config.classNames.statValue)}">${escapeHtml(stat.value)}</strong>
    </div>
  `).join("");
}

/**
 * Builds one crate button element for the bonus modal.
 * @param {BonusPrize} prize
 * @param {number} index
 * @param {BonusRoundState} bonusState
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {HTMLButtonElement}
 */
function createBonusCrateButton(prize, index, bonusState, config = BONUS_UI_CONFIG) {
  const viewModel = createBonusCrateViewModel(prize, index, bonusState, config);
  const button = document.createElement("button");

  button.className = viewModel.className;
  button.type = "button";
  button.disabled = viewModel.isRevealed;
  button.dataset.crateIndex = String(index);
  button.dataset.rewardType = prize && typeof prize.type === "string" ? prize.type : config.fallbackRewardType;
  button.dataset.rewardIcon = viewModel.iconKey;
  button.setAttribute("aria-label", viewModel.ariaLabel);
  button.setAttribute("aria-pressed", String(viewModel.isRevealed));
  button.innerHTML = `
    <span class="${escapeHtml(config.classNames.crateContent)} ${escapeHtml(viewModel.rewardClassName)}">
      <span class="${escapeHtml(config.classNames.crateTopline)}">${escapeHtml(viewModel.indexLabel)}</span>
      ${createBonusIconMarkup(viewModel.iconKey, config)}
      <span class="${escapeHtml(config.classNames.crateTitle)}">${escapeHtml(viewModel.title)}</span>
      <strong class="${escapeHtml(config.classNames.crateValue)}">${escapeHtml(viewModel.valueText)}</strong>
      <span class="${escapeHtml(config.classNames.crateMeta)}">${escapeHtml(viewModel.metaText)}</span>
    </span>
  `;

  return button;
}

/**
 * Renders the full crate grid for the current bonus state.
 * @param {HTMLElement} crateContainer
 * @param {BonusRoundState} bonusState
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {void}
 */
function renderBonusCrates(crateContainer, bonusState, config = BONUS_UI_CONFIG) {
  crateContainer.innerHTML = "";

  bonusState.prizes.forEach((prize, index) => {
    crateContainer.appendChild(createBonusCrateButton(prize, index, bonusState, config));
  });
}

/**
 * Toggles a configured visual state class on a crate button.
 * @param {Element | null} target
 * @param {string} stateKey
 * @param {boolean} isActive
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {void}
 */
function toggleBonusCrateInteractionState(target, stateKey, isActive, config = BONUS_UI_CONFIG) {
  const button = target && typeof target.closest === "function" ? target.closest(config.selectors.crateButton) : null;

  if (!button || button.disabled) {
    return;
  }

  button.classList.toggle(getBonusCrateStateClass(stateKey, config), isActive);
}

/**
 * Handles pointer hover state for crate buttons.
 * @param {PointerEvent} event
 * @param {boolean} isActive
 * @returns {void}
 */
function handleBonusCratePointerState(event, isActive) {
  toggleBonusCrateInteractionState(event.target, BONUS_CRATE_STATE_KEYS.hover, isActive);
}

/**
 * Handles keyboard focus state for crate buttons.
 * @param {FocusEvent} event
 * @param {boolean} isActive
 * @returns {void}
 */
function handleBonusCrateFocusState(event, isActive) {
  toggleBonusCrateInteractionState(event.target, BONUS_CRATE_STATE_KEYS.focus, isActive);
}

/**
 * Clamps an audio volume value into the supported range.
 * @param {number | string} value
 * @param {typeof AUDIO_SETTINGS_CONFIG} [config]
 * @returns {number}
 */
function clampVolume(value, config = AUDIO_SETTINGS_CONFIG) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return config.defaultVolume;
  }

  return Math.min(config.maxVolume, Math.max(config.minVolume, Number(numericValue.toFixed(2))));
}

/**
 * Creates the default persisted audio settings shape.
 * @param {typeof AUDIO_SETTINGS_CONFIG} [config]
 * @returns {AudioSettings}
 */
function createDefaultAudioSettings(config = AUDIO_SETTINGS_CONFIG) {
  const defaultVolume = clampVolume(config.defaultVolume, config);

  return {
    volume: defaultVolume,
    isMuted: false,
    previousVolume: defaultVolume
  };
}

/**
 * Normalizes stored or external audio settings into a safe shape.
 * @param {Partial<AudioSettings> | null | undefined} value
 * @param {typeof AUDIO_SETTINGS_CONFIG} [config]
 * @returns {AudioSettings}
 */
function sanitizeAudioSettings(value, config = AUDIO_SETTINGS_CONFIG) {
  const defaults = createDefaultAudioSettings(config);

  if (!value || typeof value !== "object") {
    return defaults;
  }

  const volume = clampVolume(value.volume, config);
  const previousVolumeCandidate = clampVolume(value.previousVolume, config);
  const isMuted = Boolean(value.isMuted);
  const previousVolume = previousVolumeCandidate > config.minVolume
    ? previousVolumeCandidate
    : (volume > config.minVolume ? volume : defaults.previousVolume);

  return {
    volume: isMuted ? config.minVolume : volume,
    isMuted,
    previousVolume
  };
}

/**
 * Loads the saved audio settings preference.
 * @param {typeof AUDIO_SETTINGS_CONFIG} [config]
 * @returns {AudioSettings}
 */
function loadAudioSettings(config = AUDIO_SETTINGS_CONFIG) {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEYS.audioSettings);

    if (!rawValue) {
      return createDefaultAudioSettings(config);
    }

    return sanitizeAudioSettings(JSON.parse(rawValue), config);
  } catch (_error) {
    return createDefaultAudioSettings(config);
  }
}

/**
 * Saves the current audio settings preference.
 * @param {AudioSettings} audioSettings
 * @param {typeof AUDIO_SETTINGS_CONFIG} [config]
 */
function saveAudioSettings(audioSettings, config = AUDIO_SETTINGS_CONFIG) {
  try {
    window.localStorage.setItem(
      STORAGE_KEYS.audioSettings,
      JSON.stringify(sanitizeAudioSettings(audioSettings, config))
    );
  } catch (_error) {
    // Ignore storage failures so gameplay continues normally.
  }
}

/**
 * Checks whether a spin speed mode is supported.
 * @param {string} value
 * @returns {value is SpinSpeedMode}
 */
function isValidSpinSpeedMode(value) {
  return Object.prototype.hasOwnProperty.call(SPIN_SPEED_CONFIG.modes, value);
}

/**
 * Reads the saved spin speed preference.
 * @returns {SpinSpeedMode}
 */
function loadSpinSpeedPreference() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEYS.spinSpeed);
    return isValidSpinSpeedMode(value) ? value : SPIN_SPEED_CONFIG.defaultMode;
  } catch (_error) {
    return SPIN_SPEED_CONFIG.defaultMode;
  }
}

/**
 * Saves the spin speed preference.
 * @param {SpinSpeedMode} value
 */
function saveSpinSpeedPreference(value) {
  try {
    window.localStorage.setItem(
      STORAGE_KEYS.spinSpeed,
      isValidSpinSpeedMode(value) ? value : SPIN_SPEED_CONFIG.defaultMode
    );
  } catch (_error) {
    // Ignore storage failures so gameplay continues normally.
  }
}

/**
 * Returns the active timing config for the selected spin speed.
 * @param {SpinSpeedMode} spinSpeed
 * @returns {{spinStripIntervalMs: number, reelStopBaseMs: number, reelStopStepMs: number}}
 */
function getSpinTiming(spinSpeed) {
  return SPIN_SPEED_CONFIG.modes[isValidSpinSpeedMode(spinSpeed) ? spinSpeed : SPIN_SPEED_CONFIG.defaultMode];
}

/**
 * Returns the currently effective output volume.
 * @param {AudioSettings} audioSettings
 * @param {typeof AUDIO_SETTINGS_CONFIG} [config]
 * @returns {number}
 */
function getEffectiveVolume(audioSettings, config = AUDIO_SETTINGS_CONFIG) {
  const safeSettings = sanitizeAudioSettings(audioSettings, config);
  return safeSettings.isMuted ? config.minVolume : safeSettings.volume;
}

/**
 * Creates the next audio settings after a direct volume change.
 * @param {AudioSettings} audioSettings
 * @param {number | string} nextVolume
 * @param {typeof AUDIO_SETTINGS_CONFIG} [config]
 * @returns {AudioSettings}
 */
function setAudioVolumeState(audioSettings, nextVolume, config = AUDIO_SETTINGS_CONFIG) {
  const currentSettings = sanitizeAudioSettings(audioSettings, config);
  const volume = clampVolume(nextVolume, config);

  if (volume <= config.minVolume) {
    return {
      volume: config.minVolume,
      isMuted: true,
      previousVolume: currentSettings.volume > config.minVolume
        ? currentSettings.volume
        : currentSettings.previousVolume
    };
  }

  return {
    volume,
    isMuted: false,
    previousVolume: volume
  };
}

/**
 * Creates the next audio settings after toggling mute.
 * @param {AudioSettings} audioSettings
 * @param {typeof AUDIO_SETTINGS_CONFIG} [config]
 * @returns {AudioSettings}
 */
function toggleAudioMuteState(audioSettings, config = AUDIO_SETTINGS_CONFIG) {
  const currentSettings = sanitizeAudioSettings(audioSettings, config);

  if (currentSettings.isMuted || currentSettings.volume <= config.minVolume) {
    const restoredVolume = currentSettings.previousVolume > config.minVolume
      ? currentSettings.previousVolume
      : createDefaultAudioSettings(config).volume;

    return {
      volume: restoredVolume,
      isMuted: false,
      previousVolume: restoredVolume
    };
  }

  return {
    volume: config.minVolume,
    isMuted: true,
    previousVolume: currentSettings.volume
  };
}

/**
 * Converts a normalized volume value to the slider's integer scale.
 * @param {number} volume
 * @param {typeof AUDIO_SETTINGS_CONFIG} [config]
 * @returns {string}
 */
function volumeToSliderValue(volume, config = AUDIO_SETTINGS_CONFIG) {
  return String(Math.round(clampVolume(volume, config) * config.sliderScale));
}

/**
 * Converts a slider value back to the normalized volume range.
 * @param {number | string} sliderValue
 * @param {typeof AUDIO_SETTINGS_CONFIG} [config]
 * @returns {number}
 */
function sliderValueToVolume(sliderValue, config = AUDIO_SETTINGS_CONFIG) {
  return clampVolume(Number(sliderValue) / config.sliderScale, config);
}

/**
 * Resolves the visual mute button state for the current volume level.
 * @param {AudioSettings} audioSettings
 * @param {typeof AUDIO_SETTINGS_CONFIG} [config]
 * @returns {"muted" | "low" | "high"}
 */
function getVolumeButtonState(audioSettings, config = AUDIO_SETTINGS_CONFIG) {
  const effectiveVolume = getEffectiveVolume(audioSettings, config);

  if (effectiveVolume <= config.minVolume) {
    return "muted";
  }

  return effectiveVolume < config.lowVolumeThreshold ? "low" : "high";
}

/**
 * Synchronizes settings controls with the current in-memory state.
 * @param {Document} [root]
 * @returns {boolean}
 */
function renderSettingsControls(root = (typeof document !== "undefined" ? document : null)) {
  if (!root || typeof root.getElementById !== "function") {
    return false;
  }

  Object.entries(SPIN_SPEED_CONFIG.buttonIds).forEach(([mode, buttonId]) => {
    const button = root.getElementById(buttonId);

    if (button) {
      button.setAttribute("aria-pressed", String(state.spinSpeed === mode));
    }
  });

  const volumeSlider = root.getElementById(AUDIO_SETTINGS_CONFIG.sliderId);
  const volumeMuteButton = root.getElementById(AUDIO_SETTINGS_CONFIG.muteButtonId);

  if (!volumeSlider || !volumeMuteButton) {
    return false;
  }

  volumeSlider.value = volumeToSliderValue(getEffectiveVolume(state.audioSettings));
  volumeMuteButton.dataset.volumeState = getVolumeButtonState(state.audioSettings);
  volumeMuteButton.setAttribute("aria-pressed", String(state.audioSettings.isMuted));
  volumeMuteButton.setAttribute(
    "aria-label",
    state.audioSettings.isMuted ? AUDIO_SETTINGS_CONFIG.unmuteLabel : AUDIO_SETTINGS_CONFIG.muteLabel
  );

  return true;
}

/**
 * Applies audio settings to state, persistence, and the settings UI.
 * @param {AudioSettings} nextAudioSettings
 */
function applyAudioSettings(nextAudioSettings) {
  state.audioSettings = sanitizeAudioSettings(nextAudioSettings);
  saveAudioSettings(state.audioSettings);
  renderSettingsControls();
}

/**
 * Handles direct slider volume changes from the settings UI.
 * @param {{target?: {value?: string}}} event
 */
function handleVolumeSliderInput(event) {
  if (!event?.target) {
    return;
  }

  applyAudioSettings(setAudioVolumeState(state.audioSettings, sliderValueToVolume(event.target.value)));
}

/**
 * Handles mute/unmute clicks from the settings UI.
 */
function handleVolumeMuteButtonClick() {
  applyAudioSettings(toggleAudioMuteState(state.audioSettings));
}

/**
 * Applies the selected spin speed mode to state, persistence, and settings UI.
 * @param {SpinSpeedMode} spinSpeed
 */
function applySpinSpeed(spinSpeed) {
  state.spinSpeed = isValidSpinSpeedMode(spinSpeed) ? spinSpeed : SPIN_SPEED_CONFIG.defaultMode;
  saveSpinSpeedPreference(state.spinSpeed);
  renderSettingsControls();
}

/**
 * Handles clicks on the spin speed option buttons.
 * @param {{target?: EventTarget | null}} event
 */
function handleSpinSpeedButtonClick(event) {
  const button = event?.target?.closest?.("[data-spin-speed]") || null;

  if (!button) {
    return;
  }

  applySpinSpeed(button.dataset.spinSpeed);
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
    return sanitizeJackpotPots(parsedValue);
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
 * Evaluates payline wins without applying scatter or bonus logic.
 * @param {string[][]} board
 * @param {number} bet
 * @param {{boardFeatures?: (BoardCellFeature | null)[][], isFreeSpinRound?: boolean}} [options]
 * @returns {{winningCellKeys: Set<string>, activeHorizontalLines: Set<string>, lineWins: LineWin[], totalWin: number, appliedMultiplier: number}}
 */
function evaluatePaylines(board, bet, options = {}) {
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

  return {
    winningCellKeys,
    activeHorizontalLines,
    lineWins,
    totalWin,
    appliedMultiplier
  };
}

/**
 * Evaluates scatter payout and awarded free spins.
 * @param {string[][]} board
 * @param {number} bet
 * @returns {{winningCellKeys: Set<string>, scatterCount: number, freeSpinsAwarded: number, totalWin: number}}
 */
function evaluateScatters(board, bet) {
  const winningCellKeys = new Set();
  const scatterCount = countSymbol(board, SYMBOL_IDS.scatter);
  const scatterPayout = SYMBOL_MAP[SYMBOL_IDS.scatter].payouts[Math.min(scatterCount, GAME_LIMITS.reelCount)] || 0;
  const freeSpinsAwarded = getFreeSpinAward(scatterCount);
  let totalWin = 0;

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
    winningCellKeys,
    scatterCount,
    freeSpinsAwarded,
    totalWin
  };
}

/**
 * Evaluates bonus trigger state from the final board.
 * @param {string[][]} board
 * @returns {{bonusTriggered: boolean}}
 */
function evaluateBonuses(board) {
  return {
    bonusTriggered: countSymbol(board, SYMBOL_IDS.dynamite) >= BONUS_CONFIG.triggerCount
  };
}

/**
 * Converts winning-cell keys back into grid coordinates.
 * @param {Set<string>} winningCellKeys
 * @returns {{reel: number, row: number}[]}
 */
function createWinningCells(winningCellKeys) {
  return Array.from(winningCellKeys).map((key) => {
    const [reel, row] = key.split(":").map(Number);
    return { reel, row };
  });
}

/**
 * Evaluates line wins, scatter wins, and bonus triggers for a board.
 * @param {string[][]} board
 * @param {number} bet
 * @param {{boardFeatures?: (BoardCellFeature | null)[][], isFreeSpinRound?: boolean}} [options]
 * @returns {WinResult}
 */
function evaluateBoard(board, bet, options = {}) {
  const paylineResult = evaluatePaylines(board, bet, options);
  const scatterResult = evaluateScatters(board, bet);
  const bonusResult = evaluateBonuses(board);
  const winningCellKeys = new Set([
    ...paylineResult.winningCellKeys,
    ...scatterResult.winningCellKeys
  ]);

  return {
    totalWin: paylineResult.totalWin + scatterResult.totalWin,
    freeSpinsAwarded: scatterResult.freeSpinsAwarded,
    appliedMultiplier: paylineResult.appliedMultiplier,
    scatterCount: scatterResult.scatterCount,
    bonusTriggered: bonusResult.bonusTriggered,
    winningCells: createWinningCells(winningCellKeys),
    activeHorizontalLines: Array.from(paylineResult.activeHorizontalLines),
    lineWins: paylineResult.lineWins
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
    return JACKPOTS.grand;
  }

  if (isWildHorizontalLine(board, 0) || isWildHorizontalLine(board, 2)) {
    return JACKPOTS.major;
  }

  if (isWildHorizontalLine(board, 1)) {
    return JACKPOTS.mini;
  }

  return null;
}

/**
 * Resolves rare random jackpot hits for paid spins.
 * @returns {"mini" | "major" | null}
 */
function rollRandomJackpotTier() {
  if (randomInteger(JACKPOT_CONFIG.randomOdds.major) === 0) {
    return JACKPOTS.major;
  }

  if (randomInteger(JACKPOT_CONFIG.randomOdds.mini) === 0) {
    return JACKPOTS.mini;
  }

  return null;
}

/**
 * Returns jackpot pots with every tier coerced to a safe numeric value.
 * @param {Partial<Record<"mini" | "major" | "grand", number>> | null | undefined} jackpots
 * @returns {{mini: number, major: number, grand: number}}
 */
function sanitizeJackpotPots(jackpots) {
  const source = jackpots && typeof jackpots === "object" ? jackpots : {};

  return {
    mini: Number.isFinite(source.mini) ? Math.max(JACKPOT_CONFIG.startingValues.mini, source.mini) : JACKPOT_CONFIG.startingValues.mini,
    major: Number.isFinite(source.major) ? Math.max(JACKPOT_CONFIG.startingValues.major, source.major) : JACKPOT_CONFIG.startingValues.major,
    grand: Number.isFinite(source.grand) ? Math.max(JACKPOT_CONFIG.startingValues.grand, source.grand) : JACKPOT_CONFIG.startingValues.grand
  };
}

/**
 * Computes the jackpot contribution for a single tier.
 * @param {number} bet
 * @param {"mini" | "major" | "grand"} tier
 * @returns {number}
 */
function getJackpotContribution(bet, tier) {
  const numericBet = Number(bet);

  if (!Number.isFinite(numericBet) || numericBet <= 0 || !Number.isFinite(JACKPOT_CONFIG.contributionRates[tier])) {
    return 0;
  }

  return Math.max(JACKPOT_CONFIG.minimumContribution, Math.round(numericBet * JACKPOT_CONFIG.contributionRates[tier]));
}

/**
 * Applies per-spin contributions to progressive jackpots.
 * @param {number} bet
 * @returns {boolean}
 */
function contributeToJackpots(bet) {
  const contributions = {
    mini: getJackpotContribution(bet, JACKPOTS.mini),
    major: getJackpotContribution(bet, JACKPOTS.major),
    grand: getJackpotContribution(bet, JACKPOTS.grand)
  };

  state.jackpots = sanitizeJackpotPots(state.jackpots);

  if (Object.values(contributions).every((amount) => amount === 0)) {
    saveJackpotPots(state.jackpots);
    return false;
  }

  state.jackpots.mini += contributions.mini;
  state.jackpots.major += contributions.major;
  state.jackpots.grand += contributions.grand;
  saveJackpotPots(state.jackpots);
  return true;
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
 * Updates text displays, settings controls, and disabled states.
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

  renderSettingsControls();
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
  const masterVolume = getEffectiveVolume(state.audioSettings);

  if (!context || masterVolume <= AUDIO_SETTINGS_CONFIG.minVolume) {
    return;
  }

  try {
    const now = context.currentTime;

    if (type === AUDIO_CUES.spin) {
      for (let step = 0; step < 8; step += 1) {
        playTone(context, now + step * 0.055, 0.075, 210 + step * 18, 120 + step * 10, "sawtooth", 0.028 * masterVolume);
      }
      return;
    }

    if (type === AUDIO_CUES.reelStop) {
      playTone(context, now, 0.07, 330, 180, "square", 0.035 * masterVolume);
      return;
    }

    if (type === AUDIO_CUES.bigWin) {
      [392, 523, 659, 784, 988, 1319].forEach((frequency, index) => {
        playTone(context, now + index * 0.08, 0.2, frequency, frequency * 1.28, "sawtooth", 0.065 * masterVolume);
      });
      playTone(context, now, 0.62, 164, 392, "triangle", 0.045 * masterVolume);
      playTone(context, now + 0.16, 0.54, 246, 523, "square", 0.03 * masterVolume);
      return;
    }

    if (type === AUDIO_CUES.jackpot) {
      [523, 659, 784, 1047, 1319].forEach((frequency, index) => {
        playTone(context, now + index * 0.095, 0.18, frequency, frequency * 1.18, "triangle", 0.07 * masterVolume);
      });
      playTone(context, now + 0.08, 0.5, 196, 392, "sine", 0.035 * masterVolume);
      return;
    }

    [523, 659, 784].forEach((frequency, index) => {
      playTone(context, now + index * 0.09, 0.16, frequency, frequency * 1.08, "triangle", 0.06 * masterVolume);
    });
  } catch (error) {
    console.warn(UI_TEXT.warnings.audioPlaybackFailed, error);
  }
}

/**
 * Sets the main game message.
 * @param {string} text
 * @param {boolean} isBigWin
 */
function setMessage(text, isBigWin = false) {
  const message = document.getElementById("statusMessage");
  if (!message) {
    return;
  }

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

  if (!popup || !popupLabel || !popupAmount) {
    return;
  }

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
  }, FEEDBACK_CONFIG.winPopupDurationMs);
}

/**
 * Hides any active win popup.
 */
function hideWinPopup() {
  const popup = document.getElementById("winPopup");

  window.clearTimeout(popupTimeout);
  if (!popup) {
    return;
  }

  popup.classList.remove("show", "jackpot", "big-win");
  popup.setAttribute("aria-hidden", "true");
}

/**
 * Clears the active celebration visuals for the provided overlay.
 * @param {string} overlayId
 */
function clearCelebration(overlayId) {
  const celebration = document.getElementById(overlayId);
  if (!celebration) {
    return;
  }

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
  if (!celebration) {
    return;
  }

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
  setMessage(UI_TEXT.messages.bigWin, true);
  showWinPopup(UI_TEXT.messages.bigWin, amount, "big-win");
  playSound(SOUNDS.bigWin);
  populateCoinBurst(celebration, FEEDBACK_CONFIG.bigWinCelebrationCoins);
  if (!celebration) {
    return;
  }

  celebration.classList.add("show");
  celebration.setAttribute("aria-hidden", "false");
  bigWinTimeout = window.setTimeout(clearBigWinCelebration, FEEDBACK_CONFIG.bigWinCelebrationDurationMs);
}

/**
 * Triggers jackpot-specific celebration visuals.
 * @param {"mini" | "major" | "grand"} tier
 * @param {number} amount
 */
function triggerJackpotFeedback(tier, amount) {
  const celebration = document.getElementById("jackpotCelebration");

  if (!celebration) {
    return;
  }

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
  setMessage(`${tier.toUpperCase()} ${UI_TEXT.messages.jackpotPaidSuffix}`, true);
  showWinPopup(`${tier.toUpperCase()} Jackpot`, amount, "jackpot");
  playSound(SOUNDS.jackpot);
  bigWinTimeout = window.setTimeout(clearBigWinCelebration, FEEDBACK_CONFIG.jackpotCelebrationDurationMs);
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
    { type: BONUS_REWARD_TYPES.coins, label: BONUS_CONFIG.labels.coinsSmall, value: coinValue(BONUS_CONFIG.values.coinsSmallMultiplier) },
    { type: BONUS_REWARD_TYPES.coins, label: BONUS_CONFIG.labels.coinsMedium, value: coinValue(BONUS_CONFIG.values.coinsMediumMultiplier) },
    { type: BONUS_REWARD_TYPES.coins, label: BONUS_CONFIG.labels.coinsLarge, value: coinValue(BONUS_CONFIG.values.coinsLargeMultiplier) },
    { type: BONUS_REWARD_TYPES.multiplier, label: BONUS_CONFIG.labels.multiplier, value: BONUS_CONFIG.values.bonusMultiplier },
    { type: BONUS_REWARD_TYPES.freeSpins, label: BONUS_CONFIG.labels.freeSpins, value: BONUS_CONFIG.values.bonusFreeSpins },
    { type: BONUS_REWARD_TYPES.collect, label: BONUS_CONFIG.labels.collect, value: 0 }
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
 * Registers an event listener and remembers how to remove it during teardown.
 * @param {EventTarget | null | undefined} target
 * @param {string} type
 * @param {EventListenerOrEventListenerObject} handler
 * @param {AddEventListenerOptions | boolean} [options]
 * @returns {() => void}
 */
function addManagedEventListener(target, type, handler, options) {
  if (!target || typeof target.addEventListener !== "function" || typeof target.removeEventListener !== "function") {
    return () => {};
  }

  target.addEventListener(type, handler, options);

  let isRemoved = false;
  const cleanup = () => {
    if (isRemoved) {
      return;
    }

    target.removeEventListener(type, handler, options);
    isRemoved = true;
  };

  managedEventCleanups.push(cleanup);
  return cleanup;
}

/**
 * Removes every managed listener currently registered by the game.
 * @returns {void}
 */
function removeManagedEventListeners() {
  while (managedEventCleanups.length > 0) {
    const cleanup = managedEventCleanups.pop();
    cleanup();
  }
}

/**
 * Checks whether an element can receive focus in a modal trap.
 * @param {Element | null} element
 * @returns {element is HTMLElement}
 */
function isFocusableElement(element) {
  return Boolean(
    element
    && typeof element.focus === "function"
    && !element.hasAttribute("disabled")
    && element.getAttribute("aria-hidden") !== "true"
  );
}

/**
 * Returns visible focus targets inside a modal container.
 * @param {HTMLElement} container
 * @param {typeof FOCUS_TRAP_CONFIG} [config]
 * @returns {HTMLElement[]}
 */
function getFocusableElements(container, config = FOCUS_TRAP_CONFIG) {
  if (!container || typeof container.querySelectorAll !== "function") {
    return [];
  }

  return Array.from(container.querySelectorAll(config.focusableSelector)).filter(isFocusableElement);
}

/**
 * Applies or removes background interaction blocking while a modal is open.
 * @param {boolean} isBlocked
 * @param {typeof FOCUS_TRAP_CONFIG} [config]
 * @returns {void}
 */
function setBackgroundInteractionBlocked(isBlocked, config = FOCUS_TRAP_CONFIG) {
  if (typeof document === "undefined") {
    return;
  }

  const blockedElement = document.querySelector(config.blockedElementSelector);
  if (!blockedElement) {
    return;
  }

  if (isBlocked) {
    blockedElement.setAttribute("aria-hidden", "true");
    blockedElement.inert = true;
    return;
  }

  blockedElement.removeAttribute("aria-hidden");
  blockedElement.inert = false;
}

/**
 * Moves focus back inside the active modal if the browser tries to escape it.
 * @returns {void}
 */
function focusFirstModalElement() {
  if (!activeFocusTrap) {
    return;
  }

  const focusableElements = getFocusableElements(activeFocusTrap.panel);
  const nextElement = focusableElements[0] || activeFocusTrap.panel;

  if (isFocusableElement(nextElement)) {
    nextElement.focus();
  }
}

/**
 * Keeps Tab and Shift+Tab navigation inside the active modal overlay.
 * @param {KeyboardEvent} event
 * @returns {void}
 */
function handleFocusTrapKeydown(event) {
  if (!activeFocusTrap || event.key !== "Tab") {
    return;
  }

  const focusableElements = getFocusableElements(activeFocusTrap.panel);

  if (focusableElements.length === 0) {
    event.preventDefault();
    activeFocusTrap.panel.focus();
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  const activeElement = document.activeElement;
  const isOutsideTrap = !activeFocusTrap.panel.contains(activeElement);

  if (event.shiftKey && (activeElement === firstElement || isOutsideTrap)) {
    event.preventDefault();
    lastElement.focus();
    return;
  }

  if (!event.shiftKey && (activeElement === lastElement || isOutsideTrap)) {
    event.preventDefault();
    firstElement.focus();
  }
}

/**
 * Redirects focus back into the active modal if background content is targeted.
 * @param {FocusEvent} event
 * @returns {void}
 */
function handleFocusTrapFocusIn(event) {
  if (!activeFocusTrap || activeFocusTrap.panel.contains(event.target)) {
    return;
  }

  focusFirstModalElement();
}

/**
 * Starts focus trapping for an overlay and blocks background controls.
 * @param {HTMLElement} overlay
 * @param {HTMLElement} panel
 * @returns {void}
 */
function activateFocusTrap(overlay, panel) {
  if (!overlay || !panel || activeFocusTrap?.overlay === overlay) {
    return;
  }

  deactivateFocusTrap();

  const previousFocus = isFocusableElement(document.activeElement) ? document.activeElement : null;
  panel.setAttribute("tabindex", "-1");
  setBackgroundInteractionBlocked(true);

  const cleanupKeydown = addManagedEventListener(overlay, "keydown", handleFocusTrapKeydown);
  const cleanupFocusIn = addManagedEventListener(document, "focusin", handleFocusTrapFocusIn);

  activeFocusTrap = {
    overlay,
    panel,
    previousFocus,
    cleanup: () => {
      cleanupKeydown();
      cleanupFocusIn();
    }
  };

  window.requestAnimationFrame(focusFirstModalElement);
}

/**
 * Stops any active modal focus trap and restores background interaction.
 * @returns {void}
 */
function deactivateFocusTrap() {
  if (!activeFocusTrap) {
    setBackgroundInteractionBlocked(false);
    return;
  }

  const focusTrap = activeFocusTrap;
  activeFocusTrap = null;
  focusTrap.cleanup();
  setBackgroundInteractionBlocked(false);

  if (isFocusableElement(focusTrap.previousFocus)) {
    focusTrap.previousFocus.focus();
  }
}

/**
 * Opens or closes the settings overlay.
 * @param {boolean} isOpen
 */
function setSettingsOpen(isOpen) {
  const overlay = document.getElementById("settingsOverlay");
  const panel = overlay ? overlay.querySelector("[role='dialog']") : null;

  if (!overlay || !panel) {
    return;
  }

  overlay.classList.toggle("show", isOpen);
  overlay.setAttribute("aria-hidden", String(!isOpen));

  if (isOpen) {
    activateFocusTrap(overlay, panel);
    return;
  }

  if (activeFocusTrap?.overlay === overlay) {
    deactivateFocusTrap();
  }
}

/**
 * Opens or closes the bonus overlay.
 * @param {boolean} isOpen
 * @returns {void}
 */
function setBonusOpen(isOpen) {
  const bonusElements = getBonusRoundElements();

  if (!bonusElements) {
    return;
  }

  const { overlay, crates } = bonusElements;
  overlay.classList.toggle(BONUS_UI_CONFIG.classNames.overlayVisible, isOpen);
  overlay.setAttribute("aria-hidden", String(!isOpen));

  if (isOpen) {
    syncBonusModalLayout(bonusElements);
    crates.scrollTop = 0;
    activateFocusTrap(overlay, bonusElements.panel);
    return;
  }

  if (activeFocusTrap?.overlay === overlay) {
    deactivateFocusTrap();
  }
}

/**
 * Renders bonus-round status and crate state.
 * @returns {void}
 */
function renderBonusRound() {
  const bonusState = state.bonusRound;

  if (!isValidBonusRoundState(bonusState)) {
    return;
  }

  const bonusElements = getBonusRoundElements();

  if (!bonusElements) {
    return;
  }

  syncBonusModalLayout(bonusElements);
  renderBonusStatus(bonusElements.status, bonusState);
  renderBonusCrates(bonusElements.crates, bonusState);
}

/**
 * Starts the pick-a-crate bonus round.
 * @returns {void}
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

  setMessage(UI_TEXT.messages.pickCrate);
  setBonusOpen(true);
  renderBonusRound();
  updateDisplays();
}

/**
 * Finalizes the bonus round and applies its rewards.
 * @returns {void}
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
  setMessage(`${UI_TEXT.messages.bonusWinPrefix} ${bonusState.totalCoins}${freeSpinText}`);
  showWinPopup(`Bonus Win x${bonusState.bonusMultiplier}`, bonusState.totalCoins);
  updateDisplays();

  if (bonusState.freeSpinsAwarded > 0) {
    showFreeSpinRewardFeedback(bonusState.freeSpinsAwarded, "bonus-round");
  }
}

/**
 * Applies a selected crate prize to the active bonus round.
 * @param {number} crateIndex
 * @returns {void}
 */
function resolveBonusPick(crateIndex) {
  const bonusState = state.bonusRound;
  if (!bonusState || !bonusState.prizes[crateIndex]) {
    return;
  }

  const prize = bonusState.prizes[crateIndex];
  const crateButtons = Array.from(document.querySelectorAll(BONUS_UI_CONFIG.selectors.crateButton));
  const button = crateButtons[crateIndex];

  if (!button || button.disabled || bonusState.revealedCrates[crateIndex]) {
    return;
  }

  if (!Object.values(BONUS_REWARD_TYPES).includes(prize.type)) {
    console.warn(`${UI_TEXT.warnings.unknownBonusPrizeType}: ${prize.type}`, prize);
    return;
  }

  bonusState.revealedCrates[crateIndex] = true;
  button.disabled = true;
  button.className = getBonusCrateStateClasses({ isSelected: true, isRevealed: true, isDisabled: true });
  button.setAttribute("aria-pressed", "true");

  if (prize.type === BONUS_REWARD_TYPES.coins) {
    bonusState.totalCoins += prize.value * bonusState.bonusMultiplier;
    bonusState.picksMade += 1;
  } else if (prize.type === BONUS_REWARD_TYPES.multiplier) {
    bonusState.bonusMultiplier *= prize.value;
    bonusState.picksMade += 1;
  } else if (prize.type === BONUS_REWARD_TYPES.freeSpins) {
    bonusState.freeSpinsAwarded += prize.value;
    bonusState.picksMade += 1;
  } else if (prize.type === BONUS_REWARD_TYPES.collect) {
    // Collect intentionally ends the round without changing totals.
  } else {
    return;
  }

  const shouldFinish = prize.type === BONUS_REWARD_TYPES.collect || bonusState.picksMade >= BONUS_CONFIG.maxPicks;
  const resultMessage = prize.type === BONUS_REWARD_TYPES.collect ? UI_TEXT.messages.bonusCollected : `Revealed ${prize.label}`;
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

  if (result.totalWin >= state.bet * FEEDBACK_CONFIG.bigWinThresholdBetMultiplier) {
    triggerBigWinFeedback(result.totalWin);
  } else if (result.totalWin > 0) {
    setMessage(getStatusMessage(result));
    showWinPopup(getWinLabel(result), result.totalWin);
    playSound(SOUNDS.win);
  } else if (result.freeSpinsAwarded > 0) {
    setMessage(getStatusMessage(result));
  } else {
    setMessage(UI_TEXT.messages.noWin);
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
 * Clears interval and timeout handles for an active spin object.
 * @param {{intervals?: number[], timeouts?: number[], reels?: Element[]} | null} spinRecord
 * @returns {void}
 */
function clearActiveSpinTimers(spinRecord) {
  if (!spinRecord) {
    return;
  }

  if (typeof window === "undefined") {
    return;
  }

  if (Array.isArray(spinRecord.intervals)) {
    spinRecord.intervals.forEach((intervalId) => window.clearInterval(intervalId));
    spinRecord.intervals.length = 0;
  }

  if (Array.isArray(spinRecord.timeouts)) {
    spinRecord.timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    spinRecord.timeouts.length = 0;
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

  clearActiveSpinTimers(spinToFinish);
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
      playSound(SOUNDS.reelStop);
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
  const spinTiming = getSpinTiming(state.spinSpeed);

  if (state.isSpinning || state.isBonusActive || (!usedFreeSpin && state.balance < state.bet)) {
    return;
  }

  state.isSpinning = true;
  clearWinHighlights();
  clearNearMissVisuals();
  hideWinPopup();
  clearBigWinCelebration();
  setMessage(usedFreeSpin ? `Free spin rolling (x${FREE_SPIN_CONFIG.multiplier})` : UI_TEXT.messages.reelsSpinning);

  if (usedFreeSpin) {
    state.freeSpins -= 1;
  } else {
    state.balance -= state.bet;
    contributeToJackpots(state.bet);
  }

  updateDisplays();
  playSound(SOUNDS.spin);

  const nextBoard = createBoard();
  const nextBoardFeatures = createBoardFeatureGrid(nextBoard);
  const nextResult = evaluateBoard(nextBoard, state.bet, { boardFeatures: nextBoardFeatures, isFreeSpinRound: usedFreeSpin });
  const jackpotTier = usedFreeSpin ? null : determineJackpotTier(nextBoard) || rollRandomJackpotTier();
  const nearMissPlan = selectNearMissPlan(nextBoard, nextResult, {
    usedFreeSpin,
    fastPlayEnabled: state.spinSpeed === "skip",
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
    spinTiming,
    reels,
    intervals,
    timeouts
  };

  if (state.spinSpeed === "skip") {
    finishActiveSpin();
    return;
  }

  reels.forEach((reelElement, reelIndex) => {
    const interval = window.setInterval(() => renderSpinStrip(reelElement, reelIndex), spinTiming.spinStripIntervalMs);
    let stopDelay = spinTiming.reelStopBaseMs + reelIndex * spinTiming.reelStopStepMs;

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
      playSound(SOUNDS.reelStop);
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
    console.warn(UI_TEXT.warnings.keyboardSpinActivationFailed, error);
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

  triggerBigWinFeedback(state.bet * FEEDBACK_CONFIG.bigWinThresholdBetMultiplier);
}

/**
 * Adds keyboard shortcuts and returns the matching cleanup function.
 * @param {Document} eventTarget
 * @returns {() => void}
 */
function wireKeyboardShortcuts(eventTarget = document) {
  return addManagedEventListener(eventTarget, "keydown", handleDocumentKeydown);
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
    addManagedEventListener(window, "pagehide", cleanupKeyboardShortcuts);
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
 * Tears down timers, listeners, and transient overlay state without resetting saved gameplay state.
 * @returns {void}
 */
function destroyGame() {
  clearActiveSpinTimers(activeSpin);
  activeSpin = null;
  state.isSpinning = false;

  if (typeof window !== "undefined") {
    window.clearTimeout(popupTimeout);
    window.clearTimeout(bigWinTimeout);
    window.clearTimeout(rewardFeedbackTimeout);
  }

  popupTimeout = 0;
  bigWinTimeout = 0;
  rewardFeedbackTimeout = 0;

  cleanupKeyboardShortcuts();
  deactivateFocusTrap();
  removeManagedEventListeners();
  setBackgroundInteractionBlocked(false);

  isGameInitialized = false;
  pagehideCleanupRegistered = false;
}

/**
 * Wires UI events once the document is ready.
 * @returns {void}
 */
function initializeGame() {
  try {
    if (isGameInitialized) {
      return;
    }

    isGameInitialized = true;
    state.spinSpeed = loadSpinSpeedPreference();
    state.audioSettings = loadAudioSettings();
    state.jackpots = loadJackpotPots();
    const dailyReward = grantDailyLoginReward();
    renderBoard(state.board, state.boardFeatures);
    updateDisplays();
    addManagedEventListener(document.getElementById("spinButton"), "click", handleSpinButtonClick);
    addManagedEventListener(document.getElementById("decreaseBetButton"), "click", () => changeBet(-1));
    addManagedEventListener(document.getElementById("increaseBetButton"), "click", () => changeBet(1));
    addManagedEventListener(document.getElementById("settingsButton"), "click", () => {
      const overlay = document.getElementById("settingsOverlay");
      if (!overlay) {
        return;
      }

      setSettingsOpen(overlay.getAttribute("aria-hidden") === "true");
    });
    addManagedEventListener(document.getElementById("settingsOverlay"), "click", (event) => {
      if (event?.target?.id === "settingsOverlay") {
        setSettingsOpen(false);
      }
    });

    const speedOptions = document.querySelector(".settings-speed-options");
    if (speedOptions) {
      addManagedEventListener(speedOptions, "click", handleSpinSpeedButtonClick);
    }

    const volumeSlider = document.getElementById(AUDIO_SETTINGS_CONFIG.sliderId);
    const volumeMuteButton = document.getElementById(AUDIO_SETTINGS_CONFIG.muteButtonId);

    if (volumeSlider) {
      addManagedEventListener(volumeSlider, "input", handleVolumeSliderInput);
    }

    if (volumeMuteButton) {
      addManagedEventListener(volumeMuteButton, "click", handleVolumeMuteButtonClick);
    }

    const bonusCrates = document.getElementById(BONUS_UI_CONFIG.elementIds.crates);
    if (bonusCrates) {
      addManagedEventListener(bonusCrates, BONUS_UI_CONFIG.events.click, (event) => {
        const button = event?.target?.closest?.(BONUS_UI_CONFIG.selectors.crateButton) || null;
        if (!button) {
          return;
        }

        resolveBonusPick(Number(button.dataset.crateIndex));
      });
      addManagedEventListener(bonusCrates, BONUS_UI_CONFIG.events.pointerOver, (event) => handleBonusCratePointerState(event, true));
      addManagedEventListener(bonusCrates, BONUS_UI_CONFIG.events.pointerOut, (event) => handleBonusCratePointerState(event, false));
      addManagedEventListener(bonusCrates, BONUS_UI_CONFIG.events.focusIn, (event) => handleBonusCrateFocusState(event, true));
      addManagedEventListener(bonusCrates, BONUS_UI_CONFIG.events.focusOut, (event) => handleBonusCrateFocusState(event, false));
    }
    mountKeyboardShortcuts();

    if (dailyReward) {
      showRewardFeedback(dailyReward);
    }
  } catch (error) {
    isGameInitialized = false;
    console.error(UI_TEXT.warnings.initializeFailed, error);
    setMessage("Game setup failed. Refresh to retry.");
  }
}

if (typeof document !== "undefined") {
  addManagedEventListener(document, "DOMContentLoaded", initializeGame);
  addManagedEventListener(window, "resize", () => {
    syncBonusModalLayout();
  });
}

if (typeof module !== "undefined") {
  module.exports = {
    AUDIO_SETTINGS_CONFIG,
    BONUS_CRATE_STATE_KEYS,
    BONUS_CONFIG,
    BONUS_MODAL_LAYOUT_CONFIG,
    BONUS_UI_CONFIG,
    FEEDBACK_CONFIG,
    FOCUS_TRAP_CONFIG,
    FREE_SPIN_CONFIG,
    GAME_LIMITS,
    JACKPOTS,
    JACKPOT_CONFIG,
    KEYBOARD_CONFIG,
    RETENTION_CONFIG,
    STORAGE_KEYS,
    SPIN_SPEED_CONFIG,
    MULTIPLIER_CONFIG,
    NEAR_MISS_CONFIG,
    BADGE_ART_CONFIG,
    CACTUS_ART_CONFIG,
    COWBOY_ART_CONFIG,
    SYMBOL_IDS,
    BONUS_REWARD_TYPES,
    AUDIO_CUES,
    SOUNDS,
    UI_TEXT,
    PAYLINES,
    PAYLINE_RENDER_CONFIG,
    SYMBOL_ART_CONFIG,
    SYMBOLS,
    state,
    applyRewardToState,
    applySpinSpeed,
    clampBet,
    clampVolume,
    countSymbol,
    createDateKey,
    createBoardFeatureGrid,
    createBonusCrateViewModel,
    createBonusModalLayoutState,
    createBonusStatusViewModel,
    createBonusPrizes,
    createBootsSymbolArt,
    createCactusSymbolArt,
    createCowboySymbolArt,
    createDefaultAudioSettings,
    createEmptyFeatureGrid,
    createMatchedPositions,
    createNearMissPlanForPattern,
    createRewardFeedbackContent,
    createBonusIconMarkup,
    createWinningCells,
    createDynamiteSymbolArt,
    createInlineSymbolSvg,
    createSymbolArtContent,
    createWildSymbolArt,
    determineJackpotTier,
    destroyGame,
    escapeHtml,
    evaluateBonuses,
    evaluateBoard,
    evaluatePaylines,
    evaluateScatters,
    getEffectiveVolume,
    getBonusCrateStateClass,
    getBonusCrateStateClasses,
    getBonusRewardClassName,
    getBonusRewardIconKey,
    getBonusRewardUiConfig,
    getSpinTiming,
    getSymbolDefinition,
    getSymbolArtAttributes,
    getFreeSpinAward,
    getLeftToRightMatch,
    getLineMultiplier,
    getJackpotContribution,
    getFocusableElements,
    getVolumeButtonState,
    hasContiguousMatchedPositions,
    isNearMissEligible,
    isValidBonusRoundState,
    isKeyboardShortcutBlockedTarget,
    isSpinShortcutEvent,
    isFocusableElement,
    isValidSpinSpeedMode,
    isValidWinPosition,
    isWildHorizontalLine,
    loadSpinSpeedPreference,
    loadAudioSettings,
    loadJackpotPots,
    readStorageValue,
    resolveDailyLoginReward,
    resolveBadgeArtText,
    sanitizeAudioSettings,
    sanitizeJackpotPots,
    saveSpinSpeedPreference,
    saveAudioSettings,
    saveJackpotPots,
    serializeHtmlAttributes,
    selectNearMissPlan,
    setAudioVolumeState,
    sliderValueToVolume,
    syncBonusModalLayout,
    shouldHandleSpinShortcut,
    shouldGrantDailyReward,
    toggleAudioMuteState,
    contributeToJackpots,
    finishActiveSpin,
    validateNearMissConfig,
    volumeToSliderValue
  };
}

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
 * @typedef {Object} AudioSettings
 * @property {number} volume
 * @property {boolean} isMuted
 * @property {number} previousVolume
 */

/**
 * @typedef {"slow" | "normal" | "fast" | "skip"} SpinSpeedMode
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
 * @property {SpinSpeedMode} spinSpeed
 * @property {AudioSettings} audioSettings
 * @property {boolean} isBonusActive
 * @property {BonusRoundState | null} bonusRound
 * @property {{mini: number, major: number, grand: number}} jackpots
 */

/**
 * Shared numeric gameplay limits used across board generation, betting, and rendering.
 */
const GAME_LIMITS = {
  minBet: 10,
  maxBet: 100,
  betStep: 10,
  defaultBalance: 1000,
  reelCount: 5,
  rowCount: 3
};

/**
 * Canonical ids for every symbol used by the slot machine.
 */
const SYMBOL_IDS = {
  badge: "badge",
  boots: "boots",
  cowboy: "cowboy",
  wanted: "wanted",
  cactus: "cactus",
  wild: "wild",
  scatter: "scatter",
  dynamite: "dynamite",
  a: "a",
  k: "k",
  q: "q",
  j: "j",
  ten: "10"
};

/**
 * Display-only symbol metadata that remains stable across probability profiles.
 * @type {{id: string, label: string, className: string}[]}
 */
const SYMBOL_METADATA = Object.freeze([
  { id: SYMBOL_IDS.badge, label: "Sheriff", className: "symbol-badge" },
  { id: SYMBOL_IDS.boots, label: "Boots", className: "symbol-boots" },
  { id: SYMBOL_IDS.cowboy, label: "Cowboy", className: "symbol-cowboy" },
  { id: SYMBOL_IDS.wanted, label: "Wanted", className: "symbol-wanted" },
  { id: SYMBOL_IDS.cactus, label: "Cactus", className: "symbol-cactus" },
  { id: SYMBOL_IDS.wild, label: "Wild", className: "symbol-wild" },
  { id: SYMBOL_IDS.scatter, label: "Scatter", className: "symbol-scatter" },
  { id: SYMBOL_IDS.dynamite, label: "Dynamite", className: "symbol-dynamite" },
  { id: SYMBOL_IDS.a, label: "A", className: "symbol-letter" },
  { id: SYMBOL_IDS.k, label: "K", className: "symbol-letter" },
  { id: SYMBOL_IDS.q, label: "Q", className: "symbol-letter" },
  { id: SYMBOL_IDS.j, label: "J", className: "symbol-letter" },
  { id: SYMBOL_IDS.ten, label: "10", className: "symbol-number" }
]);

/**
 * Config-driven probability profiles used for auditing, simulation, and live tuning.
 */
const PROBABILITY_CONFIG = Object.freeze({
  targetHitFrequency: {
    realisticBaseline: 0.22,
    playerFriendly: 0.25
  },
  targetRTP: {
    realisticBaseline: 0.78,
    playerFriendly: 0.9
  },
  volatilityLevel: "medium",
  tuningMultipliers: {
    playerEdgeFactor: 1.15,
    lowTierWeightBoost: 1.08,
    lowTierPayoutBoost: 1.12,
    featureSuppression: 0.5,
    jackpotSuppression: 0.28
  },
  simulation: {
    defaultSpinCount: 25000,
    defaultBet: GAME_LIMITS.minBet,
    distributionThresholds: {
      small: 2,
      medium: 8,
      large: 20
    }
  },
  profiles: {
    legacy: {
      symbols: {
        [SYMBOL_IDS.badge]: { weight: 10, payouts: { 3: 6, 4: 18, 5: 70 } },
        [SYMBOL_IDS.boots]: { weight: 10, payouts: { 3: 5, 4: 15, 5: 55 } },
        [SYMBOL_IDS.cowboy]: { weight: 10, payouts: { 3: 7, 4: 22, 5: 90 } },
        [SYMBOL_IDS.wanted]: { weight: 9, payouts: { 3: 4, 4: 12, 5: 42 } },
        [SYMBOL_IDS.cactus]: { weight: 9, payouts: { 3: 3, 4: 10, 5: 32 } },
        [SYMBOL_IDS.dynamite]: { weight: 10, payouts: { 3: 4, 4: 14, 5: 46 } },
        [SYMBOL_IDS.scatter]: { weight: 7, payouts: { 3: 2, 4: 8, 5: 35 } },
        [SYMBOL_IDS.wild]: { weight: 9, payouts: { 3: 8, 4: 24, 5: 100 } },
        [SYMBOL_IDS.a]: { weight: 5, payouts: { 3: 2, 4: 6, 5: 18 } },
        [SYMBOL_IDS.k]: { weight: 5, payouts: { 3: 2, 4: 5, 5: 16 } },
        [SYMBOL_IDS.q]: { weight: 5, payouts: { 3: 1, 4: 4, 5: 14 } },
        [SYMBOL_IDS.j]: { weight: 6, payouts: { 3: 1, 4: 3, 5: 12 } },
        [SYMBOL_IDS.ten]: { weight: 6, payouts: { 3: 1, 4: 3, 5: 10 } }
      },
      multiplier: {
        values: [2, 3, 5],
        cap: 25,
        wildChance: 0.4
      },
      freeSpins: {
        multiplier: 2,
        awards: {
          3: 8,
          4: 12,
          5: 20
        }
      },
      jackpot: {
        randomOdds: {
          mini: 120,
          major: 650
        }
      }
    },
    realisticBaseline: {
      symbols: {
        [SYMBOL_IDS.badge]: { weight: 4, payouts: { 3: 1.7, 4: 6, 5: 19.2 } },
        [SYMBOL_IDS.boots]: { weight: 4, payouts: { 3: 1.45, 4: 5, 5: 15.5 } },
        [SYMBOL_IDS.cowboy]: { weight: 3, payouts: { 3: 1.95, 4: 6.9, 5: 21.5 } },
        [SYMBOL_IDS.wanted]: { weight: 6, payouts: { 3: 1.05, 4: 3.35, 5: 10.75 } },
        [SYMBOL_IDS.cactus]: { weight: 6, payouts: { 3: 0.95, 4: 3, 5: 9.55 } },
        [SYMBOL_IDS.dynamite]: { weight: 4, payouts: { 3: 1.05, 4: 3.6, 5: 12 } },
        [SYMBOL_IDS.scatter]: { weight: 1, payouts: { 3: 0.6, 4: 1.9, 5: 7.1 } },
        [SYMBOL_IDS.wild]: { weight: 1, payouts: { 3: 2.4, 4: 8.35, 5: 28.7 } },
        [SYMBOL_IDS.a]: { weight: 16, payouts: { 3: 0.6, 4: 1.55, 5: 4.8 } },
        [SYMBOL_IDS.k]: { weight: 15, payouts: { 3: 0.6, 4: 1.45, 5: 4.55 } },
        [SYMBOL_IDS.q]: { weight: 14, payouts: { 3: 0.45, 4: 1.3, 5: 4.1 } },
        [SYMBOL_IDS.j]: { weight: 13, payouts: { 3: 0.45, 4: 1.2, 5: 3.7 } },
        [SYMBOL_IDS.ten]: { weight: 13, payouts: { 3: 0.45, 4: 1.2, 5: 3.6 } }
      },
      multiplier: {
        values: [2, 3, 5],
        cap: 25,
        wildChance: 0.07
      },
      freeSpins: {
        multiplier: 2,
        awards: {
          3: 4,
          4: 6,
          5: 10
        }
      },
      jackpot: {
        randomOdds: {
          mini: 5200,
          major: 28000
        }
      }
    },
    playerFriendly: {
      symbols: {
        [SYMBOL_IDS.badge]: { weight: 5, payouts: { 3: 2.55, 4: 9.1, 5: 29.4 } },
        [SYMBOL_IDS.boots]: { weight: 5, payouts: { 3: 2.15, 4: 7.55, 5: 23.55 } },
        [SYMBOL_IDS.cowboy]: { weight: 4, payouts: { 3: 2.95, 4: 10.6, 5: 33.2 } },
        [SYMBOL_IDS.wanted]: { weight: 7, payouts: { 3: 1.6, 4: 5.15, 5: 16.35 } },
        [SYMBOL_IDS.cactus]: { weight: 8, payouts: { 3: 1.45, 4: 4.5, 5: 14.35 } },
        [SYMBOL_IDS.dynamite]: { weight: 5, payouts: { 3: 1.6, 4: 5.2, 5: 17.35 } },
        [SYMBOL_IDS.scatter]: { weight: 1, payouts: { 3: 0.9, 4: 2.9, 5: 10.9 } },
        [SYMBOL_IDS.wild]: { weight: 1, payouts: { 3: 3.7, 4: 12.95, 5: 43.65 } },
        [SYMBOL_IDS.a]: { weight: 19, payouts: { 3: 0.9, 4: 2.4, 5: 7.4 } },
        [SYMBOL_IDS.k]: { weight: 18, payouts: { 3: 0.9, 4: 2.25, 5: 7 } },
        [SYMBOL_IDS.q]: { weight: 17, payouts: { 3: 0.75, 4: 2.05, 5: 6.3 } },
        [SYMBOL_IDS.j]: { weight: 16, payouts: { 3: 0.75, 4: 1.9, 5: 5.8 } },
        [SYMBOL_IDS.ten]: { weight: 16, payouts: { 3: 0.75, 4: 1.9, 5: 5.55 } }
      },
      multiplier: {
        values: [2, 3, 5],
        cap: 25,
        wildChance: 0.1
      },
      freeSpins: {
        multiplier: 2,
        awards: {
          3: 5,
          4: 8,
          5: 12
        }
      },
      jackpot: {
        randomOdds: {
          mini: 2600,
          major: 15000
        }
      }
    }
  }
});

const ACTIVE_PROBABILITY_PROFILE = "playerFriendly";

/**
 * Stable reward identifiers used by the bonus round.
 */
const BONUS_REWARD_TYPES = Object.freeze({
  coins: "coins",
  multiplier: "multiplier",
  freeSpins: "free-spins",
  collect: "collect"
});

/**
 * Named audio cue ids used by synthesized playback.
 */
const AUDIO_CUES = Object.freeze({
  spin: "spin",
  reelStop: "reelStop",
  win: "win",
  bigWin: "bigWin",
  jackpot: "jackpot"
});

const SOUNDS = AUDIO_CUES;

/**
 * Centralized user-facing and diagnostic strings.
 */
const UI_TEXT = Object.freeze({
  warnings: {
    expectedStringSymbolId: "Expected a string symbol id while rendering.",
    unknownSymbolId: "Unknown symbol id",
    unknownBonusPrizeType: "Unknown bonus prize type",
    audioPlaybackFailed: "Audio playback failed.",
    keyboardSpinActivationFailed: "Keyboard spin activation failed.",
    initializeFailed: "Failed to initialize Gunslinger Gold."
  },
  messages: {
    noWin: "No win this round",
    bigWin: "Big Win",
    reelsSpinning: "Reels spinning",
    pickCrate: "Pick a crate for bonus loot",
    bonusCollected: "Bonus collected",
    bonusWinPrefix: "Bonus win",
    jackpotPaidSuffix: "jackpot paid"
  }
});

const JACKPOTS = Object.freeze({
  mini: "mini",
  major: "major",
  grand: "grand"
});

const STORAGE_KEYS = {
  spinSpeed: "gunslinger-gold-spin-speed",
  audioSettings: "gunslinger-gold-audio-settings",
  jackpots: "gunslinger-gold-jackpots",
  lastLoginDate: "gunslinger-gold-last-login-date"
};

const AUDIO_SETTINGS_CONFIG = Object.freeze({
  defaultVolume: 0.6,
  minVolume: 0,
  maxVolume: 1,
  step: 0.05,
  sliderScale: 100,
  lowVolumeThreshold: 0.5,
  sliderId: "volumeSlider",
  muteButtonId: "volumeMuteButton",
  muteLabel: "Mute volume",
  unmuteLabel: "Restore volume"
});

const SPIN_SPEED_CONFIG = Object.freeze({
  defaultMode: "normal",
  modes: {
    slow: {
      spinStripIntervalMs: 118,
      reelStopBaseMs: 910,
      reelStopStepMs: 360
    },
    normal: {
      spinStripIntervalMs: 86,
      reelStopBaseMs: 650,
      reelStopStepMs: 260
    },
    fast: {
      spinStripIntervalMs: 54,
      reelStopBaseMs: 390,
      reelStopStepMs: 160
    },
    skip: {
      spinStripIntervalMs: 0,
      reelStopBaseMs: 0,
      reelStopStepMs: 0
    }
  },
  buttonIds: {
    slow: "spinSpeedSlow",
    normal: "spinSpeedNormal",
    fast: "spinSpeedFast",
    skip: "spinSpeedSkip"
  }
});

/**
 * Creates a safe copy of one payout table.
 * @param {{3: number, 4: number, 5: number}} payouts
 * @returns {{3: number, 4: number, 5: number}}
 */
function clonePayouts(payouts) {
  return {
    3: Number(payouts[3]),
    4: Number(payouts[4]),
    5: Number(payouts[5])
  };
}

/**
 * Validates a payout table for one symbol.
 * @param {{3?: number, 4?: number, 5?: number}} payouts
 * @param {string} symbolId
 * @returns {{3: number, 4: number, 5: number}}
 */
function validatePayoutTable(payouts, symbolId) {
  const counts = [3, 4, 5];
  const nextPayouts = {};

  counts.forEach((count) => {
    const value = Number(payouts?.[count]);

    if (!Number.isFinite(value) || value < 0) {
      throw new RangeError(`Invalid payout configured for symbol "${symbolId}" at ${count} of a kind.`);
    }

    nextPayouts[count] = Number(value.toFixed(2));
  });

  return /** @type {{3: number, 4: number, 5: number}} */ (nextPayouts);
}

/**
 * Validates one probability profile and returns a normalized clone.
 * @param {string} profileName
 * @param {{
 *   symbols: Record<string, {weight: number, payouts: {3: number, 4: number, 5: number}}>,
 *   multiplier: {values: number[], cap: number, wildChance: number},
 *   freeSpins: {multiplier: number, awards: {3: number, 4: number, 5: number}},
 *   jackpot: {randomOdds: {mini: number, major: number}}
 * }} profile
 * @returns {{
 *   symbols: Record<string, {weight: number, payouts: {3: number, 4: number, 5: number}}>,
 *   multiplier: {values: number[], cap: number, wildChance: number},
 *   freeSpins: {multiplier: number, awards: {3: number, 4: number, 5: number}},
 *   jackpot: {randomOdds: {mini: number, major: number}}
 * }}
 */
function validateProbabilityProfile(profileName, profile) {
  if (!profile || typeof profile !== "object") {
    throw new TypeError(`Probability profile "${profileName}" must be an object.`);
  }

  const symbols = {};

  SYMBOL_METADATA.forEach((symbol) => {
    const symbolConfig = profile.symbols?.[symbol.id];
    const weight = Number(symbolConfig?.weight);

    if (!Number.isInteger(weight) || weight <= 0) {
      throw new RangeError(`Probability profile "${profileName}" has invalid weight for symbol "${symbol.id}".`);
    }

    symbols[symbol.id] = {
      weight,
      payouts: validatePayoutTable(symbolConfig.payouts, symbol.id)
    };
  });

  const wildChance = Number(profile.multiplier?.wildChance);
  const cap = Number(profile.multiplier?.cap);
  const multiplierValues = Array.isArray(profile.multiplier?.values)
    ? profile.multiplier.values.map((value) => Number(value))
    : [];
  const freeSpinMultiplier = Number(profile.freeSpins?.multiplier);
  const freeSpinAwards = [3, 4, 5].reduce((awards, count) => {
    const value = Number(profile.freeSpins?.awards?.[count]);

    if (!Number.isInteger(value) || value < 0) {
      throw new RangeError(`Probability profile "${profileName}" has invalid free-spin award for ${count} scatters.`);
    }

    awards[count] = value;
    return awards;
  }, {});
  const miniOdds = Number(profile.jackpot?.randomOdds?.mini);
  const majorOdds = Number(profile.jackpot?.randomOdds?.major);

  if (!Number.isFinite(wildChance) || wildChance < 0 || wildChance > 1) {
    throw new RangeError(`Probability profile "${profileName}" has invalid wild multiplier chance.`);
  }

  if (!Number.isInteger(cap) || cap < 1) {
    throw new RangeError(`Probability profile "${profileName}" has invalid multiplier cap.`);
  }

  if (multiplierValues.length === 0 || multiplierValues.some((value) => !Number.isFinite(value) || value <= 1)) {
    throw new RangeError(`Probability profile "${profileName}" must define at least one valid multiplier value.`);
  }

  if (!Number.isFinite(freeSpinMultiplier) || freeSpinMultiplier < 1) {
    throw new RangeError(`Probability profile "${profileName}" has invalid free-spin multiplier.`);
  }

  if (!Number.isInteger(miniOdds) || miniOdds < 2 || !Number.isInteger(majorOdds) || majorOdds < 2) {
    throw new RangeError(`Probability profile "${profileName}" has invalid jackpot random odds.`);
  }

  return {
    symbols,
    multiplier: {
      values: [...multiplierValues],
      cap,
      wildChance
    },
    freeSpins: {
      multiplier: freeSpinMultiplier,
      awards: /** @type {{3: number, 4: number, 5: number}} */ (freeSpinAwards)
    },
    jackpot: {
      randomOdds: {
        mini: miniOdds,
        major: majorOdds
      }
    }
  };
}

/**
 * Resolves one named probability profile.
 * @param {string} [profileName]
 * @returns {{
 *   symbols: Record<string, {weight: number, payouts: {3: number, 4: number, 5: number}}>,
 *   multiplier: {values: number[], cap: number, wildChance: number},
 *   freeSpins: {multiplier: number, awards: {3: number, 4: number, 5: number}},
 *   jackpot: {randomOdds: {mini: number, major: number}}
 * }}
 */
function getProbabilityProfile(profileName = ACTIVE_PROBABILITY_PROFILE) {
  const profile = PROBABILITY_CONFIG.profiles[profileName];

  if (!profile) {
    throw new RangeError(`Unknown probability profile "${profileName}".`);
  }

  return validateProbabilityProfile(profileName, profile);
}

/**
 * Builds symbol definitions for one probability profile.
 * @param {string} [profileName]
 * @returns {SymbolDefinition[]}
 */
function createSymbolsForProfile(profileName = ACTIVE_PROBABILITY_PROFILE) {
  const profile = getProbabilityProfile(profileName);

  return SYMBOL_METADATA.map((symbol) => ({
    id: symbol.id,
    label: symbol.label,
    className: symbol.className,
    weight: profile.symbols[symbol.id].weight,
    payouts: clonePayouts(profile.symbols[symbol.id].payouts)
  }));
}

const ACTIVE_PROFILE = getProbabilityProfile();

const MULTIPLIER_CONFIG = {
  values: [...ACTIVE_PROFILE.multiplier.values],
  cap: ACTIVE_PROFILE.multiplier.cap,
  wildChance: ACTIVE_PROFILE.multiplier.wildChance
};

const FREE_SPIN_CONFIG = {
  multiplier: ACTIVE_PROFILE.freeSpins.multiplier,
  awards: { ...ACTIVE_PROFILE.freeSpins.awards }
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
  minimumContribution: 1,
  contributionRates: {
    mini: 0.04,
    major: 0.01,
    grand: 0.002
  },
  randomOdds: {
    mini: ACTIVE_PROFILE.jackpot.randomOdds.mini,
    major: ACTIVE_PROFILE.jackpot.randomOdds.major
  },
  celebrationCoins: 34
};

const FEEDBACK_CONFIG = Object.freeze({
  winPopupDurationMs: 2300,
  bigWinThresholdBetMultiplier: 20,
  bigWinCelebrationCoins: 22,
  bigWinCelebrationDurationMs: 2600,
  jackpotCelebrationDurationMs: 3400
});

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

const BONUS_CRATE_STATE_KEYS = Object.freeze({
  default: "default",
  hover: "hover",
  focus: "focus",
  selected: "selected",
  opened: "opened",
  disabled: "disabled",
  revealed: "revealed"
});

const BONUS_UI_CONFIG = Object.freeze({
  elementIds: {
    overlay: "bonusOverlay",
    panel: "bonusPanel",
    status: "bonusStatus",
    crates: "bonusCrates"
  },
  classNames: {
    overlayVisible: "show",
    status: "bonus-status",
    statusGrid: "bonus-status-grid",
    stat: "bonus-stat",
    statLabel: "bonus-stat-label",
    statValue: "bonus-stat-value",
    crateButton: "crate-button",
    crateContent: "crate-content",
    crateTopline: "crate-topline",
    crateTitle: "crate-title",
    crateValue: "crate-value",
    crateMeta: "crate-meta",
    iconShell: "bonus-icon",
    rewardBadge: "crate-reward-badge"
  },
  selectors: {
    crateButton: ".crate-button"
  },
  stateClassNames: {
    default: "crate-button--default",
    hover: "crate-button--hover",
    focus: "crate-button--focus",
    selected: "crate-button--selected",
    opened: "crate-button--opened",
    disabled: "crate-button--disabled",
    revealed: "crate-button--revealed"
  },
  separators: {
    className: " ",
    picks: "/",
    aria: ", "
  },
  events: {
    click: "click",
    pointerOver: "pointerover",
    pointerOut: "pointerout",
    focusIn: "focusin",
    focusOut: "focusout"
  },
  fallbackRewardType: "mystery",
  fallbackIconKey: "mystery",
  crate: {
    indexBase: 1,
    hiddenIconKey: "crate",
    hiddenTitle: "Sealed Crate",
    hiddenValueText: "Mystery Loot",
    hiddenMeta: "Bonus Reward",
    indexLabel: "Crate",
    revealedMeta: "Revealed",
    ariaHiddenSuffix: "sealed mystery reward",
    ariaRevealedPrefix: "revealed reward"
  },
  messages: {
    chooseCrates: "Choose up to three crates.",
    missingElement: "Missing bonus UI element",
    invalidState: "Invalid bonus round state while rendering.",
    unknownRewardType: "Unknown bonus reward type while rendering."
  },
  stats: [
    {
      key: "totalCoins",
      valueKey: "totalCoins",
      label: "Total Winnings",
      prefix: "",
      suffix: "",
      className: "bonus-stat--coins"
    },
    {
      key: "freeSpinsAwarded",
      valueKey: "freeSpinsAwarded",
      label: "Free Spins",
      prefix: "+",
      suffix: "",
      className: "bonus-stat--free-spins"
    },
    {
      key: "bonusMultiplier",
      valueKey: "bonusMultiplier",
      label: "Bonus Multiplier",
      prefix: "x",
      suffix: "",
      className: "bonus-stat--multiplier"
    },
    {
      key: "picksMade",
      valueKey: "picksMade",
      label: "Picks Used",
      prefix: "",
      suffix: "",
      className: "bonus-stat--picks",
      maxValue: BONUS_CONFIG.maxPicks
    }
  ],
  rewardTypes: {
    coins: {
      iconKey: "coin-stack",
      className: "bonus-reward--coins",
      label: "Coins",
      valuePrefix: "",
      valueSuffix: "",
      emptyValueText: "0"
    },
    multiplier: {
      iconKey: "multiplier",
      className: "bonus-reward--multiplier",
      label: "Multiplier",
      valuePrefix: "x",
      valueSuffix: "",
      emptyValueText: "x1"
    },
    "free-spins": {
      iconKey: "free-spins",
      className: "bonus-reward--free-spins",
      label: "Free Spins",
      valuePrefix: "+",
      valueSuffix: "",
      emptyValueText: "+0"
    },
    collect: {
      iconKey: "jackpot-star",
      className: "bonus-reward--collect",
      label: "Collect",
      valuePrefix: "",
      valueSuffix: "",
      emptyValueText: "Collect"
    },
    mystery: {
      iconKey: "mystery",
      className: "bonus-reward--mystery",
      label: "Mystery",
      valuePrefix: "",
      valueSuffix: "",
      emptyValueText: "Mystery"
    }
  },
  icons: {
    crate: {
      key: "crate",
      title: "Sealed crate",
      className: "bonus-icon--crate",
      viewBox: "0 0 64 64",
      markup: `
        <path d="M10 21h44v34H10z" fill="#7b421f" stroke="#32180b" stroke-width="3" />
        <path d="M13 24h38v28H13z" fill="#9d5a2a" opacity="0.76" />
        <path d="M10 21l8-10h28l8 10" fill="#b87332" stroke="#32180b" stroke-width="3" stroke-linejoin="round" />
        <path d="M18 11v44M46 11v44M10 38h44M15 25l34 25M49 25L15 50" stroke="#3b1d0d" stroke-width="3" stroke-linecap="round" opacity="0.72" />
        <path d="M20 16h24" stroke="#ffd978" stroke-width="3" stroke-linecap="round" opacity="0.82" />
      `
    },
    "coin-stack": {
      key: "coin-stack",
      title: "Coin stack",
      className: "bonus-icon--coin-stack",
      viewBox: "0 0 64 64",
      markup: `
        <ellipse cx="31" cy="16" rx="17" ry="7" fill="#ffeaa0" stroke="#8b5516" stroke-width="3" />
        <path d="M14 16v22c0 4 8 7 17 7s17-3 17-7V16" fill="#d89424" stroke="#8b5516" stroke-width="3" />
        <path d="M14 25c0 4 8 7 17 7s17-3 17-7M14 34c0 4 8 7 17 7s17-3 17-7" fill="none" stroke="#fff0a8" stroke-width="2.5" opacity="0.7" />
        <circle cx="44" cy="41" r="10" fill="#ffd658" stroke="#8b5516" stroke-width="3" />
        <path d="M44 35v12M38 41h12" stroke="#8b5516" stroke-width="2.5" stroke-linecap="round" />
      `
    },
    "free-spins": {
      key: "free-spins",
      title: "Free spins",
      className: "bonus-icon--free-spins",
      viewBox: "0 0 64 64",
      markup: `
        <path d="M18 21a19 19 0 0 1 30 3" fill="none" stroke="#fff0a8" stroke-width="5" stroke-linecap="round" />
        <path d="M47 14l2 11-11-1" fill="#fff0a8" stroke="#6a3515" stroke-width="2" stroke-linejoin="round" />
        <path d="M46 43a19 19 0 0 1-30-3" fill="none" stroke="#f6cb58" stroke-width="5" stroke-linecap="round" />
        <path d="M17 50l-2-11 11 1" fill="#f6cb58" stroke="#6a3515" stroke-width="2" stroke-linejoin="round" />
        <text x="32" y="38" text-anchor="middle" fill="#321509" font-size="16" font-weight="900" font-family="Georgia, serif">FS</text>
      `
    },
    multiplier: {
      key: "multiplier",
      title: "Multiplier",
      className: "bonus-icon--multiplier",
      viewBox: "0 0 64 64",
      markup: `
        <path d="M32 7l6 15 16 2-12 11 3 16-13-8-13 8 3-16L10 24l16-2z" fill="#ffe47a" stroke="#704017" stroke-width="3" stroke-linejoin="round" />
        <circle cx="32" cy="32" r="13" fill="#9a4f20" stroke="#fff0a8" stroke-width="3" />
        <text x="32" y="38" text-anchor="middle" fill="#fff5c8" font-size="18" font-weight="900" font-family="Georgia, serif">x</text>
      `
    },
    "jackpot-star": {
      key: "jackpot-star",
      title: "Jackpot starburst",
      className: "bonus-icon--jackpot-star",
      viewBox: "0 0 64 64",
      markup: `
        <path d="M32 5l6 13 14-5-5 14 12 7-14 5 4 15-13-7-10 12-3-15-15 1 9-12-9-11 15 1 3-15z" fill="#ffd658" stroke="#6a3515" stroke-width="3" stroke-linejoin="round" />
        <circle cx="32" cy="32" r="12" fill="#8f3d1a" stroke="#fff0a8" stroke-width="3" />
        <path d="M26 32l4 4 9-10" fill="none" stroke="#fff5c8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      `
    },
    mystery: {
      key: "mystery",
      title: "Mystery reward",
      className: "bonus-icon--mystery",
      viewBox: "0 0 64 64",
      markup: `
        <path d="M16 15h32v34H16z" fill="#6f3d1f" stroke="#32180b" stroke-width="3" />
        <path d="M20 19h24v26H20z" fill="#ad6830" opacity="0.8" />
        <path d="M25 28c1-6 6-9 12-7 5 2 7 7 4 11-2 3-6 4-7 8" fill="none" stroke="#fff0a8" stroke-width="4" stroke-linecap="round" />
        <circle cx="33" cy="46" r="3" fill="#fff0a8" />
      `
    }
  }
});

const BONUS_MODAL_LAYOUT_CONFIG = Object.freeze({
  compactBreakpointPx: 720,
  minimumPanelHeightPx: 280,
  scrollRegionTabIndex: 0,
  viewportPaddingPx: 24
});

const FOCUS_TRAP_CONFIG = Object.freeze({
  focusableSelector: [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(", "),
  blockedElementSelector: ".game-shell"
});

const RETENTION_CONFIG = {
  feedbackDurationMs: 3200,
  dailyLoginReward: {
    type: BONUS_REWARD_TYPES.freeSpins,
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
const SYMBOLS = createSymbolsForProfile();

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
      eligibleSymbolIds: [SYMBOL_IDS.badge, SYMBOL_IDS.boots, SYMBOL_IDS.cowboy, SYMBOL_IDS.wanted, SYMBOL_IDS.cactus, SYMBOL_IDS.a, SYMBOL_IDS.k, SYMBOL_IDS.q, SYMBOL_IDS.j, SYMBOL_IDS.ten]
    },
    {
      id: "middle-line-third-reel-slide",
      lineName: "middle",
      matchCount: 2,
      missReel: 2,
      eligibleSymbolIds: [SYMBOL_IDS.badge, SYMBOL_IDS.boots, SYMBOL_IDS.cowboy, SYMBOL_IDS.wanted, SYMBOL_IDS.cactus, SYMBOL_IDS.a, SYMBOL_IDS.k, SYMBOL_IDS.q, SYMBOL_IDS.j, SYMBOL_IDS.ten]
    },
    {
      id: "bottom-line-third-reel-slide",
      lineName: "bottom",
      matchCount: 2,
      missReel: 2,
      eligibleSymbolIds: [SYMBOL_IDS.badge, SYMBOL_IDS.boots, SYMBOL_IDS.cowboy, SYMBOL_IDS.wanted, SYMBOL_IDS.cactus, SYMBOL_IDS.a, SYMBOL_IDS.k, SYMBOL_IDS.q, SYMBOL_IDS.j, SYMBOL_IDS.ten]
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

const COWBOY_ART_CONFIG = Object.freeze({
  symbolId: "cowboy",
  crownDetailAttribute: "data-icon-detail",
  crownDetailValue: "hat-crown",
  faceDetailValue: "hat-face",
  palette: {
    hatBase: "#6e4228",
    hatShadow: "#4f2d1b",
    hatHighlight: "#b87f47",
    band: "#d6a154",
    face: "#c78a62",
    faceShadow: "#a86d49",
    shirt: "#325880",
    shirtShadow: "#1c2f4c",
    neckerchief: "#a33328",
    outline: "#3d2115"
  }
});

const CACTUS_ART_CONFIG = Object.freeze({
  symbolId: "cactus",
  bodyDetailAttribute: "data-icon-detail",
  bodyDetailValue: "cactus-body",
  armDetailValue: "cactus-arm",
  palette: {
    bodyLight: "#63c662",
    bodyMid: "#3d9d47",
    bodyDark: "#28703a",
    outline: "#16492b",
    spine: "#dfe7b0",
    ground: "#8e5b2c",
    groundShadow: "#5f3817"
  }
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
  cowboy: {
    viewBox: "0 0 96 80",
    className: "slot-icon slot-icon-cowboy",
    title: "Cowboy hat"
  },
  cactus: {
    viewBox: "0 0 96 80",
    className: "slot-icon slot-icon-cactus",
    title: "Cactus"
  },
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
  spinSpeed: SPIN_SPEED_CONFIG.defaultMode,
  audioSettings: createDefaultAudioSettings(),
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
let activeFocusTrap = null;
let isGameInitialized = false;
const managedEventCleanups = [];

state.board = createBoard();
state.boardFeatures = createBoardFeatureGrid(state.board);

/**
 * Builds the weighted lookup array used by spins.
 * @param {SymbolDefinition[]} symbols
 * @returns {string[]}
 */
function buildWeightedSymbolIds(symbols) {
  if (!Array.isArray(symbols) || symbols.length === 0) {
    throw new RangeError("Cannot build a weighted symbol pool from an empty symbol list.");
  }

  const weightedSymbolIds = symbols.flatMap((symbol) => {
    const weight = Number(symbol?.weight);

    if (!Number.isInteger(weight) || weight <= 0 || typeof symbol?.id !== "string" || symbol.id.length === 0) {
      throw new RangeError(`Invalid weight configuration for symbol "${symbol?.id ?? "unknown"}".`);
    }

    return Array.from({ length: weight }, () => symbol.id);
  });

  if (weightedSymbolIds.length === 0) {
    throw new RangeError("Weighted symbol pool must not be empty.");
  }

  return weightedSymbolIds;
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
    console.warn(UI_TEXT.warnings.expectedStringSymbolId, symbolId);
    return fallbackSymbol;
  }

  if (!SYMBOL_MAP[symbolId]) {
    console.warn(`${UI_TEXT.warnings.unknownSymbolId} "${symbolId}" while rendering. Falling back to ${fallbackSymbol.id}.`);
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
 * Builds the cowboy hat art in the same western SVG style as the other refreshed symbols.
 * @param {SymbolArtConfig} config
 * @returns {string}
 */
function createCowboySymbolArt(config) {
  return createInlineSymbolSvg(config, `
    <g transform="translate(4 4)">
      <path d="M18 26 C20 13 32 7 46 7 C61 7 73 13 75 26 C72 34 61 40 46 40 C32 40 21 34 18 26 Z" fill="${COWBOY_ART_CONFIG.palette.hatBase}" stroke="${COWBOY_ART_CONFIG.palette.outline}" stroke-width="2.6" stroke-linejoin="round" data-icon-detail="${COWBOY_ART_CONFIG.crownDetailValue}" />
      <path d="M26 24 C28 16 36 12 46 12 C57 12 65 16 67 24 C65 30 57 34 46 34 C36 34 28 30 26 24 Z" fill="${COWBOY_ART_CONFIG.palette.hatHighlight}" opacity="0.78" />
      <path d="M20 28 C27 22 38 20 46 20 C56 20 66 23 74 28 C68 23 60 19 46 19 C34 19 25 22 20 28 Z" fill="${COWBOY_ART_CONFIG.palette.hatShadow}" opacity="0.92" />
      <path d="M29 28 C34 26 40 25 46 25 C52 25 58 26 63 28 L61 32 C55 30 51 29 46 29 C41 29 37 30 31 32 Z" fill="${COWBOY_ART_CONFIG.palette.band}" stroke="${COWBOY_ART_CONFIG.palette.outline}" stroke-width="1.5" stroke-linejoin="round" />
      <path d="M4 39 C11 31 22 29 34 30 C40 24 48 23 58 25 C66 27 72 31 81 34 C86 36 88 41 84 44 C76 49 67 50 57 48 C49 53 37 54 27 52 C18 50 10 47 6 44 C2 42 1 40 4 39 Z" fill="${COWBOY_ART_CONFIG.palette.hatBase}" stroke="${COWBOY_ART_CONFIG.palette.outline}" stroke-width="2.8" stroke-linejoin="round" />
      <path d="M10 40 C19 35 29 35 39 38 C47 34 57 34 68 37 C74 39 79 39 84 38 C80 42 73 44 66 43 C57 41 49 40 40 43 C30 46 20 45 10 40 Z" fill="${COWBOY_ART_CONFIG.palette.hatShadow}" opacity="0.85" />
      <path d="M40 39 C42 36 46 35 50 36 C53 37 55 39 56 43 C54 48 51 52 47 56 C45 58 42 58 40 56 C36 52 33 48 32 43 C33 40 36 38 40 39 Z" fill="${COWBOY_ART_CONFIG.palette.face}" stroke="${COWBOY_ART_CONFIG.palette.outline}" stroke-width="2" stroke-linejoin="round" data-icon-detail="${COWBOY_ART_CONFIG.faceDetailValue}" />
      <path d="M37 44 C40 41 44 40 47 40 C50 40 53 41 55 43 C52 42 49 42 46 42 C43 42 40 42 37 44 Z" fill="${COWBOY_ART_CONFIG.palette.faceShadow}" opacity="0.72" />
      <path d="M37 58 L45 48 L54 58 Z" fill="${COWBOY_ART_CONFIG.palette.neckerchief}" stroke="${COWBOY_ART_CONFIG.palette.outline}" stroke-width="1.8" stroke-linejoin="round" />
      <path d="M30 70 C34 61 39 57 46 57 C53 57 58 61 62 70" fill="${COWBOY_ART_CONFIG.palette.shirt}" stroke="${COWBOY_ART_CONFIG.palette.outline}" stroke-width="2.2" stroke-linecap="round" />
      <path d="M34 67 C38 61 42 59 46 59 C50 59 54 61 58 67" fill="none" stroke="${COWBOY_ART_CONFIG.palette.shirtShadow}" stroke-width="2.2" stroke-linecap="round" opacity="0.7" />
    </g>
  `, COWBOY_ART_CONFIG.symbolId);
}

/**
 * Builds the cactus art with attached arms and shared body shading.
 * @param {SymbolArtConfig} config
 * @returns {string}
 */
function createCactusSymbolArt(config) {
  return createInlineSymbolSvg(config, `
    <g transform="translate(10 4)">
      <path d="M28 73 C30 63 31 48 31 36 C31 31 35 27 40 27 C45 27 49 31 49 36 C49 48 50 63 52 73 Z" fill="${CACTUS_ART_CONFIG.palette.bodyMid}" stroke="${CACTUS_ART_CONFIG.palette.outline}" stroke-width="2.6" stroke-linejoin="round" data-icon-detail="${CACTUS_ART_CONFIG.bodyDetailValue}" />
      <path d="M22 42 C17 42 13 38 13 33 L13 25 C13 20 17 16 22 16 C27 16 31 20 31 25 L31 55 C31 60 27 64 22 64 C17 64 13 60 13 55 L13 48" fill="${CACTUS_ART_CONFIG.palette.bodyMid}" stroke="${CACTUS_ART_CONFIG.palette.outline}" stroke-width="2.6" stroke-linejoin="round" data-icon-detail="${CACTUS_ART_CONFIG.armDetailValue}" />
      <path d="M58 47 C63 47 67 43 67 38 L67 30 C67 25 63 21 58 21 C53 21 49 25 49 30 L49 60 C49 65 53 69 58 69 C63 69 67 65 67 60 L67 53" fill="${CACTUS_ART_CONFIG.palette.bodyMid}" stroke="${CACTUS_ART_CONFIG.palette.outline}" stroke-width="2.6" stroke-linejoin="round" data-icon-detail="${CACTUS_ART_CONFIG.armDetailValue}" />
      <path d="M17 60 C21 59 25 57 28 54 L28 28 C28 24 30 20 34 18 C36 17 38 17 40 17 L40 73 L28 73 C27 64 23 61 17 60 Z" fill="${CACTUS_ART_CONFIG.palette.bodyLight}" opacity="0.78" />
      <path d="M49 73 L40 73 L40 17 C43 17 45 18 48 20 C51 23 52 26 52 31 L52 58 C57 59 61 61 64 65 C61 64 57 65 54 67 C52 68 51 70 49 73 Z" fill="${CACTUS_ART_CONFIG.palette.bodyDark}" opacity="0.56" />
      <path d="M19 23 C21 21 23 21 25 23" fill="none" stroke="${CACTUS_ART_CONFIG.palette.spine}" stroke-width="1.5" stroke-linecap="round" />
      <path d="M19 34 C21 32 23 32 25 34" fill="none" stroke="${CACTUS_ART_CONFIG.palette.spine}" stroke-width="1.5" stroke-linecap="round" />
      <path d="M38 22 C40 20 42 20 44 22" fill="none" stroke="${CACTUS_ART_CONFIG.palette.spine}" stroke-width="1.5" stroke-linecap="round" />
      <path d="M38 35 C40 33 42 33 44 35" fill="none" stroke="${CACTUS_ART_CONFIG.palette.spine}" stroke-width="1.5" stroke-linecap="round" />
      <path d="M38 48 C40 46 42 46 44 48" fill="none" stroke="${CACTUS_ART_CONFIG.palette.spine}" stroke-width="1.5" stroke-linecap="round" />
      <path d="M57 28 C59 26 61 26 63 28" fill="none" stroke="${CACTUS_ART_CONFIG.palette.spine}" stroke-width="1.5" stroke-linecap="round" />
      <path d="M57 39 C59 37 61 37 63 39" fill="none" stroke="${CACTUS_ART_CONFIG.palette.spine}" stroke-width="1.5" stroke-linecap="round" />
      <path d="M24 76 C34 72 47 72 57 76" fill="none" stroke="${CACTUS_ART_CONFIG.palette.groundShadow}" stroke-width="5" stroke-linecap="round" opacity="0.42" />
      <path d="M20 75 C31 70 49 70 61 75" fill="none" stroke="${CACTUS_ART_CONFIG.palette.ground}" stroke-width="3" stroke-linecap="round" />
    </g>
  `, CACTUS_ART_CONFIG.symbolId);
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
  cowboy: createCowboySymbolArt,
  cactus: createCactusSymbolArt,
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
 * Resolves the configured presentation for a bonus reward type, falling back safely for unknown prizes.
 * @param {string} rewardType
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {{iconKey: string, className: string, label: string, valuePrefix: string, valueSuffix: string, emptyValueText: string}}
 */
function getBonusRewardUiConfig(rewardType, config = BONUS_UI_CONFIG) {
  const fallbackConfig = config.rewardTypes[config.fallbackRewardType];

  if (typeof rewardType !== "string" || !config.rewardTypes[rewardType]) {
    console.warn(config.messages.unknownRewardType, rewardType);
    return fallbackConfig;
  }

  return config.rewardTypes[rewardType];
}

/**
 * Resolves the icon key configured for a bonus reward type.
 * @param {string} rewardType
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {string}
 */
function getBonusRewardIconKey(rewardType, config = BONUS_UI_CONFIG) {
  return getBonusRewardUiConfig(rewardType, config).iconKey;
}

/**
 * Resolves the CSS class configured for a bonus reward type.
 * @param {string} rewardType
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {string}
 */
function getBonusRewardClassName(rewardType, config = BONUS_UI_CONFIG) {
  return getBonusRewardUiConfig(rewardType, config).className;
}

/**
 * Resolves a crate state CSS class from the configured state map.
 * @param {string} stateKey
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {string}
 */
function getBonusCrateStateClass(stateKey, config = BONUS_UI_CONFIG) {
  if (!config.stateClassNames[stateKey]) {
    return config.stateClassNames[BONUS_CRATE_STATE_KEYS.default];
  }

  return config.stateClassNames[stateKey];
}

/**
 * Builds the complete CSS class string for a crate button from its visual state.
 * @param {{isRevealed?: boolean, isSelected?: boolean, isDisabled?: boolean}} crateState
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {string}
 */
function getBonusCrateStateClasses(crateState, config = BONUS_UI_CONFIG) {
  const classes = [config.classNames.crateButton];

  if (crateState.isRevealed) {
    classes.push(
      getBonusCrateStateClass(BONUS_CRATE_STATE_KEYS.opened, config),
      getBonusCrateStateClass(BONUS_CRATE_STATE_KEYS.revealed, config)
    );
  } else if (crateState.isSelected) {
    classes.push(
      getBonusCrateStateClass(BONUS_CRATE_STATE_KEYS.selected, config),
      getBonusCrateStateClass(BONUS_CRATE_STATE_KEYS.opened, config)
    );
  } else {
    classes.push(getBonusCrateStateClass(BONUS_CRATE_STATE_KEYS.default, config));
  }

  if (crateState.isDisabled || crateState.isRevealed) {
    classes.push(getBonusCrateStateClass(BONUS_CRATE_STATE_KEYS.disabled, config));
  }

  return classes.join(config.separators.className);
}

/**
 * Builds inline SVG markup for a configured bonus icon.
 * @param {string} iconKey
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {string}
 */
function createBonusIconMarkup(iconKey, config = BONUS_UI_CONFIG) {
  const iconConfig = config.icons[iconKey] || config.icons[config.fallbackIconKey];

  return `
    <span class="${escapeHtml(config.classNames.iconShell)} ${escapeHtml(iconConfig.className)}" data-bonus-icon="${escapeHtml(iconConfig.key)}" aria-hidden="true">
      <svg viewBox="${escapeHtml(iconConfig.viewBox)}" focusable="false" xmlns="http://www.w3.org/2000/svg">
        ${iconConfig.markup}
      </svg>
    </span>
  `;
}

/**
 * Formats the visible value for a revealed bonus prize.
 * @param {BonusPrize} prize
 * @param {typeof BONUS_UI_CONFIG.rewardTypes.coins} rewardConfig
 * @returns {string}
 */
function formatBonusPrizeValue(prize, rewardConfig) {
  const numericValue = Number(prize.value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return rewardConfig.emptyValueText;
  }

  return `${rewardConfig.valuePrefix}${numericValue}${rewardConfig.valueSuffix}`;
}

/**
 * Creates the stat view models rendered in the bonus modal header.
 * @param {BonusRoundState} bonusState
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {{key: string, label: string, value: string, className: string}[]}
 */
function createBonusStatusViewModel(bonusState, config = BONUS_UI_CONFIG) {
  return config.stats.map((statConfig) => {
    const rawValue = Number(bonusState[statConfig.valueKey]);
    const value = Number.isFinite(rawValue) ? rawValue : 0;
    const valueText = typeof statConfig.maxValue === "number"
      ? `${value}${config.separators.picks}${statConfig.maxValue}`
      : `${statConfig.prefix}${value}${statConfig.suffix}`;

    return {
      key: statConfig.key,
      label: statConfig.label,
      value: valueText,
      className: statConfig.className
    };
  });
}

/**
 * Creates the render model for one crate tile.
 * @param {BonusPrize} prize
 * @param {number} index
 * @param {BonusRoundState} bonusState
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {{ariaLabel: string, className: string, iconKey: string, indexLabel: string, isRevealed: boolean, rewardClassName: string, rewardLabel: string, title: string, valueText: string, metaText: string}}
 */
function createBonusCrateViewModel(prize, index, bonusState, config = BONUS_UI_CONFIG) {
  const safePrize = prize || {
    type: config.fallbackRewardType,
    label: config.rewardTypes[config.fallbackRewardType].label,
    value: 0
  };
  const isRevealed = Boolean(bonusState.revealedCrates[index]);
  const rewardConfig = getBonusRewardUiConfig(safePrize.type, config);
  const indexLabel = `${config.crate.indexLabel} ${index + config.crate.indexBase}`;
  const rewardLabel = typeof safePrize.label === "string" ? safePrize.label : rewardConfig.label;
  const valueText = isRevealed ? formatBonusPrizeValue(safePrize, rewardConfig) : config.crate.hiddenValueText;
  const title = isRevealed ? rewardLabel : config.crate.hiddenTitle;
  const metaText = isRevealed ? config.crate.revealedMeta : config.crate.hiddenMeta;
  const ariaFragments = isRevealed
    ? [indexLabel, rewardLabel, `${config.crate.ariaRevealedPrefix} ${valueText}`]
    : [indexLabel, config.crate.ariaHiddenSuffix];

  return {
    ariaLabel: ariaFragments.join(config.separators.aria),
    className: getBonusCrateStateClasses({ isRevealed }, config),
    iconKey: isRevealed ? rewardConfig.iconKey : config.crate.hiddenIconKey,
    indexLabel,
    isRevealed,
    rewardClassName: rewardConfig.className,
    rewardLabel,
    title,
    valueText,
    metaText
  };
}

/**
 * Validates the minimum bonus state shape needed by the modal renderer.
 * @param {BonusRoundState | null} bonusState
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {boolean}
 */
function isValidBonusRoundState(bonusState, config = BONUS_UI_CONFIG) {
  const isValid = Boolean(
    bonusState
    && Array.isArray(bonusState.prizes)
    && Array.isArray(bonusState.revealedCrates)
    && Number.isFinite(Number(bonusState.totalCoins))
    && Number.isFinite(Number(bonusState.freeSpinsAwarded))
    && Number.isFinite(Number(bonusState.bonusMultiplier))
    && Number.isFinite(Number(bonusState.picksMade))
  );

  if (!isValid) {
    console.warn(config.messages.invalidState, bonusState);
  }

  return isValid;
}

/**
 * Finds the required bonus modal nodes without throwing when markup is missing.
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {{overlay: HTMLElement, panel: HTMLElement, status: HTMLElement, crates: HTMLElement} | null}
 */
function getBonusRoundElements(config = BONUS_UI_CONFIG) {
  if (typeof document === "undefined") {
    return null;
  }

  const overlay = document.getElementById(config.elementIds.overlay);
  const panel = document.getElementById(config.elementIds.panel);
  const status = document.getElementById(config.elementIds.status);
  const crates = document.getElementById(config.elementIds.crates);

  if (!overlay || !panel || !status || !crates) {
    console.warn(config.messages.missingElement, config.elementIds);
    return null;
  }

  return { overlay, panel, status, crates };
}

/**
 * Builds responsive layout values for the Pick-a-Crate modal.
 * @param {number} viewportWidth
 * @param {number} viewportHeight
 * @param {typeof BONUS_MODAL_LAYOUT_CONFIG} [config]
 * @returns {{isCompact: boolean, maxPanelHeightPx: number, scrollRegionTabIndex: number}}
 */
function createBonusModalLayoutState(viewportWidth, viewportHeight, config = BONUS_MODAL_LAYOUT_CONFIG) {
  const safeWidth = Number(viewportWidth);
  const safeHeight = Number(viewportHeight);
  const viewportPaddingPx = Math.max(0, Number(config.viewportPaddingPx) || 0);
  const fallbackHeight = Math.max(0, Number(config.minimumPanelHeightPx) || 0);
  const availableHeight = Number.isFinite(safeHeight)
    ? safeHeight - (viewportPaddingPx * 2)
    : fallbackHeight;
  const maxPanelHeightPx = Number.isFinite(safeHeight)
    ? Math.min(safeHeight, Math.max(fallbackHeight, availableHeight))
    : fallbackHeight;

  return {
    isCompact: Number.isFinite(safeWidth) ? safeWidth <= config.compactBreakpointPx : false,
    maxPanelHeightPx,
    scrollRegionTabIndex: config.scrollRegionTabIndex
  };
}

/**
 * Applies the responsive Pick-a-Crate modal layout attributes and sizing.
 * @param {{overlay: HTMLElement, panel: HTMLElement, status: HTMLElement, crates: HTMLElement} | null} bonusElements
 * @param {typeof BONUS_MODAL_LAYOUT_CONFIG} [config]
 * @returns {{isCompact: boolean, maxPanelHeightPx: number, scrollRegionTabIndex: number} | null}
 */
function syncBonusModalLayout(bonusElements = getBonusRoundElements(), config = BONUS_MODAL_LAYOUT_CONFIG) {
  if (!bonusElements || typeof window === "undefined") {
    return null;
  }

  const layoutState = createBonusModalLayoutState(window.innerWidth, window.innerHeight, config);
  const { overlay, panel, crates } = bonusElements;

  overlay.dataset.bonusLayout = layoutState.isCompact ? "compact" : "default";
  panel.style.setProperty("--bonus-panel-max-height", `${layoutState.maxPanelHeightPx}px`);
  crates.tabIndex = layoutState.scrollRegionTabIndex;
  crates.dataset.scrollable = "true";

  return layoutState;
}

/**
 * Renders the bonus status stat tiles.
 * @param {HTMLElement} statusElement
 * @param {BonusRoundState} bonusState
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {void}
 */
function renderBonusStatus(statusElement, bonusState, config = BONUS_UI_CONFIG) {
  const stats = createBonusStatusViewModel(bonusState, config);
  statusElement.className = [config.classNames.status, config.classNames.statusGrid].join(config.separators.className);
  statusElement.innerHTML = stats.map((stat) => `
    <div class="${escapeHtml(config.classNames.stat)} ${escapeHtml(stat.className)}" data-bonus-stat="${escapeHtml(stat.key)}">
      <span class="${escapeHtml(config.classNames.statLabel)}">${escapeHtml(stat.label)}</span>
      <strong class="${escapeHtml(config.classNames.statValue)}">${escapeHtml(stat.value)}</strong>
    </div>
  `).join("");
}

/**
 * Builds one crate button element for the bonus modal.
 * @param {BonusPrize} prize
 * @param {number} index
 * @param {BonusRoundState} bonusState
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {HTMLButtonElement}
 */
function createBonusCrateButton(prize, index, bonusState, config = BONUS_UI_CONFIG) {
  const viewModel = createBonusCrateViewModel(prize, index, bonusState, config);
  const button = document.createElement("button");

  button.className = viewModel.className;
  button.type = "button";
  button.disabled = viewModel.isRevealed;
  button.dataset.crateIndex = String(index);
  button.dataset.rewardType = prize && typeof prize.type === "string" ? prize.type : config.fallbackRewardType;
  button.dataset.rewardIcon = viewModel.iconKey;
  button.setAttribute("aria-label", viewModel.ariaLabel);
  button.setAttribute("aria-pressed", String(viewModel.isRevealed));
  button.innerHTML = `
    <span class="${escapeHtml(config.classNames.crateContent)} ${escapeHtml(viewModel.rewardClassName)}">
      <span class="${escapeHtml(config.classNames.crateTopline)}">${escapeHtml(viewModel.indexLabel)}</span>
      ${createBonusIconMarkup(viewModel.iconKey, config)}
      <span class="${escapeHtml(config.classNames.crateTitle)}">${escapeHtml(viewModel.title)}</span>
      <strong class="${escapeHtml(config.classNames.crateValue)}">${escapeHtml(viewModel.valueText)}</strong>
      <span class="${escapeHtml(config.classNames.crateMeta)}">${escapeHtml(viewModel.metaText)}</span>
    </span>
  `;

  return button;
}

/**
 * Renders the full crate grid for the current bonus state.
 * @param {HTMLElement} crateContainer
 * @param {BonusRoundState} bonusState
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {void}
 */
function renderBonusCrates(crateContainer, bonusState, config = BONUS_UI_CONFIG) {
  crateContainer.innerHTML = "";

  bonusState.prizes.forEach((prize, index) => {
    crateContainer.appendChild(createBonusCrateButton(prize, index, bonusState, config));
  });
}

/**
 * Toggles a configured visual state class on a crate button.
 * @param {Element | null} target
 * @param {string} stateKey
 * @param {boolean} isActive
 * @param {typeof BONUS_UI_CONFIG} [config]
 * @returns {void}
 */
function toggleBonusCrateInteractionState(target, stateKey, isActive, config = BONUS_UI_CONFIG) {
  const button = target && typeof target.closest === "function" ? target.closest(config.selectors.crateButton) : null;

  if (!button || button.disabled) {
    return;
  }

  button.classList.toggle(getBonusCrateStateClass(stateKey, config), isActive);
}

/**
 * Handles pointer hover state for crate buttons.
 * @param {PointerEvent} event
 * @param {boolean} isActive
 * @returns {void}
 */
function handleBonusCratePointerState(event, isActive) {
  toggleBonusCrateInteractionState(event.target, BONUS_CRATE_STATE_KEYS.hover, isActive);
}

/**
 * Handles keyboard focus state for crate buttons.
 * @param {FocusEvent} event
 * @param {boolean} isActive
 * @returns {void}
 */
function handleBonusCrateFocusState(event, isActive) {
  toggleBonusCrateInteractionState(event.target, BONUS_CRATE_STATE_KEYS.focus, isActive);
}

/**
 * Clamps an audio volume value into the supported range.
 * @param {number | string} value
 * @param {typeof AUDIO_SETTINGS_CONFIG} [config]
 * @returns {number}
 */
function clampVolume(value, config = AUDIO_SETTINGS_CONFIG) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return config.defaultVolume;
  }

  return Math.min(config.maxVolume, Math.max(config.minVolume, Number(numericValue.toFixed(2))));
}

/**
 * Creates the default persisted audio settings shape.
 * @param {typeof AUDIO_SETTINGS_CONFIG} [config]
 * @returns {AudioSettings}
 */
function createDefaultAudioSettings(config = AUDIO_SETTINGS_CONFIG) {
  const defaultVolume = clampVolume(config.defaultVolume, config);

  return {
    volume: defaultVolume,
    isMuted: false,
    previousVolume: defaultVolume
  };
}

/**
 * Normalizes stored or external audio settings into a safe shape.
 * @param {Partial<AudioSettings> | null | undefined} value
 * @param {typeof AUDIO_SETTINGS_CONFIG} [config]
 * @returns {AudioSettings}
 */
function sanitizeAudioSettings(value, config = AUDIO_SETTINGS_CONFIG) {
  const defaults = createDefaultAudioSettings(config);

  if (!value || typeof value !== "object") {
    return defaults;
  }

  const volume = clampVolume(value.volume, config);
  const previousVolumeCandidate = clampVolume(value.previousVolume, config);
  const isMuted = Boolean(value.isMuted);
  const previousVolume = previousVolumeCandidate > config.minVolume
    ? previousVolumeCandidate
    : (volume > config.minVolume ? volume : defaults.previousVolume);

  return {
    volume: isMuted ? config.minVolume : volume,
    isMuted,
    previousVolume
  };
}

/**
 * Loads the saved audio settings preference.
 * @param {typeof AUDIO_SETTINGS_CONFIG} [config]
 * @returns {AudioSettings}
 */
function loadAudioSettings(config = AUDIO_SETTINGS_CONFIG) {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEYS.audioSettings);

    if (!rawValue) {
      return createDefaultAudioSettings(config);
    }

    return sanitizeAudioSettings(JSON.parse(rawValue), config);
  } catch (_error) {
    return createDefaultAudioSettings(config);
  }
}

/**
 * Saves the current audio settings preference.
 * @param {AudioSettings} audioSettings
 * @param {typeof AUDIO_SETTINGS_CONFIG} [config]
 */
function saveAudioSettings(audioSettings, config = AUDIO_SETTINGS_CONFIG) {
  try {
    window.localStorage.setItem(
      STORAGE_KEYS.audioSettings,
      JSON.stringify(sanitizeAudioSettings(audioSettings, config))
    );
  } catch (_error) {
    // Ignore storage failures so gameplay continues normally.
  }
}

/**
 * Checks whether a spin speed mode is supported.
 * @param {string} value
 * @returns {value is SpinSpeedMode}
 */
function isValidSpinSpeedMode(value) {
  return Object.prototype.hasOwnProperty.call(SPIN_SPEED_CONFIG.modes, value);
}

/**
 * Reads the saved spin speed preference.
 * @returns {SpinSpeedMode}
 */
function loadSpinSpeedPreference() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEYS.spinSpeed);
    return isValidSpinSpeedMode(value) ? value : SPIN_SPEED_CONFIG.defaultMode;
  } catch (_error) {
    return SPIN_SPEED_CONFIG.defaultMode;
  }
}

/**
 * Saves the spin speed preference.
 * @param {SpinSpeedMode} value
 */
function saveSpinSpeedPreference(value) {
  try {
    window.localStorage.setItem(
      STORAGE_KEYS.spinSpeed,
      isValidSpinSpeedMode(value) ? value : SPIN_SPEED_CONFIG.defaultMode
    );
  } catch (_error) {
    // Ignore storage failures so gameplay continues normally.
  }
}

/**
 * Returns the active timing config for the selected spin speed.
 * @param {SpinSpeedMode} spinSpeed
 * @returns {{spinStripIntervalMs: number, reelStopBaseMs: number, reelStopStepMs: number}}
 */
function getSpinTiming(spinSpeed) {
  return SPIN_SPEED_CONFIG.modes[isValidSpinSpeedMode(spinSpeed) ? spinSpeed : SPIN_SPEED_CONFIG.defaultMode];
}

/**
 * Returns the currently effective output volume.
 * @param {AudioSettings} audioSettings
 * @param {typeof AUDIO_SETTINGS_CONFIG} [config]
 * @returns {number}
 */
function getEffectiveVolume(audioSettings, config = AUDIO_SETTINGS_CONFIG) {
  const safeSettings = sanitizeAudioSettings(audioSettings, config);
  return safeSettings.isMuted ? config.minVolume : safeSettings.volume;
}

/**
 * Creates the next audio settings after a direct volume change.
 * @param {AudioSettings} audioSettings
 * @param {number | string} nextVolume
 * @param {typeof AUDIO_SETTINGS_CONFIG} [config]
 * @returns {AudioSettings}
 */
function setAudioVolumeState(audioSettings, nextVolume, config = AUDIO_SETTINGS_CONFIG) {
  const currentSettings = sanitizeAudioSettings(audioSettings, config);
  const volume = clampVolume(nextVolume, config);

  if (volume <= config.minVolume) {
    return {
      volume: config.minVolume,
      isMuted: true,
      previousVolume: currentSettings.volume > config.minVolume
        ? currentSettings.volume
        : currentSettings.previousVolume
    };
  }

  return {
    volume,
    isMuted: false,
    previousVolume: volume
  };
}

/**
 * Creates the next audio settings after toggling mute.
 * @param {AudioSettings} audioSettings
 * @param {typeof AUDIO_SETTINGS_CONFIG} [config]
 * @returns {AudioSettings}
 */
function toggleAudioMuteState(audioSettings, config = AUDIO_SETTINGS_CONFIG) {
  const currentSettings = sanitizeAudioSettings(audioSettings, config);

  if (currentSettings.isMuted || currentSettings.volume <= config.minVolume) {
    const restoredVolume = currentSettings.previousVolume > config.minVolume
      ? currentSettings.previousVolume
      : createDefaultAudioSettings(config).volume;

    return {
      volume: restoredVolume,
      isMuted: false,
      previousVolume: restoredVolume
    };
  }

  return {
    volume: config.minVolume,
    isMuted: true,
    previousVolume: currentSettings.volume
  };
}

/**
 * Converts a normalized volume value to the slider's integer scale.
 * @param {number} volume
 * @param {typeof AUDIO_SETTINGS_CONFIG} [config]
 * @returns {string}
 */
function volumeToSliderValue(volume, config = AUDIO_SETTINGS_CONFIG) {
  return String(Math.round(clampVolume(volume, config) * config.sliderScale));
}

/**
 * Converts a slider value back to the normalized volume range.
 * @param {number | string} sliderValue
 * @param {typeof AUDIO_SETTINGS_CONFIG} [config]
 * @returns {number}
 */
function sliderValueToVolume(sliderValue, config = AUDIO_SETTINGS_CONFIG) {
  return clampVolume(Number(sliderValue) / config.sliderScale, config);
}

/**
 * Resolves the visual mute button state for the current volume level.
 * @param {AudioSettings} audioSettings
 * @param {typeof AUDIO_SETTINGS_CONFIG} [config]
 * @returns {"muted" | "low" | "high"}
 */
function getVolumeButtonState(audioSettings, config = AUDIO_SETTINGS_CONFIG) {
  const effectiveVolume = getEffectiveVolume(audioSettings, config);

  if (effectiveVolume <= config.minVolume) {
    return "muted";
  }

  return effectiveVolume < config.lowVolumeThreshold ? "low" : "high";
}

/**
 * Synchronizes settings controls with the current in-memory state.
 * @param {Document} [root]
 * @returns {boolean}
 */
function renderSettingsControls(root = (typeof document !== "undefined" ? document : null)) {
  if (!root || typeof root.getElementById !== "function") {
    return false;
  }

  Object.entries(SPIN_SPEED_CONFIG.buttonIds).forEach(([mode, buttonId]) => {
    const button = root.getElementById(buttonId);

    if (button) {
      button.setAttribute("aria-pressed", String(state.spinSpeed === mode));
    }
  });

  const volumeSlider = root.getElementById(AUDIO_SETTINGS_CONFIG.sliderId);
  const volumeMuteButton = root.getElementById(AUDIO_SETTINGS_CONFIG.muteButtonId);

  if (!volumeSlider || !volumeMuteButton) {
    return false;
  }

  volumeSlider.value = volumeToSliderValue(getEffectiveVolume(state.audioSettings));
  volumeMuteButton.dataset.volumeState = getVolumeButtonState(state.audioSettings);
  volumeMuteButton.setAttribute("aria-pressed", String(state.audioSettings.isMuted));
  volumeMuteButton.setAttribute(
    "aria-label",
    state.audioSettings.isMuted ? AUDIO_SETTINGS_CONFIG.unmuteLabel : AUDIO_SETTINGS_CONFIG.muteLabel
  );

  return true;
}

/**
 * Applies audio settings to state, persistence, and the settings UI.
 * @param {AudioSettings} nextAudioSettings
 */
function applyAudioSettings(nextAudioSettings) {
  state.audioSettings = sanitizeAudioSettings(nextAudioSettings);
  saveAudioSettings(state.audioSettings);
  renderSettingsControls();
}

/**
 * Handles direct slider volume changes from the settings UI.
 * @param {{target?: {value?: string}}} event
 */
function handleVolumeSliderInput(event) {
  if (!event?.target) {
    return;
  }

  applyAudioSettings(setAudioVolumeState(state.audioSettings, sliderValueToVolume(event.target.value)));
}

/**
 * Handles mute/unmute clicks from the settings UI.
 */
function handleVolumeMuteButtonClick() {
  applyAudioSettings(toggleAudioMuteState(state.audioSettings));
}

/**
 * Applies the selected spin speed mode to state, persistence, and settings UI.
 * @param {SpinSpeedMode} spinSpeed
 */
function applySpinSpeed(spinSpeed) {
  state.spinSpeed = isValidSpinSpeedMode(spinSpeed) ? spinSpeed : SPIN_SPEED_CONFIG.defaultMode;
  saveSpinSpeedPreference(state.spinSpeed);
  renderSettingsControls();
}

/**
 * Handles clicks on the spin speed option buttons.
 * @param {{target?: EventTarget | null}} event
 */
function handleSpinSpeedButtonClick(event) {
  const button = event?.target?.closest?.("[data-spin-speed]") || null;

  if (!button) {
    return;
  }

  applySpinSpeed(button.dataset.spinSpeed);
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
    return sanitizeJackpotPots(parsedValue);
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
function randomInteger(maxExclusive, random = Math.random) {
  const safeMaxExclusive = Number(maxExclusive);

  if (!Number.isInteger(safeMaxExclusive) || safeMaxExclusive <= 0) {
    throw new RangeError("randomInteger requires a positive integer maxExclusive.");
  }

  return Math.floor(random() * safeMaxExclusive);
}

/**
 * Returns a randomly selected item from a list.
 * @template T
 * @param {T[]} values
 * @returns {T}
 */
function pickRandom(values, random = Math.random) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new RangeError("Cannot pick from an empty list.");
  }

  return values[randomInteger(values.length, random)];
}

/**
 * Chooses a symbol id using configured symbol weights.
 * @param {{weightedSymbolIds?: string[], random?: () => number}} [options]
 * @returns {string}
 */
function getRandomSymbolId(options = {}) {
  const weightedSymbolIds = Array.isArray(options.weightedSymbolIds) ? options.weightedSymbolIds : WEIGHTED_SYMBOL_IDS;

  if (weightedSymbolIds.length === 0) {
    throw new RangeError("Cannot draw from an empty weighted symbol pool.");
  }

  return weightedSymbolIds[randomInteger(weightedSymbolIds.length, typeof options.random === "function" ? options.random : Math.random)];
}

/**
 * Creates a 3 x 5 board represented as rows containing reel results.
 * @param {{weightedSymbolIds?: string[], random?: () => number}} [options]
 * @returns {string[][]}
 */
function createBoard(options = {}) {
  return Array.from({ length: GAME_LIMITS.rowCount }, () => (
    Array.from({ length: GAME_LIMITS.reelCount }, () => getRandomSymbolId(options))
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
 * @param {{multiplierConfig?: typeof MULTIPLIER_CONFIG, random?: () => number}} [options]
 * @returns {(BoardCellFeature | null)[][]}
 */
function createBoardFeatureGrid(board, options = {}) {
  const features = createEmptyFeatureGrid();
  const multiplierConfig = options.multiplierConfig || MULTIPLIER_CONFIG;
  const random = typeof options.random === "function" ? options.random : Math.random;

  board.forEach((row, rowIndex) => {
    row.forEach((symbolId, reelIndex) => {
      if (symbolId === SYMBOL_IDS.wild && random() < multiplierConfig.wildChance) {
        features[rowIndex][reelIndex] = { multiplier: pickRandom(multiplierConfig.values, random) };
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
 * @param {{awards: {3: number, 4: number, 5: number}}} [config]
 * @returns {number}
 */
function getFreeSpinAward(scatterCount, config = FREE_SPIN_CONFIG) {
  return config.awards[Math.min(scatterCount, GAME_LIMITS.reelCount)] || 0;
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
 * @param {{values: number[], cap: number, wildChance: number}} [multiplierConfig]
 * @param {{multiplier: number}} [freeSpinConfig]
 * @returns {number}
 */
function getLineMultiplier(lineSymbols, rows, boardFeatures, count, isFreeSpinRound, multiplierConfig = MULTIPLIER_CONFIG, freeSpinConfig = FREE_SPIN_CONFIG) {
  let multiplier = 1;

  for (let reel = 0; reel < count; reel += 1) {
    if (lineSymbols[reel] !== SYMBOL_IDS.wild) {
      continue;
    }

    const feature = getCellFeature(boardFeatures, rows[reel], reel);
    if (feature && feature.multiplier > 1) {
      multiplier *= feature.multiplier;
      multiplier = Math.min(multiplier, multiplierConfig.cap);
    }
  }

  if (isFreeSpinRound) {
    multiplier *= freeSpinConfig.multiplier;
  }

  return multiplier;
}

/**
 * Evaluates payline wins without applying scatter or bonus logic.
 * @param {string[][]} board
 * @param {number} bet
 * @param {{boardFeatures?: (BoardCellFeature | null)[][], isFreeSpinRound?: boolean, multiplierConfig?: typeof MULTIPLIER_CONFIG, freeSpinConfig?: typeof FREE_SPIN_CONFIG, symbolMap?: Record<string, SymbolDefinition>}} [options]
 * @returns {{winningCellKeys: Set<string>, activeHorizontalLines: Set<string>, lineWins: LineWin[], totalWin: number, appliedMultiplier: number}}
 */
function evaluatePaylines(board, bet, options = {}) {
  const winningCellKeys = new Set();
  const activeHorizontalLines = new Set();
  const lineWins = [];
  let totalWin = 0;
  let appliedMultiplier = 1;
  const symbolMap = options.symbolMap || SYMBOL_MAP;
  const multiplierConfig = options.multiplierConfig || MULTIPLIER_CONFIG;
  const freeSpinConfig = options.freeSpinConfig || FREE_SPIN_CONFIG;

  for (const payline of PAYLINES) {
    const lineSymbols = payline.rows.map((row, reel) => board[row][reel]);
    const match = getLeftToRightMatch(lineSymbols);

    if (!match) {
      continue;
    }

    const symbol = symbolMap[match.symbolId];
    const baseWin = bet * symbol.payouts[match.count];
    const matchedPositions = createMatchedPositions(payline.rows, match.count);
    const multiplier = getLineMultiplier(
      lineSymbols,
      payline.rows,
      options.boardFeatures,
      match.count,
      Boolean(options.isFreeSpinRound),
      multiplierConfig,
      freeSpinConfig
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

  return {
    winningCellKeys,
    activeHorizontalLines,
    lineWins,
    totalWin,
    appliedMultiplier
  };
}

/**
 * Evaluates scatter payout and awarded free spins.
 * @param {string[][]} board
 * @param {number} bet
 * @param {{awards: {3: number, 4: number, 5: number}}} [freeSpinConfig]
 * @param {Record<string, SymbolDefinition>} [symbolMap]
 * @returns {{winningCellKeys: Set<string>, scatterCount: number, freeSpinsAwarded: number, totalWin: number}}
 */
function evaluateScatters(board, bet, freeSpinConfig = FREE_SPIN_CONFIG, symbolMap = SYMBOL_MAP) {
  const winningCellKeys = new Set();
  const scatterCount = countSymbol(board, SYMBOL_IDS.scatter);
  const scatterPayout = symbolMap[SYMBOL_IDS.scatter].payouts[Math.min(scatterCount, GAME_LIMITS.reelCount)] || 0;
  const freeSpinsAwarded = getFreeSpinAward(scatterCount, freeSpinConfig);
  let totalWin = 0;

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
    winningCellKeys,
    scatterCount,
    freeSpinsAwarded,
    totalWin
  };
}

/**
 * Evaluates bonus trigger state from the final board.
 * @param {string[][]} board
 * @param {{triggerCount: number}} [bonusConfig]
 * @returns {{bonusTriggered: boolean}}
 */
function evaluateBonuses(board, bonusConfig = BONUS_CONFIG) {
  return {
    bonusTriggered: countSymbol(board, SYMBOL_IDS.dynamite) >= bonusConfig.triggerCount
  };
}

/**
 * Converts winning-cell keys back into grid coordinates.
 * @param {Set<string>} winningCellKeys
 * @returns {{reel: number, row: number}[]}
 */
function createWinningCells(winningCellKeys) {
  return Array.from(winningCellKeys).map((key) => {
    const [reel, row] = key.split(":").map(Number);
    return { reel, row };
  });
}

/**
 * Evaluates line wins, scatter wins, and bonus triggers for a board.
 * @param {string[][]} board
 * @param {number} bet
 * @param {{boardFeatures?: (BoardCellFeature | null)[][], isFreeSpinRound?: boolean, multiplierConfig?: typeof MULTIPLIER_CONFIG, freeSpinConfig?: typeof FREE_SPIN_CONFIG, bonusConfig?: typeof BONUS_CONFIG, symbolMap?: Record<string, SymbolDefinition>}} [options]
 * @returns {WinResult}
 */
function evaluateBoard(board, bet, options = {}) {
  const paylineResult = evaluatePaylines(board, bet, options);
  const scatterResult = evaluateScatters(board, bet, options.freeSpinConfig, options.symbolMap);
  const bonusResult = evaluateBonuses(board, options.bonusConfig);
  const winningCellKeys = new Set([
    ...paylineResult.winningCellKeys,
    ...scatterResult.winningCellKeys
  ]);

  return {
    totalWin: paylineResult.totalWin + scatterResult.totalWin,
    freeSpinsAwarded: scatterResult.freeSpinsAwarded,
    appliedMultiplier: paylineResult.appliedMultiplier,
    scatterCount: scatterResult.scatterCount,
    bonusTriggered: bonusResult.bonusTriggered,
    winningCells: createWinningCells(winningCellKeys),
    activeHorizontalLines: Array.from(paylineResult.activeHorizontalLines),
    lineWins: paylineResult.lineWins
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
    return JACKPOTS.grand;
  }

  if (isWildHorizontalLine(board, 0) || isWildHorizontalLine(board, 2)) {
    return JACKPOTS.major;
  }

  if (isWildHorizontalLine(board, 1)) {
    return JACKPOTS.mini;
  }

  return null;
}

/**
 * Resolves rare random jackpot hits for paid spins.
 * @param {{randomOdds: {mini: number, major: number}}} [jackpotConfig]
 * @param {() => number} [random]
 * @returns {"mini" | "major" | null}
 */
function rollRandomJackpotTier(jackpotConfig = JACKPOT_CONFIG, random = Math.random) {
  if (randomInteger(jackpotConfig.randomOdds.major, random) === 0) {
    return JACKPOTS.major;
  }

  if (randomInteger(jackpotConfig.randomOdds.mini, random) === 0) {
    return JACKPOTS.mini;
  }

  return null;
}

/**
 * Returns jackpot pots with every tier coerced to a safe numeric value.
 * @param {Partial<Record<"mini" | "major" | "grand", number>> | null | undefined} jackpots
 * @returns {{mini: number, major: number, grand: number}}
 */
function sanitizeJackpotPots(jackpots) {
  const source = jackpots && typeof jackpots === "object" ? jackpots : {};

  return {
    mini: Number.isFinite(source.mini) ? Math.max(JACKPOT_CONFIG.startingValues.mini, source.mini) : JACKPOT_CONFIG.startingValues.mini,
    major: Number.isFinite(source.major) ? Math.max(JACKPOT_CONFIG.startingValues.major, source.major) : JACKPOT_CONFIG.startingValues.major,
    grand: Number.isFinite(source.grand) ? Math.max(JACKPOT_CONFIG.startingValues.grand, source.grand) : JACKPOT_CONFIG.startingValues.grand
  };
}

/**
 * Computes the jackpot contribution for a single tier.
 * @param {number} bet
 * @param {"mini" | "major" | "grand"} tier
 * @returns {number}
 */
function getJackpotContribution(bet, tier) {
  const numericBet = Number(bet);

  if (!Number.isFinite(numericBet) || numericBet <= 0 || !Number.isFinite(JACKPOT_CONFIG.contributionRates[tier])) {
    return 0;
  }

  return Math.max(JACKPOT_CONFIG.minimumContribution, Math.round(numericBet * JACKPOT_CONFIG.contributionRates[tier]));
}

/**
 * Applies per-spin contributions to progressive jackpots.
 * @param {number} bet
 * @returns {boolean}
 */
function contributeToJackpots(bet) {
  const contributions = {
    mini: getJackpotContribution(bet, JACKPOTS.mini),
    major: getJackpotContribution(bet, JACKPOTS.major),
    grand: getJackpotContribution(bet, JACKPOTS.grand)
  };

  state.jackpots = sanitizeJackpotPots(state.jackpots);

  if (Object.values(contributions).every((amount) => amount === 0)) {
    saveJackpotPots(state.jackpots);
    return false;
  }

  state.jackpots.mini += contributions.mini;
  state.jackpots.major += contributions.major;
  state.jackpots.grand += contributions.grand;
  saveJackpotPots(state.jackpots);
  return true;
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
 * Updates text displays, settings controls, and disabled states.
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

  renderSettingsControls();
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
  const masterVolume = getEffectiveVolume(state.audioSettings);

  if (!context || masterVolume <= AUDIO_SETTINGS_CONFIG.minVolume) {
    return;
  }

  try {
    const now = context.currentTime;

    if (type === AUDIO_CUES.spin) {
      for (let step = 0; step < 8; step += 1) {
        playTone(context, now + step * 0.055, 0.075, 210 + step * 18, 120 + step * 10, "sawtooth", 0.028 * masterVolume);
      }
      return;
    }

    if (type === AUDIO_CUES.reelStop) {
      playTone(context, now, 0.07, 330, 180, "square", 0.035 * masterVolume);
      return;
    }

    if (type === AUDIO_CUES.bigWin) {
      [392, 523, 659, 784, 988, 1319].forEach((frequency, index) => {
        playTone(context, now + index * 0.08, 0.2, frequency, frequency * 1.28, "sawtooth", 0.065 * masterVolume);
      });
      playTone(context, now, 0.62, 164, 392, "triangle", 0.045 * masterVolume);
      playTone(context, now + 0.16, 0.54, 246, 523, "square", 0.03 * masterVolume);
      return;
    }

    if (type === AUDIO_CUES.jackpot) {
      [523, 659, 784, 1047, 1319].forEach((frequency, index) => {
        playTone(context, now + index * 0.095, 0.18, frequency, frequency * 1.18, "triangle", 0.07 * masterVolume);
      });
      playTone(context, now + 0.08, 0.5, 196, 392, "sine", 0.035 * masterVolume);
      return;
    }

    [523, 659, 784].forEach((frequency, index) => {
      playTone(context, now + index * 0.09, 0.16, frequency, frequency * 1.08, "triangle", 0.06 * masterVolume);
    });
  } catch (error) {
    console.warn(UI_TEXT.warnings.audioPlaybackFailed, error);
  }
}

/**
 * Sets the main game message.
 * @param {string} text
 * @param {boolean} isBigWin
 */
function setMessage(text, isBigWin = false) {
  const message = document.getElementById("statusMessage");
  if (!message) {
    return;
  }

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

  if (!popup || !popupLabel || !popupAmount) {
    return;
  }

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
  }, FEEDBACK_CONFIG.winPopupDurationMs);
}

/**
 * Hides any active win popup.
 */
function hideWinPopup() {
  const popup = document.getElementById("winPopup");

  window.clearTimeout(popupTimeout);
  if (!popup) {
    return;
  }

  popup.classList.remove("show", "jackpot", "big-win");
  popup.setAttribute("aria-hidden", "true");
}

/**
 * Clears the active celebration visuals for the provided overlay.
 * @param {string} overlayId
 */
function clearCelebration(overlayId) {
  const celebration = document.getElementById(overlayId);
  if (!celebration) {
    return;
  }

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
  if (!celebration) {
    return;
  }

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
  setMessage(UI_TEXT.messages.bigWin, true);
  showWinPopup(UI_TEXT.messages.bigWin, amount, "big-win");
  playSound(SOUNDS.bigWin);
  populateCoinBurst(celebration, FEEDBACK_CONFIG.bigWinCelebrationCoins);
  if (!celebration) {
    return;
  }

  celebration.classList.add("show");
  celebration.setAttribute("aria-hidden", "false");
  bigWinTimeout = window.setTimeout(clearBigWinCelebration, FEEDBACK_CONFIG.bigWinCelebrationDurationMs);
}

/**
 * Triggers jackpot-specific celebration visuals.
 * @param {"mini" | "major" | "grand"} tier
 * @param {number} amount
 */
function triggerJackpotFeedback(tier, amount) {
  const celebration = document.getElementById("jackpotCelebration");

  if (!celebration) {
    return;
  }

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
  setMessage(`${tier.toUpperCase()} ${UI_TEXT.messages.jackpotPaidSuffix}`, true);
  showWinPopup(`${tier.toUpperCase()} Jackpot`, amount, "jackpot");
  playSound(SOUNDS.jackpot);
  bigWinTimeout = window.setTimeout(clearBigWinCelebration, FEEDBACK_CONFIG.jackpotCelebrationDurationMs);
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
 * @param {typeof BONUS_CONFIG} [bonusConfig]
 * @param {() => number} [random]
 * @returns {BonusPrize[]}
 */
function createBonusPrizes(bet, bonusConfig = BONUS_CONFIG, random = Math.random) {
  const coinValue = (multiplier) => bet * multiplier;
  return shuffleArray([
    { type: BONUS_REWARD_TYPES.coins, label: bonusConfig.labels.coinsSmall, value: coinValue(bonusConfig.values.coinsSmallMultiplier) },
    { type: BONUS_REWARD_TYPES.coins, label: bonusConfig.labels.coinsMedium, value: coinValue(bonusConfig.values.coinsMediumMultiplier) },
    { type: BONUS_REWARD_TYPES.coins, label: bonusConfig.labels.coinsLarge, value: coinValue(bonusConfig.values.coinsLargeMultiplier) },
    { type: BONUS_REWARD_TYPES.multiplier, label: bonusConfig.labels.multiplier, value: bonusConfig.values.bonusMultiplier },
    { type: BONUS_REWARD_TYPES.freeSpins, label: bonusConfig.labels.freeSpins, value: bonusConfig.values.bonusFreeSpins },
    { type: BONUS_REWARD_TYPES.collect, label: bonusConfig.labels.collect, value: 0 }
  ], random);
}

/**
 * Returns a shuffled copy of an array.
 * @template T
 * @param {T[]} values
 * @param {() => number} [random]
 * @returns {T[]}
 */
function shuffleArray(values, random = Math.random) {
  const nextValues = [...values];

  for (let index = nextValues.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInteger(index + 1, random);
    const currentValue = nextValues[index];
    nextValues[index] = nextValues[swapIndex];
    nextValues[swapIndex] = currentValue;
  }

  return nextValues;
}

/**
 * Creates a deterministic pseudo-random generator for simulations and tests.
 * @param {number} seed
 * @returns {() => number}
 */
function createSeededRandom(seed) {
  let stateSeed = Number.isInteger(seed) ? seed >>> 0 : 1;

  return () => {
    stateSeed += 0x6D2B79F5;
    let value = stateSeed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Buckets a win ratio into a coarse distribution band.
 * @param {number} winRatio
 * @param {{small: number, medium: number, large: number}} thresholds
 * @returns {"loss" | "small" | "medium" | "large" | "huge"}
 */
function classifyWinRatio(winRatio, thresholds) {
  if (!Number.isFinite(winRatio) || winRatio <= 0) {
    return "loss";
  }

  if (winRatio < thresholds.small) {
    return "small";
  }

  if (winRatio < thresholds.medium) {
    return "medium";
  }

  if (winRatio < thresholds.large) {
    return "large";
  }

  return "huge";
}

/**
 * Simulates one random bonus round without altering live game state.
 * @param {number} bet
 * @param {typeof BONUS_CONFIG} bonusConfig
 * @param {() => number} random
 * @returns {{coinWin: number, freeSpinsAwarded: number}}
 */
function simulateBonusRoundOutcome(bet, bonusConfig, random) {
  const prizes = createBonusPrizes(bet, bonusConfig, random);
  let coinWin = 0;
  let freeSpinsAwarded = 0;
  let bonusMultiplier = 1;
  let picksMade = 0;

  for (const prize of prizes) {
    if (prize.type === BONUS_REWARD_TYPES.collect || picksMade >= bonusConfig.maxPicks) {
      break;
    }

    if (prize.type === BONUS_REWARD_TYPES.coins) {
      coinWin += prize.value * bonusMultiplier;
      picksMade += 1;
      continue;
    }

    if (prize.type === BONUS_REWARD_TYPES.multiplier) {
      bonusMultiplier *= prize.value;
      picksMade += 1;
      continue;
    }

    if (prize.type === BONUS_REWARD_TYPES.freeSpins) {
      freeSpinsAwarded += prize.value;
      picksMade += 1;
    }
  }

  return { coinWin, freeSpinsAwarded };
}

/**
 * Simulates a paid-spin sample using one probability profile.
 * @param {number} spinCount
 * @param {{profileName?: string, bet?: number, seed?: number}} [options]
 * @returns {{
 *   profileName: string,
 *   spinCount: number,
 *   paidSpinCount: number,
 *   resolvedSpinCount: number,
 *   hitFrequency: number,
 *   paidHitFrequency: number,
 *   rtp: number,
 *   averageReturnPerPaidSpin: number,
 *   averageFreeSpinsPerPaidSpin: number,
 *   bonusFrequency: number,
 *   scatterFrequency: number,
 *   jackpotFrequency: number,
 *   distribution: {loss: number, small: number, medium: number, large: number, huge: number}
 * }}
 */
function simulateSpins(spinCount, options = {}) {
  const profileName = typeof options.profileName === "string" ? options.profileName : ACTIVE_PROBABILITY_PROFILE;
  const sampleSize = Number(spinCount);

  if (!Number.isInteger(sampleSize) || sampleSize <= 0) {
    throw new RangeError("simulateSpins requires a positive integer spinCount.");
  }

  const bet = Number.isFinite(Number(options.bet)) && Number(options.bet) > 0
    ? Number(options.bet)
    : PROBABILITY_CONFIG.simulation.defaultBet;
  const profile = getProbabilityProfile(profileName);
  const symbols = createSymbolsForProfile(profileName);
  const symbolMap = symbols.reduce((map, symbol) => {
    map[symbol.id] = symbol;
    return map;
  }, {});
  const weightedSymbolIds = buildWeightedSymbolIds(symbols);
  const random = createSeededRandom(Number.isInteger(options.seed) ? options.seed : 20260422);
  const distribution = {
    loss: 0,
    small: 0,
    medium: 0,
    large: 0,
    huge: 0
  };
  let paidSpinCount = 0;
  let resolvedSpinCount = 0;
  let hitCount = 0;
  let totalBet = 0;
  let totalReturn = 0;
  let totalFreeSpinsConsumed = 0;
  let totalBonusTriggers = 0;
  let totalScatterTriggers = 0;
  let totalJackpots = 0;
  let queuedFreeSpins = 0;

  /**
   * Resolves one spin under the selected profile.
   * @param {boolean} isFreeSpinRound
   * @returns {{cycleReturn: number, awardedFreeSpins: number, result: WinResult, jackpotTier: string | null}}
   */
  function resolveSimulationSpin(isFreeSpinRound) {
    const board = createBoard({ weightedSymbolIds, random });
    const boardFeatures = createBoardFeatureGrid(board, {
      multiplierConfig: profile.multiplier,
      random
    });
    const result = evaluateBoard(board, bet, {
      boardFeatures,
      isFreeSpinRound,
      multiplierConfig: profile.multiplier,
      freeSpinConfig: profile.freeSpins,
      bonusConfig: BONUS_CONFIG,
      symbolMap
    });
    const jackpotTier = isFreeSpinRound ? null : (determineJackpotTier(board) || rollRandomJackpotTier(profile.jackpot, random));
    let cycleReturn = result.totalWin;
    let awardedFreeSpins = result.freeSpinsAwarded;

    if (result.bonusTriggered) {
      const bonusOutcome = simulateBonusRoundOutcome(bet, BONUS_CONFIG, random);
      cycleReturn += bonusOutcome.coinWin;
      awardedFreeSpins += bonusOutcome.freeSpinsAwarded;
    }

    if (jackpotTier) {
      cycleReturn += JACKPOT_CONFIG.startingValues[jackpotTier];
    }

    return {
      cycleReturn,
      awardedFreeSpins,
      result,
      jackpotTier
    };
  }

  for (let spinIndex = 0; spinIndex < sampleSize; spinIndex += 1) {
    paidSpinCount += 1;
    resolvedSpinCount += 1;
    totalBet += bet;

    const paidSpin = resolveSimulationSpin(false);
    const paidSpinRatio = paidSpin.cycleReturn / bet;

    totalReturn += paidSpin.cycleReturn;
    queuedFreeSpins += paidSpin.awardedFreeSpins;
    if (paidSpin.cycleReturn > 0 || paidSpin.awardedFreeSpins > 0 || paidSpin.result.bonusTriggered) {
      hitCount += 1;
    }

    distribution[classifyWinRatio(paidSpinRatio, PROBABILITY_CONFIG.simulation.distributionThresholds)] += 1;

    if (paidSpin.result.freeSpinsAwarded > 0) {
      totalScatterTriggers += 1;
    }

    if (paidSpin.result.bonusTriggered) {
      totalBonusTriggers += 1;
    }

    if (paidSpin.jackpotTier) {
      totalJackpots += 1;
    }

    while (queuedFreeSpins > 0) {
      queuedFreeSpins -= 1;
      totalFreeSpinsConsumed += 1;
      resolvedSpinCount += 1;

      const freeSpin = resolveSimulationSpin(true);
      totalReturn += freeSpin.cycleReturn;
      queuedFreeSpins += freeSpin.awardedFreeSpins;
    }
  }

  return {
    profileName,
    spinCount: sampleSize,
    paidSpinCount,
    resolvedSpinCount,
    hitFrequency: hitCount / paidSpinCount,
    paidHitFrequency: hitCount / paidSpinCount,
    rtp: totalReturn / totalBet,
    averageReturnPerPaidSpin: totalReturn / paidSpinCount,
    averageFreeSpinsPerPaidSpin: totalFreeSpinsConsumed / paidSpinCount,
    bonusFrequency: totalBonusTriggers / paidSpinCount,
    scatterFrequency: totalScatterTriggers / paidSpinCount,
    jackpotFrequency: totalJackpots / paidSpinCount,
    distribution
  };
}

/**
 * Registers an event listener and remembers how to remove it during teardown.
 * @param {EventTarget | null | undefined} target
 * @param {string} type
 * @param {EventListenerOrEventListenerObject} handler
 * @param {AddEventListenerOptions | boolean} [options]
 * @returns {() => void}
 */
function addManagedEventListener(target, type, handler, options) {
  if (!target || typeof target.addEventListener !== "function" || typeof target.removeEventListener !== "function") {
    return () => {};
  }

  target.addEventListener(type, handler, options);

  let isRemoved = false;
  const cleanup = () => {
    if (isRemoved) {
      return;
    }

    target.removeEventListener(type, handler, options);
    isRemoved = true;
  };

  managedEventCleanups.push(cleanup);
  return cleanup;
}

/**
 * Removes every managed listener currently registered by the game.
 * @returns {void}
 */
function removeManagedEventListeners() {
  while (managedEventCleanups.length > 0) {
    const cleanup = managedEventCleanups.pop();
    cleanup();
  }
}

/**
 * Checks whether an element can receive focus in a modal trap.
 * @param {Element | null} element
 * @returns {element is HTMLElement}
 */
function isFocusableElement(element) {
  return Boolean(
    element
    && typeof element.focus === "function"
    && !element.hasAttribute("disabled")
    && element.getAttribute("aria-hidden") !== "true"
  );
}

/**
 * Returns visible focus targets inside a modal container.
 * @param {HTMLElement} container
 * @param {typeof FOCUS_TRAP_CONFIG} [config]
 * @returns {HTMLElement[]}
 */
function getFocusableElements(container, config = FOCUS_TRAP_CONFIG) {
  if (!container || typeof container.querySelectorAll !== "function") {
    return [];
  }

  return Array.from(container.querySelectorAll(config.focusableSelector)).filter(isFocusableElement);
}

/**
 * Applies or removes background interaction blocking while a modal is open.
 * @param {boolean} isBlocked
 * @param {typeof FOCUS_TRAP_CONFIG} [config]
 * @returns {void}
 */
function setBackgroundInteractionBlocked(isBlocked, config = FOCUS_TRAP_CONFIG) {
  if (typeof document === "undefined") {
    return;
  }

  const blockedElement = document.querySelector(config.blockedElementSelector);
  if (!blockedElement) {
    return;
  }

  if (isBlocked) {
    blockedElement.setAttribute("aria-hidden", "true");
    blockedElement.inert = true;
    return;
  }

  blockedElement.removeAttribute("aria-hidden");
  blockedElement.inert = false;
}

/**
 * Moves focus back inside the active modal if the browser tries to escape it.
 * @returns {void}
 */
function focusFirstModalElement() {
  if (!activeFocusTrap) {
    return;
  }

  const focusableElements = getFocusableElements(activeFocusTrap.panel);
  const nextElement = focusableElements[0] || activeFocusTrap.panel;

  if (isFocusableElement(nextElement)) {
    nextElement.focus();
  }
}

/**
 * Keeps Tab and Shift+Tab navigation inside the active modal overlay.
 * @param {KeyboardEvent} event
 * @returns {void}
 */
function handleFocusTrapKeydown(event) {
  if (!activeFocusTrap || event.key !== "Tab") {
    return;
  }

  const focusableElements = getFocusableElements(activeFocusTrap.panel);

  if (focusableElements.length === 0) {
    event.preventDefault();
    activeFocusTrap.panel.focus();
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  const activeElement = document.activeElement;
  const isOutsideTrap = !activeFocusTrap.panel.contains(activeElement);

  if (event.shiftKey && (activeElement === firstElement || isOutsideTrap)) {
    event.preventDefault();
    lastElement.focus();
    return;
  }

  if (!event.shiftKey && (activeElement === lastElement || isOutsideTrap)) {
    event.preventDefault();
    firstElement.focus();
  }
}

/**
 * Redirects focus back into the active modal if background content is targeted.
 * @param {FocusEvent} event
 * @returns {void}
 */
function handleFocusTrapFocusIn(event) {
  if (!activeFocusTrap || activeFocusTrap.panel.contains(event.target)) {
    return;
  }

  focusFirstModalElement();
}

/**
 * Starts focus trapping for an overlay and blocks background controls.
 * @param {HTMLElement} overlay
 * @param {HTMLElement} panel
 * @returns {void}
 */
function activateFocusTrap(overlay, panel) {
  if (!overlay || !panel || activeFocusTrap?.overlay === overlay) {
    return;
  }

  deactivateFocusTrap();

  const previousFocus = isFocusableElement(document.activeElement) ? document.activeElement : null;
  panel.setAttribute("tabindex", "-1");
  setBackgroundInteractionBlocked(true);

  const cleanupKeydown = addManagedEventListener(overlay, "keydown", handleFocusTrapKeydown);
  const cleanupFocusIn = addManagedEventListener(document, "focusin", handleFocusTrapFocusIn);

  activeFocusTrap = {
    overlay,
    panel,
    previousFocus,
    cleanup: () => {
      cleanupKeydown();
      cleanupFocusIn();
    }
  };

  window.requestAnimationFrame(focusFirstModalElement);
}

/**
 * Stops any active modal focus trap and restores background interaction.
 * @returns {void}
 */
function deactivateFocusTrap() {
  if (!activeFocusTrap) {
    setBackgroundInteractionBlocked(false);
    return;
  }

  const focusTrap = activeFocusTrap;
  activeFocusTrap = null;
  focusTrap.cleanup();
  setBackgroundInteractionBlocked(false);

  if (isFocusableElement(focusTrap.previousFocus)) {
    focusTrap.previousFocus.focus();
  }
}

/**
 * Opens or closes the settings overlay.
 * @param {boolean} isOpen
 */
function setSettingsOpen(isOpen) {
  const overlay = document.getElementById("settingsOverlay");
  const panel = overlay ? overlay.querySelector("[role='dialog']") : null;

  if (!overlay || !panel) {
    return;
  }

  overlay.classList.toggle("show", isOpen);
  overlay.setAttribute("aria-hidden", String(!isOpen));

  if (isOpen) {
    activateFocusTrap(overlay, panel);
    return;
  }

  if (activeFocusTrap?.overlay === overlay) {
    deactivateFocusTrap();
  }
}

/**
 * Opens or closes the bonus overlay.
 * @param {boolean} isOpen
 * @returns {void}
 */
function setBonusOpen(isOpen) {
  const bonusElements = getBonusRoundElements();

  if (!bonusElements) {
    return;
  }

  const { overlay, crates } = bonusElements;
  overlay.classList.toggle(BONUS_UI_CONFIG.classNames.overlayVisible, isOpen);
  overlay.setAttribute("aria-hidden", String(!isOpen));

  if (isOpen) {
    syncBonusModalLayout(bonusElements);
    crates.scrollTop = 0;
    activateFocusTrap(overlay, bonusElements.panel);
    return;
  }

  if (activeFocusTrap?.overlay === overlay) {
    deactivateFocusTrap();
  }
}

/**
 * Renders bonus-round status and crate state.
 * @returns {void}
 */
function renderBonusRound() {
  const bonusState = state.bonusRound;

  if (!isValidBonusRoundState(bonusState)) {
    return;
  }

  const bonusElements = getBonusRoundElements();

  if (!bonusElements) {
    return;
  }

  syncBonusModalLayout(bonusElements);
  renderBonusStatus(bonusElements.status, bonusState);
  renderBonusCrates(bonusElements.crates, bonusState);
}

/**
 * Starts the pick-a-crate bonus round.
 * @returns {void}
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

  setMessage(UI_TEXT.messages.pickCrate);
  setBonusOpen(true);
  renderBonusRound();
  updateDisplays();
}

/**
 * Finalizes the bonus round and applies its rewards.
 * @returns {void}
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
  setMessage(`${UI_TEXT.messages.bonusWinPrefix} ${bonusState.totalCoins}${freeSpinText}`);
  showWinPopup(`Bonus Win x${bonusState.bonusMultiplier}`, bonusState.totalCoins);
  updateDisplays();

  if (bonusState.freeSpinsAwarded > 0) {
    showFreeSpinRewardFeedback(bonusState.freeSpinsAwarded, "bonus-round");
  }
}

/**
 * Applies a selected crate prize to the active bonus round.
 * @param {number} crateIndex
 * @returns {void}
 */
function resolveBonusPick(crateIndex) {
  const bonusState = state.bonusRound;
  if (!bonusState || !bonusState.prizes[crateIndex]) {
    return;
  }

  const prize = bonusState.prizes[crateIndex];
  const crateButtons = Array.from(document.querySelectorAll(BONUS_UI_CONFIG.selectors.crateButton));
  const button = crateButtons[crateIndex];

  if (!button || button.disabled || bonusState.revealedCrates[crateIndex]) {
    return;
  }

  if (!Object.values(BONUS_REWARD_TYPES).includes(prize.type)) {
    console.warn(`${UI_TEXT.warnings.unknownBonusPrizeType}: ${prize.type}`, prize);
    return;
  }

  bonusState.revealedCrates[crateIndex] = true;
  button.disabled = true;
  button.className = getBonusCrateStateClasses({ isSelected: true, isRevealed: true, isDisabled: true });
  button.setAttribute("aria-pressed", "true");

  if (prize.type === BONUS_REWARD_TYPES.coins) {
    bonusState.totalCoins += prize.value * bonusState.bonusMultiplier;
    bonusState.picksMade += 1;
  } else if (prize.type === BONUS_REWARD_TYPES.multiplier) {
    bonusState.bonusMultiplier *= prize.value;
    bonusState.picksMade += 1;
  } else if (prize.type === BONUS_REWARD_TYPES.freeSpins) {
    bonusState.freeSpinsAwarded += prize.value;
    bonusState.picksMade += 1;
  } else if (prize.type === BONUS_REWARD_TYPES.collect) {
    // Collect intentionally ends the round without changing totals.
  } else {
    return;
  }

  const shouldFinish = prize.type === BONUS_REWARD_TYPES.collect || bonusState.picksMade >= BONUS_CONFIG.maxPicks;
  const resultMessage = prize.type === BONUS_REWARD_TYPES.collect ? UI_TEXT.messages.bonusCollected : `Revealed ${prize.label}`;
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

  if (result.totalWin >= state.bet * FEEDBACK_CONFIG.bigWinThresholdBetMultiplier) {
    triggerBigWinFeedback(result.totalWin);
  } else if (result.totalWin > 0) {
    setMessage(getStatusMessage(result));
    showWinPopup(getWinLabel(result), result.totalWin);
    playSound(SOUNDS.win);
  } else if (result.freeSpinsAwarded > 0) {
    setMessage(getStatusMessage(result));
  } else {
    setMessage(UI_TEXT.messages.noWin);
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
 * Clears interval and timeout handles for an active spin object.
 * @param {{intervals?: number[], timeouts?: number[], reels?: Element[]} | null} spinRecord
 * @returns {void}
 */
function clearActiveSpinTimers(spinRecord) {
  if (!spinRecord) {
    return;
  }

  if (typeof window === "undefined") {
    return;
  }

  if (Array.isArray(spinRecord.intervals)) {
    spinRecord.intervals.forEach((intervalId) => window.clearInterval(intervalId));
    spinRecord.intervals.length = 0;
  }

  if (Array.isArray(spinRecord.timeouts)) {
    spinRecord.timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    spinRecord.timeouts.length = 0;
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

  clearActiveSpinTimers(spinToFinish);
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
      playSound(SOUNDS.reelStop);
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
  const spinTiming = getSpinTiming(state.spinSpeed);

  if (state.isSpinning || state.isBonusActive || (!usedFreeSpin && state.balance < state.bet)) {
    return;
  }

  state.isSpinning = true;
  clearWinHighlights();
  clearNearMissVisuals();
  hideWinPopup();
  clearBigWinCelebration();
  setMessage(usedFreeSpin ? `Free spin rolling (x${FREE_SPIN_CONFIG.multiplier})` : UI_TEXT.messages.reelsSpinning);

  if (usedFreeSpin) {
    state.freeSpins -= 1;
  } else {
    state.balance -= state.bet;
    contributeToJackpots(state.bet);
  }

  updateDisplays();
  playSound(SOUNDS.spin);

  const nextBoard = createBoard();
  const nextBoardFeatures = createBoardFeatureGrid(nextBoard);
  const nextResult = evaluateBoard(nextBoard, state.bet, { boardFeatures: nextBoardFeatures, isFreeSpinRound: usedFreeSpin });
  const jackpotTier = usedFreeSpin ? null : determineJackpotTier(nextBoard) || rollRandomJackpotTier();
  const nearMissPlan = selectNearMissPlan(nextBoard, nextResult, {
    usedFreeSpin,
    fastPlayEnabled: state.spinSpeed === "skip",
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
    spinTiming,
    reels,
    intervals,
    timeouts
  };

  if (state.spinSpeed === "skip") {
    finishActiveSpin();
    return;
  }

  reels.forEach((reelElement, reelIndex) => {
    const interval = window.setInterval(() => renderSpinStrip(reelElement, reelIndex), spinTiming.spinStripIntervalMs);
    let stopDelay = spinTiming.reelStopBaseMs + reelIndex * spinTiming.reelStopStepMs;

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
      playSound(SOUNDS.reelStop);
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
    console.warn(UI_TEXT.warnings.keyboardSpinActivationFailed, error);
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

  triggerBigWinFeedback(state.bet * FEEDBACK_CONFIG.bigWinThresholdBetMultiplier);
}

/**
 * Adds keyboard shortcuts and returns the matching cleanup function.
 * @param {Document} eventTarget
 * @returns {() => void}
 */
function wireKeyboardShortcuts(eventTarget = document) {
  return addManagedEventListener(eventTarget, "keydown", handleDocumentKeydown);
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
    addManagedEventListener(window, "pagehide", cleanupKeyboardShortcuts);
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
 * Tears down timers, listeners, and transient overlay state without resetting saved gameplay state.
 * @returns {void}
 */
function destroyGame() {
  clearActiveSpinTimers(activeSpin);
  activeSpin = null;
  state.isSpinning = false;

  if (typeof window !== "undefined") {
    window.clearTimeout(popupTimeout);
    window.clearTimeout(bigWinTimeout);
    window.clearTimeout(rewardFeedbackTimeout);
  }

  popupTimeout = 0;
  bigWinTimeout = 0;
  rewardFeedbackTimeout = 0;

  cleanupKeyboardShortcuts();
  deactivateFocusTrap();
  removeManagedEventListeners();
  setBackgroundInteractionBlocked(false);

  isGameInitialized = false;
  pagehideCleanupRegistered = false;
}

/**
 * Wires UI events once the document is ready.
 * @returns {void}
 */
function initializeGame() {
  try {
    if (isGameInitialized) {
      return;
    }

    isGameInitialized = true;
    state.spinSpeed = loadSpinSpeedPreference();
    state.audioSettings = loadAudioSettings();
    state.jackpots = loadJackpotPots();
    const dailyReward = grantDailyLoginReward();
    renderBoard(state.board, state.boardFeatures);
    updateDisplays();
    addManagedEventListener(document.getElementById("spinButton"), "click", handleSpinButtonClick);
    addManagedEventListener(document.getElementById("decreaseBetButton"), "click", () => changeBet(-1));
    addManagedEventListener(document.getElementById("increaseBetButton"), "click", () => changeBet(1));
    addManagedEventListener(document.getElementById("settingsButton"), "click", () => {
      const overlay = document.getElementById("settingsOverlay");
      if (!overlay) {
        return;
      }

      setSettingsOpen(overlay.getAttribute("aria-hidden") === "true");
    });
    addManagedEventListener(document.getElementById("settingsOverlay"), "click", (event) => {
      if (event?.target?.id === "settingsOverlay") {
        setSettingsOpen(false);
      }
    });

    const speedOptions = document.querySelector(".settings-speed-options");
    if (speedOptions) {
      addManagedEventListener(speedOptions, "click", handleSpinSpeedButtonClick);
    }

    const volumeSlider = document.getElementById(AUDIO_SETTINGS_CONFIG.sliderId);
    const volumeMuteButton = document.getElementById(AUDIO_SETTINGS_CONFIG.muteButtonId);

    if (volumeSlider) {
      addManagedEventListener(volumeSlider, "input", handleVolumeSliderInput);
    }

    if (volumeMuteButton) {
      addManagedEventListener(volumeMuteButton, "click", handleVolumeMuteButtonClick);
    }

    const bonusCrates = document.getElementById(BONUS_UI_CONFIG.elementIds.crates);
    if (bonusCrates) {
      addManagedEventListener(bonusCrates, BONUS_UI_CONFIG.events.click, (event) => {
        const button = event?.target?.closest?.(BONUS_UI_CONFIG.selectors.crateButton) || null;
        if (!button) {
          return;
        }

        resolveBonusPick(Number(button.dataset.crateIndex));
      });
      addManagedEventListener(bonusCrates, BONUS_UI_CONFIG.events.pointerOver, (event) => handleBonusCratePointerState(event, true));
      addManagedEventListener(bonusCrates, BONUS_UI_CONFIG.events.pointerOut, (event) => handleBonusCratePointerState(event, false));
      addManagedEventListener(bonusCrates, BONUS_UI_CONFIG.events.focusIn, (event) => handleBonusCrateFocusState(event, true));
      addManagedEventListener(bonusCrates, BONUS_UI_CONFIG.events.focusOut, (event) => handleBonusCrateFocusState(event, false));
    }
    mountKeyboardShortcuts();

    if (dailyReward) {
      showRewardFeedback(dailyReward);
    }
  } catch (error) {
    isGameInitialized = false;
    console.error(UI_TEXT.warnings.initializeFailed, error);
    setMessage("Game setup failed. Refresh to retry.");
  }
}

if (typeof document !== "undefined") {
  addManagedEventListener(document, "DOMContentLoaded", initializeGame);
  addManagedEventListener(window, "resize", () => {
    syncBonusModalLayout();
  });
}

if (typeof module !== "undefined") {
  module.exports = {
    AUDIO_SETTINGS_CONFIG,
    BONUS_CRATE_STATE_KEYS,
    BONUS_CONFIG,
    BONUS_MODAL_LAYOUT_CONFIG,
    BONUS_UI_CONFIG,
    FEEDBACK_CONFIG,
    FOCUS_TRAP_CONFIG,
    FREE_SPIN_CONFIG,
    GAME_LIMITS,
    JACKPOTS,
    JACKPOT_CONFIG,
    KEYBOARD_CONFIG,
    RETENTION_CONFIG,
    STORAGE_KEYS,
    SPIN_SPEED_CONFIG,
    MULTIPLIER_CONFIG,
    NEAR_MISS_CONFIG,
    BADGE_ART_CONFIG,
    CACTUS_ART_CONFIG,
    COWBOY_ART_CONFIG,
    SYMBOL_IDS,
    BONUS_REWARD_TYPES,
    AUDIO_CUES,
    SOUNDS,
    UI_TEXT,
    PAYLINES,
    PAYLINE_RENDER_CONFIG,
    PROBABILITY_CONFIG,
    SYMBOL_ART_CONFIG,
    SYMBOLS,
    state,
    applyRewardToState,
    applySpinSpeed,
    buildWeightedSymbolIds,
    clampBet,
    clampVolume,
    countSymbol,
    createBoard,
    createDateKey,
    createBoardFeatureGrid,
    createBonusCrateViewModel,
    createBonusModalLayoutState,
    createBonusStatusViewModel,
    createBonusPrizes,
    createBootsSymbolArt,
    createCactusSymbolArt,
    createCowboySymbolArt,
    createDefaultAudioSettings,
    createEmptyFeatureGrid,
    createMatchedPositions,
    createNearMissPlanForPattern,
    createRewardFeedbackContent,
    createBonusIconMarkup,
    createWinningCells,
    createDynamiteSymbolArt,
    createInlineSymbolSvg,
    createSeededRandom,
    createSymbolsForProfile,
    createSymbolArtContent,
    createWildSymbolArt,
    determineJackpotTier,
    destroyGame,
    escapeHtml,
    evaluateBonuses,
    evaluateBoard,
    evaluatePaylines,
    evaluateScatters,
    getEffectiveVolume,
    getBonusCrateStateClass,
    getBonusCrateStateClasses,
    getBonusRewardClassName,
    getBonusRewardIconKey,
    getBonusRewardUiConfig,
    getProbabilityProfile,
    getSpinTiming,
    getSymbolDefinition,
    getSymbolArtAttributes,
    getFreeSpinAward,
    getLeftToRightMatch,
    getLineMultiplier,
    getJackpotContribution,
    getFocusableElements,
    getVolumeButtonState,
    hasContiguousMatchedPositions,
    isNearMissEligible,
    isValidBonusRoundState,
    isKeyboardShortcutBlockedTarget,
    isSpinShortcutEvent,
    isFocusableElement,
    isValidSpinSpeedMode,
    isValidWinPosition,
    isWildHorizontalLine,
    loadSpinSpeedPreference,
    loadAudioSettings,
    loadJackpotPots,
    readStorageValue,
    resolveDailyLoginReward,
    resolveBadgeArtText,
    rollRandomJackpotTier,
    sanitizeAudioSettings,
    sanitizeJackpotPots,
    saveSpinSpeedPreference,
    saveAudioSettings,
    saveJackpotPots,
    serializeHtmlAttributes,
    selectNearMissPlan,
    setAudioVolumeState,
    simulateSpins,
    sliderValueToVolume,
    syncBonusModalLayout,
    shouldHandleSpinShortcut,
    shouldGrantDailyReward,
    toggleAudioMuteState,
    contributeToJackpots,
    finishActiveSpin,
    validateNearMissConfig,
    volumeToSliderValue
  };
}
