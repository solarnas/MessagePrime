import '@rainbow-me/rainbowkit/styles.css';
import './App.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { Toaster } from 'react-hot-toast';

import { config } from './config/wagmi';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
            {/* Matrix rain effect */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="matrix-char absolute text-green-400 opacity-30"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 10}s`,
                    animationDuration: `${10 + Math.random() * 10}s`
                  }}
                >
                  {String.fromCharCode(0x30A0 + Math.random() * 96)}
                </div>
              ))}
            </div>
            
            <Header />
            <main className="relative z-10">
              <Dashboard />
            </main>
            
            {/* Enhanced Footer */}
            <footer className="relative z-10 glass border-t border-cyan-500/20 mt-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                  <p className="text-gray-300 mb-4 font-mono">
                    <span className="text-neon font-cyber">POWERED BY</span>{' '}
                    <span className="font-semibold text-neon-gold animate-pulse">ZAMA'S FHE TECHNOLOGY</span>
                  </p>
                  <p className="text-gray-400 text-sm mb-6 font-mono">
                    Quantum-resistant encryption • Zero-knowledge proofs • Anonymous operations
                  </p>
                  <div className="flex justify-center space-x-8 text-sm">
                    <a 
                      href="https://docs.zama.ai" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-cyan-400 hover:text-cyan-300 transition-all duration-300 hover:text-neon font-mono group"
                    >
                      <span className="group-hover:animate-pulse">&gt;_ DOCUMENTATION</span>
                    </a>
                    <a 
                      href="https://github.com/zama-ai/fhevm" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-magenta-400 hover:text-magenta-300 transition-all duration-300 hover:text-neon-purple font-mono group"
                    >
                      <span className="group-hover:animate-pulse">&gt;_ GITHUB</span>
                    </a>
                  </div>
                  
                  {/* Glowing line */}
                  <div className="mt-8 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse"></div>
                  
                  {/* Version info */}
                  <div className="mt-4 text-xs text-gray-500 font-mono">
                    SHADOW_OS_v2.1.4 | FHEVM_PROTOCOL | CLASSIFIED_OPERATIONS_ENABLED
                  </div>
                </div>
              </div>
            </footer>
            
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(0, 0, 0, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 255, 255, 0.3)',
                  color: '#00ffff',
                  fontFamily: 'JetBrains Mono, monospace',
                },
              }}
            />
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;