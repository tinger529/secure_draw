#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

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
    ctx.accounts.securedraw.count = ctx.accounts.securedraw.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeSecuredraw>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.securedraw.count = value.clone();
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
}
