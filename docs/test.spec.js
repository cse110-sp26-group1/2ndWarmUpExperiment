const path = require("path");
const { test, expect } = require("@playwright/test");
const game = require("./script.js");

const TEST_CONFIG = {
  bet: 10,
  fileUrl: `file://${path.join(__dirname, "index.html")}`,
  bonusSpinBoard: [
    ["dynamite", "badge", "dynamite", "k", "a"],
    ["cowboy", "dynamite", "wild", "q", "10"],
    ["boots", "j", "a", "k", "q"]
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
  jackpotBoard: [
    ["badge", "badge", "badge", "badge", "badge"],
    ["wild", "wild", "wild", "wild", "wild"],
    ["a", "k", "q", "j", "10"]
  ]
};

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
});

test.describe("end-to-end", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_CONFIG.fileUrl);
    await page.evaluate(() => {
      state.fastPlayEnabled = true;
      document.getElementById("fastPlayToggle").checked = true;
      state.balance = 1000;
      state.bet = 10;
      state.freeSpins = 0;
      state.isBonusActive = false;
      state.bonusRound = null;
      updateDisplays();
    });
  });

  test("shows jackpot meters and upgrades free spins to 8 on three scatters", async ({ page }) => {
    await expect(page.locator("#miniJackpotDisplay")).toHaveText("500");
    await expect(page.locator("#majorJackpotDisplay")).toHaveText("2500");
    await expect(page.locator("#grandJackpotDisplay")).toHaveText("25000");
    await expect(page.locator("#freeSpinsMeter")).toHaveAttribute("hidden", "");

    await settleBoard(page, TEST_CONFIG.freeSpinBoard, true);

    await expect(page.locator("#freeSpinsMeter")).toBeVisible();
    await expect(page.locator("#freeSpinsDisplay")).toContainText("8");
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
    await page.goto(TEST_CONFIG.fileUrl);
  });

  test("preserves fast-play preference via localStorage", async ({ page }) => {
    await page.click("#settingsButton");
    await page.check("#fastPlayToggle");
    await page.reload();

    await expect(page.locator("#fastPlayToggle")).toBeChecked();
  });

  test("preserves skip-to-finish behavior while spinning", async ({ page }) => {
    await page.evaluate(() => {
      state.fastPlayEnabled = false;
      document.getElementById("fastPlayToggle").checked = false;
      updateDisplays();
    });

    await page.click("#spinButton");
    await expect(page.locator("#spinButton")).toHaveText("Skip");
    await page.click("#spinButton");
    await expect(page.locator("#spinButton")).toHaveText("Spin");
  });

  test("preserves the keyboard big-win shortcut", async ({ page }) => {
    await page.keyboard.press("j");
    await expect(page.locator("#bigWinCelebration")).toHaveClass(/show/);
    await expect(page.locator("#statusMessage")).toHaveText("Big Win");
  });
});
