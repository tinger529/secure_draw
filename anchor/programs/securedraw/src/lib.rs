#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash::hash;
use switchboard_on_demand::accounts::RandomnessAccountData;

declare_id!("7cKq9NnHaPboTM9tfsdKNheXwQa4fQkKEcbUCYbLy6VU");

#[program]
pub mod secure_draw {
    use super::*;

    pub fn init(ctx: Context<Initialize>) -> Result<()> {
        let player_state = &mut ctx.accounts.player_state;
        player_state.latest_result = false;
        player_state.randomness_account = Pubkey::default();
        player_state.bump = ctx.bumps.player_state;
        player_state.allowed_user = ctx.accounts.user.key();

        Ok(())
    }

    pub fn initialize(_ctx: Context<InitializeSecuredraw>) -> Result<()> {
      Ok(())
    }

    pub fn increment(ctx: Context<Update>, nuser: u8) -> Result<()> {
      let recent_hash = hash(&Clock::get().unwrap().unix_timestamp.to_le_bytes());
      let mut rng_seed = recent_hash.as_ref().to_vec();
  
      // Ensure unique selection of winners
      let mut selected_indices = std::collections::HashSet::new();
      let nuser_clone = ctx.accounts.securedraw.nuser.clone();

      if nuser as usize > ctx.accounts.securedraw.nuser.len() {
        return Err(ErrorCode::NotEnoughFundsToPlay.into());
      }

      let mut selected_users = Vec::new();
  
      while selected_indices.len() < nuser as usize {
          let random_number = rng_seed[0] as usize % ctx.accounts.securedraw.nuser.len();
          rng_seed.rotate_left(1);
  
          if selected_indices.insert(random_number) {
              // ctx.accounts.securedraw.count.push(nuser_clone[random_number]);
              selected_users.push(nuser_clone[random_number]);
          }
      }

      ctx.accounts.securedraw.nuser = selected_users;
  
      Ok(())
    }
  
  

    /// Retrieves the revealed random value from the given randomness account
    /// and stores it in the user's state account.
    ///
    /// # Arguments
    ///
    /// * `ctx`: The program context
    /// * `randomness_account`: The public key of the randomness account
    ///   to retrieve the revealed random value from
    ///
    /// # Errors
    ///
    /// * If the randomness account is not resolved, returns
    ///   `ErrorCode::RandomnessNotResolved`
    pub fn generate_randomness(
        ctx: Context<GenerateRandomness>,
        randomness_account: Pubkey,
    ) -> Result<()> {
        let clock = Clock::get()?;
        let player_state = &mut ctx.accounts.player_state;

        let randomness_data =
            RandomnessAccountData::parse(ctx.accounts.randomness_account_data.data.borrow())
                .unwrap();

        if randomness_data.seed_slot != clock.slot - 1 {
            msg!("seed_slot: {}", randomness_data.seed_slot);
            msg!("slot: {}", clock.slot);
            return Err(ErrorCode::RandomnessAlreadyRevealed.into());
        }

        // Store commit
        player_state.randomness_account = randomness_account;

        // Log the result
        msg!("Randomness initiated, randomness requested.");

        // Use the revealed random value as needed
        Ok(())
    }

    pub fn get_randomness(ctx: Context<GenerateRandomness>) -> Result<()> {
      let clock: Clock = Clock::get()?;
      let player_state = &mut ctx.accounts.player_state;
      // call the switchboard on-demand parse function to get the randomness data
      let randomness_data =
          RandomnessAccountData::parse(ctx.accounts.randomness_account_data.data.borrow())
              .unwrap();
      if randomness_data.seed_slot != player_state.commit_slot {
          return Err(ErrorCode::RandomnessExpired.into());
      }
      // call the switchboard on-demand get_value function to get the revealed random value
      let revealed_random_value = randomness_data
          .get_value(&clock)
          .map_err(|_| ErrorCode::RandomnessNotResolved)?;

      // Log the result
      msg!("Randomness: {:?}", revealed_random_value);

      Ok(())
  }

  pub fn close(_ctx: Context<CloseSecuredraw>) -> Result<()> {
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

// === Accounts ===
#[account]
pub struct CallerState {
    allowed_user: Pubkey,
    latest_result: bool,        // Stores the result of the latest flip
    randomness_account: Pubkey, // Reference to the Switchboard randomness account
    bump: u8,
    commit_slot: u64, // The slot at which the randomness was committed
}

#[account]
#[derive(InitSpace)]
pub struct Securedraw {
  pub count: u8,
  #[max_len(50)]
  pub nuser: Vec<Pubkey>,
}

// === Instructions ===
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init,
      payer = user,
      seeds = [b"playerState".as_ref(), user.key().as_ref()],
      space = 8 + 100,
      bump)]
    pub player_state: Account<'info, CallerState>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeSecuredraw<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 3216,
  payer = payer
  )]
  pub securedraw: Account<'info, Securedraw>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GenerateRandomness<'info> {
    #[account(mut,
      seeds = [b"playerState".as_ref(), user.key().as_ref()],
      bump = player_state.bump)]
    pub player_state: Account<'info, CallerState>,
    pub user: Signer<'info>,
    /// CHECK: The account's data is validated manually within the handler.
    pub randomness_account_data: AccountInfo<'info>,
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

// === Errors ===
#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized access attempt.")]
    Unauthorized,
    NotEnoughFundsToPlay,
    RandomnessAlreadyRevealed,
    RandomnessNotResolved,
    RandomnessExpired,
}
