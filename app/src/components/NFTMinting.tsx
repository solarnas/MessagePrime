import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { isAddress, parseUnits } from 'viem';
import toast from 'react-hot-toast';
import { CONTRACT_ADDRESSES, SIMPLE_NFT_ABI, MOCK_USDT_ABI } from '../config/contracts';

export const NFTMinting = () => {
  const [mintToAddress, setMintToAddress] = useState('');
  const [isCustomAddress, setIsCustomAddress] = useState(false);
  const { address, isConnected } = useAccount();

  // Read contract data
  const { data: _totalSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.SIMPLE_NFT as `0x${string}`,
    abi: SIMPLE_NFT_ABI,
    functionName: 'totalSupply',
  });

  const { data: userBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.SIMPLE_NFT as `0x${string}`,
    abi: SIMPLE_NFT_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: {
      enabled: !!address
    }
  });

  const { data: contractName } = useReadContract({
    address: CONTRACT_ADDRESSES.SIMPLE_NFT as `0x${string}`,
    abi: SIMPLE_NFT_ABI,
    functionName: 'name',
  });

  const { data: contractSymbol } = useReadContract({
    address: CONTRACT_ADDRESSES.SIMPLE_NFT as `0x${string}`,
    abi: SIMPLE_NFT_ABI,
    functionName: 'symbol',
  });

  // Read USDT balance
  const { data: usdtBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.MOCK_USDT as `0x${string}`,
    abi: MOCK_USDT_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: {
      enabled: !!address
    }
  });

  // Write contract hooks
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { writeContract: writeUsdtContract, data: usdtHash, isPending: isUsdtPending } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const { isLoading: isUsdtConfirming } = useWaitForTransactionReceipt({
    hash: usdtHash,
  });

  const handleMint = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      if (isCustomAddress) {
        if (!mintToAddress) {
          toast.error('Please enter a valid address');
          return;
        }
        if (!isAddress(mintToAddress)) {
          toast.error('Invalid Ethereum address');
          return;
        }
        
        writeContract({
          address: CONTRACT_ADDRESSES.SIMPLE_NFT as `0x${string}`,
          abi: SIMPLE_NFT_ABI,
          functionName: 'mint',
          args: [mintToAddress as `0x${string}`],
        });
      } else {
        writeContract({
          address: CONTRACT_ADDRESSES.SIMPLE_NFT as `0x${string}`,
          abi: SIMPLE_NFT_ABI,
          functionName: 'mint',
        });
      }

      toast.success('Minting NFT... Please wait for confirmation');
    } catch (error: any) {
      console.error('Minting error:', error);
      toast.error(error?.message || 'Failed to mint NFT');
    }
  };

  const handleMintUsdt = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      await writeUsdtContract({
        address: CONTRACT_ADDRESSES.MOCK_USDT as `0x${string}`,
        abi: MOCK_USDT_ABI,
        functionName: 'mint',
        args: [address!, parseUnits('10000', 6)], // 10,000 USDT with 6 decimals
      });

      toast.success('Minting 10,000 USDT... Please wait for confirmation');
    } catch (error: any) {
      console.error('USDT minting error:', error);
      toast.error(error?.message || 'Failed to mint USDT');
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card-cyber p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full glass-strong flex items-center justify-center animate-pulse">
            <div className="text-3xl text-blue-400">🎨</div>
          </div>
          <h2 className="text-2xl font-cyber font-bold text-blue-400 mb-4">WALLET_CONNECTION_REQUIRED</h2>
          <p className="text-gray-400 font-mono">NFT_MINTING_DISABLED → AUTHENTICATE_WALLET_PROTOCOL</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card-cyber p-8 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="w-16 h-16 rounded-lg glass-strong flex items-center justify-center mr-4 border border-blue-500/50 animate-float">
            <div className="text-blue-400 text-2xl animate-pulse">⬢</div>
          </div>
          <div>
            <h2 className="text-2xl font-cyber font-bold text-blue-400">NFT_ASSET_GENERATION</h2>
            <div className="text-sm text-gray-400 font-mono">QUANTUM_SECURED_DIGITAL_ARTIFACTS</div>
          </div>
        </div>
        
        <div className="mb-8 p-4 border border-blue-500/30 rounded-lg bg-blue-400/5">
          <p className="text-blue-400 font-mono text-sm leading-relaxed">
            <span className="font-bold">ASSET_GENERATION:</span> Create test digital artifacts for system validation. Each NFT receives unique cryptographic identity for ownership verification protocols.
          </p>
        </div>

        <div className="space-y-8">
          {/* Contract Status */}
          <div className="glass-strong rounded-lg p-6 border border-green-500/30">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-green-400 rounded-lg flex items-center justify-center mr-4">
                <div className="text-black font-bold">📊</div>
              </div>
              <div>
                <h3 className="font-cyber font-bold text-green-400">CONTRACT_STATUS_REPORT</h3>
                <div className="text-xs text-gray-400 font-mono">SMART_CONTRACT_ANALYTICS</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-900/50 rounded-lg border border-green-500/20">
                <div className="text-xs text-green-400 font-mono mb-1">CONTRACT_NAME:</div>
                <div className="text-green-300 font-cyber text-lg">{contractName || 'LOADING...'}</div>
              </div>
              
              <div className="p-4 bg-gray-900/50 rounded-lg border border-green-500/20">
                <div className="text-xs text-green-400 font-mono mb-1">TOKEN_SYMBOL:</div>
                <div className="text-green-300 font-cyber text-lg">{contractSymbol || 'LOADING...'}</div>
              </div>
              
              <div className="p-4 bg-gray-900/50 rounded-lg border border-green-500/20">
                <div className="text-xs text-green-400 font-mono mb-1">YOUR_BALANCE:</div>
                <div className="text-green-300 font-cyber text-lg">{userBalance?.toString() || '0'} NFTs</div>
              </div>

              <div className="p-4 bg-gray-900/50 rounded-lg border border-yellow-500/20">
                <div className="text-xs text-yellow-400 font-mono mb-1">USDT_BALANCE:</div>
                <div className="text-yellow-300 font-cyber text-lg">
                  {usdtBalance ? (Number(usdtBalance) / 1e6).toFixed(2) : '0.00'} USDT
                </div>
              </div>
              
              <div className="md:col-span-2 lg:col-span-3 p-4 bg-gray-900/50 rounded-lg border border-green-500/20">
                <div className="text-xs text-green-400 font-mono mb-1">CONTRACT_ADDRESS:</div>
                <div className="text-green-300 font-mono text-sm break-all">{CONTRACT_ADDRESSES.SIMPLE_NFT}</div>
              </div>
            </div>
          </div>

          {/* USDT Minting Section */}
          <div className="glass-strong rounded-lg p-6 border border-yellow-500/30">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center mr-4">
                <div className="text-black font-bold">💰</div>
              </div>
              <div>
                <h3 className="font-cyber font-bold text-yellow-400">USDT_TOKEN_GENERATION</h3>
                <div className="text-xs text-gray-400 font-mono">MOCK_CURRENCY_CREATION_PROTOCOL</div>
              </div>
            </div>

            <div className="mb-6 p-4 border border-yellow-500/30 rounded-lg bg-yellow-400/5">
              <p className="text-yellow-400 font-mono text-sm leading-relaxed">
                <span className="font-bold">USDT_GENERATION:</span> Mint 10,000 test USDT tokens for anonymous purchase testing. Each mint provides sufficient funds for multiple token acquisitions.
              </p>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-yellow-400 font-cyber font-bold">Current Balance:</div>
                <div className="text-yellow-300 font-mono text-2xl">
                  {usdtBalance ? (Number(usdtBalance) / 1e6).toFixed(2) : '0.00'} USDT
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-400 font-mono text-sm">Per Mint Amount:</div>
                <div className="text-yellow-400 font-cyber font-bold text-xl">10,000 USDT</div>
              </div>
            </div>

            <button
              onClick={handleMintUsdt}
              disabled={isUsdtPending || isUsdtConfirming}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-cyber font-bold py-4 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <div className="flex items-center justify-center space-x-3">
                <div className={`w-6 h-6 rounded-full border-2 border-black flex items-center justify-center ${
                  isUsdtPending || isUsdtConfirming ? 'animate-spin' : ''
                }`}>
                  {isUsdtPending || isUsdtConfirming ? '⟳' : '💰'}
                </div>
                <span>
                  {isUsdtPending || isUsdtConfirming 
                    ? (isUsdtPending ? 'MINTING_USDT...' : 'CONFIRMING_TRANSACTION...') 
                    : 'MINT_10000_USDT_TOKENS'
                  }
                </span>
              </div>
            </button>

            {/* USDT Transaction Status */}
            {usdtHash && (
              <div className="mt-6 glass-strong rounded-lg p-4 border border-yellow-500/30 animate-slide-in">
                <div className="flex items-center mb-3">
                  <div className="w-6 h-6 bg-yellow-400 rounded-lg flex items-center justify-center mr-3">
                    <div className="text-black font-bold text-sm">🔗</div>
                  </div>
                  <h4 className="font-cyber font-bold text-yellow-400">USDT_TRANSACTION_SUBMITTED</h4>
                </div>
                
                <div className="p-3 bg-gray-900/50 rounded-lg border border-yellow-500/20">
                  <div className="text-xs text-yellow-400 font-mono mb-2">TRANSACTION_HASH:</div>
                  <div className="text-yellow-300 font-mono text-sm break-all mb-3">{usdtHash}</div>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${usdtHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 font-cyber text-sm transition-colors"
                  >
                    <span>VIEW_ON_ETHERSCAN</span>
                    <div className="text-xs">↗</div>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Minting Configuration */}
          <div className="glass-strong rounded-lg p-6 border border-purple-500/30">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-purple-400 rounded-lg flex items-center justify-center mr-4">
                <div className="text-black font-bold">⚙️</div>
              </div>
              <div>
                <h3 className="font-cyber font-bold text-purple-400">MINTING_CONFIGURATION</h3>
                <div className="text-xs text-gray-400 font-mono">TARGET_ADDRESS_SPECIFICATION</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <label className={`cursor-pointer p-6 rounded-lg border-2 transition-all duration-300 ${
                !isCustomAddress 
                  ? 'border-blue-400 bg-blue-400/10 text-blue-400' 
                  : 'border-gray-600 bg-gray-800/50 text-gray-400 hover:border-blue-500/50'
              }`}>
                <input
                  type="radio"
                  name="mintOption"
                  checked={!isCustomAddress}
                  onChange={() => setIsCustomAddress(false)}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 mr-4 ${
                    !isCustomAddress ? 'border-blue-400 bg-blue-400' : 'border-gray-600'
                  }`}>
                    {!isCustomAddress && <div className="w-3 h-3 bg-black rounded-full m-0.5"></div>}
                  </div>
                  <div>
                    <div className="font-cyber font-bold text-lg">SELF_TARGET</div>
                    <div className="text-xs font-mono opacity-80">Mint to connected wallet</div>
                  </div>
                </div>
              </label>
              
              <label className={`cursor-pointer p-6 rounded-lg border-2 transition-all duration-300 ${
                isCustomAddress 
                  ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400' 
                  : 'border-gray-600 bg-gray-800/50 text-gray-400 hover:border-cyan-500/50'
              }`}>
                <input
                  type="radio"
                  name="mintOption"
                  checked={isCustomAddress}
                  onChange={() => setIsCustomAddress(true)}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 mr-4 ${
                    isCustomAddress ? 'border-cyan-400 bg-cyan-400' : 'border-gray-600'
                  }`}>
                    {isCustomAddress && <div className="w-3 h-3 bg-black rounded-full m-0.5"></div>}
                  </div>
                  <div>
                    <div className="font-cyber font-bold text-lg">CUSTOM_TARGET</div>
                    <div className="text-xs font-mono opacity-80">Mint to specified address</div>
                  </div>
                </div>
              </label>
            </div>

            {isCustomAddress && (
              <div className="animate-slide-in">
                <label className="block text-sm font-cyber font-bold text-cyan-400 mb-3">
                  → RECIPIENT_ADDRESS_SPECIFICATION
                </label>
                <input
                  type="text"
                  value={mintToAddress}
                  onChange={(e) => setMintToAddress(e.target.value)}
                  placeholder="0x0000000000000000000000000000000000000000"
                  className="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-lg focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-cyan-400 font-mono placeholder-gray-600 transition-all duration-300"
                />
                <div className="mt-2 text-xs text-gray-500 font-mono">
                  FORMAT: VALID_ETHEREUM_ADDRESS_REQUIRED
                </div>
              </div>
            )}
          </div>

          {/* Mint Action */}
          <button
            onClick={handleMint}
            disabled={isPending || isConfirming}
            className="btn-cyber w-full py-4 px-6 rounded-lg font-cyber text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            <div className="flex items-center justify-center space-x-3">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                isPending || isConfirming ? 'animate-spin border-current' : 'border-current'
              }`}>
                {isPending || isConfirming ? '⟳' : '⬢'}
              </div>
              <span>
                {isPending || isConfirming 
                  ? (isPending ? 'MINTING_NFT_ASSET...' : 'CONFIRMING_TRANSACTION...') 
                  : 'EXECUTE_NFT_GENERATION'
                }
              </span>
            </div>
          </button>

          {/* Transaction Status */}
          {hash && (
            <div className="glass-strong rounded-lg p-6 border border-blue-500/30 animate-slide-in">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center mr-3">
                  <div className="text-black font-bold">🔗</div>
                </div>
                <h3 className="font-cyber font-bold text-blue-400">TRANSACTION_SUBMITTED</h3>
              </div>
              
              <div className="p-4 bg-gray-900/50 rounded-lg border border-blue-500/20">
                <div className="text-xs text-blue-400 font-mono mb-2">TRANSACTION_HASH:</div>
                <div className="text-blue-300 font-mono text-sm break-all mb-3">{hash}</div>
                <a
                  href={`https://sepolia.etherscan.io/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 font-cyber text-sm transition-colors"
                >
                  <span>VIEW_ON_ETHERSCAN</span>
                  <div className="text-xs">↗</div>
                </a>
              </div>
            </div>
          )}

          {/* Asset Information */}
          <div className="glass-strong rounded-lg p-6 border border-yellow-500/30">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center mr-3">
                <div className="text-black font-bold">📋</div>
              </div>
              <h3 className="font-cyber font-bold text-yellow-400">NFT_ASSET_SPECIFICATIONS</h3>
            </div>
            
            <div className="space-y-3 text-sm font-mono text-gray-300">
              <div className="flex items-start">
                <span className="text-cyan-400 mr-2">01:</span>
                <span>FREE_MINT_PROTOCOL → No payment required for asset generation</span>
              </div>
              <div className="flex items-start">
                <span className="text-purple-400 mr-2">02:</span>
                <span>UNIQUE_IDENTIFIERS → Each NFT receives cryptographic ID</span>
              </div>
              <div className="flex items-start">
                <span className="text-green-400 mr-2">03:</span>
                <span>ERC721_COMPLIANCE → Standard transferable digital assets</span>
              </div>
              <div className="flex items-start">
                <span className="text-yellow-400 mr-2">04:</span>
                <span>VERIFICATION_COMPATIBLE → Usable in shadow protocol testing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};