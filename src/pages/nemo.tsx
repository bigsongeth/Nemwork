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

      {/* 导航按钮移动到 header 下方居中显示 */}
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

      {/* 主体区域 */}
      <div className="container mx-auto p-6 flex flex-col items-center">
        {/* 左侧：显示用户选中的宠物 */}
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

        {/* 右侧：标语和交易按钮 */}
        <div className="flex flex-col justify-center items-center p-4">
          <div className="my-8 w-full text-center">
            <p className="text-3xl italic font-bold pixel-font">
              Every Nemo is connected through this Nemwork
            </p>
          </div>
          <div className="flex space-x-4">
            <button className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded shadow-md pixel-font">
              BUY
            </button>
            <button className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded shadow-md pixel-font">
              SELL
            </button>
          </div>
        </div>
      </div>

      {/* 底部半圆形区域 */}
      <div className="fixed bottom-0 w-full flex justify-center">
        <div className="relative w-full h-[200px] rounded-t-[100%] bg-[rgba(211,211,211,0.5)] overflow-hidden">
          {/* 删除动物 emoji */}
        </div>
      </div>
    </div>
  );
};

export default NemoPage;