import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { MerkleClient, MerkleClientConfig } from '@merkletrade/ts-sdk';
import PriceFeedCard, { PriceFeedData } from '@/components/PriceFeedCard';

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

// 添加OKX钱包类型声明
declare global {
  interface Window {
    okxwallet: any;
  }
}

const TradePage = () => {
  const router = useRouter();
  const { petId } = router.query;
  const selectedPet =
    petId && typeof petId === 'string'
      ? pets.find((pet) => pet.id === petId)
      : null;

  const [okxAccount, setOkxAccount] = useState<any>(null);
  const [feedData, setFeedData] = useState<PriceFeedData[]>([]);
  const priceFeedContainerRef = useRef<HTMLDivElement>(null);

  const connectOkxWallet = async () => {
    if (typeof window !== "undefined" && window.okxwallet) {
      try {
        // 启用 OKX 钱包扩展
        const accounts = await window.okxwallet.enable();
        if (accounts && accounts.length > 0) {
          setOkxAccount(accounts[0]);
          
          // 将钱包地址保存到后端
          try {
            const response = await fetch('/api/save-wallet', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ address: accounts[0] }),
            });
            
            if (!response.ok) {
              throw new Error('Failed to save wallet address');
            }
          } catch (error) {
            console.error("Failed to save wallet address:", error);
          }
        }
      } catch (error) {
        console.error("Failed to connect OKX Wallet:", error);
        alert("Failed to connect OKX Wallet, please try again.");
      }
    } else {
      alert("No OKX wallet detected. Please install the OKX Wallet extension.");
    }
  };

  const createAIAgent = () => {
    alert('Creating AI Agent...');
    router.push('/ai-agent?petId=' + petId); // 跳转到新页面
  };

  useEffect(() => {
    // Only subscribe if petId exists
    if (!router.query.petId) return;

    async function subscribePriceFeed() {
      try {
        const config = await MerkleClientConfig.testnet();
        const merkle = new MerkleClient(config);
        const session = await merkle.connectWsApi();
        console.log("Connected to WebSocket API", session);
        const priceFeedIterator = session.subscribePriceFeed("BTC_USD");
        console.log("Subscribed to BTC_USD price feed");

        // Iterate over each feed item
        for await (const feed of priceFeedIterator) {
          console.log("Received feed:", feed);
          setFeedData(prev => [feed, ...prev]);
        }
      } catch (error) {
        console.error("Failed to subscribe to BTC_USD price feed:", error);
      }
    }

    subscribePriceFeed();
  }, [router.query.petId]);

  useEffect(() => {
    if (priceFeedContainerRef.current) {
      priceFeedContainerRef.current.scrollTop = priceFeedContainerRef.current.scrollHeight;
    }
  }, [feedData]);

  return (
    <div className="min-h-screen bg-egg-yellow relative">
      <Head>
        <title>Trade - Nemwork</title>
        <meta name="description" content="Trade your assets on Aptos network" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      </Head>

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

      {/* 主体区域 */}
      <div className="container mx-auto p-6 flex flex-col md:flex-row items-center">
        {/* 左侧：钱包连接按钮 */}
        <div className="md:w-1/2 flex flex-col justify-center items-start mb-6 md:mb-0">
          <div className="mb-8">
            {!okxAccount ? (
              <button
                onClick={connectOkxWallet}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-800 text-white rounded shadow-md pixel-font"
              >
                Connect OKX Wallet
              </button>
            ) : (
              <p className="pixel-font">
                Connected: {okxAccount.address || okxAccount}
              </p>
            )}
          </div>
          {okxAccount && (
            <>
              <button
                onClick={createAIAgent}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-800 text-white rounded shadow-md pixel-font mb-2"
              >
                Create AI Agent
              </button>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="syncPetInfo"
                  defaultChecked
                  className="mr-2"
                />
                <label htmlFor="syncPetInfo" className="pixel-font">
                  Sync Selected Nemo Pet Information
                </label>
              </div>
            </>
          )}
        </div>

        {/* 右侧：流式价格信息卡片 */}
        <div className="md:w-1/2 flex justify-center items-center mb-6 md:mb-0">
          <div
            className="bg-white p-4 shadow-lg rounded-lg"
            style={{ height: '480px', width: '100%' }} // Fixed height for approx. 4 cards
          >
            <div ref={priceFeedContainerRef} className="overflow-y-auto h-full">
              {feedData.length > 0 ? (
                feedData.map((feed, idx) => (
                  <PriceFeedCard key={idx} data={feed} />
                ))
              ) : (
                <p>Loading BTC/USD price feed...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradePage; 