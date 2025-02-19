import os
import requests
import json
import schedule
import time
import subprocess
import sys

# 可选：如果安装了 python-dotenv，则自动加载 .env 文件
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# 全局变量，用于存储已处理的交易 ID（使用交易 hash 作为唯一标识）
last_seen_txn_ids = set()

def query_basescan_api():
    """
    查询 Basescan API 获取 token 交易数据。
    
    返回:
        JSON 格式的响应数据，如果请求失败则返回 None
    """
    base_url = "https://api-sepolia.basescan.org/api"
    
    # 从环境变量中获取 API key，若未设置则使用默认值 "YourApiKeyToken"
    api_key = os.environ.get("BASESCAN_API_KEY", "YourApiKeyToken")
    
    params = {
        "module": "account",
        "action": "tokentx",
        "address": "0xa9E1BAE837d0D3b5879a69550d7C387Ce57aD753",
        "page": 1,
        "offset": 2,
        "startblock": 0,
        "endblock": 99999999,
        "sort": "asc",
        "apikey": api_key
    }
    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print("Error querying API:", e)
        return None

def process_new_transactions(data):
    """
    从返回数据中提取 tokenName、value、from 和 to 信息，并根据 tokenDecimal 做计算，
    额外减少两个小数点位（即除以 100），
    格式化输出"从 from 发送了 value 的 tokenName 给了 to"，仅对新交易进行输出。
    
    修改：累计所有新的交易消息，并返回一个聚合消息字符串，如果没有新交易则返回 None。
    """
    global last_seen_txn_ids
    transactions = data.get('result', [])
    
    # 如果返回的 result 不是列表，则直接提示错误信息
    if not isinstance(transactions, list):
        print("返回的 result 不是列表，内容为:")
        print(transactions)
        return None

    new_transactions = []  # 累积新交易消息
    for txn in transactions:
        if not isinstance(txn, dict):
            continue

        txn_id = txn.get('hash')
        if txn_id is None:
            txn_id = str(txn)

        if txn_id in last_seen_txn_ids:
            continue

        last_seen_txn_ids.add(txn_id)

        token_name = txn.get("tokenName", "N/A")
        value = txn.get("value", "N/A")
        from_addr = txn.get("from", "N/A")
        to_addr = txn.get("to", "N/A")
        token_decimal = txn.get("tokenDecimal", None)
        
        if token_decimal and value != "N/A":
            try:
                # 先根据 tokenDecimal 转换，再额外除以100减少两个小数点位
                adjusted_value = int(value) / (10 ** int(token_decimal)) / 100
            except Exception:
                adjusted_value = value
        else:
            adjusted_value = value
        
        txn_message = f"从 {from_addr} 发送了 {adjusted_value} 的 {token_name} 给了 {to_addr}"
        new_transactions.append(txn_message)
        print(txn_message)
    
    if new_transactions:
        aggregated_message = "\n".join(new_transactions)
        print(f"Aggregated new transactions:\n{aggregated_message}")
        return aggregated_message
    else:
        print(f"{time.strftime('%Y-%m-%d %H:%M:%S')} - 无新交易记录。")
        return None

def poll():
    """
    执行一次轮询：调用 API 并处理新交易记录
    """
    data = query_basescan_api()
    if data:
        print(f"\n【轮询时间：{time.strftime('%Y-%m-%d %H:%M:%S')}】")
        aggregated_msg = process_new_transactions(data)
        if aggregated_msg:
            try:
                # 第一步：将新交易聚合信息发送给 app.py 的服务
                response = requests.post("http://127.0.0.1:5000/command", json={"command": aggregated_msg})
                if response.status_code == 200:
                    app_response = response.json()
                    cast_message = app_response.get("result", "")
                    cast_message = " ".join(cast_message.strip().split())
                    print("Received response from app.py:", cast_message)
                    try:
                        # 第二步：调用 takocast.js 并通过命令行参数传递 cast_message
                        result = subprocess.run(
                            ["node", "scripts/takocast.js", cast_message],
                            capture_output=True, text=True, check=True
                        )
                        print("Tako cast 返回:", result.stdout)
                    except subprocess.CalledProcessError as e:
                        print("调用 takocast.js 时出错:", e)
                    return cast_message  # 返回 app.py 的返回结果
            except Exception as e:
                print("请求 app.py 出现异常:", e)
                return None
        else:
            print(f"{time.strftime('%Y-%m-%d %H:%M:%S')} - 无新交易记录。")
            return None
    else:
        print("获取数据失败。")
        return None

if __name__ == "__main__":
    if '--once' in sys.argv:
         # 只执行一次 poll() 并输出最终结果（用于通过子进程调用时解析）
         result = poll()
         if result:
             print("FINAL_RESPONSE: " + result)
         else:
             print("FINAL_RESPONSE: No new transactions.")
         sys.exit(0)
    else:
         # 设置轮询间隔（例如每 5 秒一次，生产环境中可改为更长间隔，如 5 分钟）
         schedule.every(5).seconds.do(poll)
         
         print("启动轮询任务，每 5 秒检测一次数据更新...")
         # 首次轮询
         poll()
         
         # 循环等待下一次调度任务
         while True:
             schedule.run_pending()
             time.sleep(1)