'use client'
import * as anchor from "@coral-xyz/anchor";
import {getSecuredrawProgram, getSecuredrawProgramId} from '@project/anchor'
import {useConnection} from '@solana/wallet-adapter-react'
import {Connection, Cluster, Keypair, PublicKey, Transaction, SystemProgram, VersionedTransaction,} from '@solana/web3.js'
import dotenv from "dotenv";
import * as fs from "fs";
import * as sb from "@switchboard-xyz/on-demand";
import reader from "readline-sync";
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

export async function myAnchorProgram(
  provider: anchor.Provider,
  keypath: string
): Promise<anchor.Program> {
  const myProgramKeypair = await sb.AnchorUtils.initKeypairFromFile(keypath);
  const pid = myProgramKeypair.publicKey;
  const idl = (await anchor.Program.fetchIdl(pid, provider))!;
  const program = new anchor.Program(idl, provider);
  return program;
}

export async function initializeMyProgram( provider: anchor.Provider): Promise<anchor.Program> {
  const myProgramPath = "anchor/target/deploy/sb_randomness-keypair.json";
  const myProgram = await myAnchorProgram(provider, myProgramPath);
  console.log("My program", myProgram.programId.toString());
  return myProgram;
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
    mutationFn: (nuser) => program.methods.increment(nuser).accounts({ securedraw: account }).rpc(),
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
