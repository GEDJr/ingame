import { BankrunProvider, startAnchor } from "anchor-bankrun";
import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair, PublicKey} from '@solana/web3.js'
import { Ingame } from '../target/types/ingame';

const IDL = require('../target/idl/ingame.json');

const ingameAddress = new PublicKey("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF")

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

  it('Start Game', async () => {

    await ingameProgram.methods.startGame(
      1,
      "MU",
      new anchor.BN(0),
      [[4,56]],
      7,
    ).rpc();

    const [gameAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 1), Buffer.from("MU"), Buffer.alloc(8)],
      ingameAddress,
    )

    const game = await ingameProgram.account.game.fetch(gameAddress);

    console.log(game);

    expect(game.gameId).toEqual(1);
    expect(game.club).toEqual("MU");
    expect(game.startTime.toNumber()).toBeLessThan(game.winTime.toNumber());
  });
});
