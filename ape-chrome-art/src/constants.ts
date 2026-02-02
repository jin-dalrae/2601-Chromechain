import { createThirdwebClient, defineChain, getContract } from "thirdweb";

export const client = createThirdwebClient({
    clientId: "a791184d868d15f04f812d872353a887",
});

export const apeMainnet = defineChain({
    id: 33139,
    rpc: "https://apechain.calderachain.xyz/http",
    nativeCurrency: { name: "ApeCoin", symbol: "APE", decimals: 18 },
});

export const NFT_CONTRACT_ADDRESS = "0x1745c93AE2b21867EF8185e5C9B95c8886734DCD";

export const getContractForChain = (chainId: number) => {
    return getContract({
        address: NFT_CONTRACT_ADDRESS,
        chain: apeMainnet,
        client,
    });
};
