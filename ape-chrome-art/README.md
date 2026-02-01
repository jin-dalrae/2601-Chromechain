# CHROMECHAIN

Generative 3D artifacts sculpted in the cloud. Secured by Espresso preconfirmations on ApeChain Gary Testnet.

## Overview

CHROMECHAIN is an interactive, generative 3D art experience where users sculpt unique digital artifacts inside a speculative San Francisco 2050 environment. The system integrates Espresso Systems' shared sequencer to demonstrate fast preconfirmation (~250ms) and improved UX feedback during minting.

## Tech Stack

- **Network:** ApeChain Gary Testnet (Chain ID: 3313939)
- **Sequencing:** Espresso Systems Shared Sequencer
- **Frontend:** React + Three.js + React Three Fiber
- **Web3:** Thirdweb SDK

## Features

### Sculpting Controls
- **Shape Morph** - Blob, Knot, Gem, Crystal
- **Sculpting** - Radius, Knot P/Q parameters, Detail level
- **Environment** - SF 2050, Night, Studio presets
- **Fluidity & Tint** - Distortion amount, Color picker
- **Material Presets** - Chrome, Gold, Plasma

### Mirror Mode
Live camera input used as environment reflection texture (1s pulse sync).

### Espresso HUD
Real-time display of sequencer status, preconfirmation state, and latency (~248ms).

### Randomizer
One-click chaos button that randomizes all sculpting parameters.

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── main.tsx           # Entry point
├── main_wrapper.tsx   # Landing page + ThirdwebProvider
├── App.tsx            # Main sculpting experience
└── components/
    └── ShinyObject.tsx
```

## Configuration

Thirdweb Client ID is configured in `src/App.tsx`. Update if needed:

```typescript
const client = createThirdwebClient({
  clientId: "your-client-id",
});
```

## Network Details

| Parameter | Value |
|-----------|-------|
| Network | ApeChain Gary Testnet |
| Chain ID | 3313939 |
| RPC | https://apechain-tnet.rpc.caldera.xyz/http |
| Currency | APE |
| Faucet | https://apechain-tnet.hub.caldera.xyz/ |

## Roadmap

- [x] 3D Sculpting Engine
- [x] Espresso HUD
- [x] Camera Mirror Mode
- [x] Generative Randomizer
- [x] Landing Page
- [ ] NFT Minting
- [ ] Provenance Feed

## Credits

**Project Lead:** Luc (Stanford)
**Creative Direction:** Rae

Built for Espresso x ApeChain Hackathon.
