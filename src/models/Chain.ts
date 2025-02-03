export interface Chain {
    chainId: number;
    name: string;
    blockExplorerUrl: string;
    rpcUrl: string;
}

export const sepolia: Chain = {
    chainId: 11155111,
    name: 'Sepolia',
    blockExplorerUrl: 'https://sepolia.etherscan.io',
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/FnqvmZrEEWYvwZaX3dk0zPlUNi7_Ggdm'
};

export const mainnet: Chain = {
    chainId: 1,
    name: 'Mainnet',
    blockExplorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/FnqvmZrEEWYvwZaX3dk0zPlUNi7_Ggdm/getNFTs/?owner=vitalik.eth'
};

export const CHAINS_CONFIG = {
    [sepolia.chainId]: sepolia,
    [mainnet.chainId]: mainnet,
};

