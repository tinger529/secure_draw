'use client'

import {getTmpdrawProgram, getTmpdrawProgramId} from '@project/anchor'
import {useConnection} from '@solana/wallet-adapter-react'
import {Cluster, Keypair, PublicKey} from '@solana/web3.js'
import {useMutation, useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import toast from 'react-hot-toast'
import {useCluster} from '../cluster/cluster-data-access'
import {useAnchorProvider} from '../solana/solana-provider'
import {useTransactionToast} from '../ui/ui-layout'

export function useTmpdrawProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getTmpdrawProgramId(cluster.network as Cluster), [cluster])
  const program = getTmpdrawProgram(provider)

  const accounts = useQuery({
    queryKey: ['tmpdraw', 'all', { cluster }],
    queryFn: () => program.account.tmpdraw.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['tmpdraw', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ tmpdraw: keypair.publicKey }).signers([keypair]).rpc(),
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

export function useTmpdrawProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useTmpdrawProgram()

  const accountQuery = useQuery({
    queryKey: ['tmpdraw', 'fetch', { cluster, account }],
    queryFn: () => program.account.tmpdraw.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['tmpdraw', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ tmpdraw: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['tmpdraw', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ tmpdraw: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['tmpdraw', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ tmpdraw: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['tmpdraw', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ tmpdraw: account }).rpc(),
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
