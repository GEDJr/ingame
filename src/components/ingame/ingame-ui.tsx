'use client'

import { PublicKey } from '@solana/web3.js'
import { useIngameProgram, useIngameProgramAccount } from './ingame-data-access'
import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { BN } from '@coral-xyz/anchor'

export function IngameStart() {
  const { publicKey } = useWallet();
  const { startGame } = useIngameProgram()
  const [startTime, setStartTime] = useState(new BN(5));
  const [stakedAmount, setStakedAmount] = useState<number>(0);
  const [fees, setFees] = useState<number>(1);

  type athAvgPosArgs = {
      name: string,
      number: number,
      avgPos: [number, number]
    }
  const [athAvgPos, setAthAvgPos] = useState<athAvgPosArgs[]>([]);

  type Athlete = {
    name: string
    number: number;
    x: number;
    y: number;
    onPitch: boolean;
  };

  type ClubInMAtch = {
      club: string;
      match: string;
    };

  const [clubInMatchs, setClubInMatchs] = useState<ClubInMAtch[]>(
    [{club:'ManUtd',match:'ManUtdvsStockCity'}, {club:'StockCity',match:'StockCityvsManUtd'}, {club:'Plzen',match:'ManUtdvsPlzen'}, {club:'Spurs',match:'ManUtdvsSpurs'}]
  );

  const [athletes, setAthletes] = useState<Athlete[]>(
    Array.from({ length: 19 }, (_, i) => ({
      name: `name_${i}`,
      number: i + 1,
      x: i < 10 ? 20 + i * 40 : 20 + (i - 10) * 40,
      y: i < 10 ? 20 : 80,
      onPitch: false
    })) 
  );

  const [clubInMatch, setClubInMatch] = useState<ClubInMAtch | null>(null);
  const athletesOnPitch = athletes.filter((athlete) => athlete.onPitch).length;
  const isFormValid = athletesOnPitch < 11 || stakedAmount < fees || clubInMatch === null;
  const [selectedAthleteId, setSelectedAthleteId] = useState<number | null>(null);
  
  const handleAthleteClick = (number: number ) => {
    setSelectedAthleteId(number);
  };

  const handlePitchClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedAthleteId === null) return;

    const pitchRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - pitchRect.left;
    const y = e.clientY - pitchRect.top;

    setAthletes(prevAthletes =>
      prevAthletes.map(athlete =>
        athlete.number === selectedAthleteId && athlete.onPitch === false
          ? { ...athlete, x, y, onPitch: true }
          : athlete
      )
    );
    setSelectedAthleteId(null)
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, number: number) => {
    setSelectedAthleteId(number)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if ((selectedAthleteId === null) || athletesOnPitch >= 16) return;

    const pitchRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - pitchRect.left;
    const y = e.clientY - pitchRect.top;

    setAthletes(prevAthletes =>
      prevAthletes.map(athlete =>
        athlete.number === selectedAthleteId && athlete.onPitch === false
          ? { ...athlete, x, y, onPitch: true }
          : athlete
      )
    );
    setSelectedAthleteId(null)
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = () => {
    if (publicKey && clubInMatch !== null) {
      athletes.map(athlete => {
        if (athlete.onPitch) {
          athAvgPos.push(
            {
              name: athlete.name,
              number: athlete.number,
              avgPos: [athlete.x, athlete.y]
            }
          )
        }
      }

      )
      startGame.mutateAsync({ clubInMatch, startTime, athAvgPos, stakedAmount, starter: publicKey, joiner: publicKey });
    }
  };

  const handleSelectClub = (club: ClubInMAtch) => {
    setClubInMatch(club);
  };

  return (
    <div className='flex flex-col items-center gap-4'>
      <div className='flex flex-wrap gap-4 p-4'>
        {clubInMatchs.map((club) => (
          <button
            key={club.club}
            onClick={() => handleSelectClub(club)}
            className={`px-4 py-2 rounded-lg
              ${club.club === clubInMatch?.club ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}
              hover:bg-blue-400 hover:text-white transition-all
            `}
          >
            {`${club.club}`}
          </button>
        ))}
      </div>

      <h2 className='text-2xl font-bold mb.-4'>Players on the pitch: {athletesOnPitch}/16</h2>

      <div className='mt-6 grid grid-cols-7 gap-x-6'>
        <div className='col-span-2 mt-6 grid grid-cols-3 gap-4'>
          {athletes
            .filter((athlete) => !athlete.onPitch)
            .map((athlete) => (
              <div
                key={athlete.number}
                className={`w-10 h-10 bg-blue-500 rounded-full text-white font-bold flex items-center justify-center cursor-pointer ${
                  selectedAthleteId === athlete.number ? 'ring-4 ring-black' : ''
                }`}
                onClick={() => handleAthleteClick(athlete.number)}
              >
                {athlete.number}
              </div>
            ))
          }
        </div>

        <div
          className='col-span-4 relative w-[272px] h-[420px] bg-green-700 border-4 border-white rounded-lg' // Original ratio is 68X105
          onClick={handlePitchClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
        <div className='absolute top-1/2 left-0 w-full h-[2px] bg-white -translate-y-1/2'></div>
        <div className='absolute top-1/2 left-1/2 w-20 h-20 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2'></div>
        <div className='absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2 -translate-y-1/2'></div>
          {athletes
            .filter(athlete => athlete.onPitch)
            .map(athlete => (
              <div
                key={athlete.number}
                className='w-8 h-8 bg-red-500 round-full text-white font-bold flex items-center justify-center absolute'
                style={{ left: athlete.x, top: athlete.y }}
                draggable
                onDragStart={(e) => handleDragStart(e, athlete.number)}
              >
                {athlete.number}
              </div>
            ))
          }
        </div>

        <div className='col-span-1 card-body items-center text-center gap-4'>
          <h3 className='text-lg font-bold mb-2'>Commit SOL</h3>
          <input
            type='number'
            placeholder='Commit Amount'
            value={stakedAmount}
            onChange={(e) => setStakedAmount(Number(e.target.value))}
            className='input input-bordered w-half max-w-xs'
          />
          <button
            onClick={handleSubmit}
            disabled={startGame.isPending || isFormValid}
            className='btn btn-xs lg:btn-md btn-primary'
          >
            Commit Positions
          </button>
        </div>
      </div>
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

  const groupedAccounts: { [key: string]: {account: any, publicKey: PublicKey}[] } = {}
  accounts.data?.map((account) => {

    const seeder = JSON.stringify([account.account.clubInMatch.club, account.account.starter]);

    if (!groupedAccounts[seeder]) {
      groupedAccounts[seeder] = [];
    }
    groupedAccounts[seeder].push({ account: account.account, publicKey: account.publicKey });
  });

  return (
    <div className={'p-4'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="flex flex-col items-center gap-4">
          {
            Object.entries(groupedAccounts).map(([seeder, seederAccounts]) => (
              <div key={seeder} className='mb-4'>
                <div className='flex flex-row gap-4'>
                {seederAccounts.map((account) => (
                  <ImageCrd
                    key={account.publicKey.toString()}
                    account={account.publicKey}
                  />
                ))}
                </div>
              </div>
            ))
          }
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

function ImageCrd({ account }: { account: PublicKey }) {
  
  const { accountQuery, joinGame } = useIngameProgramAccount({
    account,
  })
  const { publicKey } = useWallet();

  const [startTime, setstartTime] = useState<BN>(new BN(15));
  const starter = accountQuery.data?.starter;
  const clubInMatch = accountQuery.data?.clubInMatch;

  type athAvgPosArgs = {
    name: string,
    number: number,
    avgPos: [number, number]
  }
  const [athAvgPos, setAthAvgPos] = useState<athAvgPosArgs[]>([]);

  type Athlete = {
    name: string
    number: number;
    x: number;
    y: number;
    onPitch: boolean;
  };

  const [athletes, setAthletes] = useState<Athlete[]>(
    Array.from({ length: 19 }, (_, i) => ({
      name: `name_${i}`,
      number: i + 1,
      x: i < 10 ? 20 + i * 40 : 20 + (i - 10) * 40,
      y: i < 10 ? 20 : 80,
      onPitch: false
    })) 
  );

  const athletesOnPitch = athletes.filter((athlete) => athlete.onPitch).length;
  const isFormValid = athletesOnPitch < 11 || clubInMatch === null || startTime === undefined || starter === undefined;

  const [selectedAthleteId, setSelectedAthleteId] = useState<number | null>(null);
  
  const handleAthleteClick = (number: number ) => {
    setSelectedAthleteId(number);
  };

  const handlePitchClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedAthleteId === null) return;

    const pitchRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - pitchRect.left;
    const y = e.clientY - pitchRect.top;

    setAthletes(prevAthletes =>
      prevAthletes.map(athlete =>
        athlete.number === selectedAthleteId && athlete.onPitch === false
          ? { ...athlete, x, y, onPitch: true }
          : athlete
      )
    );
    setSelectedAthleteId(null)
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if ((selectedAthleteId === null) || athletesOnPitch >= 16) return;

    const pitchRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - pitchRect.left;
    const y = e.clientY - pitchRect.top;

    setAthletes(prevAthletes =>
      prevAthletes.map(athlete =>
        athlete.number === selectedAthleteId && athlete.onPitch === false
          ? { ...athlete, x, y, onPitch: true }
          : athlete
      )
    );
    setSelectedAthleteId(null)
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = () => {
    

    if (publicKey && clubInMatch !== undefined && startTime !== undefined && starter !== undefined) {
      athletes.map(athlete => {
        if (athlete.onPitch) {
          athAvgPos.push(
            {
              name: athlete.name,
              number: athlete.number,
              avgPos: [athlete.x, athlete.y]
            }
          )
        }
      }
      )
      
      joinGame.mutateAsync({
        athAvgPos, 
        joiner: publicKey,
        clubInMatch: clubInMatch,
        startTime,
        starter
      });
    }
  };

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <>
    {!accountQuery.data?.joiner ? (
      <div className='flex flex-col items-center gap-4'>
        <h2 className='h-auto text-2xl text-center font-bold mb.-4'>
          Starter: {accountQuery.data?.starter.toString().slice(0, 4)}..{accountQuery.data?.starter.toString().slice(-4)} <br/>
          Commit requirement: {accountQuery.data?.stakedAmount} SOL <br/>
          Current total: {accountQuery.data?.totalStaked} SOL
        </h2>
        <h3 className='text-lg text-center font-bold mb-2'>({accountQuery.data?.clubInMatch.club}) in {accountQuery.data?.clubInMatch.match}</h3>
        <div className='mt-6 grid grid-cols-2 grid-rows-1 gap-4'>
          <div className='row-span-1 mt-6 grid grid-cols-4 gap-4'>
          {athletes
              .filter((athlete) => !athlete.onPitch)
              .map((athlete) => (
                <div
                  key={athlete.number}
                  className={`w-10 h-10 bg-blue-500 rounded-full text-white font-bold flex items-center justify-center cursor-pointer ${
                    selectedAthleteId === athlete.number ? 'ring-4 ring-black' : ''
                  }`}
                  onClick={() => handleAthleteClick(athlete.number)}
                >
                  {athlete.number}
                </div>
              ))
            }
          </div>
          <div
            className='relative w-[272px] h-[420px] bg-green-700 border-4 border-white rounded-lg' // Original ratio is 68X105
            onClick={handlePitchClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
          <div className='absolute top-1/2 left-0 w-full h-[2px] bg-white -translate-y-1/2'></div>
          <div className='absolute top-1/2 left-1/2 w-20 h-20 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2'></div>
          <div className='absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2 -translate-y-1/2'></div>
            {accountQuery.data?.athAvgPos
              .map(athlete => (
                <div
                  key={athlete.number}
                  className='w-8 h-8 bg-yellow-500 round-full text-white font-bold flex items-center justify-center absolute'
                  style={{ left: athlete.avgPos[0], top: athlete.avgPos[1] }}
                >
                  {athlete.number}
                </div>
              ))
            }
            {athletes
              .filter(athlete => athlete.onPitch)
              .map(athlete => (
                <div
                  key={athlete.number}
                  className='w-8 h-8 bg-red-500 round-full text-white font-bold flex items-center justify-center absolute'
                  style={{ left: athlete.x, top: athlete.y }}
                >
                  {athlete.number}
                </div>
              ))
            }
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={joinGame.isPending || isFormValid}
          className='btn btn-xs lg:btn-md btn-primary'
        >
          Challenge Positions
        </button>
      </div>
    ) : (
      <div className='flex flex-col items-center gap-4'>
        <h2><br/><br/><br/><br/></h2>
        <h3 className='h-auto text-2xl text-center font-bold mb.-4'>
          {accountQuery.data?.joiner.toString().slice(0, 4)}..{accountQuery.data?.joiner.toString().slice(-4)}
        </h3>
        <div className='mt-6 grid grid-cols-1 grid-rows-1 gap-4'>
          <div
            className='relative w-[272px] h-[420px] bg-green-700 border-4 border-white rounded-lg' // Original ratio is 68X105
            onClick={handlePitchClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
          <div className='absolute top-1/2 left-0 w-full h-[2px] bg-white -translate-y-1/2'></div>
          <div className='absolute top-1/2 left-1/2 w-20 h-20 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2'></div>
          <div className='absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2 -translate-y-1/2'></div>
            {accountQuery.data?.athAvgPos
              .map(athlete => (
                <div
                  key={athlete.number}
                  className='w-8 h-8 bg-yellow-500 round-full text-white font-bold flex items-center justify-center absolute'
                  style={{ left: athlete.avgPos[0], top: athlete.avgPos[1] }}
                >
                  {athlete.number}
                </div>
              ))
            }
            {athletes
              .filter(athlete => athlete.onPitch)
              .map(athlete => (
                <div
                  key={athlete.number}
                  className='w-8 h-8 bg-red-500 round-full text-white font-bold flex items-center justify-center absolute'
                  style={{ left: athlete.x, top: athlete.y }}
                >
                  {athlete.number}
                </div>
              ))
            }
          </div>
        </div>
      </div>
    )}
  </>)
}
