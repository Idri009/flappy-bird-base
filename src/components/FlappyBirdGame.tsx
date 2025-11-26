'use client';

import { useEffect, useRef, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface GameState {
  bird: {
    y: number;
    velocity: number;
  };
  pipes: Array<{
    x: number;
    gapY: number;
  }>;
  score: number;
  gameOver: boolean;
  gameStarted: boolean;
}

export default function FlappyBirdGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    bird: { y: 250, velocity: 0 },
    pipes: [],
    score: 0,
    gameOver: false,
    gameStarted: false,
  });
  const [highScore, setHighScore] = useState(0);
  const [showMintModal, setShowMintModal] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const gameLoopRef = useRef<number>();

  // Game constants
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 600;
  const BIRD_SIZE = 30;
  const PIPE_WIDTH = 60;
  const PIPE_GAP = 180;
  const GRAVITY = 0.4;
  const JUMP_STRENGTH = -8;
  const PIPE_SPEED = 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawGame = () => {
      // Clear canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#E0F6FF');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(100, 100, 40, 0, Math.PI * 2);
      ctx.arc(130, 100, 50, 0, Math.PI * 2);
      ctx.arc(160, 100, 40, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(300, 180, 35, 0, Math.PI * 2);
      ctx.arc(325, 180, 45, 0, Math.PI * 2);
      ctx.arc(350, 180, 35, 0, Math.PI * 2);
      ctx.fill();

      // Draw bird
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(80, gameState.bird.y, BIRD_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();

      // Bird eye
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(90, gameState.bird.y - 5, 4, 0, Math.PI * 2);
      ctx.fill();

      // Bird beak (rostrum) - more precise triangle
      ctx.fillStyle = '#FF6347';
      ctx.beginPath();
      ctx.moveTo(80 + BIRD_SIZE / 2, gameState.bird.y - 4);
      ctx.lineTo(80 + BIRD_SIZE / 2 + 12, gameState.bird.y);
      ctx.lineTo(80 + BIRD_SIZE / 2, gameState.bird.y + 4);
      ctx.closePath();
      ctx.fill();

      // Draw pipes
      gameState.pipes.forEach((pipe) => {
        // Top pipe
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
        ctx.strokeStyle = '#1B5E20';
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);

        // Top pipe cap
        ctx.fillStyle = '#388E3C';
        ctx.fillRect(pipe.x - 5, pipe.gapY - 20, PIPE_WIDTH + 10, 20);
        ctx.strokeRect(pipe.x - 5, pipe.gapY - 20, PIPE_WIDTH + 10, 20);

        // Bottom pipe
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - pipe.gapY - PIPE_GAP);
        ctx.strokeRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - pipe.gapY - PIPE_GAP);

        // Bottom pipe cap
        ctx.fillStyle = '#388E3C';
        ctx.fillRect(pipe.x - 5, pipe.gapY + PIPE_GAP, PIPE_WIDTH + 10, 20);
        ctx.strokeRect(pipe.x - 5, pipe.gapY + PIPE_GAP, PIPE_WIDTH + 10, 20);
      });

      // Draw score
      ctx.fillStyle = '#000';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(gameState.score.toString(), CANVAS_WIDTH / 2, 60);

      // Draw high score
      ctx.font = '16px Arial';
      ctx.fillText(`High: ${highScore}`, CANVAS_WIDTH / 2, 90);

      // Draw start message
      if (!gameState.gameStarted && !gameState.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, CANVAS_HEIGHT / 2 - 60, CANVAS_WIDTH, 120);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('Click or Press SPACE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
        ctx.font = '18px Arial';
        ctx.fillText('to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
      }

      // Draw game over
      if (gameState.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, CANVAS_HEIGHT / 2 - 80, CANVAS_WIDTH, 160);
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 32px Arial';
        ctx.fillText('Game Over!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${gameState.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
        ctx.font = '16px Arial';
        ctx.fillText('Click to Restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
      }
    };

    drawGame();
  }, [gameState, highScore]);

  useEffect(() => {
    if (!gameState.gameStarted || gameState.gameOver) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }

    const gameLoop = () => {
      setGameState((prev) => {
        // Update bird position
        const newVelocity = prev.bird.velocity + GRAVITY;
        const newY = prev.bird.y + newVelocity;

        // Check ground and ceiling collision
        if (newY > CANVAS_HEIGHT - BIRD_SIZE / 2 || newY < BIRD_SIZE / 2) {
          return { ...prev, gameOver: true };
        }

        // Update pipes
        let newPipes = prev.pipes.map((pipe) => ({
          ...pipe,
          x: pipe.x - PIPE_SPEED,
        }));

        // Remove off-screen pipes and add score
        let newScore = prev.score;
        newPipes = newPipes.filter((pipe) => {
          if (pipe.x + PIPE_WIDTH < 0) {
            newScore++;
            return false;
          }
          return true;
        });

        // Add new pipe
        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < CANVAS_WIDTH - 250) {
          newPipes.push({
            x: CANVAS_WIDTH,
            gapY: Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50,
          });
        }

        // Check collision with pipes
        const birdLeft = 80 - BIRD_SIZE / 2;
        const birdRight = 80 + BIRD_SIZE / 2;
        const birdTop = newY - BIRD_SIZE / 2;
        const birdBottom = newY + BIRD_SIZE / 2;

        for (const pipe of newPipes) {
          const pipeLeft = pipe.x;
          const pipeRight = pipe.x + PIPE_WIDTH;

          if (birdRight > pipeLeft && birdLeft < pipeRight) {
            if (birdTop < pipe.gapY || birdBottom > pipe.gapY + PIPE_GAP) {
              return { ...prev, gameOver: true };
            }
          }
        }

        return {
          ...prev,
          bird: { y: newY, velocity: newVelocity },
          pipes: newPipes,
          score: newScore,
        };
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.gameStarted, gameState.gameOver]);

  useEffect(() => {
    if (gameState.gameOver && gameState.score > highScore) {
      setHighScore(gameState.score);

      // Show mint modal if score qualifies (3+)
      if (gameState.score >= 3) {
        setShowMintModal(true);
      }
    }
  }, [gameState.gameOver, gameState.score, highScore]);

  const jump = () => {
    if (gameState.gameOver) {
      // Restart game
      setGameState({
        bird: { y: 250, velocity: 0 },
        pipes: [],
        score: 0,
        gameOver: false,
        gameStarted: true,
      });
      setShowMintModal(false);
    } else if (!gameState.gameStarted) {
      // Start game
      setGameState((prev) => ({
        ...prev,
        gameStarted: true,
        bird: { ...prev.bird, velocity: JUMP_STRENGTH },
      }));
    } else {
      // Jump
      setGameState((prev) => ({
        ...prev,
        bird: { ...prev.bird, velocity: JUMP_STRENGTH },
      }));
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.gameOver, gameState.gameStarted]);

  const handleMintNFT = async () => {
    setIsMinting(true);
    try {
      // Get Ethereum provider from Farcaster
      const provider = await sdk.wallet.getEthereumProvider();
      
      if (!provider) {
        alert('❌ Please connect your Farcaster wallet first');
        setIsMinting(false);
        return;
      }

      // Request account access
      const accounts = await provider.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];
      
      if (!accounts || accounts.length === 0) {
        alert('❌ No wallet account found');
        setIsMinting(false);
        return;
      }

      const userAddress = accounts[0];

      // Get contract address and prepare transaction
      const contractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as `0x${string}` | undefined;
      
      if (!contractAddress) {
        alert('❌ NFT contract not deployed yet. Please contact the developer.');
        setIsMinting(false);
        return;
      }

      // Generate unique session ID
      const sessionId = `0x${Date.now().toString(16)}${Math.floor(Math.random() * 1000000).toString(16).padStart(8, '0')}` as `0x${string}`;
      const score = gameState.score;
      const gameTime = Math.floor(Date.now() / 1000);
      const jumps = 0;

      // Encode function call data
      // mintFlappyBirdNFT(bytes32 sessionId, uint256 score, uint256 gameTime, uint256 jumps)
      const functionSignature = '0x8c5e3a7d'; // keccak256('mintFlappyBirdNFT(bytes32,uint256,uint256,uint256)').slice(0, 10)
      const encodedData = `${functionSignature}${sessionId.slice(2).padStart(64, '0')}${score.toString(16).padStart(64, '0')}${gameTime.toString(16).padStart(64, '0')}${jumps.toString(16).padStart(64, '0')}` as `0x${string}`;

      // Send transaction
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: userAddress,
          to: contractAddress,
          value: '0x5AF3107A4000', // 0.0001 ETH in hex
          data: encodedData,
        }],
      }) as string;

      alert(`🎉 Transaction submitted!\n\nTx Hash: ${txHash}\n\nYour NFT will be minted shortly. Check your wallet!`);
      setShowMintModal(false);
      
    } catch (error: any) {
      console.error('Minting error:', error);
      
      if (error.code === 4001) {
        alert('❌ Transaction rejected by user');
      } else if (error.message?.includes('insufficient funds')) {
        alert('❌ Insufficient funds. You need at least 0.0001 ETH + gas fees.');
      } else {
        alert(`❌ Error: ${error.message || 'Failed to mint NFT'}`);
      }
    } finally {
      setIsMinting(false);
    }
  };

  const getTierForScore = (score: number) => {
    if (score >= 40) return { name: 'Legendary', emoji: '💎', color: 'purple' };
    if (score >= 20) return { name: 'Gold', emoji: '🥇', color: 'yellow' };
    if (score >= 10) return { name: 'Silver', emoji: '🥈', color: 'gray' };
    if (score >= 3) return { name: 'Bronze', emoji: '🥉', color: 'orange' };
    return { name: 'None', emoji: '❌', color: 'red' };
  };

  const tier = getTierForScore(gameState.score);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 mb-8">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onClick={jump}
          className="border-4 border-sky-600 rounded-lg cursor-pointer"
        />

        <div className="mt-6 text-center">
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="bg-sky-100 rounded-lg p-4">
              <div className="text-sm text-gray-600">Current Score</div>
              <div className="text-3xl font-bold text-sky-700">{gameState.score}</div>
            </div>
            <div className="bg-purple-100 rounded-lg p-4">
              <div className="text-sm text-gray-600">High Score</div>
              <div className="text-3xl font-bold text-purple-700">{highScore}</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-sky-100 to-blue-100 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Current Tier</div>
            <div className="text-2xl font-bold">
              {tier.emoji} {tier.name}
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p>🎮 Click canvas or press SPACE to flap</p>
            <p className="mt-1">🏆 Reach 3 points to mint NFT!</p>
          </div>
        </div>
      </div>

      {/* NFT Tier Progress */}
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">NFT Tier Requirements</h3>
        <div className="grid grid-cols-4 gap-3">
          <div className={`p-4 rounded-lg text-center ${gameState.score >= 3 ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}>
            <div className="text-2xl mb-1">🥉</div>
            <div className="font-semibold text-sm">Bronze</div>
            <div className="text-xs mt-1">3+ pts</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${gameState.score >= 10 ? 'bg-gray-400 text-white' : 'bg-gray-100'}`}>
            <div className="text-2xl mb-1">🥈</div>
            <div className="font-semibold text-sm">Silver</div>
            <div className="text-xs mt-1">10+ pts</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${gameState.score >= 20 ? 'bg-yellow-500 text-white' : 'bg-gray-100'}`}>
            <div className="text-2xl mb-1">🥇</div>
            <div className="font-semibold text-sm">Gold</div>
            <div className="text-xs mt-1">20+ pts</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${gameState.score >= 40 ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}>
            <div className="text-2xl mb-1">💎</div>
            <div className="font-semibold text-sm">Legendary</div>
            <div className="text-xs mt-1">40+ pts</div>
          </div>
        </div>
      </div>

      {/* Mint NFT Modal */}
      {showMintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-3xl font-bold text-center mb-4">🎉 Congratulations!</h2>
            <p className="text-center text-gray-700 mb-6">
              You scored <span className="font-bold text-2xl text-sky-600">{gameState.score}</span> points!
            </p>

            <div className="bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl p-6 mb-6">
              <div className="text-center">
                <div className="text-6xl mb-3">{tier.emoji}</div>
                <div className="text-2xl font-bold text-gray-800">{tier.name} Tier</div>
                <div className="text-sm text-gray-600 mt-2">Mint your achievement as an NFT!</div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleMintNFT}
                disabled={isMinting}
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isMinting ? '⏳ Minting...' : '🎨 Mint NFT (0.0001 ETH)'}
              </button>

              <button
                onClick={() => setShowMintModal(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 px-6 rounded-xl transition-all"
              >
                Maybe Later
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              NFT will be minted to your Farcaster wallet on Base Network
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
