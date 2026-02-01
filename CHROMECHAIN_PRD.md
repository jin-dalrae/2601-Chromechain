# PRD: CHROMECHAIN ARTIFACT (GARY EDITION) 💝

**Status:** Hackathon Sprint (Advanced Phase)  
**Project Lead:** Luc (Stanford)  
**Product / Creative Direction:** Rae  

---

## 1. Executive Summary
**CHROMECHAIN** is an interactive, generative 3D art experience deployed on the ApeChain Gary Testnet. Users sculpt unique digital artifacts inside a speculative San Francisco 2050 environment and mint them as on-chain assets. The system integrates Espresso Systems’ shared sequencer to demonstrate fast preconfirmation and improved UX feedback during minting. The project focuses on making blockchain finality legible and aesthetic through real-time visual and interface cues rather than raw technical metrics.

## 2. Technical Stack (Gary Configuration)
- **Network:** ApeChain Gary Testnet (Chain ID: 3313939)
- **Sequencing / Preconfirmation:** Espresso Systems Shared Sequencer (Used to surface low-latency preconfirmation signals during user actions)
- **Frontend / Rendering:** React + Three.js
- **Web3 Integration:** Thirdweb SDK (Wallet connection, contract interaction, and event fetching optimized for hackathon velocity)

## 3. Functional Requirements
### 3.1 Espresso HUD (Status: Active)
- **Requirement:** A lightweight HUD component displaying network and transaction state during interaction and minting.
- **Signals:** Preconfirmation received, Approximate latency indicator (~250ms), Finalization state.
- **Goal:** Translate Espresso’s sequencing advantage into a user-visible experience.

### 3.2 Generative Randomizer (“Chaos Button”) (Status: Active)
- **Requirement:** A single-action control that randomizes all sculpting parameters: Shape, Color, Fluidity, Radius, and Knot Complexity (P/Q).
- **Goal:** Increase creative throughput and variability of minted artifacts.

### 3.3 Provenance Feed (Status: Planned)
- **Requirement:** A real-time or near-real-time feed of recently minted artifacts (Thumbnail, Wallet, Timestamp).
- **Goal:** Surface on-chain activity as part of the environment, reinforcing liveness and authorship.

## 4. Visual & Interaction Design (SF 2050)
- **Environment:** Speculative cyberpunk San Francisco (Neon lighting, Volumetric fog, High-contrast reflections).
- **Material System:** Liquid chrome shader with dynamic reflections.
- **Camera / Reflection Mode:** Live camera input (“mirror mode”) used as a visual texture (User-permission gated).
- **Design Intent:** Artifacts should feel reflective not only in material, but in authorship—blending user presence, environment, and chain state.

## 5. Hackathon Scope Constraints
- Focused on UX, interaction, and sequencing visibility, not protocol benchmarking.
- Client-heavy implementation favored for speed.
- Production hardening and deterministic randomness deferred.

---
*Updated to align with ApeChain Gary Testnet and Espresso Systems hackathon specifications.* 💝
