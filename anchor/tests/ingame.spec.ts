import { BankrunProvider, startAnchor } from "anchor-bankrun";
import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair, PublicKey} from '@solana/web3.js'
import { Ingame } from '../target/types/ingame';

const IDL = require('../target/idl/ingame.json');

const ingameAddress = new PublicKey("2Vs5S2EyrhhMTqY5NEGzuN4rWXfdoRhJ72oThS2SvfCz")
const starter = new PublicKey("GJgsr2MzUoS88qQvgWmd1GYQ5SzAJZcsF4Hhv6d4G1KQ");

describe('Ingame', () => {
  let context;
  let provider;
  let ingameProgram: anchor.Program<Ingame>;

  beforeAll(async () => {
    context = await startAnchor("", [{name: "ingame", programId: ingameAddress}], []);
    provider = new BankrunProvider(context);

    ingameProgram = new Program<Ingame>(
      IDL,
      provider,
    );
  })

  it('Start Game', async () => {

    await ingameProgram.methods.startGame(
      {club: "ManUtd", match: "ManUtdvsSpurs"},
      new anchor.BN(1),
      [
        {
          name: "KO", number: 0, avgPos: [0, 0]
        }
      ],
      8,
      starter
    ).rpc();

    const [startedGamePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("ManUtd")],
      // [Buffer.from("ManUtd"), starter.toBuffer()],
      ingameAddress,
    );

    // console.log([Buffer.from("ManUtd"), starter.toBytes()])
    // console.log([Buffer.from("ManUtd"), starter.toBuffer()])
    // console.log(startedGamePDA)
    // console.log(dataAccountPDA)

    const startedGame = await ingameProgram.account.startedGame.fetch(startedGamePDA);
    console.log(startedGame);

    expect(startedGame.stakedAmount).toEqual(8);
    expect(startedGame.clubInMatch.club).toEqual("ManUtd");
    expect(startedGame.startTime.toNumber()).toBeLessThan(startedGame.winTime.toNumber());
  });

  it('Join Game', async () => {
    
    await ingameProgram.methods.joinGame(
      {club: "ManUtd", match: "ManUtdvsSpurs"},
      new anchor.BN(11),
      [
        {
          name: "John", number: 4, avgPos: [5, 7]
        }
      ],
      starter,
      starter
    ).rpc();

    const [startedGamePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("ManUtd")],
      // [Buffer.from("ManUtd"), starter.toBuffer()],
      ingameAddress,
    );

    const [joinedGamePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("ManUtd"), Buffer.from("ManUtdvsSpurs")],
      // [Buffer.from("ManUtd"), starter.toBuffer()],
      ingameAddress,
    );

    // console.log([Buffer.from("ManUtd"), starter.toBytes()])
    // console.log([Buffer.from("ManUtd"), starter.toBuffer()])
    // console.log(joinedGamePDA)
    // console.log(dataAccountPDA)

    const starterPositions = await ingameProgram.account.startedGame.fetch(startedGamePDA);
    console.log(starterPositions);
    const joinerPositions = await ingameProgram.account.joinedGame.fetch(joinedGamePDA);
    console.log(joinerPositions);

    expect(starterPositions.totalStaked).toEqual(16);
    expect(starterPositions.gamers).toEqual(2);
    expect(starterPositions.startTime.toNumber()).toBeLessThan(joinerPositions.joinTime.toNumber());
  });
});
