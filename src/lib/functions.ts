
// Imports:
// :3

/* ====================================================================================================================================================== */

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