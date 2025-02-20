import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import dotenv from 'dotenv';
dotenv.config();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    // Pull required information from the request body
    const { walletAddress, petName, socialUsername, petPersonality } = req.body;
    if (!walletAddress || !petName || !socialUsername || !petPersonality) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Step 2: 连接至 AssetHub 节点（请将 URL 替换为实际可用的节点地址）
    const wsProvider = new WsProvider('wss://asset-hub-paseo-rpc.dwellir.com'); // ← 注意替换为实际节点地址
    const api = await ApiPromise.create({ provider: wsProvider });
    console.log('Connected to node:', api.genesisHash.toHex());

    // Step 3: 初始化 Keyring，并加载开发者账户（这里使用环境变量中的助记词）
    const keyring = new Keyring({ type: 'sr25519' });
    const myMnemonic = process.env.MY_MNEMONIC;
    const myAccount = keyring.addFromUri(myMnemonic);
    console.log(`Using account ${myAccount.address}`);

    // Step 4: 准备 NFT 集合配置
    // 将 pet 的属性（比如名称、社交用户名、性格、所有者地址）构造为一个 metadata 对象
    const metadataObj = {
      petName,
      socialUsername,
      petPersonality,
      owner: walletAddress
    };
    // 将该对象转换成 JSON 字符串，再转换为 hex 编码
    const metadataStr = JSON.stringify(metadataObj);
    const metadataHex = '0x' + Buffer.from(metadataStr).toString('hex');

    const collectionConfig = {
      metadata: metadataHex
    };

    console.log('Creating NFT collection...');

    // Step 5: 创建集合 —— 调用 extrinsic nfts.create
    const createTx = api.tx.nfts.create(myAccount.address, collectionConfig);
    let createdCollectionId = null;

    // 监听 tx 状态，直到包含在区块中
    await new Promise((resolve, reject) => {
      createTx.signAndSend(myAccount, (result) => {
        console.log(`Collection creation tx status: ${result.status}`);
        if (result.status.isInBlock) {
          console.log(`Collection creation tx included at blockHash ${result.status.asInBlock}`);
          result.events.forEach(({ event }) => {
            // 假设事件名称为 "Created" 且所在模块为 "nfts"
            if (event.section === 'nfts' && event.method === 'Created') {
              createdCollectionId = event.data[0].toString();
              console.log(`NFT collection created with ID: ${createdCollectionId}`);
            }
          });
          if (!createdCollectionId) {
            createdCollectionId = 1;
            console.log(`No collection ID found in events, assuming collection ID: ${createdCollectionId}`);
          }
          resolve();
        }
      }).catch((error) => {
        reject(error);
      });
    });

    // Step 7: 铸造 NFT —— 使用 extrinsic nfts.mint
    const itemId = 1;
    console.log('Minting NFT item...');
    await new Promise((resolve, reject) => {
      const mintTx = api.tx.nfts.mint(parseInt(createdCollectionId), itemId, myAccount.address, null);
      mintTx.signAndSend(myAccount, (result) => {
        console.log(`Mint tx status: ${result.status}`);
        if (result.status.isFinalized) {
          console.log(`NFT minted in collection ${createdCollectionId} with item ID ${itemId}`);
          resolve();
        }
      }).catch((error) => {
        reject(error);
      });
    });

    res.status(200).json({ message: 'NFT created successfully', collectionId: createdCollectionId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating NFT' });
  }
} 