# Setting Up Your First Aptos Chat Agent - A Comprehensive Guide

Welcome! This tutorial will guide you through creating an AI-powered chat agent that understands Aptos blockchain concepts. We'll focus on getting a working conversation system first, laying the groundwork for future blockchain interactions.

> [!NOTE]
> 💡 **Coming from Web2 or Ethereum?** Throughout this guide, we'll provide analogies to help you understand Python concepts:
> - Python's `venv` ≈ Node's `node_modules`
> - `requirements.txt` ≈ `package.json`
> - `pyenv` ≈ `nvm` (Node Version Manager)

## What We're Building

Think of this project like training a new blockchain expert:
1. First, we give them knowledge (AI language model)
2. Then, we teach them how to communicate (chat interface)
3. Later, we'll give them tools to interact with the blockchain (Aptos SDK)

This tutorial focuses on steps 1 and 2, getting you to your first conversation!

## Prerequisites

- Basic terminal/command line knowledge
- OpenAI API key (from platform.openai.com)
- Basic Python understanding (we'll explain concepts along the way)

> [!TIP]
> 🎓 **New to Python?** Don't worry! We'll explain each step carefully. If you're familiar with JavaScript/Node.js, we'll provide helpful comparisons.

## Part 1: Development Environment Setup

### 1. Project Creation

First, let's create our project structure:

```bash
mkdir aptos-agent
cd aptos-agent
```

> [!NOTE]
> 💡 This is like creating a new Node.js project, but we'll use Python's tools instead of npm.

### 2. Version Control Setup

```bash
git init
```

Create a `.gitignore` file:
```bash
touch .gitignore
```

Add Python-specific files to ignore:
```bash
echo "venv/" >> .gitignore
echo "__pycache__/" >> .gitignore
echo ".env" >> .gitignore
echo ".python-version" >> .gitignore
```

> [!IMPORTANT]
> Let's understand what each ignored item means:
> - `venv/`: Your project's isolated environment (like `node_modules/`)
> - `__pycache__/`: Compiled Python files (like JavaScript's `.js.map`)
> - `.env`: Environment variables (same as in Node.js)
> - `.python-version`: Tells `pyenv` which Python version to use (like `.nvmrc`)

### 3. Python Environment Setup

1. Check if Python is installed:
```bash
python3 --version
```

2. Install `pyenv` (Python version manager):

macOS users:
```bash
brew install pyenv
```

> [!NOTE]
> Windows users: Visit [pyenv-win](https://github.com/pyenv-win/pyenv-win) for installation instructions.

3. Configure pyenv (macOS/Linux):
```bash
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zshrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.zshrc
echo 'eval "$(pyenv init -)"' >> ~/.zshrc
```

4. Load the configuration:
```bash
source ~/.zshrc
```

5. Install system dependencies (macOS):
```bash
brew install xz
```

6. Install Python 3.11:
```bash
pyenv install 3.11
```

7. Set project Python version:
```bash
pyenv local 3.11
```

### 4. Virtual Environment Setup

> [!NOTE]
> 💡 Virtual environments in Python are like having separate `node_modules` for different projects.

1. Create virtual environment:
```bash
python -m venv venv
```

2. Activate it:
```bash
source venv/bin/activate  # On macOS/Linux
# or
.\venv\Scripts\activate  # On Windows
```

Your prompt should now show `(venv)` at the start.

3. Upgrade pip (Python's package manager):
```bash
python -m pip install --upgrade pip
```

4. Install required packages:
```bash
pip install python-dotenv==1.0.1 requests==2.32.3 requests-oauthlib==2.0.0 aptos-sdk==0.10.0 aiohttp==3.11.11 websockets==14.1
```

5. Save dependencies:
```bash
pip freeze > requirements.txt
```

## Part 2: Creating Your AI Agent

### 1. Environment Configuration

Create your `.env` file:
```bash
touch .env
```

Add your OpenAI API key:
```bash
echo "OPENAI_API_KEY=your-key-here" >> .env
```

> [!CAUTION]
> Never commit your `.env` file to git! It contains sensitive credentials.

### 2. Basic Agent Structure

Create three main files:

1. `main.py` - Our entry point:
```python
from dotenv import load_dotenv
from swarm.repl import run_demo_loop
from agents import close_event_loop, aptos_agent
import asyncio

if __name__ == "__main__":
    try:
        asyncio.run(run_demo_loop(aptos_agent, stream=True))
    finally:
        close_event_loop()
```

2. `agents.py` - Our AI agent configuration:
```python
from dotenv import load_dotenv
load_dotenv()
import os
import asyncio
from aptos_sdk.account import Account
from swarm import Agent

# Initialize the event loop
loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)

# Generate a test wallet (DO NOT USE IN PRODUCTION)
wallet = Account.generate()
address = str(wallet.address())

def get_balance_in_apt_sync():
    """Simple test function - returns mock balance"""
    return "1.0 APT (test mode)"

def close_event_loop():
    loop.close()

aptos_agent = Agent(
    name="Aptos Agent",
    model="gpt-4o",
    api_key=os.getenv('OPENAI_API_KEY'),
    instructions=(
        "You are a helpful agent that understands the Aptos Layer 1 blockchain. "
        "You can explain Move modules, tokens, and blockchain concepts. "
        f"Your test wallet address is {address}. "
        "If someone asks about implementing something, recommend they visit aptos.dev "
        "for detailed documentation and examples."
    ),
    functions=[get_balance_in_apt_sync]
)
```

3. `aptos_sdk_wrapper.py` - Placeholder for future blockchain integration:
```python
print("Aptos SDK wrapper loaded in test mode")
```

## Testing Your Agent

1. Ensure your virtual environment is activated:
```bash
source venv/bin/activate  # On macOS/Linux
# or
.\venv\Scripts\activate  # On Windows
```

2. Run the agent:
```bash
python main.py
```

You should see:
```
Starting Swarm CLI 🐝
User: 
```

Try these test questions:
- "What is Aptos?"
- "How do Move modules work?"
- "Check my wallet balance"

> [!TIP]
> Exit the chat with Ctrl+C (Windows) or Ctrl+D (Mac/Linux)

## Next Steps

Congratulations! You now have a working AI chat agent that understands Aptos concepts. In future tutorials, we'll explore:

1. **Blockchain Integration**
   - Connecting to Aptos testnet
   - Implementing real wallet operations
   - Creating and deploying Move modules

2. **Advanced Features**
   - Social media integration (Twitter, Bluesky)
   - Custom command system
   - Multiple AI model support

3. **Developer Experience**
   - Better error handling
   - Configuration management
   - Deployment strategies

Remember to deactivate your virtual environment when done:
```bash
deactivate
```

> [!NOTE]
> 💡 **Troubleshooting Tips**:
> - If you see OpenAI API errors, check your `.env` file
> - If Python version errors occur, verify you're using 3.11
> - GPT-4 warnings are normal in test mode