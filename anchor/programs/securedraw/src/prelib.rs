#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash::hash;
use switchboard_on_demand::on_demand::accounts::pull_feed::PullFeedAccountData;

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

  pub fn increment(ctx: Context<Update>, nuser:u8) -> Result<()> {
    let recent_hash = hash(&Clock::get().unwrap().unix_timestamp.to_le_bytes());
    let random_number = recent_hash.as_ref()[0] as u8 % (ctx.accounts.securedraw.nuser.len() as u8);
    ctx.accounts.securedraw.count = random_number;
    Ok(())
  }

  pub fn test<'a>(ctx: Context<Test>) -> Result<()> {
    
      // Feed account data
      let feed_account = ctx.accounts.feed.data.borrow();
      
      // Docs at: https://switchboard-on-demand-rust-docs.web.app/on_demand/accounts/pull_feed/struct.PullFeedAccountData.html
      let feed = PullFeedAccountData::parse(feed_account).unwrap();
      
      // Get the value, 
      let price = feed.value();
      
      // Log the value
      msg!("price: {:?}", price);
      Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeSecuredraw>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, nuser:Vec<Pubkey>) -> Result<()> {
    ctx.accounts.securedraw.nuser = nuser;
    // print the nuser
    for i in ctx.accounts.securedraw.nuser.iter() {
      msg!("nuser: {:?}", i);
    }
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

// Include the feed account
#[derive(Accounts)]
pub struct Test<'info> {
  /// CHECK: test
  pub feed: AccountInfo<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Securedraw {
  pub count: u8,
  #[max_len(10)]
  pub nuser: Vec<Pubkey>,
}
