// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import SecuredrawIDL from '../target/idl/securedraw.json'
import type { Securedraw } from '../target/types/securedraw'

// Re-export the generated IDL and type
export { Securedraw, SecuredrawIDL }

// The programId is imported from the program IDL.
export const SECUREDRAW_PROGRAM_ID = new PublicKey(SecuredrawIDL.address)

// This is a helper function to get the Securedraw Anchor program.
export function getSecuredrawProgram(provider: AnchorProvider) {
  return new Program(SecuredrawIDL as Securedraw, provider)
}

// This is a helper function to get the program ID for the Securedraw program depending on the cluster.
export function getSecuredrawProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Securedraw program on devnet and testnet.
      return new PublicKey('CounNZdmsQmWh7uVngV9FXW2dZ6zAgbJyYsvBpqbykg')
    case 'mainnet-beta':
    default:
      return SECUREDRAW_PROGRAM_ID
  }
}
