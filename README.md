# 🤖 $paperhead Trading Agent

An autonomous cryptocurrency trading agent with a Matrix-themed dashboard interface. This AI-powered trading bot operates on Solana blockchain, providing real-time portfolio management, automated trading, and comprehensive performance analytics.

![Trading Agent Dashboard](https://img.shields.io/badge/Status-Active-green)
![Version](https://img.shields.io/badge/Version-0.1-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 Features

### 🎯 Core Functionality
- **Autonomous Trading**: AI-powered trading decisions with real-time market analysis
- **Portfolio Management**: Automatic asset allocation and rebalancing
- **Real-time Monitoring**: Live performance tracking and trade execution logs
- **Multi-asset Support**: Trade various cryptocurrencies on Solana blockchain

### 📊 Dashboard Features
- **Performance Graph**: Interactive charts with multiple timeframes (24h, 7d, 1M, 3M, 1Y, Max)
- **Agent Terminal**: Real-time logs with color-coded status indicators
- **Agent Profile**: Live statistics including uptime, success rate, and total profits
- **Asset Portfolio**: Current holdings with allocation percentages and returns
- **Deposit/Withdrawal Interface**: Seamless fund management

### 🎨 User Interface
- **Matrix-themed Design**: Cyberpunk aesthetic with green terminal colors
- **Responsive Layout**: Optimized for desktop and mobile devices
- **Real-time Updates**: Live data refresh every 5 seconds
- **Interactive Elements**: Clickable charts, external links to token explorers

## 🛠 Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **Custom UI Components**: Shadcn/ui component library

### Backend & Blockchain
- **Solana Blockchain**: High-performance blockchain for trading
- **Custom Trading Engine**: AI-powered decision making
- **Real-time WebSocket**: Live data streaming
- **RESTful API**: Standard HTTP endpoints for data fetching

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **Solana wallet** for trading operations

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/paperhead-trading-agent.git
cd paperhead-trading-agent
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```bash
# Copy the example environment file
cp .env.example .env.local
```

Add your configuration:
```env
# Solana Configuration
NEXT_PUBLIC_SOLANA_RPC_URL=your_solana_rpc_url
NEXT_PUBLIC_WALLET_PRIVATE_KEY=your_wallet_private_key

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

# Trading Configuration
NEXT_PUBLIC_DEFAULT_SLIPPAGE=0.5
NEXT_PUBLIC_MIN_TRADE_AMOUNT=0.01
```

### 4. Run the Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎮 Usage

### Starting the Agent
1. **Connect Wallet**: Ensure your Solana wallet is connected
2. **Deposit Funds**: Use the deposit interface to fund the trading agent
3. **Monitor Performance**: Watch real-time trading activity in the terminal
4. **Track Portfolio**: View current assets and their performance

### Key Functions

#### Deposit Funds
```typescript
// Deposit PAPERHEAD tokens to the agent
await depositToAgent(amount: number)
```

#### Withdraw Funds
```typescript
// Withdraw funds from the agent
await withdrawFromAgent(amount: number)
```

#### Monitor Performance
- View real-time performance charts
- Track success rate and profit metrics
- Monitor individual asset allocations

## 📁 Project Structure

```
paperhead-trading-agent/
├── app/
│   ├── page.tsx              # Main dashboard component
│   ├── actions.ts            # Server actions for API calls
│   └── globals.css           # Global styles
├── components/
│   ├── ui/                   # Shadcn/ui components
│   │   ├── card.tsx
│   │   ├── button.tsx
│   │   └── input.tsx
│   └── trading-chart.tsx     # Custom chart component
├── lib/
│   └── utils.ts              # Utility functions
├── public/
│   └── assets/               # Static assets
├── types/
│   └── index.ts              # TypeScript type definitions
├── .env.example              # Environment variables template
├── package.json
└── README.md
```

## 🔧 Configuration

### Trading Parameters
```typescript
// Adjust these in your environment variables
const CONFIG = {
  defaultSlippage: 0.5,        // 0.5% slippage tolerance
  minTradeAmount: 0.01,        // Minimum trade size
  maxPositionSize: 1000,       // Maximum position size
  riskTolerance: "medium",     // Risk level: low, medium, high
  updateInterval: 5000,        // Data refresh interval (ms)
}
```

### API Endpoints
- `GET /api/performance` - Fetch performance data
- `GET /api/agent/stats` - Get agent statistics
- `GET /api/assets` - List traded assets
- `GET /api/logs` - Retrieve agent logs
- `POST /api/deposit` - Deposit funds
- `POST /api/withdraw` - Withdraw funds

## 🧪 Testing

Run the test suite:
```bash
npm run test
# or
yarn test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🔒 Security Considerations

- **Private Keys**: Never commit private keys to version control
- **Environment Variables**: Use secure environment variable management
- **API Security**: Implement proper authentication and rate limiting
- **Wallet Security**: Use hardware wallets for production trading

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the Repository**
2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit Changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to Branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use conventional commit messages
- Add tests for new features
- Update documentation as needed

## 📊 Performance Metrics

The agent tracks various performance indicators:

- **Total Trades**: Number of executed trades
- **Success Rate**: Percentage of profitable trades  
- **Total Profit**: Cumulative profit/loss
- **Average Volume**: Daily trading volume
- **TVL (Total Value Locked)**: Total funds under management
- **Uptime**: Agent operational time

## 🐛 Troubleshooting

### Common Issues

#### "Failed to connect to Solana network"
- Check your RPC URL in environment variables
- Verify network connectivity
- Try switching to a different RPC provider

#### "Insufficient balance"
- Ensure your wallet has enough SOL for transaction fees
- Check PAPERHEAD token balance
- Verify deposit transaction was successful

#### "Chart not loading"
- Check browser console for JavaScript errors
- Verify API endpoints are accessible
- Clear browser cache and reload

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Solana Foundation** for the high-performance blockchain
- **Vercel** for hosting and deployment platform
- **Shadcn/ui** for beautiful UI components
- **TradingView** for charting inspiration

## 📞 Support

- **Documentation**: [Link to docs]
- **Discord**: [Discord invite link]
- **Twitter**: [@paperhead_agent]
- **Email**: support@paperhead.ai

---

**⚠️ Disclaimer**: This trading agent involves financial risk. Only trade with funds you can afford to lose. Past performance does not guarantee future results. Always do your own research before making investment decisions. 