import json
import requests
from exchange_info import get_exchange_info

def process_trades(api_version, market_id, limit=None):
    # 调用 get_exchange_info 从 API 获取交易信息
    info = get_exchange_info(api_version, market_id, limit)
    if info is None:
        print("No exchange info returned.")
        return

    # 初始化计数器
    true_count = 0
    false_count = 0

    # 假设 info 为列表，如果不是，则包装入列表中
    trades = info if isinstance(info, list) else [info]

    for trade in trades:
        # 根据 trade 信息统计 isBuyerMaker 为 True 或 False 的数量
        if trade.get("isBuyerMaker") is True:
            true_count += 1
        elif trade.get("isBuyerMaker") is False:
            false_count += 1

    # 输出统计结果
    print("统计结果:")
    print(f"True 的 isBuyerMaker 数量：{true_count}")
    print(f"False 的 isBuyerMaker 数量：{false_count}")
    print("原始结果：", info)

    # 构造交易统计的摘要信息
    trade_summary = f"True 的 isBuyerMaker 数量：{true_count}, False 的 isBuyerMaker 数量：{false_count}"
    
    # 将 trade_summary 发送给 app.py 启动的 Flask 程序，并等待返回信息
    try:
        url = "http://localhost:5000/command"  # Flask 服务的 URL
        payload = {"command": trade_summary}
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            data = response.json()
            print("Response from app.py:")
            print("Result:", data.get("result"))
            print("Additional Result:", data.get("additional_result"))
        else:
            print("Failed to send data to app.py. Status code:", response.status_code)
    except Exception as exc:
        print("Error occurred while sending trade summary to app.py:", exc)


if __name__ == "__main__":
    # 用户输入参数
    api_version = "v1"
    market_id = input("请输入 marketId (例如 btcusdc): ")
    limit = input("请输入 limit（整数，留空表示不指定）: ")
    process_trades(api_version, market_id, limit) 