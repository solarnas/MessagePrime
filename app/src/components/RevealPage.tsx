import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import toast from 'react-hot-toast';
import { CONTRACT_ADDRESSES, CONFIDENTIAL_TRADE_ABI } from '../config/contracts';

export const RevealPage = () => {
  const { address } = useAccount();
  const [isRevealing, setIsRevealing] = useState(false);
  const [showWarning, setShowWarning] = useState(true);

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

  // Get decrypted proxy address if available
  const { data: decryptedProxyAddress } = useReadContract({
    address: CONTRACT_ADDRESSES.CONFIDENTIAL_TRADE as `0x${string}`,
    abi: CONFIDENTIAL_TRADE_ABI,
    functionName: 'decryptedProxyAddresses',
    args: [address!],
    query: {
      enabled: !!address
    }
  });

  // Request decryption transaction
  const { writeContract: requestDecryption, data: requestHash, isPending: isRequestPending } = useWriteContract();
  
  const { isLoading: isRequestLoading } = useWaitForTransactionReceipt({
    hash: requestHash,
  });

  const handleReveal = async () => {
    if (!registrationData?.isRegistered) {
      toast.error('Please register your proxy address first');
      return;
    }

    setIsRevealing(true);
    try {
      await requestDecryption({
        address: CONTRACT_ADDRESSES.CONFIDENTIAL_TRADE as `0x${string}`,
        abi: CONFIDENTIAL_TRADE_ABI,
        functionName: 'requestDecryption',
      });
      toast.success('Decryption request submitted! Please wait for processing...');
      setShowWarning(false);
    } catch (error) {
      console.error('Request decryption failed:', error);
      toast.error('Failed to request decryption. Please try again.');
    } finally {
      setIsRevealing(false);
    }
  };

  const isRevealed = decryptedProxyAddress && decryptedProxyAddress !== '0x0000000000000000000000000000000000000000';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-2 h-8 bg-gradient-to-b from-red-400 to-orange-400 rounded-full"></div>
          <h2 className="text-3xl font-cyber font-bold text-red-400">
            PROXY ADDRESS REVEAL
          </h2>
          <div className="w-2 h-8 bg-gradient-to-b from-orange-400 to-red-400 rounded-full"></div>
        </div>
        <p className="text-gray-300 font-mono text-sm">
          Decrypt and reveal your anonymous proxy address • Enable token withdrawal
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Security Warning */}
          {showWarning && !isRevealed && (
            <div className="card-cyber p-6 border-2 border-red-500/50 bg-red-400/5 animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 border-4 border-red-400 rounded-full flex items-center justify-center flex-shrink-0 animate-spin">
                  <span className="text-3xl">⚠️</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-cyber font-bold text-red-400 mb-4">
                    CRITICAL SECURITY WARNING
                  </h3>
                  <div className="space-y-3 text-red-300 font-mono text-sm">
                    <p>
                      <span className="text-red-400 font-bold">ATTENTION:</span> 
                      Once you reveal your proxy address, it will become publicly visible on the blockchain.
                    </p>
                    <p>
                      <span className="text-red-400 font-bold">CONSEQUENCE:</span> 
                      Your anonymous proxy address will be permanently linked to your current wallet address.
                    </p>
                    <p>
                      <span className="text-red-400 font-bold">ACTION REQUIRED:</span> 
                      After revealing, the proxy address can withdraw ALL purchased tokens from the encrypted treasury.
                    </p>
                  </div>
                  
                  {/* Warning checklist */}
                  <div className="mt-6 space-y-2">
                    <div className="text-red-400 font-mono text-sm font-bold mb-3">
                      UNDERSTAND THE RISKS:
                    </div>
                    {[
                      'This action is IRREVERSIBLE',
                      'Proxy address will be publicly visible',
                      'Anonymous benefits will be lost',
                      'All tokens will be accessible to proxy address'
                    ].map((risk, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-4 h-4 border border-red-400 rounded flex items-center justify-center">
                          <span className="text-red-400 text-xs">⚡</span>
                        </div>
                        <span className="text-red-300 font-mono text-xs">{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reveal Interface */}
          <div className="card-cyber p-8">
            <h3 className="text-2xl font-cyber font-bold text-cyan-400 mb-8 flex items-center">
              <span className="mr-3">🔓</span>
              DECRYPTION INTERFACE
            </h3>
            
            {!isRevealed ? (
              <div className="space-y-8">
                {/* Current Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-strong rounded-lg p-6">
                    <h4 className="font-cyber font-bold text-cyan-400 mb-4">REGISTRATION STATUS</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-mono text-sm">Proxy Address:</span>
                      <div className={`px-3 py-1 rounded-full text-xs font-mono ${
                        registrationData?.isRegistered 
                          ? 'bg-green-400/20 text-green-400 border border-green-400/30' 
                          : 'bg-red-400/20 text-red-400 border border-red-400/30'
                      }`}>
                        {registrationData?.isRegistered ? 'ENCRYPTED' : 'NOT_REGISTERED'}
                      </div>
                    </div>
                    {registrationData?.registrationTime && Number(registrationData.registrationTime) > 0 ? (
                      <div className="mt-3 text-xs text-gray-400 font-mono">
                        Registered: {new Date(Number(registrationData.registrationTime) * 1000).toLocaleDateString()}
                      </div>
                    ) : null}
                  </div>

                  <div className="glass-strong rounded-lg p-6">
                    <h4 className="font-cyber font-bold text-cyan-400 mb-4">REVEAL STATUS</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-mono text-sm">Address:</span>
                      <div className="px-3 py-1 bg-red-400/20 text-red-400 border border-red-400/30 rounded-full text-xs font-mono">
                        ENCRYPTED
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-400 font-mono">
                      Status: Awaiting decryption request
                    </div>
                  </div>
                </div>

                {/* Reveal Button */}
                <div className="text-center space-y-6">
                  <div className="relative">
                    <button
                      onClick={handleReveal}
                      disabled={isRevealing || isRequestPending || isRequestLoading || !registrationData?.isRegistered}
                      className="relative px-12 py-6 bg-gradient-to-r from-red-600 to-orange-600 text-white font-cyber font-bold text-xl rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-400 hover:border-red-300 transition-all duration-300 group overflow-hidden"
                    >
                      {isRevealing || isRequestPending || isRequestLoading ? (
                        <div className="flex items-center justify-center space-x-3">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>PROCESSING DECRYPTION...</span>
                        </div>
                      ) : !registrationData?.isRegistered ? (
                        'REGISTER PROXY ADDRESS FIRST'
                      ) : (
                        <>
                          <span className="relative z-10">🔥 REVEAL PROXY ADDRESS 🔥</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-orange-400/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                        </>
                      )}
                    </button>
                    
                    {/* Danger indicators */}
                    <div className="absolute -top-2 -left-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                  </div>

                  <div className="text-red-400 font-mono text-sm max-w-2xl mx-auto">
                    By clicking this button, you acknowledge that you understand the security implications 
                    and accept full responsibility for revealing your anonymous proxy address.
                  </div>
                </div>
              </div>
            ) : (
              /* Revealed State */
              <div className="space-y-6">
                <div className="text-center p-8 bg-green-400/10 border border-green-400/30 rounded-lg">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <span className="text-4xl">✅</span>
                  </div>
                  <h3 className="text-2xl font-cyber font-bold text-green-400 mb-4">
                    PROXY ADDRESS REVEALED
                  </h3>
                  <p className="text-gray-300 font-mono text-sm mb-6">
                    Your anonymous proxy address has been successfully decrypted and is now public.
                  </p>
                  
                  <div className="bg-black/50 border border-green-400/30 rounded-lg p-4">
                    <div className="text-xs text-gray-400 font-mono uppercase mb-2">Revealed Proxy Address</div>
                    <div className="text-green-400 font-mono text-lg break-all">
                      {decryptedProxyAddress || '0x0000000000000000000000000000000000000000'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass-strong rounded-lg p-4">
                    <h4 className="font-cyber font-bold text-cyan-400 mb-2">NEXT STEPS</h4>
                    <ul className="text-gray-300 font-mono text-sm space-y-1">
                      <li>• Switch to proxy wallet</li>
                      <li>• Access Assets page</li>
                      <li>• Withdraw your tokens</li>
                    </ul>
                  </div>
                  
                  <div className="glass-strong rounded-lg p-4">
                    <h4 className="font-cyber font-bold text-cyan-400 mb-2">SECURITY</h4>
                    <p className="text-red-300 font-mono text-sm">
                      ⚠️ Anonymous benefits permanently lost. 
                      Proxy address is now publicly linked.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Process Flow */}
          <div className="card-cyber p-6">
            <h3 className="text-lg font-cyber font-bold text-cyan-400 mb-4 flex items-center">
              <span className="mr-2">📋</span>
              REVEAL PROCESS
            </h3>
            
            <div className="space-y-4">
              {[
                {
                  step: 1,
                  title: 'Request Decryption',
                  description: 'Submit encrypted proxy address to KMS',
                  status: isRevealed ? 'completed' : (!registrationData?.isRegistered ? 'blocked' : 'pending')
                },
                {
                  step: 2,
                  title: 'Await Processing',
                  description: 'Decryption oracle processes request',
                  status: isRevealed ? 'completed' : 'pending'
                },
                {
                  step: 3,
                  title: 'Address Revealed',
                  description: 'Proxy address becomes public',
                  status: isRevealed ? 'completed' : 'pending'
                },
                {
                  step: 4,
                  title: 'Enable Withdrawal',
                  description: 'Tokens become withdrawable',
                  status: isRevealed ? 'completed' : 'pending'
                }
              ].map((item) => (
                <div key={item.step} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                    item.status === 'completed' 
                      ? 'bg-green-400/20 border-green-400 text-green-400' 
                      : item.status === 'blocked'
                      ? 'bg-red-400/20 border-red-400 text-red-400'
                      : 'bg-gray-400/20 border-gray-400 text-gray-400'
                  }`}>
                    {item.status === 'completed' ? '✓' : item.step}
                  </div>
                  <div className="flex-1">
                    <div className={`font-cyber font-bold text-sm ${
                      item.status === 'completed' ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {item.title}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {item.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="card-cyber p-6 border border-red-500/30 bg-red-400/5">
            <h3 className="text-lg font-cyber font-bold text-red-400 mb-4 flex items-center">
              <span className="mr-2">⚠️</span>
              RISK ASSESSMENT
            </h3>
            
            <div className="space-y-3">
              {[
                { level: 'HIGH', risk: 'Loss of anonymity' },
                { level: 'HIGH', risk: 'Public address exposure' },
                { level: 'MEDIUM', risk: 'Transaction traceability' },
                { level: 'LOW', risk: 'Asset security maintained' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-400 font-mono text-sm">{item.risk}</span>
                  <div className={`px-2 py-1 rounded text-xs font-mono ${
                    item.level === 'HIGH' 
                      ? 'bg-red-400/20 text-red-400' 
                      : item.level === 'MEDIUM'
                      ? 'bg-yellow-400/20 text-yellow-400'
                      : 'bg-green-400/20 text-green-400'
                  }`}>
                    {item.level}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Help */}
          <div className="card-cyber p-6">
            <h3 className="text-lg font-cyber font-bold text-cyan-400 mb-4 flex items-center">
              <span className="mr-2">❓</span>
              NEED HELP?
            </h3>
            
            <div className="text-gray-300 font-mono text-sm space-y-2">
              <p>• Read the security documentation</p>
              <p>• Consider alternative withdrawal methods</p>
              <p>• Contact support for guidance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};