from dotenv import load_dotenv
import os
from aptos_sdk.account import Account

# 加载现有的环境变量
load_dotenv()

# 检查AI代理钱包地址
wallet_address = os.getenv('DEVNET_WALLET_ADDRESS')
private_key = os.getenv('PRIVATE_KEY')

# 如果没有钱包地址或私钥，生成新的
if not wallet_address or not private_key:
    new_account = Account.generate()
    wallet_address = str(new_account.address())
    private_key = str(new_account.private_key)
    
    # 保存到环境变量
    from dotenv import set_key
    set_key('.env', 'DEVNET_WALLET_ADDRESS', wallet_address)
    set_key('.env', 'PRIVATE_KEY', private_key)

print(wallet_address)