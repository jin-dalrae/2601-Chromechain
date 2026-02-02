import React, { useState, useEffect } from "react";
import { ThirdwebProvider } from "thirdweb/react";
import App from "./App";
import GalleryPage from "./GalleryPage";

const TerminalLog = () => {
  const [logs, setLogs] = useState([
    "> INITIALIZING CHROME_CHAIN KERNEL...",
    "> CONNECTING TO APECHAIN GARY (ID: 3313939)...",
  ]);

  useEffect(() => {
    const messages = [
      "> ESTABLISHING ESPRESSO SEQUENCER HANDSHAKE...",
      "> LATENCY OPTIMIZED: ~240ms",
      "> LOADING SHADER LIBRARY: LIQUID_CHROME.glsl",
      "> LOADING GEOMETRY: KNOT_NEXUS_V4",
      "> PREWARMING RENDERER...",
      "> SYSTEM READY. WAITING FOR USER INPUT.",
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < messages.length) {
        setLogs(prev => [...prev, messages[i]]);
        i++;
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      fontFamily: "monospace", fontSize: "10px", color: "#00ffcc",
      background: "rgba(0,0,0,0.8)", padding: "15px", borderRadius: "4px",
      border: "1px solid rgba(0, 255, 204, 0.2)", height: "120px", overflowY: "auto",
      display: "flex", flexDirection: "column", gap: "4px", opacity: 0.8
    }}>
      {logs.map((log, i) => (
        <div key={i} style={{ opacity: 1 - (logs.length - 1 - i) * 0.1 }}>{log}</div>
      ))}
      <div style={{ animation: "blink 1s infinite" }}>_</div>
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
}

const StatCard = ({ label, value, sub }: StatCardProps) => (
  <div style={{
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
    padding: "15px", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "5px"
  }}>
    <div style={{ fontSize: "9px", opacity: 0.5, letterSpacing: "1px" }}>{label}</div>
    <div style={{ fontSize: "16px", fontWeight: "bold", color: "white" }}>{value}</div>
    <div style={{ fontSize: "9px", color: "#00ffcc" }}>{sub}</div>
  </div>
);

interface LandingPageProps {
  onEnter: () => void;
  onGallery: () => void;
}

const LandingPage = ({ onEnter, onGallery }: LandingPageProps) => {
  return (
    <div style={{
      height: "100vh", width: "100vw", background: "#050505",
      display: "flex", flexDirection: "column", color: "white",
      fontFamily: "system-ui, sans-serif", overflow: "hidden", position: "relative",
      backgroundImage: "linear-gradient(rgba(0, 255, 204, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 204, 0.03) 1px, transparent 1px)",
      backgroundSize: "40px 40px"
    }}>
      {/* Header Bar */}
      <div style={{
        height: "50px", borderBottom: "1px solid rgba(255,255,255,0.1)",
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px",
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)"
      }}>
        <div style={{ display: "flex", gap: "20px", fontSize: "10px", fontFamily: "monospace" }}>
          <span style={{ color: "#00ffcc" }}>● ONLINE</span>
          <span>NET: GARY_TESTNET</span>
          <span>SEQ: ESPRESSO_SYS</span>
        </div>
        <div style={{ fontSize: "10px", fontFamily: "monospace", opacity: 0.5 }}>V.2050.1.0</div>
      </div>

      <div style={{ flex: 1, display: "flex", padding: "60px", gap: "60px", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>

        {/* Left Column: Title & CTA */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: "12px", color: "#00ffcc", letterSpacing: "4px", marginBottom: "10px", border: "1px solid #00ffcc", width: "fit-content", padding: "4px 8px", borderRadius: "4px" }}>
            HACKATHON BUILD 001
          </div>
          <h1 style={{ fontSize: "80px", fontWeight: "900", lineHeight: "0.9", margin: "20px 0", letterSpacing: "-2px", textShadow: "0 0 40px rgba(0,255,204,0.2)" }}>
            CHROME<br />CHAIN
          </h1>
          <p style={{ fontSize: "16px", lineHeight: "1.6", opacity: 0.7, maxWidth: "500px", marginBottom: "40px" }}>
            The artifacts of 2050 are not static. They are liquid, reactive, and secured by the speed of light.
            <br /><br />
            Enter the studio to sculpt generative geometry on ApeChain, powered by Espresso preconfirmations.
          </p>

          <div style={{ display: "flex", gap: "20px" }}>
            <button
              onClick={onEnter}
              style={{
                padding: "18px 40px", background: "#00ffcc", color: "black",
                border: "none", borderRadius: "2px", fontSize: "14px", fontWeight: "900",
                letterSpacing: "2px", cursor: "pointer", clipPath: "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)"
              }}
            >
              INITIALIZE STUDIO
            </button>
            <button
              onClick={onGallery}
              style={{
                padding: "18px 40px", background: "transparent", color: "#00ffcc",
                border: "1px solid #00ffcc", borderRadius: "2px", fontSize: "14px", fontWeight: "900",
                letterSpacing: "2px", cursor: "pointer"
              }}
            >
              VIEW GALLERY
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", fontSize: "10px", fontFamily: "monospace", gap: "2px", opacity: 0.6, marginTop: "20px" }}>
            <div>latency: 24ms</div>
            <div>fps: 60</div>
          </div>

          <div style={{ marginTop: "40px" }}>
            <TerminalLog />
          </div>
        </div>

        {/* Right Column: Specs & Grid */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <StatCard label="NETWORK" value="ApeChain Gary" sub="Chain ID: 3313939" />
            <StatCard label="FINALITY" value="< 250ms" sub="Powered by Espresso" />
            <StatCard label="ENGINE" value="Three.js r160" sub="Liquid Chrome Shader" />
            <StatCard label="SYNC" value="Active" sub="Snapshot Mirroring" />
          </div>

          <div style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 100%)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "30px",
            display: "flex", flexDirection: "column", gap: "20px"
          }}>
            <div style={{ fontSize: "14px", fontWeight: "bold", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px" }}>
              SYSTEM CAPABILITIES
            </div>

            {[
              { title: "Generative Sculpting", desc: "Real-time mesh distortion & topology modification." },
              { title: "Visual Mirroring", desc: "Local camera feed integration for dynamic environment mapping." },
              { title: "On-Chain Minting", desc: "Direct ERC-721 artifacts with provenance tracking." }
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}>
                <div style={{ color: "#00ffcc", marginTop: "4px" }}>▹</div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: "bold" }}>{item.title}</div>
                  <div style={{ fontSize: "11px", opacity: 0.5, marginTop: "2px" }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default function Main() {
  const [view, setView] = useState<"landing" | "app" | "gallery">("landing");

  return (
    <ThirdwebProvider>
      {view === "landing" && (
        <LandingPage
          onEnter={() => setView("app")}
          onGallery={() => setView("gallery")}
        />
      )}

      {view === "app" && (
        <div style={{ animation: "slideUp 0.8s cubic-bezier(0.2, 1, 0.3, 1)" }}>
          <App />
          <style>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(20px); filter: blur(5px); }
              to { opacity: 1; transform: translateY(0); filter: blur(0); }
            }
          `}</style>
          {/* Back button for App view could be added inside App if needed, but for now browser refresh is fine or we add it later */}
        </div>
      )}

      {view === "gallery" && (
        <div style={{ animation: "fadeIn 0.5s ease" }}>
          <GalleryPage onBack={() => setView("landing")} />
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </ThirdwebProvider>
  );
}
