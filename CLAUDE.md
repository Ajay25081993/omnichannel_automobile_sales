<!-- BEGIN CLAUDE-CODE-AGENT MEMORY -->
# Project Memory (auto-injected by Claude Code Agent)

Persistent context for this repository. Do not edit between the BEGIN/END
markers — they are regenerated on every agent run and stripped before push.

- **Repository:** omnichannel_automobile_sales
- **Primary language:** javascript
- **Last refreshed:** 2026-05-06T16:27:06.027414+00:00

## File Tree

```
.gitignore
  README.md
  backend/
    .env.example
    .gitignore
    package-lock.json
    package.json
    src/
      app.js
      server.js
      config/
        db.js
      middleware/
        errorHandler.js
      models/
        Booking.js
        LoanApplication.js
        TestDrive.js
        Vehicle.js
      routes/
        bookingRoutes.js
        loanRoutes.js
        testDriveRoutes.js
        vehicleRoutes.js
  frontend/
    .env.example
    .gitignore
    README.md
    eslint.config.js
    index.html
    package-lock.json
    package.json
    vite.config.js
    public/
      favicon.svg
      icons.svg
    src/
      App.jsx
      index.css
      main.jsx
      api/
        client.js
      assets/
        hero.png
        react.svg
        vite.svg
      layouts/
        AppLayout.jsx
      pages/
        BookingsPage.jsx
        HomePage.jsx
        InventoryPage.jsx
        LoansPage.jsx
        TestDrivesPage.jsx
```

## Key Project Files

```
--- README.md ---
# Omnichannel Automobile Sales Platform

Boilerplate for an omnichannel dealership experience: online vehicle booking, loan approval workflows, dealer inventory management, and test-drive scheduling.

## Architecture

| Area | Stack |
| --- | --- |
| **Frontend** | React, Vite, Tailwind CSS v4, React Router |
| **Backend** | Node.js (ES modules), Express, Mongoose |
| **Database** | MongoDB |

The React app expects a REST API at `/api/*`. During local development, Vite proxies `/api` to the Express server.

## Prerequisites

- Node.js 18+ (recommended current LTS)
- MongoDB running locally or a connection URI to a hosted cluster

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Defaults: API on `http://localhost:5000`, database name `omnichannel_auto_sales` (see `.env.example`).

### 2. Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

### Environment variables

**`backend/.env`**

| Variable | Description |
| --- | --- |
| `PORT` | HTTP port (default `5000`) |
| `MONGODB_URI` | MongoDB connection string |

**`frontend/.env` (optional)**

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | API origin for production builds, e.g. `http://localhost:5000`. Omit in dev to use the Vite dev proxy. |

Copy from `frontend/.env.example` if you need a template.

## Scripts

**Backend** (`backend/`)

- `npm run dev` — start API with `--watch`
- `npm start` — start API once (no watch)

**Frontend** (`frontend/`)

- `npm run dev` — Vite dev server
- `npm run build` — production build to `frontend/dist`
- `npm run preview` — serve the production build locally
- `npm run lint` — ESLint

## API overview

Base path: `/api` (health check is excluded below).

| Resource | Routes | Notes |
| --- | --- | --- |
| Health | `GET /api/health` | `{ ok: true }` |
| Vehicles | `GET`, `POST` `/api/vehicles`; `GET`, `PATCH`, `DELETE` `/api/vehicles/:id` | Inventory |
| Bookings | `GET`, `POST` `/api/bookings`; `PATCH` `/api/bookings/:id` | Creating a booking reserves the vehicle in a transaction |
| Loans | `GET`, `POST` `/api/loans`; `PATCH` `/api/loans/:id/status` | Workflow status updates |
| Test drives | `GET`, `POST` `/api/test-drives`; `PATCH` `/api/test-drives/:id` | Scheduling |

List responses use populated refs where applicable (e.g. bookings and test drives include vehicle summary fields when populated).

## Project layout

```
omnichannel_automobile_sales/
├── backend/
│   ├── src/
│   │   ├── app.js              # Express app & route mounting
│   │   ├── server.js           # Bootstrap & DB connection
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                # Fetch helper
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── ...
│   └── package.json
└── README.md
```

## Production build (frontend)

Set `VITE_API_URL` to your deployed API origin (no trailing path; the client calls `/api/...`).

```bash
cd frontend
npm run build
```

Serve the contents of `frontend/dist/` with any static host or CDN, and configure that host to proxy `/api` to your backend if API and SPA share one origin.

## License

Private / use per your repository policy.
```

## Recent Runs (most recent last)

- **2026-05-06T15:59:34.059005+00:00** — 0 file(s) touched. I found that no JIRA issues matched your search query "Find all issues where status is In Progress".   Without specific JIRA ticket details or requirements, I cannot determine what code changes to make. Could you please:  1. **Provide a specific JIRA ticket number** (e.g., "PROJ-123"), or 2. **Refin

## Guidance
- Use this memory for structural questions before re-running Glob/Grep.
- Always Read a file before Editing it.
- If this memory looks stale, mention it in your final summary.

<!-- END CLAUDE-CODE-AGENT MEMORY -->
