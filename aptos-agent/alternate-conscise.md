# Setting Up Your First Aptos AI Agent - A Guide for JavaScript Developers

Create an AI-powered agent that can interact with the Aptos blockchain, combining the capabilities of GPT models with blockchain operations. This guide helps JavaScript developers get started with Python and Aptos.

> [!NOTE]  
> If you're already familiar with Python, you can skip directly to [Part 2: Building the Agent](#part-2-building-the-agent).

You'll learn how to:
1. Set up a Python development environment (similar to Node.js setup)
2. Create a virtual environment (like `node_modules` but for Python)
3. Build an AI agent that can interact with Aptos blockchain

## Prerequisites

- Basic JavaScript/Node.js knowledge
- Terminal familiarity
- OpenAI API key (for Part 2)

## Part 1: Environment Setup

### Setting up Python

1. Check your Python installation:
```bash
python3 --version
```

> [!NOTE]  
> Don't worry if this fails - we'll install Python next.

2. Install pyenv (Python version manager):
```bash
# Mac
brew install pyenv

# Linux/WSL
curl https://pyenv.run | bash
```

3. Configure your shell:
```bash
# For zsh (Mac default)
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zshrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.zshrc
echo 'eval "$(pyenv init -)"' >> ~/.zshrc
source ~/.zshrc

# For bash
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
source ~/.bashrc
```

4. Install Python dependencies:
```bash
# Mac
brew install xz

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y make build-essential libssl-dev zlib1g-dev \
libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev
```

5. Install Python 3.11:
```bash
pyenv install 3.11
```

### Project Setup

1. Create and navigate to project directory:
```bash
mkdir aptos-agent
cd aptos-agent
```

2. Initialize git and create `.gitignore`:
```bash
git init
echo "venv/" >> .gitignore
echo "__pycache__/" >> .gitignore
echo ".env" >> .gitignore
echo ".python-version" >> .gitignore
```

3. Set Python version for project:
```bash
pyenv local 3.11
```

4. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # For Mac/Linux
# OR
.\venv\Scripts\activate   # For Windows
```

5. Install dependencies:
```bash
python -m pip install --upgrade pip
pip install python-dotenv requests requests-oauthlib aptos-sdk openai
pip freeze > requirements.txt
```

## Part 2: Building the Agent

### Environment Configuration

1. Create `.env` file:
```bash
echo "OPENAI_API_KEY=your-key-here" >> .env
```

### Creating Core Files

1. Create the SDK wrapper (`aptos_sdk_wrapper.py`):
```python
import os
from aptos_sdk.account import Account, AccountAddress
from aptos_sdk.async_client import FaucetClient, RestClient
from aptos_sdk.transactions import EntryFunction, TransactionArgument, TransactionPayload
from aptos_sdk.bcs import Serializer

# Initialize clients
rest_client = RestClient("https://api.testnet.aptoslabs.com/v1")
faucet_client = FaucetClient("https://faucet.testnet.aptoslabs.com", rest_client)

async def fund_wallet(wallet_address, amount):
    """Funds a wallet with test APT."""
    print(f"Funding wallet: {wallet_address} with {amount} APT")
    amount = int(amount)
    if amount > 1000:
        raise ValueError("Amount too large. Please specify an amount less than 1000 APT")
    octas = amount * 10**8  # Convert APT to octas
    if isinstance(wallet_address, str):
        wallet_address = AccountAddress.from_str(wallet_address)
    txn_hash = await faucet_client.fund_account(wallet_address, octas, True)
    return wallet_address

async def get_balance(wallet_address):
    """Gets wallet balance."""
    if isinstance(wallet_address, str):
        wallet_address = AccountAddress.from_str(wallet_address)
    balance = await rest_client.account_balance(wallet_address)
    return balance / 10**8  # Convert octas to APT
```

2. Create the agent file (`agents.py`):
```python
import os
import asyncio
from dotenv import load_dotenv
from aptos_sdk.account import Account
from aptos_sdk_wrapper import get_balance, fund_wallet

load_dotenv()

# Initialize event loop
loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)

# Test wallet initialization
wallet = Account.load_key("0x63ae44a3e39c934a7ae8064711b8bac0699ece6864f4d4d5292b050ab77b4f6b")
address = str(wallet.address())

def get_balance_in_apt_sync():
    try:
        return loop.run_until_complete(get_balance(address))
    except Exception as e:
        return f"Error getting balance: {str(e)}"

def fund_wallet_in_apt_sync(amount: int):
    try:
        return loop.run_until_complete(fund_wallet(address, amount))
    except Exception as e:
        return f"Error funding wallet: {str(e)}"

def close_event_loop():
    loop.close()

# Initialize agent
aptos_agent = {
    "name": "Aptos Agent",
    "get_balance": get_balance_in_apt_sync,
    "fund_wallet": fund_wallet_in_apt_sync
}
```

3. Create main entry point (`main.py`):
```python
from dotenv import load_dotenv
from agents import aptos_agent, close_event_loop

if __name__ == "__main__":
    try:
        load_dotenv()
        print("Aptos Agent Test Mode")
        print(f"Agent name: {aptos_agent['name']}")
        print(f"Test balance: {aptos_agent['get_balance']()}")
    finally:
        close_event_loop()
```

### Testing Your Setup

1. Run the agent:
```bash
python main.py
```

You should see output like:
```
Aptos Agent Test Mode
Agent name: Aptos Agent
Test balance: 1.0 APT (test mode)
```

## Common Issues and Solutions

> [!IMPORTANT]  
> - If you see "command not found: pyenv", restart your terminal
> - If OpenAI API errors occur, check your API key in `.env`
> - For Python version errors, verify you're using Python 3.11+

## Next Steps

1. Learn about [Move programming](https://aptos.dev/guides/move-guides/move-introduction/)
2. Explore [Aptos SDK documentation](https://aptos.dev/sdks/python-sdk)
3. Add more blockchain capabilities to your agent

> [!NOTE]  
> Remember to deactivate your virtual environment when done:
> ```bash
> deactivate
> ```