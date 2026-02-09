# ⚡ Lightning Network Payment Channel Simulator

An interactive educational web application that demonstrates how Bitcoin's Lightning Network payment channels work. Built with React, TypeScript, and modern web technologies.

![Lightning Network Simulator](https://img.shields.io/badge/Built%20with-React%20%2B%20TypeScript-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎯 Overview

This simulator provides hands-on learning about Lightning Network mechanics through interactive visualizations and simulations. Perfect for developers, students, and Bitcoin enthusiasts who want to understand how Layer 2 scaling works.

## ✨ Features

### 1. **Channel Creation Simulator** 
- Create payment channels between two nodes (Alice and Bob)
- Fund channels with custom BTC amounts
- View funding transactions and channel state
- Visual balance representation with animated charts

### 2. **Off-Chain Payments**
- Send instant, fee-free payments through channels
- Real-time balance updates
- Payment history tracking
- Commitment transaction versioning
- Bi-directional payment support

### 3. **HTLC Multi-Hop Routing**
- Simulate payments through multiple intermediaries (Alice → Bob → Carol)
- SHA256 hash lock and preimage reveal demonstration
- Animated payment flow visualization
- Step-by-step HTLC state transitions
- Educational tooltips explaining each phase

### 4. **Channel Closing Mechanisms**
- **Cooperative Close**: Mutual agreement with on-chain settlement
- **Force Close**: Unilateral channel closure
- **Penalty Demonstration**: See what happens when publishing old states
- Final balance settlement visualization

### 5. **Network Topology Viewer**
- Interactive 8-node Lightning Network graph
- Drag-and-drop node positioning
- Pathfinding algorithm (BFS) for route discovery
- Click two nodes to find payment routes
- Channel capacity visualization
- Animated payment routing

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: TailwindCSS with custom Lightning theme
- **Animations**: Framer Motion
- **Network Visualization**: React Flow (@xyflow/react)
- **Cryptography**: crypto-js (SHA256 hashing)
- **Build Tool**: Vite
- **Package Manager**: npm

## 🚀 Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm 11+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/lightning-simulator.git

# Navigate to project directory
cd lightning-simulator

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Build for Production

```bash
npm run build
npm run preview
```

## 📚 Educational Value

### What You'll Learn

1. **Payment Channels**
   - How 2-of-2 multisig transactions work
   - Off-chain transaction updates
   - Balance management without blockchain

2. **HTLCs (Hash Time-Locked Contracts)**
   - Preimage and hash locking mechanism
   - Multi-hop payment routing
   - Atomic payment guarantees
   - Timelock security

3. **Channel Lifecycle**
   - Funding transaction creation
   - Commitment transaction updates
   - Revocation secrets and penalties
   - Cooperative vs force closing

4. **Network Topology**
   - Decentralized routing
   - Liquidity management
   - Pathfinding algorithms
   - Channel capacity constraints

## 🎓 Key Concepts

### Lightning Network Glossary

- **Payment Channel**: A two-party relationship that allows off-chain Bitcoin transactions
- **Commitment Transaction**: The current state of channel balances
- **Revocation Secret**: Cryptographic proof used to penalize old state broadcasts
- **HTLC**: Hash Time-Locked Contract - enables secure multi-hop payments
- **Preimage**: Secret value that unlocks an HTLC
- **Funding Transaction**: On-chain TX that opens a payment channel
- **Breach Remedy**: Penalty transaction triggered by publishing old states

## 🎮 How to Use

### Step 1: Create a Channel
1. Click "📝 Create Channel"
2. Enter funding amount (e.g., 0.1 BTC)
3. Click "Open Payment Channel"
4. View the created channel state

### Step 2: Send Payments
1. Navigate to "⚡ Send Payment"
2. Select sender (Alice or Bob)
3. Enter payment amount
4. Click send and watch balances update

### Step 3: Explore HTLCs
1. Go to "🔐 HTLC Demo"
2. Configure payment amount
3. Click "Start HTLC Simulation"
4. Watch the multi-hop payment flow

### Step 4: View Network
1. Click "🌐 Network View"
2. Click any node to select source
3. Click another node to find route
4. Observe the calculated payment path

### Step 5: Close Channel
1. Navigate to "🔒 Close Channel"
2. Choose cooperative or force close
3. Optional: Test penalty mechanism
4. View final settlement

## 🏗️ Project Structure

```
lightning-simulator/
├── src/
│   ├── components/
│   │   ├── channel/          # Channel UI components
│   │   ├── payment/          # Payment forms and history
│   │   ├── htlc/             # HTLC routing visualizations
│   │   ├── network/          # Network topology viewer
│   │   └── transaction/      # Transaction display
│   ├── lib/
│   │   ├── ChannelManager.ts # Channel state management
│   │   └── HTLCManager.ts    # HTLC logic and routing
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Crypto and formatting utilities
│   └── App.tsx               # Main application component
├── public/
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Bitcoin Lightning Network developers
- React and TypeScript communities
- Educational resources from [Bitcoin Optech](https://bitcoinops.org/)
- Lightning Network Specification (BOLTs)

## 🔗 Resources

- [Lightning Network Whitepaper](https://lightning.network/lightning-network-paper.pdf)
- [Mastering the Lightning Network](https://github.com/lnbook/lnbook)
- [BOLTs (Basis of Lightning Technology)](https://github.com/lightning/bolts)
- [Bitcoin Optech](https://bitcoinops.org/)

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with ⚡ for Bitcoin education**
