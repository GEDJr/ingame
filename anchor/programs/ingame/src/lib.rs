#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("2Vs5S2EyrhhMTqY5NEGzuN4rWXfdoRhJ72oThS2SvfCz");

#[program]
pub mod ingame {
    use super::*;

    pub fn start_game(ctx: Context<StartGame>, club_in_match: ClubInMatch, start_time: u64, ath_avg_pos: Vec<Athlete>, staked_amount: u8, starter: Pubkey) -> Result<()> {
      let started_game: &mut Account<'_, StartedGame> = &mut ctx.accounts.started_game;
      started_game.club_in_match = club_in_match;
      started_game.start_time = start_time; // Later can be retrieved from 'club_matches'
      started_game.win_time = Some(start_time + (90 + 15 + 25) * 60 * 1000); // 90 mins match, plus 15 half-time break, plus 25 injury time and results retrieval to milisecs
      started_game.ath_avg_pos = ath_avg_pos;
      started_game.staked_amount = Some(staked_amount);
      started_game.gamers = Some(1);
      started_game.total_staked = Some(staked_amount);
      started_game.starter = starter;

      msg!("Initial Stake: {:#?}", started_game.total_staked);
      msg!("Number of Gamers: {:?}", started_game.gamers);
      msg!("Starter: {:?}", started_game.starter);

      Ok(())
    }

    pub fn join_game(ctx: Context<JoinGame>, club_in_match: ClubInMatch, join_time: u64, ath_avg_pos: Vec<Athlete>, starter: Pubkey, joiner: Pubkey) -> Result<()> {
      let joined_game: &mut Account<'_, StartedGame> = &mut ctx.accounts.joined_game;
      joined_game.club_in_match = club_in_match;
      joined_game.ath_avg_pos = ath_avg_pos;
      joined_game.start_time = join_time;
      joined_game.starter = starter;
      joined_game.joiner = Some(joiner);

      let started_game: &mut Account<'_, StartedGame> = &mut ctx.accounts.started_game;
      match started_game.staked_amount {
          Some(amount) => {
            if let Some(total) = started_game.total_staked.as_mut() {
              *total += amount;
            }
          },
          None => (),
      };
      if let Some(gamers) = started_game.gamers.as_mut() {
        *gamers += 1
      }

      msg!("Current Stake: {:?}", started_game.total_staked);
      msg!("Number of Gamers: {:?}", started_game.gamers);
      msg!("Joiner: {:?}", joined_game.joiner);
      msg!("Starter: {:?}", joined_game.starter);

      Ok(())
    }

    #[derive(Accounts)]
    #[instruction(club_in_match: ClubInMatch, join_time: u64, ath_avg_pos: Vec<Athlete>, starter: Pubkey)]
    pub struct JoinGame<'info> {
      #[account(mut)]
      pub joiner: Signer<'info>,
      #[account(
        mut,
        // seeds = [club_in_match.club.as_bytes()],
        seeds = [club_in_match.club.as_bytes(), starter.key().as_ref()],
        bump
      )]
      pub started_game: Account<'info, StartedGame>,
      #[account(
        init,
        payer = joiner,
        space = 8 + StartedGame::INIT_SPACE,
        // seeds = [club_in_match.club.as_bytes(), club_in_match.match_.as_bytes()],
        seeds = [club_in_match.club.as_bytes(), starter.key().as_ref(), joiner.key().as_ref()],
        bump
      )]
      pub joined_game: Account<'info, StartedGame>, // More like counter attack
      pub system_program: Program<'info, System>
    }

    #[derive(Accounts)]
    #[instruction(club_in_match: ClubInMatch)]
    pub struct StartGame<'info> {
      #[account(mut)]
      pub starter: Signer<'info>, // Game starter
      #[account(
        init,
        payer = starter,
        space = 8 + StartedGame::INIT_SPACE,
        // seeds = [club_in_match.club.as_bytes()],
        seeds = [club_in_match.club.as_bytes(), starter.key().as_ref()],
        bump
      )]
      pub started_game: Account<'info, StartedGame>,
      pub system_program: Program<'info, System>
    }

    #[account]
    #[derive(InitSpace)]
    pub struct StringHandler {
      #[max_len(10)]
      string_handler: String,
    }

    // #[account]
    // #[derive(InitSpace)]
    // pub struct JoinedGame {
    //   #[max_len(230)]
    //   pub ath_avg_pos: Vec<Athlete>,
    //   pub join_time: u64
    // }

    #[account]
    #[derive(InitSpace)]
    pub struct StartedGame {
      pub club_in_match: ClubInMatch,
      pub start_time: u64,
      pub win_time: Option<u64>,
      #[max_len(230)] // Investigate this space, 23 can accept only 2 athletes, Why?
      pub ath_avg_pos: Vec<Athlete>, // Just for simplicity, accual is atleat 19 players on matchday squad
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

  //   #[account]
  //   #[derive(InitSpace)]
  //   pub struct Seeder {
  //     club: String;
  //     starter: PublicKey;
  // };
}