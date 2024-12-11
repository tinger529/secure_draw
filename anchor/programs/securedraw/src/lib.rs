#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use switchboard_on_demand::accounts::RandomnessAccountData;

declare_id!("9QchLny69HfnhPGUKYLektXietC4rohx4H3y239iQCB5");

#[program]
pub mod secure_draw {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let player_state = &mut ctx.accounts.player_state;
        player_state.latest_result = false;
        player_state.randomness_account = Pubkey::default();
        player_state.bump = ctx.bumps.player_state;
        player_state.allowed_user = ctx.accounts.user.key();

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
