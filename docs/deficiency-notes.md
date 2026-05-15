# Deficiency Notes

## 1. Fragile state persistence / no reliable localStorage persistence

- How it can be detected: Original `budget.js` read `entry_list` directly with `JSON.parse(localStorage.getItem(...))`, so damaged storage data could crash the app and state updates were spread through UI rendering.
- Changed code area: `src/storage.js`, `budget.js`.
- Suggested Before vs. After snippet locations: Before `budget.js` old localStorage read/update; After `src/storage.js` `loadTransactions()` and `saveTransactions()`.
- Supporting literature/article type: Web Storage API reliability guidance, defensive JSON parsing, client-side state persistence articles.

## 2. Accessibility problems in forms and user feedback

- How it can be detected: Original inputs relied on placeholders, add controls were clickable `div` elements, validation silently returned or used no visible error, and updates were not announced to assistive technology.
- Changed code area: `index.html`, `style.css`, `budget.js`.
- Suggested Before vs. After snippet locations: Before `index.html` input blocks and plus `div`; After labelled forms, submit buttons, `#form-error`, and `#status-message`.
- Supporting literature/article type: WCAG form labels, ARIA live regions, keyboard accessibility, and color contrast guidance.

## 3. Tight coupling between business logic and DOM manipulation

- How it can be detected: Original `budget.js` calculated totals, mutated data, rendered DOM, edited entries, and saved storage in the same functions, making logic difficult to test without a browser.
- Changed code area: `src/budgetCore.js`, `budget.js`.
- Suggested Before vs. After snippet locations: Before `calculateTotal()`, `calculateBalance()`, and `updateUI()` in old `budget.js`; After pure functions in `src/budgetCore.js` and UI orchestration in `budget.js`.
- Supporting literature/article type: Separation of concerns, pure function testing, modular JavaScript design articles.

## 4. Lack of automated tests for budget calculations and validation

- How it can be detected: Original project had no `package.json`, no test runner, and no coverage report, so validation and calculation regressions were manually checked only.
- Changed code area: `package.json`, `vite.config.js`, `tests/budgetCore.test.js`, `tests/storage.test.js`.
- Suggested Before vs. After snippet locations: Before repository root without test configuration; After Vitest scripts and test files.
- Supporting literature/article type: Unit testing JavaScript business logic, test coverage reporting, regression testing in software engineering.
