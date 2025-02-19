import React from 'react';
import { useRouter } from 'next/router';
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

const AIAgentPage = () => {
  const router = useRouter();
  const { petId } = router.query;
  const selectedPet =
    petId && typeof petId === 'string'
      ? pets.find(pet => pet.id === petId)
      : null;

  return (
    <div className="min-h-screen bg-egg-yellow relative">
      <header className="w-full py-6 bg-deep-purple shadow-lg">
        <h1 className="text-5xl font-bold text-egg-yellow text-center title-font">
          Nemwork
        </h1>
      </header>

      {/* 导航按钮 */}
      <div className="flex justify-center my-4 space-x-4">
        <button 
          onClick={() => router.push(`/nemo?petId=${petId || ''}`)}
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

      <div className="container mx-auto p-6 flex flex-col md:flex-row">
        {/* 左侧：宠物展示及对话框 */}
        <div className="md:w-1/2 flex flex-col items-center border-2 border-blue-500 rounded-lg p-4 bg-[#F5F5DC] shadow-md">
          <h2 className="text-2xl font-bold pixel-font mb-4">Your Pet</h2>
          {selectedPet ? (
            <Image
              src={selectedPet.petImage}
              alt={selectedPet.name}
              width={200}
              height={200}
              className="object-contain pixel-font mb-4"
            />
          ) : (
            <p className="pixel-font">No pet selected.</p>
          )}
          <div className="flex flex-col items-center">
            <p className="pixel-font">Hello! I'm your AI Agent.</p>
            <p className="pixel-font">Let's get started!</p>
          </div>
        </div>

        {/* 右侧：merkle-trade.jpg 图片 */}
        <div className="md:w-1/2 flex justify-center items-center">
          <Image
            src="/images/merkle-trade.jpg" // 确保路径正确
            alt="Merkle Trade"
            width={400} // 根据需要调整宽度
            height={300} // 根据需要调整高度
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default AIAgentPage; 