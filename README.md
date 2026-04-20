# @coinsamba/js-exchanges-connector 🚀

**Universal cryptocurrency exchange connector for modern JavaScript environments**

A TypeScript library with 50+ exchange implementations that works natively in Node.js 22+ and modern browsers using ESM and native Fetch API.

## ✨ Features

### **Zero Dependencies**

- Uses native `fetch()` API (Node.js 22+ & modern browsers)
- No polyfills, no external HTTP clients
- Pure ESM module system

### **Universal Compatibility**

- **Node.js 22+** with native fetch support
- **Modern browsers** (Chrome 105+, Firefox 121+, Safari 16.4+)
- **TypeScript 5.5+** with full type definitions
- **ES2022** target with modern JavaScript features

### **Performance Optimized**

- Tree-shaking friendly ESM exports
- Minimal bundle size
- Native async/await with AbortController support

## 📦 Installation

```bash
npm install @coinsamba/js-exchanges-connector
# or
yarn add @coinsamba/js-exchanges-connector
# or
pnpm add @coinsamba/js-exchanges-connector
```

## 🚀 Quick Start

### **ES Modules (Recommended)**

```javascript
import { exchanges } from "@coinsamba/js-exchanges-connector";

// Create exchange instance
const binance = new exchanges.binance();

// Get ticker data
const ticker = await binance.getTicker("BTC", "USDT");
console.log("BTC/USDT:", ticker);

// Get all available trading pairs
const allTickers = await binance.getAllTickers();
console.log(`${allTickers.length} trading pairs available`);
```

### **Browser Usage**

```html
<script type="module">
  import { exchanges } from "https://esm.sh/@coinsamba/js-exchanges-connector";

  const binance = new exchanges.binance();
  // Use in browser...
</script>
```

## 📊 Supported Exchanges

50+ cryptocurrency exchanges including:

| Exchange        | API Coverage       | Notes                |
| --------------- | ------------------ | -------------------- |
| Binance         | Tickers, Orderbook | Full REST API        |
| Coinbase Pro    | Tickers, Orderbook | Professional trading |
| Kraken          | Tickers, Orderbook | High liquidity       |
| Bybit           | Tickers, Orderbook | Derivatives support  |
| Mercado Bitcoin | Tickers, Orderbook | Brazilian market     |
| Foxbit          | Tickers, Orderbook | Brazilian P2P        |
| NovaDAX         | Tickers, Orderbook | Brazilian exchange   |
| ...and 40+ more |                    |                      |

## 🔧 Development

### **Build**

```bash
npm run build
# Compiles TypeScript to ESM JavaScript
```

### **Test**

```bash
npm test
# Uses Node.js native test runner
```

### **Lint**

```bash
npm run lint
```

## 🏗️ Architecture

### **Modern Fetcher Implementation**

```typescript
// Uses native fetch with modern features
const controller = new AbortController();
const response = await fetch(url, {
  signal: controller.signal,
  headers: { Accept: "application/json" },
});
```

### **Type-Safe API**

```typescript
interface ITicker {
  exchangeId: string;
  base: string;
  quote: string;
  last: number;
  bid: number;
  ask: number;
  vol: number;
}

// Full TypeScript support with modern features
const ticker: ITicker = await exchange.getTicker("BTC", "USDT");
```

## 🌐 Browser Compatibility

### **Modern Browsers Only**

- Chrome 105+ (2022)
- Firefox 121+ (2023)
- Safari 16.4+ (2023)
- Edge 105+ (2022)

### **No Polyfills Required**

The library assumes modern browser features:

- `fetch()` API
- `AbortController`
- `Promise` with async/await
- ES Modules (import/export)

## 📝 License

MIT - Free for commercial and personal use.

## 🤝 Contributing

Contributions welcome! Please ensure:

- Code follows modern JavaScript/TypeScript patterns
- Works in Node.js 22+ and modern browsers
- Includes TypeScript definitions
- Uses native APIs (no polyfills)
