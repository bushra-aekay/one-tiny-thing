Refactor summary — centralize storage and simplify flows

Overview of changes made:

1. Centralized storage
   - Added: `lib/storage.ts` — single source-of-truth for the `one-thing-data` key.
   - Responsibilities: safe JSON parsing, local-date key formatting (YYYY-MM-DD local), helper functions (getData, setData, setDayEntry, deleteDayEntry, updateUser, resetAllData).

2. Home page
   - File: `components/home-page.tsx`
   - Changes: removed elapsed-time and timer code, use `lib/storage` helpers to read/write day entries, added explicit "not today" action, small greeting using stored user name.

3. Graph page
   - File: `components/graph-page.tsx`
   - Changes: uses `getData()` and `formatDateLocal()` to build last 42-day array, maps to tri-state values (shipped / not-shipped / none), adds distinct visual classes and accessible title/aria-label.

4. Settings page
   - File: `components/settings-page.tsx`
   - Changes: uses `getData()` / `updateUser()`, adds a "reset all data" button that calls `resetAllData()`.

5. Build & testing
   - File: `package.json` updated to include `export` script (`next export -o out`) and `test` script (`jest --passWithNoTests`).
   - Added: `jest.config.cjs` and `tests/storage.test.ts` to validate `lib/storage` behaviors using jsdom.
   - Added: `TESTING.md` manual test steps.

Rationale
- Product: align with "one thing per day" flow — no timers, clear shipped vs not shipped states.
- Robustness: handle corrupt localStorage JSON gracefully and use local date keys to avoid timezone issues.
- Maintainability: centralized storage reduces duplication and makes future changes easier.

Notes & follow-ups
- Packaging: `electron/main.js` loads `file://.../out/index.html` in production; `npm run export` produces `out/` needed for packaging. CI should run `npm run build && npm run export` before packaging with `electron-builder`.
- I did not remove entire demo files (e.g., `src/` Vite demo) — I left them intact for now. If you want, I can remove those as part of cleanup (confirm first).
- I added a minimal automated test for `lib/storage`; more tests covering UI behavior would be a next step.

If you'd like, I can prepare a PR with the changes and a concise description for the reviewers. Let me know if you want further cleanup (remove demo files, add UI tests, or adjust packaging pipeline for CI).