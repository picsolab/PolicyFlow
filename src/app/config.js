const Config = {
    bases: {
        subject: {
            default: "Administrative Organzation"
        },
        policy: {
            // [prod]
            default: 'unselected',
            description: '---'
                // [dev]
                // default: 'adcom',
                // description: 'Advertising Commissions'
        },
        yAttributeList: [
            // the first element will be choosen as the default
            // [prod]
            {
                id: "centrality",
                domId: "y-option-centrality",
                description: "Centrality"
            },
            // [dev]
            {
                id: "perCapitaIncome",
                domId: "y-option-per-capita-income",
                description: "Per Capita Income"
            },
            {
                id: "minorityDiversity",
                domId: "y-option-minority-diversity",
                description: "Minority Diversity"
            },
            {
                id: "legislativeProfessionalism",
                domId: "y-option-citizen-ideology",
                description: "Legislative Professionalism"
            },
            {
                id: "citizenIdeology",
                domId: "y-option-citizen-ideology",
                description: "Citizen Ideology"
            },
            {
                id: "totalPopulation",
                domId: "y-option-total-population",
                description: "Total Population"
            },
            {
                id: "populationDensity",
                domId: "y-option-population-density",
                description: "Population Density"
            }
        ],
        xAttributeList: [{
            // id: "centrality",
            // domId: "x-option-centrality",
            // description: "Centrality"
            id: "perCapitaIncome",
            domId: "x-option-per-capita-income",
            description: "Per Capita Income"
        }]
    },
    models: {
        conditions: {
            defaults: {
                subject: 'Administrative Organzation',
                // [dev]
                // policy: 'adcom',
                // metadata: 'perCapitaIncome',
                // [prod]
                policy: 'unselected',
                metadata: 'centrality',
                sequence: 'centrality'
            }
        }
    },
    api: {
        root: '/api/',
        policyBase: 'policy/',
        networkBase: 'network/',
        arcBase: 'arc/',
        diffusionBase: 'diffusion/'
    },
    pipe: {
        subjectToId: {
            "Administrative Organzation": 1,
            "Civil Rights": 2,
            "Conservation": 3,
            "Corrections": 4,
            "Education": 5,
            "Elections": 6,
            "Health": 7,
            "Highway": 8,
            "Labor": 9,
            "Planning": 10,
            "Professional Regulation": 11,
            "Taxes": 12,
            "Unknown": 13,
            "Welfare": 14
        },
        sortMethodList: ["year", "metadata", "name"],
        sortMethodId: {
            "year": 0,
            "metadata": 1,
            "name": 2
        },
        idToMeta: {
            "ce": "centrality",
            "md": "minorityDiversity",
            "ci": "citizenIdeology",
            "lp": "legislativeProfessionalism",
            "pci": "perCapitaIncome",
            "pd": "populationDensity",
            "pop": "totalPopulation"
        },
        metaToId: {
            "centrality": "ce",
            "minorityDiversity": "md",
            "citizenIdeology": "ci",
            "legislativeProfessionalism": "lp",
            "perCapitaIncome": "pci",
            "populationDensity": "pd",
            "totalPopulation": "pop"
        }
    },
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
    mock: {}
};

module.exports = Config;