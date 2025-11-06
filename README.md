# TokenMetrics — Market Indices & Crypto Overview

A full-stack web application that displays real-time market indices and cryptocurrency prices with a 30-day trend chart.  
It uses React + Vite for the frontend and Node.js + Express for the backend.  
All data is fetched from the Financial Modeling Prep (FMP) API, with a built-in server-side caching layer that improves performance, prevents redundant API calls, and keeps the app resilient during outages.

---

## Environment Setup

### Tech Stack

- **Frontend:** React + Vite + Chart.js  
- **Backend:** Node.js + Express  
- **API:** Financial Modeling Prep (FMP)  
- **Cache:** In-memory (TTL-based)

### Overview

This project has two main layers:

1. **Backend (Express server)** — Handles API requests, caching, rate-limiting, and fallback data logic.  
2. **Frontend (React app)** — Displays live index cards and charts using Chart.js.

Both services run concurrently with a single command.

Once you start the project using `npm run dev`, both the frontend and backend will run automatically:

- **Frontend (Vite):** [http://localhost:5173](http://localhost:5173)  
- **Backend (Express API):** [http://localhost:8080](http://localhost:8080)

### Clone and Install Dependencies

1. git clone https://github.com/AJ199/tokenmetrics-app.git
2. cd tokenmetrics-app
3. npm install
4. npm run dev
5. open link - http://localhost:5173

### About the Demo API Key

The demo API key from Financial Modeling Prep is globally shared and ideal for testing.  
However, it comes with limited daily usage and may occasionally cause HTTP 403 or 429 errors if the limit is reached.

By default, this project uses the **demo key** stored in the `.env` file:

To use your own API key, replace `demo` with your personal key.

---

## Caching Strategy

### Purpose

Financial APIs often have strict rate limits — for example, the free FMP API allows only 20 requests per minute.  
If every frontend refresh triggered new API calls, the app would quickly exceed its quota.

To solve this, the backend implements a **Time-To-Live (TTL)** based caching system.

### How It Works

When an endpoint such as `/api/indices` or `/api/history/:symbol` is requested:

1. The server checks if a cached entry exists and whether it’s still valid.  
2. If valid → returns data directly from memory.  
3. If expired or missing → makes a new API request, stores the response in cache, and returns it.  
4. If the vendor API fails (403/429/500), the server gracefully serves the last cached snapshot or fallback mock data.

### Refresh Interval

To balance data freshness with API rate limits, the server is designed to refresh cached data **no faster than every 60–120 seconds**.

### Fallback Mechanism

If FMP API calls fail, the app automatically serves the **most recent cached data** or **mock fallback content** so that users always see consistent and meaningful information.

---

## Working Demo

Frontend successfully shows indices (^GSPC, ^IXIC, BTCUSD, ETHUSD) and interactive 30-day chart on `localhost:5173`.

---

## Project Structure

```
tokenmetrics-app/
├── server/                     # Express backend
│   ├── index.js                # Entry point for backend
│   ├── cache.js                # In-memory caching logic
│   ├── limits.js               # Rate limiting
│   ├── vendorClient.js         # FMP API request handler
│   ├── ws.js                   # WebSocket live updates
│   └── monthlyCounter.json     # Local cache counter file
│
├── web/                        # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── IndexCard.jsx
│   │   │   └── ThirtyDayChart.jsx
│   │   ├── App.jsx
│   │   ├── api.js              # Frontend API calls
│   │   └── main.jsx
│   └── index.html
│
├── .env                        # Environment variables (uses demo API key)
├── .gitignore                  # Ignored files/folders
├── LICENSE
├── package.json
├── package-lock.json
└── README.md

```


