'use client'
import * as anchor from "@coral-xyz/anchor";
import {getSecuredrawProgram, getSecuredrawProgramId} from '@project/anchor'
import {useConnection} from '@solana/wallet-adapter-react'
import {Connection, Cluster, Keypair, PublicKey, Transaction, SystemProgram, VersionedTransaction, Commitment} from '@solana/web3.js'
import dotenv from "dotenv";
import * as sb from "@switchboard-xyz/on-demand";
import {useMutation, useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import toast from 'react-hot-toast'
import {useCluster} from '../cluster/cluster-data-access'
import {useAnchorProvider} from '../solana/solana-provider'
import {useTransactionToast} from '../ui/ui-layout'

export function useSecuredrawProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getSecuredrawProgramId(cluster.network as Cluster), [cluster])
  const program = getSecuredrawProgram(provider)

  const accounts = useQuery({
    queryKey: ['securedraw', 'all', { cluster }],
    queryFn: () => program.account.securedraw.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['securedraw', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ securedraw: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useSecuredrawProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useSecuredrawProgram()

  const accountQuery = useQuery({
    queryKey: ['securedraw', 'fetch', { cluster, account }],
    queryFn: () => program.account.securedraw.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['securedraw', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ securedraw: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['securedraw', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ securedraw: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['securedraw', 'increment', { cluster, account }],
    mutationFn: (nuser: number) => program.methods.increment(nuser).accounts({ securedraw: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['securedraw', 'set', { cluster, account }],
    mutationFn: (values: PublicKey[]) => program.methods.set(values).accounts({ securedraw: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}

// Added for randomness
const COMMITMENT = "confirmed";
const PLAYER_STATE_SEED = "playerstate";
const ESCROW_SEED = "stateEscrow";

async function myAnchorProgram(
  provider: anchor.Provider,
  keypath: string
): Promise<anchor.Program> {
  const myProgramKeypair = await sb.AnchorUtils.initKeypairFromFile(keypath);
  const pid = myProgramKeypair.publicKey;
  const idl = (await anchor.Program.fetchIdl(pid, provider))!;
  const program = new anchor.Program(idl, provider);
  return program;
}

async function loadSbProgram(
  provider: anchor.Provider
): Promise<anchor.Program> {
  const sbProgramId = await sb.getProgramId(provider.connection);
  const sbIdl = await anchor.Program.fetchIdl(sbProgramId, provider);
  const sbProgram = new anchor.Program(sbIdl!, provider);
  return sbProgram;
}

async function initializeMyProgram( provider: anchor.Provider): Promise<anchor.Program> {
  const myProgramPath = "anchor/target/deploy/securedraw-keypair.json";
  const myProgram = await myAnchorProgram(provider, myProgramPath);
  console.log("My program", myProgram.programId.toString());
  return myProgram;
}

async function handleTransaction(
  sbProgram: anchor.Program,
  connection: Connection,
  ix: anchor.web3.TransactionInstruction[],
  keypair: Keypair,
  signers: Keypair[],
  txOpts: any
): Promise<string> {
  const createTx = await sb.asV0Tx({
    connection: sbProgram.provider.connection,
    ixs: ix,
    payer: keypair.publicKey,
    signers: signers,
    computeUnitPrice: 75_000,
    computeUnitLimitMultiple: 1.3,
  });

  const sim = await connection.simulateTransaction(createTx, txOpts);
  const sig = await connection.sendTransaction(createTx, txOpts);
  await connection.confirmTransaction(sig, COMMITMENT);
  console.log("  Transaction Signature", sig);
  return sig;
}

async function initializeRandomness(
  myProgram: anchor.Program,
  playerStateAccount: [anchor.web3.PublicKey, number],
  escrowAccount: PublicKey,
  keypair: Keypair,
  sbProgram: anchor.Program,
  connection: Connection
): Promise<void> {
  const initIx = await myProgram.methods
    .initialize()
    .accounts({
      playerState: playerStateAccount,
      escrowAccount: escrowAccount,
      user: keypair.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  const txOpts = {
    commitment: "processed" as Commitment,
    skipPreflight: true,
    maxRetries: 0,
  };
  await handleTransaction(
    sbProgram,
    connection,
    [initIx],
    keypair,
    [keypair],
    txOpts
  );
}

export async function setupQueue(program: anchor.Program): Promise<PublicKey> {
  const queueAccount = await sb.getDefaultQueue(
    program.provider.connection.rpcEndpoint
  );
  console.log("Queue account", queueAccount.pubkey.toString());
  try {
    await queueAccount.loadData();
  } catch (err) {
    console.error("Queue not found, ensure you are using devnet in your env");
    process.exit(1);
  }
  return queueAccount.pubkey;
}

export async function settleFlipInstruction(
  myProgram: anchor.Program,
  escrowBump: number,
  playerStateAccount: [anchor.web3.PublicKey, number],
  rngKpPublicKey: PublicKey,
  escrowAccount: PublicKey,
  keypair: Keypair
): Promise<anchor.web3.TransactionInstruction> {
  return await myProgram.methods
    .settleFlip(escrowBump)
    .accounts({
      playerState: playerStateAccount,
      randomnessAccountData: rngKpPublicKey,
      escrowAccount: escrowAccount,
      user: keypair.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}

async function createRandomness(
  myProgram: anchor.Program,
  rngKpPublicKey: PublicKey,
  playerStateAccount: [anchor.web3.PublicKey, number],
  keypair: Keypair,
  escrowAccount: PublicKey
): Promise<anchor.web3.TransactionInstruction> {
  return await myProgram.methods
    .generate_randomness(rngKpPublicKey)
    .accounts({
      playerState: playerStateAccount,
      user: keypair.publicKey,
      randomnessAccountData: rngKpPublicKey,
      escrowAccount: escrowAccount,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}

export async function ensureEscrowFunded(
  connection: Connection,
  escrowAccount: PublicKey,
  keypair: Keypair,
  sbProgram: anchor.Program,
  txOpts: any
): Promise<void> {
  const accountBalance = await connection.getBalance(escrowAccount);
  const minRentExemption =
    await connection.getMinimumBalanceForRentExemption(0);

  const requiredBalance = minRentExemption;
  if (accountBalance < requiredBalance) {
    const amountToFund = requiredBalance - accountBalance;
    console.log(
      `Funding account with ${amountToFund} lamports to meet rent exemption threshold.`
    );

    const transferIx = SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: escrowAccount,
      lamports: amountToFund,
    });

    const transferTx = await sb.asV0Tx({
      connection: sbProgram.provider.connection,
      ixs: [transferIx],
      payer: keypair.publicKey,
      signers: [keypair],
      computeUnitPrice: 75_000,
      computeUnitLimitMultiple: 1.3,
    });

    const sim3 = await connection.simulateTransaction(transferTx, txOpts);
    const sig3 = await connection.sendTransaction(transferTx, txOpts);
    await connection.confirmTransaction(sig3, COMMITMENT);
    console.log("  Transaction Signature ", sig3);
  } else {
    console.log("  Escrow account funded already");
  }
}

export async function getRandom() {
  
  console.clear();
  const { keypair, connection, program } = await sb.AnchorUtils.loadEnv();
  console.log("\nSetup...");
  console.log("Program", program!.programId.toString());
  let queue = await setupQueue(program!);
  const myProgram = await initializeMyProgram(program!.provider);
  const sbProgram = await loadSbProgram(program!.provider);
  const txOpts = {
    commitment: "processed" as Commitment,
    skipPreflight: false,
    maxRetries: 0,
  };

  // create randomness account and initialise it
  const rngKp = Keypair.generate();
  const [randomness, ix] = await sb.Randomness.create(sbProgram, rngKp, queue);
  console.log("\nCreated randomness account..");
  console.log("Randomness account", randomness.pubkey.toString());

  const createRandomnessTx = await sb.asV0Tx({
    connection: sbProgram.provider.connection,
    ixs: [ix],
    payer: keypair.publicKey,
    signers: [keypair, rngKp],
    computeUnitPrice: 75_000,
    computeUnitLimitMultiple: 1.3,
  });

  const sim = await connection.simulateTransaction(createRandomnessTx, txOpts);
  const sig1 = await connection.sendTransaction(createRandomnessTx, txOpts);
  await connection.confirmTransaction(sig1, COMMITMENT);
  console.log(
    "  Transaction Signature for randomness account creation: ",
    sig1
  );

  // initilise example program accounts
  const playerStateAccount = await PublicKey.findProgramAddressSync(
    [Buffer.from(PLAYER_STATE_SEED), keypair.publicKey.toBuffer()],
    sbProgram.programId
  );
  // Find the escrow account PDA and initliaze the game
  const [escrowAccount, escrowBump] = await PublicKey.findProgramAddressSync(
    [Buffer.from(ESCROW_SEED)],
    myProgram.programId
  );
  console.log("\nInitialize the game states...");
  await initializeRandomness(
    myProgram,
    playerStateAccount,
    escrowAccount,
    keypair,
    sbProgram,
    connection
  );
  await ensureEscrowFunded(
    connection,
    escrowAccount,
    keypair,
    sbProgram,
    txOpts
  );

  // Commit to randomness Ix
  console.log("\nCommit to randomness...");
  const commitIx = await randomness.commitIx(queue);

  // Create coinFlip Ix
  const coinFlipIx = await createRandomness(
    myProgram,
    rngKp.publicKey,
    playerStateAccount,
    keypair,
    escrowAccount
  );

  const commitTx = await sb.asV0Tx({
    connection: sbProgram.provider.connection,
    ixs: [commitIx, coinFlipIx],
    payer: keypair.publicKey,
    signers: [keypair],
    computeUnitPrice: 75_000,
    computeUnitLimitMultiple: 1.3,
  });

  const sim4 = await connection.simulateTransaction(commitTx, txOpts);
  const sig4 = await connection.sendTransaction(commitTx, txOpts);
  await connection.confirmTransaction(sig4, COMMITMENT);
  console.log("  Transaction Signature commitTx", sig4);

  // Reveal the randomness Ix
  console.log("\nReveal the randomness...");
  const revealIx = await randomness.revealIx();
  const settleFlipIx = await settleFlipInstruction(
    myProgram,
    escrowBump,
    playerStateAccount,
    rngKp.publicKey,
    escrowAccount,
    keypair
  );

  const revealTx = await sb.asV0Tx({
    connection: sbProgram.provider.connection,
    ixs: [revealIx, settleFlipIx],
    payer: keypair.publicKey,
    signers: [keypair],
    computeUnitPrice: 75_000,
    computeUnitLimitMultiple: 1.3,
  });

  const sim5 = await connection.simulateTransaction(revealTx, txOpts);
  const sig5 = await connection.sendTransaction(revealTx, txOpts);
  await connection.confirmTransaction(sig5, COMMITMENT);
  console.log("  Transaction Signature revealTx", sig5);

  const answer = await connection.getParsedTransaction(sig5, {
    maxSupportedTransactionVersion: 0,
  });
  let resultLog = answer?.meta?.logMessages?.filter((line) =>
    line.includes("FLIP_RESULT")
  )[0];
  let result = resultLog?.split(": ")[2];

  console.log(`\nAnd the random result is ... ${result}!`);
};
