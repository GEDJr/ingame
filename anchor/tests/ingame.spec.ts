import { BankrunProvider, startAnchor } from "anchor-bankrun";
import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair, PublicKey} from '@solana/web3.js'
import { Ingame } from '../target/types/ingame';

const IDL = require('../target/idl/ingame.json');

const ingameAddress = new PublicKey("pYGbCyybENYsKbi4TivtrSBCggmjwSh2p2Qso8yatdx")

describe('ingame', () => {
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

  it('Deploy Game', async () => {

    await ingameProgram.methods.deployGame().rpc();

    const seed = Buffer.from(ingameAddress.toBytes());
    // console.log(seed);

    const [gameAddress] = PublicKey.findProgramAddressSync(
      [seed],
      ingameAddress,
    )
    console.log(gameAddress)

    const game = await ingameProgram.account.game.fetch(gameAddress);

    console.log(game);

    // expect(game.gameId).toEqual(1);
    // expect(game.club).toEqual("MU");
    // expect(game.startTime.toNumber()).toBeLessThan(game.winTime.toNumber());
  });
});
