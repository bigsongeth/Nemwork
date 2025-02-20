# websocket_server.py
import asyncio
import websockets
import json
from agents import aptos_agent, close_event_loop, wallet
from swarm import Swarm

async def handle_websocket(websocket):
    client = Swarm()
    messages = []
    agent_wallet_address = str(wallet.address())
    print(f"AI Agent wallet address: {agent_wallet_address}")
    
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                user_message = data.get('message')
                investment_style = data.get('investmentStyle', 'balanced')
                wallet_address = data.get('walletAddress')
                
                print(f"Received message: {user_message}")
                print(f"Investment style: {investment_style}")
                print(f"User wallet address: {wallet_address}")
                
                # 添加用户消息到历史
                messages.append({"role": "user", "content": user_message})
                
                # 运行agent
                response = client.run(
                    agent=aptos_agent,
                    messages=messages,
                    context_variables={
                        "investment_style": investment_style,
                        "wallet_address": wallet_address,
                        "agent_wallet_address": agent_wallet_address
                    },
                    stream=True
                )
                
                # 流式发送响应
                try:
                    print("Starting to process response chunks...")
                    full_message = ""
                    
                    for chunk in response:
                        print(f"Raw chunk: {chunk}")
                        
                        if isinstance(chunk, dict):
                            if chunk.get('delim') == 'end':
                                # 当收到结束标记时，发送完整消息
                                if full_message:
                                    await websocket.send(json.dumps({
                                        "type": "content",
                                        "content": full_message
                                    }))
                                continue
                            
                            # 处理工具调用的情况
                            if chunk.get('content') == '' and chunk.get('tool_calls'):
                                tool_response = chunk.get('tool_calls')[0].get('function', {}).get('name', '')
                                if tool_response:
                                    full_message = f"正在执行: {tool_response}"
                                continue
                            
                            content = chunk.get('content', '')
                            if content:
                                full_message += content
                                
                        elif isinstance(chunk, str):
                            full_message += chunk
                            
                        elif hasattr(chunk, 'messages'):
                            messages_list = getattr(chunk, 'messages', [])
                            if messages_list:
                                for msg in messages_list:
                                    if msg.get('content'):
                                        full_message = msg.get('content')
                                        await websocket.send(json.dumps({
                                            "type": "content",
                                            "content": full_message
                                        }))
                    
                    # 如果还有未发送的消息，发送它
                    if full_message:
                        await websocket.send(json.dumps({
                            "type": "content",
                            "content": full_message
                        }))
                            
                except Exception as e:
                    print(f"Error streaming response: {str(e)}")
                    await websocket.send(json.dumps({
                        "type": "error",
                        "error": f"Error streaming response: {str(e)}"
                    }))
                
                # 发送完成信号
                await websocket.send(json.dumps({
                    "type": "done"
                }))
                
                # 添加助手响应到历史
                if hasattr(response, 'messages'):
                    messages.extend(response.messages)
                
            except Exception as e:
                print(f"Error processing message: {str(e)}")
                await websocket.send(json.dumps({
                    "type": "error",
                    "error": str(e)
                }))
    except Exception as e:
        print(f"WebSocket connection error: {str(e)}")
    finally:
        close_event_loop()

async def main():
    print("Starting WebSocket server on ws://localhost:8000")
    async with websockets.serve(handle_websocket, "localhost", 8000):
        await asyncio.Future()  # 运行永久

if __name__ == "__main__":
    asyncio.run(main())