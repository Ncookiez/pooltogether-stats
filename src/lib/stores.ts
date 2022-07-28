
// Imports:
import { writable } from 'svelte/store';

// Type Imports:
import type { ChainData } from '$lib/types';

/* ========================================================================================================================================================================= */

// Default Chain Data:
const defaultChainData: ChainData = {
  deposits: { lastQueriedBlock: 0, data: [] },
  withdrawals: { lastQueriedBlock: 0, data: [] },
  claims: { lastQueriedBlock: 0, data: [] },
  delegationsCreated: { lastQueriedBlock: 0, data: [] },
  delegationsFunded: { lastQueriedBlock: 0, data: [] },
  delegationsUpdated: { lastQueriedBlock: 0, data: [] },
  delegationsWithdrawn: { lastQueriedBlock: 0, data: [] },
  yields: { lastQueriedBlock: 0, data: [] },
  supply: { lastQueriedBlock: 0, data: [] },
  balances: { lastQueriedBlock: 0, timestamp: 0, data: [] },
  draws: { data: [] }
}

/* ========================================================================================================================================================================= */

// Ethereum Data:
export const ethData = writable<ChainData>(defaultChainData);

// Polygon Data:
export const polyData = writable<ChainData>(defaultChainData);

// Avalanche Data:
export const avaxData = writable<ChainData>(defaultChainData);

// Optimism Data:
export const opData = writable<ChainData>(defaultChainData);