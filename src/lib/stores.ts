
// Imports:
import { writable } from 'svelte/store';

// Type Imports:
import type { ChainData } from '$lib/types';

/* ========================================================================================================================================================================= */

// Ethereum Data:
export const ethData = writable<Partial<ChainData>>({});

// Polygon Data:
export const polyData = writable<Partial<ChainData>>({});

// Avalanche Data:
export const avaxData = writable<Partial<ChainData>>({});

// Optimism Data:
export const opData = writable<Partial<ChainData>>({});