export interface UserRegistration {
  encryptedAddress: string;
  isRegistered: boolean;
  registrationTime: bigint;
}

export interface AirdropRecord {
  nftContract: string;
  amount: bigint;
  claimed: boolean;
  timestamp: bigint;
}

export interface PendingVerification {
  user: string;
  nftContract: string;
  timestamp: bigint;
  complete: boolean;
}

export interface NFTCollection {
  address: string;
  name: string;
  symbol: string;
  description?: string;
}

export interface FhevmInstance {
  createEncryptedInput: (contractAddress: string, userAddress: string) => any;
  userDecrypt: (...args: any[]) => Promise<any>;
  publicDecrypt: (handles: string[]) => Promise<Record<string, any>>;
  generateKeypair: () => { publicKey: string; privateKey: string };
  createEIP712: (...args: any[]) => any;
}