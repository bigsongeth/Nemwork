# Extending Your Aptos Agent with Blockchain Query Capabilities

This guide builds upon your existing Aptos Agent, adding powerful blockchain querying features. You'll learn how to retrieve transaction details, account resources, and token balances directly from the Aptos blockchain.

## Prerequisites

1. Completed the main Aptos Agent setup from [README.md](README.md)
2. Working agent with basic functionality

## New Features Overview

Your enhanced Aptos Agent now includes capabilities to:
- Query specific transactions using transaction hashes
- View account resources and token balances
- Monitor blockchain state in real-time
- Track token holdings across accounts

## Implementation Details

### 1. Transaction Queries
```python
# Get details about a specific transaction
transaction = await get_transaction("0x123...abc")
```

The `get_transaction` function allows you to:
- Retrieve transaction status
- View transaction payload
- Check gas usage and fees
- See timestamp and chain version

### 2. Account Resources
```python
# View all resources associated with an account
resources = await get_account_resources("0x1234...")
```

Account resources provide:
- Token balances
- Staking information
- Module deployments
- Custom resource types

### 3. Token Balance Tracking
```python
# Check specific token balance
balance = await get_token_balance(
    address="0x1234...",
    creator_address="0x5678...",
    collection_name="MyCollection",
    token_name="MyToken"
)
```

### 4. Token Creation Deep Dive
```python
# Create a new fungible asset (token)
txn_hash = await create_token(
    sender=wallet,
    name="MyToken",
    symbol="MTK",
    icon_uri="https://example.com/icon.png",
    project_uri="https://example.com/project"
)
```

The `create_token` function is a powerful tool that allows you to deploy new fungible assets on Aptos. Here's what each parameter does:

- `sender`: The Account object that will be the token creator/owner
- `name`: The full name of your token (e.g., "My Awesome Token")
- `symbol`: The trading symbol for your token (e.g., "MTK")
- `icon_uri`: URL to your token's icon image
- `project_uri`: URL to your token's documentation/website

Under the hood, the function:
1. Constructs an `EntryFunction` call to the Aptos launchpad module
2. Uses the module address `0xe522476ab48374606d11cc8e7a360e229e37fd84fb533fcde63e091090c62149::launchpad`
3. Calls the `create_fa_simple` function with your parameters
4. Signs and submits the transaction
5. Returns the transaction hash for tracking

> [!NOTE]  
> After creating a token, you can view it on the Aptos Explorer using the URL format:
> `https://explorer.aptoslabs.com/txn/{transaction_hash}/payload?network=testnet`

> [!WARNING]  
> Token creation requires gas fees. Make sure your wallet has sufficient APT before creating tokens.

## Using the New Features

Your agent now has synchronous wrapper functions for all these capabilities:

1. Transaction Details:
```python
result = get_transaction_sync("0x123...abc")
```

2. Account Resources:
```python
resources = get_account_resources_sync("0x1234...")
```

3. Token Balances:
```python
balance = get_token_balance_sync(
    address,
    creator_address,
    collection_name,
    token_name
)
```

## Error Handling

All new functions include robust error handling:
- Network connectivity issues
- Invalid addresses or hashes
- Rate limiting responses
- Missing resources

## Bugs fixed in this edition
- Agent now provides correct links to Aptos Explorer payload page
- Agent is aware it can offer to look up a transaction hash for you
- Fixed get_balance_in_apt_sync to handle optional address parameter
- Fixed string interpolation in agent's wallet address display
- Improved address handling in fund_wallet and transfer functions
- Standardized address type conversion across all functions

## Best Practices

1. **Transaction Queries**
   - Always verify transaction finality
   - Cache frequently accessed transaction data
   - Use pagination for large result sets

2. **Resource Queries**
   - Batch related resource requests
   - Monitor rate limits
   - Implement retry logic for failed requests

3. **Token Balance Checks**
   - Verify token existence before querying
   - Handle decimal places appropriately
   - Consider using indexed queries for large collections

## Next Steps

Now that your agent can query blockchain state, consider:
1. Building automated monitoring systems
2. Creating token portfolio trackers
3. Implementing transaction history analysis
4. Developing custom analytics tools

For more advanced features and detailed API documentation, visit [aptos.dev](https://aptos.dev).

> [!IMPORTANT]  
> We're using Aptos Devnet for this tutorial as Testnet faucet access is currently restricted. When using the explorer or other tools, make sure to select "Devnet" network. The agent's functions and interactions remain the same, just on a different network.

## What's Next?

Your AI agent can now:
- Query blockchain state and transactions
- Check token balances and account resources
- Help users understand blockchain interactions
- Guide users through basic operations

For the next level of blockchain interaction, consider:
1. Learn more about Move smart contracts with the [Your First Move Module Guide at aptos.dev](https://aptos.dev/en/build/guides/first-move-module), perhaps build a custom Move modules to interact with?
2. Explore the [Aptos SDK documentation](https://aptos.dev/en/build/sdks), perhaps try building an agent in a different language and contribute to this open source project?
3. Join the [Aptos Discord](https://discord.gg/aptoslabs) to connect with other developers.
4. Let us know you enjoyed this content, tag us and post your experience and thoughts on social media!

Some ideas for extending this agent:
- Add token-gating features to control access to special agent capabilities
- Store encrypted conversation logs on-chain using IPFS hashes
- Create custom Move modules for specialized agent-blockchain interactions
- Build a web interface for easier interaction with your agent

> [!NOTE]
> While this tutorial focused on querying and basic interactions, the real power comes from combining AI capabilities with custom Move modules. We encourage you to keep building and share your improvements with the community!