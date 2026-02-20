# MathCoaster — Code Analysis Report

**Date:** 2026-02-20  
**Scope:** Full codebase — back-end (`MathCoasterApi`, C#/.NET) and front-end (React/TypeScript)  
**Analysis type:** Manual static analysis for bugs, security vulnerabilities, and logical inaccuracies

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| High     | 2     | ✅ Fixed |
| Medium   | 3     | ✅ Fixed |
| Low / Info | 4   | ℹ️ Documented |

---

## Fixed Issues

### 🔴 HIGH — [Security] `mathParser.ts`: mathjs `import` function accessible in user expressions

**File:** `front-end/src/utils/mathParser.ts`

**Description:**  
`create(all)` registers every mathjs function, including `import`, which allows an expression
to inject arbitrary functions into the shared `math` instance. Although the context is a
single-user browser game (limiting the blast radius), calling `import({...})` inside a
user expression could override built-in math functions (e.g. redefine `sin`) for the
duration of the session and produce unexpected physics behaviour.

**Example exploit:** Entering `import({sin: () => 42})` as the expression would silently
replace `sin` for all subsequent evaluations in the same session.

**Fix:** Override the `import` function on the shared math instance so it throws immediately.

```ts
// Disable side-effect operations from user-supplied expressions
math.import(
  { import: () => { throw new Error('import is not allowed') } },
  { override: true }
)
```

---

### 🔴 HIGH — [Bug] `railGenerator.ts`: Floating-point loop accumulation

**File:** `front-end/src/engine/railGenerator.ts`

**Description:**  
The loop `for (let x = xMin; x <= xMax; x += step)` accumulates floating-point rounding
errors in the loop counter. For typical parameters (`xMin = -28`, `xMax = 28`, `step = 0.15`),
the last few vertices can be skipped or duplicated because the accumulated value of `x`
drifts away from the intended endpoint. This causes the visible rail curve to be cut
short near the right edge of the canvas.

**Fix:** Replace the accumulating float counter with a counter-based calculation:

```ts
const steps = Math.round((config.xMax - config.xMin) / config.step)
for (let i = 0; i <= steps; i++) {
  const x = config.xMin + i * config.step
  ...
}
```

---

### 🟠 MEDIUM — [Bug] `SubmitScoreRequest.cs`: Zero or negative `TimeMs` accepted

**File:** `back-end/MathCoasterApi/MathCoasterApi/Models/SubmitScoreRequest.cs`

**Description:**  
The validation attribute `[Range(0, long.MaxValue)]` allowed a submitted time of `0`
milliseconds — a value that is physically impossible to achieve (the ball cannot reach
the finish zone instantaneously). This allows artificial top scores on the leaderboard.

**Fix:** Change the lower bound to `1`:

```csharp
[Range(1, long.MaxValue)]
public long TimeMs { get; set; }
```

---

### 🟠 MEDIUM — [Bug] `LeaderboardEntry.cs`: No `[MaxLength]` attribute on `PlayerName`

**File:** `back-end/MathCoasterApi/MathCoasterApi/Models/LeaderboardEntry.cs`

**Description:**  
`SubmitScoreRequest` correctly limits `PlayerName` to 32 characters via `[StringLength(32)]`,
but the `LeaderboardEntry` entity had no corresponding `[MaxLength]` attribute. Without it:

- The EF Core model is inconsistent with the DTO constraint.
- Any direct write to the `DbContext` (e.g. in tests, fixtures, or future admin endpoints)
  would not be caught at the model level.
- If the database is ever migrated from SQLite to a length-enforcing engine (PostgreSQL,
  SQL Server), the column would accept arbitrarily long names.

**Fix:** Add the attribute and a corresponding EF Core migration:

```csharp
[MaxLength(32)]
public string PlayerName { get; set; } = "";
```

---

### 🟠 MEDIUM — [Reliability] `client.ts`: No request timeout

**File:** `front-end/src/api/client.ts`

**Description:**  
The `fetch` calls had no timeout. If the API server is slow or unreachable, requests hang
indefinitely and the UI shows a permanent loading state (e.g. the "Loading…" spinner in
`FinishModal` never resolves, blocking the player from submitting a score or closing the
modal).

**Fix:** Wrap every request in a 10-second `AbortController` timeout:

```ts
const REQUEST_TIMEOUT_MS = 10_000

function fetchWithTimeout(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(id)
  )
}
```

---

## Informational / Low-Priority Findings

These issues were identified but are lower risk and require no immediate code change.

### ℹ️ LOW — `Program.cs`: No rate limiting on leaderboard POST endpoint

**File:** `back-end/MathCoasterApi/MathCoasterApi/Program.cs`

**Description:**  
The `POST /api/leaderboard` endpoint has no rate limiting. A script could flood the
leaderboard with fake scores. Consider adding ASP.NET Core's built-in rate limiting
middleware (e.g. `AddRateLimiter` / `UseRateLimiter`) before this endpoint goes to
production.

---

### ℹ️ LOW — `MenuPage.tsx`: Leaderboard fetch errors silently swallowed

**File:** `front-end/src/pages/MenuPage.tsx`

**Description:**  
`getLeaderboard(selectedLevelId).then(setLeaderboard)` discards errors (the helper
already returns `[]` on failure). If the API is offline, the menu shows an empty
leaderboard without any indication to the user that the data could not be loaded.
Consider showing a brief "Could not load leaderboard" notice.

---

### ℹ️ LOW — `coordinateTransform.ts`: Division by zero if math range is degenerate

**File:** `front-end/src/engine/coordinateTransform.ts`

**Description:**  
If `mathXMin === mathXMax` or `mathYMin === mathYMax`, `scaleX` or `scaleY` would be
`Infinity`, producing `NaN` coordinates throughout the transform. Currently all call
sites use the hardcoded range `[-25, 25]`, so this cannot be triggered. However, if
`TransformConfig` is ever made user-configurable, a guard should be added:

```ts
if (mathXMax === mathXMin || mathYMax === mathYMin) {
  throw new Error('Math range must have non-zero width and height')
}
```

---

### ℹ️ INFO — `Program.cs`: `app.Run()` called after `db.Database.Migrate()`

**File:** `back-end/MathCoasterApi/MathCoasterApi/Program.cs`

**Description:**  
The migration runs in a scope created *after* `var app = builder.Build()` but *before*
`app.Run()`. This is a valid and common pattern. However, if the migration throws (e.g.
because the SQLite file is read-only in a containerised deployment), the application
exits silently. The error is logged to the console but there is no retry or clear
startup health-check. Consider wrapping the migration call in a `try/catch` that logs
a structured fatal error.

---

## No Issues Found In

- `LeaderboardController.cs` — model validation, level-id bounds check, and action routing are correct.
- `LeaderboardService.cs` — EF Core queries use parameterised predicates (no SQL injection risk).
- `renderPhysics.ts` — chain vertex indexing is correct (`getChildCount() + 1` vertices for an open chain).
- `physicsEngine.ts` — physics world setup and ball creation are consistent with Planck.js conventions.
- `formatTime.ts` — correct time formatting for non-negative millisecond values.
- `leaderboard.ts` — `computePreliminaryPlace` correctly positions the new score relative to sorted existing entries.
- `levels.ts` — level definitions are internally consistent (spawn points inside the playable area, zone coordinates in math space).
