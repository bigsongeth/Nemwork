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

const NemoPage = () => {
  const router = useRouter();
  const { petId } = router.query;
  const selectedPet =
    petId && typeof petId === 'string'
      ? pets.find(pet => pet.id === petId)
      : null;

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
          onClick={() => {}}
          className="bg-gray-300 text-gray-700 py-1 px-3 rounded pixel-font"
        >
          Nemo
        </button>
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
        <div className="md:w-1/2 flex flex-col items-center border-2 border-green-500 rounded-lg p-4 bg-[#F5F5DC] shadow-md transition-transform duration-300 hover:scale-105">
          <h2 className="text-2xl font-bold pixel-font mb-4">Liquid Pool</h2>
          <Image
            src="/images/liquid-pool.jpg" // 确保路径正确
            alt="Liquid Pool"
            width={400} // 根据需要调整宽度
            height={300} // 根据需要调整高度
            className="object-contain"
          />
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