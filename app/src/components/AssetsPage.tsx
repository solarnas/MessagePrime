import { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, CONFIDENTIAL_TRADE_ABI, MOCK_USDT_ABI } from '../config/contracts';

interface Token {
  symbol: string;
  name: string;
  icon: string;
  address: string;
  decimals: number;
  color: string;
}

const TOKENS: Token[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    icon: '⟡',
    address: '0x0000000000000000000000000000000000000001',
    decimals: 18,
    color: 'from-blue-400 to-cyan-400'
  },
  {
    symbol: 'ZAMA',
    name: 'Zama',
    icon: '⬢',
    address: '0x0000000000000000000000000000000000000002',
    decimals: 18,
    color: 'from-green-400 to-emerald-400'
  },
  {
    symbol: 'UNI',
    name: 'Uniswap',
    icon: '◈',
    address: '0x0000000000000000000000000000000000000003',
    decimals: 18,
    color: 'from-pink-400 to-purple-400'
  },
  {
    symbol: 'DOGE',
    name: 'Doge',
    icon: '🐶',
    address: '0x0000000000000000000000000000000000000004',
    decimals: 18,
    color: 'from-yellow-400 to-orange-400'
  }
];

export const AssetsPage = () => {
  const { address } = useAccount();
  const [refreshKey, setRefreshKey] = useState(0);

  // Get user registration status
  const { data: registrationData } = useReadContract({
    address: CONTRACT_ADDRESSES.CONFIDENTIAL_TRADE as `0x${string}`,
    abi: CONFIDENTIAL_TRADE_ABI,
    functionName: 'getUserRegistration',
    args: [address!],
    query: {
      enabled: !!address
    }
  });

  // Get USDT balance
  const { data: usdtBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.MOCK_USDT as `0x${string}`,
    abi: MOCK_USDT_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: {
      enabled: !!address
    }
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-4">
          <h1 className="text-2xl font-bold text-white">Assets</h1>
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
        <p className="text-gray-400 text-sm">Your token holdings</p>
      </div>

      {/* Status Bar */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              registrationData?.isRegistered ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            <span className="text-sm text-gray-300">
              {registrationData?.isRegistered ? 'Registered' : 'Not Registered'}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">USDT Balance</div>
            <div className="font-semibold text-white">
              {usdtBalance ? (Number(usdtBalance) / 1e6).toFixed(2) : '0.00'}
            </div>
          </div>
        </div>
      </div>

      {/* Assets List */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="font-semibold text-white">Token Holdings</h2>
        </div>
        
        <div className="divide-y divide-white/10">
          {TOKENS.map((token) => (
            <TokenListItem
              key={`${token.symbol}-${refreshKey}`}
              token={token}
              userAddress={address!}
            />
          ))}
        </div>
      </div>

    </div>
  );
};

// Token List Item Component
interface TokenListItemProps {
  token: Token;
  userAddress: string;
}

const TokenListItem = ({ token, userAddress }: TokenListItemProps) => {
  // Get user balance for this token
  const { data: userBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.CONFIDENTIAL_TRADE as `0x${string}`,
    abi: CONFIDENTIAL_TRADE_ABI,
    functionName: 'getUserBalance',
    args: [userAddress as `0x${string}`, token.address as `0x${string}`],
    query: {
      enabled: !!userAddress
    }
  });

  // Get token price
  const { data: tokenPrice } = useReadContract({
    address: CONTRACT_ADDRESSES.CONFIDENTIAL_TRADE as `0x${string}`,
    abi: CONFIDENTIAL_TRADE_ABI,
    functionName: 'getTokenPrice',
    args: [token.address as `0x${string}`],
  });

  const userBalanceNum = userBalance ? Number(userBalance) / 1e18 : 0; // Convert from wei to token units
  const priceNum = tokenPrice ? Number(tokenPrice) / 1e6 : 0;
  const totalValue = userBalanceNum * priceNum;

  return (
    <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
      {/* Token Info */}
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${token.color} flex items-center justify-center text-lg`}>
          {token.icon}
        </div>
        <div>
          <div className="font-semibold text-white">{token.symbol}</div>
          <div className="text-sm text-gray-400">{token.name}</div>
        </div>
      </div>

      {/* Balance & Value */}
      <div className="flex items-center space-x-6">
        <div className="text-right">
          <div className="font-semibold text-white">
            {userBalanceNum < 1 ? userBalanceNum.toFixed(6) : userBalanceNum.toFixed(4)}
          </div>
          <div className="text-sm text-gray-400">
            ${totalValue.toFixed(2)}
          </div>
        </div>

        {/* Price */}
        <div className="text-right">
          <div className="font-semibold text-white">
            ${priceNum.toFixed(4)}
          </div>
          <div className="text-sm text-gray-400">
            Price
          </div>
        </div>
      </div>
    </div>
  );
};