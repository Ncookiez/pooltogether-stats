
// Imports:
import { writable } from 'svelte/store';

// Type Imports:
import type { ChainStats, AdvancedChainStats, ChainData, SelectedChains, Loading } from '$lib/types';

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
  eth: {
    basic: { stats: 'none', deposits: 'none', delegations: 'none' },
    advanced: { stats: 'none', deposits: 'none', withdrawals: 'none', claims: 'none', delegationsCreated: 'none', delegationsFunded: 'none', delegationsUpdated: 'none', delegationsWithdrawn: 'none', yield: 'none', supply: 'none', balances: 'none', progress: 0 }
  },
  poly: {
    basic: { stats: 'none', deposits: 'none', delegations: 'none' },
    advanced: { stats: 'none', deposits: 'none', withdrawals: 'none', claims: 'none', delegationsCreated: 'none', delegationsFunded: 'none', delegationsUpdated: 'none', delegationsWithdrawn: 'none', yield: 'none', supply: 'none', balances: 'none', progress: 0 }
  },
  avax: {
    basic: { stats: 'none', deposits: 'none', delegations: 'none' },
    advanced: { stats: 'none', deposits: 'none', withdrawals: 'none', claims: 'none', delegationsCreated: 'none', delegationsFunded: 'none', delegationsUpdated: 'none', delegationsWithdrawn: 'none', yield: 'none', supply: 'none', balances: 'none', progress: 0 }
  },
  op: {
    basic: { stats: 'none', deposits: 'none', delegations: 'none' },
    advanced: { stats: 'none', deposits: 'none', withdrawals: 'none', claims: 'none', delegationsCreated: 'none', delegationsFunded: 'none', delegationsUpdated: 'none', delegationsWithdrawn: 'none', yield: 'none', supply: 'none', balances: 'none', progress: 0 }
  }
}

/* ========================================================================================================================================================================= */

// Chain Stats:
export const ethStats = writable<ChainStats>();
export const polyStats = writable<ChainStats>();
export const avaxStats = writable<ChainStats>();
export const opStats = writable<ChainStats>();

// Advanced Chain Stats:
export const ethAdvancedStats = writable<AdvancedChainStats>();
export const polyAdvancedStats = writable<AdvancedChainStats>();
export const avaxAdvancedStats = writable<AdvancedChainStats>();
export const opAdvancedStats = writable<AdvancedChainStats>();

/* ========================================================================================================================================================================= */

// Chain Data:
export const ethData = writable<ChainData>(JSON.parse(JSON.stringify(defaultChainData)));
export const polyData = writable<ChainData>(JSON.parse(JSON.stringify(defaultChainData)));
export const avaxData = writable<ChainData>(JSON.parse(JSON.stringify(defaultChainData)));
export const opData = writable<ChainData>(JSON.parse(JSON.stringify(defaultChainData)));

/* ========================================================================================================================================================================= */

// Timestamps:
export const startTimestamp = writable<number>(1_634_256_000);
export const endTimestamp = writable<number>(9_999_999_999);

/* ========================================================================================================================================================================= */

// Selected Chains:
export const selectedChains = writable<SelectedChains>(defaultSelectedChains);

/* ========================================================================================================================================================================= */

// Loading Status:
export const loading = writable<Loading>(defaultLoadingStatus);

/* ========================================================================================================================================================================= */

// Advanced Mode:
export const advancedMode = writable<boolean>(false);