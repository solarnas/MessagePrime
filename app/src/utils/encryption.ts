import { FhevmInstance } from '.';

export class EncryptionUtil {
  private instance: FhevmInstance;

  constructor(instance: FhevmInstance) {
    this.instance = instance;
  }

  /**
   * Encrypt an Ethereum address for registration
   */
  async encryptAddress(
    address: string, 
    contractAddress: string, 
    userAddress: string
  ) {
    try {
      // Create encrypted input buffer
      const buffer = this.instance.createEncryptedInput(contractAddress, userAddress);
      
      // Add the address to encrypt
      buffer.addAddress(address);
      
      // Encrypt and get handles with proof
      const encrypted = await buffer.encrypt();
      
      return {
        handle: encrypted.handles[0],
        proof: encrypted.inputProof
      };
    } catch (error) {
      console.error('Failed to encrypt address:', error);
      throw error;
    }
  }

  /**
   * Decrypt data for the user
   */
  async userDecrypt(
    ciphertextHandle: string,
    contractAddress: string,
    signer: any
  ) {
    try {
      const keypair = this.instance.generateKeypair();
      
      const handleContractPairs = [
        {
          handle: ciphertextHandle,
          contractAddress: contractAddress,
        },
      ];
      
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = "10";
      const contractAddresses = [contractAddress];

      const eip712 = this.instance.createEIP712(
        keypair.publicKey, 
        contractAddresses, 
        startTimeStamp, 
        durationDays
      );

      const signature = await signer.signTypedData(
        eip712.domain,
        {
          UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
        },
        eip712.message,
      );

      const result = await this.instance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace("0x", ""),
        contractAddresses,
        signer.address,
        startTimeStamp,
        durationDays,
      );

      return result[ciphertextHandle];
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      throw error;
    }
  }

  /**
   * Public decrypt for publicly accessible data
   */
  async publicDecrypt(handles: string[]) {
    try {
      return await this.instance.publicDecrypt(handles);
    } catch (error) {
      console.error('Failed to public decrypt:', error);
      throw error;
    }
  }
}

export const createEncryptionUtil = (instance: FhevmInstance) => {
  return new EncryptionUtil(instance);
};