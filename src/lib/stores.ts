
// Imports:
import { writable } from 'svelte/store';

// Type Imports:
import type { ChainData, AggregatedData } from '$lib/types';

// Initializations:
const defaultMaxTimestamp = 9_999_999_999;

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

// Default Aggregated Data:
const defaultAggregatedData: AggregatedData = {
  deposits: { data: [] },
  withdrawals: { data: [] },
  claims: { data: [] },
  delegationsCreated: { data: [] },
  delegationsFunded: { data: [] },
  delegationsUpdated: { data: [] },
  delegationsWithdrawn: { data: [] },
  yields: { data: [] },
  balances: { timestamp: 0, data: [] },
  draws: { data: [] },
  minTimestamp: 0,
  maxTimestamp: defaultMaxTimestamp
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

/* ========================================================================================================================================================================= */

// Aggregated Data:
export const aggregatedData = writable<AggregatedData>(defaultAggregatedData);

/* ========================================================================================================================================================================= */

// Start Timestamp:
export const startTimestamp = writable<number>(0);

// End Timestamp:
export const endTimestamp = writable<number>(defaultMaxTimestamp);