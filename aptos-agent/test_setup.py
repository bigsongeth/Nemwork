import os
from dotenv import load_dotenv
import openai
import httpx

load_dotenv()

def test_openai_connection():
    """Test OpenAI API connection"""
    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}"
        }
        
        data = {
            "model": "gpt-4o-mini",
            "messages": [
                {
                    "role": "system",
                    "content": "你是一个有帮助的AI助手。"
                },
                {
                    "role": "user",
                    "content": "Say hello!"
                }
            ],
            "max_tokens": 150,
            "temperature": 0.7
        }
        
        client = httpx.Client()
        response = client.post(
            os.getenv('OPENAI_API_BASE') + "/chat/completions",
            headers=headers,
            json=data
        )
        
        if response.status_code == 200:
            result = response.json()
            print("OpenAI Connection Test:", result["choices"][0]["message"]["content"])
            return True
        else:
            print(f"OpenAI Connection Error: Status {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"OpenAI Connection Error: {str(e)}")
        return False

def test_aptos_connection():
    """Test Aptos connection"""
    from agents import get_balance_in_apt_sync
    try:
        balance = get_balance_in_apt_sync()
        print(f"Aptos Connection Test - Balance: {balance}")
        return True
    except Exception as e:
        print(f"Aptos Connection Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("Testing connections...")
    openai_ok = test_openai_connection()
    aptos_ok = test_aptos_connection()
    
    if openai_ok and aptos_ok:
        print("\n✅ All connections successful!")
    else:
        print("\n❌ Some connections failed. Check errors above.")