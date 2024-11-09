#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

#[program]
pub mod tmpdraw {
    use super::*;

  pub fn close(_ctx: Context<CloseTmpdraw>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.tmpdraw.count = ctx.accounts.tmpdraw.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.tmpdraw.count = ctx.accounts.tmpdraw.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeTmpdraw>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.tmpdraw.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeTmpdraw<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Tmpdraw::INIT_SPACE,
  payer = payer
  )]
  pub tmpdraw: Account<'info, Tmpdraw>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseTmpdraw<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub tmpdraw: Account<'info, Tmpdraw>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub tmpdraw: Account<'info, Tmpdraw>,
}

#[account]
#[derive(InitSpace)]
pub struct Tmpdraw {
  count: u8,
}
