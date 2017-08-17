const Config = {
    bases: {
        subject: {
            default: "All",
            id: 0
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
        subjectIdToName: { "0": "All", "1": "Macroeconomics", "2": "Civil Rights", "3": "Health", "4": "Agriculture", "5": "Labor", "6": "Education", "7": "Environment", "8": "Energy", "9": "Immigration", "10": "Transportation", "12": "Law and Crime", "13": "Social Welfare", "14": "Housing", "15": "Domestic Commerce", "16": "Defense", "17": "Technology", "18": "Foreign Trade", "19": "International Affairs", "20": "Government Operations", "21": "Public Lands", "23": "Arts and Entertainment", "24": "Government Administration", "26": "Weather", "27": "Fires", "29": "Sports", "30": "Death Notices", "31": "Religion", "99": "Other", "98": "Unknown" },
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
        states: ["AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY"],
        ldaTerms: {
            "0-0": "renew,fair,fire,energi,orient,river,liabil,compens,real,colorado",
            "0-1": "seat,belt,helmet,notif,abort,energi,gun,disabl,electron,fair",
            "0-2": "abort,marriag,notif,vote,minimum,wage,helmet,prison,debt,registri",
            "0-3": "registr,vote,tuition,nonprofit,immigr,emerg,dna,beneficiari,card,keg",
            "0-4": "abort,smoke,hate,wast,id,energi,firearm,check,low,background",
            "0-5": "abort,probat,wage,princip,roe,pre,languag,real,campaign,birth",
            "0-0-0": "abort,fetal,nonprofit,drug,week,prescript,taxpay,heartbeat,hyde,corpor",
            "0-0-1": "abort,dna,victim,trap,collect,workplac,emiss,indoor,conserv,intern",
            "0-0-2": "abort,contracept,consent,notif,sex,vote,debt,shackl,risk,corpor",
            "0-0-3": "incom,drug,account,save,ida,casino,teacher,gambl,food,atlant",
            "0-0-4": "abort,uniform,birth,partial,consent,estat,lotteri,id,resid,dilat",
            "0-0-5": "visit,abort,prison,custodi,hmo,mainten,inmat,grandpar,sentenc,anti",
            "0-0-6": "lotteri,vote,conserv,emerg,soil,adult,nonprofit,contracept,estat,era",
            "0-0-7": "abort,vote,elector,money,launder,colleg,english,pro,tuition,era",
            "0-0-8": "prison,minimum,drug,wage,univers,art,dui,estat,bridg,jail",
            "0-0-9": "owner,beneficiari,abort,transfer,unfair,haze,sentenc,pre,sex,trade",
            "0-1-0": "trust,estat,asset,truste,payment,alloc,administ,credit,deposit,judgment",
            "0-1-1": "teacher,entiti,unincorpor,certif,cpa,privat,tobacco,advertis,trade,harmon",
            "0-1-2": "disabl,gun,harass,ban,punish,child,bulli,firearm,strateg,mother",
            "0-1-3": "death,stalk,determin,pain,treatment,refus,war,credit,penalti,guidanc",
            "0-1-4": "renew,coverag,speci,mortgag,endang,common,trade,loan,autism,holder",
            "0-1-5": "common,deposit,steril,refund,disabl,crime,bottl,grandpar,aid,perman",
            "0-1-6": "physic,judgment,scholar,asset,estat,credit,degre,emin,commit,death",
            "0-1-7": "fire,highway,renew,labor,film,pharmacist,forest,credit,refus,fight",
            "0-1-8": "perform,gun,experi,agricultur,firearm,higher,wait,bargain,crimin,handgun",
            "0-1-9": "cancer,union,disabl,join,retard,bu,colorect,transit,trade,death",
            "0-2-0": "traffick,roe,hous,highway,reform,regist,wade,offend,student,qualiti",
            "0-2-1": "patient,marriag,alcohol,confidenti,constitut,across,beverag,doctor,pacif,grant",
            "0-2-2": "electron,signatur,substanc,drug,insur,abus,distribut,financ,contribut,possess",
            "0-2-3": "insur,compact,river,strateg,nepa,environment,insan,sale,age,fish",
            "0-2-4": "river,live,anim,cruelti,admit,privileg,basin,subsidi,connecticut,qualiti",
            "0-2-5": "sale,bulk,chapter,ucc,tax,colleg,miscegen,cooper,virginia,roe",
            "0-2-6": "compact,dairi,abus,insan,fiduciari,pharmaci,extend,die,carri,power",
            "0-2-7": "anim,stalk,probat,offend,cruelti,drug,internet,needl,exchang,massachusett",
            "0-2-8": "offend,anim,discrimin,registri,hmo,faith,marijuana,power,good,regist",
            "0-2-9": "tax,estat,cooper,colleg,region,period,oper,bank,busi,co",
            "0-3-0": "seat,belt,primari,notif,front,minor,offend,fair,secondari,mandat",
            "0-3-1": "seat,smoke,belt,lake,bar,great,coordin,compact,nurs,licensur",
            "0-3-2": "hate,colorado,basin,old,upper,save,compact,river,charter,florida",
            "0-3-3": "zone,perform,wit,intimid,sourc,harass,reveal,bulli,credit,prosecut",
            "0-3-4": "hate,trust,sale,fire,declar,sunday,estat,forest,explicitli,repeal",
            "0-3-5": "offend,notif,speed,breast,rail,registri,agent,financi,air,revis",
            "0-3-6": "seat,commerci,keg,belt,casino,invest,credit,wait,account,perform",
            "0-3-7": "victim,hate,bac,drink,offend,notif,sodomi,gay,toler,repeal",
            "0-3-8": "athlet,estat,minimum,licens,wage,voter,deced,keg,agent,labor",
            "0-3-9": "credit,referendum,emerg,cap,offend,certifi,smoke,architectur,ballot,corpor",
            "0-4-0": "air,water,pre,pollut,liabil,host,drink,clean,underag,hipaa",
            "0-4-1": "helmet,motorcycl,divorc,wear,disput,equal,collabor,qualifi,rider,colleg",
            "0-4-2": "wast,sexual,card,child,electron,recycl,orient,labor,pornographi,low",
            "0-4-3": "drug,sexual,gender,ident,statutori,campaign,basi,languag,workplac,medicaid",
            "0-4-4": "wast,radioact,low,helmet,liabil,bicycl,llc,death,rent,penalti",
            "0-4-5": "theft,electron,ident,helmet,placement,colleg,juvenil,clerk,game,document",
            "0-4-6": "compact,radioact,child,low,wast,liabil,rent,probat,cannabi,improv",
            "0-4-7": "id,voter,apolog,higher,assault,vote,gift,wait,basi,photo",
            "0-4-8": "wast,electr,radioact,water,engin,labor,aid,home,low,lien",
            "0-4-9": "electron,labor,donat,child,disput,campaign,divorc,merit,asset,committe",
            "0-5-0": "check,background,sale,renew,firearm,portfolio,handgun,rp,wait,seller",
            "0-5-1": "mediat,confidenti,privileg,particip,disposit,children,dna,sentenc,charg,speedi",
            "0-5-2": "oil,ga,discrimin,check,background,renew,firearm,effici,conserv,commiss",
            "0-5-3": "tuition,offer,sale,share,interst,discrimin,gender,termin,guardian,resid",
            "0-5-4": "nurs,share,suicid,credit,effici,organ,action,conduct,background,exchang",
            "0-5-5": "deposit,condominium,termin,interest,creation,build,provis,instrument,audio,depend",
            "0-5-6": "tuition,prepaid,guard,counterdrug,emerg,activ,colleg,contracept,expand,vote",
            "0-5-7": "credit,solar,renew,wind,minimum,wage,race,prevail,residenti,modern",
            "0-5-8": "prescript,comprehens,model,blind,codifi,compani,dealer,singl,termin,wage",
            "0-5-9": "renew,portfolio,comput,credit,solar,park,defam,toward,invest,correct"
        }
    },
    mock: {}
};

module.exports = Config;