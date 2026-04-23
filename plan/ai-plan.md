# AI Plan

## Overall Strategy

Our approach is to use **Codex GPT 5.4** to incrementally build a 5x3 slot machine game based on our domain and user research.

Rather than relying on a single large prompt, we will:

- Break development into **small, iterative steps**
- Continuously refine outputs through **follow-up prompts**, which is part of the assignment

We will prioritize:

- Maintaining **feature completeness** (not losing previously implemented features or getting unwanted features)
- Ensuring **code quality and consistency**
- Documenting **every interaction and adjustment**

---

## Development Approach

We will follow an **incremental and asynchronous workflow**:

- Build core features first:

  - UI skeleton (Wild West theme, 5x3 layout, control panel)
  - Reel system (spinning, stopping left → right)
  - Basic spin + balance + betting logic

- Gradually layer in core gameplay systems:

  - Win evaluation:
    - Left-to-right paylines
    - Multipliers
  - Advanced mechanics inspired by research:
    - Scatter symbols + free spins
    - Bonus rounds (e.g., choice-based rewards like picking items)

- Add engagement-enhancing mechanics:

  - Cascading reels (winning symbols disappear and new ones fall)
  - Cluster pay or alternative win systems (if feasible)
  - Near-miss outcomes to simulate “almost winning”
  - Progressive or increasing rewards (e.g., bonus scaling)

- Layer in UX and feedback systems:

  - Animations (spinning reels, cascading effects)
  - Visual highlights for wins (popups)
  - Sound effects (spins, wins, jackpots)
  - Optional fast-spin / skip animation feature
  - Notifications (e.g., big win messages)
  - Settings panel (changing language, toggling features, etc.)
  - Responsive design (mobile/tablet support)
  - Performance improvements

- Add retention-focused features:
  - Daily rewards / login bonuses (if feasible)
  - “Big win” announcements from other concurrent players
  - Theming consistency (Wild West aesthetic)

To avoid conflicts:

- Team members will **communicate before prompting** both on slack and ai-use-log.md making sure to refer to our google docs notes and research in the repo
- Only one person refines a specific feature at a time
- We will avoid overlapping prompts that could overwrite progress
- We'll attempt to organize a feature list that team members can choose and update as we refine, ensuring they're satsified according to expectations before checking off

## Prompting Strategy

We will experiment with multiple prompting styles:

- **Initial structured prompts**  
  → Generate full features or components (e.g., base UI, spin system)

- **Refinement prompts**  
  → Add features without removing existing ones  
  → Explicitly state: ~ _"preserve all existing functionality"_

We recognize that unclear prompts can lead to:

- Missing features
- Partial implementations
- Inconsistent code quality

So we will emphasize:

- Explicit requirements
- Clear constraints
- Complete instructions (e.g., "document all functions, not just new ones")

---

## AI Use Logging

We will use `ai-use-log.md` to document all interactions with Codex so we can stay up to date with our prompting.

Each entry will include:

- Prompt used
- Goal of the prompt
- Result (what worked / didn’t work)
- Issues encountered
- Adjustments made to improve results (Hand-made commits, best to ask for feedback from team before making our own commits)

We will also track:

- When features are lost or overwritten
- When prompts are too vague or too strict
- Improvements in prompt quality over time
- List of features to check off as we go and have them completed

---

## Code Interaction Policy

We will follow the assignment constraint:

- Always attempt to fix issues using the LLM first
- Only manually edit code after:
  - The LLM fails to resolve the issue
  - Multiple prompt refinements have been attempted
  - Ask team if unsure about a manual edit

All manual edits will be:

- Clearly documented in `ai-use-log.md`
- Justified with reasoning

---

## Code Quality & Standards

We will ensure all generated code meets software engineering standards:

- **Linted**: Validate HTML, CSS, and JS quality
- **Documented**: Use JSDoc for all functions
- **Tested**:
  - Write unit tests alongside development
  - Experiment with test-first prompting where possible
- **Clean Code**:
  - Meaningful naming
  - Small, modular functions
  - No hard-coded values
  - Avoid duplication (DRY)

We will prompt the LLM to follow these standards explicitly.

---

## Feature Tracking

We will maintain a checklist of required features to prevent loss during refinement:

- UI (Wild West theme, layout, controls)
- Reel mechanics (5x3 grid, spin behavior)
- Game logic (bets, payouts, paylines)
- UX features (animations, sounds, feedback)
- Retention features (bonuses, rewards)
- etc.

Prompts will explicitly reference this list when refining to ensure no regression in functionality.

---

## Adaptation & Iteration

We acknowledge that our initial strategy may not be optimal.

As we progress, we may:

- Change prompting styles
- Adjust level of detail in prompts
- Shift from large prompts to smaller scoped ones (or vice versa)

Any strategy changes will be:

- Logged in `ai-plan.md`
- Justified with observed outcomes

---

## Key Lessons We Expect to Explore

- How prompt specificity affects output quality
- Trade-offs between large vs incremental prompts
- Challenges in maintaining consistency across multiple files
- Limitations of LLMs in preserving existing functionality

## Notes we took that helped us create this plan (a plan to our plan):

[Link](https://docs.google.com/document/d/1DGNyPAzW7FFVSK9qrOIYrZT6S_XdE4ao5zFXF2SMY6E/edit?tab=t.0)
