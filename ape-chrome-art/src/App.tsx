import React, { useState, Suspense, useEffect, useMemo, useRef, useCallback } from "react";
import { createThirdwebClient, defineChain } from "thirdweb";
import { ConnectButton } from "thirdweb/react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, Stars, Float, MeshDistortMaterial, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

const garyTestnet = defineChain({
  id: 3313939,
  rpc: "https://apechain-tnet.rpc.caldera.xyz/http",
  nativeCurrency: { name: "ApeCoin", symbol: "APE", decimals: 18 },
});

const client = createThirdwebClient({
  clientId: "a791184d868d15f04f812d872353a887",
});

// ═══════════════════════════════════════════════════════════════════════════════
// 💾 ARTIFACT STORAGE - Save/Load Draft System
// ═══════════════════════════════════════════════════════════════════════════════
const STORAGE_KEY = "chromechain_artifact_draft";

interface ArtifactDraft {
  shape: string;
  radius: number;
  tube: number;
  radial: number;
  distort: number;
  speed: number;
  color: string;
  thickness: number;
  p: number;
  q: number;
  env: string;
  showBg: boolean;
  savedAt: string;
}

const saveArtifactDraft = (draft: Omit<ArtifactDraft, "savedAt">): boolean => {
  try {
    const draftWithTimestamp: ArtifactDraft = {
      ...draft,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draftWithTimestamp));
    return true;
  } catch (err) {
    console.error("Failed to save draft:", err);
    return false;
  }
};

const loadArtifactDraft = (): ArtifactDraft | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as ArtifactDraft;
  } catch (err) {
    console.error("Failed to load draft:", err);
    return null;
  }
};

const clearArtifactDraft = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear draft:", err);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🔔 Toast Notification Component
// ═══════════════════════════════════════════════════════════════════════════════
const Toast = ({ message, type, onClose }: { message: string; type: "success" | "info" | "error"; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "rgba(0, 255, 136, 0.95)" : type === "error" ? "rgba(255, 68, 68, 0.95)" : "rgba(0, 200, 255, 0.95)";
  const textColor = type === "success" ? "#000" : type === "error" ? "#fff" : "#000";

  return (
    <div style={{
      position: "fixed",
      bottom: 120,
      left: "50%",
      transform: "translateX(-50%)",
      background: bgColor,
      color: textColor,
      padding: "12px 24px",
      borderRadius: "50px",
      fontWeight: "bold",
      fontSize: "12px",
      letterSpacing: "1px",
      zIndex: 1000,
      boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
      animation: "slideUp 0.3s ease-out",
    }}>
      {message}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
};

const SnapshotBackground = ({ isActive, env, showBg }: { isActive: boolean; env: string; showBg: boolean }) => {
  const [snapshot, setSnapshot] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isActive) {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");

      const takeSnapshot = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          video.srcObject = stream;
          await video.play();
          await new Promise(r => setTimeout(r, 100));
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext("2d")?.drawImage(video, 0, 0);
          const texture = new THREE.CanvasTexture(canvas);
          texture.colorSpace = THREE.SRGBColorSpace;
          setSnapshot(texture);
          stream.getTracks().forEach(t => t.stop());
        } catch (err) { console.error("Snapshot error:", err); }
      };

      takeSnapshot();
      interval = setInterval(takeSnapshot, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive]);

  if (isActive && snapshot) {
    return (
      <Environment background={showBg} blur={0.2}>
        <mesh scale={100}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshBasicMaterial side={THREE.BackSide} map={snapshot} />
        </mesh>
      </Environment>
    );
  }

  return <Environment preset={env as "city" | "night" | "studio"} background={showBg} blur={0.5} />;
};

export default function App() {
  const [shape, setShape] = useState("knot");
  const [radius, setRadius] = useState(1);
  const [tube, setTube] = useState(0.35);
  const [radial, setRadial] = useState(64);
  const [distort, setDistort] = useState(0.04);
  const [speed, setSpeed] = useState(3);
  const [color, setColor] = useState("#ffffff");
  const [thickness, setThickness] = useState(2);
  const [p, setP] = useState(2);
  const [q, setQ] = useState(3);
  const [env, setEnv] = useState("city");
  const [showBg, setShowBg] = useState(true);
  const [useSnapshots, setUseSnapshots] = useState(false);

  // 💾 Draft/Save State
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);
  const [hasSavedDraft, setHasSavedDraft] = useState(() => loadArtifactDraft() !== null);

  const presets = {
    chrome: { color: "#ffffff", roughness: 0.01, distort: 0.04 },
    gold: { color: "#ffcc00", roughness: 0.1, distort: 0.03 },
    plasma: { color: "#ff0080", roughness: 0.15, distort: 0.06 },
  };

  const randomize = () => {
    const shapes = ["blob", "knot", "gem", "crystal"];
    setShape(shapes[Math.floor(Math.random() * shapes.length)]);
    setRadius(0.5 + Math.random() * 1.5);
    setDistort(Math.random() * 0.1);
    setColor("#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
    setP(Math.floor(Math.random() * 8) + 1);
    setQ(Math.floor(Math.random() * 8) + 1);
  };

  // 💾 Save current artifact configuration
  const handleSaveDraft = useCallback(() => {
    const success = saveArtifactDraft({
      shape, radius, tube, radial, distort, speed, color, thickness, p, q, env, showBg
    });
    if (success) {
      setHasSavedDraft(true);
      setToast({ message: "💾 ARTIFACT SAVED", type: "success" });
    } else {
      setToast({ message: "❌ SAVE FAILED", type: "error" });
    }
  }, [shape, radius, tube, radial, distort, speed, color, thickness, p, q, env, showBg]);

  // 📂 Load saved artifact configuration
  const handleLoadDraft = useCallback(() => {
    const draft = loadArtifactDraft();
    if (draft) {
      setShape(draft.shape);
      setRadius(draft.radius);
      setTube(draft.tube);
      setRadial(draft.radial);
      setDistort(draft.distort);
      setSpeed(draft.speed);
      setColor(draft.color);
      setThickness(draft.thickness);
      setP(draft.p);
      setQ(draft.q);
      setEnv(draft.env);
      setShowBg(draft.showBg);
      setToast({ message: "📂 ARTIFACT LOADED", type: "success" });
    } else {
      setToast({ message: "NO SAVED DRAFT FOUND", type: "info" });
    }
  }, []);

  // 🗑️ Clear saved draft
  const handleClearDraft = useCallback(() => {
    clearArtifactDraft();
    setHasSavedDraft(false);
    setToast({ message: "🗑️ DRAFT CLEARED", type: "info" });
  }, []);

  return (
    <main style={{ height: "100vh", width: "100vw", background: "#000", color: "white", margin: 0, overflow: "hidden", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ position: "absolute", top: 20, right: 20, bottom: 20, zIndex: 10, overflowY: "auto", paddingRight: "10px", pointerEvents: "none" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end", pointerEvents: "auto" }}>
          <ConnectButton client={client} chain={garyTestnet} />

          <div style={{ background: "rgba(0, 10, 25, 0.9)", backdropFilter: "blur(20px)", padding: "20px", borderRadius: "20px", border: "1px solid rgba(0, 255, 204, 0.3)", width: "260px", display: "flex", flexDirection: "column", gap: "15px" }}>

            <button onClick={() => setUseSnapshots(!useSnapshots)} style={{ width: "100%", padding: "12px", background: useSnapshots ? "#00ffcc" : "#111", color: useSnapshots ? "black" : "white", border: "1px solid #00ffcc", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "11px" }}>
              {useSnapshots ? "📸 SYNC: 1s PULSE" : "📸 ENABLE AUTO-SNAPSHOT"}
            </button>

            <div>
              <label style={{ fontSize: "10px", fontWeight: "bold", opacity: 0.5, display: "block", marginBottom: "8px" }}>1. SHAPE MORPH</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
                {["blob", "knot", "gem", "crystal"].map(s => (
                  <button key={s} onClick={() => setShape(s)} style={{ fontSize: "9px", padding: "8px", background: shape === s ? "#00ffcc" : "#1a1a1a", border: "1px solid #333", color: shape === s ? "black" : "white", cursor: "pointer", borderRadius: "6px" }}>{s.toUpperCase()}</button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: "10px", fontWeight: "bold", opacity: 0.5, display: "block", marginBottom: "8px" }}>2. SCULPTING</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input type="range" min="0.5" max="2" step="0.1" value={radius} onChange={(e) => setRadius(parseFloat(e.target.value))} style={{ width: "100%", accentColor: "#00ffcc" }} />
                {shape === "knot" && (
                  <div style={{ display: "flex", gap: "5px" }}>
                    <input type="range" min="1" max="10" step="1" value={p} onChange={(e) => setP(parseInt(e.target.value))} style={{ flex: 1, accentColor: "#00ffcc" }} />
                    <input type="range" min="1" max="10" step="1" value={q} onChange={(e) => setQ(parseInt(e.target.value))} style={{ flex: 1, accentColor: "#00ffcc" }} />
                  </div>
                )}
                <input type="range" min="3" max="128" step="1" value={radial} onChange={(e) => setRadial(parseInt(e.target.value))} style={{ width: "100%", accentColor: "#00ffcc" }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "10px", fontWeight: "bold", opacity: 0.5, display: "block", marginBottom: "8px" }}>3. ENVIRONMENT</label>
              <select value={env} onChange={(e) => setEnv(e.target.value)} style={{ width: "100%", background: "#111", border: "1px solid #333", color: "white", padding: "8px", borderRadius: "6px", fontSize: "10px" }}>
                <option value="city">SF 2050</option>
                <option value="night">NIGHT</option>
                <option value="studio">STUDIO</option>
              </select>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                <input type="checkbox" checked={showBg} onChange={(e) => setShowBg(e.target.checked)} id="bg" />
                <label htmlFor="bg" style={{ fontSize: "10px" }}>SHOW BACKGROUND</label>
              </div>
            </div>

            <div>
              <label style={{ fontSize: "10px", fontWeight: "bold", opacity: 0.5, display: "block", marginBottom: "8px" }}>4. FLUIDITY & TINT</label>
              <input type="range" min="0" max="0.1" step="0.001" value={distort} onChange={(e) => setDistort(parseFloat(e.target.value))} style={{ width: "100%", accentColor: "#00ffcc" }} />
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: "100%", height: "25px", background: "none", border: "none", cursor: "pointer", marginTop: "10px" }} />
            </div>

            <div style={{ borderTop: "1px solid rgba(0, 255, 204, 0.2)", paddingTop: "10px" }}>
              <div style={{ fontSize: "10px", color: "#00ffcc", fontWeight: "bold", letterSpacing: "1px" }}>ESPRESSO HUD</div>
              <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "5px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px" }}>
                  <span style={{ opacity: 0.5 }}>SEQUENCER:</span>
                  <span style={{ color: "#00ffcc" }}>ACTIVE</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px" }}>
                  <span style={{ opacity: 0.5 }}>PRECONFIRMATION:</span>
                  <span style={{ color: "#00ffcc" }}>RECEIVED</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px" }}>
                  <span style={{ opacity: 0.5 }}>LATENCY:</span>
                  <span style={{ color: "#00ffcc" }}>~248ms</span>
                </div>
              </div>
            </div>

            <button onClick={randomize} style={{ width: "100%", padding: "12px", background: "#1a1a1a", color: "white", border: "1px solid #333", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "11px" }}>
              🎲 RANDOMIZE
            </button>

            {/* 💾 SAVE / LOAD DRAFT */}
            <div style={{ borderTop: "1px solid rgba(0, 255, 204, 0.2)", paddingTop: "10px" }}>
              <label style={{ fontSize: "10px", fontWeight: "bold", opacity: 0.5, display: "block", marginBottom: "8px" }}>💾 ARTIFACT DRAFT</label>
              <div style={{ display: "flex", gap: "5px" }}>
                <button
                  onClick={handleSaveDraft}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#1a1a1a",
                    color: "#00ff88",
                    border: "1px solid #00ff88",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "10px"
                  }}
                >
                  💾 SAVE
                </button>
                <button
                  onClick={handleLoadDraft}
                  disabled={!hasSavedDraft}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: hasSavedDraft ? "#1a1a1a" : "#0a0a0a",
                    color: hasSavedDraft ? "#00c8ff" : "#444",
                    border: `1px solid ${hasSavedDraft ? "#00c8ff" : "#333"}`,
                    borderRadius: "6px",
                    fontWeight: "bold",
                    cursor: hasSavedDraft ? "pointer" : "not-allowed",
                    fontSize: "10px"
                  }}
                >
                  📂 LOAD
                </button>
              </div>
              {hasSavedDraft && (
                <button
                  onClick={handleClearDraft}
                  style={{
                    width: "100%",
                    marginTop: "5px",
                    padding: "6px",
                    background: "transparent",
                    color: "#666",
                    border: "1px solid #333",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "9px"
                  }}
                >
                  🗑️ CLEAR SAVED DRAFT
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", top: 30, left: 30, zIndex: 10 }}>
        <h1 style={{ margin: 0, fontSize: "2.5rem", fontWeight: "900", color: "#fff" }}>CHROMECHAIN</h1>
        <p style={{ margin: 0, opacity: 0.6, fontSize: "0.8rem", letterSpacing: "2px" }}>APECHAIN GARY // ESPRESSO ACTIVE</p>
      </div>

      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <SnapshotBackground isActive={useSnapshots} env={env} showBg={showBg} />
        </Suspense>
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
          <mesh>
            {shape === "blob" && <sphereGeometry args={[radius, radial, radial]} />}
            {shape === "knot" && <torusKnotGeometry args={[radius, tube, radial * 2, radial / 2, p, q]} />}
            {shape === "gem" && <octahedronGeometry args={[radius * 1.5, 0]} />}
            {shape === "crystal" && <icosahedronGeometry args={[radius * 1.5, 0]} />}
            <MeshDistortMaterial color={color} metalness={1} roughness={0.01} distort={distort} speed={speed} thickness={thickness} envMapIntensity={2} />
          </mesh>
        </Float>
        <OrbitControls enableZoom={false} />
      </Canvas>

      <div style={{ position: "absolute", bottom: 40, width: "100%", display: "flex", justifyContent: "center", zIndex: 10 }}>
        <button style={{ padding: "16px 50px", borderRadius: "50px", border: "1px solid #fff", background: "rgba(0,0,0,0.9)", color: "#fff", fontWeight: "bold", cursor: "pointer", letterSpacing: "4px" }}>MINT CHROME ARTIFACT</button>
      </div>

      {/* 🔔 Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </main>
  );
}
