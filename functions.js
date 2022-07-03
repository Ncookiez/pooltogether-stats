
// Imports:
import fs from 'fs';
import ethers from 'ethers';

// Ethers Providers:
const eth = new ethers.providers.StaticJsonRpcProvider('https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');
const poly = new ethers.providers.StaticJsonRpcProvider('https://polygon-rpc.com');
const avax = new ethers.providers.StaticJsonRpcProvider('https://avax-mainnet.gateway.pokt.network/v1/lb/605238bf6b986eea7cf36d5e/ext/bc/C/rpc');

// Data Files' Route:
const fileRoute = './src/lib/data/';

/* ====================================================================================================================================================== */

// Function to query blocks for a specific event:
export const queryBlocks = async (chain, address, abi, event, querySize, info, startBlock, endBlock) => {

  // Initializations:
  const provider = getChainProvider(chain);
  const chainName = getChainName(chain);
  const contract = new ethers.Contract(address, abi, provider);
  const eventFilter = contract.filters[event](...info);
  let results = [];
  let lastQueriedBlock = startBlock;

  // Percentages:
  let percentages = {
    90: false,
    75: false,
    50: false,
    25: false,
    10: false
  }

  // Setting End Block:
  if(!endBlock) {
    endBlock = await provider.getBlockNumber();
  }
  
  // Querying Blocks:
  try {
    console.log(`${chainName}: Querying ${(endBlock - startBlock).toLocaleString()} blocks... (${startBlock.toLocaleString()} to ${endBlock.toLocaleString()})`);
    while(++lastQueriedBlock < endBlock) {
      let targetBlock = Math.min(lastQueriedBlock + querySize, endBlock);
      let result;
      while(!result) {
        try {
          result = await contract.queryFilter(eventFilter, lastQueriedBlock, targetBlock);
        } catch {
          console.warn(`RPC WARNING: Retrying block ${lastQueriedBlock} query on ${chainName}...`);
        }
      }
      results.push(...result);
      lastQueriedBlock = targetBlock;
      for(let percentage in percentages) {
        if(!percentages[percentage]) {
          if(lastQueriedBlock < endBlock && (((lastQueriedBlock - startBlock) / (endBlock - startBlock)) * 100) > parseInt(percentage)) {
            percentages[percentage] = true;
            console.log(`${chainName}: Queries ${percentage}% done...`);
          }
        } else {
          break;
        }
      }
    }
  } catch(err) {
    console.error(err);
    process.exit(1);
  }
  return results;
}

/* ====================================================================================================================================================== */

// Function to write data to JSON file:
export const writeJSON = (data, file, overwrite) => {

  // Initializations:
  let fileContents = [];

  // Including Existing Data:
  if(!overwrite) {
    try {
      const existingData = readJSON(file);
      fileContents.push(...existingData);
    } catch {}
  }

  // Writing New Data:
  fileContents.push(...data);
  fs.writeFileSync(`${fileRoute}${file}.json`, JSON.stringify(fileContents, null, ' '), 'utf8');
  console.log(`Saved data to ${file}.json`);
}

/* ====================================================================================================================================================== */

// Function to read JSON file:
export const readJSON = (file) => {
  try {
    const rawData = fs.readFileSync(`${fileRoute}${file}.json`);
    return JSON.parse(rawData);
  } catch {
    return [];
  }
}

/* ====================================================================================================================================================== */

// Function to get last queried block in JSON file:
export const getLatestBlock = (file) => {
  try {
    const data = readJSON(file);
    return data[data.length - 1].block;
  } catch {
    return 1;
  }
}

/* ====================================================================================================================================================== */

// Function to get chain name:
export const getChainName = (chain) => {
  switch(chain) {
    case 'eth':
      return 'Ethereum';
    case 'poly':
      return 'Polygon';
    case 'avax':
      return 'Avalanche';
    default:
      return undefined;
  }
}

/* ====================================================================================================================================================== */

// Function to get chain ethers provider:
export const getChainProvider = (chain) => {
  switch(chain) {
    case 'eth':
      return eth;
    case 'poly':
      return poly;
    case 'avax':
      return avax;
    default:
      return undefined;
  }
}