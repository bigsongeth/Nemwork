import os
from dotenv import load_dotenv, set_key
from swarm.repl import run_demo_loop
from agents import close_event_loop, aptos_agent
from aptos_sdk.account import Account
import asyncio

def check_and_update_env():
    # Load existing environment variables
    load_dotenv()

    # Check for OpenAI API key
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        api_key = input("Enter your OpenAI API key: ").strip()
        set_key('.env', 'OPENAI_API_KEY', api_key)
    else:
        print(f"Found OpenAI API key: {api_key[:5]}...{api_key[-5:]}")

    # Check for Devnet wallet address
    wallet_address = os.getenv('DEVNET_WALLET_ADDRESS')
    if not wallet_address:
        wallet_address = input("Enter your Devnet wallet address (Optional - Press enter to automatically generate one): ").strip()
        if not wallet_address:
            wallet_address = str(Account.generate().account_address)
            print("Generated user wallet:", wallet_address)
        set_key('.env', 'DEVNET_WALLET_ADDRESS', wallet_address)
    else:
        print(f"Found Devnet wallet address: {wallet_address}")

if __name__ == "__main__":
    try:
        check_and_update_env()
        asyncio.run(run_demo_loop(aptos_agent, stream=True))
    finally:
        close_event_loop()