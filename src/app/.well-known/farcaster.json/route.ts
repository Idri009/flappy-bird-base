import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    accountAssociation: {
      header: 'eyJmaWQiOjE5Mjk5NSwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDlBNzc3MUE4NkM4RGM0NUJlM2VCNEQ1MEU2QTk0NzEwNjA0NDBlNjEifQ',
      payload: 'eyJkb21haW4iOiJmbGFwcHktYmlyZC1iYXNlLnZlcmNlbC5hcHAifQ',
      signature: 'KnEb4qjBb59+ZF2YGpvmZ4a1bIoTC/R5SIEX1TkMvlkorXvHFQKDHsz4WromHu6NJnOAeImxp+Gq8SOKxTo+Nhw=',
    },
    miniapp: {
      version: '1',
      name: 'Flappy Bird Base',
      iconUrl: 'https://flappy-bird-base.vercel.app/images/icon.png',
      homeUrl: 'https://flappy-bird-base.vercel.app',
      splashImageUrl: 'https://flappy-bird-base.vercel.app/images/splash.png',
      splashBackgroundColor: '#87CEEB',
      subtitle: 'Classic game on Base Network',
      description: 'Play the classic Flappy Bird game and mint NFTs based on your score. Navigate through pipes, earn points, and unlock achievement NFTs on Base.',
      screenshotUrls: [
        'https://flappy-bird-base.vercel.app/images/screenshot1.png',
        'https://flappy-bird-base.vercel.app/images/screenshot2.png',
        'https://flappy-bird-base.vercel.app/images/screenshot3.png',
      ],
      primaryCategory: 'games',
      tags: ['game', 'nft', 'base', 'blockchain', 'arcade'],
      heroImageUrl: 'https://flappy-bird-base.vercel.app/images/hero.png',
      tagline: 'Flap, score, mint NFTs on Base',
      ogTitle: 'Flappy Bird Base',
      ogDescription: 'Play Flappy Bird and mint NFTs based on your score on Base Network',
      ogImageUrl: 'https://flappy-bird-base.vercel.app/images/og-image.png',
      requiredChains: ['eip155:8453'],
      requiredCapabilities: ['actions.signIn', 'wallet.getEthereumProvider'],
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
