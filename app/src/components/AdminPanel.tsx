import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import toast from 'react-hot-toast';
import { CONTRACT_ADDRESSES, CONFIDENTIAL_TRADE_ABI } from '../config/contracts';

interface Token {
  symbol: string;
  name: string;
  icon: string;
  address: string;
  color: string;
}

const TOKENS: Token[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    icon: '⟡',
    address: '0x0000000000000000000000000000000000000001',
    color: 'from-blue-400 to-cyan-400'
  },
  {
    symbol: 'ZAMA',
    name: 'Zama',
    icon: '⬢',
    address: '0x0000000000000000000000000000000000000002',
    color: 'from-green-400 to-emerald-400'
  },
  {
    symbol: 'UNI',
    name: 'Uniswap',
    icon: '◈',
    address: '0x0000000000000000000000000000000000000003',
    color: 'from-pink-400 to-purple-400'
  },
  {
    symbol: 'DOGE',
    name: 'Doge',
    icon: '🐶',
    address: '0x0000000000000000000000000000000000000004',
    color: 'from-yellow-400 to-orange-400'
  }
];

export const AdminPanel = () => {
  const { address } = useAccount();
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  // Check if current user is owner
  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESSES.CONFIDENTIAL_TRADE as `0x${string}`,
    abi: CONFIDENTIAL_TRADE_ABI,
    functionName: 'owner',
  });

  // Note: Token price queries are handled individually below

  const { writeContract: setTokenPrice, data: setPriceHash, isPending: isSetPricePending } = useWriteContract();
  
  const { isLoading: isSetPriceLoading } = useWaitForTransactionReceipt({
    hash: setPriceHash,
  });

  useEffect(() => {
    // Initialize prices with empty strings
    const initialPrices: Record<string, string> = {};
    TOKENS.forEach(token => {
      initialPrices[token.address] = '';
    });
    setPrices(initialPrices);
  }, []);

  // Get current prices for all tokens using individual hooks
  const ethPrice = useReadContract({
    address: CONTRACT_ADDRESSES.CONFIDENTIAL_TRADE as `0x${string}`,
    abi: CONFIDENTIAL_TRADE_ABI,
    functionName: 'getTokenPrice',
    args: [TOKENS[0].address as `0x${string}`], // ETH
  });

  const zamaPrice = useReadContract({
    address: CONTRACT_ADDRESSES.CONFIDENTIAL_TRADE as `0x${string}`,
    abi: CONFIDENTIAL_TRADE_ABI,
    functionName: 'getTokenPrice',
    args: [TOKENS[1].address as `0x${string}`], // ZAMA
  });

  const uniPrice = useReadContract({
    address: CONTRACT_ADDRESSES.CONFIDENTIAL_TRADE as `0x${string}`,
    abi: CONFIDENTIAL_TRADE_ABI,
    functionName: 'getTokenPrice',
    args: [TOKENS[2].address as `0x${string}`], // UNI
  });

  const dogePrice = useReadContract({
    address: CONTRACT_ADDRESSES.CONFIDENTIAL_TRADE as `0x${string}`,
    abi: CONFIDENTIAL_TRADE_ABI,
    functionName: 'getTokenPrice',
    args: [TOKENS[3].address as `0x${string}`], // DOGE
  });

  // Store current prices for display
  const [currentPrices, setCurrentPrices] = useState<Record<string, string>>({});

  // Update current prices when data changes
  useEffect(() => {
    const newCurrentPrices: Record<string, string> = {};
    
    if (ethPrice.data !== undefined) {
      newCurrentPrices[TOKENS[0].address] = (Number(ethPrice.data) / 1e6).toFixed(2);
    }
    if (zamaPrice.data !== undefined) {
      newCurrentPrices[TOKENS[1].address] = (Number(zamaPrice.data) / 1e6).toFixed(2);
    }
    if (uniPrice.data !== undefined) {
      newCurrentPrices[TOKENS[2].address] = (Number(uniPrice.data) / 1e6).toFixed(2);
    }
    if (dogePrice.data !== undefined) {
      newCurrentPrices[TOKENS[3].address] = (Number(dogePrice.data) / 1e6).toFixed(2);
    }
    
    setCurrentPrices(newCurrentPrices);
  }, [ethPrice.data, zamaPrice.data, uniPrice.data, dogePrice.data]);

  const handlePriceChange = (tokenAddress: string, price: string) => {
    setPrices(prev => ({
      ...prev,
      [tokenAddress]: price
    }));
  };

  const handleSetPrice = async (token: Token) => {
    const price = prices[token.address];
    if (!price || parseFloat(price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setIsLoading(prev => ({ ...prev, [token.address]: true }));
    
    try {
      // Convert price to proper format (6 decimals for USDT)
      const priceInWei = parseUnits(price, 6);
      
      setTokenPrice({
        address: CONTRACT_ADDRESSES.CONFIDENTIAL_TRADE as `0x${string}`,
        abi: CONFIDENTIAL_TRADE_ABI,
        functionName: 'setPrice',
        args: [token.address as `0x${string}`, priceInWei],
      });
      
      toast.success(`Price updated for ${token.symbol}`);
    } catch (error) {
      console.error('Set price failed:', error);
      toast.error(`Failed to set price for ${token.symbol}`);
    } finally {
      setIsLoading(prev => ({ ...prev, [token.address]: false }));
    }
  };

  const isOwner = owner && address && owner.toLowerCase() === address.toLowerCase();

  if (!isOwner) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-2 h-8 bg-gradient-to-b from-red-400 to-orange-400 rounded-full"></div>
            <h2 className="text-3xl font-cyber font-bold text-red-400">
              ACCESS DENIED
            </h2>
            <div className="w-2 h-8 bg-gradient-to-b from-orange-400 to-red-400 rounded-full"></div>
          </div>
          <p className="text-gray-300 font-mono text-sm">
            Admin privileges required • Contact system administrator
          </p>
        </div>
        
        <div className="card-cyber p-12 text-center">
          <div className="w-24 h-24 border-4 border-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🚫</span>
          </div>
          <h3 className="text-2xl font-cyber font-bold text-red-400 mb-4">
            UNAUTHORIZED ACCESS
          </h3>
          <p className="text-gray-400 font-mono max-w-md mx-auto">
            This section is restricted to contract owners only. 
            Please connect with an authorized administrator wallet to access the price management interface.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-2 h-8 bg-gradient-to-b from-cyan-400 to-magenta-400 rounded-full"></div>
          <h2 className="text-3xl font-cyber font-bold text-cyan-400">
            ADMIN CONTROL PANEL
          </h2>
          <div className="w-2 h-8 bg-gradient-to-b from-magenta-400 to-cyan-400 rounded-full"></div>
        </div>
        <p className="text-gray-300 font-mono text-sm">
          Token price management • System configuration • Administrative controls
        </p>
      </div>

      {/* Admin Status */}
      <div className="card-cyber p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-cyan-400 rounded-full flex items-center justify-center">
              <span className="text-2xl">👑</span>
            </div>
            <div>
              <h3 className="text-xl font-cyber font-bold text-cyan-400">ADMINISTRATOR</h3>
              <p className="text-gray-400 font-mono text-sm">Contract Owner: {owner}</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-green-400/20 border border-green-400/30 rounded-full">
            <span className="text-green-400 font-mono text-sm font-bold">AUTHENTICATED</span>
          </div>
        </div>
      </div>

      {/* Price Management */}
      <div className="card-cyber p-6">
        <h3 className="text-2xl font-cyber font-bold text-cyan-400 mb-6 flex items-center">
          <span className="mr-3">💰</span>
          TOKEN PRICE MANAGEMENT
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TOKENS.map((token) => (
            <div key={token.symbol} className="glass-strong rounded-lg p-6 border border-gray-700">
              <div className="flex items-center space-x-4 mb-6">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${token.color} flex items-center justify-center text-2xl font-bold animate-pulse`}>
                  {token.icon}
                </div>
                <div>
                  <h4 className="font-cyber font-bold text-lg text-cyan-400">
                    {token.symbol}
                  </h4>
                  <p className="text-sm text-gray-400 font-mono">
                    {token.name}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Current Price Display */}
                <div className="glass-strong rounded-lg p-3">
                  <div className="text-xs text-gray-400 font-mono uppercase mb-1">Current Price</div>
                  <div className="text-lg font-cyber font-bold text-neon-gold">
                    {currentPrices[token.address] ? `${currentPrices[token.address]} USDT` : 'Loading... USDT'}
                  </div>
                </div>
                
                {/* Price Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-mono text-gray-300">
                    New Price (USDT)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={prices[token.address] || ''}
                      onChange={(e) => handlePriceChange(token.address, e.target.value)}
                      placeholder="0.000000"
                      className="w-full bg-black/50 border border-gray-600 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-cyan-400 transition-colors"
                      min="0"
                      step="0.000001"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 font-cyber text-sm">
                      USDT
                    </div>
                  </div>
                </div>
                
                {/* Update Button */}
                <button
                  onClick={() => handleSetPrice(token)}
                  disabled={isLoading[token.address] || isSetPricePending || isSetPriceLoading}
                  className="w-full btn-primary py-3 text-sm font-cyber font-bold disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  {isLoading[token.address] || isSetPricePending || isSetPriceLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>UPDATING...</span>
                    </div>
                  ) : (
                    <>
                      <span className="relative z-10">UPDATE PRICE</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-magenta-400/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-cyber p-6">
          <h4 className="font-cyber font-bold text-cyan-400 mb-4 flex items-center">
            <span className="mr-2">📊</span>
            SYSTEM STATUS
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-mono text-sm">Contract:</span>
              <div className="px-2 py-1 bg-green-400/20 text-green-400 rounded text-xs font-mono">
                ACTIVE
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-mono text-sm">Prices:</span>
              <div className="px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded text-xs font-mono">
                UPDATING
              </div>
            </div>
          </div>
        </div>

        <div className="card-cyber p-6">
          <h4 className="font-cyber font-bold text-cyan-400 mb-4 flex items-center">
            <span className="mr-2">⚙️</span>
            CONFIGURATION
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-mono text-sm">Tokens:</span>
              <span className="text-cyan-400 font-mono">{TOKENS.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-mono text-sm">Base Currency:</span>
              <span className="text-yellow-400 font-mono">USDT</span>
            </div>
          </div>
        </div>

        <div className="card-cyber p-6">
          <h4 className="font-cyber font-bold text-cyan-400 mb-4 flex items-center">
            <span className="mr-2">🔒</span>
            SECURITY
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-mono text-sm">Access Level:</span>
              <span className="text-green-400 font-mono">ADMIN</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-mono text-sm">Encryption:</span>
              <span className="text-purple-400 font-mono">FHE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Warning */}
      <div className="card-cyber p-4 border border-red-500/30 bg-red-400/5">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 border border-red-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-red-400 text-sm">⚠</span>
          </div>
          <div className="text-red-400 font-mono text-xs leading-relaxed">
            <div className="font-bold mb-1">SECURITY WARNING:</div>
            Price changes affect all users immediately. Ensure accuracy before updating. 
            These changes are irreversible and will impact all anonymous trading operations.
          </div>
        </div>
      </div>
    </div>
  );
};