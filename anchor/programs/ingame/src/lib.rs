#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("6z8u9qmG1MHT7tngrqRsqKG3z59gsRsp2oa2q1VNBS2f");

#[program]
pub mod ingame {
    use super::*;

    pub fn start_game(ctx: Context<StartGame>, game_id: u8, club: String, start_time: u64, avg_pos: [[u8; 2]; 1], staked_amount: u8) -> Result<()> {
      let game: &mut Account<'_, Game> = &mut ctx.accounts.game;
      game.game_id = game_id;
      game.club = club;
      game.start_time = start_time;
      game.win_time = start_time + (90 + 15 + 25) * 60 * 1000; // 90 mins match, plus 15 half-time break, plus 25 injury time and results retrieval to milisecs
      game.avg_pos = avg_pos;
      game.staked_amount = staked_amount;

      msg!("Match: {}", game.club);
      msg!("Match: {}", game.win_time);

      Ok(())
    }

    pub fn join_game(ctx: Context<JoinGame>, game_id: u8, club: String, avg_pos: [[u8; 2]; 1], staked_amount: u8, _starter: Pubkey) -> Result<()> {
      let game_counter: &mut Account<'_, Game> = &mut ctx.accounts.game;
      // let game: Account<'_, Game> = ctx.accounts.game_counter;
      game_counter.game_id = game_id;
      game_counter.club = club;
      game_counter.start_time = ctx.accounts.game_counter.start_time;
      game_counter.win_time = ctx.accounts.game_counter.win_time; 
      game_counter.avg_pos = avg_pos;
      game_counter.staked_amount = staked_amount;

      msg!("Match: {}", game_counter.club);
      msg!("Match: {}", game_counter.win_time);

      Ok(())
    }

    #[derive(Accounts)]
    #[instruction(game_id: u8, club: String, starter: Pubkey)]
    pub struct JoinGame<'info> {
      #[account(mut)]
      pub joiner: Signer<'info>,
      #[account(
        seeds = [starter.as_ref()],
        bump
      )]
      pub game: Account<'info, Game>,
      #[account(
        init,
        payer = joiner,
        space = 8 + Game::INIT_SPACE,
        seeds = [game_id.to_le_bytes().as_ref(), club.as_bytes(), joiner.key().as_ref()],
        bump
      )]
      pub game_counter: Account<'info, Game>, // More like counter attack
      pub system_program: Program<'info, System>
    }

    #[derive(Accounts)]
    #[instruction(game_id: u8, club: String)]
    pub struct StartGame<'info> {
      #[account(mut)]
      pub starter: Signer<'info>, // Game starter
      #[account(
        init,
        payer = starter,
        space = 8 + Game::INIT_SPACE,
        seeds = [game_id.to_le_bytes().as_ref(), club.as_bytes(), starter.key().as_ref()],
        bump
      )]
      pub game: Account<'info, Game>,
      pub system_program: Program<'info, System>
    }

    #[account]
    #[derive(InitSpace)]
    pub struct Game {
      pub game_id: u8,
      #[max_len(20)]
      pub club: String,
      pub start_time: u64,
      pub win_time: u64,
      pub avg_pos: [[u8; 2]; 1], // Just for simplicity, accual is atleat 19 players on matchday squad
      pub staked_amount: u8
    }
}