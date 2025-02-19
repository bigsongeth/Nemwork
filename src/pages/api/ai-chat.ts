import type { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    // 获取aptos-agent目录的绝对路径 (现在在项目根目录下)
    const aptosAgentPath = path.resolve(process.cwd(), './aptos-agent');
    const pythonPath = path.join(aptosAgentPath, 'venv/bin/python');
    
    console.log('Python路径:', pythonPath);
    console.log('工作目录:', aptosAgentPath);
    
    // 创建一个Promise来处理Python进程
    const pythonResponse = await new Promise((resolve, reject) => {
      const pythonProcess = spawn(pythonPath, ['main.py', message], {
        cwd: aptosAgentPath,
        env: {
          ...process.env,
          PYTHONPATH: aptosAgentPath,
          VIRTUAL_ENV: path.join(aptosAgentPath, 'venv'),
          PATH: `${path.join(aptosAgentPath, 'venv/bin')}:${process.env.PATH || ''}`
        }
      });

      let responseData = '';
      let errorData = '';

      // 收集Python进程的输出
      pythonProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('Python stdout:', output);
        responseData += output;
      });

      // 收集Python进程的错误输出
      pythonProcess.stderr.on('data', (data) => {
        const error = data.toString();
        console.error('Python stderr:', error);
        errorData += error;
      });

      // 当Python进程结束时
      pythonProcess.on('close', (code) => {
        console.log('Python进程退出码:', code);
        if (code === 0) {
          resolve(responseData.trim());
        } else {
          reject(new Error(`Python process exited with code ${code}: ${errorData}`));
        }
      });
    });

    return res.status(200).json({ response: pythonResponse });
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
} 