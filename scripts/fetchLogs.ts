import { createPublicClient, http, Log } from "viem";
import { base } from "viem/chains";

async function fetchLogs() {
  const client = createPublicClient({
    chain: base,
    transport: http("https://base-mainnet.g.alchemy.com/v2/wYLLLqg2CDlpIiTy5j6dqzBnTg1GzLPS"),
  });

  const logs: Log[] = await client.getLogs({});

  console.log(logs);
}

fetchLogs();