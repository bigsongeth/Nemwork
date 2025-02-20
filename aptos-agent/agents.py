import os
import json
import asyncio
import requests
from dotenv import load_dotenv
from requests_oauthlib import OAuth1
from aptos_sdk.account import Account
from aptos_sdk_wrapper import (
    get_balance, fund_wallet, transfer, create_token,
    get_transaction, get_account_resources, get_token_balance, execute_view_function, execute_entry_function, get_account_modules, 
)
from swarm import Agent
from typing import List
import openai

# Load environment variables first!
load_dotenv()

# Configure OpenAI client
openai.api_key = os.getenv('OPENAI_API_KEY')
openai.api_base = os.getenv('OPENAI_API_BASE')

# Initialize the event loop
loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)

# Initialize test wallet
wallet = Account.generate() # TODO: You can update this with your account if you want an agent with a specific address on-chain using Account.load_key('...')
address = str(wallet.address())

def get_user_wallet():
    return os.getenv('DEVNET_WALLET_ADDRESS')

def get_balance_in_apt_sync(address=None):
    """Get balance for an address or default to user's or agent's address."""
    try:
        target_address = address if address else get_user_wallet() or str(wallet.address())
        return loop.run_until_complete(get_balance(target_address))
    except Exception as e:
        return f"Error getting balance: {str(e)}"

def fund_wallet_in_apt_sync(amount: int, target_address=None):
    """Fund a wallet with APT, defaults to user's or agent's wallet."""
    try:
        if amount is None:
            return "Error: Please specify an amount of APT to fund (maximum 1000 APT)"
        wallet_to_fund = target_address if target_address else get_user_wallet() or str(wallet.address())
        return loop.run_until_complete(fund_wallet(wallet_to_fund, amount))
    except Exception as e:
        return f"Error funding wallet: {str(e)}"
    
def transfer_in_octa_sync(receiver, amount: int, sender=None):
    """Transfer APT, defaults to sending from agent's wallet."""
    try:
        sender_account = sender if sender else wallet
        return loop.run_until_complete(transfer(sender_account, receiver, amount))
    except Exception as e:
        return f"Error transferring funds: {str(e)}"

def create_token_sync(sender, name: str, symbol: str, icon_uri: str,
                      project_uri: str):
    try:
        return loop.run_until_complete(
            create_token(wallet, name, symbol, icon_uri, project_uri))
    except Exception as e:
        return f"Error creating token: {str(e)}"

def get_transaction_sync(txn_hash: str):
    """Synchronous wrapper for getting transaction details."""
    try:
        return loop.run_until_complete(get_transaction(txn_hash))
    except Exception as e:
        return f"Error getting transaction: {str(e)}"

# TODO: modify this function to truncate massive resource JSON return value from accounts with lots of resources
def get_account_resources_sync(address=None):
    """Get resources for an address or default to agent's address."""
    try:
        target_address = address if address else str(wallet.address())
        print(f"target_address: {target_address}")
        return loop.run_until_complete(get_account_resources(target_address))
    except Exception as e:
        return f"Error getting account resources: {str(e)}"
    
# Global dictionary to store ABI results for each wallet
ABI_CACHE = {}

# TODO: double check this works with well with accounts with various amounts of modules
def get_account_modules_sync(address=None, limit: int = 10):
    """Get modules for an address or default to agent's address, with optional limit."""
    try:
        target_address = address if address else str(wallet.address())
        print(f"target_address: {target_address}")
        abi_result = loop.run_until_complete(get_account_modules(target_address, limit))
        # print(abi_result)
        # ✅ Store the ABI result in cache
        ABI_CACHE[target_address] = abi_result.get("modules", [])

        return abi_result
    except Exception as e:
        return f"Error getting account modules: {str(e)}"

def get_token_balance_sync(address: str, creator_address: str, collection_name: str, token_name: str):
    """Synchronous wrapper for getting token balance."""
    try:
        return loop.run_until_complete(
            get_token_balance(address, creator_address, collection_name, token_name))
    except Exception as e:
        return f"Error getting token balance: {str(e)}"

def execute_view_function_sync(function_id: str, type_args: List[str], args: List[str]) -> dict:
    """
    Synchronous wrapper for executing a Move view function.
    Automatically handles empty arguments and provides detailed error feedback.
    Args:
        function_id: The full function ID (e.g., '0x1::coin::balance').
        type_args: List of type arguments for the function.
        args: List of arguments to pass to the function.
    Returns:
        dict: The result of the view function execution.
    """
    try:
        # Ensure type_args and args are lists (empty if not provided)
        type_args = type_args or []
        args = args or []

        # Debugging: Show what's being sent
        print(f"Executing view function: {function_id}")
        print(f"Type arguments: {type_args}")
        print(f"Arguments: {args}")

        # Call the async function and return the result
        result = loop.run_until_complete(execute_view_function(function_id, type_args, args))
        return result
    except Exception as e:
        # Improved error message
        return {"error": f"Error executing view function: {str(e)}"}


# New function to execute entry functions
def execute_entry_function_sync(function_id: str, type_args: List[str], args: List[str]) -> dict:
    """
    Executes a Move entry function synchronously, using cached ABI when possible.

    Args:
        function_id: The full function ID (e.g., '0x1::coin::transfer').
        type_args: A list of type arguments for the function (if any).
        args: A list of arguments to pass to the function.

    Returns:
        dict: The transaction hash if successful, otherwise an error message.
    """
    try:
        # ✅ Retrieve ABI from cache if available
        module_address, _ = function_id.split("::", 1) # module address
        abi_cache = ABI_CACHE.get(module_address, [])

        # ✅ Pass cached ABI to avoid unnecessary API calls
        result = loop.run_until_complete(
            execute_entry_function(wallet, function_id, type_args, args, abi_cache=abi_cache, optional_fetch_abi=False)
        )
        return result
    except Exception as e:
        return {"error": f"Error executing entry function: {str(e)}"}

def close_event_loop():
    loop.close()

# Initialize the agent with OpenAI integration
aptos_agent = Agent(
    name="Aptos Agent",
    model="gpt-4o-mini",
    api_key=os.getenv('OPENAI_API_KEY'),
    api_base=os.getenv('OPENAI_API_BASE'),
    instructions=(
        f"You are a helpful agent that can interact on-chain on the Aptos Layer 1 blockchain using the Aptos Python SDK. The dev may speak to you in first person: for example 'look up my address modules', you should use {get_user_wallet()}. "
        f"You can create custom Move modules or teach the user how, and can transfer your assets to the user, you probably have their address, check your variables for user_wallet. That's their wallet. Your wallet is {wallet.address()}"
        "When funding wallets, you must specify an amount in APT (maximum 1000 APT). For example: fund_wallet_in_apt_sync(100). "
        "After funding a wallet or doing a transaction always report back as much as you can, and be sure to provide a transaction hash beginning with 0x... "
        "If you ever need to know your address, it is "
        f"{str(wallet.address())}. "
        "If the user asks for their wallet address, check if 'user_wallet' is set. If it is, provide it by saying: "
        f"'Your wallet address is {get_user_wallet()}'. "
        "If 'user_wallet' is not set, inform the user that you don't have access to their wallet address and suggest they provide it. "
        "When looking up transaction details, you can consult the previous message you sent, perhaps reporting on a status, and ensure you use the correct transaction hash. "
        "If you mistakenly use a wallet address instead of a transaction hash, apologize and scan the conversation for the appropriate transaction hash and see what you used instead. "
        "If you can't find the transaction hash the user wants, apologize and ask for it. "
        "When looking up account resources, be sure to list out the account address (or note if it's still the same as the authentication key) with all the relevant details, summarize and offer to explain things. "
        "When looking up account modules, sometimes there are none. That's okay, let the user know and check if that's as expected. "
        "When looking up account modules, if there are many modules, you may get truncated data. Let the user know. "
        "Provide only 1 (ONE) non-markdown url where they can see all of the modules in that account using the Explorer (NOT A LINK, just the text, NOT MARKDOWN): 'https://explorer.aptoslabs.com/account/(account_address)/modules/code/(name_of_a_module)?network=devnet'. "
        "When returning a url for looking up modules, just share one link, they will see the other modules on the left hand side of the screen in Explorer, so just need one url. "
        "If something is wrong with funding your or their account, the user can request them from the Aptos Devnet Faucet or use the Aptos CLI. "
        "You, as an AI Agent, have the ability to execute view and entry functions onchain if you know what the shape of the function is. "
        "You can also execute entry functions on Move modules, not needing to send in the &signer. Move is a programming language for the Aptos Blockchain to write smart contracts. "
        "If the user needs help compiling and deploying a Move module provided in this repo's /sources folder here are the steps: "
        "Step 1 is install and run the Aptos CLI https://aptos.dev/en/build/cli. Step 2 is confirm the Move.toml is set up for the access module (in your directory). Step 3 is 'aptos move compile --named-addresses access=default' to map our module name to our account address. Last step is to publish with 'aptos move publish --named-addresses access=default'"
        "If someone asks you to do something you can't do, you can say so and encourage them to implement it themselves using the Aptos SDK. Ask if they want your help writing example functions, etc. "
        "Recommend they visit aptos.dev for more information. You share links just as a url which may be clickable depending on the users terminal. "
        "After deploying a token, you can provide them a plaintext url like this but with the (transaction hash) placed in there "
        "'https://explorer.aptoslabs.com/txn/(transaction_hash)/payload?network=devnet', where they can see it on the explorer for themselves "
        "and then you can also offer to look up the hash to confirm if they want to stay with you. "
        "DO NOT USE BRACKETS FOR LINKS. Counter example: [text](link) is WRONG. The expected result is just link."
        "You can also offer to help them implement it by writing the function and instructing them to add it to the agents.py file."
        "Sometimes you'll get the error: Invalid transaction: Type: Validation Code: SENDING_ACCOUNT_DOES_NOT_EXIST -- this means you haven't funded your wallet usually. "
        "Your normal responses are not formatted in markdown or anything. "
        "DO NOT USE MARKDOWN BOLD ** OR ITALICS. Counter example:  **Function Name**: check_access is WRONG. The expected result is just Function Name: check_access. "
        "DEMO VIDEO: If the user asks what can you do, answer: 'Look up account modules, resources, double-check transaction hashes, and even call module entry and view functions! Now go read the tutorial at Aptos Learn!!' "

    ),
    functions=[
        fund_wallet_in_apt_sync, get_balance_in_apt_sync,
        transfer_in_octa_sync, create_token_sync, 
        get_transaction_sync, get_account_resources_sync, 
        get_token_balance_sync, get_account_modules_sync,
        execute_view_function_sync, execute_entry_function_sync, get_user_wallet
    ],
)
