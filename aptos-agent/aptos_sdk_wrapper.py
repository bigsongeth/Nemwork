print("Aptos SDK wrapper loaded in test mode")
import os
import requests
from aptos_sdk.account import Account, AccountAddress
from aptos_sdk.async_client import FaucetClient, RestClient
from aptos_sdk.transactions import EntryFunction, TransactionArgument, TransactionPayload
from aptos_sdk.bcs import Serializer

# Initialize clients for devnet (changed from testnet)
NODE_URL = "https://api.devnet.aptoslabs.com/v1"
rest_client = RestClient(NODE_URL)
faucet_client = FaucetClient("https://faucet.devnet.aptoslabs.com", rest_client)

async def get_account_modules(address: str, limit: int = 10):
    """
    Fetch the published modules for a specific account,
    capping the results at 'limit' to avoid large GPT-4 prompts.
    """
    import requests
    
    # Add '?limit={limit}' for server-side pagination.
    # Then if the account has more than 'limit' modules, the server might
    # provide an "X-Aptos-Cursor" header for further pages (if needed).
    url = f"{NODE_URL}/accounts/{address}/modules?limit={limit}"

    try:
        response = requests.get(url)
        response.raise_for_status()
        modules = response.json()

        if not modules:
            return "No modules found for this account"

        # Summarize or truncate large data fields inside each module
        summarized_modules = []
        for m in modules:
            # We might remove or shorten 'bytecode' if it's huge
            if "bytecode" in m:
                byte_len = len(m["bytecode"])
                if byte_len > 300:
                    m["bytecode"] = (
                        m["bytecode"][:300]
                        + f"...(truncated {byte_len-300} chars)"
                    )

            # Possibly parse 'abi' and only keep minimal info
            # to prevent huge text from each function signature
            if "abi" in m:
                abi = m["abi"]
                # Example: remove generics if you don't need them
                if "exposed_functions" in abi:
                    for fn in abi["exposed_functions"]:
                        # Remove or shorten params if super large
                        if "params" in fn and len(fn["params"]) > 5:
                            fn["params"] = fn["params"][:5] + ["...truncated"]
            
            summarized_modules.append(m)

        # If the server truncated results to 'limit' behind the scenes,
        # you might want to add a note. You can glean if there's more from
        # the "X-Aptos-Cursor" header, but let's keep it simple:
        return {
            "modules": summarized_modules,
            "note": (
                f"Requested up to {limit} modules. "
                "Large fields were truncated to prevent large GPT-4 prompts."
            )
        }

    except requests.exceptions.RequestException as e:
        return f"Error getting account modules: {str(e)}"

async def execute_view_function(function_id: str, type_args: list, args: list):
    """
    Executes a Move view function asynchronously.
    Args:
        function_id: The full function ID (e.g., '0x1::coin::balance').
        type_args: A list of type arguments for the function.
        args: A list of arguments to pass to the function.
    Returns:
        The result of the view function execution.
    """
    url = f"{NODE_URL}/view"
    headers = {"Content-Type": "application/json"}
    body = {
        "function": function_id,
        "type_arguments": type_args,
        "arguments": args,
    }

    try:
        response = requests.post(url, json=body, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": f"Error executing view function: {str(e)}"}

async def fund_wallet(wallet_address, amount):
    """Funds a wallet with a specified amount of APT."""
    print(f"Funding wallet: {wallet_address} with {amount} APT")
    amount = int(amount)
    if amount > 1000:
        raise ValueError(
            "Amount too large. Please specify an amount less than 1000 APT")
    octas = amount * 10**8  # Convert APT to octas
    if isinstance(wallet_address, str):
        wallet_address = AccountAddress.from_str(wallet_address)
    txn_hash = await faucet_client.fund_account(wallet_address, octas, True)
    print(f"Transaction hash: {txn_hash}\nFunded wallet: {wallet_address}")
    return wallet_address

async def get_balance(wallet_address):
    """Retrieves the balance of a specified wallet."""
    print(f"Getting balance for wallet: {wallet_address}")
    if isinstance(wallet_address, str):
        wallet_address = AccountAddress.from_str(wallet_address)
    balance = await rest_client.account_balance(wallet_address)
    balance_in_apt = balance / 10**8  # Convert octas to APT
    print(f"Wallet balance: {balance_in_apt:.2f} APT")
    return balance_in_apt  # Return APT value instead of Octa value

async def transfer(sender: Account, receiver, amount):
    """Transfers a specified amount from sender to receiver."""
    if isinstance(receiver, str):
        receiver = AccountAddress.from_str(receiver)
    txn_hash = await rest_client.bcs_transfer(sender, receiver, amount)
    print(f"Transaction hash: {txn_hash} and receiver: {receiver}")
    return txn_hash

async def get_transaction(txn_hash: str):
    """Gets details about a specific transaction."""
    try:
        result = await rest_client.transaction_by_hash(txn_hash)
        return result
    except Exception as e:
        print(f"Full error: {str(e)}")
        return f"Error getting transaction: {str(e)}"

import requests

async def get_account_resources(address: str):
    """Gets all resources associated with an account using direct API call."""
    NODE_URL = "https://api.devnet.aptoslabs.com/v1"  # Update for the correct network
    try:
        # Use direct API call to fetch resources
        url = f"{NODE_URL}/accounts/{address}/resources"
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for HTTP errors

        resources = response.json()
        if not resources:
            return "No resources found for this account"
        return resources
    except requests.exceptions.RequestException as e:
        return f"Error getting account resources: {str(e)}"

async def get_token_balance(address: str, creator_address: str, collection_name: str, token_name: str):
    """Gets the token balance for a specific token."""
    try:
        if isinstance(address, str):
            address = AccountAddress.from_str(address)
        resources = await rest_client.get_account_resources(address)
        for resource in resources:
            if resource['type'] == '0x3::token::TokenStore':
                # Parse token data to find specific token balance
                tokens = resource['data']['tokens']
                token_id = f"{creator_address}::{collection_name}::{token_name}"
                if token_id in tokens:
                    return tokens[token_id]
        return "Token not found"
    except Exception as e:
        return f"Error getting token balance: {str(e)}"

# TODO: Find out from Brian if there's a deployed version of this contract on Devnet, or if we need to compile and deploy this as well in the tutorial...
async def create_token(sender: Account, name: str, symbol: str, icon_uri: str,
                       project_uri: str):
    """Creates a token with specified attributes."""
    print(
        f"Creating FA with name: {name}, symbol: {symbol}, icon_uri: {icon_uri}, project_uri: {project_uri}"
    )
    payload = EntryFunction.natural(
        "0xe522476ab48374606d11cc8e7a360e229e37fd84fb533fcde63e091090c62149::launchpad",
        "create_fa_simple",
        [],
        [
            TransactionArgument(name, Serializer.str),
            TransactionArgument(symbol, Serializer.str),
            TransactionArgument(icon_uri, Serializer.str),
            TransactionArgument(project_uri, Serializer.str),
        ])
    signed_transaction = await rest_client.create_bcs_signed_transaction(
        sender, TransactionPayload(payload))
    txn_hash = await rest_client.submit_bcs_transaction(signed_transaction)
    print(f"Transaction hash: {txn_hash}")
    return txn_hash

async def execute_entry_function(
    sender: Account, function_id: str, type_args: list, args: list, abi_cache=None, optional_fetch_abi=False
):
    """
    Dynamically executes a Move entry function by analyzing its ABI.

    Args:
        sender: The account executing the function.
        function_id: The full function ID (e.g., '0x1::coin::transfer').
        type_args: A list of type arguments for the function (if any).
        args: A list of arguments to pass to the function (excluding `&signer`).
        abi_cache: (Optional) A cached ABI from a previous `get_account_modules` call.
        optional_fetch_abi: (Bool) If True, fetches the ABI if not already cached.

    Returns:
        The transaction hash of the submitted entry function.
    """

    try:
        # Extract the module address and module name
        module_path, function_name = function_id.rsplit("::", 1)
        module_address, module_name = module_path.split("::", 1)

        if not type_args:
            type_args = []
        # ✅ Step 1: Check if ABI is available in cache
        function_abi = None
        if abi_cache:
            print(f"Using cached ABI for module: {module_address}::{module_name}")
            for module in abi_cache:
                if module["abi"]["name"] == module_name:
                    for func in module["abi"]["exposed_functions"]:
                        if func["name"] == function_name:
                            function_abi = func
                            break

        # ✅ Step 2: If ABI is not cached, decide whether to fetch
        if not function_abi and optional_fetch_abi:
            print(f"Fetching ABI for module: {module_address}::{module_name}")
            abi_data = await get_account_modules(module_address)

            if "modules" not in abi_data:
                return {"error": "Failed to retrieve ABI for the module"}

            # Cache ABI for future calls
            abi_cache = abi_data["modules"]

            # Find function in the new ABI data
            for module in abi_cache:
                if module["abi"]["name"] == module_name:
                    for func in module["abi"]["exposed_functions"]:
                        if func["name"] == function_name:
                            function_abi = func
                            break

        # If we still don't have function ABI, return an error
        if not function_abi:
            return {"error": f"Function `{function_id}` not found in ABI"}

        # ✅ Step 3: Extract generic type parameters (if required)
        expected_type_args = function_abi.get("generic_type_params", [])
        if expected_type_args and not type_args:
            return {"error": f"Missing required type arguments for `{function_id}`"}

        print(f"Expected Type Arguments: {expected_type_args}")
        print(f"Provided Type Arguments: {type_args}")

        # ✅ Step 4: Extract required parameters from ABI
        expected_params = function_abi.get("params", [])
        print(f"Expected Parameters: {expected_params}")
        print(f"Args: {args}")

        # Ensure the signer (`&signer`) is NOT passed in `args`
        if expected_params and expected_params[0] == "&signer":
            expected_params = expected_params[1:]  # Remove signer from expected params
            print("Automatically handling signer argument")

        # ✅ Step 5: Validate the number of arguments
        # if len(args) != len(expected_params):
        #     return {"error": f"Argument mismatch: expected {len(expected_params)}, got {len(args)}"}

        # ✅ Step 6: Serialize arguments correctly based on ABI types
        serialized_args = []
        for i, arg in enumerate(args):
            # don't go above the expected parameters
            if i >= len(expected_params):
                break
            param_type = expected_params[i]

            if param_type == "u64":
                serialized_args.append(TransactionArgument(int(arg), Serializer.u64))
            elif param_type.startswith("0x"):  # Assume it's an address
                serialized_args.append(TransactionArgument(arg, Serializer.str))
            elif param_type == "bool":
                serialized_args.append(TransactionArgument(bool(arg), Serializer.bool))
            elif param_type.startswith("vector<"):  # Handle vector types
                if not isinstance(arg, list):
                    return {"error": f"Expected a list for `{param_type}` but got {type(arg).__name__}"}
                inner_type = param_type.replace("vector<", "").replace(">", "")
                if inner_type == "u64":
                    serialized_args.append(TransactionArgument(arg, [Serializer.u64]))
                elif inner_type == "bool":
                    serialized_args.append(TransactionArgument(arg, [Serializer.bool]))
                else:
                    return {"error": f"Unsupported vector type `{inner_type}`"}
            else:
                serialized_args.append(TransactionArgument(arg, Serializer.str))

        print(f"Serialized Arguments: {serialized_args}")  # Debugging output

        # ✅ Step 7: Execute the function with the dynamically determined shape
        payload = EntryFunction.natural(
            module_path,
            function_name,
            type_args,  # Correctly determined type arguments
            serialized_args,  # Correctly formatted function parameters
        )

        # ✅ Create and sign the transaction correctly
        signed_transaction = await rest_client.create_bcs_signed_transaction(
            sender, TransactionPayload(payload)
        )

        # ✅ Submit the transaction and return txn hash
        txn_hash = await rest_client.submit_bcs_transaction(signed_transaction)
        print(f"Transaction submitted successfully! Txn Hash: {txn_hash}")
        return {"txn_hash": txn_hash}

    except Exception as e:
        print(f"Error Details: {e}")  # Debugging output
        return {"error": f"Error executing entry function: {str(e)}"}
