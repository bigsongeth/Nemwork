import React, { useEffect, useState } from 'react';
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

  const [dialog, setDialog] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (userInput.trim() !== '') {
      setDialog((prev) => prev + `\nYou: ${userInput}\n`);
      setIsLoading(true);
      
      try {
        const response = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: userInput }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setDialog((prev) => prev + `\nAI: ${data.response}\n`);
      } catch (error) {
        console.error('Error:', error);
        setDialog((prev) => prev + `\nError: Failed to get AI response\n`);
      } finally {
        setIsLoading(false);
      }
      
      setUserInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  useEffect(() => {
    const fullDialog = "Hello! I'm your AI Agent. Let's get started!";
    let index = 0;

    const interval = setInterval(() => {
      if (index < fullDialog.length) {
        setDialog(prev => prev + fullDialog[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

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
          {selectedPet && (
            <Image
              src={selectedPet.petImage}
              alt={selectedPet.name}
              width={200}
              height={200}
              className="object-contain pixel-font mb-4"
            />
          )}
          <div className="border border-gray-300 rounded-lg p-4 w-full h-48 overflow-y-auto">
            <p className="pixel-font whitespace-pre-wrap">{dialog}</p>
            {isLoading && <div className="text-gray-500 pixel-font">AI is thinking...</div>}
          </div>
          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="mt-2 border border-gray-300 p-2 rounded w-full pixel-font"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            className="mt-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 pixel-font"
            disabled={isLoading}
          >
            Send
          </button>
        </div>

        {/* 右侧：merkle-trade.jpg 图片 */}
        <div className="md:w-1/2 flex justify-center items-center">
          <Image
            src="/images/merkle-trade.jpg"
            alt="Merkle Trade"
            width={400}
            height={300}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default AIAgentPage; 