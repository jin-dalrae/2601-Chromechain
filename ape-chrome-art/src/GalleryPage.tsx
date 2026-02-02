import React, { useState, useEffect } from "react";
import { useReadContract } from "thirdweb/react";
import { getNFTs } from "thirdweb/extensions/erc1155";
import { client, apeMainnet, getContractForChain, NFT_CONTRACT_ADDRESS } from "./constants";

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

interface GalleryPageProps {
    onBack: () => void;
}

export default function GalleryPage({ onBack }: GalleryPageProps) {
    const [filter, setFilter] = useState("all");

    // Get contract
    const contract = getContractForChain(apeMainnet.id);

    // Fetch all NFTs (limit 50 for now)
    const { data: nfts, isLoading } = useReadContract(getNFTs, {
        contract,
        start: 0,
        count: 50,
    });

    // Filter NFTs based on metadata attributes
    const filteredNFTs = nfts?.filter(nft => {
        if (filter === "all") return true;
        const metadata = nft.metadata; // useReadContract usually resolves metadata
        // If metadata is still a string (uri), parse it
        const meta = typeof metadata === 'string' ? parseMetadataUri(metadata) : metadata;

        // Check attributes
        const shapeAttr = meta?.attributes?.find((a: any) => a.trait_type === "Shape");
        return shapeAttr?.value === filter;
    });

    return (
        <div style={{
            minHeight: "100vh",
            width: "100vw",
            background: "#0a0a0a",
            color: "white",
            fontFamily: "system-ui, sans-serif",
            display: "flex",
            flexDirection: "column",
        }}>
            {/* Header */}
            <div style={{
                height: "80px",
                borderBottom: "1px solid rgba(0, 255, 204, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 40px",
                background: "rgba(0,0,0,0.8)",
                backdropFilter: "blur(10px)",
                position: "sticky",
                top: 0,
                zIndex: 100,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <button
                        onClick={onBack}
                        style={{
                            background: "transparent",
                            border: "1px solid rgba(255,255,255,0.2)",
                            color: "white",
                            padding: "8px 16px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        ← BACK
                    </button>
                    <h1 style={{ fontSize: "24px", fontWeight: "900", letterSpacing: "1px", margin: 0 }}>
                        CHROME<span style={{ color: "#00ffcc" }}>CHAIN</span> GALLERY
                    </h1>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: "flex", gap: "10px" }}>
                    {["all", "blob", "knot", "gem", "crystal"].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                background: filter === f ? "#00ffcc" : "transparent",
                                color: filter === f ? "black" : "#888",
                                border: filter === f ? "1px solid #00ffcc" : "1px solid #333",
                                padding: "8px 16px",
                                borderRadius: "20px",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: "bold",
                                textTransform: "uppercase",
                                transition: "all 0.2s ease"
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid Content */}
            <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
                {isLoading ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "400px", gap: "20px" }}>
                        <div style={{ fontSize: "48px", animation: "spin 1s linear infinite" }}>⏳</div>
                        <div style={{ opacity: 0.5 }}>Loading Artifacts from ApeChain...</div>
                        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : !filteredNFTs || filteredNFTs.length === 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "400px", opacity: 0.5 }}>
                        <div style={{ fontSize: "40px", marginBottom: "20px" }}>🔍</div>
                        <div>No artifacts found for this filter.</div>
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "30px",
                    }}>
                        {filteredNFTs.map((nft) => {
                            // Parse metadata if needed (fallback for raw URIs)
                            const metadata = (nft.metadata && typeof nft.metadata === 'object' && 'image' in nft.metadata)
                                ? nft.metadata
                                : parseMetadataUri(nft.tokenURI || "") || {};

                            const image = metadata.image || "";
                            const attributes = metadata?.attributes || [];
                            const colorAttr = attributes.find((a: any) => a.trait_type === "Color")?.value || "#ffffff";
                            const shapeAttr = attributes.find((a: any) => a.trait_type === "Shape")?.value || "unknown";

                            return (
                                <div key={nft.id.toString()} style={{
                                    background: "#111",
                                    borderRadius: "16px",
                                    overflow: "hidden",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                    cursor: "default",
                                    position: "relative"
                                }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = "translateY(-5px)";
                                        e.currentTarget.style.boxShadow = `0 10px 30px -10px ${colorAttr}40`;
                                        e.currentTarget.style.borderColor = colorAttr;
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "none";
                                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                                    }}
                                >
                                    {/* Image Display */}
                                    <div style={{ width: "100%", aspectRatio: "1/1", background: "#000", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        {image ? (
                                            <img src={image} alt={metadata.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            <div style={{ fontSize: "40px" }}>
                                                {shapeAttr === "blob" ? "🔮" : shapeAttr === "knot" ? "🌀" : shapeAttr === "gem" ? "💎" : "🔷"}
                                            </div>
                                        )}

                                        {/* ID Badge */}
                                        <div style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.6)", padding: "4px 8px", borderRadius: "4px", fontSize: "10px", fontFamily: "monospace", border: "1px solid rgba(255,255,255,0.2)" }}>
                                            #{nft.id.toString()}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div style={{ padding: "20px" }}>
                                        <h3 style={{ margin: "0 0 5px", fontSize: "16px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {metadata.name || `Artifact #${nft.id.toString()}`}
                                        </h3>
                                        <div style={{ display: "flex", gap: "6px", marginBottom: "15px", flexWrap: "wrap" }}>
                                            <span style={{ fontSize: "10px", background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "4px", color: colorAttr }}>
                                                ● {shapeAttr.toUpperCase()}
                                            </span>
                                            <span style={{ fontSize: "10px", background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "4px", opacity: 0.7 }}>
                                                Owned: {nft.owner ? `${nft.owner.slice(0, 4)}...${nft.owner.slice(-4)}` : "Unknown"}
                                            </span>
                                        </div>

                                        {/* View on Explorer Button */}
                                        <a
                                            href={`https://apescan.io/token/${NFT_CONTRACT_ADDRESS}?a=${nft.id.toString()}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: "block",
                                                width: "100%",
                                                padding: "10px",
                                                textAlign: "center",
                                                background: "rgba(0, 255, 204, 0.1)",
                                                color: "#00ffcc",
                                                borderRadius: "8px",
                                                textDecoration: "none",
                                                fontSize: "12px",
                                                fontWeight: "bold",
                                                border: "1px solid rgba(0, 255, 204, 0.3)",
                                                transition: "background 0.2s"
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = "rgba(0, 255, 204, 0.2)"}
                                            onMouseLeave={e => e.currentTarget.style.background = "rgba(0, 255, 204, 0.1)"}
                                        >
                                            VIEW ON APESCAN ↗
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
