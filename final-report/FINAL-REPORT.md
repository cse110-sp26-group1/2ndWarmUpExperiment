# FINAL REPORT: Engineering with AI – Slot Machine Project

## Overview

Throughout this project, we used Codex GPT 5.4 to iteratively build and refine a browser-based slot machine game. One of the main goals of this project was to learn how to effectively use AI through planning, prompting, and testing.

---

## Key Finding: Planning is Everything

The most important takeaway from this project is that **engineering with AI is fundamentally a planning problem**.

In Part 1 of the Slot Machine AI Experiment, we approached development with minimal research and less structured prompting resulting in:

- Missing features
- Inconsistent implementations
- Poor control over outputs

This assignment emphasized:

- Deep domain research
- Structured planning
- Intentional prompting

This shift significantly improved our slot machine quality and our control in the finished product.

As discussed in lecture:

> _You must understand X to build X._

By researching slot machines (history, mechanics, user behavior, retention strategies), we were able to:

- Identify meaningful features to implement
- Understand user expectations
- Design prompts for real-world slot machines

---

## Development Process

### 1. Research & Planning

We conducted extensive research on:

- Slot machine mechanics (paylines, RNG, bonuses, ...)
- Player behavior and retention strategies (near-misses, rewards, pacing)
- UI/UX patterns from mobile slot games
- Game variations (Megaways, cascading reels, cluster pay, etc.)

This informed:

- Feature selection
- UI design (Wild West theme, 5x3 layout)
- Engagement systems (bonuses, feedback, animations)

We documented all findings and used them to guide our AI prompting strategy.

---

### 2. Incremental Development with AI

Instead of using one large prompt, we:

- Broke development into **small, focused refinements**
- Built features step-by-step (going back some steps if problems occur):
  - Core UI and layout
  - Reel and spin logic
  - Game logic (payouts, paylines)
  - Bonus systems
  - UX improvements

This approach:

- Reduced errors
- Made debugging easier
- Prevented large-scale regressions

---

### 3. Prompt Engineering Strategy

We learned that **prompt quality directly determines output quality**.

Effective prompts included:

- Clear goals
- Explicit constraints (e.g., “preserve all existing functionality”)
- Detailed requirements (UI, logic, structure)
- Engineering standards (JSDoc, modularity, no hardcoding)

We also:

- Referenced specific files and DOM elements
- Scoped changes narrowly (e.g., “only modify Pick-a-Crate modal”)

Poor prompts (early on) led to:

- Lost features
- Partial implementations
- Inconsistent code

---

### 4. File Context Management

We discovered that:

- Providing **only relevant files** improved results
- Including unnecessary files (e.g., `node_modules`) would reduce output quality

Typical context included:

- `index.html`
- `styles.css`
- `script.js`
- Relevant test files

This helped the LLM stay focused and accurate.

---

### 5. Testing & Validation

We validated outputs using:

- Manual testing (UI, gameplay, responsiveness)
- Linting tools
- Playwright end-to-end tests

Testing was critical because:

- AI-generated code often appears correct but fails in edge cases
- UI issues (e.g., scrolling bugs) are not always obvious

We also did our best to ensure:

- No regressions in existing features
- Accessibility and responsiveness

---

### 6. AI Use Logging

We maintained `ai-use-log.md` to track:

- Prompts used
- Results (correct, partial, incorrect)
- Issues encountered
- Adjustments made

This helped us:

- Identify patterns in failures
- Improve prompt quality over time
- Document our engineering process clearly
- Coordinate progress among team members

---

### 7. Code Interaction Policy

We followed a strict rule:

- **Always attempt to fix issues using AI first**
- Only manually edit code after repeated failures

This was to align with assignment requirements.

---

## Results

### What Worked Well

- Structured, detailed prompts produced higher quality outputs
- Incremental development reduced complexity and errors
- Providing limited, relevant context improved accuracy
- Testing (especially Playwright) caught unexpected issues
- AI-use logging improved coordination and progress

### Challenges

- AI sometimes:

  - Removed existing functionality
  - Misinterpreted vague instructions
  - Introduced subtle UI bugs

- Maintaining consistency across multiple refinements was difficult
- Large prompts sometimes caused issues

---

## Conclusion

Our improved planning, research, and prompting strategy allowed us to build a significantly better slot machine compared to the previous assignment.

Ultimately, the project demonstrated that:

> **AI is a powerful tool, but only when guided by strong engineering practices.**
