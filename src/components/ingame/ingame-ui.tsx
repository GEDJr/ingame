'use client'

import { Keypair, PublicKey } from '@solana/web3.js'
import { ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useIngameProgram, useIngameProgramAccount } from './ingame-data-access'
import { useState } from 'react'

export function IngameDeploy() {
  const { deployGame } = useIngameProgram()

  type Player = {
    id: number;
    x: number;
    y: number;
    onPitch: boolean;
  };

  const [players, setPlayers] = useState<Player[]>(
    Array.from({ length: 19 }, (_, i) => ({
      id: i + 1,
      x: i < 10 ? 20 + i * 40 : 20 + (i - 10) * 40,
      y: i < 10 ? 20 : 80,
      onPitch: false
    })) 
  );

  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  
  const handlePlayerClick = (id: number ) => {
    setSelectedPlayerId(id);
  };

  const handlePitchClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedPlayerId === null) return;

    const pitchRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - pitchRect.left;
    const y = e.clientY - pitchRect.top;

    setPlayers(prevPlayers =>
      prevPlayers.map(player =>
        player.id === selectedPlayerId && player.onPitch === false
          ? { ...player, x, y, onPitch: true }
          : player
      )
    );
    setSelectedPlayerId(null)
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: number) => {
    setSelectedPlayerId(id)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (selectedPlayerId === null) return;

    const pitchRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - pitchRect.left;
    const y = e.clientY - pitchRect.top;

    setPlayers(prevPlayers =>
      prevPlayers.map(player =>
        player.id === selectedPlayerId && player.onPitch === false
          ? { ...player, x, y, onPitch: true }
          : player
      )
    );
    setSelectedPlayerId(null)
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const playersOnPitch = players.filter((player) => player.onPitch).length;

  return (
    <div className='flex flex-col items-center'>
      <h2 className='text-2xl font-bold mb.-4'>Football Pitch</h2>
      
      <div
        className='relative w-32 h-52 bg-green-600 border-white rounded-lg'
        onClick={handlePitchClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {players
          .filter(player => player.onPitch)
          .map(player => (
            <div
              key={player.id}
              className='w-8 h-8 bg-red-500 round-full text-white font-bold flex items-center justify-center absolute'
              style={{ left: player.x, top: player.y }}
              draggable
              onDragStart={(e) => handleDragStart(e, player.id)}
            >
              {player.id}
            </div>
          ))
        }
      </div>

      <div className='mt-6 grid grid-cols-10 gap-4'>
        {players
          .filter((player) => !player.onPitch)
          .map((player) => (
            <div
              key={player.id}
              className={`w-10 h-10 bg-blue-500 rounded-full text-white font-bold flex items-center justify-center cursor-pointer ${
                selectedPlayerId === player.id ? 'ring-4 ring-black' : ''
              }`}
              onClick={() => handlePlayerClick(player.id)}
            >
              {player.id}
            </div>
          ))
        }
      </div>

      <p className='mt-4 text-lg'>Players on the pitch: {playersOnPitch}/16</p>
    </div>
  )
}

export function IngameList() {
  const { accounts, getProgramAccount } = useIngameProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <IngameCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function IngameCard({ account }: { account: PublicKey }) {
  const { accountQuery} = useIngameProgramAccount({
    account,
  })

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <h2 className="card-title justify-center text-3xl cursor-pointer" onClick={() => accountQuery.refetch()}>
           
          </h2>
          <div className="card-actions justify-around">
            <button
              className="btn btn-xs lg:btn-md btn-outline"

            >
              Increment
            </button>
            {/* <button
            //   className="btn btn-xs lg:btn-md btn-outline"
            //   // onClick={() => {
            //   //   const value = window.prompt('Set value to:', count.toString() ?? '0')
            //   //   if (!value || parseInt(value) === count || isNaN(parseInt(value))) {
            //   //     return
            //   //   }
            //   //   return setMutation.mutateAsync(parseInt(value))
            //   }}
            //   // disabled={setMutation.isPending}
            // >
            //   Set
            </button> */}
          </div>
          <div className="text-center space-y-4">
            <p>
              <ExplorerLink path={`account/${account}`} label={ellipsify(account.toString())} />
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
