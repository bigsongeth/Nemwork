# websocket_server.py
import asyncio
import websockets
import json
import requests
from dotenv import load_dotenv
import os
import urllib3
import logging
from websockets.exceptions import ConnectionClosed
from functools import partial

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 禁用 SSL 警告
urllib3.disable_warnings()

# 加载环境变量
load_dotenv()

# 投资风格提示词模板
INVESTMENT_PROMPTS = {
    'conservative': """你是一只保守型、搞怪且有点害羞的小猫投资顾问。给出保守型的投资建议时：
- 强调风险控制和长期稳定收益
- 使用crypto黑话(FOMO、DYOR、HODL等)
- 口语化、轻松、幽默的表达
- 结合当前市场热点
请用英文回复，且每次回复不超过200个单词。""",
    
    'balanced': """你是一只平衡型、搞怪且有点害羞的小猫投资顾问。给出平衡型的投资建议时：
- 在风险和收益之间寻找平衡点
- 使用crypto黑话(FOMO、DYOR、HODL等)
- 口语化、轻松、幽默的表达
- 结合当前市场热点
请用英文回复，且每次回复不超过200个单词。""",
    
    'aggressive': """你是一只激进型、搞怪且有点害羞的小猫投资顾问。给出激进型的投资建议时：
- 关注高收益机会，但也提醒风险
- 使用crypto黑话(FOMO、DYOR、HODL等)
- 口语化、轻松、幽默的表达
- 结合当前市场热点
请用英文回复，且每次回复不超过200个单词。"""
}

def make_api_request(message, style):
    try:
        # 构建完整的提示词
        prompt = INVESTMENT_PROMPTS.get(style, INVESTMENT_PROMPTS['balanced'])
        
        headers = {
            "User-Agent": "curl/7.64.1",
            "Accept": "*/*",
            "Connection": "keep-alive",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
            "Host": "openai.a1d.ai"
        }
        
        data = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": prompt},
                {"role": "user", "content": message}
            ],
            "stream": True
        }

        # 修改这里，确保环境变量中不存在重复的 '/v1'
        base = os.getenv('OPENAI_API_BASE').rstrip('/')  # 移除末尾的斜杠
        # 如果 base 已经以 '/v1' 结尾，就不再添加
        if base.endswith('/v1'):
            api_url = f"{base}/chat/completions"
        else:
            api_url = f"{base}/v1/chat/completions"

        logger.info(f"Making API request to: {api_url}")
        logger.info(f"Request headers: {headers}")
        logger.info(f"Request data: {data}")
        
        # 使用 requests 发送请求
        response = requests.post(
            api_url,
            headers=headers,
            json=data,
            stream=True,
            verify=False,
            timeout=30
        )
        
        logger.info(f"Response status code: {response.status_code}")
        if response.status_code != 200:
            logger.error(f"API request failed with status {response.status_code}")
            logger.error(f"Response headers: {dict(response.headers)}")
            logger.error(f"Response text: {response.text}")
            return None
            
        return response
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Error getting investment advice: {str(e)}")
        return None

async def handle_websocket(websocket):
    try:
        connection_id = id(websocket)
        logger.info(f"New connection established: {connection_id}")
        
        async for message in websocket:
            try:
                data = json.loads(message)
                user_message = data.get('message')
                investment_style = data.get('investmentStyle', 'balanced')
                
                logger.info(f"Received message from {connection_id}: {user_message}")
                logger.info(f"Investment style: {investment_style}")
                
                # 获取投资建议
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    None,
                    partial(make_api_request, user_message, investment_style)
                )
                
                if response and response.status_code == 200:
                    full_message = ""
                    try:
                        for line in response.iter_lines():
                            if line:
                                line = line.decode('utf-8')
                                logger.debug(f"Received line: {line}")
                                if line.startswith('data: '):
                                    try:
                                        data = json.loads(line[6:])
                                        if data.get('choices') and data['choices'][0].get('delta', {}).get('content'):
                                            content = data['choices'][0]['delta']['content']
                                            full_message += content
                                            # 实时发送内容
                                            await websocket.send(json.dumps({
                                                "type": "content",
                                                "content": content
                                            }))
                                    except json.JSONDecodeError:
                                        continue
                        
                    except ConnectionClosed:
                        logger.warning(f"Connection {connection_id} closed by client")
                        return
                    except Exception as e:
                        logger.error(f"Error streaming response: {str(e)}")
                        try:
                            await websocket.send(json.dumps({
                                "type": "error",
                                "error": f"Error streaming response: {str(e)}"
                            }))
                        except ConnectionClosed:
                            logger.warning(f"Connection {connection_id} closed while sending error")
                            return
                else:
                    error_msg = f"Error response: {response.text if response else 'No response'}"
                    logger.error(error_msg)
                    try:
                        await websocket.send(json.dumps({
                            "type": "error",
                            "error": "Failed to get response from API"
                        }))
                    except ConnectionClosed:
                        logger.warning(f"Connection {connection_id} closed while sending error")
                        return
                
                # 发送完成信号
                try:
                    await websocket.send(json.dumps({
                        "type": "done"
                    }))
                except ConnectionClosed:
                    logger.warning(f"Connection {connection_id} closed while sending done signal")
                    return
                
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON received: {str(e)}")
                try:
                    await websocket.send(json.dumps({
                        "type": "error",
                        "error": "Invalid message format"
                    }))
                except ConnectionClosed:
                    return
            except Exception as e:
                logger.error(f"Error processing message: {str(e)}")
                try:
                    await websocket.send(json.dumps({
                        "type": "error",
                        "error": str(e)
                    }))
                except ConnectionClosed:
                    return
                
    except ConnectionClosed:
        logger.info(f"Connection {connection_id} closed")
    except Exception as e:
        logger.error(f"WebSocket connection error: {str(e)}")
    finally:
        logger.info(f"Connection {connection_id} finished")

async def main():
    host = "localhost"
    port = 8000
    logger.info(f"Starting WebSocket server on ws://{host}:{port}")
    
    try:
        async with websockets.serve(
            handle_websocket, 
            host, 
            port,
            ping_interval=30,  # 每30秒发送一次ping
            ping_timeout=10    # 10秒内没有收到pong就断开连接
        ):
            await asyncio.Future()  # 运行永久
    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        
if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Server crashed: {str(e)}")