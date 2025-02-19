'use client';

import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="cm7638su701k511ya841nhpcc" // 替换为你的 Privy app ID
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: '/Users/twone/BASE/public/favicon.ico/icon.jpg', // 替换为你的 logo URL
        },
        // 为没有钱包的用户创建嵌入式钱包（选填）
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
} 