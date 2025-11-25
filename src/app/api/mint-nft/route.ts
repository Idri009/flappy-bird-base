import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, createWalletClient, custom } from 'viem';
import { base } from 'viem/chains';

const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as `0x${string}`;

// NFT Contract ABI (minimal - just the mint function)
const NFT_ABI = [
  {
    inputs: [
      { name: 'sessionId', type: 'bytes32' },
      { name: 'score', type: 'uint256' },
      { name: 'gameTime', type: 'uint256' },
      { name: 'jumps', type: 'uint256' },
    ],
    name: 'mintFlappyBirdNFT',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'score', type: 'uint256' }],
    name: 'getTierForScore',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'pure',
    type: 'function',
  },
] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, score, gameTime, jumps } = body;

    // Validate inputs
    if (!sessionId || score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (score < 10) {
      return NextResponse.json(
        { error: 'Score must be at least 10 to mint NFT' },
        { status: 400 }
      );
    }

    if (!NFT_CONTRACT_ADDRESS) {
      // Return mock response for testing when contract is not deployed
      const getTier = (score: number) => {
        if (score >= 100) return 'Legendary';
        if (score >= 50) return 'Gold';
        if (score >= 25) return 'Silver';
        if (score >= 10) return 'Bronze';
        return 'None';
      };

      return NextResponse.json({
        success: false,
        error: 'NFT contract not deployed yet',
        message: 'Please deploy the NFT contract and set NEXT_PUBLIC_NFT_CONTRACT_ADDRESS in environment variables',
        tier: getTier(score),
        score,
        instructions: [
          '1. Add PRIVATE_KEY to .env.local',
          '2. Run: npm run deploy:base-sepolia',
          '3. Copy contract address to .env.local and Vercel',
          '4. Redeploy the app'
        ]
      }, { status: 503 });
    }

    // Create public client for reading
    const publicClient = createPublicClient({
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
    });

    // Get tier for the score
    const tier = await publicClient.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: NFT_ABI,
      functionName: 'getTierForScore',
      args: [BigInt(score)],
    });

    // Return minting information
    // In production, you'd integrate with Farcaster wallet or use Coinbase SDK
    return NextResponse.json({
      success: true,
      tier,
      score,
      contractAddress: NFT_CONTRACT_ADDRESS,
      mintPrice: '0.0001',
      message: 'Ready to mint! Connect your Farcaster wallet to complete the transaction.',
      // Include transaction data for the client to execute
      txData: {
        to: NFT_CONTRACT_ADDRESS,
        value: '100000000000000', // 0.0001 ETH in wei
        data: {
          sessionId,
          score,
          gameTime: gameTime || Math.floor(Date.now() / 1000),
          jumps: jumps || 0,
        },
      },
    });
  } catch (error: any) {
    console.error('Mint NFT error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process mint request' },
      { status: 500 }
    );
  }
}
