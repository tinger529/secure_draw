'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { AppHero, ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useSecuredrawProgram } from './securedraw-data-access'
import { SecuredrawCreate, SecuredrawList } from './securedraw-ui'

export default function SecuredrawFeature() {
  const { publicKey } = useWallet()
  const { programId } = useSecuredrawProgram()

  return publicKey ? (
    <div>
      <AppHero
        title="Securedraw: Concert"
        subtitle={
          <>
          @TBW 2024<br /><br />
          Create your secure and transparent concert ticket assignment system:<br /><br />
          1. Connect Wallet: Click the button in the top-right corner to connect to your Solana wallet.<br /><br />
          2. Create New Area: Click the button below and sign the contract to proceed.<br /><br />
          3. Edit Card Titles (Optional): Click on a card title to modify it, if needed.<br /><br />
          4. Set Participants: Enter the public keys of your participants and click "Set Participant."<br /><br />
          5. Random Draw: Click "Random Draw" to generate the results.
        </>
        }
      >
        <p className="mb-6">
          {/* <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} /> */}
        </p>
        <SecuredrawCreate />
      </AppHero>
      <SecuredrawList />
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
