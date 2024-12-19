'use client'

import { getIngameProgram, getIngameProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import { BN } from '@coral-xyz/anchor'

interface StartGameArgs {
  clubInMatch: ClubInMAtch;
  startTime: BN;
  athAvgPos: AthAvgPosAgs[];
  stakedAmount?: number;
  starter: PublicKey;
  joiner: PublicKey;
}

interface ClubInMAtch {
  club: string;
  match: string;
}

interface AthAvgPosAgs {
  name: string;
  number: number;
  avgPos: [number, number]
}

export function useIngameProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getIngameProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getIngameProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['ingame', 'all', { cluster }],
    queryFn: () => program.account.startedGame.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const startGame = useMutation<string, Error, StartGameArgs> ({
    mutationKey: [ `game`,  `start`, { cluster }],
    mutationFn: async ({ clubInMatch, startTime, athAvgPos, stakedAmount, starter }) => {
      return program.methods.startGame( clubInMatch, startTime, athAvgPos, stakedAmount ?? 0, starter ).rpc()
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Error starting game: ${error.message}`);
    },
  });

  return {
    program,
    accounts,
    getProgramAccount,
    startGame,
    programId,
  };
}

export function useIngameProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useIngameProgram()

  const accountQuery = useQuery({
    queryKey: ['ingame', 'fetch', { cluster, account }],
    queryFn: () => program.account.startedGame.fetch(account),
  })
  
  const joinGame = useMutation<string, Error, StartGameArgs> ({
    mutationKey: [ `game`,  `join`, { cluster }],
    mutationFn: async ({ clubInMatch, startTime, athAvgPos, starter, joiner }) => {
      return program.methods.joinGame( clubInMatch, startTime, athAvgPos, starter, joiner ?? starter ).rpc()
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Error starting game: ${error.message}`);
    },
  });

  return {
    accountQuery,
    joinGame,
  };
}
