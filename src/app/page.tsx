'use client';

import { useEffect, useState } from 'react';
import FlappyBirdGame from '@/components/FlappyBirdGame';
import { sdk } from '@farcaster/miniapp-sdk';

export default function Home() {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<any>({
    fid: 0,
    username: 'guest',
    displayName: 'Guest Player'
  });

  useEffect(() => {
    // Initialize Farcaster SDK
    const initFarcaster = async () => {
      try {
        // Call sdk.actions.ready() to notify Farcaster that the app is ready
        await sdk.actions.ready();
        
        // Get context if available
        const context = await sdk.context;
        if (context?.user) {
          setUser({
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl,
          });
        }
        
        setIsReady(true);
        console.log('Farcaster SDK initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Farcaster SDK:', error);
        // Fallback for non-Farcaster contexts
        setUser({
          fid: 0,
          username: 'guest',
          displayName: 'Guest Player'
        });
        setIsReady(true);
      }
    };

    initFarcaster();
  }, []);

  const userFid = user?.fid ?? 0;
  const username = user?.username ?? 'guest';
  const pfpUrl = user?.pfpUrl;
  const displayName = user?.displayName ?? username;

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-sky-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐦</div>
          <div className="text-gray-800 text-xl font-bold">Loading Flappy Bird...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-400 via-sky-300 to-sky-200 overflow-x-hidden">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-sky-600 shadow-lg">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative w-full px-4 py-8 md:py-16">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              🎮 Play Flappy Bird!
            </h1>
          {user && (
            <div className="mb-4 flex items-center justify-center space-x-3">
              {pfpUrl && (
                <img 
                  src={pfpUrl} 
                  alt={displayName}
                  className="w-12 h-12 rounded-full border-2 border-white/50"
                />
              )}
              <div className="text-sky-100">
                <div className="font-semibold">Welcome, {displayName}!</div>
                <div className="text-sm opacity-75">@{username}</div>
              </div>
            </div>
          )}
            <p className="text-lg md:text-xl text-sky-50 mb-8 max-w-3xl mx-auto px-4">
              Tap or press Space to flap! Navigate through pipes and earn points. Reach milestone scores to unlock NFT minting!
            </p>
            <div className="flex justify-center items-center space-x-4 flex-wrap gap-2">
            <a 
              href="#game" 
              className="bg-white text-sky-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-sky-50 transition-colors shadow-lg"
            >
              🎮 Play Now
            </a>
            <button
              onClick={() => {
                const shareText = `🐦 Check out Flappy Bird Base - the classic game on Base Network! 🎮\n\nPlay now and mint NFTs with your high score! 🏆\n\nTap to play:`;
                const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(window.location.origin)}`;
                window.open(shareUrl, '_blank');
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-bold text-lg transition-colors shadow-lg flex items-center space-x-2"
            >
              <span>🐸</span>
              <span>Share on Farcaster</span>
            </button>
          </div>
          </div>
        </div>
      </header>

      {/* Interactive Game Section */}
      <section id="game" className="py-20 px-4">
        <div className="container mx-auto">
          <FlappyBirdGame />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white/30">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">
            🌟 Game Features
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white/60 backdrop-blur-lg rounded-xl p-8 text-center hover:bg-white/80 transition-colors">
              <div className="text-5xl mb-4">🥉</div>
              <h3 className="text-2xl font-bold text-sky-700 mb-4">Bronze</h3>
              <p className="text-gray-700 font-semibold mb-2">Score: 10+</p>
              <p className="text-gray-600">
                Start your collection with a bronze bird NFT
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-lg rounded-xl p-8 text-center hover:bg-white/80 transition-colors">
              <div className="text-5xl mb-4">🥈</div>
              <h3 className="text-2xl font-bold text-sky-700 mb-4">Silver</h3>
              <p className="text-gray-700 font-semibold mb-2">Score: 25+</p>
              <p className="text-gray-600">
                Unlock the silver tier with skilled gameplay
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-lg rounded-xl p-8 text-center hover:bg-white/80 transition-colors">
              <div className="text-5xl mb-4">🥇</div>
              <h3 className="text-2xl font-bold text-sky-700 mb-4">Gold</h3>
              <p className="text-gray-700 font-semibold mb-2">Score: 50+</p>
              <p className="text-gray-600">
                Master the game and earn gold bird NFTs
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-lg rounded-xl p-8 text-center hover:bg-white/80 transition-colors">
              <div className="text-5xl mb-4">💎</div>
              <h3 className="text-2xl font-bold text-sky-700 mb-4">Legendary</h3>
              <p className="text-gray-700 font-semibold mb-2">Score: 100+</p>
              <p className="text-gray-600">
                The ultimate achievement for true champions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Base Network Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-8">
            ⚡ Powered by Base
          </h2>
          <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto">
            Built on Base, Coinbase&apos;s secure, low-cost, developer-friendly Ethereum L2. 
            Enjoy fast transactions and minimal fees while playing and minting NFTs!
          </p>
          <div className="flex justify-center space-x-8 items-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">⚡</div>
              <div className="text-gray-800 font-semibold">Fast</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">💰</div>
              <div className="text-gray-800 font-semibold">Low Cost</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">🔒</div>
              <div className="text-gray-800 font-semibold">Secure</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sky-900/40 py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="text-3xl mb-4">🐦</div>
          <p className="text-gray-700 mb-4">
            Flappy Bird Base - A Classic Game on Base Network
          </p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-sky-700 hover:text-sky-600 transition-colors font-semibold">
              GitHub
            </a>
            <a href="#" className="text-sky-700 hover:text-sky-600 transition-colors font-semibold">
              Farcaster
            </a>
            <a href="#" className="text-sky-700 hover:text-sky-600 transition-colors font-semibold">
              Base
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
