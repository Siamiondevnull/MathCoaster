# MathCoaster

A physics-based puzzle game that will remind you of your algebra class. Build a roller coaster by writing math — define the rail as `y = f(x)`, then watch the ball roll under gravity.

---

## The Idea

MathCoaster combines **mathematical functions** with **physics simulation**. You write an expression like `0.02*x*x` or `5*sin(0.3*x)`, and it becomes a rail in 2D space. A ball rolls along it under gravity. The goal: reach the finish zone while visiting required checkpoints, as fast as possible.

- **Levels:** Each level has spawn point, visit zones, finish zone, and a base function hint
- **Free Play:** No objectives — experiment with any expression
- **Leaderboard:** Submit your best times per level and compete with others

---

## Screenshots

**Main menu** — choose a level or free play, view leaderboards:

![Main menu](screenshots/Screenshot%202026-02-20%20011507.png)

**Gameplay** — define your rail with a math expression, click Run, and watch the ball go:

![Gameplay](screenshots/Screenshot%202026-02-20%20011537.png)

**Level complete** — see your time and submit to the leaderboard:

![Finish modal](screenshots/Screenshot%202026-02-20%20011554.png)

---

## How to Play

1. **Choose a level** or Free Play from the menu
2. **Enter a math expression** in the input field (e.g. `0.02*x*x`, `sin(x)`, `5*sin(0.3*x)`)
3. **Click "Rebuild"** to redraw the rail from your expression
4. **Click "Run"** to release the ball
5. **Reach the finish zone** — for levels, visit all checkpoints first
6. **Submit your time** to the leaderboard (optional)

**Expression syntax:** Supports `+`, `-`, `*`, `/`, `^`, `sin`, `cos`, `tan`, `sqrt`, `abs`, `x` as variable. Use `*` for multiplication (e.g. `0.02*x*x`).

---

## Main Principles

- **Physics:** 2D rigid-body simulation (Planck.js). The ball rolls under gravity; the rail is built from sampling your function.
- **Coordinate system:** Math space `x, y ∈ [-25, 25]`. The canvas maps this to screen coordinates.
- **Visit zones:** For levels, the ball must pass through each zone before the finish counts.
- **Out of bounds:** If the ball leaves the play area, the run fails — try a different expression.

---

## How to Run

### Docker (recommended)

One command to build and run frontend and backend:

```bash
docker compose up --build -d
```

- **Frontend:** http://localhost  
- **Backend API:** http://localhost:8080/api  

To stop: `docker compose down`

### Local development

**Backend** (requires .NET 10):

```bash
cd back-end/MathCoasterApi/MathCoasterApi
dotnet run
```

Runs at http://localhost:5260

**Frontend** (requires Node.js):

```bash
cd front-end
npm install
npm run dev
```

Runs at http://localhost:5173. Set `VITE_API_BASE_URL=http://localhost:5260/api` in `.env` if needed.

---

## Tech Stack

| Layer      | Technology                 |
| ---------- | -------------------------- |
| Frontend   | React, Vite, TypeScript    |
| Physics    | Planck.js (2D)            |
| Math       | mathjs                     |
| Backend    | ASP.NET Core Web API       |
| Database   | SQLite, Entity Framework   |

---

## Database

The SQLite database file (`mathcoaster.db`) is intentionally **not** listed in `.gitignore`. This is done to keep a consistent initial state and simplify local development. If you prefer not to track the database in version control, you may add `*.db` to `.gitignore` locally.
