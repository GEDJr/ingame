/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/ingame.json`.
 */
export type Ingame = {
  "address": "2Vs5S2EyrhhMTqY5NEGzuN4rWXfdoRhJ72oThS2SvfCz",
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
          "name": "startedGame",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "club_in_match.club"
              },
              {
                "kind": "arg",
                "path": "starter"
              }
            ]
          }
        },
        {
          "name": "joinedGame",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "club_in_match.club"
              },
              {
                "kind": "arg",
                "path": "starter"
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
          "name": "clubInMatch",
          "type": {
            "defined": {
              "name": "clubInMatch"
            }
          }
        },
        {
          "name": "joinTime",
          "type": "u64"
        },
        {
          "name": "athAvgPos",
          "type": {
            "vec": {
              "defined": {
                "name": "athlete"
              }
            }
          }
        },
        {
          "name": "starter",
          "type": "pubkey"
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
                "path": "club_in_match.club"
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
          "name": "clubInMatch",
          "type": {
            "defined": {
              "name": "clubInMatch"
            }
          }
        },
        {
          "name": "startTime",
          "type": "u64"
        },
        {
          "name": "athAvgPos",
          "type": {
            "vec": {
              "defined": {
                "name": "athlete"
              }
            }
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
      "name": "athlete",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "number",
            "type": "u8"
          },
          {
            "name": "avgPos",
            "type": {
              "array": [
                "u16",
                2
              ]
            }
          }
        ]
      }
    },
    {
      "name": "clubInMatch",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "club",
            "type": "string"
          },
          {
            "name": "match",
            "type": "string"
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
            "name": "clubInMatch",
            "type": {
              "defined": {
                "name": "clubInMatch"
              }
            }
          },
          {
            "name": "startTime",
            "type": "u64"
          },
          {
            "name": "winTime",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "athAvgPos",
            "type": {
              "vec": {
                "defined": {
                  "name": "athlete"
                }
              }
            }
          },
          {
            "name": "stakedAmount",
            "type": {
              "option": "u8"
            }
          },
          {
            "name": "totalStaked",
            "type": {
              "option": "u8"
            }
          },
          {
            "name": "gamers",
            "type": {
              "option": "u8"
            }
          },
          {
            "name": "starter",
            "type": "pubkey"
          },
          {
            "name": "joiner",
            "type": {
              "option": "pubkey"
            }
          }
        ]
      }
    }
  ]
};
