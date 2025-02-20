// create-nft.js
// -------------------------
// Step 1: 导入所需模块
require('dotenv').config();
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');

// 使用立即执行的 async 函数封装业务逻辑
async function main() {
  // Step 2: 连接至 AssetHub 节点（请将 URL 替换为实际可用的节点地址）
  const wsProvider = new WsProvider('wss://asset-hub-paseo-rpc.dwellir.com'); // ← 替换为实际节点地址
  const api = await ApiPromise.create({ provider: wsProvider });
  console.log('Connected to node:', api.genesisHash.toHex());

  // Step 3: 初始化 Keyring，并加载开发者账户（此处使用测试账户 Alice）
  const keyring = new Keyring({ type: 'sr25519' });
  // 替换为你的助记词，如 process.env.MY_MNEMONIC 或直接指定字符串
  const myMnemonic = process.env.MY_MNEMONIC;
  const myAccount = keyring.addFromUri(myMnemonic);
  console.log(`Using account ${myAccount.address}`);

  // Step 4: 准备 NFT 集合配置（此处仅使用一个 metadata 字段；根据需要补充其它字段）
  const collectionConfig = {
    metadata: '0x6e665420636f6c6c656374696f6e' // hex 编码的 "nft collection"
  };

  console.log('Creating NFT collection...');

  // Step 5: 创建集合 —— 调用 extrinsic nfts.create
  // 第一个参数为集合管理员地址（此处传入 alice.address），第二个参数为集合配置对象
  const createTx = api.tx.nfts.create(myAccount.address, collectionConfig);

  // 提交交易，并监听包含的事件
  const unsubCreate = await createTx.signAndSend(myAccount, async (result) => {
    console.log(`Collection creation tx status: ${result.status}`);

    if (result.status.isInBlock) {
      console.log(`Collection creation tx included at blockHash ${result.status.asInBlock}`);

      // Step 6: 从事件中尝试解析集合的 ID（具体事件名称及数据结构取决于链实现）
      let createdCollectionId = null;
      result.events.forEach(({ event }) => {
        // 这里假定事件名称为 "Created" 且所在模块为 "nfts"
        if (event.section === 'nfts' && event.method === 'Created') {
          // 假设第一个数据字段为集合 ID
          createdCollectionId = event.data[0].toString();
          console.log(`NFT collection created with ID: ${createdCollectionId}`);
        }
      });

      // 如果没有解析到，则默认集合 ID 为 1（实际使用中请根据情况调整）
      if (createdCollectionId === null) {
        createdCollectionId = 1;
        console.log(`No collection ID found in events, assuming collection ID: ${createdCollectionId}`);
      }

      // Step 7: 铸造 NFT —— 使用 extrinsic nfts.mint
      // 参数依次为：集合 ID, NFT 的 item ID（这里取 1）, NFT 接收地址, witness_data（可选，此处传 null）
      const itemId = 1;
      console.log('Minting NFT item...');
      const mintTx = api.tx.nfts.mint(parseInt(createdCollectionId), itemId, myAccount.address, null);

      const unsubMint = await mintTx.signAndSend(myAccount, (mintResult) => {
        console.log(`Mint tx status: ${mintResult.status}`);
        if (mintResult.status.isFinalized) {
          console.log(`NFT minted in collection ${createdCollectionId} with item ID ${itemId}`);
          unsubMint();
          unsubCreate();
          process.exit(0);
        }
      });
      const unsub = await createTx.signAndSend(myAccount, (result) => {
        // 输出交易哈希
        console.log(`Transaction hash: ${result.txHash.toHex()}`);
        console.log(`Collection creation tx status: ${result.status}`);
    
        if (result.status.isInBlock) {
          console.log('交易已打包进区块, 区块哈希:', result.status.asInBlock.toHex());
          // 此时你可以在区块浏览器输入上面打印的 tx hash 进行查询
        }
      });
    }
  });
}

main().catch(console.error);