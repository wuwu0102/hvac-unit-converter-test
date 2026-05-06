# AI Coding Rules

## Core Rules

1. Do not rewrite the whole app unless explicitly requested.
2. Preserve existing features and routes.
3. Use small, traceable changes.
4. Keep engineering formulas isolated from UI components.
5. Never hard-code engineering constants directly inside UI.
6. Do not remove existing calculator pages.
7. Do not rename existing routes unless required.
8. Avoid breaking GitHub Pages deployment.
9. Always prevent NaN, Infinity, undefined, and invalid numeric outputs.
10. Mobile layout must be checked before finalizing changes.

## Engineering Calculation Rules

1. All formulas should live in reusable utility modules when practical.
2. Each formula must include unit assumptions.
3. Each engineering result must show units.
4. Estimated values must be clearly labeled as estimated.
5. If a result exceeds common engineering guidance, show a warning.
6. Do not claim a value is a universal standard unless backed by a specific standard.
7. Pipe inner diameters are estimation values unless material and schedule are explicitly selected.
8. Keep pressure, flow, velocity, cooling load, and temperature difference calculations separated.

## UI Rules

1. Avoid free-text input when the value should come from a controlled engineering list.
2. Prefer select or dropdown for standard engineering choices.
3. Show helper text near technical inputs.
4. Keep result cards readable on mobile.
5. Do not allow the keyboard to cover important result sections.
6. Keep Traditional Chinese as the current primary UI language unless explicitly changed.
7. Do not introduce unnecessary animations or heavy dependencies.

## Codex Workflow Rules

1. Before editing, inspect the current file structure.
2. Identify the smallest set of files required.
3. Modify only relevant files.
4. Run build before final response.
5. Summarize changed files.
6. Explain how to test manually.
7. Mention any assumptions clearly.
