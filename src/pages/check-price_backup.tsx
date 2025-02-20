import React, { useEffect, useState } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { u8aToHex } from '@polkadot/util';
import { useRouter } from 'next/router';

const POLL_INTERVAL = 5000;

// Helper 函数：从 human 信息中提取 GeneralIndex（针对非原生资产）
function extractGeneralIndex(poolHuman: any): string | null {
  try {
    if (Array.isArray(poolHuman) && poolHuman.length >= 2) {
      // 如果第二项直接包含 WithId，则直接返回
      if (poolHuman[1]?.WithId !== undefined) {
        return String(poolHuman[1].WithId).replace(/,/g, '');
      }
      // 否则，尝试从嵌套结构中提取
      if (poolHuman[1]?.interior?.X2 && Array.isArray(poolHuman[1].interior.X2)) {
        const generalIndexRaw = poolHuman[1].interior.X2[1]?.GeneralIndex;
        if (generalIndexRaw !== undefined) {
          return String(generalIndexRaw).replace(/,/g, '');
        }
      }
    }
    return null;
  } catch (e) {
    console.error("Error extracting GeneralIndex", e);
    return null;
  }
}

interface PoolInfo {
  name: string;
  symbol: string;
  decimals: number;
  dotReserve: number;
  assetReserve: number;
  priceOfAssetInDot: number;
  priceOfDotInAsset: number;
}

interface PoolEntry {
  multilocation: any;
  lpToken: any;
}

const CheckPricePage = () => {
  // 显示当前选池的价格信息
  const [poolInfo, setPoolInfo] = useState<PoolInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // 保存当前选中的 GeneralIndex（默认 22222052，如果提取到则更新）
  const [selectedGenIndex, setSelectedGenIndex] = useState<number>(22222052);
  // 保存通过 RPC 获取的池储备信息（get_reserves 返回的内容）
  const [poolReserves, setPoolReserves] = useState<string | null>(null);
  // 保存所有池的列表
  const [poolList, setPoolList] = useState<PoolEntry[]>([]);
  const router = useRouter();

  // 获取当前池的信息（包括储备和价格等），同时提取动态 GeneralIndex
  useEffect(() => {
    async function fetchPoolData() {
      try {
        // 连接到节点，并注册自定义类型。此处仅需要注册 PoolId 为 Vec<MultiLocation>
        const provider = new WsProvider('wss://polkadot-asset-hub-rpc.polkadot.io');
        const api = await ApiPromise.create({
          provider,
          types: {
            "PoolId": "Vec<MultiLocation>"
          }
        });

        // 获取所有流动性池的 keys，从中提取动态 GeneralIndex（如果未能提取则使用默认值）
        const keys = await api.query.assetConversion.pools.keys();
        let dynamicGeneralIndex = '22222052'; // 默认 GeneralIndex
        if (keys.length > 0) {
          const poolsList = keys.map((key: any) => ({
            raw: key.args[0],
            human: key.toHuman()
          }));
          const extracted = extractGeneralIndex(poolsList[0].human);
          if (extracted) {
            dynamicGeneralIndex = extracted;
          }
        }
        const parsedGenIndex = Number(dynamicGeneralIndex);
        setSelectedGenIndex(parsedGenIndex);

        // 构建池标识符：根据文档，池的 id 为一个包含两个 MultiLocation 的数组，
        // 第一个表示原生资产，应构造为 { parents: 1, interior: "Here" }
        // 第二个表示非原生资产，构造为 { parents: 0, interior: { X2: [ { PalletInstance: 50 }, { GeneralIndex: parsedGenIndex } ] } }
        const nativeML = api.createType('MultiLocation', {
          parents: 1,
          interior: "Here"
        });
        const assetML = api.createType('MultiLocation', {
          parents: 0,
          interior: {
            X2: [
              { PalletInstance: 50 },
              { GeneralIndex: parsedGenIndex }
            ]
          }
        });
        const poolId = [nativeML, assetML];

        // 查询池数据：得到资金池的储备信息
        const poolDataOpt = await api.query.assetConversion.pools(poolId);
        if (!poolDataOpt.isSome) {
          console.error("Pool does not exist");
          setLoading(false);
          return;
        }
        const poolData = poolDataOpt.unwrap();
        const { reserve0, reserve1 } = poolData;

        // 查询指定资产的元数据（针对非原生资产，使用动态 GeneralIndex）
        const metadataOpt = await api.query.assets.metadata(parsedGenIndex);
        if (!metadataOpt.isSome) {
          console.error("Asset metadata not found");
          setLoading(false);
          return;
        }
        const meta = metadataOpt.unwrap();
        const name = meta.name.toString();
        const symbol = meta.symbol.toString();
        const decimals = meta.decimals ? parseInt(meta.decimals.toString()) : 10;

        // 将储备量转换为标准单位（reserve / 10^decimals）
        const dotReserve = reserve0.toNumber() / Math.pow(10, decimals);
        const assetReserve = reserve1.toNumber() / Math.pow(10, decimals);

        // 根据 Uniswap V2 逻辑计算价格：
        const priceOfAssetInDot = dotReserve / assetReserve;
        const priceOfDotInAsset = assetReserve / dotReserve;

        setPoolInfo({
          name,
          symbol,
          decimals,
          dotReserve,
          assetReserve,
          priceOfAssetInDot,
          priceOfDotInAsset,
        });
      } catch (error) {
        console.error("Error fetching pool data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPoolData();
  }, []);

  // 通过 RPC 调用获取当前池储备信息（参考 dot-acp-ui 的示例）
  async function getPoolReserves() {
    try {
      // 重新创建 API 实例（也可以考虑重用之前的 api 实例）
      const provider = new WsProvider('wss://westend-asset-hub-rpc.polkadot.io');
      const api = await ApiPromise.create({
        provider,
        types: {
          "PoolId": "Vec<MultiLocation>"
        }
      });

      if (!selectedGenIndex) {
        console.error("No selected GeneralIndex");
        return;
      }
      // 根据参考代码：构造该池的非原生资产 MultiLocation 与原生资产 MultiLocation
      const assetMultiLocation = api.createType('MultiLocation', {
        parents: 0,
        interior: {
          X2: [
            { PalletInstance: 50 },
            { GeneralIndex: selectedGenIndex }
          ]
        }
      }).toU8a();

      // 注意：native 部分需与池标识时保持一致，此处构造为 { parents: 1, interior: "Here" }
      const nativeMultiLocation = api.createType('MultiLocation', {
        parents: 1,
        interior: "Here"
      }).toU8a();

      // 拼接两个 Uint8Array
      const encodedInput = new Uint8Array(assetMultiLocation.length + nativeMultiLocation.length);
      encodedInput.set(assetMultiLocation, 0);
      encodedInput.set(nativeMultiLocation, assetMultiLocation.length);
      const encodedInputHex = u8aToHex(encodedInput);

      // 调用 RPC 方法 AssetConversionApi_get_reserves
      const reservesResult = await api.rpc.state.call('AssetConversionApi_get_reserves', encodedInputHex);
      // 解码返回数据（Option<(u128, u128)> 格式）
      const decoded = api.createType('Option<(u128, u128)>', reservesResult);
      const reservesHuman = decoded.toHuman();
      setPoolReserves(JSON.stringify(reservesHuman));
      console.log("Pool Reserves:", reservesHuman);
    } catch (error) {
      console.error("Error getting pool reserves:", error);
    }
  }

  // 获取所有流动性池列表（参考 dot-acp-ui 示例）
  async function listAllPools() {
    try {
      const provider = new WsProvider('wss://polkadot-asset-hub-rpc.polkadot.io');
      const api = await ApiPromise.create({
        provider,
        types: {
          "PoolId": "Vec<MultiLocation>"
        }
      });
      const entries = await api.query.assetConversion.pools.entries();
      const list = entries.map(([key, value]) => {
        return {
          multilocation: key.args[0].toHuman(),
          lpToken: value.toHuman()
        };
      });
      setPoolList(list);
    } catch (error) {
      console.error("Error listing all pools:", error);
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AssetHub 流动性池价格信息</h1>
      {loading ? (
        <p>正在加载池数据...</p>
      ) : poolInfo ? (
        <div>
          <table className="min-w-full border border-gray-300 mb-4">
            <thead>
              <tr>
                <th className="px-4 py-2 border">资产对</th>
                <th className="px-4 py-2 border">DOT 储备（标准单位）</th>
                <th className="px-4 py-2 border">{poolInfo.name} 储备（标准单位）</th>
                <th className="px-4 py-2 border">{poolInfo.symbol} 价格 (DOT/{poolInfo.symbol})</th>
                <th className="px-4 py-2 border">DOT 价格 ({poolInfo.symbol}/DOT)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 border">
                  DOT - {poolInfo.name} ({poolInfo.symbol})
                </td>
                <td className="px-4 py-2 border">{poolInfo.dotReserve.toLocaleString()}</td>
                <td className="px-4 py-2 border">{poolInfo.assetReserve.toLocaleString()}</td>
                <td className="px-4 py-2 border">{poolInfo.priceOfAssetInDot.toFixed(5)}</td>
                <td className="px-4 py-2 border">{poolInfo.priceOfDotInAsset.toFixed(5)}</td>
              </tr>
            </tbody>
          </table>
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
            onClick={getPoolReserves}
          >
            获取当前池的储备
          </button>
          {poolReserves && (
            <div className="mt-2 p-2 border">
              <strong>池储备信息:</strong> {poolReserves}
            </div>
          )}
        </div>
      ) : (
        <p>未查询到池数据。</p>
      )}
      <hr className="my-4" />
      <div>
        <h2 className="text-xl font-bold mb-2">所有流动性池列表</h2>
        <button 
          className="bg-green-500 text-white px-4 py-2 rounded mb-2"
          onClick={listAllPools}
        >
          获取所有池列表
        </button>
        {poolList.length > 0 && (
          <table className="min-w-full border border-gray-300 mt-2">
            <thead>
              <tr>
                <th className="px-4 py-2 border">池 MultiLocation</th>
                <th className="px-4 py-2 border">LP Token</th>
              </tr>
            </thead>
            <tbody>
              {poolList.map((pool, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 border">{JSON.stringify(pool.multilocation)}</td>
                  <td className="px-4 py-2 border">{JSON.stringify(pool.lpToken)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CheckPricePage;