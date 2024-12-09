/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/ingame.json`.
 */
export type Ingame = {
  "address": "6z8u9qmG1MHT7tngrqRsqKG3z59gsRsp2oa2q1VNBS2f",
  "metadata": {
    "name": "ingame",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "joinGame",
      "discriminator": [
        107,
        112,
        18,
        38,
        56,
        173,
        60,
        128
      ],
      "accounts": [
        {
          "name": "joiner",
          "writable": true,
          "signer": true
        },
        {
          "name": "game",
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "starter"
              }
            ]
          }
        },
        {
          "name": "gameCounter",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "gameId"
              },
              {
                "kind": "arg",
                "path": "club"
              },
              {
                "kind": "account",
                "path": "joiner"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "u8"
        },
        {
          "name": "club",
          "type": "string"
        },
        {
          "name": "avgPos",
          "type": {
            "array": [
              {
                "array": [
                  "u8",
                  2
                ]
              },
              1
            ]
          }
        },
        {
          "name": "stakedAmount",
          "type": "u8"
        },
        {
          "name": "starter",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "startGame",
      "discriminator": [
        249,
        47,
        252,
        172,
        184,
        162,
        245,
        14
      ],
      "accounts": [
        {
          "name": "starter",
          "writable": true,
          "signer": true
        },
        {
          "name": "game",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "gameId"
              },
              {
                "kind": "arg",
                "path": "club"
              },
              {
                "kind": "account",
                "path": "starter"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "u8"
        },
        {
          "name": "club",
          "type": "string"
        },
        {
          "name": "startTime",
          "type": "u64"
        },
        {
          "name": "avgPos",
          "type": {
            "array": [
              {
                "array": [
                  "u8",
                  2
                ]
              },
              1
            ]
          }
        },
        {
          "name": "stakedAmount",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "game",
      "discriminator": [
        27,
        90,
        166,
        125,
        74,
        100,
        121,
        18
      ]
    }
  ],
  "types": [
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "gameId",
            "type": "u8"
          },
          {
            "name": "club",
            "type": "string"
          },
          {
            "name": "startTime",
            "type": "u64"
          },
          {
            "name": "winTime",
            "type": "u64"
          },
          {
            "name": "avgPos",
            "type": {
              "array": [
                {
                  "array": [
                    "u8",
                    2
                  ]
                },
                1
              ]
            }
          },
          {
            "name": "stakedAmount",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
