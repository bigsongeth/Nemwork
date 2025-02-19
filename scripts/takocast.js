require('dotenv').config();

const takoAPIKey = process.env.TAKO_API_KEY;
// 修改后的 Tako 的 cast API endpoint（使用新的 API URL）
const takoURL = 'https://open-api.tako.so/v1/cast';

const baseScanAPIKey = process.env.BASESCAN_API_KEY;
const baseScanAddress = '0xa9E1BAE837d0D3b5879a69550d7C387Ce57aD753';
const baseScanURL = 'https://api-sepolia.basescan.org/api';

// 轮询间隔（这里设定为 1 分钟）
const POLL_INTERVAL = 60 * 1000;

// 查询 BaseScan API 函数
async function queryBaseScan() {
  // 构造查询参数
  const params = new URLSearchParams({
    module: 'account',
    action: 'txlist',
    address: baseScanAddress,
    startblock: '0',
    endblock: '99999999',
    page: '1',
    offset: '10',
    sort: 'asc',
    apikey: baseScanAPIKey
  });
  const apiUrl = `${baseScanURL}?${params.toString()}`;
  console.log(`查询 BaseScan API: ${apiUrl}`);
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`BaseScan API 返回错误: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

// 向 Tako 发送 cast 的函数
async function castToTako(message) {
  console.log(`向 Tako 发送 cast: ${message}`);
  // 构造符合新 API 格式的请求体
  const payload = {
    community_id: "ai", // 默认发送至 'tako' 社区，根据需求调整
    text: message,
    mentions: [],
    mentions_positions: [],
    urls: []
  };

  const response = await fetch(takoURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': takoAPIKey
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Tako API 返回错误: ${errorData.error_msg || response.statusText}`);
  }
  
  const result = await response.json();
  return result;
}

// 辅助函数：读取标准输入内容
function readStdin() {
  return new Promise((resolve, reject) => {
    let input = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", chunk => {
      input += chunk;
    });
    process.stdin.on("end", () => resolve(input));
    process.stdin.on("error", err => reject(err));
  });
}

async function processCast() {
  let castMessage = "";
  // 如果有标准输入数据，优先读取
  if (!process.stdin.isTTY) {
    castMessage = await readStdin();
  } else if (process.argv && process.argv.length > 2) {
    castMessage = process.argv.slice(2).join(" ");
  }

  if (castMessage) {
    try {
      const result = await castToTako(castMessage);
      console.log("Tako cast 返回:", result);
      process.exit(0);
    } catch (error) {
      console.error("发送 cast 时出错:", error);
      process.exit(1);
    }
  } else {
    // 若无外部输入，则走自动化任务（轮询模式）
    async function runTask() {
      try {
        const data = await queryBaseScan();
        let castMessage = '';
        if (data.status === "1") {
          const transactions = data.result;
          const count = transactions.length;
          castMessage = `BaseScan 查询结果: 地址 ${baseScanAddress} 有 ${count} 条交易。`;
          if (count > 0 && transactions[count - 1].hash) {
            castMessage += ` 最新交易哈希：${transactions[count - 1].hash}`;
          }
        } else {
          castMessage = `BaseScan 查询异常: ${data.message}`;
        }
        const castResponse = await castToTako(castMessage);
        console.log('Tako cast 返回:', castResponse);
      } catch (error) {
        console.error('运行过程中发生错误:', error);
      } finally {
        // 定时下次执行，避免重叠执行
        setTimeout(runTask, POLL_INTERVAL);
      }
    }
    // 启动自动化任务
    runTask();
  }
}

// 启动时执行 processCast()，它会根据是否有外部输入来决定使用哪条分支
processCast();
