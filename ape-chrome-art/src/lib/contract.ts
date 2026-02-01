import { createThirdwebClient, defineChain, getContract } from "thirdweb";

// Thirdweb Client
export const client = createThirdwebClient({
  clientId: "a791184d868d15f04f812d872353a887",
});

// ApeChain Curtis Testnet
export const curtisChain = defineChain({
  id: 33111,
  name: "ApeChain Curtis",
  nativeCurrency: {
    name: "ApeCoin",
    symbol: "APE",
    decimals: 18,
  },
  rpc: "https://curtis.rpc.caldera.xyz/http",
  blockExplorers: [
    {
      name: "Curtis Explorer",
      url: "https://curtis.explorer.caldera.xyz",
    },
  ],
  testnet: true,
});

// NFT Contract - UPDATE THIS AFTER DEPLOYMENT
export const NFT_CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";

export const getNftContract = () => {
  return getContract({
    client,
    chain: curtisChain,
    address: NFT_CONTRACT_ADDRESS,
  });
};
