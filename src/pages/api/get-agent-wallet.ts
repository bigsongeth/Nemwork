import type { NextApiRequest, NextApiResponse } from 'next';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 读取 .env 文件
    const envPath = path.resolve(process.cwd(), './aptos-agent/.env');
    if (!fs.existsSync(envPath)) {
      return res.status(500).json({ message: 'Environment file not found' });
    }

    // 读取环境变量
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envVars = Object.fromEntries(
      envContent
        .split('\n')
        .filter(line => line && !line.startsWith('#'))
        .map(line => line.split('='))
        .filter(parts => parts.length === 2)
        .map(([key, value]) => [key.trim(), value.trim()])
    );

    const walletAddress = envVars['DEVNET_WALLET_ADDRESS'];
    if (!walletAddress) {
      return res.status(500).json({ message: 'Wallet address not found in environment' });
    }

    return res.status(200).json({ address: walletAddress });
  } catch (error) {
    console.error('Error getting wallet address:', error);
    return res.status(500).json({ message: 'Failed to get wallet address' });
  }
} 