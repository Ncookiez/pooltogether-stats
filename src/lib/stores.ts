
// Imports:
import { writable } from 'svelte/store';

// Type Imports:
import type { ChainStats, ChainData, SelectedChains, Loading } from '$lib/types';

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
  eth: { stats: 'none', deposits: 'none', delegations: 'none' },
  poly: {stats: 'none', deposits: 'none', delegations: 'none' },
  avax: {stats: 'none', deposits: 'none', delegations: 'none' },
  op: {stats: 'none', deposits: 'none', delegations: 'none' }
}

/* ========================================================================================================================================================================= */

// Chain Stats:
export const ethStats = writable<ChainStats>();
export const polyStats = writable<ChainStats>();
export const avaxStats = writable<ChainStats>();
export const opStats = writable<ChainStats>();

/* ========================================================================================================================================================================= */

// Chain Data:
export const ethData = writable<ChainData>(JSON.parse(JSON.stringify(defaultChainData)));
export const polyData = writable<ChainData>(JSON.parse(JSON.stringify(defaultChainData)));
export const avaxData = writable<ChainData>(JSON.parse(JSON.stringify(defaultChainData)));
export const opData = writable<ChainData>(JSON.parse(JSON.stringify(defaultChainData)));

/* ========================================================================================================================================================================= */

// Selected Chains:
export const selectedChains = writable<SelectedChains>(defaultSelectedChains);

/* ========================================================================================================================================================================= */

// Loading Status:
export const loading = writable<Loading>(defaultLoadingStatus);