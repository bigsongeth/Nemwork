import React, { useState, useEffect } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';

// Define the structure for pool information.
interface PoolInfo {
  poolId: string;
  name: string;
  symbol: string;
  decimals: number;
  dotReserve: number;
  assetReserve: number;
  priceOfAssetInDot: number;
  priceOfDotInAsset: number;
  lpToken?: string;
}

// Updated helper function to extract GeneralIndex using logic from the pool and token services.
function extractGeneralIndex(poolData: any): string | null {
  console.log("pool key data:", poolData);

  // If poolData is an object with an "interior" property containing an array "X2",
  // iterate over X2 to find an element with a GeneralIndex.
  if (poolData && typeof poolData === 'object' && poolData.interior && poolData.interior.X2 && Array.isArray(poolData.interior.X2)) {
    for (const item of poolData.interior.X2) {
      if (item && typeof item === 'object' && item.GeneralIndex !== undefined) {
        return String(item.GeneralIndex);
      }
    }
  }

  // Fallback: if poolData is a string in a "Here/Assets/123" format, use a regex.
  if (typeof poolData === 'string') {
    const match = poolData.match(/Assets\/(\d+)/);
    if (match) return match[1];
  }

  console.error("Could not extract GeneralIndex from:", poolData);
  return null;
}

const CheckPricePage: React.FC = () => {
  const [pools, setPools] = useState<PoolInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch the list of pools and compute their prices.
  const fetchPools = async () => {
    setLoading(true);
    try {
      // Create a connection to a Polkadot node.
      const wsProvider = new WsProvider('wss://polkadot-asset-hub-rpc.polkadot.io'); // endpoint updated per your instruction
      const api = await ApiPromise.create({ provider: wsProvider });
      
      // Retrieve all pool entries (key & value) as used in the poolServices code.
      const poolEntries = await api.query.assetConversion.pools.entries();
      const poolsData = await Promise.all(
        poolEntries.map(async ([key, poolData]) => {
          // Use the poolServices approach to extract the pool key.
          // Call toJSON() to preserve the nested structure (like the "interior" field).
          const poolKey = (key.args && key.args[0]) ? key.args[0].toJSON() : key.toJSON();
          // Extract the general index using the updated helper function.
          const generalIndexStr = extractGeneralIndex(poolKey);
          if (!generalIndexStr) {
            console.error("Failed to extract general index for pool:", poolKey);
            return null;
          }
          const parsedGenIndex = Number(generalIndexStr);

          // Convert poolData to human-friendly JSON (assumes it contains reserve0, reserve1, and optionally lpToken).
          const poolJson = poolData.toHuman();
          if (!poolJson) {
            console.error("Pool data not available for pool:", poolKey);
            return null;
          }
          const { reserve0, reserve1, lpToken } = poolJson;

          // Query asset metadata for the non-native asset using the parsed GeneralIndex.
          const metadataOpt = (await api.query.assets.metadata(parsedGenIndex)) as any;
          if (!metadataOpt.isSome) {
            console.error("Asset metadata not found for index:", parsedGenIndex);
            return null;
          }
          const meta = metadataOpt.unwrap();
          const name = meta.name.toString();
          const symbol = meta.symbol.toString();
          const decimals = meta.decimals ? parseInt(meta.decimals.toString()) : 10;

          // Convert reserves (assumed to be BigNumber-like values) into standard units.
          const dotReserve = Number(reserve0.toString()) / Math.pow(10, decimals);
          const assetReserve = Number(reserve1.toString()) / Math.pow(10, decimals);

          // Calculate prices (using Uniswap-like logic).
          const priceOfAssetInDot = assetReserve > 0 ? dotReserve / assetReserve : 0;
          const priceOfDotInAsset = dotReserve > 0 ? assetReserve / dotReserve : 0;

          return {
            poolId: JSON.stringify(poolKey),
            name,
            symbol,
            decimals,
            dotReserve,
            assetReserve,
            priceOfAssetInDot,
            priceOfDotInAsset,
            lpToken: lpToken ? lpToken.toString() : "N/A",
          } as PoolInfo;
        })
      );
      // Filter out any nulls and update the state.
      const realPools = poolsData.filter((p): p is PoolInfo => p !== null);
      setPools(realPools);
      await api.disconnect();
    } catch (error) {
      console.error('Error fetching pools:', error);
    }
    setLoading(false);
  };

  // Fetch the pool data on component mount.
  useEffect(() => {
    fetchPools();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Asset Conversion Pools and Prices</h1>
      {loading && <p>Loading pools data...</p>}
      {!loading && pools.length === 0 && <p>No pools found.</p>}
      {!loading && pools.length > 0 && (
        <ul>
          {pools.map((pool) => (
            <li key={pool.poolId} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
              <p><strong>Pool ID:</strong> {pool.poolId}</p>
              <p><strong>Assets:</strong> {pool.name} - {pool.symbol}</p>
              <p>
                <strong>Reserves:</strong> {pool.dotReserve} {pool.name} , {pool.assetReserve} {pool.symbol}
              </p>
              <p>
                <strong>Price:</strong> {(pool.priceOfAssetInDot ?? 0).toFixed(2)} ({pool.name} in terms of {pool.symbol})
              </p>
              <p>
                <strong>Liquidity Pool Token:</strong> {pool.lpToken}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CheckPricePage;
