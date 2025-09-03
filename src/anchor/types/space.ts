/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/space.json`.
 */
export type Space = {
  "address": "Ep1m1kNQVn45i2B2ntshHBy3cp2CKpGikmUpogAhmM7J",
  "metadata": {
    "name": "space",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createCampaign",
      "discriminator": [
        111,
        131,
        187,
        98,
        160,
        193,
        114,
        244
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "spaceCampaign",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  112,
                  97,
                  99,
                  101,
                  95,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "arg",
                "path": "title"
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
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "goal",
          "type": "u64"
        },
        {
          "name": "endTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "donate",
      "discriminator": [
        121,
        186,
        218,
        211,
        73,
        70,
        196,
        180
      ],
      "accounts": [
        {
          "name": "donor",
          "writable": true,
          "signer": true
        },
        {
          "name": "spaceCampaign",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  112,
                  97,
                  99,
                  101,
                  95,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "space_campaign.creator",
                "account": "spaceCampaign"
              },
              {
                "kind": "account",
                "path": "space_campaign.title",
                "account": "spaceCampaign"
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
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "spaceCampaign",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  112,
                  97,
                  99,
                  101,
                  95,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "account",
                "path": "space_campaign.title",
                "account": "spaceCampaign"
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
    }
  ],
  "accounts": [
    {
      "name": "spaceCampaign",
      "discriminator": [
        220,
        137,
        118,
        40,
        86,
        210,
        110,
        193
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "titleTooLong",
      "msg": "Title is too long"
    },
    {
      "code": 6001,
      "name": "descriptionTooLong",
      "msg": "Description is too long"
    },
    {
      "code": 6002,
      "name": "invalidGoal",
      "msg": "Goal must be positive and greater than 0"
    },
    {
      "code": 6003,
      "name": "zeroAmount",
      "msg": "Donation amount must be greater than 0"
    },
    {
      "code": 6004,
      "name": "lowBalance",
      "msg": "Insufficient balance for donation"
    },
    {
      "code": 6005,
      "name": "notCreator",
      "msg": "Only the campaign creator can withdraw funds"
    },
    {
      "code": 6006,
      "name": "goalNotReached",
      "msg": "Goal not reached"
    },
    {
      "code": 6007,
      "name": "invalidEndTime",
      "msg": "Invalid end time"
    },
    {
      "code": 6008,
      "name": "campaignEnded",
      "msg": "Campaign has ended"
    },
    {
      "code": 6009,
      "name": "campaignNotEnded",
      "msg": "Campaign has not ended yet"
    }
  ],
  "types": [
    {
      "name": "spaceCampaign",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "goal",
            "type": "u64"
          },
          {
            "name": "raised",
            "type": "u64"
          },
          {
            "name": "endTime",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
