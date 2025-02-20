import type { NextApiRequest, NextApiResponse } from 'next';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 配置 Python 环境和路径
    const aptosAgentPath = path.resolve(process.cwd(), './aptos-agent');
    const pythonPath = path.join(aptosAgentPath, 'venv/bin/python');
    
    // 创建一个Python脚本来检查和更新环境变量
    const checkEnvScript = `
from dotenv import load_dotenv
import os
from aptos_sdk.account import Account

# 加载现有的环境变量
load_dotenv()

# 检查AI代理钱包地址
wallet_address = os.getenv('DEVNET_WALLET_ADDRESS')
private_key = os.getenv('PRIVATE_KEY')

# 如果没有钱包地址或私钥，生成新的
if not wallet_address or not private_key:
    new_account = Account.generate()
    wallet_address = str(new_account.address())
    private_key = str(new_account.private_key)
    
    # 保存到环境变量
    from dotenv import set_key
    set_key('.env', 'DEVNET_WALLET_ADDRESS', wallet_address)
    set_key('.env', 'PRIVATE_KEY', private_key)

print(wallet_address)
    `.trim();

    // 将脚本写入临时文件
    const scriptPath = path.join(aptosAgentPath, 'check_env.py');
    fs.writeFileSync(scriptPath, checkEnvScript);

    // 运行Python脚本
    const pythonProcess = spawn(pythonPath, ['check_env.py'], {
      cwd: aptosAgentPath,
      env: {
        ...process.env,
        PYTHONPATH: aptosAgentPath,
        VIRTUAL_ENV: path.join(aptosAgentPath, 'venv'),
        PATH: `${path.join(aptosAgentPath, 'venv/bin')}:${process.env.PATH || ''}`
      }
    });

    let walletAddress = '';

    // 处理Python进程的输出
    pythonProcess.stdout.on('data', (data) => {
      walletAddress = data.toString().trim();
    });

    // 等待Python进程完成
    await new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          reject(new Error(`Process exited with code ${code}`));
        }
      });
    });

    // 清理临时文件
    fs.unlinkSync(scriptPath);

    if (!walletAddress) {
      return res.status(500).json({ message: 'Failed to get or generate AI agent wallet address' });
    }

    return res.status(200).json({ address: walletAddress });
  } catch (error) {
    console.error('Error getting AI agent wallet address:', error);
    return res.status(500).json({ message: 'Failed to get AI agent wallet address' });
  }
} 