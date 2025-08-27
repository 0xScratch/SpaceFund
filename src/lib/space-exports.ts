import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Cluster, PublicKey } from "@solana/web3.js";
import SpaceIDL from '../anchor/idl/space.json'
import type { Space } from '../anchor/types/space'

export { Space, SpaceIDL }

export const SPACE_PROGRAM_ID = new PublicKey(SpaceIDL.address)

export function getSpaceProgram(provider: AnchorProvider, address?: PublicKey): Program<Space> {
    return new Program({ ...SpaceIDL, address: address ? address.toBase58() : SpaceIDL.address } as Space, provider)
}

export function getSpaceProgramId(cluster: Cluster) {
    switch (cluster) {
        case 'devnet':
        case 'testnet':
            return new PublicKey('Ep1m1kNQVn45i2B2ntshHBy3cp2CKpGikmUpogAhmM7J')
        case 'mainnet-beta':
        default:
            return SPACE_PROGRAM_ID
    }
}