#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("2Vs5S2EyrhhMTqY5NEGzuN4rWXfdoRhJ72oThS2SvfCz");

#[program]
pub mod ingame {
  use anchor_lang::{
    // solana_program::clock,
    system_program
  };

  use super::*;

  pub fn start_game(ctx: Context<StartGame>, club_in_match: ClubInMatch, start_time: u64, ath_avg_pos: Vec<Athlete>, staked_amount: u8, starter: Pubkey) -> Result<()> {
    ctx.accounts.started_game.bump = ctx.bumps.started_game;
    ctx.accounts.burser.bump = ctx.bumps.burser;

    let fee: u64 = staked_amount as u64 * 1000000000;
    system_program::transfer(
      CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
          from: ctx.accounts.starter.to_account_info(),
          to: ctx.accounts.burser.to_account_info(),
        }
      ),
      fee,
    )?;

    ctx.accounts.started_game.club_in_match = club_in_match;
    ctx.accounts.started_game.start_time = start_time; 
    ctx.accounts.started_game.win_time = Some(start_time + (90 + 15 + 25) * 60 * 1000); // 90 mins match, plus 15 half-time break, plus 25 injury time and results retrieval to milisecs
    ctx.accounts.started_game.ath_avg_pos = ath_avg_pos;
    ctx.accounts.started_game.staked_amount = Some(staked_amount);
    ctx.accounts.started_game.gamers = Some(1);
    ctx.accounts.started_game.total_staked = Some(staked_amount);
    ctx.accounts.started_game.starter = starter;

    ctx.accounts.burser.winner_chosen = false;

    msg!("Initial Stake: {:#?}", ctx.accounts.started_game.total_staked);
    msg!("Number of Gamers: {:?}", ctx.accounts.started_game.gamers);
    msg!("Starter: {:?}", ctx.accounts.started_game.starter);

    Ok(())
  }

  pub fn join_game(ctx: Context<JoinGame>, club_in_match: ClubInMatch, join_time: u64, ath_avg_pos: Vec<Athlete>, starter: Pubkey, joiner: Pubkey) -> Result<()> {
    // let clock: Clock = Clock::get()?;
    // if clock.slot > ctx.accounts.started_game.start_time {
    //   return Err(ErrorCode::WrongTiming.into())
    // }

    ctx.accounts.started_game.bump = ctx.bumps.started_game;
    ctx.accounts.joined_game.bump = ctx.bumps.joined_game;
    ctx.accounts.burser.bump = ctx.bumps.burser;

    let mut fee: u64 = 0;
    match ctx.accounts.started_game.staked_amount {
      Some(sol) => { fee = sol as u64 * 1000000000 },
      None => (),
    };
    system_program::transfer(
      CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
          from: ctx.accounts.joiner.to_account_info(),
          to: ctx.accounts.burser.to_account_info(),
        }
      ),
      fee,
    )?;

    ctx.accounts.joined_game.club_in_match = club_in_match;
    ctx.accounts.joined_game.ath_avg_pos = ath_avg_pos;
    ctx.accounts.joined_game.start_time = join_time;
    ctx.accounts.joined_game.starter = starter;
    ctx.accounts.joined_game.joiner = Some(joiner);

    
    match ctx.accounts.started_game.staked_amount {
        Some(amount) => {
          if let Some(total) = ctx.accounts.started_game.total_staked.as_mut() {
            *total += amount;
          }
        },
        None => (),
    };
    if let Some(gamers) = ctx.accounts.started_game.gamers.as_mut() {
      *gamers += 1
    }

    msg!("Current Stake: {:?}", ctx.accounts.started_game.total_staked);
    msg!("Number of Gamers: {:?}", ctx.accounts.started_game.gamers);
    msg!("Joiner: {:?}", ctx.accounts.joined_game.joiner);
    msg!("Starter: {:?}", ctx.accounts.joined_game.starter);

    Ok(())
  }

  #[derive(Accounts)]
  #[instruction(club_in_match: ClubInMatch, join_time: u64, ath_avg_pos: Vec<Athlete>, starter: Pubkey)]
  pub struct JoinGame<'info> {
    #[account(mut)]
    pub joiner: Signer<'info>,
    #[account(
      mut,
      seeds = [club_in_match.club.as_bytes(), starter.key().as_ref()],
      bump
    )]
    pub started_game: Account<'info, StartedGame>,
    #[account(
      mut,
      seeds = [b"burser".as_ref(), club_in_match.club.as_bytes(), starter.key().as_ref()],
      bump
    )]
    pub burser: Account<'info, Burser>,
    #[account(
      init,
      payer = joiner,
      space = 8 + StartedGame::INIT_SPACE,
      seeds = [club_in_match.club.as_bytes(), starter.key().as_ref(), joiner.key().as_ref()],
      bump
    )]
    pub joined_game: Account<'info, StartedGame>,
    pub system_program: Program<'info, System>
  }

  #[derive(Accounts)]
  #[instruction(club_in_match: ClubInMatch)]
  pub struct StartGame<'info> {
    #[account(mut)]
    pub starter: Signer<'info>,
    #[account(
      init,
      payer = starter,
      space = 8 + StartedGame::INIT_SPACE,
      seeds = [club_in_match.club.as_bytes(), starter.key().as_ref()],
      bump
    )]
    pub started_game: Account<'info, StartedGame>,
    #[account(
      init,
      payer = starter,
      space = 8 + Burser::INIT_SPACE,
      seeds = [b"burser".as_ref(), club_in_match.club.as_bytes(), starter.key().as_ref()],
      bump
    )]
    pub burser: Account<'info, Burser>,
    pub system_program: Program<'info, System>
  }

  #[account]
  #[derive(InitSpace)]
  pub struct StringHandler {
    #[max_len(10)]
    string_handler: String,
  }

  #[account]
  #[derive(InitSpace)]
  pub struct Burser {
    pub bump: u8,
    pub winner: Pubkey,
    pub winner_chosen: bool,
  }

  #[account]
  #[derive(InitSpace)]
  pub struct StartedGame {
    pub bump: u8,   
    pub club_in_match: ClubInMatch,
    pub start_time: u64,
    pub win_time: Option<u64>,
    #[max_len(230)]
    pub ath_avg_pos: Vec<Athlete>,
    pub staked_amount: Option<u8>,
    pub total_staked: Option<u8>,
    pub gamers: Option<u8>,
    pub starter: Pubkey,
    pub joiner: Option<Pubkey>
  }

  #[account]
  #[derive(InitSpace)]
  pub struct Athlete {
    #[max_len(10)]
    name: String, 
    number: u8, 
    avg_pos: [u16; 2],
  }

  #[account]
  #[derive(InitSpace)]
  pub struct ClubInMatch {
    #[max_len(10)]
    club: String,
    #[max_len(20)]
    match_: String
  }
}

#[error_code]
pub enum ErrorCode {
  #[msg("Wrong Timing")]
  WrongTiming,
}