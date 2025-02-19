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

export default function FetchTransfersPage() {
  const router = useRouter();
  // 获取 petId 参数，如果不存在则尝试从 localStorage 读取（请确保在 PetSelection.tsx 中已保存）
  const { petId: queryPetId } = router.query;
  let petIdFinal: string | null = null;
  if (queryPetId && typeof queryPetId === 'string') {
    petIdFinal = queryPetId;
  } else if (typeof window !== 'undefined') {
    petIdFinal = localStorage.getItem("selectedPetId");
  }
  const selectedPet = petIdFinal ? pets.find(pet => pet.id === petIdFinal) : null;
  const petToShow = selectedPet || pets[0];

  const handleTransfer = () => {
    alert("Transfer feature coming soon!");
  };

  return (
    <div className="min-h-screen bg-yellow-100 flex justify-center items-center p-6">
      <div className="flex flex-col md:flex-row items-center bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full">
        {/* 宠物展示区域 */}
        <div className="mb-6 md:mb-0 md:mr-6 flex-shrink-0">
          <Image
            src={petToShow.petImage}
            alt={petToShow.name}
            width={150}
            height={150}
            className="object-contain pixel-font animate-bounce"
          />
        </div>
        {/* 交互区域 */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-center mb-4 pixel-font">Fetch Transfers</h1>
          <div className="mb-6 space-y-4">
            <p className="pixel-font">
              Hey there, Master! Look, your pet {petToShow.name} is right here with you.
            </p>
            <p className="pixel-font">
              I'm ready to assist you with your transfers and any other actions you need. 
            </p>
            <p className="pixel-font">
              Interact with me by clicking the button below.
            </p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleTransfer}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 pixel-font"
            >
              Fetch Transfers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}