from dotenv import load_dotenv, set_key
import os

# 加载现有的环境变量
load_dotenv()

# 更新USER_WALLET_ADDRESS
set_key('.env', 'USER_WALLET_ADDRESS', '0xeba00ae8df49799c2fc26c8537e746660b718930')
print('User wallet address updated successfully')