
// Imports:
import { browser } from '$app/env';
import { writable } from 'svelte/store';

// Type Imports:
import type { ChainStats, ChainData, AggregatedData, MultichainDistribution, SelectedChains, Loading } from '$lib/types';

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
  maxTimestamp: defaultMaxTimestamp,
  timestamps: []
}

// Default Multichain Users Data:
const defaultMultichainUsersData: MultichainDistribution = {
  totalUsers: 0,
  oneChain: 0,
  twoChains: 0,
  threeChains: 0,
  fourChains: 0
}

// Default Selected Chains:
const defaultSelectedChains: SelectedChains = {
  eth: true,
  poly: true,
  avax: true,
  op: true
}

// Default Loading Status:
const defaultLoadingStatus: Loading = {
  draws: 'none',
  eth: { basic: { stats: 'none', deposits: 'none', delegations: 'none' } },
  poly: { basic: { stats: 'none', deposits: 'none', delegations: 'none' } },
  avax: { basic: { stats: 'none', deposits: 'none', delegations: 'none' } },
  op: { basic: { stats: 'none', deposits: 'none', delegations: 'none' } }
}

/* ========================================================================================================================================================================= */

// Ethereum Stats:
export const ethStats = writable<ChainStats>();

// Polygon Stats:
export const polyStats = writable<ChainStats>();

// Avalanche Stats:
export const avaxStats = writable<ChainStats>();

// Optimism Stats:
export const opStats = writable<ChainStats>();

/* ========================================================================================================================================================================= */

// Ethereum Data:
export const ethData = writable<ChainData>(JSON.parse(JSON.stringify(defaultChainData)));

// Polygon Data:
export const polyData = writable<ChainData>(JSON.parse(JSON.stringify(defaultChainData)));

// Avalanche Data:
export const avaxData = writable<ChainData>(JSON.parse(JSON.stringify(defaultChainData)));

// Optimism Data:
export const opData = writable<ChainData>(JSON.parse(JSON.stringify(defaultChainData)));

/* ========================================================================================================================================================================= */

// Aggregated Data:
export const aggregatedData = writable<AggregatedData>(defaultAggregatedData);

/* ========================================================================================================================================================================= */

// Multichain Users Data:
export const multichainUsersData = writable<MultichainDistribution>(defaultMultichainUsersData);

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

/* ========================================================================================================================================================================= */

// Selected Chains:
const storedSelectedChains: SelectedChains = browser ? JSON.parse(localStorage.getItem('selectedChains') ?? JSON.stringify(defaultSelectedChains)) : defaultSelectedChains;
export const selectedChains = writable<SelectedChains>(storedSelectedChains);
selectedChains.subscribe((value) => {
  if(browser) { localStorage.setItem('selectedChains', JSON.stringify(value)); };
});

/* ========================================================================================================================================================================= */

// Loading Status:
export const loading = writable<Loading>(defaultLoadingStatus);