'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { AppHero, ellipsify } from '../ui/ui-layout'
// import { ExplorerLink } from '../cluster/cluster-ui'
import { useIngameProgram } from './ingame-data-access'
import { IngameStart, IngameList } from './ingame-ui'

export default function IngameFeature() {
  const { publicKey } = useWallet()
  const { programId } = useIngameProgram()

  return publicKey ? (
    <div>
      <AppHero
        title="InGame"
        subtitle={""}
      >
        {/* <p className="mb-6">
          <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
        </p> */}
        <IngameStart />
      </AppHero>
      <IngameList />
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
