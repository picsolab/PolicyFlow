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
        centrality: { "centralities": { "WA": { "betweenness": 6.03, "pageRank": 12.11, "hit": 18.15, "outdegree": 4.12 }, "DE": { "betweenness": 15.24, "pageRank": 9.66, "hit": 4.43, "outdegree": 15.0 }, "WI": { "betweenness": 7.48, "pageRank": 12.67, "hit": 11.64, "outdegree": 0.14 }, "WV": { "betweenness": 7.84, "pageRank": 10.47, "hit": 5.45, "outdegree": 18.73 }, "HI": { "betweenness": 9.58, "pageRank": 7.75, "hit": 4.26, "outdegree": 12.74 }, "FL": { "betweenness": 19.98, "pageRank": 17.73, "hit": 1.86, "outdegree": 1.48 }, "WY": { "betweenness": 0.96, "pageRank": 19.55, "hit": 1.62, "outdegree": 0.61 }, "NH": { "betweenness": 16.66, "pageRank": 8.57, "hit": 6.09, "outdegree": 6.84 }, "NJ": { "betweenness": 8.54, "pageRank": 0.12, "hit": 8.25, "outdegree": 0.18 }, "NM": { "betweenness": 6.86, "pageRank": 13.69, "hit": 10.48, "outdegree": 4.46 }, "TX": { "betweenness": 17.76, "pageRank": 12.04, "hit": 19.29, "outdegree": 17.9 }, "LA": { "betweenness": 15.63, "pageRank": 3.43, "hit": 2.43, "outdegree": 2.59 }, "NC": { "betweenness": 6.59, "pageRank": 3.32, "hit": 13.2, "outdegree": 10.52 }, "ND": { "betweenness": 6.55, "pageRank": 11.34, "hit": 10.52, "outdegree": 13.38 }, "NE": { "betweenness": 10.57, "pageRank": 6.39, "hit": 8.31, "outdegree": 11.37 }, "TN": { "betweenness": 16.27, "pageRank": 14.74, "hit": 9.97, "outdegree": 7.53 }, "NY": { "betweenness": 4.85, "pageRank": 11.0, "hit": 13.47, "outdegree": 3.41 }, "PA": { "betweenness": 7.03, "pageRank": 1.98, "hit": 14.29, "outdegree": 8.08 }, "AK": { "betweenness": 1.28, "pageRank": 5.15, "hit": 3.2, "outdegree": 13.31 }, "NV": { "betweenness": 4.62, "pageRank": 10.12, "hit": 11.76, "outdegree": 12.02 }, "VA": { "betweenness": 7.63, "pageRank": 3.69, "hit": 15.17, "outdegree": 2.42 }, "CO": { "betweenness": 3.72, "pageRank": 3.71, "hit": 0.88, "outdegree": 16.27 }, "CA": { "betweenness": 4.87, "pageRank": 2.32, "hit": 2.93, "outdegree": 6.54 }, "AL": { "betweenness": 4.13, "pageRank": 2.14, "hit": 14.16, "outdegree": 15.07 }, "AR": { "betweenness": 1.32, "pageRank": 17.63, "hit": 3.68, "outdegree": 12.16 }, "VT": { "betweenness": 3.51, "pageRank": 3.36, "hit": 1.17, "outdegree": 12.87 }, "IL": { "betweenness": 4.99, "pageRank": 11.37, "hit": 11.73, "outdegree": 5.71 }, "GA": { "betweenness": 9.65, "pageRank": 11.73, "hit": 11.01, "outdegree": 5.46 }, "IN": { "betweenness": 13.61, "pageRank": 13.56, "hit": 15.94, "outdegree": 0.33 }, "IA": { "betweenness": 19.12, "pageRank": 0.23, "hit": 12.19, "outdegree": 13.15 }, "MA": { "betweenness": 12.21, "pageRank": 1.31, "hit": 6.26, "outdegree": 1.74 }, "AZ": { "betweenness": 6.39, "pageRank": 16.01, "hit": 17.57, "outdegree": 2.38 }, "ID": { "betweenness": 12.08, "pageRank": 19.93, "hit": 9.99, "outdegree": 16.43 }, "CT": { "betweenness": 15.05, "pageRank": 6.2, "hit": 12.81, "outdegree": 17.46 }, "ME": { "betweenness": 4.4, "pageRank": 19.49, "hit": 13.3, "outdegree": 7.73 }, "MD": { "betweenness": 10.51, "pageRank": 13.82, "hit": 1.83, "outdegree": 15.61 }, "OK": { "betweenness": 14.66, "pageRank": 5.13, "hit": 15.91, "outdegree": 5.91 }, "OH": { "betweenness": 8.05, "pageRank": 11.82, "hit": 12.92, "outdegree": 14.72 }, "UT": { "betweenness": 16.06, "pageRank": 16.34, "hit": 1.67, "outdegree": 17.05 }, "MO": { "betweenness": 14.09, "pageRank": 17.1, "hit": 5.74, "outdegree": 1.24 }, "MN": { "betweenness": 11.25, "pageRank": 0.9, "hit": 19.77, "outdegree": 0.16 }, "MI": { "betweenness": 7.39, "pageRank": 11.94, "hit": 1.92, "outdegree": 16.94 }, "RI": { "betweenness": 2.05, "pageRank": 15.65, "hit": 6.2, "outdegree": 14.74 }, "KS": { "betweenness": 5.29, "pageRank": 6.77, "hit": 15.34, "outdegree": 16.87 }, "MT": { "betweenness": 3.0, "pageRank": 17.18, "hit": 11.96, "outdegree": 16.01 }, "MS": { "betweenness": 8.39, "pageRank": 14.1, "hit": 0.52, "outdegree": 1.79 }, "SC": { "betweenness": 10.1, "pageRank": 6.08, "hit": 4.72, "outdegree": 0.51 }, "KY": { "betweenness": 7.19, "pageRank": 6.69, "hit": 5.01, "outdegree": 4.85 }, "OR": { "betweenness": 19.42, "pageRank": 2.76, "hit": 14.88, "outdegree": 13.74 }, "SD": { "betweenness": 1.75, "pageRank": 14.64, "hit": 19.95, "outdegree": 17.0 } }, "stat": { "max": { "betweenness": 19.98, "pageRank": 19.93, "hit": 19.95, "outdegree": 18.73 }, "min": { "betweenness": 0.96, "pageRank": 0.12, "hit": 0.52, "outdegree": 0.14 } } },
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