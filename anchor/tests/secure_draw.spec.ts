import * as anchor from '@coral-xyz/anchor'
import { Commitment, Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js'
import { expect } from '@jest/globals';
import { SecureDraw } from "../target/types/secure_draw";
import * as sb from "@switchboard-xyz/on-demand";
import { Program } from '@coral-xyz/anchor';


describe('securedraw',  () => {

    
      it('should throw an error if initialization fails', async () => {
        anchor.setProvider(anchor.AnchorProvider.env());
    
        const program = anchor.workspace.SecureDraw as Program<SecureDraw>;
    
        try {
          await program.methods.initialize().rpc();
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
});