/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/secure_draw.json`.
 */
export type SecureDraw = {
  "address": "9QchLny69HfnhPGUKYLektXietC4rohx4H3y239iQCB5",
  "metadata": {
    "name": "secureDraw",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "generateRandomness",
      "docs": [
        "Retrieves the revealed random value from the given randomness account",
        "and stores it in the user's state account.",
        "",
        "# Arguments",
        "",
        "* `ctx`: The program context",
        "* `randomness_account`: The public key of the randomness account",
        "to retrieve the revealed random value from",
        "",
        "# Errors",
        "",
        "* If the randomness account is not resolved, returns",
        "`ErrorCode::RandomnessNotResolved`"
      ],
      "discriminator": [
        184,
        236,
        174,
        26,
        122,
        173,
        183,
        73
      ],
      "accounts": [
        {
          "name": "playerState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114,
                  83,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "signer": true
        },
        {
          "name": "randomnessAccountData"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "randomnessAccount",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "getRandomness",
      "discriminator": [
        73,
        239,
        90,
        93,
        139,
        63,
        19,
        7
      ],
      "accounts": [
        {
          "name": "playerState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114,
                  83,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "signer": true
        },
        {
          "name": "randomnessAccountData"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "playerState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114,
                  83,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "callerState",
      "discriminator": [
        96,
        194,
        179,
        127,
        5,
        58,
        82,
        60
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "Unauthorized access attempt."
    },
    {
      "code": 6001,
      "name": "notEnoughFundsToPlay"
    },
    {
      "code": 6002,
      "name": "randomnessAlreadyRevealed"
    },
    {
      "code": 6003,
      "name": "randomnessNotResolved"
    },
    {
      "code": 6004,
      "name": "randomnessExpired"
    }
  ],
  "types": [
    {
      "name": "callerState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "allowedUser",
            "type": "pubkey"
          },
          {
            "name": "latestResult",
            "type": "bool"
          },
          {
            "name": "randomnessAccount",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "commitSlot",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
