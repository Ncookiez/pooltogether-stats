
// Chain Type:
type Chain = 'eth' | 'poly' | 'avax' | 'op';

// Hash Type:
type Hash = `0x${string}`;

/* ====================================================================================================================================================== */

// Draw Data Interface:
interface DrawData {
  draw: number
  timestamp: number
  result: {
    chain: Chain
    wallet: Hash
    claimable: number[]
    dropped: number[]
    avgBalance: number | null
  }[]
}

// Deposit Data Interface:
interface DepositData {
  txHash: Hash
  block: number
  timestamp: number | undefined
  wallet: Hash
  amount: number
  chain: Chain
}

// Delegation Funded Data Interface:
interface DelegationFundedData {
  txHash: Hash
  block: number
  timestamp: number | undefined
  delegator: Hash
  amount: number
  chain: Chain
}

/* ====================================================================================================================================================== */

// PoolExplorer API Draw Reponse Interface:
interface ExplorerAPIDrawResponse {
  draw: number
  timestamp: string
  result: {
    n: string         // Network
    a: Hash           // Wallet Address
    c: string[]       // Claimable Prizes
    u: string[]       // Dropped Prizes
    w: string         // Sum of Claimable Prizes
    d: string         // Sum of Dropped Prizes
    g: number | null  // Wallet's Average Balance
  }[]
}

/* ====================================================================================================================================================== */

// Draw History Event Data Interface:
interface DrawHistoryEventData {
  draws: Record<Chain, DrawData[]>
  selectedChains: Record<Chain, boolean>
}

// Deposit History Event Data Interface:
interface DepositHistoryEventData {
  deposits: Record<Chain, DepositData[]>
  selectedChains: Record<Chain, boolean>
}

// Delegation History Event Data Interface:
interface DelegationHistoryEventData {
  delegations: Record<Chain, DelegationFundedData[]>
  selectedChains: Record<Chain, boolean>
}