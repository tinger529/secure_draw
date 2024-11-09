// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import TmpdrawIDL from '../target/idl/tmpdraw.json'
import type { Tmpdraw } from '../target/types/tmpdraw'

// Re-export the generated IDL and type
export { Tmpdraw, TmpdrawIDL }

// The programId is imported from the program IDL.
export const TMPDRAW_PROGRAM_ID = new PublicKey(TmpdrawIDL.address)

// This is a helper function to get the Tmpdraw Anchor program.
export function getTmpdrawProgram(provider: AnchorProvider) {
  return new Program(TmpdrawIDL as Tmpdraw, provider)
}

// This is a helper function to get the program ID for the Tmpdraw program depending on the cluster.
export function getTmpdrawProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Tmpdraw program on devnet and testnet.
      return new PublicKey('CounNZdmsQmWh7uVngV9FXW2dZ6zAgbJyYsvBpqbykg')
    case 'mainnet-beta':
    default:
      return TMPDRAW_PROGRAM_ID
  }
}
