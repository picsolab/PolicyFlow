const Config = {
    bases: {
        subject: {
            default: "All"
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
            defaults: {}
        }
    },
    api: {
        root: '/api/',
        test: '/api/success/',
        policyBase: 'policy/',
        policyGroupBase: 'policies/',
        networkBase: 'network/',
        ringBase: 'cluster/',
        arcBase: 'arc/',
        diffusionBase: 'diffusion/',
        geoBase: 'geo/'
    },
    pipe: {
        subjectToId: { "All": 0, "Macroeconomics": 1, "Civil Rights": 2, "Health": 3, "Agriculture": 4, "Labor": 5, "Education": 6, "Environment": 7, "Energy": 8, "Immigration": 9, "Transportation": 10, "Law and Crime": 12, "Social Welfare": 13, "Housing": 14, "Domestic Commerce": 15, "Defense": 16, "Technology": 17, "Foreign Trade": 18, "International Affairs": 19, "Government Operations": 20, "Public Lands": 21, "Arts and Entertainment": 23, "Government Administration": 24, "Weather": 26, "Fires": 27, "Sports": 29, "Death Notices": 30, "Religion": 31, "Other": 99, "Unknown": 98 },
        sortMethodList: ["year", "metadata", "name"],
        sortMethodId: { "year": 0, "metadata": 1, "name": 2 },
        idToMeta: { "ce": "centrality", "md": "minorityDiversity", "ci": "citizenIdeology", "lp": "legislativeProfessionalism", "pci": "perCapitaIncome", "pd": "populationDensity", "pop": "totalPopulation" },
        metaToId: { "centrality": "ce", "minorityDiversity": "md", "citizenIdeology": "ci", "legislativeProfessionalism": "lp", "perCapitaIncome": "pci", "populationDensity": "pd", "totalPopulation": "pop" },
        regionOf: { "CT": "northeast", "MA": "northeast", "ME": "northeast", "NH": "northeast", "NJ": "northeast", "NY": "northeast", "PA": "northeast", "RI": "northeast", "VT": "northeast", "IA": "midwest", "IL": "midwest", "IN": "midwest", "KS": "midwest", "MI": "midwest", "MN": "midwest", "MO": "midwest", "ND": "midwest", "NE": "midwest", "OH": "midwest", "SD": "midwest", "WI": "midwest", "AL": "south", "AR": "south", "DE": "south", "FL": "south", "GA": "south", "KY": "south", "LA": "south", "MD": "south", "MS": "south", "NC": "south", "OK": "south", "SC": "south", "TN": "south", "TX": "south", "VA": "south", "WV": "south", "AK": "west", "AZ": "west", "CA": "west", "CO": "west", "HI": "west", "ID": "west", "MT": "west", "NM": "west", "NV": "west", "OR": "west", "UT": "west", "WA": "west", "WY": "west" },
        statesToIndices: { "AK": 0, "AL": 1, "AR": 2, "AZ": 3, "CA": 4, "CO": 5, "CT": 6, "DE": 7, "FL": 8, "GA": 9, "HI": 10, "IA": 11, "ID": 12, "IL": 13, "IN": 14, "KS": 15, "KY": 16, "LA": 17, "MA": 18, "MD": 19, "ME": 20, "MI": 21, "MN": 22, "MO": 23, "MS": 24, "MT": 25, "NC": 26, "ND": 27, "NE": 28, "NH": 29, "NJ": 30, "NM": 31, "NV": 32, "NY": 33, "OH": 34, "OK": 35, "OR": 36, "PA": 37, "RI": 38, "SC": 39, "SD": 40, "TN": 41, "TX": 42, "UT": 43, "VA": 44, "VT": 45, "WA": 46, "WI": 47, "WV": 48, "WY": 49 }
    },
    static: {
        centrality: { "centralities": { "WA": { "close": 0.000517598, "betweenness": 28, "pageRank": 0.017280801, "hit": 3, "outdegree": 3 }, "DE": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017976146, "hit": 0, "outdegree": 0 }, "WI": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.03097851, "hit": 0, "outdegree": 0 }, "WV": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.02153404, "hit": 0, "outdegree": 0 }, "HI": { "close": 0, "betweenness": 0, "pageRank": 0, "hit": 0, "outdegree": 0 }, "FL": { "close": 0.000452694, "betweenness": 4, "pageRank": 0.017280801, "hit": 1, "outdegree": 1 }, "WY": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.02153404, "hit": 0, "outdegree": 0 }, "NH": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017976146, "hit": 0, "outdegree": 0 }, "NJ": { "close": 0.000462535, "betweenness": 4, "pageRank": 0.017976146, "hit": 2, "outdegree": 2 }, "NM": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017280801, "hit": 0, "outdegree": 0 }, "TX": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.045689926, "hit": 0, "outdegree": 0 }, "LA": { "close": 0.000452694, "betweenness": 6, "pageRank": 0.02153404, "hit": 1, "outdegree": 1 }, "NC": { "close": 0.000462321, "betweenness": 4, "pageRank": 0.017280801, "hit": 1, "outdegree": 1 }, "ND": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017280801, "hit": 0, "outdegree": 0 }, "NE": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017280801, "hit": 0, "outdegree": 0 }, "TN": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.020595013, "hit": 0, "outdegree": 0 }, "NY": { "close": 0.007246377, "betweenness": 37, "pageRank": 0.017976146, "hit": 5, "outdegree": 5 }, "PA": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.018754731, "hit": 0, "outdegree": 0 }, "AK": { "close": 0, "betweenness": 0, "pageRank": 0, "hit": 0, "outdegree": 0 }, "NV": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017280801, "hit": 0, "outdegree": 0 }, "VA": { "close": 0.000452694, "betweenness": 6, "pageRank": 0.035283694, "hit": 1, "outdegree": 1 }, "CO": { "close": 0.000483325, "betweenness": 20, "pageRank": 0.020595013, "hit": 3, "outdegree": 3 }, "CA": { "close": 0.001375516, "betweenness": 89, "pageRank": 0.031640307, "hit": 17, "outdegree": 17 }, "AL": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.020020345, "hit": 0, "outdegree": 0 }, "AR": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017280801, "hit": 0, "outdegree": 0 }, "VT": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017976146, "hit": 0, "outdegree": 0 }, "IL": { "close": 0.000483325, "betweenness": 12, "pageRank": 0.017280801, "hit": 3, "outdegree": 3 }, "GA": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017280801, "hit": 0, "outdegree": 0 }, "IN": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.020595013, "hit": 0, "outdegree": 0 }, "IA": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017976146, "hit": 0, "outdegree": 0 }, "MA": { "close": 0.000452694, "betweenness": 2, "pageRank": 0.017976146, "hit": 1, "outdegree": 1 }, "AZ": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.020020345, "hit": 0, "outdegree": 0 }, "ID": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.023338648, "hit": 0, "outdegree": 0 }, "CT": { "close": 0.006024096, "betweenness": 9, "pageRank": 0.018754731, "hit": 7, "outdegree": 7 }, "ME": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017280801, "hit": 0, "outdegree": 0 }, "MD": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017280801, "hit": 0, "outdegree": 0 }, "OK": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.020020345, "hit": 0, "outdegree": 0 }, "OH": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017280801, "hit": 0, "outdegree": 0 }, "UT": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.020595013, "hit": 0, "outdegree": 0 }, "MO": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017280801, "hit": 0, "outdegree": 0 }, "MN": { "close": 0.001402525, "betweenness": 58, "pageRank": 0.018754731, "hit": 1, "outdegree": 1 }, "MI": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.018754731, "hit": 0, "outdegree": 0 }, "RI": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.023338648, "hit": 0, "outdegree": 0 }, "KS": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017280801, "hit": 0, "outdegree": 0 }, "MT": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.017280801, "hit": 0, "outdegree": 0 }, "MS": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.030387467, "hit": 0, "outdegree": 0 }, "SC": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.03400272, "hit": 0, "outdegree": 0 }, "KY": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.020020345, "hit": 0, "outdegree": 0 }, "OR": { "close": 0.000483559, "betweenness": 16, "pageRank": 0.020336746, "hit": 4, "outdegree": 4 }, "SD": { "close": 0.000443262, "betweenness": 0, "pageRank": 0.020595013, "hit": 0, "outdegree": 0 } }, "stat": { "max": { "close": 0.007246377, "betweenness": 89, "pageRank": 0.045689926, "hit": 17, "outdegree": 17 }, "min": { "close": 0, "betweenness": 0, "pageRank": 0, "hit": 0, "outdegree": 0 } } },
        regions: {
            "northeast": ["CT", "MA", "ME", "NH", "NJ", "NY", "PA", "RI", "VT"],
            "midwest": ["IA", "IL", "IN", "KS", "MI", "MN", "MO", "ND", "NE", "OH", "SD", "WI"],
            "south": ["AL", "AR", "DE", "FL", "GA", "KY", "LA", "MD", "MS", "NC", "OK", "SC", "TN", "TX", "VA", "WV"],
            "west": ["AK", "AZ", "CA", "CO", "HI", "ID", "MT", "NM", "NV", "OR", "UT", "WA", "WY"]
        },
        states: ["AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY"]
    },
    mock: {}
};

module.exports = Config;