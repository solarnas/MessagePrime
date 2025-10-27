import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEffect, useState } from 'react';

export const Header = () => {
  const [glitchText, setGlitchText] = useState("CONFIDENTIAL");
  // const [currentTime, setCurrentTime] = useState(new Date());

  // useEffect(() => {
  //   // Update time every second
  //   const timer = setInterval(() => setCurrentTime(new Date()), 1000);
  //   return () => clearInterval(timer);
  // }, []);

  useEffect(() => {
    // Glitch effect for title
    const glitchWords = ["CONFIDENTIAL", "C0NF1D3NT1AL", "CØNF¡DØNT¡ÄL", "CONFIDENTIAL"];
    let index = 0;
    
    const glitchTimer = setInterval(() => {
      setGlitchText(glitchWords[index % glitchWords.length]);
      index++;
    }, 2000);

    return () => clearInterval(glitchTimer);
  }, []);

  return (
    <header className="glass-strong border-b border-cyan-500/30 relative overflow-hidden">
      {/* Animated scan line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-6">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              {/* Animated Logo */}
              <div className="relative">
                <div className="w-12 h-12 border-2 border-cyan-400 rounded-lg bg-gradient-to-br from-cyan-400/20 to-magenta-400/20 flex items-center justify-center animate-float">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-magenta-400 rounded mask-hexagon animate-pulse"></div>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-magenta-400 rounded-lg blur opacity-30 animate-pulse"></div>
              </div>
              
              {/* Title with glitch effect */}
              <div>
                <h1 className="text-3xl font-cyber font-bold relative">
                  <span className="text-neon animate-glow">{glitchText}</span>{' '}
                  <span className="text-neon-purple">TRADE</span>
                  
                  {/* Glitch overlay */}
                  <span className="absolute inset-0 text-red-500 opacity-0 animate-pulse" style={{
                    clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
                    animation: 'glitch 0.3s infinite linear alternate-reverse'
                  }}>
                    {glitchText} TRADE
                  </span>
                </h1>
                <div className="text-sm text-gray-400 font-mono tracking-wider">
                  <span className="text-cyan-400">&gt;_</span> ANONYMOUS SHADOW OPERATING SYSTEM
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="hidden lg:flex items-center space-x-4 ml-8">
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full glass border border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-xs font-mono">FHE_PROTOCOL_ONLINE</span>
              </div>
              <div className="text-xs font-mono text-gray-400">
               
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Security Level Indicator */}
           
            {/* Connect Button with custom styling */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-magenta-400 rounded-lg blur opacity-30"></div>
              <div className="relative">
                <ConnectButton />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom scan line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-magenta-400 to-transparent animate-pulse" style={{animationDelay: '1s'}}></div>
      
      <style>{`
        .mask-hexagon {
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }
        
        @keyframes glitch {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
            opacity: 0;
          }
          20%, 24%, 55% {
            opacity: 0.2;
            transform: translate3d(-2px, 0, 0);
          }
          22% {
            opacity: 0.2;
            transform: translate3d(2px, 0, 0);
          }
        }
      `}</style>
    </header>
  );
};