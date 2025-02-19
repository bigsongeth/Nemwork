from flask import Flask, request, jsonify
from flask_cors import CORS  # 新增导入
import subprocess
import time
import re  # 导入正则表达式模块

app = Flask(__name__)
CORS(app)  # 启用 CORS，允许所有来源的请求

# —— 保留原有 /command 路由 ——
@app.route('/command', methods=['POST'])
def receive_command():
    # 获取客户端发来的 JSON 数据
    data = request.get_json()
    command = data.get('command', '')  # 从 "command" 字段中获取指令

    # 等待10秒后再执行指令
    time.sleep(10)
    
    # 构造 combined_prompt，用于传入子进程
    combined_prompt = f"{command}\n\nYou are a crypto analyst, You will be given a set of transaction data, you need to analyze the transaction data and provide a summary of the transaction data. Be extremely concise and do not include explanations, reasoning, or any additional commentary. Don't just organize the information into a list, you have to provide your thought on it, based on your knowledge of the market."

    try:
        # 只调用一次 ollama run deepseek-r1:8b，将 combined_prompt 作为标准输入传入
        result = subprocess.run(
            ["ollama", "run", "deepseek-r1:8b"],
            input=combined_prompt,
            text=True,
            capture_output=True,
            check=True
        )
        final_result = result.stdout.strip()

        # 使用正则表达式删除从字符串开始到第一个 </think>（包含 </think>）之前的所有内容
        final_result = re.sub(r'^.*?</think>', '', final_result, flags=re.DOTALL)
        final_result = final_result.strip()
    except subprocess.CalledProcessError as e:
        final_result = f"Error running ollama: {e}"
    
    return jsonify({
        'status': 'success',
        'result': final_result
    }), 200

# 新增路由，通过调用 basescan_logs.py 来触发整个流程并返回 app.py 的 response
@app.route("/fetchTransfer", methods=["GET"])
def fetch_transfer():
    try:
        # 用 --once 参数只调用一次 basescan_logs.py
        result = subprocess.run(
            ["python3", "scripts/basescan_logs.py", "--once"],
            capture_output=True, text=True, check=True
        )
        stdout = result.stdout
        marker = "FINAL_RESPONSE:"
        response_text = "No response captured."
        for line in stdout.splitlines():
            if marker in line:
                response_text = line.split(marker, 1)[1].strip()
                break
        return jsonify({"result": response_text})
    except Exception as e:
        return jsonify({"result": f"Error running basescan_logs.py: {e}"})

if __name__ == '__main__':
    # Flask 默认跑在 5000 端口，也可以通过指定 host 和 port 进行修改
    app.run(debug=True)