/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/ingame.json`.
 */
export type Ingame = {
  "address": "pYGbCyybENYsKbi4TivtrSBCggmjwSh2p2Qso8yatdx",
  "metadata": {
    "name": "ingame",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "deployGame",
      "discriminator": [
        105,
        217,
        28,
        20,
        150,
        155,
        121,
        119
      ],
      "accounts": [
        {
          "name": "deployer",
          "writable": true,
          "signer": true
        },
        {
          "name": "game",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "deployer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
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
          "name": "game",
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "deployer"
              }
            ]
          }
        },
        {
          "name": "joiner",
          "writable": true,
          "signer": true
        },
        {
          "name": "startedGame",
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
          "name": "joiner",
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
          "name": "game",
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "deployer"
              }
            ]
          }
        },
        {
          "name": "starter",
          "writable": true,
          "signer": true
        },
        {
          "name": "startedGame",
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
        },
        {
          "name": "starter",
          "type": "pubkey"
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
    },
    {
      "name": "startedGame",
      "discriminator": [
        253,
        214,
        99,
        111,
        52,
        253,
        83,
        149
      ]
    }
  ],
  "types": [
    {
      "name": "club",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "club",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "clubMatches",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "clubMatches",
            "type": {
              "vec": {
                "array": [
                  {
                    "defined": {
                      "name": "club"
                    }
                  },
                  2
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "gameId",
            "type": "u32"
          },
          {
            "name": "gamers",
            "type": {
              "defined": {
                "name": "gamers"
              }
            }
          },
          {
            "name": "clubMatches",
            "type": {
              "defined": {
                "name": "clubMatches"
              }
            }
          }
        ]
      }
    },
    {
      "name": "gamers",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "gamers",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "startedGame",
      "type": {
        "kind": "struct",
        "fields": [
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
