import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { Ingame } from '../target/types/ingame';

const IDL = require('../target/idl/ingame.json');

const ingameAddress = new PublicKey("2Vs5S2EyrhhMTqY5NEGzuN4rWXfdoRhJ72oThS2SvfCz")
const starter = new PublicKey("GJgsr2MzUoS88qQvgWmd1GYQ5SzAJZcsF4Hhv6d4G1KQ");

describe('Ingame', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const wallet = provider.wallet as anchor.Wallet;

  const ingameProgram = anchor.workspace.Ingame as Program<Ingame>;

  it('Start Game', async () => {

    const gameStart = await ingameProgram.methods.startGame(
      {club: "ManUtd", match: "ManUtdvsSpurs"},
      new anchor.BN(1),
      [
        {
          name: "KO", number: 0, avgPos: [0, 0]
        }
      ],
      8,
      starter
    ).instruction();

    const blockhashWithContext = await provider.connection.getLatestBlockhash();

    const tx = new anchor.web3.Transaction(
        {
            feePayer: provider.wallet.publicKey,
            blockhash: blockhashWithContext.blockhash,
            lastValidBlockHeight: blockhashWithContext.lastValidBlockHeight,
        }
    ).add(gameStart);

    const signature = await anchor.web3.sendAndConfirmTransaction(provider.connection, tx, [wallet.payer], {skipPreflight: true});
    console.log('Your transaction signature', tx);
  });
});
