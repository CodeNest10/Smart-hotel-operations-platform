# SmartHotel — Operations Platform

A real-time hotel operations platform with live occupancy, housekeeping queue,
guest requests, and reservations — built on an event-driven microservice
backend with Kafka, Flask, PostgreSQL, and MongoDB, and a React frontend that
streams live updates over Server-Sent Events.

> **Team project** — 3 members. This repo currently contains the **Frontend
> (Member 3)** slice, designed to talk to the three Flask services through an
> Nginx API gateway.

---

## Architecture

```
                  ┌───────────────────────┐
                  │  React SPA (port 3000)│
                  │  - Dashboard (SSE)    │
                  │  - Rooms grid (SSE)   │
                  │  - Reservations       │
                  │  - Housekeeping queue │
                  │  - Guest requests     │
                  └───────────┬───────────┘
                              │  /api/*
                  ┌───────────▼───────────┐
                  │   Nginx API Gateway   │
                  │      (port 80)        │
                  └─┬───────┬───────────┬─┘
                    │       │           │
   /api/reservations│       │/api/hk    │/api/analytics
                    ▼       ▼           ▼
               ┌────────┐ ┌────────┐ ┌──────────┐
               │ Flask  │ │ Flask  │ │  Flask   │
               │ :5001  │ │ :5002  │ │  :5003   │
               └───┬────┘ └───┬────┘ └────┬─────┘
                   │          │           │
               ┌───▼──┐   ┌───▼───┐   ┌───▼────┐
               │  PG  │   │ Mongo │   │ Kafka  │
               └──────┘   └───────┘   └────────┘
```

* **Reservation service (:5001)** — Rooms & reservations, PostgreSQL.
* **Housekeeping service (:5002)** — Housekeeping queue, MongoDB, Kafka consumer.
* **Analytics service (:5003)** — Occupancy stream (SSE), guest requests, alerts.
* **Kafka** — `room-status-events`, `guest-request-events`.
* **Frontend** — React 18 SPA with real-time SSE hooks.

---

## Frontend tech stack

| Area              | Choice                                       |
|-------------------|----------------------------------------------|
| Framework         | React 18 (Create React App)                  |
| Routing           | React Router v6                              |
| HTTP              | Axios with JWT interceptor                   |
| Real-time         | EventSource (SSE) with exponential backoff   |
| Charts            | Chart.js + react-chartjs-2                   |
| Icons             | lucide-react                                 |
| State             | React Context (`HotelContext`, `AuthContext`)|
| Styling           | CSS custom properties + design tokens        |
| Fonts             | Inter (Google Fonts)                         |

---

## Getting started

### Prerequisites

* Node.js **18+** and npm
* A running backend (or mock) exposing:
  * `GET /api/reservations/rooms`
  * `GET /api/reservations/rooms/available`
  * `POST /api/reservations/rooms`
  * `GET /api/reservations/today`
  * `POST /api/reservations`
  * `PUT /api/reservations/:id/check-in`
  * `PUT /api/reservations/:id/check-out`
  * `GET /api/housekeeping/queue`
  * `PUT /api/housekeeping/rooms/:id/status`
  * `GET /api/analytics/stream/occupancy` (SSE)
  * `GET /api/analytics/stream/rooms` (SSE — optional, used by Room Grid)
  * `GET /api/analytics/housekeeping`
  * `GET /api/analytics/requests/pending`
  * `POST /api/analytics/requests`
  * `PUT /api/analytics/requests/:id/resolve`
  * `POST /api/auth/login` (returns `{ token, user: { name, role } }`)

### 1. Clone & install

```bash
git clone https://github.com/CodeNest10/Smart-hotel-operations-platform.git
cd Smart-hotel-operations-platform/frontend
npm install
```

### 2. Configure environment

Create `frontend/.env.local`:

```env
REACT_APP_API_BASE=http://localhost
```

Point this at wherever your Nginx gateway is listening. When running locally
against docker-compose, `http://localhost` (port 80) is usually correct.

### 3. Run the dev server

```bash
npm start
```

App opens at `http://localhost:3000`.

### 4. Production build

```bash
npm run build
```

Output goes to `frontend/build/`. Serve it behind Nginx, Vercel, Netlify, or
any static host.

---

## Authentication

The frontend uses JWT bearer auth.

1. User visits any route → redirected to `/login` if no token.
2. `POST /api/auth/login` with `{ email, password }` → returns `{ token, user }`.
3. Token is stored in `localStorage` under `token` and attached to every
   Axios request via the request interceptor in `src/api/axiosConfig.js`.
4. If any API call returns **401**, the interceptor clears the token and
   redirects to `/login`.

**Roles** — `MANAGER`, `FRONT_DESK`, `HOUSEKEEPING`.
Navigation items are filtered by role in `Navbar.jsx`:

| Route            | MANAGER | FRONT_DESK | HOUSEKEEPING |
|------------------|:-------:|:----------:|:------------:|
| `/` Dashboard    |    ✅   |     ✅     |      ✅      |
| `/rooms`         |    ✅   |     ✅     |      ✅      |
| `/reservations`  |    ✅   |     ✅     |              |
| `/housekeeping`  |    ✅   |            |      ✅      |
| `/requests`      |    ✅   |     ✅     |      ✅      |

For quick local testing without a backend, any email ending in `@manager.com`
logs in as MANAGER, `@housekeeping.com` as HOUSEKEEPING, everything else as
FRONT_DESK. See `src/context/AuthContext.jsx`.

---

## Project structure

```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.svg        ← custom hotel + WiFi logo
│   └── manifest.json
└── src/
    ├── api/               ← axios + service wrappers
    │   ├── axiosConfig.js
    │   ├── reservationApi.js
    │   ├── housekeepingApi.js
    │   └── analyticsApi.js
    ├── components/
    │   ├── Navbar.jsx
    │   ├── Logo.jsx
    │   ├── RoomCard.jsx
    │   ├── AlertBanner.jsx
    │   ├── Skeleton.jsx
    │   ├── EmptyState.jsx
    │   ├── LoadingSpinner.jsx
    │   ├── Toast.jsx
    │   ├── ErrorBoundary.jsx  ← crash wrapper
    │   └── ProtectedRoute.jsx ← auth gate
    ├── context/
    │   ├── HotelContext.jsx
    │   └── AuthContext.jsx
    ├── hooks/
    │   ├── useSSE.js
    │   ├── useRooms.js        ← SSE + polling fallback
    │   └── useCountUp.js
    ├── pages/
    │   ├── Login.jsx
    │   ├── Dashboard.jsx
    │   ├── RoomGrid.jsx
    │   ├── Reservations.jsx
    │   ├── HousekeepingQueue.jsx
    │   └── GuestRequests.jsx
    ├── utils/
    │   └── roomUtils.js
    ├── App.jsx
    ├── index.js
    └── index.css
```

---

## Real-time data flow

```
 Kafka topic ──► Analytics service ──► SSE endpoint
                                          │
                                          ▼
                                  useSSE() hook
                                          │
                                          ▼
                             HotelContext (global store)
                                          │
                                          ▼
             Dashboard / Navbar / RoomGrid re-render live
```

* **`useSSE(path)`** — opens an `EventSource`, parses JSON, auto-reconnects
  with exponential backoff (1 s → 30 s max).
* **`useRooms()`** — subscribes to `/api/analytics/stream/rooms` for per-room
  status updates, and falls back to a 10 s REST poll if SSE is unavailable.

---

## Troubleshooting

**PowerShell error: "running scripts is disabled"**
Use CMD instead, or run once:
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

**SSE connection keeps dropping in dev**
`EventSource` + CRA dev proxy can be flaky. Point
`REACT_APP_API_BASE` directly at your Nginx port instead of proxying.

**Blank page after `npm start`**
Make sure there's no stale `src/App.js` shadowing `src/App.jsx`.

---

## Scripts

| Command           | What it does                       |
|-------------------|------------------------------------|
| `npm start`       | Dev server on port 3000            |
| `npm run build`   | Production build → `build/`        |
| `npm test`        | Run unit tests (CRA/Jest)          |

---

## Team

* **Member 1** — Reservation service, PostgreSQL schema
* **Member 2** — Housekeeping service, Kafka consumer, MongoDB
* **Member 3** — Frontend (this slice), Analytics SSE integration

---

## License

Course project — SJSU. Not for production use without review.
