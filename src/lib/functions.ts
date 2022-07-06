
// Imports:
import snapshot from '$lib/data/snapshot.json';

/* ====================================================================================================================================================== */

// Function to get time of last data update:
export const getTimestamp = () => {
  let date = new Date(snapshot[0].timestamp * 1000);
  return date.toLocaleString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

// Function to get chain name:
export const getChainName = (chain: 'eth' | 'poly' | 'avax' | 'op') => {
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