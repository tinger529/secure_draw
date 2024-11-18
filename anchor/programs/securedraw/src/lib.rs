#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash::hash;

declare_id!("7cKq9NnHaPboTM9tfsdKNheXwQa4fQkKEcbUCYbLy6VU");

#[program]
pub mod securedraw {
    use super::*;

  pub fn close(_ctx: Context<CloseSecuredraw>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.securedraw.count = ctx.accounts.securedraw.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    let recent_hash = hash(&Clock::get().unwrap().unix_timestamp.to_le_bytes());
    let random_number = recent_hash.as_ref()[0] as u8 % 100;
    ctx.accounts.securedraw.count = random_number;
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeSecuredraw>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, nuser:Pubkey) -> Result<()> {
    ctx.accounts.securedraw.nuser = nuser;
    msg!("New user is set: {:?}", nuser);
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeSecuredraw<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Securedraw::INIT_SPACE,
  payer = payer
  )]
  pub securedraw: Account<'info, Securedraw>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseSecuredraw<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub securedraw: Account<'info, Securedraw>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub securedraw: Account<'info, Securedraw>,
}

#[account]
#[derive(InitSpace)]
pub struct Securedraw {
  count: u8,
  nuser: Pubkey,
}
