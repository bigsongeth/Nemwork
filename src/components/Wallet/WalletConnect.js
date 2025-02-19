import React, { useState } from 'react';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';

const WalletConnect = () => {
  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    try {
      // 调用 web3Enable 启用钱包扩展，并传入应用名称（便于钱包识别）
      const extensions = await web3Enable('MyDApp');
      if (extensions.length === 0) {
        alert('No Subwallet wallet detected. Please ensure the wallet extension is installed and enabled.');
        return;
      }
      // 获取钱包账户列表
      const accounts = await web3Accounts();
      if (accounts.length === 0) {
        alert('No Subwallet account detected. Please check if your wallet contains an account.');
        return;
      }
      // 这里选择第一个账户进行连接（你可以根据业务逻辑选择具体哪个账户）
      setAccount(accounts[0]);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet, please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center">
      {!account ? (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-800 text-white rounded shadow-md pixel-font"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="text-center">
          <p className="text-2xl font-bold text-green-500 pixel-font mb-2">Connect Successful</p>
          <p className="text-sm text-gray-700 pixel-font">Account Address: {account.address}</p>
          <p className="text-sm text-gray-700 pixel-font">Account Name: {account.meta.name}</p>
        </div>
      )}
    </div>
  );
};

export default WalletConnect; 