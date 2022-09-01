
// Type Imports:
import type { Chain, Hash } from './types';

// Initializations:
const dayInSeconds = 86400;

/* ====================================================================================================================================================== */

// Function to get chain name:
export const getChainName = (chain: Chain) => {
  if(chain === 'eth') {
    return 'Ethereum';
  } else if(chain === 'poly') {
    return 'Polygon';
  } else if(chain === 'avax') {
    return 'Avalanche';
  } else {
    return 'Optimism';
  }
}

/* ====================================================================================================================================================== */

// Function to convert timestamps to dates:
export const timestampsToDates = (timestamps: number[]) => {
  const dates = timestamps.map(timestamp => (new Date(timestamp * 1000)).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }));
  return dates;
}

/* ====================================================================================================================================================== */

// Function to convert timestamp to ISO date:
export const timestampToISO = (timestamp: number) => {
  const isoDate = (new Date(timestamp * 1000)).toISOString().slice(0, 10);
  return isoDate;
}

/* ====================================================================================================================================================== */

// Function to get block explorer links:
export const getBlockExplorerLink = (chain: Chain | undefined, hash: Hash) => {
  let link = '';
  if(chain === 'eth') {
    link = hash.length === 42 ? `https://etherscan.io/address/${hash}` : `https://etherscan.io/tx/${hash}`;
  } else if(chain === 'poly') {
    link = hash.length === 42 ? `https://polygonscan.com/address/${hash}` : `https://polygonscan.com/tx/${hash}`;
  } else if(chain === 'avax') {
    link = hash.length === 42 ? `https://snowtrace.io/address/${hash}` : `https://snowtrace.io/tx/${hash}`;
  } else if(chain === 'op') {
    link = hash.length === 42 ? `https://optimistic.etherscan.io/address/${hash}` : `https://optimistic.etherscan.io/tx/${hash}`;
  }
  return link;
}

/* ====================================================================================================================================================== */

// Function to get 'time ago' string:
export const getTimeDisplay = (timestamp: number, shorten?: boolean) => {
  const now = Date.now() / 1000;
  const secondsSinceEvent = now - timestamp;
  if(secondsSinceEvent > 0) {
    if(secondsSinceEvent < dayInSeconds) {
      if(secondsSinceEvent >= dayInSeconds / 24) {
        const hours = Math.floor(secondsSinceEvent / (dayInSeconds / 24));
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else if(secondsSinceEvent >= dayInSeconds / 24 / 60) {
        const mins = Math.floor(secondsSinceEvent / (dayInSeconds / 24 / 60));
        return `${mins} minute${mins > 1 ? 's' : ''} ago`;
      } else {
        const secs = Math.floor(secondsSinceEvent / (dayInSeconds / 24 / 60 / 60));
        return `${secs} second${secs > 1 ? 's' : ''} ago`;
      }
    } else {
      const date = new Date(timestamp * 1000);
      const currentYear = (new Date(now * 1000)).getFullYear();
      if(currentYear === date.getFullYear()) {
        return (shorten ? '' : 'on ') + date.toLocaleString(undefined, {month: 'short', day: 'numeric'});
      } else {
        return (shorten ? '' : 'on ') + date.toLocaleString(undefined, {month: 'short', day: 'numeric', year: 'numeric'});
      }
    }
  } else {
    return '?';
  }
}

/* ====================================================================================================================================================== */

// Function to get shortened wallet string:
export const getShortWallet = (address: string) => {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}