# Code Quality:

- The current use of the `state` variable as a mutable global variable is a little dangerous
    - Probably too much to fix right now

- `SYMBOL_IDS` is incomplete and missing symbols are referenced with string literal
    - Renaming symbols not included would require a full grep search
    - Missing "badge", "cowboy", "cactus", "boots"

- Magic Numbers are Everywhere
```javascript
if (result.totalWin >= state.bet * 20) { }  // what is 20?

bigWinTimeout = window.setTimeout(clearBigWinCelebration, 2600); // why 2600?
```

- The script.js handles speed through `state.spinSpeed` and `applySpinSpeed()`, but in tests.spec.js a different `fastPlayEnabled` state is used instead (replace)
```javascript
// old
await page.evaluate(() => {
  state.fastPlayEnabled = true; // Does not natively exist in SlotState!
  document.getElementById("fastPlayToggle").checked = true; // Element doesn't exist in script.js logic!
  updateDisplays();
});
// using patterns from script.js
await page.evaluate(() => {
  applySpinSpeed("skip"); // Uses the real game logic to update state, persistence, and UI
});
```

- `resolveBonusPick` has some issues with extensibility
    - A `prize.type === "collect"` purposefully falls through the if else chain, should be handled in the if else chain itself
    - If an unknown prize type appears, everything breaks, not good for adding new prizes
```javascript
// rest of the if else chain
} else if (prize.type === "collect") {
  // collect ends the round immediately via shouldFinish; no pick count needed
} else {
  console.warn("Unknown prize type in resolveBonusPick, treating as no-op pick.", prize.type);
  bonusState.picksMade += 1;
}
```

- Defensive Checks (Optional Chaining and Nullish Coalescing) could be modernized for readability
```javascript
// old 
const button = event && event.target && typeof event.target.closest === "function"
  ? event.target.closest("[data-spin-speed]")
  : null;

const sourcePatterns = Array.isArray(source.patterns) ? source.patterns : [];

// new
const button = event?.target?.closest?.("[data-spin-speed]");

const sourcePatterns = source?.patterns ?? [];
```

- Names for audio and feedback are hardcoded strings, make them variables for refactoring
    - Same thing also for messages like "Pick a crate for bonus loot"
```javascript
// Current
playSound("bigWin");
triggerJackpotFeedback("major", amount);

// Better
const SOUNDS = { spin: "spin", reelStop: "reelStop", bigWin: "bigWin" };
const JACKPOTS = { mini: "mini", major: "major", grand: "grand" };

playSound(SOUNDS.bigWin);
triggerJackpotFeedback(JACKPOTS.major, amount);
```

- Curerntly `evaluateBoard()` doesnt follow the small scope function rule, could be split up
    - Currently evaluates payline wins, multipliers, scatters, spin awards, bonus triggers, and gets the `WinResult` object
    - Could be split up into `evaluatePaylines`, `evaluateScatters`, etc.

- If everything else quality wise goes smoothly, we could also separate `script.js` itself to make things more organized
    - Ex. A file for settings, a file for jackpot checks and prizes, etc.

- Also a couple of small nitpicks
    - Although we have an `initializeGame()` function, no `destroyGame()` exists to remove listeners from the DOM (could be an issue if the code is ever ported to something else)
    - The Bonus Round and Settings overlays dont have anything to stop the user from tabbing back into the slot machine, ignoring the screen (could use a simple focus trap)

# Unit Test Cases:

- Tests are needed for audio and volume settings
    - `clampVolume`, `setAudioVolumeState`, `toggleAudioMuteState`, `sanitizeAudioSettings` are all untested
- Tests verify if a jackpot was awarded properly, but not whether the math behind the amount was correct
    - Assert that `contributeToJackpots(10)` correctly increments based on the config
- `script.js` currently wraps all `localStorage` calls in try/catch blocks, but no tests mock a `localStorage` failure to trigger them
- No unit tests for checking if `finishActiveSpin()` successfuly empties the `setInvertval` and `setTimout` ids
- No check to make sure that the multiplier cap works (create a board with enough stacked multipliers to breach cap, check if payout halts at cap)

# Playwright Test Cases:

- No playwright tests for the Settings UI at all
- No spin interruption checks (all tests either use the fast-play option directly or wait for the spin to finish)
- No tests to make sure that popups correctly disappear or clear states (although tests exist to make sure they appear)
- No tests to make sure that `populateCoinBurst` doesn't cause any DOM leakage (since the function appends a ton of `<span>` elements, needs to make sure theyre cleared)

# Final Polish

- Responsiveness still sucks really bad
    - When going to mobile or other non-desktop viewports, the screen get so squished the user has to scroll to see the spin or the slots
    - Maybe we should make it clearer that its intended for horizontal use (currently no mention at all)
- In the same way that we use Cookies and browser state to save settings, we could also save balance and free spins
- Current sound effects are so quiet on default settings I genuinely didn't know if there were sound effects
