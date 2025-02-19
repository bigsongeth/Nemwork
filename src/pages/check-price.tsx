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
}

// Helper function: extract GeneralIndex from the PoolId (AssetKind) human representation.
function extractGeneralIndex(poolHuman: any): string | null {
  // Log the poolHuman input so we can see its structure.
  console.log("poolHuman:", poolHuman);

  // Normalize poolHuman into an array.
  let arr: any[];
  if (Array.isArray(poolHuman)) {
    arr = poolHuman;
  } else if (poolHuman && typeof poolHuman === 'object') {
    arr = Object.values(poolHuman);
  } else if (typeof poolHuman === 'string') {
    // If poolHuman is already a string (e.g. "Here/Assets/123"), try parsing directly.
    const parts = poolHuman.split('/');
    if (parts[0] === 'Here' && parts[1] === 'Assets' && parts[2]) {
      return parts[2];
    }
    console.error("Invalid poolHuman string format:", poolHuman);
    return null;
  } else {
    console.error("Invalid poolHuman type:", poolHuman);
    return null;
  }

  // We expect exactly two elements in a valid PoolId.
  if (arr.length !== 2) {
    console.error("Invalid poolHuman (expected 2 elements):", arr);
    return null;
  }

  // Destructure the two elements.
  const [asset1, asset2] = arr;

  // Identify the non-native asset by checking which element is not "Native" (case-sensitive).
  const nonNative = asset1 !== 'Native' ? asset1 : asset2 !== 'Native' ? asset2 : null;
  if (!nonNative) {
    console.error("No non-native asset found in poolHuman:", poolHuman);
    return null;
  }

  // If nonNative is an object and has a GeneralIndex property, return it.
  if (nonNative && typeof nonNative === 'object' && 'GeneralIndex' in nonNative) {
    return String(nonNative.GeneralIndex);
  }

  // If nonNative is an object but uses a MultiLocation string to encode the asset id, parse it.
  if (nonNative && typeof nonNative === 'object' && 'MultiLocation' in nonNative) {
    const ml_str = nonNative.MultiLocation;
    const parts = ml_str.split('/');
    // Expecting a format like "Here/Assets/123"
    if (parts[0] === 'Here' && parts[1] === 'Assets' && parts[2]) {
      return parts[2];
    }
  }

  // Fallback: if nonNative is a string, try to extract digits.
  if (typeof nonNative === 'string') {
    const match = nonNative.match(/\d+/);
    if (match) {
      return match[0];
    }
  }

  console.error("Could not extract GeneralIndex from:", poolHuman);
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
      const wsProvider = new WsProvider('wss://westend-asset-hub-rpc.polkadot.io'); // endpoint updated per your instruction
      const api = await ApiPromise.create({ provider: wsProvider });
      
      // Real implementation: query on-chain data from the assetConversion pallet.
      // Retrieve all pool keys.
      const poolKeys = await api.query.assetConversion.pools.keys();
      const poolsData = await Promise.all(
        poolKeys.map(async (key) => {
          // Use key.args[0] as the storage key for the pool.
          const poolOption = await api.query.assetConversion.pools(key.args[0]);
          if (poolOption.isSome) {
            const poolData = poolOption.unwrap();
            // Assume the poolData structure contains reserve0 and reserve1.
            const { reserve0, reserve1 } = poolData;

            // Extract general index from the MultiLocation (using its human representation).
            const poolHuman = key.toHuman();
            const generalIndexStr = extractGeneralIndex(poolHuman);
            if (!generalIndexStr) {
              console.error("Failed to extract general index for pool:", poolHuman);
              return null;
            }
            const parsedGenIndex = Number(generalIndexStr);

            // Query asset metadata for the non-native asset using the parsed GeneralIndex.
            const metadataOpt = await api.query.assets.metadata(parsedGenIndex);
            if (!metadataOpt.isSome) {
              console.error("Asset metadata not found for index:", parsedGenIndex);
              return null;
            }
            const meta = metadataOpt.unwrap();
            const name = meta.name.toString();
            const symbol = meta.symbol.toString();
            const decimals = meta.decimals ? parseInt(meta.decimals.toString()) : 10;

            // Convert reserves (assumed to be BigNumber-like) into standard units.
            const dotReserve = Number(reserve0.toString()) / Math.pow(10, decimals);
            const assetReserve = Number(reserve1.toString()) / Math.pow(10, decimals);

            // Calculate prices (using Uniswap-like logic).
            const priceOfAssetInDot = assetReserve > 0 ? dotReserve / assetReserve : 0;
            const priceOfDotInAsset = dotReserve > 0 ? assetReserve / dotReserve : 0;

            return {
              poolId: JSON.stringify(poolHuman),
              name,
              symbol,
              decimals,
              dotReserve,
              assetReserve,
              priceOfAssetInDot,
              priceOfDotInAsset,
            } as PoolInfo;
          }
          return null;
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CheckPricePage;
