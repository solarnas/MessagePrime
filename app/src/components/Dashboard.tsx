import { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES, CONFIDENTIAL_TRADE_ABI, AIRDROP_ABI } from '../config/contracts';
import { AddressRegistration } from './AddressRegistration';
import { NFTVerification } from './NFTVerification';
import { AirdropClaiming } from './AirdropClaiming';
import { NFTMinting } from './NFTMinting';
import { TokenPurchase } from './TokenPurchase';
import { AdminPanel } from './AdminPanel';
import { RevealPage } from './RevealPage';
import { AssetsPage } from './AssetsPage';
import { WithdrawPage } from './WithdrawPage';
// formatEther import removed - not used

type TabType = 'register' | 'verify' | 'airdrop' | 'mint' | 'purchase' | 'admin' | 'reveal' | 'assets' | 'withdraw';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('register');
  const { address } = useAccount();
  
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
  useEffect(()=>{
    console.log("dashboard:",registrationData);
    
  },[registrationData])

  // Get total airdrops for user
  const { data: _totalAirdrops } = useReadContract({
    address: CONTRACT_ADDRESSES.AIRDROP as `0x${string}`,
    abi: AIRDROP_ABI,
    functionName: 'getUserTotalAirdrops',
    args: [address!],
    query: {
      enabled: !!address
    }
  });

  const isRegistered = registrationData?.isRegistered
  // const registrationTime = registrationData?.registrationTime

  console.log("dashboard:",isRegistered);
  
  const tabs = [
    { id: 'register', label: 'Register', description: 'Register your shadow address' },
    { id: 'purchase', label: 'Purchase', description: 'Buy tokens anonymously' },
    { id: 'assets', label: 'Assets', description: 'View your holdings' },
    { id: 'withdraw', label: 'Withdraw', description: 'Transfer to proxy address' },
    { id: 'reveal', label: 'Reveal', description: 'Reveal proxy address' },
    { id: 'admin', label: 'Admin', description: 'Manage token prices' },
    { id: 'verify', label: 'Verify NFTs', description: 'Verify NFT ownership' },
    { id: 'airdrop', label: 'Airdrops', description: 'Claim airdrop eligibility' },
    { id: 'mint', label: 'Mint NFT', description: 'Mint test NFTs' }
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'register':
        return <AddressRegistration />;
      case 'purchase':
        return <TokenPurchase />;
      case 'assets':
        return <AssetsPage />;
      case 'withdraw':
        return <WithdrawPage />;
      case 'reveal':
        return <RevealPage />;
      case 'admin':
        return <AdminPanel />;
      case 'verify':
        return <NFTVerification />;
      case 'airdrop':
        return <AirdropClaiming />;
      case 'mint':
        return <NFTMinting />;
      default:
        return <AddressRegistration />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* User Status Overview */}
      

      {/* Navigation Tabs */}
      <div className="border-b border-cyan-500/30 mb-8">
        <nav className="-mb-px flex flex-wrap gap-1">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative py-3 px-4 font-cyber text-xs font-bold transition-all duration-300 group ${
                activeTab === tab.id
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-cyan-300 border-b-2 border-transparent hover:border-cyan-500/50'
              }`}
              style={{animationDelay: `${index * 0.1}s`}}
            >
              {/* Button glow effect */}
              {activeTab === tab.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-magenta-400/10 rounded-t-lg animate-pulse"></div>
              )}
              
              {/* Tab number */}
              <span className="relative z-10 flex items-center space-x-2">
                <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                  activeTab === tab.id 
                    ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400'
                    : 'border-gray-600 bg-gray-800 text-gray-400 group-hover:border-cyan-500 group-hover:text-cyan-300'
                }`}>
                  {index + 1}
                </span>
                <div>
                  <div className="uppercase tracking-wider text-xs">{tab.label}</div>
                  <div className="text-xs text-gray-500 font-mono normal-case tracking-normal hidden sm:block">
                    {tab.description}
                  </div>
                </div>
              </span>
              
              {/* Active indicator */}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-cyan-400 rotate-45 translate-y-1 animate-pulse"></div>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mb-8">
        {renderContent()}
      </div>

      {/* Enhanced Instructions */}
      <div className="card-cyber p-8 relative overflow-hidden">
        {/* Background circuit pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            <defs>
              <pattern id="circuit" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="2" fill="currentColor" />
                <path d="M0,20 L40,20 M20,0 L20,40" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)" />
          </svg>
        </div>
        
       
      </div>
    </div>
  );
};