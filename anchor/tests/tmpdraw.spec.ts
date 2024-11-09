import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Tmpdraw} from '../target/types/tmpdraw'

describe('tmpdraw', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Tmpdraw as Program<Tmpdraw>

  const tmpdrawKeypair = Keypair.generate()

  it('Initialize Tmpdraw', async () => {
    await program.methods
      .initialize()
      .accounts({
        tmpdraw: tmpdrawKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([tmpdrawKeypair])
      .rpc()

    const currentCount = await program.account.tmpdraw.fetch(tmpdrawKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Tmpdraw', async () => {
    await program.methods.increment().accounts({ tmpdraw: tmpdrawKeypair.publicKey }).rpc()

    const currentCount = await program.account.tmpdraw.fetch(tmpdrawKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Tmpdraw Again', async () => {
    await program.methods.increment().accounts({ tmpdraw: tmpdrawKeypair.publicKey }).rpc()

    const currentCount = await program.account.tmpdraw.fetch(tmpdrawKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Tmpdraw', async () => {
    await program.methods.decrement().accounts({ tmpdraw: tmpdrawKeypair.publicKey }).rpc()

    const currentCount = await program.account.tmpdraw.fetch(tmpdrawKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set tmpdraw value', async () => {
    await program.methods.set(42).accounts({ tmpdraw: tmpdrawKeypair.publicKey }).rpc()

    const currentCount = await program.account.tmpdraw.fetch(tmpdrawKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the tmpdraw account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        tmpdraw: tmpdrawKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.tmpdraw.fetchNullable(tmpdrawKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
