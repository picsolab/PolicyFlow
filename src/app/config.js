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
                id: "centrality",
                domId: "x-option-centrality",
                description: "Centrality"
                    // id: "perCapitaIncome",
                    // domId: "x-option-per-capita-income",
                    // description: "Per Capita Income"
            },
            {
                id: "adoptionYear",
                domId: "x-option-adoption-year",
                description: "Adoption Year"
            }
        ],
        centralityList: [{
                id: "outdegree",
                domId: "centrality-option-outdegree",
                description: "Outdegree"
            },
            {
                id: "pageRank",
                domId: "centrality-option-page-rank",
                description: "Page Rank"
            },
            {
                id: "betweenness",
                domId: "centrality-option-betweenness",
                description: "Betweenness"
            },
            {
                id: "hit",
                domId: "centrality-option-hit",
                description: "Hit"
            },
            {
                id: "close",
                domId: "centrality-option-close",
                description: "Closeness"
            }
        ]
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
                sequence: 'centrality',
                centrality: 'outdegree',
                cvalidity: true
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
        centrality: { "centralities": { "WA": { "close": 0.000517598, "betweenness": 28, "pageRank": 0.017280801, "hit": 3, "outdegree": 3 }, "DE": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017976146, "hit": 0, "outdegree": 0 }, "WI": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.03097851, "hit": 0, "outdegree": 0 }, "WV": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.02153404, "hit": 0, "outdegree": 0 }, "HI": { "close": 0, "betweenness": 0, "pageRank": 0, "hit": 0, "outdegree": 0 }, "FL": { "close": 0.000452694, "betweenness": 4, "pageRank": 0.017280801, "hit": 1, "outdegree": 1 }, "WY": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.02153404, "hit": 0, "outdegree": 0 }, "NH": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017976146, "hit": 0, "outdegree": 0 }, "NJ": { "close": 0.000462535, "betweenness": 4, "pageRank": 0.017976146, "hit": 2, "outdegree": 2 }, "NM": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017280801, "hit": 0, "outdegree": 0 }, "TX": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.045689926, "hit": 0, "outdegree": 0 }, "LA": { "close": 0.000452694, "betweenness": 6, "pageRank": 0.02153404, "hit": 1, "outdegree": 1 }, "NC": { "close": 0.000462321, "betweenness": 4, "pageRank": 0.017280801, "hit": 1, "outdegree": 1 }, "ND": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017280801, "hit": 0, "outdegree": 0 }, "NE": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017280801, "hit": 0, "outdegree": 0 }, "TN": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.020595013, "hit": 0, "outdegree": 0 }, "NY": { "close": 0.007246377, "betweenness": 37, "pageRank": 0.017976146, "hit": 5, "outdegree": 5 }, "PA": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.018754731, "hit": 0, "outdegree": 0 }, "AK": { "close": 0, "betweenness": 0, "pageRank": 0, "hit": 0, "outdegree": 0 }, "NV": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017280801, "hit": 0, "outdegree": 0 }, "VA": { "close": 0.000452694, "betweenness": 6, "pageRank": 0.035283694, "hit": 1, "outdegree": 1 }, "CO": { "close": 0.000483325, "betweenness": 20, "pageRank": 0.020595013, "hit": 3, "outdegree": 3 }, "CA": { "close": 0.001375516, "betweenness": 89, "pageRank": 0.031640307, "hit": 17, "outdegree": 17 }, "AL": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.020020345, "hit": 0, "outdegree": 0 }, "AR": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017280801, "hit": 0, "outdegree": 0 }, "VT": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017976146, "hit": 0, "outdegree": 0 }, "IL": { "close": 0.000483325, "betweenness": 12, "pageRank": 0.017280801, "hit": 3, "outdegree": 3 }, "GA": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017280801, "hit": 0, "outdegree": 0 }, "IN": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.020595013, "hit": 0, "outdegree": 0 }, "IA": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017976146, "hit": 0, "outdegree": 0 }, "MA": { "close": 0.000452694, "betweenness": 2, "pageRank": 0.017976146, "hit": 1, "outdegree": 1 }, "AZ": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.020020345, "hit": 0, "outdegree": 0 }, "ID": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.023338648, "hit": 0, "outdegree": 0 }, "CT": { "close": 0.006024096, "betweenness": 9, "pageRank": 0.018754731, "hit": 7, "outdegree": 7 }, "ME": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017280801, "hit": 0, "outdegree": 0 }, "MD": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017280801, "hit": 0, "outdegree": 0 }, "OK": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.020020345, "hit": 0, "outdegree": 0 }, "OH": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017280801, "hit": 0, "outdegree": 0 }, "UT": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.020595013, "hit": 0, "outdegree": 0 }, "MO": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017280801, "hit": 0, "outdegree": 0 }, "MN": { "close": 0.001402525, "betweenness": 58, "pageRank": 0.018754731, "hit": 1, "outdegree": 1 }, "MI": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.018754731, "hit": 0, "outdegree": 0 }, "RI": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.023338648, "hit": 0, "outdegree": 0 }, "KS": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017280801, "hit": 0, "outdegree": 0 }, "MT": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017280801, "hit": 0, "outdegree": 0 }, "MS": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.030387467, "hit": 0, "outdegree": 0 }, "SC": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.03400272, "hit": 0, "outdegree": 0 }, "KY": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.020020345, "hit": 0, "outdegree": 0 }, "OR": { "close": 0.000483559, "betweenness": 16, "pageRank": 0.020336746, "hit": 4, "outdegree": 4 }, "SD": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.020595013, "hit": 0, "outdegree": 0 } }, "stat": { "max": { "close": 0.007246377, "betweenness": 89, "pageRank": 0.045689926, "hit": 17, "outdegree": 17 }, "min": { "close": 0, "betweenness": 0, "pageRank": 0, "hit": 0, "outdegree": 0 } } },
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