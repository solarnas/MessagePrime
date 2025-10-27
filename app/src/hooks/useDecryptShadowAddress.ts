import { useState, useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import { useFhevmInstance } from './useFhevmInstance';

export const useDecryptShadowAddress = (encryptedHandle: string | null) => {
  const [decryptedAddress, setDecryptedAddress] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptError, setDecryptError] = useState<string | null>(null);

  const { address } = useAccount();
  const { instance } = useFhevmInstance();
  const { data: walletClient } = useWalletClient();

  // Manual decrypt function
  const decryptAddress = useCallback(async () => {
    if (!encryptedHandle || !instance || !walletClient || !address) {
      setDecryptError('Prerequisites not met for decryption');
      return;
    }

    if (isDecrypting) {
      return; // Already decrypting
    }

    try {
      setIsDecrypting(true);
      setDecryptError(null);

      // Generate keypair for decryption
      const keypair = instance.generateKeypair();
      
      const handleContractPairs = [
        {
          handle: encryptedHandle,
          contractAddress: CONTRACT_ADDRESSES.CONFIDENTIAL_TRADE,
        },
      ];
      
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = "10";
      const contractAddresses = [CONTRACT_ADDRESSES.CONFIDENTIAL_TRADE];

      // Create EIP712 signature
      const eip712 = instance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimeStamp,
        durationDays
      );

      // Sign the decryption request
      const signature = await walletClient.signTypedData({
        domain: eip712.domain,
        types: {
          UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
        },
        primaryType: 'UserDecryptRequestVerification',
        message: eip712.message,
      });

      // Decrypt the address
      const result = await instance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace("0x", ""),
        contractAddresses,
        address,
        startTimeStamp,
        durationDays,
      );

      const decrypted = result[encryptedHandle];
      
      // Convert the decrypted result to address format
      let formattedAddress: string;
      if (typeof decrypted === 'string') {
        formattedAddress = decrypted.startsWith('0x') ? decrypted : `0x${decrypted}`;
      } else if (typeof decrypted === 'bigint') {
        formattedAddress = `0x${decrypted.toString(16).padStart(40, '0')}`;
      } else {
        formattedAddress = `0x${decrypted.toString()}`;
      }

      setDecryptedAddress(formattedAddress);
    } catch (error) {
      console.error('Failed to decrypt shadow address:', error);
      setDecryptError('Failed to decrypt shadow address');
    } finally {
      setIsDecrypting(false);
    }
  }, [encryptedHandle, instance, walletClient, address, isDecrypting]);

  return {
    decryptedAddress,
    isDecrypting,
    decryptError,
    decryptAddress,
  };
};