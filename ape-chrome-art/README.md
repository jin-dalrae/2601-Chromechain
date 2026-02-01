# 🔮 CHROMECHAIN

> **Generative 3D Chrome Art on ApeChain Gary Testnet**

CHROMECHAIN is an interactive, generative 3D art experience where users sculpt unique digital artifacts inside a speculative San Francisco 2050 environment and mint them as on-chain assets. Built with React, Three.js, and integrated with Espresso Systems' shared sequencer for fast preconfirmation UX.

![CHROMECHAIN](https://img.shields.io/badge/ApeChain-Gary_Testnet-purple?style=for-the-badge)
![Espresso](https://img.shields.io/badge/Espresso-Sequencer-00ffcc?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge)
![Three.js](https://img.shields.io/badge/Three.js-3D-black?style=for-the-badge)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎨 **Shape Morphing** | Choose from Blob, Knot, Gem, or Crystal geometries |
| 🌊 **Liquid Chrome Shader** | Dynamic reflective materials with real-time distortion |
| 📸 **Camera Mirror Mode** | Use your webcam as a live environment texture |
| 🎲 **Chaos Button** | Randomize all parameters for instant creativity |
| 💾 **Save/Load Drafts** | Save your artifact to localStorage and reload later |
| ⚡ **Espresso HUD** | Real-time sequencer status and preconfirmation feedback |
| 🌆 **SF 2050 Environment** | Cyberpunk atmosphere with neon lighting and volumetric fog |

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **3D Rendering**: Three.js + React Three Fiber + Drei
- **Web3**: Thirdweb SDK
- **Network**: ApeChain Gary Testnet (Chain ID: 3313939)
- **Sequencer**: Espresso Systems Shared Sequencer
- **Hosting**: Firebase Hosting
- **Build Tool**: Vite

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- A Web3 wallet (MetaMask, etc.)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd ape-chrome-art

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be running at `http://localhost:5173`

---

## 🎮 Usage

### Sculpting Your Artifact

1. **Connect Wallet** - Click the connect button (top right) to connect to ApeChain Gary Testnet
2. **Choose Shape** - Select from Blob, Knot, Gem, or Crystal
3. **Adjust Parameters**:
   - **Radius** - Size of your artifact
   - **P/Q Values** - Knot complexity (only for Knot shape)
   - **Segments** - Geometry detail level
   - **Fluidity** - Distortion amount
   - **Tint** - Color overlay
4. **Environment** - Switch between SF 2050, Night, or Studio modes
5. **Camera Mode** - Enable to use your webcam as environment reflection

### Saving Your Work

| Action | Description |
|--------|-------------|
| **💾 SAVE** | Saves current configuration to browser localStorage |
| **📂 LOAD** | Restores your last saved draft |
| **🗑️ CLEAR** | Deletes saved draft from storage |

Your artifact configuration persists across browser sessions!

---

## 🏗️ Development

### Project Structure

```
ape-chrome-art/
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Entry point
│   ├── main_wrapper.tsx     # Thirdweb provider wrapper
│   ├── components/
│   │   ├── AssetGallery.tsx
│   │   ├── ModifiedAssets.tsx
│   │   └── ShinyObject.tsx
│   └── lib/
│       └── firebase.ts      # Firebase configuration
├── firebase.json            # Firebase Hosting config
├── .firebaserc              # Firebase project config
├── vite.config.ts           # Vite configuration
└── package.json
```

### Commands

```bash
# Development
npm run dev          # Start dev server with hot reload

# Build
npm run build        # TypeScript check + production build

# Preview
npm run preview      # Preview production build locally
```

---

## 🚢 Deployment

### Firebase Hosting

```bash
# 1. Install Firebase SDK (if not already)
npm install firebase

# 2. Build for production
npm run build

# 3. Install Firebase CLI globally
npm install -g firebase-tools

# 4. Login to Firebase
firebase login

# 5. Deploy to hosting
firebase deploy --only hosting
```

**Live URLs after deployment:**
- https://chromechain-a7902.web.app
- https://chromechain-a7902.firebaseapp.com

---

## ⛓️ Network Configuration

### ApeChain Gary Testnet

| Property | Value |
|----------|-------|
| **Network Name** | ApeChain Gary Testnet |
| **Chain ID** | 3313939 |
| **RPC URL** | `https://apechain-tnet.rpc.caldera.xyz/http` |
| **Currency** | APE |
| **Decimals** | 18 |

### Adding to MetaMask

1. Open MetaMask → Networks → Add Network
2. Enter the configuration above
3. Save and switch to the network

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - feel free to use this project for your own creative experiments!

---

## 🙏 Acknowledgments

- **ApeChain** - For the Gary Testnet infrastructure
- **Espresso Systems** - For the shared sequencer technology
- **Thirdweb** - For seamless Web3 integration
- **React Three Fiber** - For making 3D in React beautiful

---

<p align="center">
  <strong>Built with 💝 for the ApeChain Hackathon</strong><br>
  <em>Project Lead: Luc (Stanford) | Creative Direction: Rae</em>
</p>
