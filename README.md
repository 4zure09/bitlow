# Bitlow — Crypto Market Dashboard

A real-time cryptocurrency market dashboard built with Next.js, MobX, and SatchelJS, powered by the public Binance API.

## Infomation

- **Name:** Thanh Phu Nguyen
- **Email:** [jngkao@gmail.com](mailto:jngkao@gmail.com)
- **LinkedIn:** [linkedin.com/in/jngkao](https://www.linkedin.com/in/jngkao/)

## Features

- **Real-time Market Dashboard** — Live prices for all USDT trading pairs via WebSocket
- **Price Flash Animation** — Rows flash green/red when prices move up/down
- **Token Detail View** — Candlestick chart with configurable timeframes (1m, 5m, 15m, 1h, 4h, 1D)
- **Live Candlestick Chart** — Historical klines loaded via REST, current candle updated via WebSocket
- **Order Book** — Real-time bid/ask depth for any selected pair
- **Recent Trades** — Scrolling live trade feed
- **Search with Auto-suggest** — Filter and navigate to any trading pair
- **Watchlist/Favorites** — Star pairs to pin them to the top; dedicated Watchlist tab
- **Localization** — English / Vietnamese (EN / VI)
- **Theme Toggle** — Light / Dark mode
- **Profile Avatar** — Upload and persist a profile image locally
- **State Persistence** — Settings (language, theme, favorites, avatar) saved to `localStorage`
- **WebSocket Auto-Reconnect** — Exponential backoff reconnection on network drops
- **Responsive Design** — Optimized for desktop and mobile

## Tech Stack

| Area             | Choice                               |
| ---------------- | ------------------------------------ |
| Framework        | Next.js 16 (App Router)              |
| Language         | TypeScript (strict)                  |
| UI               | React 19                             |
| Styling          | Tailwind CSS v4                      |
| State Management | MobX + SatchelJS                     |
| Real-time Data   | Native WebSocket API                 |
| Charts           | Lightweight Charts (TradingView)     |
| i18n             | next-intl                            |
| Data Source      | Binance Public API (no key required) |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
bitlow/
├── app/
│   ├── layout.tsx              # Root layout with StoreProvider
│   ├── page.tsx                # Market Dashboard
│   └── [symbol]/page.tsx       # Token Detail (chart + orderbook + trades)
├── components/
│   ├── chart/
│   │   └── CandlestickChart.tsx  # TradingView lightweight-charts integration
│   ├── layout/
│   │   └── Navbar.tsx
│   ├── market/
│   │   ├── MarketCard.tsx        # Table with granular MobX observer rows
│   │   ├── OrderBook.tsx
│   │   └── RecentTrades.tsx
│   ├── providers/
│   │   └── StoreProvider.tsx     # Bootstraps stores + next-intl
│   ├── search/
│   │   └── SearchBar.tsx         # Auto-suggest with keyboard navigation
│   ├── settings/
│   │   ├── AvatarUpload.tsx
│   │   ├── LanguageSwitcher.tsx
│   │   └── ThemeToggle.tsx
│   └── ui/
│       ├── ErrorBoundary.tsx
│       ├── SkeletonLoader.tsx
│       └── Toast.tsx
├── lib/
│   ├── binance/
│   │   ├── rest.ts              # Typed Binance REST API client
│   │   └── websocket.ts         # WS manager with exponential backoff reconnect
│   └── i18n/
│       ├── en.json
│       └── vi.json
├── stores/
│   ├── market/
│   │   ├── marketStore.ts       # Observable state (ObservableMap for tickers)
│   │   ├── marketActions.ts     # Action creators (what happened)
│   │   ├── marketMutators.ts    # Pure state mutations
│   │   └── marketOrchestrators.ts # Side effects (REST + WS lifecycle)
│   └── settings/
│       ├── settingsStore.ts
│       ├── settingsActions.ts
│       ├── settingsMutators.ts  # Mutations + localStorage persistence
│       └── settingsOrchestrators.ts
└── types/
    ├── binance.ts               # REST response + WebSocket payload types
    └── market.ts                # Domain types (TickerData, CandleData, etc.)
```

## Architectural Decisions

### SatchelJS (Flux Pattern)

The app strictly follows the SatchelJS unidirectional data flow:

```
User action / WebSocket event
      ↓
  Orchestrator  (side effects: API calls, WS connections)
      ↓
    Action      (describes what happened)
      ↓
   Mutator      (pure function: updates the MobX store)
      ↓
MobX observer   (React component re-renders only what changed)
```

This separates concerns clearly: UI components only dispatch actions, orchestrators own all async logic, mutators are pure and testable.

### WebSocket Performance

The Binance `!miniTicker@arr` stream can emit 100+ symbols every second. To avoid flooding React with updates:

- WS messages are **batched in a 200ms timer** before dispatching `updateTickers`
- Each `MarketRow` component is an independent `observer` — only the row whose ticker changed re-renders (not the entire table)
- `React.memo` wraps static components like `MarketTable`

### Candlestick Chart

`CandlestickChart` uses MobX `reaction` (not React `useEffect`) to observe `store.candles`:

- **New dataset** (when `firstCandleTime` changes): calls `series.setData()` to replace all candles
- **Live update** (when last candle's OHLCV changes): calls `series.update()` — no re-render, no full data replacement

This gives smooth 60fps chart updates without remounting the chart.

### WebSocket Reconnection

`lib/binance/websocket.ts` implements exponential backoff:

- Initial delay: 1s
- Each failure doubles the delay: 1s → 2s → 4s → ... → 30s (max)
- Resets to 1s on successful reconnection

### State Persistence

All user preferences (language, theme, favorites, avatar) are stored in `localStorage` under the key `bitlow:settings`. The `settingsMutators.ts` calls `persistSettings()` after every state change. On app load, `settingsStore.ts` reads the saved state as the initial MobX observable value.

## Binance API Reference

| Endpoint                                         | Purpose                       |
| ------------------------------------------------ | ----------------------------- |
| `GET /api/v3/exchangeInfo`                       | All trading pairs             |
| `GET /api/v3/ticker/24hr`                        | Initial price snapshot        |
| `GET /api/v3/klines?symbol=BTCUSDT&interval=15m` | Historical candlestick data   |
| `wss://.../!miniTicker@arr`                      | All market prices (real-time) |
| `wss://.../<symbol>@kline_<interval>`            | Live candlestick updates      |
| `wss://.../<symbol>@depth20@100ms`               | Order book depth              |
| `wss://.../<symbol>@trade`                       | Recent individual trades      |

No API key is required for any of these endpoints.
