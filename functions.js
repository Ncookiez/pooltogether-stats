
// Imports:
import fs from 'fs';
import ethers from 'ethers';

// Ethers Providers:
const eth = new ethers.providers.StaticJsonRpcProvider('https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');
const poly = new ethers.providers.StaticJsonRpcProvider('https://polygon-rpc.com');
const avax = new ethers.providers.StaticJsonRpcProvider('https://avax-mainnet.gateway.pokt.network/v1/lb/605238bf6b986eea7cf36d5e/ext/bc/C/rpc');
const op = new ethers.providers.StaticJsonRpcProvider('https://mainnet.optimism.io');

// Data Files' Route:
const fileRoute = './src/lib/data/';

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
  console.log(`  $ Saved data to ${file}.json`);
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

// Function to get current block:
export const getCurrentBlock = (chain) => {
  const provider = getChainProvider(chain);
  return provider.getBlockNumber();
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
    case 'op':
      return 'Optimism';
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
    case 'op':
      return op;
    default:
      return undefined;
  }
}

/* ====================================================================================================================================================== */

// Function to get array of numbers:
export const getRangeArray = (start, end, ticks) => {
  let range = [];
  let tick = (end - start) / ticks;
  let value = start;
  while(value <= end) {
    value += tick;
    range.push(Math.ceil(value));
  }
  return range;
}