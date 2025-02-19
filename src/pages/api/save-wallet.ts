import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ message: 'Wallet address is required' });
  }

  try {
    // 配置 Python 环境和路径
    const aptosAgentPath = path.resolve(process.cwd(), './aptos-agent');
    const pythonPath = path.join(aptosAgentPath, 'venv/bin/python');
    
    // 创建一个Python脚本来更新环境变量
    const updateEnvScript = `
from dotenv import load_dotenv, set_key
import os

# 加载现有的环境变量
load_dotenv()

# 更新DEVNET_WALLET_ADDRESS
set_key('.env', 'DEVNET_WALLET_ADDRESS', '${address}')
print('Wallet address updated successfully')
    `.trim();

    // 将脚本写入临时文件
    const scriptPath = path.join(aptosAgentPath, 'update_env.py');
    fs.writeFileSync(scriptPath, updateEnvScript);

    // 运行Python脚本
    const pythonProcess = spawn(pythonPath, ['update_env.py'], {
      cwd: aptosAgentPath,
      env: {
        ...process.env,
        PYTHONPATH: aptosAgentPath,
        VIRTUAL_ENV: path.join(aptosAgentPath, 'venv'),
        PATH: `${path.join(aptosAgentPath, 'venv/bin')}:${process.env.PATH || ''}`
      }
    });

    // 处理Python进程的输出
    pythonProcess.stdout.on('data', (data) => {
      console.log('Python stdout:', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('Python stderr:', data.toString());
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

    return res.status(200).json({ message: 'Wallet address saved successfully' });
  } catch (error) {
    console.error('Error saving wallet address:', error);
    return res.status(500).json({ message: 'Failed to save wallet address' });
  }
} 