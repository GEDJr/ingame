'use client'

import { getIngameProgram, getIngameProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import { BN } from '@coral-xyz/anchor'

interface StartGameArgs {
  club:string;
  startTime: BN;
  avgPos: [number, number][];
  stakedAmount: number;
  starter: PublicKey;
}

interface JoinGameArgs {
  gameId: number;
  avgPos: [number, number][];
  stakedAmount: number;
  joiner: PublicKey;
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
    queryFn: () => program.account.game.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const deployGame = useMutation<string, Error> ({
    mutationKey: [ `game`,  `deploy`, { cluster }],
    mutationFn: async () => {
      return program.methods.deployGame().rpc()
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
    deployGame,
    programId,
  };
}

export function useIngameProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useIngameProgram()

  const accountQuery = useQuery({
    queryKey: ['ingame', 'fetch', { cluster, account }],
    queryFn: () => program.account.game.fetch(account),
  })

  const startGame = useMutation<string, Error, StartGameArgs> ({
    mutationKey: [ `game`,  `start`, { cluster }],
    mutationFn: async ({ club, startTime, avgPos, stakedAmount, starter }) => {
      return program.methods.startGame( club, startTime, avgPos, stakedAmount, starter ).rpc()
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Error starting game: ${error.message}`);
    },
  });

  const joinGame = useMutation<string, Error, JoinGameArgs> ({
    mutationKey: [ `game`,  `join`, { cluster }],
    mutationFn: async ({ gameId, avgPos, stakedAmount, joiner }) => {
      return program.methods.joinGame( gameId, avgPos, stakedAmount, joiner ).rpc()
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
    startGame,
    joinGame,
  };
}
