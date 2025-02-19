import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useWallet } from '@/contexts/WalletContext';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3FromSource, web3Enable } from '@polkadot/extension-dapp';
import Stepper, { Step } from 'src/components/Stepper.tsx';

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
  // State for controlling the Stepper modal and wallet signature steps
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [mintingStep, setMintingStep] = useState<number>(1);
  // Store the created NFT collection ID after first signature
  const [createdCollectionId, setCreatedCollectionId] = useState<string>("");
  // Control the visibility of the Stepper modal
  const [showStepper, setShowStepper] = useState<boolean>(false);

  const router = useRouter();
  const { petId } = router.query;
  const { wallet } = useWallet();
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

  // Remove the previous automatic handleDone.
  // Instead, when the Done button is clicked, we show the Stepper modal:
  const openStepper = () => {
    setShowStepper(true);
    setMintingStep(1); // initial step: Pet Born
  };

  // First wallet signature: Create NFT collection. Returns the created collection ID.
  const signCreateNFT = async (): Promise<string> => {
    if (!wallet) {
      throw new Error("Wallet not connected or wallet meta is missing.");
    }
    // Enable the wallet extension (if not already done)
    const extensions = await web3Enable("MyDApp");
    if (extensions.length === 0) {
      throw new Error("No wallet extension found, please install SubWallet or another compatible extension.");
    }
    const wsProvider = new WsProvider('wss://asset-hub-paseo-rpc.dwellir.com');
    const api = await ApiPromise.create({ provider: wsProvider });
    const injector = await web3FromSource(wallet.meta?.source || wallet.name);
    console.log("Injector obtained:", injector);
    api.setSigner(injector.signer);
    const metadataObj = {
      petName,
      socialUsername: socialName,
      petPersonality: selectedPet?.description || 'Unknown',
      owner: wallet.address
    };
    const metadataHex = '0x' + Buffer.from(JSON.stringify(metadataObj)).toString('hex');
    const collectionConfig = { metadata: metadataHex };
        
    console.log('Creating NFT collection...');
    const createTx = api.tx.nfts.create(wallet.address, collectionConfig);
    let createdCollectionId = "";
        
    await new Promise<void>((resolve, reject) => {
      createTx.signAndSend(wallet.address, { signer: injector.signer }, (result) => {
        console.log(`Collection creation tx status: ${result.status}`);
        if (result.status.isInBlock) {
          console.log(`Included at blockHash: ${result.status.asInBlock}`);
          result.events.forEach(({ event }) => {
            if (event.section === 'nfts' && event.method === 'Created') {
              createdCollectionId = event.data[0].toString();
              console.log(`NFT collection created with ID: ${createdCollectionId}`);
            }
          });
          if (!createdCollectionId) {
            createdCollectionId = "1";
            console.log(`No collection ID found in events, assuming ID: ${createdCollectionId}`);
          }
          resolve();
        }
      }).catch(reject);
    });
    return createdCollectionId;
  };

  // Second wallet signature: Mint NFT in the created collection.
  const signMintNFT = async (collectionId: string): Promise<void> => {
    if (!wallet) {
      throw new Error("Wallet not connected or wallet meta is missing.");
    }
    // Enable the wallet extension (if not already done)
    const extensions = await web3Enable("MyDApp");
    if (extensions.length === 0) {
      throw new Error("No wallet extension found, please install SubWallet or another compatible extension.");
    }
    const wsProvider = new WsProvider('wss://asset-hub-paseo-rpc.dwellir.com');
    const api = await ApiPromise.create({ provider: wsProvider });
    const injector = await web3FromSource(wallet.meta?.source || wallet.name);
    console.log("Injector obtained:", injector);
    api.setSigner(injector.signer);
    const itemId = 1;
    console.log('Minting NFT item...');
    await new Promise<void>((resolve, reject) => {
      const mintTx = api.tx.nfts.mint(parseInt(collectionId), itemId, wallet.address, null);
      mintTx.signAndSend(wallet.address, { signer: injector.signer }, (result) => {
        console.log(`Mint tx status: ${result.status}`);
        if (result.status.isFinalized) {
          console.log(`NFT minted in collection ${collectionId} with item ID ${itemId}`);
          resolve();
        }
      }).catch(reject);
    });
  };

  return (
    <div className="min-h-screen bg-yellow-100 flex flex-col justify-center items-center p-6">
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
              <p className="pixel-font">
                From now on, I'll be with you, whether you're just chilling or Trump is tweeting again~
              </p>
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
                onClick={openStepper}
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 pixel-font"
              >
                Done
              </button>
            )}
          </div>
          {showStepper && (
            <div className="w-full my-4">
              <Stepper
                initialStep={mintingStep}
                onStepChange={(step) => {
                  console.log('Current Step:', step);
                  // We do not automatically change steps here; steps will advance via our nextButtonProps.
                  setMintingStep(step);
                }}
                nextButtonProps={{
                  onClick: async () => {
                    if (mintingStep === 1) {
                      // Step 1 (Pet Born): simply proceed to Step 2
                      setMintingStep(2);
                    } else if (mintingStep === 2) {
                      // Step 2: trigger first wallet signature to create NFT collection
                      try {
                        const collectionId = await signCreateNFT();
                        setCreatedCollectionId(collectionId);
                        setMintingStep(3);
                      } catch (error) {
                        console.error('Error during create NFT signature:', error);
                      }
                    } else if (mintingStep === 3) {
                      // Step 3: trigger second wallet signature to mint NFT
                      try {
                        await signMintNFT(createdCollectionId);
                        setMintingStep(4);
                      } catch (error) {
                        console.error('Error during mint NFT signature:', error);
                      }
                    } else if (mintingStep === 4) {
                      // Step 4: completed. Close the Stepper and redirect.
                      setShowStepper(false);
                      router.push(`/nemo?petId=${petId || ''}`);
                    }
                  }
                }}
                backButtonText="Previous"
                nextButtonText="Next"
              >
                <Step>
                  <h2>Your Pet is Coming...</h2>
                </Step>
                <Step>
                  <h2>Creating NFT Collection</h2>
                </Step>
                <Step>
                  <h2>Minting NFT</h2>
                </Step>
                <Step>
                  <h2>NFT Minted!</h2>
                </Step>
              </Stepper>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 