import requests

def send_command(command):
    # 指定服务的地址（请确认端口和地址是否正确）
    url = "http://127.0.0.1:5000/command"
    payload = {"command": command}
    
    try:
        # 发送 POST 请求
        response = requests.post(url, json=payload)
        
        # 判断是否成功响应，并返回处理结果
        if response.status_code == 200:
            result = response.json()
            return result
        else:
            return {"status": "error", "result": f"HTTP错误，状态码: {response.status_code}"}
    except Exception as e:
        return {"status": "error", "result": str(e)}

if __name__ == "__main__":
    # 从终端获取用户输入的指令
    cmd = input("请输入指令：")
    
    # 发送指令给本地服务，并获取返回结果
    result = send_command(cmd)
    
    # 输出返回的结果
    print("服务返回：", result) 