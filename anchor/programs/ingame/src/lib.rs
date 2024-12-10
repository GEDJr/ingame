#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("pYGbCyybENYsKbi4TivtrSBCggmjwSh2p2Qso8yatdx");

#[program]
pub mod ingame {
    use super::*;

    pub fn deploy_game(ctx: Context<DeployGame>) -> Result<()> {
      let game: &mut Account<'_, Game> = &mut ctx.accounts.game;
      game.game_id = 1;
      game.gamers = Gamers { gamers: Vec::new() };
      game.club_matches = ClubMatches { club_matches: Vec::from([[Club { club: "ManUtd".to_string() }, Club { club: "StockFC".to_string() }]]) }; // Production data has to be scraped

      Ok(())
    }

    pub fn start_game(ctx: Context<StartGame>, club: String, start_time: u64, avg_pos: [[u8; 2]; 1], staked_amount: u8, _starter: Pubkey) -> Result<()> {
      let started_game: &mut Account<'_, StartedGame> = &mut ctx.accounts.started_game;
      started_game.club = club;
      started_game.start_time = start_time; // Later can be retrieved from 'club_matches'
      started_game.win_time = start_time + (90 + 15 + 25) * 60 * 1000; // 90 mins match, plus 15 half-time break, plus 25 injury time and results retrieval to milisecs
      started_game.avg_pos = avg_pos;
      started_game.staked_amount = staked_amount;

      let game: &mut Account<'_, Game> = &mut ctx.accounts.game;
      game.game_id += 1;

      msg!("Match: {}", started_game.club);
      msg!("Match: {}", started_game.win_time);

      Ok(())
    }

    pub fn join_game(ctx: Context<JoinGame>, _game_id: u8, avg_pos: [[u8; 2]; 1], staked_amount: u8, _joiner: Pubkey) -> Result<()> {
      let game_counter: &mut Account<'_, StartedGame> = &mut ctx.accounts.game_counter;
      game_counter.avg_pos = avg_pos;
      game_counter.staked_amount = staked_amount;

      msg!("Match: {}", game_counter.club);
      msg!("Match: {}", game_counter.win_time);

      Ok(())
    }

    #[derive(Accounts)]
    #[instruction(game_id: u8, club: String, starter: Pubkey, deployer: Pubkey)]
    pub struct JoinGame<'info> {
      #[account(
        seeds = [deployer.as_ref()],
        bump
      )]
      pub game: Account<'info, Game>,
      #[account(mut)]
      pub joiner: Signer<'info>,
      #[account(
        seeds = [starter.as_ref()],
        bump
      )]
      pub started_game: Account<'info, StartedGame>,
      #[account(
        init,
        payer = joiner,
        space = 8 + Game::INIT_SPACE,
        seeds = [game_id.to_le_bytes().as_ref(), club.as_bytes(), joiner.key().as_ref()],
        bump
      )]
      pub game_counter: Account<'info, StartedGame>, // More like counter attack
      pub system_program: Program<'info, System>
    }

    #[derive(Accounts)]
    #[instruction(game_id: u8, club: String, deployer: Pubkey)]
    pub struct StartGame<'info> {
      #[account(
        seeds = [deployer.as_ref()],
        bump
      )]
      pub game: Account<'info, Game>,
      #[account(mut)]
      pub starter: Signer<'info>, // Game starter
      #[account(
        init,
        payer = starter,
        space = 8 + StartedGame::INIT_SPACE,
        seeds = [game_id.to_le_bytes().as_ref(), club.as_bytes(), starter.key().as_ref()],
        bump
      )]
      pub started_game: Account<'info, StartedGame>,
      pub system_program: Program<'info, System>
    }

    #[derive(Accounts)]
    pub struct DeployGame<'info> {
      #[account(mut)]
      pub deployer: Signer<'info>, // Game deployer
      #[account(
        init,
        payer = deployer,
        space = 8 + Game::INIT_SPACE,
        seeds = [deployer.key().as_ref()],
        bump
      )]
      pub game: Account<'info, Game>,
      pub system_program: Program<'info, System>
    }

    #[account]
    #[derive(InitSpace)]
    pub struct Game {
      pub game_id: u32,
      pub gamers: Gamers,
      pub club_matches: ClubMatches,
    }

    #[account]
    #[derive(InitSpace)]
    pub struct Gamers {
      #[max_len(5)] // For test
      gamers: Vec<Pubkey>,
    }

    #[account]
    #[derive(InitSpace)]
    pub struct ClubMatches {
      #[max_len(5)]
      club_matches: Vec<[Club; 2]>,
    }

    #[account]
    #[derive(InitSpace)]
    pub struct Club {
      #[max_len(10)]
      club: String,
    }

    #[account]
    #[derive(InitSpace)]
    pub struct StartedGame {
      #[max_len(10)]
      pub club: String,
      pub start_time: u64,
      pub win_time: u64,
      pub avg_pos: [[u8; 2]; 1], // Just for simplicity, accual is atleat 19 players on matchday squad
      pub staked_amount: u8
    }
}