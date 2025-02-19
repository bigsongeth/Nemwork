import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';

interface Pet {
  id: 'conservative' | 'aggressive' | 'balanced';
  name: string;
  eggImage: string;
  petImage: string;
  color: string;
  description: string;
}

const pets: Pet[] = [
  {
    id: 'conservative',
    name: 'Conservative',
    eggImage: '/images/egg.jpg',
    petImage: '/images/cat.jpg',
    color: "#7CB9E8",
    description: 'A steady little kitten, focused on stable returns.'
  },
  {
    id: 'aggressive',
    name: 'Aggressive',
    eggImage: '/images/egg.jpg',
    petImage: '/images/fox.jpg',
    color: "#4A3B52",
    description: 'A bold little fox, chasing high-risk, high-reward opportunities.'
  },
  {
    id: 'balanced',
    name: 'Balanced',
    eggImage: '/images/egg.jpg',
    petImage: '/images/dog.jpg',
    color: "#7CB9E8",
    description: 'A balanced little dog, carefully weighing risk and reward.'
  }
];

// Updated: LiquidityPoolCard component styled to mimic PoolsPage card effects
type LiquidityPoolCardProps = {
  tokenPair: string;
  nativeTokens: string;
  assetTokens: string;
  nativeTokenIcon: string;
  assetTokenIcon: string;
  lpTokenAsset: { balance: string } | null;
  assetTokenId: string;
  lpTokenId: string | null;
};

const LiquidityPoolCard: React.FC<LiquidityPoolCardProps> = ({
  tokenPair,
  nativeTokens,
  assetTokens,
  nativeTokenIcon,
  assetTokenIcon,
  lpTokenAsset,
  assetTokenId,
  lpTokenId,
}) => {
  const router = useRouter();

  const onDepositClick = () => {
    // Navigate to deposit page (placeholder route)
    router.push(`/liquidity/add/${assetTokenId}`);
  };

  const onWithdrawClick = () => {
    // Navigate to withdraw page (placeholder route)
    router.push(`/liquidity/remove/${assetTokenId}`);
  };

  // Disable withdraw if no LP token balance
  const isWithdrawDisabled = () => !(lpTokenAsset && parseInt(lpTokenAsset.balance, 10) > 0);

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-6">
      {/* Top row: Token icons & action buttons */}
      <div className="flex gap-2">
        <div className="relative flex basis-2/5 flex-col font-unbounded-variable">
          <div className="relative flex">
            <span>
              <img src={nativeTokenIcon} alt="native icon" width={32} height={32} />
            </span>
            <span className="relative right-2">
              <img src={assetTokenIcon} alt="asset icon" width={32} height={32} />
            </span>
          </div>
          <div className="mt-1 text-lg font-bold text-gray-700">
            {tokenPair}
          </div>
        </div>
        <div className="flex basis-3/5 flex-col items-end justify-end gap-2">
          <button
            onClick={onDepositClick}
            className="group relative bg-pink-500 hover:bg-pink-600 text-white py-1 px-3 rounded text-xs"
          >
            Deposit
          </button>
          <button
            onClick={onWithdrawClick}
            disabled={isWithdrawDisabled()}
            className={`group relative ${
              isWithdrawDisabled() ? 'bg-gray-400' : 'bg-gray-600 hover:bg-gray-700'
            } text-white py-1 px-3 rounded text-xs`}
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* Bottom row: Token information */}
      <div className="flex gap-2">
        <div className="flex basis-1/2 flex-col items-center justify-end">
          <div className="flex flex-col items-start">
            <span className="flex gap-1 text-lg font-medium text-gray-800">
              <img src={nativeTokenIcon} alt="native" width={16} height={16} />
              {nativeTokens}
            </span>
            <span className="flex gap-1 text-lg font-medium text-gray-800">
              <img src={assetTokenIcon} alt="asset" width={16} height={16} />
              {assetTokens}
            </span>
          </div>
          <p className="text-xs font-medium uppercase text-gray-500">
            Total tokens locked
          </p>
        </div>
        <div className="flex basis-1/2 flex-col items-center justify-end text-lg font-medium text-gray-800">
          <span>{lpTokenAsset?.balance ? lpTokenAsset.balance : 0}</span>
          <p className="text-xs font-medium uppercase text-gray-500">LP tokens</p>
        </div>
      </div>
    </div>
  );
};

const NemoPage = () => {
  const router = useRouter();
  const { petId } = router.query;
  const selectedPet =
    petId && typeof petId === 'string'
      ? pets.find(pet => pet.id === petId)
      : null;

  // NEW: Define dummy liquidity pool data to render cards
  const liquidityPools = [
    {
      tokenPair: 'ETH/USDT',
      nativeTokens: 'ETH',
      assetTokens: 'KSM',
      nativeTokenIcon: '/images/polkadot-new-dot-logo.png',
      assetTokenIcon: '/images/Rate Kusama (KSM), Market Cap, Chart.png',
      assetTokenId: 'usdt',
      lpTokenId: 'lp1',
      lpTokenAsset: { balance: "500" },
    },
    {
      tokenPair: 'BTC/ETH',
      nativeTokens: 'BTC',
      assetTokens: 'ETH',
      nativeTokenIcon: '/images/polkadot-new-dot-logo.png',
      assetTokenIcon: '/images/Rate Kusama (KSM), Market Cap, Chart.png',
      assetTokenId: 'eth',
      lpTokenId: 'lp2',
      lpTokenAsset: { balance: "300" },
    },
  ];

  return (
    <div className="min-h-screen bg-egg-yellow relative">
      <Head>
        <title>Nemo - Nemwork</title>
        <meta name="description" content="Nemo - Your Personal Pet Companion" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* 页眉 */}
      <header className="w-full py-6 bg-deep-purple shadow-lg">
        <h1 className="text-5xl font-bold text-egg-yellow text-center title-font">
          Nemwork
        </h1>
      </header>

      {/* 导航按钮 */}
      <div className="flex justify-center my-4 space-x-4">
        <button
          onClick={() => router.push(`/trade?petId=${petId || ''}`)}
          className="bg-purple-500 text-white py-1 px-3 rounded hover:bg-purple-600 pixel-font"
        >
          Trade
        </button>
      </div>

      {/* 页面分为左右两部分 */}
      <div className="container mx-auto p-6 flex flex-col md:flex-row">
        {/* 左侧：NFT Market */}
        <div className="md:w-1/2 flex flex-col items-center border-2 border-blue-500 rounded-lg p-4 bg-[#F5F5DC] shadow-md transition-transform duration-300 hover:scale-105">
          <h2 className="text-2xl font-bold pixel-font mb-4">NFT Market</h2>
          <Image
            src="/images/NFT-Mozaic-logo.jpg" // 确保路径正确
            alt="NFT Mozaic Logo"
            width={200} // 根据需要调整宽度
            height={100} // 根据需要调整高度
            className="object-contain mb-4"
          />
          <div className="flex justify-center items-center mb-6">
            {selectedPet ? (
              <Image
                src={selectedPet.petImage}
                alt={selectedPet.name}
                width={200}
                height={200}
                className="object-contain pixel-font"
              />
            ) : (
              <p className="pixel-font">No pet selected.</p>
            )}
          </div>
          <div className="flex space-x-4 mb-4">
            <button className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded shadow-md pixel-font">
              BUY
            </button>
            <button className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded shadow-md pixel-font">
              SELL
            </button>
          </div>
        </div>

        {/* 右侧：Liquid Pool */}
        <div className="md:w-1/2 flex flex-col gap-4 border-2 border-green-500 rounded-lg p-4 bg-[#F5F5DC] shadow-md">
          <h2 className="text-2xl font-bold pixel-font mb-4">Liquid Pool</h2>
          {
            // NEW: Render a liquidity pool card for each pool in the array
            liquidityPools.map((pool) => (
              <LiquidityPoolCard 
                key={pool.assetTokenId} 
                tokenPair={pool.tokenPair}
                nativeTokens={pool.nativeTokens}
                assetTokens={pool.assetTokens}
                nativeTokenIcon={pool.nativeTokenIcon}
                assetTokenIcon={pool.assetTokenIcon}
                assetTokenId={pool.assetTokenId}
                lpTokenId={pool.lpTokenId}
                lpTokenAsset={pool.lpTokenAsset}
              />
            ))
          }
        </div>
      </div>

      {/* 下方浅灰色框里的 slogan */}
      <div className="fixed bottom-0 w-full flex justify-center">
        <div className="relative w-full h-[150px] rounded-t-[100%] bg-[rgba(211,211,211,0.5)] overflow-hidden">
          <p className="text-center pixel-font text-lg italic mt-4">
            Every Nemo is connected through this Nemwork
          </p>
        </div>
      </div>
    </div>
  );
};

export default NemoPage;