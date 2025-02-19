const url = 'https://eth-mainnet.g.alchemy.com/v2/wYLLLqg2CDlpIiTy5j6dqzBnTg1GzLPS';
const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

const body = JSON.stringify({
    id: 1,
    jsonrpc: "2.0",
    method: "alchemy_getAssetTransfers",
    params: [
        {
            fromBlock: "0x0",
            toBlock: "latest",
            toAddress: "0xa9E1BAE837d0D3b5879a69550d7C387Ce57aD753",
            withMetadata: false,
            excludeZeroValue: true,
            maxCount: "0x3e8",
            category: [
                "external"
            ]
        }
    ]
});

fetch(url, {
    method: 'POST',
    headers,
    body
})
.then(response => response.json())
.then(data => {
    // 使用 JSON.stringify 格式化输出完整对象数据
    console.log(JSON.stringify(data, null, 2));
    
    // 或者你也可以使用 console.dir 来展示所有层级的对象：
    // console.dir(data, { depth: null, colors: true });
})
.catch(error => console.error('Error:', error));