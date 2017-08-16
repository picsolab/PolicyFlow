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
            "0-0": "abort,gun,roe,energi,firearm,disput,fetal,pre,electron,background",
            "0-1": "seat,trust,belt,wast,estat,low,radioact,helmet,wage,primari",
            "0-2": "hate,racial,firearm,fair,trade,harass,renew,prison,registr,minimum",
            "0-3": "trust,seat,belt,lotteri,conserv,estat,energi,dna,appoint,renew",
            "0-4": "abort,vote,id,drink,welfar,real,campaign,bac,rape,entiti",
            "0-5": "notif,registr,smoke,divorc,registri,water,river,check,trade,helmet",
            "0-0-0": "discrimin,build,sexual,gender,environment,child,traffick,ident,coverag,wast",
            "0-0-1": "labor,equal,worker,minimum,wage,compens,child,women,incom,promulg",
            "0-0-2": "driver,colleg,florida,disposit,graduat,trial,corpor,organ,hipaa,marijuana",
            "0-0-3": "debt,crime,sexual,hate,discrimin,wast,assault,taxpay,inspect,wait",
            "0-0-4": "urban,r,abort,traffick,fetal,id,credit,photo,renew,cigarett",
            "0-0-5": "launder,money,crime,compens,payment,comput,wast,urban,fiduciari,fair",
            "0-0-6": "discrimin,sexual,basi,gender,infertil,evid,prison,ident,trust,charg",
            "0-0-7": "drug,prescript,child,militari,languag,monitor,altern,custodi,facil,mental",
            "0-0-8": "primari,visit,indian,cap,trust,air,union,grandpar,drive,wast",
            "0-0-9": "fire,dam,juvenil,south,fight,trust,organ,child,affair,wast",
            "0-1-0": "divorc,roe,week,contracept,wait,viabil,payment,fault,strateg,rfra",
            "0-1-1": "properti,guard,child,conserv,casey,financ,owner,soil,counterdrug,counsel",
            "0-1-2": "deposit,equal,marriag,contain,era,medicaid,sex,bottl,immigr,beverag",
            "0-1-3": "hate,bulk,steril,missouri,ucc,exist,motiv,eugen,voter,pre",
            "0-1-4": "art,clinic,trap,council,hate,refus,target,discrimin,pharmacist,prescript",
            "0-1-5": "mediat,confidenti,unfair,river,particip,privileg,child,decept,trade,restor",
            "0-1-6": "birth,partial,pregnanc,busi,share,exchang,cancer,week,compact,illeg",
            "0-1-7": "child,sex,age,trust,discrimin,remedi,old,militari,princip,vehicl",
            "0-1-8": "divorc,minor,haze,fault,marriag,notif,victim,divinorum,salvia,compens",
            "0-1-9": "physician,suicid,minor,adult,child,notif,invest,transport,roe,spend",
            "0-2-0": "sex,lake,anti,roe,codifi,dairi,speci,miscegen,charter,virginia",
            "0-2-1": "disabl,emerg,smoke,shackl,creation,wast,vehicl,tobacco,corpor,contracept",
            "0-2-2": "trust,contracept,emerg,higher,method,voucher,student,perform,retir,aug",
            "0-2-3": "smoke,casino,workplac,union,age,tobacco,gambl,join,properti,game",
            "0-2-4": "wast,radioact,low,probat,smoke,dispos,disabl,period,perform,declar",
            "0-2-5": "perform,mental,higher,test,collabor,abort,disput,treati,resolut,mutual",
            "0-2-6": "card,trust,alcohol,attend,compulsori,incom,medicaid,atlant,credit,teacher",
            "0-2-7": "basin,river,hous,upper,colorado,race,beneficiari,water,lake,revis",
            "0-2-8": "water,pre,k,age,hous,owner,univers,pacif,trust,consent",
            "0-2-9": "disabl,physician,apolog,harass,ii,patient,prescript,intimid,anti,massachusett",
            "0-3-0": "dna,manag,victim,sampl,land,saturday,strateg,ban,higher,felon",
            "0-3-1": "student,condominium,helmet,parent,ballot,entiti,unincorpor,breast,traffick,termin",
            "0-3-2": "alcohol,bac,dui,drink,sentenc,nepa,bankruptci,environment,blood,architectur",
            "0-3-3": "life,alcohol,teacher,helmet,drink,trust,student,certif,dui,normal",
            "0-3-4": "drug,nurs,cannabi,marijuana,transfer,agreement,higher,certif,teacher,possess",
            "0-3-5": "vote,elector,credit,card,ida,theft,bac,compact,account,zero",
            "0-3-6": "helmet,motorcycl,interst,silenc,disclaim,bicycl,bar,cooper,real,agreement",
            "0-3-7": "lotteri,helmet,dui,record,penalti,merit,freedom,dwi,account,suspens",
            "0-3-8": "credit,vote,film,plate,real,lien,abort,pro,product,movement",
            "0-3-9": "rent,drink,english,stalk,bac,judgment,alcohol,patient,prison,death",
            "0-4-0": "offend,notif,abort,registri,colleg,abus,colorado,river,mandat,insan",
            "0-4-1": "electron,three,anim,welfar,pension,trade,fair,cruelti,strike,mother",
            "0-4-2": "drug,hmo,athlet,bulli,agent,notif,prescript,offend,fda,host",
            "0-4-3": "offend,victim,notif,renew,registri,document,jurisdict,refus,portfolio,movement",
            "0-4-4": "vote,renew,voter,elect,portfolio,rp,econom,aid,real,mail",
            "0-4-5": "tuition,prepaid,fair,colleg,river,judgment,chiropract,qualiti,save,immigr",
            "0-4-6": "anim,offend,cruelti,high,rail,speed,renew,feloni,coverag,wind",
            "0-4-7": "lemon,guarante,statutori,helmet,renew,trade,abort,remedi,secret,coverag",
            "0-4-8": "penalti,test,patern,parentag,suprem,georgia,furman,welfar,pharmaci,militari",
            "0-4-9": "id,liabil,busi,marriag,real,colleg,smoke,spous,partnership,save",
            "0-5-0": "seat,belt,primari,materi,pornographi,agricultur,secondari,weapon,wmd,appoint",
            "0-5-1": "compact,employ,medic,save,game,fair,hous,discrimin,die,rail",
            "0-5-2": "wage,minimum,profil,racial,dna,estat,game,level,rais,deced",
            "0-5-3": "illinoi,estat,cooper,sodomi,employ,collect,trust,busi,bargain,employe",
            "0-5-4": "signatur,electron,juvenil,pornographi,seat,compact,solar,credit,firearm,energi",
            "0-5-5": "gun,firearm,background,check,substanc,dealer,oil,compact,ga,possess",
            "0-5-6": "compact,full,faith,credit,hear,busi,claus,screen,gun,manufactur",
            "0-5-7": "alcohol,sunday,period,gun,firearm,methamphetamin,electron,conserv,wait,handgun",
            "0-5-8": "estat,wit,kinship,placement,harass,ten,bulli,number,command,colleg",
            "0-5-9": "seat,belt,primari,punish,air,damag,front,gun,wage,corpor"
        }
    },
    mock: {}
};

module.exports = Config;