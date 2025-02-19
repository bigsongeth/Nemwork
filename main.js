// Add a debug log to confirm main.js is loaded.
console.log("main.js loaded");

// Import the necessary objects from @polkadot/api via esm.sh
import { ApiPromise, WsProvider } from 'https://esm.sh/@polkadot/api@latest?target=esnext';

// ------------------------------
// Global API instance
let api;

// 5. Initialize the polkadot.js API and query Pool IDs.
async function init() {
  try {
    console.log("init() function started");
    // Connect using a WebSocket provider.
    const provider = new WsProvider('wss://polkadot-asset-hub-rpc.polkadot.io'); 
    api = await ApiPromise.create({ provider });
    console.log("Connected to blockchain via polkadot.js API");

    // 新逻辑：通过 Pools.keys() 获取池子 ID
    const poolIds = await getPoolIds(api);
    console.log("Pool IDs:", poolIds);
    document.getElementById("json_assets").textContent = JSON.stringify(poolIds, null, 2);
  } catch (error) {
    console.error("Error initializing:", error);
  }
}

// 新增函数：查询 assetConversion 的 Pools.keys() 以获取池子 ID (PoolIds)
async function getPoolIds(api) {
  // 通过小写的 `pools` 获取所有池子对应的存储键
  const keys = await api.query.assetConversion.pools.keys();
  // 将 keys 转为可读格式，并返回数组
  return keys.map(key => key.toHuman());
}

window.addEventListener("load", init); 