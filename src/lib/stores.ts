
// Imports:
import { browser } from '$app/env';
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
ethData.subscribe((value) => {
  if(browser && value.movingUsers) { localStorage.setItem('ethMovingUsers', JSON.stringify(value.movingUsers)); };
});

// Polygon Data:
export const polyData = writable<ChainData>(defaultChainData);
polyData.subscribe((value) => {
  if(browser && value.movingUsers) { localStorage.setItem('polyMovingUsers', JSON.stringify(value.movingUsers)); };
});

// Avalanche Data:
export const avaxData = writable<ChainData>(defaultChainData);
avaxData.subscribe((value) => {
  if(browser && value.movingUsers) { localStorage.setItem('avaxMovingUsers', JSON.stringify(value.movingUsers)); };
});

// Optimism Data:
export const opData = writable<ChainData>(defaultChainData);
opData.subscribe((value) => {
  if(browser && value.movingUsers) { localStorage.setItem('opMovingUsers', JSON.stringify(value.movingUsers)); };
});

/* ========================================================================================================================================================================= */

// Aggregated Data:
export const aggregatedData = writable<AggregatedData>(defaultAggregatedData);

/* ========================================================================================================================================================================= */

// Start Timestamp:
export const startTimestamp = writable<number>(0);

// End Timestamp:
export const endTimestamp = writable<number>(defaultMaxTimestamp);

/* ========================================================================================================================================================================= */

// Last Data Update Timestamp:
const storedLastUpdate: number = browser ? parseInt(localStorage.getItem('lastUpdate') ?? '0') : 0;
export const lastUpdate = writable<number>(storedLastUpdate);
lastUpdate.subscribe((value) => {
  if(browser && value > storedLastUpdate) { localStorage.setItem('lastUpdate', value.toString()); };
});