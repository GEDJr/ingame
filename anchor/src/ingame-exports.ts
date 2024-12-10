// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import IngameIDL from '../target/idl/ingame.json'
import type { Ingame } from '../target/types/ingame'

// Re-export the generated IDL and type
export { Ingame, IngameIDL }

// The programId is imported from the program IDL.
export const INGAME_PROGRAM_ID = new PublicKey(IngameIDL.address)

// This is a helper function to get the Ingame Anchor program.
export function getIngameProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...IngameIDL, address: address ? address.toBase58() : IngameIDL.address } as Ingame, provider)
}

// This is a helper function to get the program ID for the Ingame program depending on the cluster.
export function getIngameProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Ingame program on devnet and testnet.
      return new PublicKey('pYGbCyybENYsKbi4TivtrSBCggmjwSh2p2Qso8yatdx')
    case 'mainnet-beta':
    default:
      return INGAME_PROGRAM_ID
  }
}
