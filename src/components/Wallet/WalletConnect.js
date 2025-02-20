import React from 'react';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import { useWallet } from '@/contexts/WalletContext';

const WalletConnect = () => {
  const { wallet, setWallet } = useWallet();

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
      // 选择第一个账户进行连接（设置默认 meta property if missing)
      const account = accounts[0];
      // If meta is empty or missing the source, fill it in with a fallback value.
      if (!account.meta || !account.meta.source || Object.keys(account.meta).length === 0) {
        account.meta = { ...account.meta, source: "subwallet-js", name: "SubWallet Account" };
      }
      setWallet(account);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet, please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center">
      {!wallet ? (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-800 text-white rounded shadow-md pixel-font"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="text-center">
          <p className="text-2xl font-bold text-green-500 pixel-font mb-2">Connect Successful</p>
          <p className="text-sm text-gray-700 pixel-font">Account Address: {wallet.address}</p>
          <p className="text-sm text-gray-700 pixel-font">Account Name: {wallet.meta.name}</p>
        </div>
      )}
    </div>
  );
};

export default WalletConnect; 