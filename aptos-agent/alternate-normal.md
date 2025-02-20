# Setting Up Your First Aptos AI Agent: A Guide for JavaScript Developers

This tutorial will help you create an AI-powered blockchain assistant using Python and the Aptos blockchain. Think of it as building your own `ethers.js`-like interface, but with AI capabilities built in.

By the end of this tutorial, you'll have:
1. A working Python development environment (similar to your Node.js setup)
2. A basic AI agent that can interact with the Aptos blockchain
3. A local test environment for blockchain development

> [!NOTE]  
> If you're comfortable with Node.js/JavaScript, we'll provide familiar analogies throughout this guide to help you understand Python's approach.

## Setup

Before we begin, we'll need to set up our Python development environment. Think of this like setting up Node.js and npm, but for Python.

### Prerequisites

You'll need:
- Terminal access
- Git installed
- OpenAI API key (from platform.openai.com)
- Package manager (Homebrew for Mac, apt for Linux, or chocolatey for Windows)

> [!IMPORTANT]  
> This guide uses Mac-based commands. For Windows/Linux users, we'll provide alternative commands in callouts.

### Steps

1. Create your project directory:
    ```bash
    mkdir aptos-agent
    cd aptos-agent
    ```

2. Initialize git:
    ```bash
    git init
    ```

3. Create and populate `.gitignore`:
    ```bash
    echo "venv/" >> .gitignore
    echo "__pycache__/" >> .gitignore
    echo ".env" >> .gitignore
    echo ".python-version" >> .gitignore
    ```

    > [!NOTE]  
    > Think of these Python-specific files like this:
    > - `venv/`: Similar to `node_modules/`
    > - `__pycache__/`: Like JavaScript's `.js.map` files
    > - `.env`: Same as in Node.js
    > - `.python-version`: Like `.nvmrc`

4. Install Python version manager:
    ```bash
    brew install pyenv
    ```
    
    > [!NOTE]  
    > For Windows: Use `choco install pyenv-win`  
    > For Linux: `curl https://pyenv.run | bash`

5. Configure your shell (for Mac/Linux):
    ```bash
    echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zshrc
    echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.zshrc
    echo 'eval "$(pyenv init -)"' >> ~/.zshrc
    source ~/.zshrc
    ```

    > [!NOTE]  
    > Windows users can skip this step as pyenv-win handles this automatically

6. Install Python 3.11:
    ```bash
    pyenv install 3.11
    ```

7. Set Python version for project:
    ```bash
    pyenv local 3.11
    ```

## Virtual Environment Setup

In Python, we isolate project dependencies using virtual environments (similar to how each Node.js project has its own `node_modules`).

1. Create virtual environment:
    ```bash
    python -m venv venv
    ```

2. Activate the environment:
    ```bash
    source venv/bin/activate  # Mac/Linux
    ```

    > [!NOTE]  
    > For Windows, use: `.\venv\Scripts\activate`

3. Install dependencies:
    ```bash
    python -m pip install --upgrade pip
    pip install python-dotenv requests requests-oauthlib openai aptos-sdk
    pip freeze > requirements.txt
    ```

    > [!NOTE]  
    > `requirements.txt` is like `package.json`, listing your project dependencies

## Creating the Agent Structure

Now let's create our agent's core files:

1. Create main entry file:
    ```bash
    touch main.py
    ```

2. Add this test code to `main.py`:
    ```python
    from dotenv import load_dotenv
    from swarm.repl import run_demo_loop
    from agents import close_event_loop, aptos_agent
    import asyncio

    if __name__ == "__main__":
        try:
            load_dotenv()
            asyncio.run(run_demo_loop(aptos_agent, stream=True))
        finally:
            close_event_loop()
    ```

3. Create the agents file:
    ```bash
    touch agents.py
    ```

4. Create `.env` file and add your OpenAI key:
    ```bash
    echo "OPENAI_API_KEY=your-key-here" >> .env
    ```

    > [!IMPORTANT]  
    > Replace `your-key-here` with your actual OpenAI API key

5. Add this to `agents.py`:
    ```python
    import os
    from dotenv import load_dotenv
    from aptos_sdk.account import Account
    from aptos_sdk_wrapper import get_balance, fund_wallet, transfer, create_token
    from swarm import Agent

    # Load environment variables
    load_dotenv()

    # Initialize test wallet
    wallet = Account.load_key(
        "0x63ae44a3e39c934a7ae8064711b8bac0699ece6864f4d4d5292b050ab77b4f6b")
    address = str(wallet.address())

    # Initialize the agent
    aptos_agent = Agent(
        name="Aptos Agent",
        model="gpt-4",
        api_key=os.getenv('OPENAI_API_KEY'),
        instructions=(
            "You are a helpful agent that can interact with the Aptos blockchain. "
            "You can perform token transfers and create custom tokens. "
            f"Your wallet address is {address}. "
        ),
        functions=[
            fund_wallet, get_balance,
            transfer, create_token
        ],
    )
    ```

## Testing Your Setup

1. Start your agent:
    ```bash
    python main.py
    ```

2. You should see:
    ```
    Starting Swarm CLI 🐝
    User: 
    ```

3. Try these test commands:
    ```
    What can you help me with?
    Check my wallet balance
    What is Aptos?
    ```

> [!NOTE]  
> To exit: Press `Ctrl+C` (Windows) or `Ctrl+Z` (Mac/Linux)

## Common Issues and Solutions

> [!WARNING]  
> If you encounter any of these issues:

1. OpenAI API errors:
   - Check your `.env` file is in the right location
   - Verify your API key is correct
   - Ensure you're in your virtual environment

2. Python version errors:
   - Verify you're using Python 3.11: `python --version`
   - Make sure your virtual environment is activated

3. Import errors:
   - Confirm all packages are installed: `pip list`
   - Try reinstalling requirements: `pip install -r requirements.txt`

## Next Steps

Now that you have a working AI agent, you can:
1. [Learn more about Aptos development](https://aptos.dev)
2. [Explore the Aptos SDK documentation](https://aptos.dev/sdks/python-sdk)
3. [Join the Aptos Discord](https://discord.gg/aptoslabs)

Remember to deactivate your virtual environment when done:
```bash
deactivate
```

> [!TIP]  
> When you come back to work on the project:
> ```bash
> cd aptos-agent
> source venv/bin/activate  # or .\venv\Scripts\activate on Windows
> ```