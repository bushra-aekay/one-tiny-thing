Manual testing instructions — ship-today app

Overview
- These steps validate core flows (Home, Graph, Settings) and packaging for dev and production.

Prerequisites
- Node 18+ installed
- dependencies installed: `npm install`

Dev validation (fast)
1. Run dev server and Electron: `npm run electron-dev`
2. When the app opens in Electron:
   - Verify Home shows prompt when no entry exists.
   - Enter a task and click "start". Home should show the task and two actions: "mark as shipped" and "not today".
   - Click "mark as shipped" and verify the UI shows shipped state.
   - Switch to Graph: verify the grid updates and that the date cell for today shows "shipped" (hover title shows date and state).
   - Switch to Settings: change the name and verify the name appears on Home as a small greeting.
   - Click "reset all data" and verify storage is cleared and Home returns to the prompt.

Edge cases and robustness
- Corrupt storage:
  - In developer tools for the renderer (DevTools -> Application -> Local Storage), set `one-thing-data` to `bad json`.
  - Reload the app. It should not crash; it should fall back to defaults and show the Home prompt.

Production packaging validation (simulate build/export)
1. Run `npm run build` to build Next.
2. Run `npm run export` to export static files into `out/`.
3. Check `out/index.html` exists.
4. Start Electron pointing at the exported files for a quick production test:
   - `electron .` will load `file://.../out/index.html` in production mode if `NODE_ENV` is set; you can simulate by running `NODE_ENV=production electron .` on supported shells.
5. Verify the same flows as above in the packaged build.

Notes
- Date keys are local date strings (YYYY-MM-DD) to avoid UTC off-by-one issues.
- Storage key: `one-thing-data`.
- If packaging fails because `out/` is missing, ensure you ran `npm run export` before packaging.

If you want, I can add automated tests (Jest + jsdom) for `lib/storage.ts` and basic smoke tests for the UI; let me know and I will add them next.
