import { createContext, useContext, useState } from 'react';

// Create a context to hold wallet info
const WalletContext = createContext(null);

// Provider that will wrap our app and store the wallet connection info
export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  return (
    <WalletContext.Provider value={{ wallet, setWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to easily use the wallet context in any component
export const useWallet = () => useContext(WalletContext); 