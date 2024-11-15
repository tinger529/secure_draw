'use client'

import {getSecuredrawProgram, getSecuredrawProgramId} from '@project/anchor'
import {useConnection} from '@solana/wallet-adapter-react'
import {Cluster, Keypair, PublicKey} from '@solana/web3.js'
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
    mutationFn: () => program.methods.increment().accounts({ securedraw: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['securedraw', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ securedraw: account }).rpc(),
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
