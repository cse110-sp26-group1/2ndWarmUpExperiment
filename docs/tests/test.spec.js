const path = require("path");
const { test, expect } = require("@playwright/test");
const game = require("../script.js");

/**
 * Creates a YYYY-MM-DD date key relative to today in local time.
 * @param {number} dayOffset
 * @returns {string}
 */
function createRelativeDateKey(dayOffset) {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  return game.createDateKey(date);
}

const TEST_CONFIG = {
  bet: 10,
  fileUrl: `file://${path.join(__dirname, "..", "index.html")}`,
  todayDateKey: createRelativeDateKey(0),
  previousDateKey: createRelativeDateKey(-1),
  dailyRewardStorageKey: game.STORAGE_KEYS.lastLoginDate,
  dailyRewardAmount: game.RETENTION_CONFIG.dailyLoginReward.amount,
  iconSymbolIds: {
    badge: "badge",
    boots: "boots",
    cactus: "cactus",
    cowboy: "cowboy",
    dynamite: game.SYMBOL_IDS ? game.SYMBOL_IDS.dynamite : "dynamite",
    wild: game.SYMBOL_IDS ? game.SYMBOL_IDS.wild : "wild"
  },
  iconSelectors: {
    badge: "[data-symbol='badge'] .symbol-art",
    boots: "[data-symbol='boots'] [data-symbol-icon='boots']",
    cactus: "[data-symbol='cactus'] [data-symbol-icon='cactus']",
    cowboy: "[data-symbol='cowboy'] [data-symbol-icon='cowboy']",
    dynamite: "[data-symbol='dynamite'] [data-symbol-icon='dynamite']",
    wild: "[data-symbol='wild'] [data-symbol-icon='wild']"
  },
  bonusRewardTypes: {
    coins: "coins",
    multiplier: "multiplier",
    freeSpins: "free-spins",
    collect: "collect",
    unknown: "__unknown-bonus-reward__"
  },
  bonusRewardIcons: {
    coins: "coin-stack",
    multiplier: "multiplier",
    freeSpins: "free-spins",
    collect: "jackpot-star",
    mystery: "mystery",
    hidden: "crate"
  },
  bonusSpinBoard: [
    ["dynamite", "badge", "dynamite", "k", "a"],
    ["cowboy", "dynamite", "wild", "q", "10"],
    ["boots", "cactus", "a", "k", "q"]
  ],
  freeSpinBoard: [
    ["scatter", "cowboy", "badge", "k", "q"],
    ["badge", "scatter", "wild", "wild", "wild"],
    ["a", "j", "scatter", "10", "k"]
  ],
  multiplierBoard: [
    ["cowboy", "cowboy", "cowboy", "j", "10"],
    ["wild", "wild", "wild", "wild", "cowboy"],
    ["a", "k", "q", "j", "10"]
  ],
  multiplierFeatures: [
    [null, null, null, null, null],
    [{ multiplier: 5 }, { multiplier: 5 }, null, null, null],
    [null, null, null, null, null]
  ],
  nearMissBoard: [
    ["badge", "badge", "k", "q", "10"],
    ["cowboy", "boots", "a", "j", "q"],
    ["a", "q", "j", "10", "k"]
  ],
  standardWinBoard: [
    ["badge", "badge", "badge", "q", "10"],
    ["cowboy", "boots", "cactus", "j", "q"],
    ["a", "q", "j", "10", "k"]
  ],
  twoMatchBoard: [
    ["badge", "wild", "q", "badge", "10"],
    ["cowboy", "boots", "a", "j", "q"],
    ["a", "q", "j", "10", "k"]
  ],
  wildThreeReelBoard: [
    ["wild", "badge", "wild", "q", "10"],
    ["cowboy", "boots", "a", "j", "q"],
    ["a", "q", "j", "10", "k"]
  ],
  wildFourReelBoard: [
    ["wild", "wild", "cowboy", "cowboy", "10"],
    ["badge", "boots", "a", "j", "q"],
    ["a", "q", "j", "10", "k"]
  ],
  fiveReelWinBoard: [
    ["badge", "badge", "badge", "badge", "badge"],
    ["cowboy", "boots", "a", "j", "q"],
    ["a", "q", "j", "10", "k"]
  ],
  multiLineMixedBoard: [
    ["badge", "badge", "badge", "q", "10"],
    ["cowboy", "cowboy", "cowboy", "cowboy", "cowboy"],
    ["a", "q", "j", "10", "k"]
  ],
  zigzagWinBoard: [
    ["wanted", "a", "k", "q", "10"],
    ["j", "wanted", "q", "a", "k"],
    ["10", "wild", "wanted", "j", "q"]
  ],
  jackpotBoard: [
    ["badge", "badge", "badge", "badge", "badge"],
    ["wild", "wild", "wild", "wild", "wild"],
    ["a", "k", "q", "j", "10"]
  ]
};

/**
 * Opens the game page with a controlled saved login date.
 * @param {import("@playwright/test").Page} page
 * @param {string} [lastLoginDateKey]
 */
async function gotoGame(page, lastLoginDateKey = TEST_CONFIG.todayDateKey) {
  await page.addInitScript(({ storageKey, dateKey }) => {
    try {
      window.localStorage.setItem(storageKey, dateKey);
    } catch (_error) {
      // Ignore storage bootstrapping failures in browser setup.
    }
  }, {
    storageKey: TEST_CONFIG.dailyRewardStorageKey,
    dateKey: lastLoginDateKey
  });

  await page.goto(TEST_CONFIG.fileUrl);
}

/**
 * Applies a board directly through the page's public game functions.
 * @param {import("@playwright/test").Page} page
 * @param {string[][]} board
 * @param {boolean} usedFreeSpin
 */
async function settleBoard(page, board, usedFreeSpin = false) {
  await page.evaluate(({ nextBoard, nextUsedFreeSpin }) => {
    const features = createEmptyFeatureGrid();
    state.board = nextBoard;
    state.boardFeatures = features;
    renderBoard(state.board, state.boardFeatures);
    settleSpin(state.board, state.boardFeatures, nextUsedFreeSpin);
  }, { nextBoard: board, nextUsedFreeSpin: usedFreeSpin });
}

/**
 * Creates a deterministic bonus prize set for Pick-a-Crate UI tests.
 * @param {number} [bet]
 * @returns {import("../script.js").BonusPrize[]}
 */
function createOrderedBonusPrizes(bet = TEST_CONFIG.bet) {
  const { labels, values } = game.BONUS_CONFIG;
  const rewardTypes = TEST_CONFIG.bonusRewardTypes;
  const coinValue = (multiplier) => bet * multiplier;

  return [
    { type: rewardTypes.coins, label: labels.coinsSmall, value: coinValue(values.coinsSmallMultiplier) },
    { type: rewardTypes.coins, label: labels.coinsMedium, value: coinValue(values.coinsMediumMultiplier) },
    { type: rewardTypes.freeSpins, label: labels.freeSpins, value: values.bonusFreeSpins },
    { type: rewardTypes.multiplier, label: labels.multiplier, value: values.bonusMultiplier },
    { type: rewardTypes.coins, label: labels.coinsLarge, value: coinValue(values.coinsLargeMultiplier) },
    { type: rewardTypes.collect, label: labels.collect, value: 0 }
  ];
}

/**
 * Opens the Pick-a-Crate bonus with deterministic prizes and optional state overrides.
 * @param {import("@playwright/test").Page} page
 * @param {{revealedCrates?: boolean[], statePatch?: Partial<import("../script.js").BonusRoundState>}} [options]
 */
async function openOrderedBonusRound(page, options = {}) {
  const defaultRevealedCrates = Array.from({ length: game.BONUS_CONFIG.crateCount }, () => false);

  await settleBoard(page, TEST_CONFIG.bonusSpinBoard, false);
  await page.evaluate(({ prizes, revealedCrates, statePatch }) => {
    state.bonusRound.prizes = prizes;
    state.bonusRound.revealedCrates = revealedCrates;
    Object.assign(state.bonusRound, statePatch);
    renderBonusRound();
    updateDisplays();
  }, {
    prizes: createOrderedBonusPrizes(),
    revealedCrates: options.revealedCrates || defaultRevealedCrates,
    statePatch: options.statePatch || {}
  });
}

/**
 * Asserts that a line win has exact contiguous matched positions.
 * @param {object} lineWin
 * @param {number} expectedLength
 * @param {{reel: number, row: number}[]} expectedPositions
 */
function expectLineWinPositions(lineWin, expectedLength, expectedPositions) {
  expect(lineWin.matchLength).toBe(expectedLength);
  expect(lineWin.count).toBe(expectedLength);
  expect(lineWin.matchedPositions).toEqual(expectedPositions);
  expect(lineWin.matchedPositions).toHaveLength(lineWin.matchLength);
  expect(lineWin.matchedPositions.every((position, index) => position.reel === index)).toBe(true);
  expect(lineWin.matchedPositions.some((position) => position.reel >= lineWin.matchLength)).toBe(false);
}

/**
 * Creates a deterministic pseudo-random number generator.
 * @param {number} seed
 * @returns {() => number}
 */
function createSeededRandom(seed) {
  let value = seed;

  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

/**
 * Builds a deterministic board using the game's configured symbol set.
 * @param {() => number} random
 * @returns {string[][]}
 */
function createSeededBoard(random) {
  const symbolIds = game.SYMBOLS.map((symbol) => symbol.id);

  return Array.from({ length: game.GAME_LIMITS.rowCount }, () => (
    Array.from({ length: game.GAME_LIMITS.reelCount }, () => symbolIds[Math.floor(random() * symbolIds.length)])
  ));
}

/**
 * Configures the browser game to produce a deterministic near-miss candidate board.
 * @param {import("@playwright/test").Page} page
 * @param {{fastPlay?: boolean, holdMs?: number, slideMs?: number}} options
 */
async function prepareNearMissSpin(page, options = {}) {
  await page.evaluate(({ board, fastPlay, holdMs, slideMs }) => {
    applySpinSpeed(fastPlay ? "skip" : "normal");
    state.balance = 1000;
    state.bet = 10;
    state.freeSpins = 0;
    state.isBonusActive = false;
    state.bonusRound = null;
    NEAR_MISS_CONFIG.enabled = true;
    NEAR_MISS_CONFIG.probability = 1;
    NEAR_MISS_CONFIG.timing.teaseHoldMs = holdMs;
    NEAR_MISS_CONFIG.timing.slideMs = slideMs;
    createBoard = () => board.map((row) => [...row]);
    rollRandomJackpotTier = () => null;
    updateDisplays();
  }, {
    board: TEST_CONFIG.nearMissBoard,
    fastPlay: options.fastPlay || false,
    holdMs: options.holdMs || 520,
    slideMs: options.slideMs || 260
  });
}

test.describe("unit", () => {
  test("clamps bets and keeps free-spin awards configurable", async () => {
    expect(game.clampBet(0)).toBe(game.GAME_LIMITS.minBet);
    expect(game.clampBet(999)).toBe(game.GAME_LIMITS.maxBet);
    expect(game.getFreeSpinAward(3)).toBe(8);
    expect(game.getFreeSpinAward(4)).toBe(12);
    expect(game.getFreeSpinAward(5)).toBe(20);
  });

  test("applies multiplier wilds and free-spin multiplier with a cap", async () => {
    const result = game.evaluateBoard(TEST_CONFIG.multiplierBoard, TEST_CONFIG.bet, {
      boardFeatures: TEST_CONFIG.multiplierFeatures,
      isFreeSpinRound: true
    });

    expect(result.totalWin).toBe(45280);
    expect(result.appliedMultiplier).toBe(50);
    expect(result.lineWins.find((lineWin) => lineWin.lineName === "middle").multiplier).toBe(50);
  });

  test("preserves base line payout math for normal wins", async () => {
    const result = game.evaluateBoard(TEST_CONFIG.standardWinBoard, TEST_CONFIG.bet);

    expect(result.totalWin).toBe(60);
    expect(result.freeSpinsAwarded).toBe(0);
    expect(result.bonusTriggered).toBe(false);
    expect(result.lineWins).toEqual([
      expect.objectContaining({
        lineName: "top",
        symbolId: "badge",
        count: 3,
        baseWin: 60,
        payout: 60,
        multiplier: 1
      })
    ]);
    expectLineWinPositions(result.lineWins[0], 3, [
      { reel: 0, row: 0 },
      { reel: 1, row: 0 },
      { reel: 2, row: 0 }
    ]);
  });

  test("keeps matched positions contiguous and stops at the first non-matching reel", async () => {
    const result = game.evaluateBoard([
      ["badge", "badge", "wild", "q", "badge"],
      ["cowboy", "boots", "a", "j", "q"],
      ["a", "q", "j", "10", "k"]
    ], TEST_CONFIG.bet);
    const [lineWin] = result.lineWins;

    expect(lineWin.lineName).toBe("top");
    expectLineWinPositions(lineWin, 3, [
      { reel: 0, row: 0 },
      { reel: 1, row: 0 },
      { reel: 2, row: 0 }
    ]);
    expect(lineWin.matchedPositions.some((position) => position.reel > lineWin.matchLength - 1)).toBe(false);
  });

  test("does not produce line matched positions for two-of-kind misses", async () => {
    const result = game.evaluateBoard(TEST_CONFIG.twoMatchBoard, TEST_CONFIG.bet);

    expect(result.lineWins).toEqual([]);
    expect(result.winningCells).toEqual([]);
    expect(result.totalWin).toBe(0);
  });

  test("preserves wild substitution while reporting exact counted cells", async () => {
    const threeReelResult = game.evaluateBoard(TEST_CONFIG.wildThreeReelBoard, TEST_CONFIG.bet);
    const fourReelResult = game.evaluateBoard(TEST_CONFIG.wildFourReelBoard, TEST_CONFIG.bet);

    expectLineWinPositions(threeReelResult.lineWins[0], 3, [
      { reel: 0, row: 0 },
      { reel: 1, row: 0 },
      { reel: 2, row: 0 }
    ]);
    expect(threeReelResult.lineWins[0].symbolId).toBe("badge");

    expectLineWinPositions(fourReelResult.lineWins[0], 4, [
      { reel: 0, row: 0 },
      { reel: 1, row: 0 },
      { reel: 2, row: 0 },
      { reel: 3, row: 0 }
    ]);
    expect(fourReelResult.lineWins[0].symbolId).toBe("cowboy");
  });

  test("keeps simultaneous payline wins independent when lengths differ", async () => {
    const result = game.evaluateBoard(TEST_CONFIG.multiLineMixedBoard, TEST_CONFIG.bet);
    const topWin = result.lineWins.find((lineWin) => lineWin.lineName === "top");
    const middleWin = result.lineWins.find((lineWin) => lineWin.lineName === "middle");

    expectLineWinPositions(topWin, 3, [
      { reel: 0, row: 0 },
      { reel: 1, row: 0 },
      { reel: 2, row: 0 }
    ]);
    expectLineWinPositions(middleWin, 5, [
      { reel: 0, row: 1 },
      { reel: 1, row: 1 },
      { reel: 2, row: 1 },
      { reel: 3, row: 1 },
      { reel: 4, row: 1 }
    ]);
  });

  test("follows diagonal and zigzag payline rows in matched positions", async () => {
    const result = game.evaluateBoard(TEST_CONFIG.zigzagWinBoard, TEST_CONFIG.bet);
    const vWin = result.lineWins.find((lineWin) => lineWin.lineName === "v");

    expectLineWinPositions(vWin, 3, [
      { reel: 0, row: 0 },
      { reel: 1, row: 1 },
      { reel: 2, row: 2 }
    ]);
  });

  test("validates matched position invariants over deterministic random boards", async () => {
    const random = createSeededRandom(20260422);

    for (let index = 0; index < 120; index += 1) {
      const result = game.evaluateBoard(createSeededBoard(random), TEST_CONFIG.bet);

      for (const lineWin of result.lineWins) {
        expect(lineWin.matchedPositions).toHaveLength(lineWin.matchLength);
        expect(game.hasContiguousMatchedPositions(lineWin.matchedPositions, lineWin.matchLength)).toBe(true);
        expect(lineWin.matchedPositions.some((position) => position.reel >= lineWin.matchLength)).toBe(false);

        const uniqueKeys = new Set(lineWin.matchedPositions.map((position) => `${position.reel}:${position.row}`));
        expect(uniqueKeys.size).toBe(lineWin.matchedPositions.length);
      }
    }
  });

  test("rejects inconsistent payline position schemas defensively", async () => {
    expect(game.hasContiguousMatchedPositions([
      { reel: 0, row: 0 },
      { reel: 2, row: 0 },
      { reel: 3, row: 0 }
    ], 3)).toBe(false);
    expect(game.hasContiguousMatchedPositions([
      { reel: 0, row: 0 },
      { reel: 1, row: 0 },
      { reel: 2, row: 0 },
      { reel: 3, row: 0 }
    ], 3)).toBe(false);
    expect(game.isValidWinPosition({ reel: game.GAME_LIMITS.reelCount, row: 0 })).toBe(false);
  });

  test("detects jackpot tiers from board patterns", async () => {
    expect(game.determineJackpotTier(TEST_CONFIG.jackpotBoard)).toBe("mini");
    expect(game.determineJackpotTier([
      ["wild", "wild", "wild", "wild", "wild"],
      ["badge", "badge", "badge", "badge", "badge"],
      ["a", "k", "q", "j", "10"]
    ])).toBe("major");
    expect(game.determineJackpotTier([
      ["wild", "wild", "wild", "wild", "wild"],
      ["wild", "wild", "wild", "wild", "wild"],
      ["wild", "wild", "wild", "wild", "wild"]
    ])).toBe("grand");
  });

  test("creates the six expected bonus prizes without removing any category", async () => {
    const prizes = game.createBonusPrizes(TEST_CONFIG.bet);
    const prizeTypes = prizes.map((prize) => prize.type).sort();

    expect(prizes).toHaveLength(game.BONUS_CONFIG.crateCount);
    expect(prizeTypes).toEqual(["coins", "coins", "coins", "collect", "free-spins", "multiplier"]);
  });

  test("maps bonus reward types to configured icons and classes with a safe fallback", async () => {
    const rewardTypes = TEST_CONFIG.bonusRewardTypes;
    const rewardIcons = TEST_CONFIG.bonusRewardIcons;

    expect(game.getBonusRewardIconKey(rewardTypes.coins)).toBe(rewardIcons.coins);
    expect(game.getBonusRewardIconKey(rewardTypes.freeSpins)).toBe(rewardIcons.freeSpins);
    expect(game.getBonusRewardIconKey(rewardTypes.multiplier)).toBe(rewardIcons.multiplier);
    expect(game.getBonusRewardIconKey(rewardTypes.collect)).toBe(rewardIcons.collect);
    expect(game.getBonusRewardIconKey(rewardTypes.unknown)).toBe(game.BONUS_UI_CONFIG.fallbackIconKey);
    expect(game.getBonusRewardClassName(rewardTypes.coins)).toBe(game.BONUS_UI_CONFIG.rewardTypes.coins.className);
    expect(game.getBonusRewardClassName(rewardTypes.unknown)).toBe(game.BONUS_UI_CONFIG.rewardTypes.mystery.className);
  });

  test("builds configured bonus crate state classes", async () => {
    expect(game.getBonusCrateStateClass(game.BONUS_CRATE_STATE_KEYS.default)).toBe("crate-button--default");
    expect(game.getBonusCrateStateClass(game.BONUS_CRATE_STATE_KEYS.hover)).toBe("crate-button--hover");
    expect(game.getBonusCrateStateClass(game.BONUS_CRATE_STATE_KEYS.focus)).toBe("crate-button--focus");
    expect(game.getBonusCrateStateClass(game.BONUS_CRATE_STATE_KEYS.selected)).toBe("crate-button--selected");
    expect(game.getBonusCrateStateClass(game.BONUS_CRATE_STATE_KEYS.opened)).toBe("crate-button--opened");
    expect(game.getBonusCrateStateClass(game.BONUS_CRATE_STATE_KEYS.disabled)).toBe("crate-button--disabled");
    expect(game.getBonusCrateStateClass(game.BONUS_CRATE_STATE_KEYS.revealed)).toBe("crate-button--revealed");
    expect(game.getBonusCrateStateClass("__missing-state__")).toBe(game.BONUS_UI_CONFIG.stateClassNames.default);
    expect(game.getBonusCrateStateClasses({})).toContain("crate-button--default");
    expect(game.getBonusCrateStateClasses({ isSelected: true })).toContain("crate-button--selected");
    expect(game.getBonusCrateStateClasses({ isRevealed: true })).toContain("crate-button--revealed");
    expect(game.getBonusCrateStateClasses({ isDisabled: true })).toContain("crate-button--disabled");
  });

  test("creates bonus status and crate view models from mocked state", async () => {
    const bonusState = {
      active: true,
      totalCoins: 240,
      freeSpinsAwarded: 6,
      bonusMultiplier: 2,
      picksMade: 2,
      revealedCrates: [true, false],
      prizes: [
        { type: "coins", label: "Small Coins", value: 80 },
        { type: "free-spins", label: "Extra Free Spins", value: 6 }
      ]
    };
    const status = game.createBonusStatusViewModel(bonusState);
    const revealedCrate = game.createBonusCrateViewModel(bonusState.prizes[0], 0, bonusState);
    const hiddenCrate = game.createBonusCrateViewModel(bonusState.prizes[1], 1, bonusState);

    expect(status.map((item) => item.value)).toEqual(["240", "+6", "x2", "2/3"]);
    expect(revealedCrate.iconKey).toBe("coin-stack");
    expect(revealedCrate.className).toContain("crate-button--revealed");
    expect(revealedCrate.valueText).toBe("80");
    expect(hiddenCrate.iconKey).toBe("crate");
    expect(hiddenCrate.className).toContain("crate-button--default");
    expect(hiddenCrate.valueText).toBe(game.BONUS_UI_CONFIG.crate.hiddenValueText);
  });

  test("handles invalid bonus UI state and unknown reward icons without throwing", async () => {
    const bonusState = {
      active: true,
      totalCoins: 0,
      freeSpinsAwarded: 0,
      bonusMultiplier: 1,
      picksMade: 0,
      revealedCrates: [true],
      prizes: [
        { type: TEST_CONFIG.bonusRewardTypes.unknown, label: "Unknown Loot", value: 0 }
      ]
    };
    const crateViewModel = game.createBonusCrateViewModel(bonusState.prizes[0], 0, bonusState);
    const fallbackIconMarkup = game.createBonusIconMarkup("__missing-icon__");

    expect(game.isValidBonusRoundState(bonusState)).toBe(true);
    expect(game.isValidBonusRoundState(null)).toBe(false);
    expect(game.isValidBonusRoundState({ prizes: [], revealedCrates: [], totalCoins: Number.NaN })).toBe(false);
    expect(crateViewModel.iconKey).toBe(TEST_CONFIG.bonusRewardIcons.mystery);
    expect(crateViewModel.rewardClassName).toBe(game.BONUS_UI_CONFIG.rewardTypes.mystery.className);
    expect(fallbackIconMarkup).toContain(`data-bonus-icon="${TEST_CONFIG.bonusRewardIcons.mystery}"`);
  });

  test("creates a bounded bonus modal layout state for smaller viewports", async () => {
    const compactLayout = game.createBonusModalLayoutState(390, 520);
    const desktopLayout = game.createBonusModalLayoutState(1024, 900);
    const tinyLayout = game.createBonusModalLayoutState(320, 200);

    expect(compactLayout).toEqual({
      isCompact: true,
      maxPanelHeightPx: 472,
      scrollRegionTabIndex: 0
    });
    expect(desktopLayout).toEqual({
      isCompact: false,
      maxPanelHeightPx: 852,
      scrollRegionTabIndex: 0
    });
    expect(tinyLayout).toEqual({
      isCompact: true,
      maxPanelHeightPx: 200,
      scrollRegionTabIndex: 0
    });
  });

  test("grants daily rewards only when the saved login date changes", async () => {
    expect(game.shouldGrantDailyReward(TEST_CONFIG.previousDateKey, TEST_CONFIG.todayDateKey)).toBe(true);
    expect(game.shouldGrantDailyReward(TEST_CONFIG.todayDateKey, TEST_CONFIG.todayDateKey)).toBe(false);
    expect(game.shouldGrantDailyReward("invalid-date", TEST_CONFIG.todayDateKey)).toBe(true);

    expect(game.resolveDailyLoginReward(TEST_CONFIG.todayDateKey, TEST_CONFIG.todayDateKey)).toBeNull();
    expect(game.resolveDailyLoginReward(TEST_CONFIG.previousDateKey, TEST_CONFIG.todayDateKey)).toEqual({
      reward: {
        type: game.RETENTION_CONFIG.dailyLoginReward.type,
        amount: game.RETENTION_CONFIG.dailyLoginReward.amount,
        source: game.RETENTION_CONFIG.dailyLoginReward.source
      },
      lastLoginDateKey: TEST_CONFIG.todayDateKey
    });
  });

  test("applies rewards to state and builds inline feedback content", async () => {
    const slotState = {
      balance: 1000,
      freeSpins: 0
    };

    expect(game.applyRewardToState(slotState, { type: "free-spins", amount: 6, source: "bonus-round" })).toBe(true);
    expect(game.applyRewardToState(slotState, { type: "balance", amount: 120, source: "daily-login" })).toBe(true);
    expect(slotState).toEqual({
      balance: 1120,
      freeSpins: 6
    });
    expect(game.createRewardFeedbackContent({ type: "free-spins", amount: 6, source: "bonus-round" })).toEqual({
      label: "Bonus Reward",
      amountText: "+6 free spins",
      description: "Bonus free spins added to your meter",
      variant: "free-spins"
    });
  });

  test("renders corrected SVG icon markup for western symbol art", async () => {
    const badgeSymbol = game.getSymbolDefinition(TEST_CONFIG.iconSymbolIds.badge);
    const bootsArt = game.createSymbolArtContent(game.getSymbolDefinition(TEST_CONFIG.iconSymbolIds.boots));
    const cactusArt = game.createSymbolArtContent(game.getSymbolDefinition(TEST_CONFIG.iconSymbolIds.cactus));
    const cowboyArt = game.createSymbolArtContent(game.getSymbolDefinition(TEST_CONFIG.iconSymbolIds.cowboy));
    const dynamiteArt = game.createSymbolArtContent(game.getSymbolDefinition(TEST_CONFIG.iconSymbolIds.dynamite));
    const wildArt = game.createSymbolArtContent(game.getSymbolDefinition(TEST_CONFIG.iconSymbolIds.wild));

    expect(game.BADGE_ART_CONFIG.text).toBe("S");
    expect(game.resolveBadgeArtText(badgeSymbol)).toBe(game.BADGE_ART_CONFIG.text);
    expect(game.getSymbolArtAttributes(badgeSymbol)).toEqual({
      [game.BADGE_ART_CONFIG.attributeName]: game.BADGE_ART_CONFIG.text
    });
    expect(game.getSymbolArtAttributes(game.getSymbolDefinition(TEST_CONFIG.iconSymbolIds.boots))).toEqual({});

    expect(bootsArt.mode).toBe("svg");
    expect(bootsArt.markup).toContain('data-symbol-icon="boots"');
    expect(bootsArt.markup).toContain("slot-icon-boots");

    expect(cactusArt.mode).toBe("svg");
    expect(cactusArt.markup).toContain('data-symbol-icon="cactus"');
    expect(cactusArt.markup).toContain(`data-icon-detail="${game.CACTUS_ART_CONFIG.bodyDetailValue}"`);
    expect(cactusArt.markup.match(new RegExp(`data-icon-detail="${game.CACTUS_ART_CONFIG.armDetailValue}"`, "g"))).toHaveLength(2);

    expect(cowboyArt.mode).toBe("svg");
    expect(cowboyArt.markup).toContain('data-symbol-icon="cowboy"');
    expect(cowboyArt.markup).toContain(`data-icon-detail="${game.COWBOY_ART_CONFIG.crownDetailValue}"`);
    expect(cowboyArt.markup).toContain(`data-icon-detail="${game.COWBOY_ART_CONFIG.faceDetailValue}"`);

    expect(dynamiteArt.mode).toBe("svg");
    expect(dynamiteArt.markup).toContain('data-symbol-icon="dynamite"');
    expect(dynamiteArt.markup).toContain('data-icon-detail="spark"');

    expect(wildArt.mode).toBe("svg");
    expect(wildArt.markup).toContain('data-symbol-icon="wild"');
    expect(wildArt.markup).not.toContain("<circle");
  });

  test("falls back safely when an invalid symbol id is requested for rendering", async () => {
    const fallbackSymbol = game.getSymbolDefinition("__missing__");
    const fallbackArt = game.createSymbolArtContent(fallbackSymbol);

    expect(fallbackSymbol.id).toBe(game.SYMBOLS[0].id);
    expect(fallbackArt.mode).toBe("text");
  });

  test("filters spin keyboard shortcuts before using the button path", async () => {
    const inertTarget = { closest: () => null };
    const blockedTarget = {
      closest: (selector) => selector.includes("input") ? {} : null
    };
    const editableTarget = {
      closest: (selector) => selector === game.KEYBOARD_CONFIG.editableShortcutSelector
        ? { getAttribute: () => "true" }
        : null
    };

    expect(game.isSpinShortcutEvent({ key: " " })).toBe(true);
    expect(game.isSpinShortcutEvent({ key: "Spacebar" })).toBe(true);
    expect(game.isSpinShortcutEvent({ key: "Enter" })).toBe(false);
    expect(game.shouldHandleSpinShortcut({ key: " ", repeat: false, target: inertTarget })).toBe(true);
    expect(game.shouldHandleSpinShortcut({ key: " ", repeat: true, target: inertTarget })).toBe(false);
    expect(game.shouldHandleSpinShortcut({ key: " ", repeat: false, target: blockedTarget })).toBe(false);
    expect(game.shouldHandleSpinShortcut({ key: " ", repeat: false, target: editableTarget })).toBe(false);
  });

  test("validates near-miss config defensively", async () => {
    const config = game.validateNearMissConfig({
      enabled: true,
      probability: 2,
      timing: {
        teaseHoldMs: -1,
        slideMs: 125,
        slideDistanceRows: 0,
        frames: ["tease", "unknown", "settle"]
      },
      patterns: [
        game.NEAR_MISS_CONFIG.patterns[0],
        { id: "invalid", lineName: "missing", matchCount: 2, missReel: 2, eligibleSymbolIds: ["badge"] }
      ]
    });

    expect(config.enabled).toBe(true);
    expect(config.probability).toBe(1);
    expect(config.timing.teaseHoldMs).toBe(game.NEAR_MISS_CONFIG.timing.teaseHoldMs);
    expect(config.timing.slideMs).toBe(125);
    expect(config.timing.slideDistanceRows).toBe(game.NEAR_MISS_CONFIG.timing.slideDistanceRows);
    expect(config.timing.frames).toEqual(["tease", "settle"]);
    expect(config.patterns).toHaveLength(1);
  });

  test("applies near-miss eligibility rules to paid-spin losses only", async () => {
    const result = game.evaluateBoard(TEST_CONFIG.nearMissBoard, TEST_CONFIG.bet);
    const enabledConfig = { ...game.NEAR_MISS_CONFIG, enabled: true, probability: 1 };

    expect(game.isNearMissEligible({ result, usedFreeSpin: false, fastPlayEnabled: false, jackpotTier: null }, enabledConfig)).toBe(true);
    expect(game.isNearMissEligible({ result, usedFreeSpin: true, fastPlayEnabled: false, jackpotTier: null }, enabledConfig)).toBe(false);
    expect(game.isNearMissEligible({ result, usedFreeSpin: false, fastPlayEnabled: true, jackpotTier: null }, enabledConfig)).toBe(false);
    expect(game.isNearMissEligible({ result, usedFreeSpin: false, fastPlayEnabled: false, jackpotTier: "mini" }, enabledConfig)).toBe(false);
    expect(game.isNearMissEligible({ result, usedFreeSpin: false, fastPlayEnabled: false, jackpotTier: null }, { ...enabledConfig, enabled: false })).toBe(false);
  });

  test("selects near-miss patterns without changing a losing outcome", async () => {
    const result = game.evaluateBoard(TEST_CONFIG.nearMissBoard, TEST_CONFIG.bet);
    const enabledConfig = {
      ...game.NEAR_MISS_CONFIG,
      enabled: true,
      probability: 1,
      patterns: [game.NEAR_MISS_CONFIG.patterns[0]]
    };
    const plan = game.selectNearMissPlan(
      TEST_CONFIG.nearMissBoard,
      result,
      { usedFreeSpin: false, fastPlayEnabled: false, jackpotTier: null },
      enabledConfig,
      () => 0
    );

    expect(result.totalWin).toBe(0);
    expect(result.freeSpinsAwarded).toBe(0);
    expect(result.bonusTriggered).toBe(false);
    expect(plan).toEqual(expect.objectContaining({
      patternId: "top-line-third-reel-slide",
      lineName: "top",
      reel: 2,
      row: 0,
      symbolId: "badge",
      actualSymbolId: "k"
    }));
    expect(game.evaluateBoard(TEST_CONFIG.nearMissBoard, TEST_CONFIG.bet).totalWin).toBe(0);
  });

  test("skips near-miss selection when probability roll misses or outcome wins", async () => {
    const lossResult = game.evaluateBoard(TEST_CONFIG.nearMissBoard, TEST_CONFIG.bet);
    const winResult = game.evaluateBoard(TEST_CONFIG.standardWinBoard, TEST_CONFIG.bet);
    const enabledConfig = { ...game.NEAR_MISS_CONFIG, enabled: true, probability: 0.5 };

    expect(game.selectNearMissPlan(
      TEST_CONFIG.nearMissBoard,
      lossResult,
      { usedFreeSpin: false, fastPlayEnabled: false, jackpotTier: null },
      enabledConfig,
      () => 0.75
    )).toBeNull();
    expect(game.selectNearMissPlan(
      TEST_CONFIG.standardWinBoard,
      winResult,
      { usedFreeSpin: false, fastPlayEnabled: false, jackpotTier: null },
      { ...enabledConfig, probability: 1 },
      () => 0
    )).toBeNull();
  });
});

test.describe("retention", () => {
  test("awards the daily login reward with inline feedback and updates localStorage", async ({ page }) => {
    await gotoGame(page, TEST_CONFIG.previousDateKey);

    await expect(page.locator("#rewardFeedback")).toHaveClass(/show/);
    await expect(page.locator("#rewardFeedbackLabel")).toHaveText("Daily Reward");
    await expect(page.locator("#rewardFeedbackAmount")).toHaveText(`+${TEST_CONFIG.dailyRewardAmount} free spins`);
    await expect(page.locator("#rewardFeedbackText")).toHaveText("Added for today's login");
    await expect(page.locator("#freeSpinsMeter")).toBeVisible();
    await expect(page.locator("#freeSpinsDisplay")).toContainText(String(TEST_CONFIG.dailyRewardAmount));
    await expect(page.locator("#statusMessage")).toHaveText("Place your bet and spin");

    const savedLoginDate = await page.evaluate((storageKey) => window.localStorage.getItem(storageKey), TEST_CONFIG.dailyRewardStorageKey);
    expect(savedLoginDate).toBe(TEST_CONFIG.todayDateKey);
  });
});

test.describe("smoke", () => {
  test("app loads with core UI, clickable spin, and no console errors", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    await gotoGame(page);

    await expect(page.locator("#game-title")).toHaveText("Gunslinger Gold");
    await expect(page.locator(".reel")).toHaveCount(game.GAME_LIMITS.reelCount);
    await expect(page.locator("#spinButton")).toBeEnabled();

    await page.click("#spinButton");
    await expect(page.locator("#spinButton")).toHaveText("Skip");
    await page.click("#spinButton");
    await expect(page.locator("#spinButton")).toHaveText("Spin");
    expect(consoleErrors).toEqual([]);
  });

  test("pick-a-crate smoke flow opens, reveals, completes, and leaves the game usable", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    await gotoGame(page);
    await openOrderedBonusRound(page);

    await expect(page.locator("#bonusOverlay")).toHaveClass(/show/);
    await expect(page.locator(".crate-button")).toHaveCount(game.BONUS_CONFIG.crateCount);
    await page.locator(".crate-button").nth(0).click();
    await expect(page.locator(".crate-button").nth(0)).toBeDisabled();
    await page.locator(".crate-button").nth(1).click();
    await page.locator(".crate-button").nth(2).click();
    await expect(page.locator("#bonusOverlay")).not.toHaveClass(/show/);
    await expect(page.locator("#spinButton")).toBeEnabled();
    await expect(page.locator("#balanceDisplay")).toHaveText(String(
      game.GAME_LIMITS.defaultBalance + createOrderedBonusPrizes()[0].value + createOrderedBonusPrizes()[1].value
    ));
    await page.evaluate(({ board }) => {
      NEAR_MISS_CONFIG.enabled = false;
      createBoard = () => board.map((row) => [...row]);
      rollRandomJackpotTier = () => null;
    }, { board: TEST_CONFIG.nearMissBoard });
    await page.click("#spinButton");
    await expect(page.locator("#spinButton")).toHaveText("Skip");
    await page.click("#spinButton");
    await expect(page.locator("#spinButton")).toHaveText("Spin");
    expect(consoleErrors).toEqual([]);
  });

  test("updated western icons render as inline SVG without losing styling hooks", async ({ page }) => {
    await gotoGame(page);
    await page.evaluate(({ board }) => {
      renderBoard(board, createEmptyFeatureGrid());
    }, { board: TEST_CONFIG.bonusSpinBoard });

    await expect(page.locator(TEST_CONFIG.iconSelectors.boots)).toHaveCount(1);
    await expect(page.locator(TEST_CONFIG.iconSelectors.cactus)).toHaveCount(1);
    await expect(page.locator(TEST_CONFIG.iconSelectors.cowboy)).toHaveCount(1);
    await expect(page.locator(TEST_CONFIG.iconSelectors.dynamite)).toHaveCount(3);
    await expect(page.locator(TEST_CONFIG.iconSelectors.wild)).toHaveCount(1);
    await expect(page.locator(`${TEST_CONFIG.iconSelectors.cactus} [data-icon-detail='cactus-body']`)).toHaveCount(1);
    await expect(page.locator(`${TEST_CONFIG.iconSelectors.cactus} [data-icon-detail='cactus-arm']`)).toHaveCount(2);
    await expect(page.locator(`${TEST_CONFIG.iconSelectors.cowboy} [data-icon-detail='hat-crown']`)).toHaveCount(1);
    await expect(page.locator(`${TEST_CONFIG.iconSelectors.dynamite} [data-icon-detail='spark']`)).toHaveCount(3);
    await expect(page.locator(`${TEST_CONFIG.iconSelectors.wild} circle`)).toHaveCount(0);
  });

  test("sheriff badge icon renders a single western S via config-backed badge text", async ({ page }) => {
    await gotoGame(page);
    await page.evaluate(({ board }) => {
      renderBoard(board, createEmptyFeatureGrid());
    }, { board: TEST_CONFIG.standardWinBoard });

    const badgeArt = page.locator(TEST_CONFIG.iconSelectors.badge).first();

    await expect(badgeArt).toHaveAttribute(game.BADGE_ART_CONFIG.attributeName, game.BADGE_ART_CONFIG.text);

    const badgeOverlayText = await badgeArt.evaluate((node) => (
      window.getComputedStyle(node, "::after").content.replaceAll("\"", "")
    ));

    expect(badgeOverlayText).toBe(game.BADGE_ART_CONFIG.text);
  });
});

test.describe("payline rendering", () => {
  test.beforeEach(async ({ page }) => {
    await gotoGame(page);
    await page.evaluate(({ board }) => {
      renderBoard(board, createEmptyFeatureGrid());
      clearWinHighlights();
    }, { board: TEST_CONFIG.standardWinBoard });
  });

  test("mocked three-reel win highlights and draws only through reel 3", async ({ page }) => {
    await page.evaluate(() => {
      highlightWins({
        winningCells: [
          { reel: 0, row: 0 },
          { reel: 1, row: 0 },
          { reel: 2, row: 0 }
        ],
        lineWins: [
          {
            lineName: "top",
            count: 3,
            matchLength: 3,
            matchedPositions: [
              { reel: 0, row: 0 },
              { reel: 1, row: 0 },
              { reel: 2, row: 0 }
            ]
          }
        ]
      });
    });

    await expect(page.locator(".symbol-cell.win")).toHaveCount(3);
    await expect(page.locator('[data-reel="0"][data-row="0"]')).toHaveClass(/win/);
    await expect(page.locator('[data-reel="1"][data-row="0"]')).toHaveClass(/win/);
    await expect(page.locator('[data-reel="2"][data-row="0"]')).toHaveClass(/win/);
    await expect(page.locator('[data-reel="3"][data-row="0"]')).not.toHaveClass(/win/);
    await expect(page.locator('[data-reel="4"][data-row="0"]')).not.toHaveClass(/win/);
    await expect(page.locator(".payline-guide.active")).toHaveCount(0);

    const segmentData = await page.locator(".payline-segment").evaluateAll((segments) => (
      segments.map((segment) => ({
        lineName: segment.getAttribute("data-line-name"),
        startReel: segment.getAttribute("data-start-reel"),
        endReel: segment.getAttribute("data-end-reel"),
        matchLength: segment.getAttribute("data-match-length")
      }))
    ));

    expect(segmentData).toEqual([
      { lineName: "top", startReel: "0", endReel: "1", matchLength: "3" },
      { lineName: "top", startReel: "1", endReel: "2", matchLength: "3" }
    ]);
  });

  test("clearing highlights removes stale cells and payline segments", async ({ page }) => {
    await page.evaluate(() => {
      const result = evaluateBoard([
        ["badge", "badge", "badge", "q", "10"],
        ["cowboy", "boots", "a", "j", "q"],
        ["a", "q", "j", "10", "k"]
      ], 10);

      highlightWins(result);
      clearWinHighlights();
    });

    await expect(page.locator(".symbol-cell.win")).toHaveCount(0);
    await expect(page.locator(".payline-segment")).toHaveCount(0);
    await expect(page.locator(".payline-guide.active")).toHaveCount(0);
  });

  test("multiple paylines render independently without inheriting span length", async ({ page }) => {
    await page.evaluate(({ board }) => {
      renderBoard(board, createEmptyFeatureGrid());
      highlightWins(evaluateBoard(board, 10));
    }, { board: TEST_CONFIG.multiLineMixedBoard });

    const segmentData = await page.locator(".payline-segment").evaluateAll((segments) => (
      segments.map((segment) => ({
        lineName: segment.getAttribute("data-line-name"),
        endReel: Number(segment.getAttribute("data-end-reel"))
      }))
    ));
    const topSegments = segmentData.filter((segment) => segment.lineName === "top");
    const middleSegments = segmentData.filter((segment) => segment.lineName === "middle");

    expect(topSegments).toHaveLength(2);
    expect(Math.max(...topSegments.map((segment) => segment.endReel))).toBe(2);
    expect(middleSegments).toHaveLength(4);
    expect(Math.max(...middleSegments.map((segment) => segment.endReel))).toBe(4);
  });

  test("invalid renderer win data is ignored without throwing", async ({ page }) => {
    const summary = await page.evaluate(() => {
      try {
        highlightWins({
          winningCells: [{ reel: 99, row: 0 }, null],
          lineWins: [
            {
              lineName: "top",
              count: 5,
              matchLength: 3,
              matchedPositions: [
                { reel: 0, row: 0 },
                { reel: 2, row: 0 },
                { reel: 4, row: 0 }
              ]
            }
          ]
        });
        return {
          threw: false,
          highlightedCells: document.querySelectorAll(".symbol-cell.win").length,
          segments: document.querySelectorAll(".payline-segment").length
        };
      } catch (_error) {
        return { threw: true, highlightedCells: -1, segments: -1 };
      }
    });

    expect(summary).toEqual({
      threw: false,
      highlightedCells: 0,
      segments: 0
    });
  });
});

test.describe("bonus modal ui", () => {
  test("renders pick-a-crate bonus icons, stats, and crate interaction states", async ({ page }) => {
    await gotoGame(page);
    await openOrderedBonusRound(page);

    const crates = page.locator(".crate-button");

    await expect(page.locator("#bonusOverlay")).toHaveClass(/show/);
    await expect(page.locator("#bonusTitle")).toContainText("Pick-A-Crate");
    await expect(page.locator("[data-bonus-stat='totalCoins'] .bonus-stat-value")).toHaveText("0");
    await expect(page.locator("[data-bonus-stat='freeSpinsAwarded'] .bonus-stat-value")).toHaveText("+0");
    await expect(page.locator("[data-bonus-stat='bonusMultiplier'] .bonus-stat-value")).toHaveText("x1");
    await expect(page.locator("[data-bonus-stat='picksMade'] .bonus-stat-value")).toHaveText("0/3");
    await expect(crates).toHaveCount(game.BONUS_CONFIG.crateCount);
    await expect(page.locator(`.crate-button [data-bonus-icon='${TEST_CONFIG.bonusRewardIcons.hidden}']`)).toHaveCount(game.BONUS_CONFIG.crateCount);

    await crates.nth(0).hover();
    await expect(crates.nth(0)).toHaveClass(/crate-button--hover/);

    await crates.nth(1).focus();
    await expect(crates.nth(1)).toHaveClass(/crate-button--focus/);

    await crates.nth(0).click();
    await expect(crates.nth(0)).toBeDisabled();
    await expect(crates.nth(0)).toHaveClass(/crate-button--revealed/);
    await expect(crates.nth(0)).toHaveClass(/crate-button--opened/);
    await expect(crates.nth(0).locator(`[data-bonus-icon='${TEST_CONFIG.bonusRewardIcons.coins}']`)).toHaveCount(1);
    await expect(crates.nth(0).locator(".crate-value")).toHaveText(String(createOrderedBonusPrizes()[0].value));
    await expect(crates.nth(1)).not.toBeDisabled();
    await expect(crates.nth(1)).toHaveClass(/crate-button--default/);
    await expect(page.locator("[data-bonus-stat='totalCoins'] .bonus-stat-value")).toHaveText(String(createOrderedBonusPrizes()[0].value));
    await expect(page.locator("[data-bonus-stat='picksMade'] .bonus-stat-value")).toHaveText("1/3");
  });

  test("renders every revealed reward icon and accessible crate label from config", async ({ page }) => {
    const prizes = createOrderedBonusPrizes();
    await gotoGame(page);
    await openOrderedBonusRound(page, {
      revealedCrates: Array.from({ length: game.BONUS_CONFIG.crateCount }, () => true),
      statePatch: {
        totalCoins: prizes[0].value + prizes[1].value,
        freeSpinsAwarded: prizes[2].value,
        bonusMultiplier: prizes[3].value,
        picksMade: game.BONUS_CONFIG.maxPicks
      }
    });

    const dialog = page.getByRole("dialog", { name: /Pick-A-Crate/ });
    const crates = page.locator(".crate-button");

    await expect(dialog).toBeVisible();
    await expect(page.locator("[data-bonus-stat='totalCoins'] .bonus-stat-value")).toHaveText(String(prizes[0].value + prizes[1].value));
    await expect(page.locator("[data-bonus-stat='freeSpinsAwarded'] .bonus-stat-value")).toHaveText(`+${prizes[2].value}`);
    await expect(page.locator("[data-bonus-stat='bonusMultiplier'] .bonus-stat-value")).toHaveText(`x${prizes[3].value}`);
    await expect(page.locator("[data-bonus-stat='picksMade'] .bonus-stat-value")).toHaveText(`${game.BONUS_CONFIG.maxPicks}/${game.BONUS_CONFIG.maxPicks}`);
    await expect(page.locator(`.crate-button [data-bonus-icon='${TEST_CONFIG.bonusRewardIcons.coins}']`)).toHaveCount(3);
    await expect(page.locator(`.crate-button [data-bonus-icon='${TEST_CONFIG.bonusRewardIcons.freeSpins}']`)).toHaveCount(1);
    await expect(page.locator(`.crate-button [data-bonus-icon='${TEST_CONFIG.bonusRewardIcons.multiplier}']`)).toHaveCount(1);
    await expect(page.locator(`.crate-button [data-bonus-icon='${TEST_CONFIG.bonusRewardIcons.collect}']`)).toHaveCount(1);

    for (let crateIndex = 0; crateIndex < game.BONUS_CONFIG.crateCount; crateIndex += 1) {
      await expect(crates.nth(crateIndex)).toBeDisabled();
      await expect(crates.nth(crateIndex)).toHaveAttribute("aria-pressed", "true");
      await expect(crates.nth(crateIndex)).toHaveAttribute("aria-label", new RegExp(`Crate ${crateIndex + 1}.*revealed reward`));
    }
  });

  test("ignores repeated revealed crate picks without mutating bonus totals", async ({ page }) => {
    await gotoGame(page);
    await openOrderedBonusRound(page);
    await page.locator(".crate-button").first().click();

    const beforeRepeatPick = await page.evaluate(() => ({
      picksMade: state.bonusRound.picksMade,
      totalCoins: state.bonusRound.totalCoins,
      revealedCrates: [...state.bonusRound.revealedCrates]
    }));

    await page.evaluate(() => {
      resolveBonusPick(0);
    });

    const afterRepeatPick = await page.evaluate(() => ({
      picksMade: state.bonusRound.picksMade,
      totalCoins: state.bonusRound.totalCoins,
      revealedCrates: [...state.bonusRound.revealedCrates]
    }));

    expect(afterRepeatPick).toEqual(beforeRepeatPick);
  });

  test("falls back safely for unknown rendered reward types", async ({ page }) => {
    await gotoGame(page);
    await openOrderedBonusRound(page, {
      revealedCrates: [true, false, false, false, false, false],
      statePatch: {
        prizes: [
          { type: TEST_CONFIG.bonusRewardTypes.unknown, label: "Unknown Loot", value: 0 },
          ...createOrderedBonusPrizes().slice(1)
        ]
      }
    });

    const firstCrate = page.locator(".crate-button").first();

    await expect(firstCrate).toBeDisabled();
    await expect(firstCrate).toHaveAttribute("data-reward-type", TEST_CONFIG.bonusRewardTypes.unknown);
    await expect(firstCrate.locator(`[data-bonus-icon='${TEST_CONFIG.bonusRewardIcons.mystery}']`)).toHaveCount(1);
    await expect(firstCrate.locator(".crate-value")).toHaveText(game.BONUS_UI_CONFIG.rewardTypes.mystery.emptyValueText);
  });

  test("completes the pick-a-crate flow and restores game interaction state", async ({ page }) => {
    const prizes = createOrderedBonusPrizes();
    await gotoGame(page);
    await openOrderedBonusRound(page, {
      statePatch: {
        totalCoins: 0,
        freeSpinsAwarded: 0,
        bonusMultiplier: 1,
        picksMade: 0
      }
    });

    await page.locator(".crate-button").nth(0).click();
    await page.locator(".crate-button").nth(3).click();
    await page.locator(".crate-button").nth(2).click();

    await expect(page.locator("#bonusOverlay")).not.toHaveClass(/show/);
    await expect(page.locator("#balanceDisplay")).toHaveText(String(game.GAME_LIMITS.defaultBalance + prizes[0].value));
    await expect(page.locator("#freeSpinsMeter")).toBeVisible();
    await expect(page.locator("#freeSpinsDisplay")).toContainText(String(prizes[2].value));
    await expect(page.locator("#spinButton")).toBeEnabled();
    await expect(page.locator("#statusMessage")).toContainText("Bonus win");
  });

  test("keeps the crate list scrollable and keyboard-focusable on a small viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 520 });
    await gotoGame(page);
    await openOrderedBonusRound(page);

    const layoutSummary = await page.evaluate(() => {
      const overlay = document.getElementById("bonusOverlay");
      const panel = document.getElementById("bonusPanel");
      const crates = document.getElementById("bonusCrates");
      const overlayStyle = window.getComputedStyle(overlay);
      const cratesStyle = window.getComputedStyle(crates);

      return {
        overlayLayout: overlay.dataset.bonusLayout,
        overlayOverflowY: overlayStyle.overflowY,
        panelMaxHeight: panel.style.getPropertyValue("--bonus-panel-max-height"),
        panelClientHeight: panel.clientHeight,
        viewportHeight: window.innerHeight,
        cratesOverflowY: cratesStyle.overflowY,
        cratesTabIndex: crates.tabIndex,
        isCratesScrollable: crates.scrollHeight > crates.clientHeight
      };
    });

    expect(layoutSummary.overlayLayout).toBe("compact");
    expect(layoutSummary.overlayOverflowY).toBe("auto");
    expect(layoutSummary.cratesOverflowY).toBe("auto");
    expect(layoutSummary.cratesTabIndex).toBe(0);
    expect(layoutSummary.isCratesScrollable).toBe(true);
    expect(layoutSummary.panelClientHeight).toBeLessThanOrEqual(layoutSummary.viewportHeight);
    expect(parseFloat(layoutSummary.panelMaxHeight)).toBeLessThanOrEqual(layoutSummary.viewportHeight);

    await page.locator("#bonusCrates").focus();
    await expect(page.locator("#bonusCrates")).toBeFocused();
  });

  test("allows reaching and selecting the last crate after scrolling on a small viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 520 });
    await gotoGame(page);
    await openOrderedBonusRound(page);

    const lastCrateIndex = game.BONUS_CONFIG.crateCount - 1;
    const crates = page.locator(".crate-button");

    await crates.nth(lastCrateIndex).scrollIntoViewIfNeeded();
    await expect(crates.nth(lastCrateIndex)).toBeInViewport();
    await crates.nth(lastCrateIndex).click();

    await expect(crates.nth(lastCrateIndex)).toBeDisabled();
    await expect(crates.nth(lastCrateIndex)).toHaveClass(/crate-button--revealed/);
    await expect(page.locator("#bonusOverlay")).not.toHaveClass(/show/);
  });
});

test.describe("end-to-end", () => {
  test.beforeEach(async ({ page }) => {
    await gotoGame(page);
    await page.evaluate(() => {
      applySpinSpeed("skip");
      state.balance = 1000;
      state.bet = 10;
      state.freeSpins = 0;
      state.isBonusActive = false;
      state.bonusRound = null;
      updateDisplays();
    });
  });

  test("normal paid spin still settles through the existing spin button path", async ({ page }) => {
    await page.evaluate(({ board }) => {
      NEAR_MISS_CONFIG.enabled = false;
      createBoard = () => board.map((row) => [...row]);
      rollRandomJackpotTier = () => null;
      updateDisplays();
    }, { board: TEST_CONFIG.nearMissBoard });

    await page.click("#spinButton");

    await expect(page.locator("#spinButton")).toHaveText("Spin");
    await expect(page.locator("#statusMessage")).toHaveText("No win this round");
    await expect(page.locator("#balanceDisplay")).toHaveText("990");
    await expect(page.locator(".near-miss-tease")).toHaveCount(0);
    await expect(page.locator(".symbol-cell.win")).toHaveCount(0);
    await expect(page.locator(".payline-segment")).toHaveCount(0);
  });

  test("deterministic three-reel win keeps payout math and clips the overlay", async ({ page }) => {
    await page.evaluate(({ board }) => {
      NEAR_MISS_CONFIG.enabled = false;
      createBoard = () => board.map((row) => [...row]);
      rollRandomJackpotTier = () => null;
      updateDisplays();
    }, { board: TEST_CONFIG.standardWinBoard });

    await page.click("#spinButton");

    await expect(page.locator("#spinButton")).toHaveText("Spin");
    await expect(page.locator("#winPopupAmount")).toHaveText("60");
    await expect(page.locator("#balanceDisplay")).toHaveText("1050");
    await expect(page.locator(".symbol-cell.win")).toHaveCount(3);
    await expect(page.locator('[data-reel="3"][data-row="0"]')).not.toHaveClass(/win/);
    await expect(page.locator('[data-reel="4"][data-row="0"]')).not.toHaveClass(/win/);

    const maxEndReel = await page.locator(".payline-segment").evaluateAll((segments) => (
      Math.max(...segments.map((segment) => Number(segment.getAttribute("data-end-reel"))))
    ));

    await expect(page.locator(".payline-segment")).toHaveCount(2);
    expect(maxEndReel).toBe(2);
  });

  test("deterministic five-reel win still spans all reels", async ({ page }) => {
    await page.evaluate(({ board }) => {
      NEAR_MISS_CONFIG.enabled = false;
      createBoard = () => board.map((row) => [...row]);
      rollRandomJackpotTier = () => null;
      updateDisplays();
    }, { board: TEST_CONFIG.fiveReelWinBoard });

    await page.click("#spinButton");

    await expect(page.locator("#spinButton")).toHaveText("Spin");
    await expect(page.locator("#winPopupAmount")).toHaveText("700");
    await expect(page.locator("#balanceDisplay")).toHaveText("1690");
    await expect(page.locator(".symbol-cell.win")).toHaveCount(5);
    await expect(page.locator(".payline-segment")).toHaveCount(4);

    const maxEndReel = await page.locator(".payline-segment").evaluateAll((segments) => (
      Math.max(...segments.map((segment) => Number(segment.getAttribute("data-end-reel"))))
    ));

    expect(maxEndReel).toBe(4);
  });

  test("multiple winning paylines render with their own clipped lengths", async ({ page }) => {
    await page.evaluate(({ board }) => {
      NEAR_MISS_CONFIG.enabled = false;
      createBoard = () => board.map((row) => [...row]);
      rollRandomJackpotTier = () => null;
      updateDisplays();
    }, { board: TEST_CONFIG.multiLineMixedBoard });

    await page.click("#spinButton");

    await expect(page.locator("#spinButton")).toHaveText("Spin");
    await expect(page.locator(".symbol-cell.win")).toHaveCount(8);

    const segmentData = await page.locator(".payline-segment").evaluateAll((segments) => (
      segments.map((segment) => ({
        lineName: segment.getAttribute("data-line-name"),
        endReel: Number(segment.getAttribute("data-end-reel"))
      }))
    ));
    const topSegments = segmentData.filter((segment) => segment.lineName === "top");
    const middleSegments = segmentData.filter((segment) => segment.lineName === "middle");

    expect(topSegments).toHaveLength(2);
    expect(Math.max(...topSegments.map((segment) => segment.endReel))).toBe(2);
    expect(middleSegments).toHaveLength(4);
    expect(Math.max(...middleSegments.map((segment) => segment.endReel))).toBe(4);
  });

  test("near-miss paid loss shows tease effect and ends as a loss", async ({ page }) => {
    await prepareNearMissSpin(page);

    await page.click("#spinButton");

    const teasedCell = page.locator(".symbol-cell.near-miss-tease");
    await expect(teasedCell).toHaveCount(1);
    await expect(teasedCell).toHaveAttribute("data-symbol", "badge");
    await expect(teasedCell).toHaveAttribute("data-reel", "2");
    await expect(teasedCell).toHaveAttribute("data-row", "0");

    await expect(page.locator("#spinButton")).toHaveText("Spin", { timeout: 5000 });
    await expect(page.locator("#statusMessage")).toHaveText("No win this round");
    await expect(page.locator("#balanceDisplay")).toHaveText("990");
    await expect(page.locator("#winPopup")).not.toHaveClass(/show/);
    await expect(page.locator('[data-reel="2"][data-row="0"]')).toHaveAttribute("data-symbol", "k");
    await expect(page.locator('[data-reel="2"][data-row="0"]')).toHaveAttribute("data-near-miss", "settle");
  });

  test("fast-play and skip finish near-miss candidates without duplicate settlement", async ({ page }) => {
    await prepareNearMissSpin(page, { fastPlay: true });

    await page.click("#spinButton");

    await expect(page.locator("#spinButton")).toHaveText("Spin");
    await expect(page.locator(".near-miss-tease")).toHaveCount(0);
    await expect(page.locator("#balanceDisplay")).toHaveText("990");

    await prepareNearMissSpin(page, { fastPlay: false, holdMs: 1200, slideMs: 400 });
    await page.click("#spinButton");
    await expect(page.locator("#spinButton")).toHaveText("Skip");
    await page.click("#spinButton");
    await expect(page.locator("#spinButton")).toHaveText("Spin");
    await expect(page.locator(".near-miss-tease")).toHaveCount(0);
    await expect(page.locator("#balanceDisplay")).toHaveText("990");
    await page.waitForTimeout(1900);
    await expect(page.locator("#balanceDisplay")).toHaveText("990");
  });

  test("shows jackpot meters and upgrades free spins to 8 on three scatters", async ({ page }) => {
    await expect(page.locator("#miniJackpotDisplay")).toHaveText("500");
    await expect(page.locator("#majorJackpotDisplay")).toHaveText("2500");
    await expect(page.locator("#grandJackpotDisplay")).toHaveText("25000");
    await expect(page.locator("#freeSpinsMeter")).toHaveAttribute("hidden", "");

    await settleBoard(page, TEST_CONFIG.freeSpinBoard, true);

    await expect(page.locator("#freeSpinsMeter")).toBeVisible();
    await expect(page.locator("#freeSpinsDisplay")).toContainText("8");
    await expect(page.locator("#rewardFeedback")).toHaveClass(/show/);
    await expect(page.locator("#rewardFeedbackLabel")).toHaveText("Free Spins Added");
    await expect(page.locator("#rewardFeedbackAmount")).toHaveText(`+${game.getFreeSpinAward(3)} free spins`);
    await expect(page.locator("#rewardFeedbackText")).toHaveText("Scatter reward added to your meter");
    await expect(page.locator("#statusMessage")).toContainText("free spins awarded");
  });

  test("opens and resolves the pick-a-crate bonus round", async ({ page }) => {
    await settleBoard(page, TEST_CONFIG.bonusSpinBoard, false);
    await page.evaluate(() => {
      state.bonusRound.prizes = [
        { type: "coins", label: "Small Coins", value: 80 },
        { type: "coins", label: "Medium Coins", value: 160 },
        { type: "free-spins", label: "Extra Free Spins", value: 6 },
        { type: "multiplier", label: "Multiplier Boost", value: 2 },
        { type: "coins", label: "Large Coins", value: 280 },
        { type: "collect", label: "Collect & Exit", value: 0 }
      ];
      state.bonusRound.revealedCrates = [false, false, false, false, false, false];
      renderBonusRound();
    });

    await expect(page.locator("#bonusOverlay")).toHaveClass(/show/);
    await page.locator(".crate-button").nth(0).click();
    await page.locator(".crate-button").nth(1).click();
    await page.locator(".crate-button").nth(2).click();
    await expect(page.locator("#bonusOverlay")).not.toHaveClass(/show/);
    await expect(page.locator("#freeSpinsMeter")).toBeVisible();
    await expect(page.locator("#freeSpinsDisplay")).toContainText(String(game.BONUS_CONFIG.values.bonusFreeSpins));
    await expect(page.locator("#rewardFeedback")).toHaveClass(/show/);
    await expect(page.locator("#rewardFeedbackAmount")).toHaveText(`+${game.BONUS_CONFIG.values.bonusFreeSpins} free spins`);
    await expect(page.locator("#rewardFeedbackText")).toHaveText("Bonus free spins added to your meter");
    await expect(page.locator("#statusMessage")).toContainText("Bonus win");
  });

  test("awards and displays a mini jackpot", async ({ page }) => {
    await page.evaluate(() => {
      state.jackpots.mini = 777;
      const amount = awardJackpot("mini");
      triggerJackpotFeedback("mini", amount);
      updateDisplays();
    });

    await expect(page.locator("#jackpotCelebration")).toHaveClass(/show/);
    await expect(page.locator("#winPopupLabel")).toHaveText("MINI Jackpot");
    await expect(page.locator("#miniJackpotDisplay")).toHaveText(String(game.JACKPOT_CONFIG.startingValues.mini));
  });
});

test.describe("regression", () => {
  test.beforeEach(async ({ page }) => {
    await gotoGame(page);
  });

  test("preserves spin speed preference via localStorage", async ({ page }) => {
    await page.click("#settingsButton");
    await page.click("#spinSpeedSkip");
    await page.reload();

    await expect(page.locator("#spinSpeedSkip")).toHaveAttribute("aria-pressed", "true");
  });

  test("preserves skip-to-finish behavior while spinning", async ({ page }) => {
    await page.evaluate(() => {
      applySpinSpeed("normal");
      updateDisplays();
    });

    await page.click("#spinButton");
    await expect(page.locator("#spinButton")).toHaveText("Skip");
    await page.click("#spinButton");
    await expect(page.locator("#spinButton")).toHaveText("Spin");
  });

  test("skip-to-finish keeps payline drawing clipped to the evaluated match", async ({ page }) => {
    await page.evaluate(({ board }) => {
      applySpinSpeed("normal");
      state.balance = 1000;
      state.bet = 10;
      state.freeSpins = 0;
      state.isBonusActive = false;
      state.bonusRound = null;
      NEAR_MISS_CONFIG.enabled = false;
      createBoard = () => board.map((row) => [...row]);
      rollRandomJackpotTier = () => null;
      updateDisplays();
    }, { board: TEST_CONFIG.standardWinBoard });

    await page.click("#spinButton");
    await expect(page.locator("#spinButton")).toHaveText("Skip");
    await page.click("#spinButton");
    await expect(page.locator("#spinButton")).toHaveText("Spin");
    await expect(page.locator(".payline-segment")).toHaveCount(2);

    const maxEndReel = await page.locator(".payline-segment").evaluateAll((segments) => (
      Math.max(...segments.map((segment) => Number(segment.getAttribute("data-end-reel"))))
    ));

    expect(maxEndReel).toBe(2);
  });

  test("preserves the keyboard big-win shortcut", async ({ page }) => {
    await page.keyboard.press("j");
    await expect(page.locator("#bigWinCelebration")).toHaveClass(/show/);
    await expect(page.locator("#statusMessage")).toHaveText("Big Win");
  });
});

test.describe("keyboard spin shortcut", () => {
  test.beforeEach(async ({ page }) => {
    await gotoGame(page);
    await page.evaluate(() => {
      applySpinSpeed("normal");
      state.balance = 1000;
      state.bet = 10;
      state.freeSpins = 0;
      state.isBonusActive = false;
      state.bonusRound = null;
      window.__spinButtonClickCount = 0;
      document.getElementById("spinButton").addEventListener("click", () => {
        window.__spinButtonClickCount += 1;
      });
      updateDisplays();
    });
  });

  test("pressing Space on the page activates the existing spin button path", async ({ page }) => {
    await page.keyboard.press("Space");

    await expect(page.locator("#spinButton")).toHaveText("Skip");
    await expect(page.locator("#statusMessage")).toHaveText("Reels spinning");
    await expect.poll(() => page.evaluate(() => window.__spinButtonClickCount)).toBe(1);
  });

  test("Space does not spin when the spin button is disabled", async ({ page }) => {
    await page.evaluate(() => {
      state.balance = 0;
      state.freeSpins = 0;
      updateDisplays();
    });

    await expect(page.locator("#spinButton")).toBeDisabled();
    await page.keyboard.press("Space");

    await expect.poll(() => page.evaluate(() => window.__spinButtonClickCount)).toBe(0);
    await expect.poll(() => page.evaluate(() => state.isSpinning)).toBe(false);
  });

  test("Space is not hijacked while typing in editable fields", async ({ page }) => {
    await page.evaluate(() => {
      const textarea = document.createElement("textarea");
      textarea.id = "shortcutTextarea";
      textarea.value = "bet";
      document.body.appendChild(textarea);
      textarea.focus();
    });

    await page.keyboard.press("Space");

    await expect(page.locator("#shortcutTextarea")).toHaveValue("bet ");
    await expect.poll(() => page.evaluate(() => window.__spinButtonClickCount)).toBe(0);
  });

  test("holding Space does not trigger repeated spin button clicks", async ({ page }) => {
    await page.evaluate(() => {
      applySpinSpeed("skip");
      updateDisplays();
    });

    await page.keyboard.down("Space");
    await page.keyboard.down("Space");
    await page.keyboard.up("Space");

    await expect.poll(() => page.evaluate(() => window.__spinButtonClickCount)).toBe(1);
  });

  test("focused spin button keeps its native Space keyboard behavior", async ({ page }) => {
    await page.locator("#spinButton").focus();
    await page.keyboard.press("Space");

    await expect.poll(() => page.evaluate(() => window.__spinButtonClickCount)).toBe(1);
  });
});
