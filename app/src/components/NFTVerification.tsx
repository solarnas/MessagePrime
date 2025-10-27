import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { toast } from 'react-hot-toast';
import { CONTRACT_ADDRESSES, ANONYMOUS_AUTH_ABI, CONFIDENTIAL_TRADE_ABI } from '../config/contracts';

interface NFTCollection {
  address: string;
  name: string;
  description: string;
}

// Sample NFT collections for testing
const SAMPLE_NFT_COLLECTIONS: NFTCollection[] = [
  {
    address: '0x0000000000000000000000000000000000000001',
    name: 'Sample NFT Collection 1',
    description: 'A test NFT collection for demonstration'
  },
  {
    address: '0x0000000000000000000000000000000000000002',
    name: 'Sample NFT Collection 2', 
    description: 'Another test NFT collection'
  }
];

export const NFTVerification = () => {
  const [selectedNFT, setSelectedNFT] = useState<string>('');
  const [customNFTAddress, setCustomNFTAddress] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  
  const { address, isConnected } = useAccount();
  
  // Check if user is registered
  const { data: registrationData } = useReadContract({
    address: CONTRACT_ADDRESSES.CONFIDENTIAL_TRADE as `0x${string}`,
    abi: CONFIDENTIAL_TRADE_ABI,
    functionName: 'getUserRegistration',
    args: [address!],
    query: {
      enabled: !!address
    }
  });
  
  const { writeContract, data: hash, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const isRegistered = registrationData?.isRegistered
  const nftAddress = useCustom ? customNFTAddress : selectedNFT;

  const handleVerifyNFT = async () => {
    if (!address || !nftAddress) {
      toast.error('Please select or enter an NFT contract address');
      return;
    }

    if (!nftAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error('Please enter a valid contract address');
      return;
    }

    try {
      toast.loading('Requesting NFT verification...');
      
      writeContract({
        address: CONTRACT_ADDRESSES.ANONYMOUS_AUTH as `0x${string}`,
        abi: ANONYMOUS_AUTH_ABI,
        functionName: 'requestNFTVerification',
        args: [nftAddress as `0x${string}`],
      });
      
    } catch (error) {
      console.error('NFT verification failed:', error);
      toast.dismiss();
      toast.error('Failed to request NFT verification. Please try again.');
    }
  };

  // Handle transaction success
  if (isSuccess) {
    toast.dismiss();
    toast.success('NFT verification requested! Processing will complete shortly.');
  }

  if (!isConnected) {
    return (
      <div className="card-cyber p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full glass-strong flex items-center justify-center">
          <div className="text-2xl animate-pulse">🔗</div>
        </div>
        <h2 className="text-2xl font-cyber font-bold text-cyan-400 mb-4">CONNECTION REQUIRED</h2>
        <p className="text-gray-400 font-mono">WALLET_CONNECTION_NEEDED → AUTHENTICATE_TO_PROCEED</p>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="card-cyber p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full glass-strong flex items-center justify-center border border-red-500/30">
          <div className="text-2xl text-red-400 animate-pulse">⚠️</div>
        </div>
        <h2 className="text-2xl font-cyber font-bold text-red-400 mb-4">SHADOW_ADDRESS_REQUIRED</h2>
        <p className="text-gray-400 font-mono">REGISTRATION_INCOMPLETE → INITIALIZE_SHADOW_PROTOCOL_FIRST</p>
        <div className="mt-4 p-3 border border-yellow-500/30 rounded-lg bg-yellow-400/5">
          <div className="text-yellow-400 font-mono text-sm">
            <span className="font-bold">PROTOCOL_ERROR:</span> Shadow address must be deployed before cryptographic verification can proceed.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-cyber p-8 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center mb-8">
        <div className="w-12 h-12 rounded-lg glass-strong flex items-center justify-center mr-4 border border-purple-500/30">
          <div className="text-purple-400 text-xl animate-pulse">⬡</div>
        </div>
        <div>
          <h2 className="text-2xl font-cyber font-bold text-purple-400">NFT_VERIFICATION_PROTOCOL</h2>
          <div className="text-sm text-gray-400 font-mono">CRYPTOGRAPHIC_OWNERSHIP_VALIDATION</div>
        </div>
      </div>
      
      <div className="mb-6 p-4 border border-cyan-500/30 rounded-lg bg-cyan-400/5">
        <p className="text-cyan-400 font-mono text-sm leading-relaxed">
          <span className="font-bold">QUANTUM_VERIFICATION:</span> Execute zero-knowledge proof validation of asset ownership while maintaining complete anonymity through encrypted shadow address protocol.
        </p>
      </div>
      
      <div className="space-y-8">
        {/* Source Selection */}
        <div className="glass-strong rounded-lg p-6 border border-gray-700">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-magenta-400 rounded mr-3"></div>
            <h3 className="font-cyber text-cyan-400 font-bold">TARGET_SELECTION_PROTOCOL</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-300 ${
              !useCustom 
                ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400' 
                : 'border-gray-600 bg-gray-800/50 text-gray-400 hover:border-cyan-500/50'
            }`}>
              <input
                type="radio"
                name="nftSource"
                checked={!useCustom}
                onChange={() => setUseCustom(false)}
                className="sr-only"
              />
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  !useCustom ? 'border-cyan-400 bg-cyan-400' : 'border-gray-600'
                }`}>
                  {!useCustom && <div className="w-2 h-2 bg-black rounded-full m-0.5"></div>}
                </div>
                <div>
                  <div className="font-cyber font-bold text-sm">PRESET_COLLECTIONS</div>
                  <div className="text-xs font-mono opacity-80">Select from verified list</div>
                </div>
              </div>
            </label>
            
            <label className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-300 ${
              useCustom 
                ? 'border-magenta-400 bg-magenta-400/10 text-magenta-400' 
                : 'border-gray-600 bg-gray-800/50 text-gray-400 hover:border-magenta-500/50'
            }`}>
              <input
                type="radio"
                name="nftSource"
                checked={useCustom}
                onChange={() => setUseCustom(true)}
                className="sr-only"
              />
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  useCustom ? 'border-magenta-400 bg-magenta-400' : 'border-gray-600'
                }`}>
                  {useCustom && <div className="w-2 h-2 bg-black rounded-full m-0.5"></div>}
                </div>
                <div>
                  <div className="font-cyber font-bold text-sm">CUSTOM_ADDRESS</div>
                  <div className="text-xs font-mono opacity-80">Manual contract input</div>
                </div>
              </div>
            </label>
          </div>
        </div>
        
        {/* Input Section */}
        <div className="glass-strong rounded-lg p-6 border border-gray-700">
          {!useCustom ? (
            <div>
              <label htmlFor="nftCollection" className="block text-sm font-cyber font-bold text-purple-400 mb-3">
                → NFT_COLLECTION_TARGET
              </label>
              <select
                id="nftCollection"
                value={selectedNFT}
                onChange={(e) => setSelectedNFT(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-cyan-400 font-mono transition-all duration-300"
                disabled={isPending || isConfirming}
              >
                <option value="" className="bg-gray-900">[ SELECT_TARGET_COLLECTION ]</option>
                {SAMPLE_NFT_COLLECTIONS.map((nft) => (
                  <option key={nft.address} value={nft.address} className="bg-gray-900">
                    {nft.name} | {nft.address}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label htmlFor="customNFT" className="block text-sm font-cyber font-bold text-magenta-400 mb-3">
                → CUSTOM_CONTRACT_ADDRESS
              </label>
              <input
                type="text"
                id="customNFT"
                value={customNFTAddress}
                onChange={(e) => setCustomNFTAddress(e.target.value)}
                placeholder="0x0000000000000000000000000000000000000000"
                className="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-lg focus:border-magenta-400 focus:ring-2 focus:ring-magenta-400/20 text-magenta-400 font-mono placeholder-gray-600 transition-all duration-300"
                disabled={isPending || isConfirming}
              />
              <div className="mt-2 text-xs text-gray-500 font-mono">
                FORMAT: 40_CHARACTER_HEXADECIMAL_ADDRESS_WITH_0x_PREFIX
              </div>
            </div>
          )}
        </div>
        
        {/* Action Button */}
        <button
          onClick={handleVerifyNFT}
          disabled={!nftAddress || isPending || isConfirming}
          className="btn-cyber w-full py-4 px-6 rounded-lg font-cyber text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
        >
          <div className="flex items-center justify-center space-x-3">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              isPending || isConfirming ? 'animate-spin border-current' : 'border-current'
            }`}>
              {isPending || isConfirming ? '⟳' : '⬡'}
            </div>
            <span>
              {isPending || isConfirming ? 'PROCESSING_VERIFICATION...' : 'EXECUTE_NFT_VERIFICATION'}
            </span>
          </div>
        </button>
        
        {/* Protocol Information */}
        <div className="border border-green-500/30 rounded-lg bg-green-400/5 p-6">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 border border-green-400 rounded-full flex items-center justify-center animate-pulse mr-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <div className="font-cyber font-bold text-green-400">VERIFICATION_PROTOCOL_DETAILS</div>
          </div>
          
          <div className="space-y-3 text-sm font-mono text-gray-300">
            <div className="flex items-start">
              <span className="text-cyan-400 mr-2">01:</span>
              <span>SHADOW_ADDRESS → FHE_DECRYPTION_ORACLE [OFF-CHAIN_SECURE_PROCESSING]</span>
            </div>
            <div className="flex items-start">
              <span className="text-purple-400 mr-2">02:</span>
              <span>OWNERSHIP_VALIDATION → SPECIFIED_NFT_CONTRACT [BLOCKCHAIN_QUERY]</span>
            </div>
            <div className="flex items-start">
              <span className="text-yellow-400 mr-2">03:</span>
              <span>RESULT_STORAGE → ON-CHAIN_RECORD [CRYPTOGRAPHIC_COMMITMENT]</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-400 mr-2">04:</span>
              <span>AIRDROP_ELIGIBILITY → ANONYMOUS_QUALIFICATION [ZERO_KNOWLEDGE_PROOF]</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};