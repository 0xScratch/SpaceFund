'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useSpaceProgram } from './space-data-access'
import { SpaceCreate, SpaceList } from './space-ui'
import { AppHero } from '../app-hero'
import { ellipsify } from '@/lib/utils'

export default function SpaceFeature() {
  const { publicKey } = useWallet()
  const { programId } = useSpaceProgram()

  return publicKey ? (
    <div>
      <AppHero
        title="Space"
        subtitle={
          'Create a new campaign (account) by clicking the "Create" button. The state of a account is stored on-chain and can be manipulated by calling the program\'s methods (donate, withdraw).'
        }
      >
        <p className="mb-6">
          <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
        </p>
        <SpaceCreate />
      </AppHero>
      <SpaceList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  )
}
