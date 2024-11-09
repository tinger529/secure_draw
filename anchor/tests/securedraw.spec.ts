import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Securedraw} from '../target/types/securedraw'

describe('securedraw', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Securedraw as Program<Securedraw>

  const securedrawKeypair = Keypair.generate()

  it('Initialize Securedraw', async () => {
    await program.methods
      .initialize()
      .accounts({
        securedraw: securedrawKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([securedrawKeypair])
      .rpc()

    const currentCount = await program.account.securedraw.fetch(securedrawKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Securedraw', async () => {
    await program.methods.increment().accounts({ securedraw: securedrawKeypair.publicKey }).rpc()

    const currentCount = await program.account.securedraw.fetch(securedrawKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Securedraw Again', async () => {
    await program.methods.increment().accounts({ securedraw: securedrawKeypair.publicKey }).rpc()

    const currentCount = await program.account.securedraw.fetch(securedrawKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Securedraw', async () => {
    await program.methods.decrement().accounts({ securedraw: securedrawKeypair.publicKey }).rpc()

    const currentCount = await program.account.securedraw.fetch(securedrawKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set securedraw value', async () => {
    await program.methods.set(42).accounts({ securedraw: securedrawKeypair.publicKey }).rpc()

    const currentCount = await program.account.securedraw.fetch(securedrawKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the securedraw account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        securedraw: securedrawKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.securedraw.fetchNullable(securedrawKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
