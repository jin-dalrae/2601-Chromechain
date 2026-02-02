import React, { useState, Suspense, useEffect, useMemo, useRef, useCallback } from "react";
import { createThirdwebClient, defineChain, getContract, prepareContractCall, estimateGas } from "thirdweb";
import { ConnectButton, useActiveAccount, useActiveWalletChain, useSendTransaction } from "thirdweb/react";
import { mintTo, getOwnedNFTs } from "thirdweb/extensions/erc1155";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, Stars, Float, MeshDistortMaterial, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 GENERATIVE SVG IMAGE - Creates unique on-chain art for each NFT
// ═══════════════════════════════════════════════════════════════════════════════
const generateArtifactSVG = (params: {
  shape: string;
  color: string;
  radius: number;
  distort: number;
  p: number;
  q: number;
  env: string;
}): string => {
  const { shape, color, radius, distort, p, q, env } = params;

  // Generate unique gradient based on color
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  };

  const rgb = hexToRgb(color);
  const secondaryColor = `rgb(${Math.max(0, rgb.r - 50)}, ${Math.max(0, rgb.g - 50)}, ${Math.max(0, rgb.b - 50)})`;
  const glowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`;

  // Background based on environment
  const bgGradient = env === 'night'
    ? 'url(#nightBg)'
    : env === 'studio'
      ? 'url(#studioBg)'
      : 'url(#cityBg)';

  // Shape-specific SVG paths
  const getShapePath = () => {
    const scale = 40 + radius * 20;
    const cx = 200, cy = 200;

    switch (shape) {
      case 'blob':
        // Organic blob shape with distortion
        const points = 8;
        let path = '';
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const distortAmount = 1 + Math.sin(angle * (p || 2)) * distort * 5;
          const r = scale * distortAmount;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          path += (i === 0 ? 'M' : 'Q') + ` ${x},${y} `;
          if (i > 0 && i < points) {
            const midAngle = angle + Math.PI / points;
            const midR = scale * (1 + Math.sin(midAngle * (q || 3)) * distort * 3);
            path += `${cx + Math.cos(midAngle) * midR},${cy + Math.sin(midAngle) * midR} `;
          }
        }
        return path + 'Z';

      case 'gem':
        // Octahedron-like gem
        return `M${cx},${cy - scale} L${cx + scale * 0.7},${cy} L${cx},${cy + scale} L${cx - scale * 0.7},${cy} Z`;

      case 'crystal':
        // Icosahedron-inspired crystal
        const s = scale * 0.8;
        return `M${cx},${cy - s} L${cx + s * 0.6},${cy - s * 0.3} L${cx + s * 0.8},${cy + s * 0.4} L${cx + s * 0.3},${cy + s} L${cx - s * 0.3},${cy + s} L${cx - s * 0.8},${cy + s * 0.4} L${cx - s * 0.6},${cy - s * 0.3} Z`;

      case 'knot':
      default:
        // Torus knot approximation
        let knotPath = '';
        const knotPoints = 60;
        for (let i = 0; i <= knotPoints; i++) {
          const t = (i / knotPoints) * Math.PI * 2 * p;
          const r = (scale * 0.5) * (2 + Math.cos((q || 3) * t));
          const x = cx + r * Math.cos(t);
          const y = cy + r * Math.sin(t) * 0.6;
          knotPath += (i === 0 ? 'M' : 'L') + ` ${x},${y}`;
        }
        return knotPath;
    }
  };

  const shapePath = getShapePath();

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="cityBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a1a"/>
      <stop offset="50%" style="stop-color:#1a1a2e"/>
      <stop offset="100%" style="stop-color:#0f0f23"/>
    </linearGradient>
    <linearGradient id="nightBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#000814"/>
      <stop offset="100%" style="stop-color:#001d3d"/>
    </linearGradient>
    <linearGradient id="studioBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a1a"/>
      <stop offset="100%" style="stop-color:#2d2d2d"/>
    </linearGradient>
    <linearGradient id="shapeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color}"/>
      <stop offset="100%" style="stop-color:${secondaryColor}"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="chrome">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
      <feSpecularLighting in="blur" surfaceScale="5" specularConstant="1" specularExponent="30" lighting-color="${color}" result="specOut">
        <fePointLight x="200" y="100" z="200"/>
      </feSpecularLighting>
      <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"/>
      <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="400" height="400" fill="${bgGradient}"/>
  
  <!-- Stars -->
  ${Array.from({ length: 30 }, (_, i) =>
    `<circle cx="${Math.random() * 400}" cy="${Math.random() * 400}" r="${Math.random() * 1.5}" fill="white" opacity="${0.3 + Math.random() * 0.5}"/>`
  ).join('')}
  
  <!-- Glow Effect -->
  <path d="${shapePath}" fill="${glowColor}" filter="url(#glow)" opacity="0.5"/>
  
  <!-- Main Shape -->
  <path d="${shapePath}" fill="url(#shapeGrad)" filter="url(#chrome)" stroke="${color}" stroke-width="1"/>
  
  <!-- Chrome Highlight -->
  <path d="${shapePath}" fill="none" stroke="white" stroke-width="0.5" opacity="0.3"/>
  
  <!-- CHROMECHAIN Branding -->
  <text x="200" y="380" text-anchor="middle" fill="${color}" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" opacity="0.7">CHROMECHAIN</text>
</svg>`;

  // Encode as base64 data URI
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

import { client, apeMainnet, getContractForChain } from "./constants";

// ApeChain Gary Testnet (for display/environment)
const garyTestnet = defineChain({
  id: 3313939,
  rpc: "https://apechain-tnet.rpc.caldera.xyz/http",
  nativeCurrency: { name: "ApeCoin", symbol: "APE", decimals: 18 },
});

// Curtis Testnet (for NFT minting - testnet)
const curtisTestnet = defineChain({
  id: 33111,
  rpc: "https://curtis.rpc.caldera.xyz/http",
  nativeCurrency: { name: "ApeCoin", symbol: "APE", decimals: 18 },
});

// ═══════════════════════════════════════════════════════════════════════════════
// 💾 ARTIFACT STORAGE - Save/Load System (Local Gallery)
// ═══════════════════════════════════════════════════════════════════════════════
const STORAGE_KEY = "chromechain_artifact_draft";
const GALLERY_KEY = "chromechain_saved_shapes";

interface ArtifactDraft {
  id?: string;
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

// Single draft (for continue later)
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

// Gallery (multiple saved shapes)
const saveToGallery = (artifact: Omit<ArtifactDraft, "savedAt" | "id">): boolean => {
  try {
    const gallery = loadGallery();
    const newArtifact: ArtifactDraft = {
      ...artifact,
      id: `artifact_${Date.now()}`,
      savedAt: new Date().toISOString(),
    };
    gallery.unshift(newArtifact); // Add to beginning
    localStorage.setItem(GALLERY_KEY, JSON.stringify(gallery.slice(0, 50))); // Keep max 50
    return true;
  } catch (err) {
    console.error("Failed to save to gallery:", err);
    return false;
  }
};

const loadGallery = (): ArtifactDraft[] => {
  try {
    const stored = localStorage.getItem(GALLERY_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as ArtifactDraft[];
  } catch (err) {
    console.error("Failed to load gallery:", err);
    return [];
  }
};

const deleteFromGallery = (id: string): boolean => {
  try {
    const gallery = loadGallery();
    const filtered = gallery.filter(a => a.id !== id);
    localStorage.setItem(GALLERY_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error("Failed to delete from gallery:", err);
    return false;
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

// ═══════════════════════════════════════════════════════════════════════════════
// 🖼️ Gallery Component - Display Locally Saved Shapes
// ═══════════════════════════════════════════════════════════════════════════════
interface LocalShapeCardProps {
  artifact: ArtifactDraft;
  onLoad: (artifact: ArtifactDraft) => void;
  onDelete: (id: string) => void;
}

const LocalShapeCard = ({ artifact, onLoad, onDelete }: LocalShapeCardProps) => {
  const savedDate = new Date(artifact.savedAt).toLocaleDateString();

  return (
    <div style={{
      background: "rgba(0, 10, 25, 0.9)",
      borderRadius: "16px",
      padding: "16px",
      border: "1px solid rgba(0, 255, 204, 0.2)",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      transition: "all 0.2s ease",
    }}>
      {/* Color Preview */}
      <div style={{
        width: "100%",
        height: "70px",
        borderRadius: "8px",
        background: `linear-gradient(135deg, ${artifact.color}, ${artifact.color}88)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "28px",
      }}>
        {artifact.shape === "blob" && "🔮"}
        {artifact.shape === "knot" && "🌀"}
        {artifact.shape === "gem" && "💎"}
        {artifact.shape === "crystal" && "🔷"}
      </div>

      {/* Shape Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          background: "rgba(0, 255, 204, 0.2)",
          color: "#00ffcc",
          padding: "3px 8px",
          borderRadius: "4px",
          fontSize: "10px",
          textTransform: "uppercase",
          fontWeight: "bold",
        }}>
          {artifact.shape}
        </span>
        <span style={{ fontSize: "9px", opacity: 0.4 }}>{savedDate}</span>
      </div>

      {/* Parameters */}
      <div style={{ fontSize: "9px", opacity: 0.5, display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <span>R:{artifact.radius.toFixed(1)}</span>
        <span>D:{artifact.distort.toFixed(2)}</span>
        {artifact.shape === "knot" && <span>P:{artifact.p} Q:{artifact.q}</span>}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "5px", marginTop: "5px" }}>
        <button
          onClick={() => onLoad(artifact)}
          style={{
            flex: 1,
            padding: "8px",
            background: "#00ffcc",
            color: "black",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "10px",
          }}
        >
          LOAD
        </button>
        <button
          onClick={() => artifact.id && onDelete(artifact.id)}
          style={{
            padding: "8px 12px",
            background: "rgba(255, 68, 68, 0.2)",
            color: "#ff4444",
            border: "1px solid rgba(255, 68, 68, 0.3)",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "10px",
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

interface GalleryProps {
  onLoadShape: (artifact: ArtifactDraft) => void;
  onRefresh: () => void;
  refreshKey: number;
  account: any;
  activeChain: any;
}

// Helper to parse base64 metadata URI
const parseMetadataUri = (uri: string): any => {
  try {
    if (uri?.startsWith("data:application/json;base64,")) {
      const base64 = uri.replace("data:application/json;base64,", "");
      return JSON.parse(atob(base64));
    }
    return null;
  } catch {
    return null;
  }
};

// Minted NFT Card Component
const MintedNFTCard = ({ nft }: { nft: any }) => {
  const metadata = nft.metadata || parseMetadataUri(nft.tokenURI || "");

  const shape = metadata?.attributes?.find((a: any) => a.trait_type === "Shape")?.value || "unknown";
  const color = metadata?.attributes?.find((a: any) => a.trait_type === "Color")?.value || "#ffffff";
  const chain = metadata?.attributes?.find((a: any) => a.trait_type === "Chain")?.value || "Unknown";

  return (
    <div style={{
      background: "rgba(0, 10, 25, 0.9)",
      borderRadius: "16px",
      padding: "16px",
      border: "1px solid rgba(255, 204, 0, 0.3)",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    }}>
      <div style={{
        width: "100%",
        height: "70px",
        borderRadius: "8px",
        background: `linear-gradient(135deg, ${color}, ${color}88)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "28px",
      }}>
        {shape === "blob" && "🔮"}
        {shape === "knot" && "🌀"}
        {shape === "gem" && "💎"}
        {shape === "crystal" && "🔷"}
        {!["blob", "knot", "gem", "crystal"].includes(shape) && "🎨"}
      </div>

      <div style={{ fontSize: "11px", fontWeight: "bold", color: "#fff" }}>
        {metadata?.name || `Token #${nft.id?.toString()}`}
      </div>

      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
        <span style={{
          background: "rgba(255, 204, 0, 0.2)",
          color: "#ffcc00",
          padding: "3px 8px",
          borderRadius: "4px",
          fontSize: "9px",
          textTransform: "uppercase",
          fontWeight: "bold",
        }}>
          ⛓️ MINTED
        </span>
        <span style={{
          background: "rgba(255, 255, 255, 0.1)",
          color: "#fff",
          padding: "3px 8px",
          borderRadius: "4px",
          fontSize: "9px",
        }}>
          {chain}
        </span>
      </div>

      <div style={{ fontSize: "9px", opacity: 0.4 }}>
        Qty: {nft.quantityOwned?.toString() || "1"}
      </div>
    </div>
  );
};

const Gallery = ({ onLoadShape, onRefresh, refreshKey, account, activeChain }: GalleryProps) => {
  const [shapes, setShapes] = useState<ArtifactDraft[]>([]);
  const [subTab, setSubTab] = useState<"saved" | "minted">("saved");
  const [nfts, setNfts] = useState<any[]>([]);
  const [loadingNfts, setLoadingNfts] = useState(false);

  // Load local shapes
  useEffect(() => {
    setShapes(loadGallery());
  }, [refreshKey]);

  // Load minted NFTs when switching to minted tab
  useEffect(() => {
    const fetchNFTs = async () => {
      if (subTab !== "minted" || !account || !activeChain) return;

      setLoadingNfts(true);
      try {
        const contract = getContractForChain(activeChain.id);
        const owned = await getOwnedNFTs({
          contract,
          address: account.address,
        });
        setNfts(owned);
      } catch (err) {
        console.error("Failed to fetch NFTs:", err);
      } finally {
        setLoadingNfts(false);
      }
    };

    fetchNFTs();
  }, [subTab, account, activeChain]);

  const handleDelete = (id: string) => {
    if (deleteFromGallery(id)) {
      setShapes(loadGallery());
    }
  };

  return (
    <div style={{ height: "100%" }}>
      {/* Sub-tabs */}
      <div style={{
        display: "flex",
        gap: "5px",
        padding: "15px 20px",
        borderBottom: "1px solid rgba(0, 255, 204, 0.1)"
      }}>
        <button
          onClick={() => setSubTab("saved")}
          style={{
            padding: "8px 16px",
            background: subTab === "saved" ? "rgba(0, 255, 204, 0.2)" : "transparent",
            color: subTab === "saved" ? "#00ffcc" : "#666",
            border: subTab === "saved" ? "1px solid #00ffcc" : "1px solid #333",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: "bold",
          }}
        >
          💾 SAVED ({shapes.length})
        </button>
        <button
          onClick={() => setSubTab("minted")}
          style={{
            padding: "8px 16px",
            background: subTab === "minted" ? "rgba(255, 204, 0, 0.2)" : "transparent",
            color: subTab === "minted" ? "#ffcc00" : "#666",
            border: subTab === "minted" ? "1px solid #ffcc00" : "1px solid #333",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: "bold",
          }}
        >
          ⛓️ MINTED ({nfts.length})
        </button>
      </div>

      {/* Saved Tab Content */}
      {subTab === "saved" && (
        shapes.length === 0 ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "calc(100% - 60px)",
            gap: "20px",
            opacity: 0.6,
          }}>
            <div style={{ fontSize: "48px" }}>🎨</div>
            <div style={{ fontSize: "14px" }}>No saved shapes yet</div>
            <div style={{ fontSize: "11px", opacity: 0.5 }}>Use the SAVE button in Studio!</div>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "16px",
            padding: "20px",
            overflowY: "auto",
            maxHeight: "calc(100vh - 260px)",
          }}>
            {shapes.map((artifact, index) => (
              <LocalShapeCard
                key={artifact.id || index}
                artifact={artifact}
                onLoad={onLoadShape}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )
      )}

      {/* Minted Tab Content */}
      {subTab === "minted" && (
        !account ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "calc(100% - 60px)",
            gap: "20px",
            opacity: 0.6,
          }}>
            <div style={{ fontSize: "48px" }}>🔒</div>
            <div style={{ fontSize: "14px" }}>Connect wallet to view minted NFTs</div>
          </div>
        ) : loadingNfts ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "calc(100% - 60px)",
            gap: "20px",
          }}>
            <div style={{ fontSize: "48px", animation: "pulse 1s infinite" }}>⏳</div>
            <div style={{ fontSize: "14px", opacity: 0.6 }}>Loading from blockchain...</div>
            <style>{`@keyframes pulse { 50% { opacity: 0.5; } }`}</style>
          </div>
        ) : nfts.length === 0 ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "calc(100% - 60px)",
            gap: "20px",
            opacity: 0.6,
          }}>
            <div style={{ fontSize: "48px" }}>⛓️</div>
            <div style={{ fontSize: "14px" }}>No minted artifacts yet</div>
            <div style={{ fontSize: "11px", opacity: 0.5 }}>Mint your first artifact in Studio!</div>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "16px",
            padding: "20px",
            overflowY: "auto",
            maxHeight: "calc(100vh - 260px)",
          }}>
            {nfts.map((nft, index) => (
              <MintedNFTCard key={index} nft={nft} />
            ))}
          </div>
        )
      )}
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
  const [radial, setRadial] = useState(128); // Higher default for smoother look
  const [distort, setDistort] = useState(0.04);
  const [speed, setSpeed] = useState(3);
  const [color, setColor] = useState("#ffffff");
  const [thickness, setThickness] = useState(2);
  const [p, setP] = useState(2);
  const [q, setQ] = useState(3);
  const [env, setEnv] = useState("city");
  const [showBg, setShowBg] = useState(true);
  const [useSnapshots, setUseSnapshots] = useState(false);

  // 📑 Tab State
  const [activeTab, setActiveTab] = useState<"studio" | "gallery">("studio");

  // 💾 Draft/Save State
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);
  const [hasSavedDraft, setHasSavedDraft] = useState(() => loadArtifactDraft() !== null);
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0);

  // 🎨 Minting State
  const account = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const { mutate: sendTransaction, isPending: isMinting } = useSendTransaction();

  // 📊 Transaction tracking state
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [estimatedGas, setEstimatedGas] = useState<string | null>(null);
  const [isEstimatingGas, setIsEstimatingGas] = useState(false);

  // 🖼️ Save to Gallery handler
  const handleSaveToGallery = useCallback(() => {
    const success = saveToGallery({
      shape, radius, tube, radial, distort, speed, color, thickness, p, q, env, showBg,
    });
    if (success) {
      setGalleryRefreshKey(k => k + 1);
      setToast({ message: "✨ SAVED TO GALLERY", type: "success" });
    } else {
      setToast({ message: "❌ SAVE FAILED", type: "error" });
    }
  }, [shape, radius, tube, radial, distort, speed, color, thickness, p, q, env, showBg]);

  // 🖼️ Load from Gallery handler
  const handleLoadFromGallery = useCallback((artifact: ArtifactDraft) => {
    setShape(artifact.shape);
    setRadius(artifact.radius);
    setTube(artifact.tube);
    setRadial(artifact.radial);
    setDistort(artifact.distort);
    setSpeed(artifact.speed);
    setColor(artifact.color);
    setThickness(artifact.thickness);
    setP(artifact.p);
    setQ(artifact.q);
    setEnv(artifact.env);
    setShowBg(artifact.showBg);
    setActiveTab("studio");
    setToast({ message: "📂 SHAPE LOADED", type: "success" });
  }, []);

  // 📸 Capture canvas screenshot as compressed base64 JPEG data URL
  const captureCanvasSnapshot = useCallback((): string | null => {
    try {
      // Find the Three.js canvas element
      const sourceCanvas = document.querySelector('canvas');
      if (!sourceCanvas) {
        console.warn("Canvas not found for snapshot");
        return null;
      }

      // Create a tiny canvas for on-chain storage (100x100, low quality = ~5-10KB)
      const targetSize = 100;
      const resizedCanvas = document.createElement('canvas');
      resizedCanvas.width = targetSize;
      resizedCanvas.height = targetSize;
      const ctx = resizedCanvas.getContext('2d');

      if (!ctx) {
        console.warn("Could not get 2d context");
        return null;
      }

      // Calculate cropping to get a square from the center of the source
      const sourceWidth = sourceCanvas.width;
      const sourceHeight = sourceCanvas.height;
      const minDim = Math.min(sourceWidth, sourceHeight);
      const sx = (sourceWidth - minDim) / 2;
      const sy = (sourceHeight - minDim) / 2;

      // Draw the cropped and resized image
      ctx.drawImage(sourceCanvas, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize);

      // Use JPEG with 0.4 quality for minimal file size (~3-8KB)
      const dataUrl = resizedCanvas.toDataURL('image/jpeg', 0.4);

      console.log(`Snapshot size: ~${Math.round(dataUrl.length / 1024)}KB`);
      return dataUrl;
    } catch (err) {
      console.error("Failed to capture canvas snapshot:", err);
      return null;
    }
  }, []);

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

  // 🎨 Mint Chrome Artifact with Gas Estimation, Image, and TX Hash
  const handleMint = useCallback(async () => {
    if (!account) {
      setToast({ message: "CONNECT WALLET FIRST", type: "error" });
      return;
    }

    if (!activeChain) {
      setToast({ message: "CHAIN NOT DETECTED", type: "error" });
      return;
    }

    // Contract only exists on ApeChain Mainnet
    if (activeChain.id !== 33139) {
      setToast({ message: "⚠️ SWITCH TO APECHAIN MAINNET", type: "error" });
      return;
    }

    try {
      // Clear previous transaction hash
      setLastTxHash(null);
      setEstimatedGas(null);

      // Get contract for ApeChain mainnet
      const contract = getContractForChain(33139);

      // 📸 Capture canvas snapshot as the NFT image
      setToast({ message: "📸 CAPTURING ARTIFACT SNAPSHOT...", type: "info" });

      // Small delay to ensure the canvas is fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvasSnapshot = captureCanvasSnapshot();
      console.log("Canvas snapshot captured:", canvasSnapshot ? `${Math.round(canvasSnapshot.length / 1024)}KB` : "failed");

      // Use snapshot if available, fallback to SVG
      const artifactImage = canvasSnapshot || generateArtifactSVG({
        shape,
        color,
        radius,
        distort,
        p,
        q,
        env,
      });

      if (canvasSnapshot) {
        setToast({ message: "📸 SNAPSHOT CAPTURED!", type: "success" });
      } else {
        setToast({ message: "⚠️ USING FALLBACK SVG...", type: "info" });
      }
      await new Promise(resolve => setTimeout(resolve, 300));

      // Generate artifact metadata with image
      const artifactName = `Chrome Artifact #${Date.now()}`;
      const artifactDescription = `A generative chrome artifact sculpted in SF 2050. Shape: ${shape.toUpperCase()}, Color: ${color}, Distort: ${distort.toFixed(3)}`;

      // Create metadata JSON with image included
      const metadata = {
        name: artifactName,
        description: artifactDescription,
        image: artifactImage,  // Canvas snapshot (PNG) or fallback SVG
        attributes: [
          { trait_type: "Shape", value: shape },
          { trait_type: "Color", value: color },
          { trait_type: "Radius", value: radius.toString() },
          { trait_type: "Distort", value: distort.toString() },
          { trait_type: "P", value: p.toString() },
          { trait_type: "Q", value: q.toString() },
          { trait_type: "Environment", value: env },
          { trait_type: "Chain", value: "ApeChain" },
        ],
      };

      // Encode metadata as base64 data URI (no IPFS needed)
      const metadataJson = JSON.stringify(metadata);

      // Convert to base64 safely (handles large strings)
      const uint8Array = new TextEncoder().encode(metadataJson);
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
      }
      const base64 = btoa(binary);
      const metadataUri = `data:application/json;base64,${base64}`;

      // Log metadata size for debugging
      const imageSizeKB = Math.round(artifactImage.length / 1024);
      const metadataSizeKB = Math.round(metadataUri.length / 1024);
      console.log(`Image size: ~${imageSizeKB}KB`);
      console.log(`Metadata URI size: ~${metadataSizeKB}KB`);

      if (metadataSizeKB > 50) {
        console.warn(`Large metadata (${metadataSizeKB}KB) - may fail or cost high gas`);
      }

      // Create the mint transaction
      const transaction = mintTo({
        contract,
        to: account.address,
        nft: metadataUri,
        supply: BigInt(1),
      });

      // ⛽ Estimate gas before minting
      setToast({ message: "⛽ ESTIMATING GAS...", type: "info" });
      setIsEstimatingGas(true);

      try {
        const gasEstimate = await estimateGas({
          transaction,
          account,
        });
        const gasString = gasEstimate.toString();
        setEstimatedGas(gasString);
        setToast({ message: `⛽ EST. GAS: ${Number(gasString).toLocaleString()} units`, type: "info" });

        // Small delay to show gas estimate
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (gasError) {
        console.warn("Gas estimation failed, proceeding anyway:", gasError);
        setToast({ message: "⚠️ GAS EST. FAILED - PROCEEDING...", type: "info" });
      } finally {
        setIsEstimatingGas(false);
      }

      // 🚀 Send the transaction
      setToast({ message: "⏳ MINTING ON APECHAIN...", type: "info" });

      sendTransaction(transaction, {
        onSuccess: (result: { transactionHash: string }) => {
          const txHash = result.transactionHash;
          setLastTxHash(txHash);
          setToast({ message: "✨ ARTIFACT MINTED!", type: "success" });
          console.log("Mint success:", result);
          console.log("Transaction hash:", txHash);
        },
        onError: (error: any) => {
          console.error("Mint error details:", JSON.stringify(error, null, 2));
          console.error("Mint error object:", error);
          const errorMsg = error?.message || error?.reason || error?.shortMessage || String(error);
          setToast({ message: `❌ MINT FAILED: ${errorMsg.slice(0, 50)}`, type: "error" });
        },
      });
    } catch (error) {
      console.error("Mint preparation error:", error);
      setIsEstimatingGas(false);
      setToast({ message: "❌ MINT FAILED", type: "error" });
    }
  }, [account, activeChain, shape, color, radius, distort, p, q, env, sendTransaction, captureCanvasSnapshot]);

  return (
    <main style={{ height: "100vh", width: "100vw", background: "#000", color: "white", margin: 0, overflow: "hidden", fontFamily: "system-ui, sans-serif" }}>
      {/* 📑 Tab Switcher */}
      <div style={{
        position: "absolute",
        top: 30,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        display: "flex",
        gap: "5px",
        background: "rgba(0, 10, 25, 0.9)",
        padding: "5px",
        borderRadius: "12px",
        border: "1px solid rgba(0, 255, 204, 0.3)",
      }}>
        <button
          onClick={() => setActiveTab("studio")}
          style={{
            padding: "10px 24px",
            background: activeTab === "studio" ? "#00ffcc" : "transparent",
            color: activeTab === "studio" ? "black" : "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "12px",
            letterSpacing: "1px",
          }}
        >
          🎨 STUDIO
        </button>
        <button
          onClick={() => setActiveTab("gallery")}
          style={{
            padding: "10px 24px",
            background: activeTab === "gallery" ? "#00ffcc" : "transparent",
            color: activeTab === "gallery" ? "black" : "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "12px",
            letterSpacing: "1px",
          }}
        >
          🖼️ GALLERY
        </button>
      </div>

      {/* Gallery View */}
      {activeTab === "gallery" && (
        <div style={{
          position: "absolute",
          top: 100,
          left: 30,
          right: 30,
          bottom: 30,
          background: "rgba(0, 0, 0, 0.8)",
          borderRadius: "20px",
          border: "1px solid rgba(0, 255, 204, 0.2)",
          overflow: "hidden",
        }}>
          <div style={{ padding: "20px", borderBottom: "1px solid rgba(0, 255, 204, 0.2)" }}>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>My Collection</h2>
            <p style={{ margin: "5px 0 0", opacity: 0.5, fontSize: "11px" }}>
              Saved shapes & minted NFTs
            </p>
          </div>
          <Gallery
            onLoadShape={handleLoadFromGallery}
            onRefresh={() => setGalleryRefreshKey(k => k + 1)}
            refreshKey={galleryRefreshKey}
            account={account}
            activeChain={activeChain}
          />
        </div>
      )}

      {/* Studio View */}
      {activeTab === "studio" && (
        <>
          <div style={{ position: "absolute", top: 20, right: 20, bottom: 20, zIndex: 10, overflowY: "auto", paddingRight: "10px", pointerEvents: "none" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end", pointerEvents: "auto" }}>
              <ConnectButton
                client={client}
                chain={apeMainnet}
                chains={[apeMainnet]}
                connectButton={{
                  label: "Connect",
                  style: {
                    background: "#00ffcc",
                    color: "black",
                    fontWeight: "bold",
                  }
                }}
              />

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
                    <input type="range" min="30" max="640" step="10" value={radial} onChange={(e) => setRadial(parseInt(e.target.value))} style={{ width: "100%", accentColor: "#00ffcc" }} />
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

                {/* 🖼️ SAVE TO GALLERY */}
                <button
                  onClick={handleSaveToGallery}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "linear-gradient(135deg, #00ffcc, #00cc99)",
                    color: "black",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "12px",
                    letterSpacing: "1px",
                  }}
                >
                  ✨ SAVE TO GALLERY
                </button>
              </div>
            </div>
          </div>

          <div style={{ position: "absolute", top: 30, left: 30, zIndex: 10 }}>
            <h1 style={{ margin: 0, fontSize: "2.5rem", fontWeight: "900", color: "#fff" }}>CHROMECHAIN</h1>
            <p style={{ margin: 0, opacity: 0.6, fontSize: "0.8rem", letterSpacing: "2px" }}>APECHAIN GARY // ESPRESSO ACTIVE</p>
          </div>

          <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ preserveDrawingBuffer: true }}>
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

          <div style={{ position: "absolute", bottom: 40, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", zIndex: 10 }}>
            {/* Gas Estimate Display */}
            {(isEstimatingGas || estimatedGas) && (
              <div style={{
                background: "rgba(0, 10, 25, 0.9)",
                padding: "8px 20px",
                borderRadius: "20px",
                border: "1px solid rgba(0, 255, 204, 0.3)",
                fontSize: "11px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <span style={{ color: "#00ffcc" }}>⛽</span>
                {isEstimatingGas ? (
                  <span style={{ color: "#888" }}>Estimating gas...</span>
                ) : (
                  <span style={{ color: "#fff" }}>
                    Est. Gas: <span style={{ color: "#00ffcc", fontWeight: "bold" }}>{Number(estimatedGas).toLocaleString()}</span> units
                  </span>
                )}
              </div>
            )}

            {/* Transaction Hash Display */}
            {lastTxHash && (
              <a
                href={`https://apescan.io/tx/${lastTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "rgba(0, 255, 136, 0.15)",
                  padding: "10px 20px",
                  borderRadius: "20px",
                  border: "1px solid rgba(0, 255, 136, 0.4)",
                  fontSize: "11px",
                  color: "#00ff88",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0, 255, 136, 0.25)";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0, 255, 136, 0.15)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <span>✨</span>
                <span>TX: {lastTxHash.slice(0, 8)}...{lastTxHash.slice(-6)}</span>
                <span style={{ opacity: 0.6 }}>→</span>
                <span style={{ textDecoration: "underline" }}>View on ApeScan</span>
              </a>
            )}

            {/* Mint Button */}
            <button
              onClick={handleMint}
              disabled={isMinting || isEstimatingGas}
              style={{
                padding: "16px 50px",
                borderRadius: "50px",
                border: "1px solid #fff",
                background: (isMinting || isEstimatingGas) ? "rgba(0,255,204,0.2)" : "rgba(0,0,0,0.9)",
                color: "#fff",
                fontWeight: "bold",
                cursor: (isMinting || isEstimatingGas) ? "wait" : "pointer",
                letterSpacing: "4px",
                opacity: (isMinting || isEstimatingGas) ? 0.7 : 1,
                transition: "all 0.2s ease",
              }}
            >
              {isEstimatingGas ? "⛽ ESTIMATING..." : isMinting ? "⏳ MINTING..." : "MINT CHROME ARTIFACT"}
            </button>
          </div>
        </>
      )}

      {/* 🔔 Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </main>
  );
}
