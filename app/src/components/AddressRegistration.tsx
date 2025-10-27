import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'react-hot-toast';
import { CONTRACT_ADDRESSES, CONFIDENTIAL_TRADE_ABI } from '../config/contracts';
import { useFhevmInstance } from '../hooks/useFhevmInstance';
import { useRegistrationStatus } from '../hooks/useRegistrationStatus';
import { useDecryptShadowAddress } from '../hooks/useDecryptShadowAddress';
import { createEncryptionUtil } from '../utils/encryption';

export const AddressRegistration = () => {
  const [shadowAddress, setShadowAddress] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { instance, isLoading: fhevmLoading, error: fhevmError } = useFhevmInstance();
  const { isRegistered, registrationTimestamp, encryptedAddress, isLoading: registrationLoading, refetch: refetchRegistration } = useRegistrationStatus();
  const { decryptedAddress, isDecrypting, decryptError, decryptAddress } = useDecryptShadowAddress(encryptedAddress);
  
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();

  // Debug logging (can be removed after testing)
  // console.log('Address Registration Component Debug:', {
  //   address,
  //   isConnected,
  //   isRegistered,
  //   registrationTimestamp: registrationTimestamp.toString(),
  //   encryptedAddress,
  //   registrationLoading,
  //   instance: !!instance,
  //   fhevmLoading,
  //   fhevmError
  // });
  
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle transaction status changes
  useEffect(() => {
    if (isSuccess) {
      toast.dismiss();
      toast.success('Shadow address registered successfully!');
      setShadowAddress('');
      setIsEncrypting(false);
      // Refetch registration status after successful registration
      refetchRegistration();
    }
    
    if (isError && hash) {
      toast.dismiss();
      toast.error('Transaction failed. Please try again.');
      setIsEncrypting(false);
    }
    
    if (writeError) {
      console.error('writeContract error:', writeError);
      toast.dismiss();
      toast.error(`Contract write failed: ${writeError.message}`);
      setIsEncrypting(false);
    }
  }, [isSuccess, isError, hash, writeError]);

  const handleRegister = async () => {
    // More specific error checking
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!shadowAddress) {
      toast.error('Please enter a shadow address');
      return;
    }

    if (!instance) {
      toast.error('FHEVM is still loading, please wait...');
      return;
    }

    // Basic address validation
    if (!shadowAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error('Please enter a valid Ethereum address');
      return;
    }

    try {
      setIsEncrypting(true);
      toast.loading('Encrypting shadow address...');
      
      // Create encryption utility
      const encryptionUtil = createEncryptionUtil(instance);
      console.log("handleRegister 1");
      
      // Encrypt the shadow address
      const encrypted = await encryptionUtil.encryptAddress(
        shadowAddress,
        CONTRACT_ADDRESSES.CONFIDENTIAL_TRADE,
        address
      );
      console.log("handleRegister 2");
      toast.dismiss();
      toast.loading('Registering encrypted address...');
      
      // Call the contract
      console.log("writeContract config:", {
        address: CONTRACT_ADDRESSES.CONFIDENTIAL_TRADE,
        functionName: 'registerProxyAddress',
        args: [encrypted.handle, encrypted.proof],
        argsLength: [encrypted.handle, encrypted.proof].length,
        handleType: typeof encrypted.handle,
        proofType: typeof encrypted.proof,
        handleValue: encrypted.handle,
        proofValue: encrypted.proof
      });
      
      // Ensure proper formatting of arguments
      const handle = encrypted.handle;
      const proof = encrypted.proof;
      
      // Convert to proper hex format if needed
      let formattedHandle: string;
      let formattedProof: string;
      
      // Handle different data types from Zama SDK
      if (typeof handle === 'string') {
        formattedHandle = handle.startsWith('0x') ? handle : `0x${handle}`;
      } else if (handle instanceof Uint8Array) {
        formattedHandle = `0x${Array.from(handle).map(b => b.toString(16).padStart(2, '0')).join('')}`;
      } else {
        formattedHandle = `0x${handle.toString()}`;
      }
      
      if (typeof proof === 'string') {
        formattedProof = proof.startsWith('0x') ? proof : `0x${proof}`;
      } else if (proof instanceof Uint8Array) {
        formattedProof = `0x${Array.from(proof).map(b => b.toString(16).padStart(2, '0')).join('')}`;
      } else {
        formattedProof = `0x${proof.toString()}`;
      }
      
      console.log("Formatted args:", {
        formattedHandle,
        formattedProof,
        formattedHandleType: typeof formattedHandle,
        formattedProofType: typeof formattedProof
      });
      
      try {
        writeContract({
          address: CONTRACT_ADDRESSES.CONFIDENTIAL_TRADE as `0x${string}`,
          abi: CONFIDENTIAL_TRADE_ABI,
          functionName: 'registerProxyAddress',
          args: [formattedHandle as `0x${string}`, formattedProof as `0x${string}`],
        });
        console.log("handleRegister 3 - writeContract called successfully");
      } catch (writeError) {
        console.error("writeContract error:", writeError);
        throw writeError;
      }
    } catch (error) {
      console.error('Registration failed:', error);
      toast.dismiss();
      toast.error('Failed to register address. Please try again.');
      setIsEncrypting(false);
    }
  };

  // Format timestamp to readable date
  const formatRegistrationDate = (timestamp: bigint) => {
    if (timestamp === BigInt(0)) return 'Unknown';
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (!isConnected) {
    return (
      <div className="card-cyber p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full glass-strong flex items-center justify-center animate-pulse">
          <div className="text-3xl text-cyan-400">🔐</div>
        </div>
        <h2 className="text-2xl font-cyber font-bold text-cyan-400 mb-4">WALLET_AUTHENTICATION_REQUIRED</h2>
        <p className="text-gray-400 font-mono">CONNECTION_STATUS: DISCONNECTED → INITIATE_WALLET_PROTOCOL</p>
      </div>
    );
  }

  // Show loading state while checking registration
  if (registrationLoading && isConnected) {
    return (
      <div className="card-cyber p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full glass-strong flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-cyber font-bold text-cyan-400 mb-4">SCANNING_SHADOW_REGISTRY</h2>
        <p className="text-gray-400 font-mono">BLOCKCHAIN_QUERY_IN_PROGRESS...</p>
      </div>
    );
  }

  // Show registered status if user is already registered
  if (isConnected && !registrationLoading && isRegistered) {
    return (
      <div className="card-cyber p-8 relative overflow-hidden">
        {/* Success Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full glass-strong flex items-center justify-center mr-4 border border-green-500/50 animate-pulse">
              <div className="text-2xl text-green-400">✓</div>
            </div>
            <div>
              <h2 className="text-2xl font-cyber font-bold text-green-400">SHADOW_PROTOCOL_ACTIVE</h2>
              <div className="text-sm text-gray-400 font-mono">ENCRYPTED_IDENTITY_DEPLOYED</div>
            </div>
          </div>
          
          <div className="flex items-center px-4 py-2 rounded-full glass-strong border border-green-500/30 animate-pulse">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            <span className="text-green-400 font-cyber font-bold text-sm">OPERATIONAL</span>
          </div>
        </div>
        
        {/* Status Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Registration Info */}
          <div className="glass-strong rounded-lg p-6 border border-green-500/30">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center mr-3">
                <div className="text-black font-bold">✓</div>
              </div>
              <h3 className="font-cyber font-bold text-green-400">REGISTRATION_COMPLETE</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-green-400 font-mono mb-1">DEPLOY_TIMESTAMP:</div>
                <div className="text-gray-300 font-mono">{formatRegistrationDate(registrationTimestamp)}</div>
              </div>
            </div>
          </div>
          
          {/* Security Level */}
          <div className="glass-strong rounded-lg p-6 border border-cyan-500/30">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center mr-3">
                <div className="text-black font-bold">🛡</div>
              </div>
              <h3 className="font-cyber font-bold text-cyan-400">QUANTUM_ENCRYPTION</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 font-mono">SECURITY_LEVEL:</span>
                <span className="text-cyan-400 font-cyber">MAXIMUM</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 font-mono">FHE_STATUS:</span>
                <span className="text-green-400 font-cyber">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Encrypted Address Section */}
        <div className="glass-strong rounded-lg p-6 border border-purple-500/30 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-purple-400 rounded-lg flex items-center justify-center mr-4">
              <div className="text-black font-bold text-xl">⬢</div>
            </div>
            <div>
              <h3 className="font-cyber font-bold text-purple-400">ENCRYPTED_SHADOW_ADDRESS</h3>
              <div className="text-xs text-gray-400 font-mono">CRYPTOGRAPHIC_IDENTITY_HASH</div>
            </div>
          </div>
          
          {encryptedAddress ? (
            <div className="space-y-6">
              <div className="p-4 bg-gray-900/50 rounded-lg border border-purple-500/30">
                <div className="text-xs text-purple-400 font-mono mb-2">ENCRYPTED_PAYLOAD:</div>
                <div className="text-purple-300 font-mono text-xs break-all leading-relaxed">
                  {encryptedAddress}
                </div>
              </div>
              
              {decryptedAddress ? (
                <div className="p-4 bg-green-400/10 rounded-lg border border-green-500/30">
                  <div className="text-xs text-green-400 font-mono mb-2">DECRYPTED_SHADOW_ADDRESS:</div>
                  <div className="text-green-300 font-mono text-sm break-all">
                    {decryptedAddress}
                  </div>
                </div>
              ) : (
                <button
                  onClick={decryptAddress}
                  disabled={isDecrypting}
                  className="btn-cyber w-full py-3 px-6 rounded-lg font-cyber font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center space-x-3">
                    {isDecrypting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        <span>DECRYPTING_SHADOW_ADDRESS...</span>
                      </>
                    ) : (
                      <>
                        <div className="text-lg">🔓</div>
                        <span>DECRYPT_SHADOW_ADDRESS</span>
                      </>
                    )}
                  </div>
                </button>
              )}
              
              {decryptError && (
                <div className="p-3 border border-red-500/30 rounded-lg bg-red-400/5">
                  <div className="text-red-400 font-mono text-sm">
                    <span className="font-bold">DECRYPTION_ERROR:</span> {decryptError}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-purple-400 font-mono text-sm">LOADING_ENCRYPTED_PAYLOAD...</p>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="glass-strong rounded-lg p-6 border border-blue-500/30 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center mr-3">
              <div className="text-black font-bold">→</div>
            </div>
            <h3 className="font-cyber font-bold text-blue-400">PROTOCOL_CAPABILITIES_UNLOCKED</h3>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <div className="text-cyan-400 mr-3 font-mono">01:</div>
              <div className="text-gray-300 font-mono">ANONYMOUS_NFT_VERIFICATION → Zero-knowledge asset validation</div>
            </div>
            <div className="flex items-start">
              <div className="text-purple-400 mr-3 font-mono">02:</div>
              <div className="text-gray-300 font-mono">CONFIDENTIAL_AIRDROPS → Private reward distribution</div>
            </div>
            <div className="flex items-start">
              <div className="text-green-400 mr-3 font-mono">03:</div>
              <div className="text-gray-300 font-mono">SHADOW_TRANSACTIONS → Encrypted identity operations</div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-4 border border-yellow-500/30 rounded-lg bg-yellow-400/5">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border border-yellow-400 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-yellow-400 text-sm">⚡</span>
            </div>
            <div className="text-yellow-400 font-mono text-sm">
              <span className="font-bold">QUANTUM_SECURITY:</span> Shadow address encrypted using FHE technology. Only authorized smart contracts can decrypt through secure oracles.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show registration form if not registered
  return (
    <div className="card-cyber p-8 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center mb-8">
        <div className="w-16 h-16 rounded-lg glass-strong flex items-center justify-center mr-4 border border-cyan-500/50">
          <div className="text-cyan-400 text-2xl animate-pulse">⬣</div>
        </div>
        <div>
          <h2 className="text-2xl font-cyber font-bold text-cyan-400">SHADOW_PROTOCOL_DEPLOYMENT</h2>
          <div className="text-sm text-gray-400 font-mono">INITIALIZE_ENCRYPTED_IDENTITY_LAYER</div>
        </div>
      </div>
      
      <div className="mb-6 p-4 border border-cyan-500/30 rounded-lg bg-cyan-400/5">
        <p className="text-cyan-400 font-mono text-sm leading-relaxed">
          <span className="font-bold">QUANTUM_REGISTRATION:</span> Deploy shadow address with military-grade FHE encryption. Creates anonymous operational layer for confidential transactions and verifications.
        </p>
      </div>
      
      <div className="space-y-8">
        {/* Shadow Address Input */}
        <div className="glass-strong rounded-lg p-6 border border-gray-700">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-magenta-400 rounded mr-3"></div>
            <h3 className="font-cyber text-cyan-400 font-bold">SHADOW_ADDRESS_INPUT</h3>
          </div>
          
          <div>
            <label htmlFor="shadowAddress" className="block text-sm font-cyber font-bold text-purple-400 mb-3">
              → TARGET_SHADOW_ADDRESS
            </label>
            <input
              type="text"
              id="shadowAddress"
              value={shadowAddress}
              onChange={(e) => setShadowAddress(e.target.value)}
              placeholder="0x0000000000000000000000000000000000000000"
              className="w-full px-4 py-4 bg-gray-900/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-cyan-400 font-mono placeholder-gray-600 transition-all duration-300"
              disabled={isEncrypting || isPending || isConfirming}
            />
            <div className="mt-2 text-xs text-gray-500 font-mono">
              INPUT_FORMAT: ETHEREUM_WALLET_ADDRESS → WILL_BE_FHE_ENCRYPTED
            </div>
          </div>
        </div>
        
        {/* Deployment Button */}
        <button
          onClick={handleRegister}
          disabled={!shadowAddress || isEncrypting || isPending || isConfirming || fhevmLoading || !instance}
          className="btn-cyber w-full py-4 px-6 rounded-lg font-cyber text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
        >
          <div className="flex items-center justify-center space-x-3">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              isEncrypting || isPending || isConfirming || fhevmLoading 
                ? 'animate-spin border-current' 
                : 'border-current'
            }`}>
              {fhevmLoading ? '⟳' :
               fhevmError ? '⚠' :
               !instance ? '⏸' :
               isEncrypting ? '🔐' :
               isPending || isConfirming ? '⟳' :
               '⬣'}
            </div>
            <span>
              {fhevmLoading ? 'INITIALIZING_FHEVM_PROTOCOL...' :
               fhevmError ? 'FHEVM_PROTOCOL_ERROR' :
               !instance ? 'FHEVM_PROTOCOL_NOT_READY' :
               isEncrypting ? 'ENCRYPTING_SHADOW_ADDRESS...' :
               isPending || isConfirming ? 'DEPLOYING_TO_BLOCKCHAIN...' :
               'DEPLOY_SHADOW_PROTOCOL'}
            </span>
          </div>
        </button>
        
        {/* Status Messages */}
        {fhevmError && (
          <div className="p-4 border border-red-500/30 rounded-lg bg-red-400/5">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-6 h-6 border border-red-400 rounded-full flex items-center justify-center">
                <span className="text-red-400 text-sm">!</span>
              </div>
              <div className="text-red-400 font-cyber font-bold">FHEVM_PROTOCOL_ERROR</div>
            </div>
            <div className="text-red-300 font-mono text-sm pl-9">
              {fhevmError}
            </div>
          </div>
        )}
        
        {fhevmLoading && (
          <div className="p-4 border border-blue-500/30 rounded-lg bg-blue-400/5">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-blue-400 font-mono text-sm">
                <span className="font-bold">FHEVM_INITIALIZATION:</span> Loading quantum encryption protocols...
              </div>
            </div>
          </div>
        )}
        
        {/* Security Information */}
        
        {/* Privacy Warning */}
        <div className="p-4 border border-yellow-500/30 rounded-lg bg-yellow-400/5">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border border-yellow-400 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-yellow-400 text-sm">⚡</span>
            </div>
            <div className="text-yellow-400 font-mono text-sm">
              <span className="font-bold">PRIVACY_GUARANTEE:</span> Shadow address undergoes military-grade encryption. Only you and pre-authorized smart contracts can decrypt via secure FHE oracles.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};