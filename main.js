// Add a debug log to confirm main.js is loaded.
console.log("main.js loaded");

// Import the necessary objects from @polkadot/api via esm.sh
import { ApiPromise, WsProvider } from 'https://esm.sh/@polkadot/api@latest?target=esnext';

// 轮询间隔（毫秒）
const POLL_INTERVAL = 5000;

// Global API instance
let api;

// 存储每个池子的 Chart.js 实例
const charts = {};

/**
 * 初始化：连接API，查询池子键，并对每个池子设置图表及轮询更新
 */
async function init() {
  try {
    console.log("init() function started");
    // 连接到节点（请确保提供的 URL 正确）
    const provider = new WsProvider('wss://polkadot-asset-hub-rpc.polkadot.io');
    api = await ApiPromise.create({ provider });
    console.log("Connected to blockchain via polkadot.js API");

    // 新逻辑：调用 Pools.keys() 获取所有池子的存储键
    // 注意：此处使用小写的 "pools"（参考官方文档）
    const pools = await getPoolIds(api);
    console.log("Pools:", pools);
    // 将查询到的池子键以 JSON 格式展示在页面上
    document.getElementById("json_assets").textContent = JSON.stringify(pools, null, 2);

    // 对每个池子设置图表并进行轮询更新数据
    pools.forEach(pool => {
      setupPoolChart(pool);
      updatePoolData(pool);
      setInterval(() => updatePoolData(pool), POLL_INTERVAL);
    });
  } catch (error) {
    console.error("Error initializing:", error);
  }
}

/**
 * 查询 assetConversion 的 pools 存储项的 keys
 * 返回数组，每项为 { raw, human } 对象，其中：
 * - raw: 用于后续查询的原始参数（例如 storage key 参数）
 * - human: 用于展示用户友好格式
 */
async function getPoolIds(api) {
  // 通过小写的 `pools` 获取所有池子的存储键
  const keys = await api.query.assetConversion.pools.keys();
  // 假设每个键只有一个参数，保存 raw 参数和 human 格式
  return keys.map(key => ({
    raw: key.args[0],
    human: key.toHuman()
  }));
}

/**
 * 为指定池子创建一个 Chart.js 图表
 * 使用 pool.human 作为展示标题
 */
function setupPoolChart(pool) {
  const chartsContainer = document.getElementById("charts");
  const container = document.createElement("div");
  container.className = "chart-container";

  const title = document.createElement("h3");
  title.textContent = "Pool: " + JSON.stringify(pool.human);
  container.appendChild(title);

  const canvas = document.createElement("canvas");
  // 利用池子 human 信息生成一个唯一 ID
  const chartId = "chart-" + JSON.stringify(pool.human);
  canvas.id = chartId;
  container.appendChild(canvas);
  chartsContainer.appendChild(container);

  const ctx = canvas.getContext("2d");
  charts[chartId] = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Pool Value",
        data: [],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      }]
    },
    options: {
      scales: {
        x: { title: { display: true, text: "Time" } },
        y: { title: { display: true, text: "Value" } }
      }
    }
  });
}

/**
 * 轮询更新指定池子的数值数据，并更新对应图表（实时图表）
 */
async function updatePoolData(pool) {
  try {
    // 查询指定池子的存储数据
    const poolInfo = await api.query.assetConversion.pools(pool.raw);
    // 假设 poolInfo 可转换为数字（实际可能需要解析结构），这里作简单模拟
    const poolValue = Number(poolInfo.toString());
    const chartId = "chart-" + JSON.stringify(pool.human);
    const chart = charts[chartId];
    if (chart) {
      const nowLabel = new Date().toLocaleTimeString();
      chart.data.labels.push(nowLabel);
      chart.data.datasets[0].data.push(poolValue);
      chart.update();
      console.log(`Updated pool ${JSON.stringify(pool.human)}: Value = ${poolValue}`);
    }
  } catch (err) {
    console.error("Error updating pool data:", err);
  }
}

window.addEventListener("load", init); 