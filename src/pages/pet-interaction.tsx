import React, { useState } from 'react';
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

export default function PetInteractionPage() {
  const [dialogStep, setDialogStep] = useState<number>(1);
  const [petName, setPetName] = useState<string>('');
  const [socialName, setSocialName] = useState<string>('');

  const router = useRouter();
  const { petId } = router.query;
  // 根据 petId 查找选中宠物，如果不存在则返回 null
  const selectedPet = petId && typeof petId === 'string'
    ? pets.find(pet => pet.id === petId)
    : null;

  const nextStep = () => {
    // Check required input for steps 3 and 6
    if (dialogStep === 3 && petName.trim() === '') {
      alert("Please give me a name!");
      return;
    }
    if (dialogStep === 6 && socialName.trim() === '') {
      alert("Please enter your Tako/Farcaster username!");
      return;
    }
    setDialogStep(dialogStep + 1);
  };

  return (
    <div className="min-h-screen bg-yellow-100 flex justify-center items-center p-6">
      <div className="flex flex-col md:flex-row items-center bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full">
        {/* 宠物展示区域 */}
        <div className="mb-6 md:mb-0 md:mr-6 flex-shrink-0">
          <Image
            src={selectedPet?.petImage}
            alt={selectedPet?.name}
            width={150}
            height={150}
            className="object-contain pixel-font animate-bounce"
          />
        </div>
        {/* 对话区域 */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-center mb-4 pixel-font">Nemo's Chat</h1>
          <div className="mb-4 space-y-3">
            {dialogStep === 1 && (
              <p className="pixel-font">
                Hey there, Master! Look, your pet {selectedPet?.name} is right here with you.
              </p>
            )}
            {dialogStep === 2 && (
              <p className="pixel-font">From now on, I'll be with you, whether you're just chilling or Trump is tweeting again~</p>
            )}
            {dialogStep === 3 && (
              <>
                <p className="pixel-font">Now, how about giving me a name? That way, you can call me better!</p>
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="Enter pet name"
                  className="mt-2 border border-gray-300 p-2 rounded w-full pixel-font"
                />
              </>
            )}
            {dialogStep === 4 && (
              <p className="pixel-font">
                Yay! My name is <span className="font-bold">{petName}</span>! I love it, especially since you gave it to me.
              </p>
            )}
            {dialogStep === 5 && (
              <p className="pixel-font">Next, tell me a bit about yourself so we can stay connected on social media.</p>
            )}
            {dialogStep === 6 && (
              <>
                <p className="pixel-font">What's your Tako/Farcaster username?</p>
                <input
                  type="text"
                  value={socialName}
                  onChange={(e) => setSocialName(e.target.value)}
                  placeholder="Enter your username"
                  className="mt-2 border border-gray-300 p-2 rounded w-full pixel-font"
                />
              </>
            )}
            {dialogStep === 7 && (
              <p className="pixel-font">Got it! I'll remember that. Now, let's start chatting!</p>
            )}
          </div>
          <div className="flex justify-center">
            {dialogStep < 7 ? (
              <button
                onClick={nextStep}
                className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 pixel-font"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => router.push("/fetch-transfers")}
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 pixel-font"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 