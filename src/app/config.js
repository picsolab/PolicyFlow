const Config = {
    bases: {
        subject: {
            default: "Administrative Organzation"
        },
        policy: {
            default: 'adcom'
        }
    },
    models: {
        conditions: {
            defaults: {
                subject: 'Administrative Organzation',
                policy: 'adcom',
                metadata: 'perCapitaIncome'
            }
        }
    },
    api: {
        root: '/api/',
        policyBase: 'policy/',
        networkBase: 'network/'
    },
    pipe: {},
    static: {
        edges: [{
                "source": 36,
                "target": 1
            },
            {
                "source": 4,
                "target": 2
            },
            {
                "source": 36,
                "target": 3
            },
            {
                "source": 22,
                "target": 4
            },
            {
                "source": 46,
                "target": 5
            },
            {
                "source": 33,
                "target": 6
            },
            {
                "source": 6,
                "target": 7
            },
            {
                "source": 4,
                "target": 8
            },
            {
                "source": 4,
                "target": 9
            },
            {
                "source": 6,
                "target": 11
            },
            {
                "source": 30,
                "target": 12
            },
            {
                "source": 4,
                "target": 13
            },
            {
                "source": 13,
                "target": 14
            },
            {
                "source": 4,
                "target": 15
            },
            {
                "source": 36,
                "target": 16
            },
            {
                "source": 5,
                "target": 17
            },
            {
                "source": 6,
                "target": 18
            },
            {
                "source": 4,
                "target": 19
            },
            {
                "source": 4,
                "target": 20
            },
            {
                "source": 33,
                "target": 21
            },
            {
                "source": 33,
                "target": 22
            },
            {
                "source": 4,
                "target": 23
            },
            {
                "source": 8,
                "target": 24
            },
            {
                "source": 4,
                "target": 25
            },
            {
                "source": 4,
                "target": 26
            },
            {
                "source": 4,
                "target": 27
            },
            {
                "source": 4,
                "target": 28
            },
            {
                "source": 6,
                "target": 29
            },
            {
                "source": 6,
                "target": 30
            },
            {
                "source": 4,
                "target": 31
            },
            {
                "source": 4,
                "target": 32
            },
            {
                "source": 6,
                "target": 33
            },
            {
                "source": 4,
                "target": 34
            },
            {
                "source": 36,
                "target": 35
            },
            {
                "source": 4,
                "target": 36
            },
            {
                "source": 33,
                "target": 36
            },
            {
                "source": 33,
                "target": 37
            },
            {
                "source": 30,
                "target": 38
            },
            {
                "source": 17,
                "target": 39
            },
            {
                "source": 46,
                "target": 40
            },
            {
                "source": 13,
                "target": 41
            },
            {
                "source": 44,
                "target": 42
            },
            {
                "source": 46,
                "target": 43
            },
            {
                "source": 13,
                "target": 44
            },
            {
                "source": 26,
                "target": 44
            },
            {
                "source": 6,
                "target": 45
            },
            {
                "source": 4,
                "target": 46
            },
            {
                "source": 18,
                "target": 47
            },
            {
                "source": 5,
                "target": 49
            },
            {
                "source": 5,
                "target": 49
            }
        ]
    },
    mock: {
        bar: [{
                "state_id": "AK",
                "state_name": "Alaska",
                "num": 1
            },
            {
                "state_id": "DE",
                "state_name": "Delaware",
                "num": 3
            },
            {
                "state_id": "MS",
                "state_name": "Mississippi",
                "num": 3
            },
            {
                "state_id": "TX",
                "state_name": "Texas",
                "num": 3
            },
            {
                "state_id": "GA",
                "state_name": "Georgia",
                "num": 4
            },
            {
                "state_id": "NC",
                "state_name": "North Carolina",
                "num": 4
            },
            {
                "state_id": "VT",
                "state_name": "Vermont",
                "num": 4
            },
            {
                "state_id": "AL",
                "state_name": "Alabama",
                "num": 6
            },
            {
                "state_id": "AR",
                "state_name": "Arkansas",
                "num": 6
            },
            {
                "state_id": "HI",
                "state_name": "Hawaii",
                "num": 6
            },
            {
                "state_id": "KY",
                "state_name": "Kentucky",
                "num": 6
            },
            {
                "state_id": "MD",
                "state_name": "Maryland",
                "num": 6
            },
            {
                "state_id": "MO",
                "state_name": "Missouri",
                "num": 6
            },
            {
                "state_id": "MT",
                "state_name": "Montana",
                "num": 6
            },
            {
                "state_id": "NV",
                "state_name": "Nevada",
                "num": 6
            },
            {
                "state_id": "SC",
                "state_name": "South Carolina",
                "num": 6
            },
            {
                "state_id": "SD",
                "state_name": "South Dakota",
                "num": 6
            },
            {
                "state_id": "WY",
                "state_name": "Wyoming",
                "num": 6
            },
            {
                "state_id": "AZ",
                "state_name": "Arizona",
                "num": 7
            },
            {
                "state_id": "TN",
                "state_name": "Tennessee",
                "num": 7
            },
            {
                "state_id": "VA",
                "state_name": "Virginia",
                "num": 7
            },
            {
                "state_id": "IA",
                "state_name": "Iowa",
                "num": 8
            },
            {
                "state_id": "KS",
                "state_name": "Kansas",
                "num": 8
            },
            {
                "state_id": "ME",
                "state_name": "Massachusetts",
                "num": 8
            },
            {
                "state_id": "OK",
                "state_name": "Oklahoma",
                "num": 8
            },
            {
                "state_id": "PA",
                "state_name": "Pennsylvania",
                "num": 8
            },
            {
                "state_id": "ID",
                "state_name": "Idaho",
                "num": 9
            },
            {
                "state_id": "IN",
                "state_name": "Indiana",
                "num": 9
            },
            {
                "state_id": "ND",
                "state_name": "North Dakota",
                "num": 9
            },
            {
                "state_id": "NM",
                "state_name": "New Mexico",
                "num": 9
            },
            {
                "state_id": "WV",
                "state_name": "West Virginia",
                "num": 9
            },
            {
                "state_id": "LA",
                "state_name": "Louisiana",
                "num": 10
            },
            {
                "state_id": "RI",
                "state_name": "Rhode Island",
                "num": 10
            },
            {
                "state_id": "WA",
                "state_name": "Washington",
                "num": 10
            },
            {
                "state_id": "NE",
                "state_name": "Nebraska",
                "num": 11
            },
            {
                "state_id": "NH",
                "state_name": "New Hampshire ",
                "num": 11
            },
            {
                "state_id": "UT",
                "state_name": "Utah",
                "num": 11
            },
            {
                "state_id": "CO",
                "state_name": "Colorado",
                "num": 12
            },
            {
                "state_id": "IL",
                "state_name": "Illinois",
                "num": 12
            },
            {
                "state_id": "OH",
                "state_name": "Ohio",
                "num": 12
            },
            {
                "state_id": "OR",
                "state_name": "Oregon",
                "num": 12
            },
            {
                "state_id": "MI",
                "state_name": "Michigan",
                "num": 13
            },
            {
                "state_id": "MN",
                "state_name": "Minnesota",
                "num": 13
            },
            {
                "state_id": "WI",
                "state_name": "Wisconsin",
                "num": 13
            },
            {
                "state_id": "FL",
                "state_name": "Florida",
                "num": 15
            },
            {
                "state_id": "CT",
                "state_name": "Connecticut",
                "num": 16
            },
            {
                "state_id": "NJ",
                "state_name": "New Jersey",
                "num": 17
            },
            {
                "state_id": "NY",
                "state_name": "New York ",
                "num": 21
            },
            {
                "state_id": "MA",
                "state_name": "Maine",
                "num": 22
            },
            {
                "state_id": "CA",
                "state_name": "California",
                "num": 29
            }
        ]
    }
};

module.exports = Config;