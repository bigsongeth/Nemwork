import requests

def get_exchange_info(api_version, market_id, limit=None):
    # 构建完整的 URL
    # base_url = "https://api.base-sepolia.jojo.exchange/"
    base_url = "https://api.base-mainnet.jojo.exchange/"
    endpoint = "/v1/trades"
    url = base_url + endpoint

    # 添加 query 参数，marketId 必传，limit 可选（如果不为空且有值，将转换为 int）
    params = {"marketId": market_id}
    if limit:
        params["limit"] = int(limit)

    try:
        # 发送 GET 请求到 API
        response = requests.get(url, params=params)
        # 如果响应 HTTP 状态码不是 2xx，会抛出异常
        response.raise_for_status()
        # 解析响应的 JSON 数据
        data = response.json()
        return data
    except Exception as e:
        print(f"Error fetching exchange info: {e}")
        return None

if __name__ == "__main__":
    # 用户输入参数
    api_version = "v1"
    market_id = input("请输入 marketId (例如 btcusdc): ")
    limit = input("请输入 limit（整数，留空表示不指定）: ")
    info = get_exchange_info(api_version, market_id, limit)
    if info is not None:
        import json
        print("Exchange info:")
        print(json.dumps(info, indent=2, ensure_ascii=False))
    else:
        print("No exchange info returned.") 