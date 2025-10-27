import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { toast } from 'react-hot-toast';
import { CONTRACT_ADDRESSES, AIRDROP_ABI, CONFIDENTIAL_TRADE_ABI } from '../config/contracts';
import { formatEther } from 'viem';

interface AirdropInfo {
  nftContract: string;
  amount: bigint;
  claimed: boolean;
  timestamp: bigint;
}

export const AirdropClaiming = () => {
  const [selectedNFTAddress, setSelectedNFTAddress] = useState<string>('');
  
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

  // Get total airdrops for user
  const { data: totalAirdrops } = useReadContract({
    address: CONTRACT_ADDRESSES.AIRDROP as `0x${string}`,
    abi: AIRDROP_ABI,
    functionName: 'getUserTotalAirdrops',
    args: [address!],
    query: {
      enabled: !!address
    }
  });

  // Get airdrop record for selected NFT
  const { data: airdropRecord, refetch: refetchAirdropRecord } = useReadContract({
    address: CONTRACT_ADDRESSES.AIRDROP as `0x${string}`,
    abi: AIRDROP_ABI,
    functionName: 'getAirdropRecord',
    args: [address!, selectedNFTAddress as `0x${string}`],
    query: {
      enabled: !!address && !!selectedNFTAddress && !!selectedNFTAddress.match(/^0x[a-fA-F0-9]{40}$/)
    }
  });
  
  const { writeContract, data: hash, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const isRegistered = registrationData?.isRegistered ?? false;

  const handleRecordAirdrop = async () => {
    if (!address || !selectedNFTAddress) {
      toast.error('Please enter an NFT contract address');
      return;
    }

    if (!selectedNFTAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error('Please enter a valid contract address');
      return;
    }

    try {
      toast.loading('Recording airdrop eligibility...');
      
      writeContract({
        address: CONTRACT_ADDRESSES.AIRDROP as `0x${string}`,
        abi: AIRDROP_ABI,
        functionName: 'recordAirdrop',
        args: [selectedNFTAddress as `0x${string}`],
      });
      
    } catch (error) {
      console.error('Airdrop recording failed:', error);
      toast.dismiss();
      toast.error('Failed to record airdrop. Please ensure you have verified NFT ownership.');
    }
  };

  // Handle transaction success
  if (isSuccess) {
    toast.dismiss();
    toast.success('Airdrop eligibility recorded successfully!');
    refetchAirdropRecord();
  }

  const airdropInfo = airdropRecord as AirdropInfo | undefined;

  if (!isConnected) {
    return (
      <div className="card-cyber p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full glass-strong flex items-center justify-center animate-pulse">
          <div className="text-3xl text-yellow-400">💰</div>
        </div>
        <h2 className="text-2xl font-cyber font-bold text-yellow-400 mb-4">WALLET_CONNECTION_REQUIRED</h2>
        <p className="text-gray-400 font-mono">AIRDROP_ACCESS_DENIED → AUTHENTICATE_WALLET_FIRST</p>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="card-cyber p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full glass-strong flex items-center justify-center border border-red-500/30">
          <div className="text-3xl text-red-400 animate-pulse">⚠️</div>
        </div>
        <h2 className="text-2xl font-cyber font-bold text-red-400 mb-4">SHADOW_ADDRESS_REQUIRED</h2>
        <p className="text-gray-400 font-mono">REGISTRATION_INCOMPLETE → INITIALIZE_SHADOW_PROTOCOL_FIRST</p>
        <div className="mt-4 p-3 border border-yellow-500/30 rounded-lg bg-yellow-400/5">
          <div className="text-yellow-400 font-mono text-sm">
            <span className="font-bold">PROTOCOL_ERROR:</span> Airdrop eligibility requires active shadow address deployment.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-cyber p-8 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center mb-8">
        <div className="w-16 h-16 rounded-lg glass-strong flex items-center justify-center mr-4 border border-yellow-500/50 animate-float">
          <div className="text-yellow-400 text-2xl animate-pulse">⬟</div>
        </div>
        <div>
          <h2 className="text-2xl font-cyber font-bold text-yellow-400">AIRDROP_ACQUISITION_PROTOCOL</h2>
          <div className="text-sm text-gray-400 font-mono">CONFIDENTIAL_REWARD_EXTRACTION_SYSTEM</div>
        </div>
      </div>
      
      <div className="mb-8 p-4 border border-yellow-500/30 rounded-lg bg-yellow-400/5">
        <p className="text-yellow-400 font-mono text-sm leading-relaxed">
          <span className="font-bold">WEALTH_ACCUMULATION:</span> Record airdrop eligibility based on verified NFT holdings. Shadow address maintains complete anonymity during reward allocation process.
        </p>
      </div>
      
      <div className="space-y-8">
        {/* Wealth Summary */}
        <div className="glass-strong rounded-lg p-8 border border-yellow-500/30 relative overflow-hidden">
          {/* Golden glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-orange-400/5 to-yellow-400/5 animate-pulse"></div>
          
          <div className="relative z-10">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mr-4 animate-pulse">
                <div className="text-black font-bold text-xl">💎</div>
              </div>
              <div>
                <h3 className="font-cyber font-bold text-yellow-400 text-xl">ACCUMULATED_WEALTH</h3>
                <div className="text-xs text-gray-400 font-mono">CRYPTOGRAPHICALLY_SECURED_REWARDS</div>
              </div>
            </div>
            
            <div className="text-center mb-6">
              <div className="text-5xl font-cyber font-bold text-neon-gold mb-2 animate-glow">
                {totalAirdrops ? formatEther(totalAirdrops) : '0.00'}
                <span className="text-2xl ml-2">ETH</span>
              </div>
              <div className="text-gray-400 font-mono text-sm">
                TOTAL_RECORDED_AIRDROPS [PENDING_DISTRIBUTION]
              </div>
            </div>
            
            {/* Wealth Meter */}
            <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-orange-400 animate-pulse"
                style={{
                  width: `${Math.min(100, parseFloat(totalAirdrops ? formatEther(totalAirdrops) : '0') * 20)}%`
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 font-mono mt-2">
              <span>BASELINE</span>
              <span>WHALE_STATUS</span>
            </div>
          </div>
        </div>

        {/* Target Selection */}
        <div className="glass-strong rounded-lg p-6 border border-purple-500/30">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-purple-400 rounded-lg flex items-center justify-center mr-4">
              <div className="text-black font-bold">🎯</div>
            </div>
            <div>
              <h3 className="font-cyber font-bold text-purple-400">TARGET_NFT_COLLECTION</h3>
              <div className="text-xs text-gray-400 font-mono">SPECIFY_REWARD_SOURCE_CONTRACT</div>
            </div>
          </div>
          
          <div>
            <label htmlFor="nftAddress" className="block text-sm font-cyber font-bold text-cyan-400 mb-3">
              → NFT_CONTRACT_ADDRESS
            </label>
            <input
              type="text"
              id="nftAddress"
              value={selectedNFTAddress}
              onChange={(e) => setSelectedNFTAddress(e.target.value)}
              placeholder="0x0000000000000000000000000000000000000000"
              className="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 text-yellow-400 font-mono placeholder-gray-600 transition-all duration-300"
              disabled={isPending || isConfirming}
            />
            <div className="mt-2 text-xs text-gray-500 font-mono">
              SPECIFICATION: NFT_CONTRACT_FOR_AIRDROP_ELIGIBILITY_RECORDING
            </div>
          </div>
        </div>

        {/* Airdrop Status Display */}
        {selectedNFTAddress && airdropInfo && (
          <div className="glass-strong rounded-lg p-6 border border-green-500/30 animate-slide-in">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-green-400 rounded-lg flex items-center justify-center mr-4">
                <div className="text-black font-bold">📊</div>
              </div>
              <div>
                <h3 className="font-cyber font-bold text-green-400">AIRDROP_STATUS_REPORT</h3>
                <div className="text-xs text-gray-400 font-mono">CURRENT_ALLOCATION_DATA</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-900/50 rounded-lg border border-green-500/20">
                <div className="text-xs text-green-400 font-mono mb-1">AMOUNT:</div>
                <div className="text-green-300 font-cyber text-lg">{formatEther(airdropInfo.amount)} ETH</div>
              </div>
              
              <div className="p-4 bg-gray-900/50 rounded-lg border border-green-500/20">
                <div className="text-xs text-green-400 font-mono mb-1">STATUS:</div>
                <div className={`font-cyber text-lg ${airdropInfo.claimed ? 'text-green-400' : 'text-orange-400'}`}>
                  {airdropInfo.claimed ? 'DISTRIBUTED' : 'RECORDED'}
                </div>
              </div>
              
              <div className="p-4 bg-gray-900/50 rounded-lg border border-green-500/20">
                <div className="text-xs text-green-400 font-mono mb-1">TIMESTAMP:</div>
                <div className="text-green-300 font-mono text-sm">
                  {new Date(Number(airdropInfo.timestamp) * 1000).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Action Button */}
        <button
          onClick={handleRecordAirdrop}
          disabled={!selectedNFTAddress || isPending || isConfirming || (airdropInfo && airdropInfo.amount > 0)}
          className="btn-cyber w-full py-4 px-6 rounded-lg font-cyber text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
        >
          <div className="flex items-center justify-center space-x-3">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              isPending || isConfirming ? 'animate-spin border-current' : 'border-current'
            }`}>
              {isPending || isConfirming ? '⟳' : 
               airdropInfo && airdropInfo.amount > 0 ? '✓' :
               '⬟'}
            </div>
            <span>
              {isPending || isConfirming ? 'PROCESSING_AIRDROP_RECORD...' : 
               airdropInfo && airdropInfo.amount > 0 ? 'AIRDROP_ALREADY_RECORDED' :
               'EXECUTE_AIRDROP_RECORDING'}
            </span>
          </div>
        </button>
        
        {/* Protocol Information */}
        <div className="glass-strong rounded-lg p-6 border border-blue-500/30">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center mr-3">
              <div className="text-black font-bold">ℹ</div>
            </div>
            <h3 className="font-cyber font-bold text-blue-400">AIRDROP_PROTOCOL_SEQUENCE</h3>
          </div>
          
          <div className="space-y-3 text-sm font-mono text-gray-300">
            <div className="flex items-start">
              <span className="text-cyan-400 mr-2">01:</span>
              <span>NFT_OWNERSHIP_VERIFICATION → Execute via NFT Verification Protocol</span>
            </div>
            <div className="flex items-start">
              <span className="text-purple-400 mr-2">02:</span>
              <span>ELIGIBILITY_RECORDING → On-chain airdrop allocation registration</span>
            </div>
            <div className="flex items-start">
              <span className="text-yellow-400 mr-2">03:</span>
              <span>CRYPTOGRAPHIC_STORAGE → Immutable reward record creation</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-400 mr-2">04:</span>
              <span>FUTURE_DISTRIBUTION → Automated token distribution system [PENDING]</span>
            </div>
            <div className="flex items-start">
              <span className="text-orange-400 mr-2">05:</span>
              <span>PRIVACY_MAINTAINED → Shadow address anonymity throughout process</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};