// Contract addresses - Deployed on Sepolia testnet
export const CONTRACT_ADDRESSES = {
  ANONYMOUS_AUTH: '0x8E93aD33bf22CCF3e8e45C87Ff07685D920eFb34',
  AIRDROP: '0x5109E225594b779063B4A268f4E48ed3b366694f',
  SIMPLE_NFT: '0x125E65Ab721f7ee07976301aeC928319186f090E',
  CONFIDENTIAL_TRADE: '0x02d4EaaA28c73f04826D96371218ad08aA2Ca689', // Update with deployed address
  MOCK_USDT: '0x28888c11C48D53D8bBABd06e349a3E37a1b79bcb', // Update with deployed address
} as const;

// Sepolia configuration for FHEVM
export const SEPOLIA_CONFIG = {
  aclContractAddress: '0x687820221192C5B662b25367F70076A37bc79b6c',
  kmsContractAddress: '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC',
  inputVerifierContractAddress: '0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4',
  verifyingContractAddressDecryption: '0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1',
  verifyingContractAddressInputVerification: '0x7048C39f048125eDa9d678AEbaDfB22F7900a29F',
  chainId: 11155111,
  gatewayChainId: 55815,
  network: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY', // Update with your Infura key
  relayerUrl: 'https://relayer.testnet.zama.cloud',
};

// Contract ABIs - Simplified for the main functions
export const ANONYMOUS_AUTH_ABI = [
  {
    inputs: [
      { name: 'encryptedAddress', type: 'bytes32', internalType: 'externalEaddress' },
      { name: 'addressProof', type: 'bytes' }
    ],
    name: 'registerEncryptedAddress',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'nftContract', type: 'address' }],
    name: 'requestNFTVerification',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserRegistration',
    outputs: [
      {
        components: [
          { name: 'encryptedAddress', type: 'bytes32' },
          { name: 'isRegistered', type: 'bool' },
          { name: 'registrationTime', type: 'uint256' }
        ],
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'nft', type: 'address' }
    ],
    name: 'getNFTVerification',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

export const AIRDROP_ABI = [
  {
    inputs: [{ name: 'nftContract', type: 'address' }],
    name: 'recordAirdrop',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'nftContract', type: 'address' }
    ],
    name: 'getAirdropRecord',
    outputs: [{
      components: [
        { name: 'nftContract', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'claimed', type: 'bool' },
        { name: 'timestamp', type: 'uint256' }
      ],
      name: '',
      type: 'tuple'
    }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserTotalAirdrops',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'nftContract', type: 'address' }
    ],
    name: 'hasUnclaimedAirdrop',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

export const SIMPLE_NFT_ABI = [
  {
    inputs: [{ name: 'to', type: 'address' }],
    name: 'mint',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'mint',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

export const CONFIDENTIAL_TRADE_ABI = [
  {
    inputs: [
      { name: 'encryptedProxyAddress', type: 'bytes32', internalType: 'externalEaddress' },
      { name: 'addressProof', type: 'bytes' }
    ],
    name: 'registerProxyAddress',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'tokenAddress', type: 'address' },
      { name: 'buyAmount', type: 'uint256' }
    ],
    name: 'anonymousPurchase',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'requestDecryption',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'tokenAddress', type: 'address' }
    ],
    name: 'decryptWithdrawToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserRegistration',
    outputs: [
      {
        components: [
          { name: 'encryptedProxyAddress', type: 'bytes32' },
          { name: 'isRegistered', type: 'bool' },
          { name: 'registrationTime', type: 'uint256' }
        ],
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'tokenAddress', type: 'address' }
    ],
    name: 'getUserBalance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenAddress', type: 'address' }],
    name: 'getTokenPrice',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'decryptedProxyAddresses',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'tokenAddress', type: 'address' },
      { name: 'price', type: 'uint256' }
    ],
    name: 'setPrice',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'proxy', type: 'address' }],
    name: 'proxyToDecryptMainAddresses',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

export const MOCK_USDT_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transferFrom',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;