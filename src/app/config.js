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
    pipe: {
        policy: {
            'aboldeapen': 'Death Penalty Reform',
            'aborparc': '1-parent Consent for Abortion by a Minor ',
            'aborparn': '1-parent Notification for Abortion by a Minor ',
            'aborpreroe': 'Abortion pre-Roe',
            'absvot': 'Unrestricted Absentee Voting',
            'acctlic': 'Accountants Licensing',
            'adc': 'Aid to Dependent Children (Social Sec.)',
            'adcom': 'Advertising Commissions',
            'aging': 'Strategic Planning for Aging',
            'aidperm': 'Aid to Permanently/Totally Disabled',
            'airpol': 'Air Pollution Control',
            'alcbevcon': 'Alcoholic Beverage Control',
            'alctreat': 'Alcoholic Treatment Agency',
            'animcruel': 'Animal Cruelty Felony Laws',
            'antiage': 'Anti-Age Discrimination',
            'antiinj': 'Anti-Injunction Laws',
            'antimis': 'Antimiscegenation law',
            'archlic': 'Architects Licensing',
            'arts': 'Council on the Arts',
            'ausbalsys': 'Australian Ballot System',
            'autoreg': 'Automobile Registration',
            'autosaf': 'Automobile Safety Compact',
            'banfaninc': 'Ban on Financial Incentives for Doctors to Perform Less Costly Procedures/Prescribe Less Costly Drugs',
            'bangag': 'Prohibits Agreements that Limits a Doctor’s Ability to Inform Patients of All Treatment Options',
            'beaulic': 'Beauticians Licensing',
            'blind': 'Aid to the Blind (Social Security)',
            'boh': 'Board of Health',
            'bottle': 'Bottle Deposit Law',
            'bradycamp': 'Child Access to Guns Protection Law',
            'broadcom': 'State Law Requiring Broad Community Notification of Sex Offenders ',
            'budgstd': 'Budgeting Standards',
            'cappun': 'Capital Punishment',
            'ccreceipt': 'Restrictions on Displaying Credit Card Numbers on Sales Receipts ',
            'chartersch': 'Charter Schools',
            'childabu': 'Child Abuse Reporting Legislation',
            'childlab': 'Child Labor Standards',
            'childseat': 'Child Seatbelt Requirement',
            'chirolic': 'Chiropractors Licensing',
            'cigtax': 'Cigarette Tax',
            'citzon': 'Zoning in Cities - Enabling Legislation',
            'civinjaut': 'Civil Injunction Authority',
            'cogrowman': 'Planning Laws Requiring Loc/Reg Planners to Coordinate Growth Management Plan Developments',
            'colcanscr': 'Colorectal Cancer Screening',
            'comage': 'Committee on the Aged',
            'compsch': 'Compulsory School Attendance',
            'conacchwy': 'Controlled Access Highways',
            'consgsoil': 'Conservation of Gas and Oil',
            'contrains': 'Insurers That Cover Prescription Drugs Cannot Exclude FDA-Approved Contraceptives ',
            'correct': 'Strategic Planning for Corrections ',
            'credfreez': 'Limits Credit Agencies from Issuing a Credit Report without Consumer Consent',
            'crtadm': 'Court Administrators',
            'cyberstalk': 'Cyberstalking Definition and Penalty',
            'deaf': 'School for the Deaf',
            'debtlim': 'Debt Limitation',
            'denlic': 'Dentists Licensing',
            'dirdem': 'Initiative/Referendum ',
            'dirprim': 'Direct Primary',
            'dui08': '08 per se penalty for DUI',
            'earlvot': 'In-Person Early Voting',
            'econdev': 'Strategic Planning for Economic Development',
            'education': 'Strategic Planning for Education ',
            'edutv': 'Educational Television',
            'elecdayreg': 'Election Day Registration ',
            'elecdereg': 'Electricity Deregulation ',
            'englic': 'Engineers Licensing',
            'engonly': 'English Only Law',
            'enterzone': 'State Enterprise Zones',
            'environ': 'Strategic Planning for Environmental Protection',
            'equalpay': 'Equal Pay For Females',
            'expsta': 'Agricultural Experiment Stations',
            'fairemp': 'Fair Employment Laws',
            'fairtrade': 'Fair Trade Laws',
            'famcap': 'Family Cap Exemptions',
            'fhpriv': 'Fair Housing - Private Housing',
            'fhpub': 'Fair Housing - Public Housing',
            'fhurb': 'Fair Housing - Urban Renewal Areas',
            'fish': 'Fish Agency',
            'foia': 'Open Records/Freedom of Information Acts ',
            'forest': 'Forest Agency',
            'gastax': 'State Gas Tax',
            'gaymarban': 'Constitutional Amendment Banning Gay Marriage',
            'gdl': 'State Graduated Driver’s Licensing Program ',
            'grandvist': 'Grandparents’ Visitation Rights',
            'harass': 'Harassment Crime',
            'hatecrime': 'State Hate Crime Laws',
            'health': 'Strategic Planning for Health Services',
            'higissue': 'Guranteed Issue of Health Insurance',
            'higrenew': 'Guranteed Renewal of Health Insurance',
            'hiport': 'Health Insurance Portability',
            'hiprecon': 'Health Insurance Preexisting Conditions Limits',
            'hmomod1': 'Health Maintenance Organization Model Act (First)',
            'hmomod2': 'Health Maintenance Organization Model Act (Second)',
            'homerul': 'Municipal Home Rule',
            'hsexit': 'High School Exit Exams',
            'humrel': 'Human Relations Commission',
            'hwyagen': 'Highway Agency',
            'idas': 'Individual Development Accounts',
            'idtheft': 'ID Theft Protection',
            'inctax': 'State Income Tax',
            'indgaming': 'State allows Tribal Gaming',
            'indorgris': 'State Law Requiring Notification to Individuals/Organizations at Risk (Sex Offender Policy)',
            'infanthear': 'Newborn Hearing Screening',
            'intbar': 'Integrated Bar',
            'jucoen': 'Junior College - Enabling Leg.',
            'juvct': 'Establishment of Juvenile Courts',
            'juvisup': 'Juveniles Supervision Compact',
            'kegreg': 'Beer Keg Registration Requirement',
            'kidhelmet': 'Mandatory Bycicle Helmets for Minors ',
            'kinship': 'Kinship Care Program',
            'laborag': 'Labor Agency',
            'legpre': 'Legislative Pre-Planning Agency',
            'legresea': 'Legislative Research Agency',
            'lemon': 'Lemon Laws',
            'libext': 'Library Extension System',
            'lien': 'Lien Statutes',
            'livingwill': 'Living Wills',
            'lott': 'Lottery',
            'mailreg': 'Malpractice Reforms',
            'manclin': 'Mandated Coverage of Clinical Trials',
            'medmar': 'Symbolic Medical Marijuana Policy',
            'merit': 'Merit System',
            'methpre': 'Restrictions on OTC Medications with Methamphetamine Precursors',
            'miglab': 'Migratory Labor Committee',
            'minwage': 'Minimum Wage Law',
            'missplan': 'Missouri Plan',
            'mlda21': 'Minimum Legal Drinking Age 21',
            'mntlhlth': 'Mental Health Standards Committee',
            'mothpen': 'Mothers’ Pensions',
            'motorhelm': 'Motorcycle Helmet Requirement',
            'motorvoter': 'Voter Registration with Driver’s License Renewal',
            'msas': 'Medical Savings Accounts',
            'natreso': 'Strategic Planning for Natural Resources',
            'norealid': 'State Policy to Refuse to Comply with 2005 Federal Real ID Act',
            'nrmlsch': 'Normal Schools',
            'nrslic': 'Nurses Licensing',
            'offwmh': 'Special Agent/Office for Women’s Health ',
            'oldagea': 'Old Age Assistance (Social Security)',
            'parksys': 'Park System',
            'parolesup': 'Parolees/Probationers Supervision',
            'pdrugmon': 'Prescription Drug Monitoring',
            'pestcomp': 'Interstate Pest Control Compact',
            'pharmlic': 'Pharmacists Licensing',
            'pldvpag': 'Planning/Development Agency',
            'postdna': 'Post-Conviction DNA Motions',
            'primseat': 'Primary Seat Belt Laws',
            'prkagcit': 'Parking Agency - Enabling Act for Cities',
            'prob': 'Probation Law',
            'pubbrefeed': 'Allowance of Breastfeeding in Public',
            'pubcamfun': 'Public Campaign Funding',
            'pubhouen': 'Public Housing - Enabling',
            'realest': 'Real Estate Brokers Licensing',
            'recipsup': 'Reciprocal Support Law',
            'renewport': 'State Renewable Portfolio Standards',
            'retainag': 'Retainers Agreement',
            'retstate': 'Retirement System for State Employees',
            'revenue': 'Strategic Planning for Revenue',
            'right2work': 'Protects Employees from Termination for Not Joining Unions/Paying Dues ',
            'rightdie': 'Right to Die',
            'roadshwy': 'Aid for Roads and Highways',
            'sals': 'Seasonal Agricultural Labor Standards',
            'schoolchoi': 'School Choice',
            'sdce': 'Dependent Coverage Expansion Insurance for Young Adults',
            'segoss': 'Provisions by the States Maintaining Segregated Educational Systems for Out-Of-State Study by African-Americans',
            'sexreginfo': 'Access to Sex Offender Registries',
            'shield': 'Protections Against Compelling Reporters to Disclose Sources in Court',
            'slains': 'Slaughterhouse Inspection',
            'smokeban': 'Statewide Smoking Ban',
            'snrpresc': 'Senior Prescription Drugs',
            'soil': 'Soil Conservation Districts',
            'sprinsch': 'Superintendent of Public Instruction',
            'stalkdef': 'Stalking Definition and Penalty',
            'stateptr': 'Establishment of State Patrol/Highway Police',
            'statrapage': 'Age Span Provisions for Statutory Rape ',
            'stplnb': 'State Planning Board',
            'strikes': 'Felony Sentencing Guidelines for Three Strikes',
            'taxcom': 'Tax Commission',
            'teacelm': 'Teacher Certification - Elementary',
            'teacsec': 'Teacher Certification - Secondary',
            'tels': 'Tax and Expenditure Limits',
            'termlim': 'Legislative Term Limits',
            'timelim': 'Time Limits on Welfare Benefits',
            'transport': 'Strategic Planning for Transportation',
            'urbrenen': 'Urban Renewal - Enabling',
            'utreg': 'Utility Regulation Commission',
            'viccomp': 'Victims’ Compensation',
            'vicrtsamd': 'Victims’ Rights Constitutional Amendment ',
            'welfagy': 'Welfare Agency',
            'workcom': 'Workmens’ Compensation',
            'zerotol': 'Zero Tolerance (<.02 BAC) for Underage Drinking'
        }
    },
    mock: {
        cascade1: {
            policyId: 'equalpay',
            policyName: 'Equal Pay For Females',
            policySubjectId: 9,
            policySubjectName: 'Labor',
            policyStart: '1919',
            policyEnd: '1966',
            maxCount: 4,
            totalCount: 27,
            detail: {
                '1919': ["MI", "MT"],
                '1943': ["WA"],
                '1944': ["NY", "IL"],
                '1945': ["MA"],
                '1946': ["RI"],
                '1947': ["NH"],
                '1948': ["PA"],
                '1949': ["CT", "ME", "CA"],
                '1952': ["NJ"],
                '1955': ["AR", "CO", "OR"],
                '1959': ["OH", "WY"],
                '1962': ["AZ"],
                '1963': ["MO"],
                '1965': ["ND", "OK", "WV"],
                '1966': ["SD", "GA", "KY", "MD"]
            }
        },
        cascade2: {
            policyId: 'soil',
            policyName: 'Soil Conservation Districts',
            policySubjectId: 3,
            policySubjectName: 'Conservation',
            policyStart: '1937',
            policyEnd: '1945',
            maxCount: 21,
            totalCount: 49,
            detail: {
                '1937': ["NJ", "PA", "IN", "MI", "WI", "KS", "MN", "NE", "ND", "SD", "AR", "FL", "GA", "NC", "SC", "MD", "OK", "CO", "NV", "NM", "UT"],
                '1938': ["VA", "LA", "MS", "CA"],
                '1939': ["VT", "IL", "IA", "AL", "TX", "TN", "WV", "ID", "MT", "OR", "WA"],
                '1940': ["NY", "KY"],
                '1941': ["ME", "OH", "AZ", "WY"],
                '1943': ["RI", "DE", "MO"],
                '1945': ["CT", "MA", "NH"]
            }
        },
        bar: [{
                "state": "AL",
                "num": 3
            },
            {
                "state": "AK",
                "num": 4
            },
            {
                "state": "AZ",
                "num": 1
            },
            {
                "state": "AR",
                "num": 2
            },
            {
                "state": "CA",
                "num": 10
            },
            {
                "state": "CO",
                "num": 1
            },
            {
                "state": "CT",
                "num": 3
            },
            {
                "state": "DE",
                "num": 1
            },
            {
                "state": "FL",
                "num": 6
            },
            {
                "state": "GA",
                "num": 1
            },
            {
                "state": "HI",
                "num": 2
            },
            {
                "state": "ID",
                "num": 2
            },
            {
                "state": "IL",
                "num": 5
            },
            {
                "state": "IN",
                "num": 3
            },
            {
                "state": "IA",
                "num": 11
            },
            {
                "state": "KS",
                "num": 4
            },
            {
                "state": "KY",
                "num": 2
            },
            {
                "state": "LA",
                "num": 7
            },
            {
                "state": "ME",
                "num": 5
            },
            {
                "state": "MD",
                "num": 5
            },
            {
                "state": "MA",
                "num": 3
            },
            {
                "state": "MI",
                "num": 4
            },
            {
                "state": "MN",
                "num": 2
            },
            {
                "state": "MS",
                "num": 6
            },
            {
                "state": "MO",
                "num": 1
            },
            {
                "state": "MT",
                "num": 2
            },
            {
                "state": "NV",
                "num": 1
            },
            {
                "state": "NH",
                "num": 3
            },
            {
                "state": "NJ",
                "num": 4
            },
            {
                "state": "NM",
                "num": 3
            },
            {
                "state": "NY",
                "num": 13
            },
            {
                "state": "NC",
                "num": 2
            },
            {
                "state": "ND",
                "num": 2
            },
            {
                "state": "OH",
                "num": 4
            },
            {
                "state": "OK",
                "num": 5
            },
            {
                "state": "OR",
                "num": 5
            },
            {
                "state": "PA",
                "num": 1
            },
            {
                "state": "RI",
                "num": 3
            },
            {
                "state": "SC",
                "num": 5
            },
            {
                "state": "SD",
                "num": 8
            },
            {
                "state": "TN",
                "num": 2
            },
            {
                "state": "TX",
                "num": 9
            },
            {
                "state": "UT",
                "num": 2
            },
            {
                "state": "VT",
                "num": 4
            },
            {
                "state": "VA",
                "num": 3
            },
            {
                "state": "WA",
                "num": 4
            },
            {
                "state": "WV",
                "num": 2
            },
            {
                "state": "WI",
                "num": 1
            },
            {
                "state": "WY",
                "num": 1
            }
        ],
        net: [{
                "state_id": "HI",
                "rpcpinc": 2.9659743,
                "long": -157.8219,
                "lat": 21.292
            },
            {
                "state_id": "AK",
                "rpcpinc": 3.0816245,
                "long": -134.5721,
                "lat": 58.3637
            },
            {
                "state_id": "OR",
                "rpcpinc": 2.917274,
                "long": -123.0272,
                "lat": 44.937
            },
            {
                "state_id": "WA",
                "rpcpinc": 3.2957551,
                "long": -122.9016,
                "lat": 47.0449
            },
            {
                "state_id": "CA",
                "rpcpinc": 3.3128164,
                "long": -121.4871,
                "lat": 38.5737
            },
            {
                "state_id": "NV",
                "rpcpinc": 3.2017016,
                "long": -117.7519,
                "lat": 39.1501
            },
            {
                "state_id": "ID",
                "rpcpinc": 2.512661,
                "long": -116.2125,
                "lat": 43.6021
            },
            {
                "state_id": "AZ",
                "rpcpinc": 2.654551,
                "long": -112.0738,
                "lat": 33.4483
            },
            {
                "state_id": "MT",
                "rpcpinc": 2.3804896,
                "long": -112.0205,
                "lat": 46.5911
            },
            {
                "state_id": "UT",
                "rpcpinc": 2.4774585,
                "long": -111.8882,
                "lat": 40.7716
            },
            {
                "state_id": "NM",
                "rpcpinc": 2.3174274,
                "long": -105.9381,
                "lat": 35.6816
            },
            {
                "state_id": "CO",
                "rpcpinc": 3.3387325,
                "long": -104.9881,
                "lat": 39.7551
            },
            {
                "state_id": "WY",
                "rpcpinc": 2.936279,
                "long": -104.8165,
                "lat": 41.1389
            },
            {
                "state_id": "ND",
                "rpcpinc": 2.537821,
                "long": -100.7694,
                "lat": 46.8084
            },
            {
                "state_id": "SD",
                "rpcpinc": 2.6797109,
                "long": -100.3177,
                "lat": 44.3776
            },
            {
                "state_id": "TX",
                "rpcpinc": 2.8506484,
                "long": -97.7452,
                "lat": 30.2687
            },
            {
                "state_id": "NE",
                "rpcpinc": 2,
                "long": -97.548004,
                "lat": 41.178558
            },
            {
                "state_id": "OK",
                "rpcpinc": 2.4573736,
                "long": -97.4591,
                "lat": 35.4931
            },
            {
                "state_id": "KS",
                "rpcpinc": 2.8967571,
                "long": -95.6815,
                "lat": 39.0474
            },
            {
                "state_id": "IA",
                "rpcpinc": 2.7577827,
                "long": -93.6203,
                "lat": 41.5888
            },
            {
                "state_id": "MN",
                "rpcpinc": 3.3001823,
                "long": -93.1027,
                "lat": 44.9446
            },
            {
                "state_id": "AR",
                "rpcpinc": 2.3276858,
                "long": -92.2789,
                "lat": 34.7244
            },
            {
                "state_id": "MO",
                "rpcpinc": 2.8311036,
                "long": -92.1941,
                "lat": 38.5698
            },
            {
                "state_id": "LA",
                "rpcpinc": 2.4250865,
                "long": -91.1882,
                "lat": 30.4493
            },
            {
                "state_id": "MS",
                "rpcpinc": 2.2195945,
                "long": -90.178,
                "lat": 32.3122
            },
            {
                "state_id": "IL",
                "rpcpinc": 3.3063376,
                "long": -89.6533,
                "lat": 39.8018
            },
            {
                "state_id": "WI",
                "rpcpinc": 2.9859514,
                "long": -89.4007,
                "lat": 43.0632
            },
            {
                "state_id": "TN",
                "rpcpinc": 2.7395337,
                "long": -86.7821,
                "lat": 36.1589
            },
            {
                "state_id": "AL",
                "rpcpinc": 2.479402,
                "long": -86.2996,
                "lat": 32.3754
            },
            {
                "state_id": "IN",
                "rpcpinc": 2.7966568,
                "long": -86.1563,
                "lat": 39.767
            },
            {
                "state_id": "KY",
                "rpcpinc": 2.487069,
                "long": -84.8715,
                "lat": 38.1894
            },
            {
                "state_id": "MI",
                "rpcpinc": 3.0081959,
                "long": -84.5466,
                "lat": 42.7336
            },
            {
                "state_id": "GA",
                "rpcpinc": 2.8909261,
                "long": -84.3897,
                "lat": 33.7545
            },
            {
                "state_id": "FL",
                "rpcpinc": 2.951073,
                "long": -84.2806,
                "lat": 30.4382
            },
            {
                "state_id": "OH",
                "rpcpinc": 2.9471853,
                "long": -83.0007,
                "lat": 39.9622
            },
            {
                "state_id": "WV",
                "rpcpinc": 2.2729383,
                "long": -81.6354,
                "lat": 38.3533
            },
            {
                "state_id": "SC",
                "rpcpinc": 2.5430043,
                "long": -81.0353,
                "lat": 34.0007
            },
            {
                "state_id": "NC",
                "rpcpinc": 2.8427656,
                "long": -78.6434,
                "lat": 35.7797
            },
            {
                "state_id": "VA",
                "rpcpinc": 3.1981382,
                "long": -77.4339,
                "lat": 39.5408
            },
            {
                "state_id": "PA",
                "rpcpinc": 3.0611076,
                "long": -73.8849,
                "lat": 42.274
            },
            {
                "state_id": "MD",
                "rpcpinc": 3.4787867,
                "long": -73.5197,
                "lat": 38.9693
            },
            {
                "state_id": "DE",
                "rpcpinc": 3.1392875,
                "long": -71.5136,
                "lat": 39.1615
            },
            {
                "state_id": "NJ",
                "rpcpinc": 3.818286,
                "long": -70.7642,
                "lat": 42.2202
            },
            {
                "state_id": "NY",
                "rpcpinc": 3.5229518,
                "long": -68.7551,
                "lat": 45.6517
            },
            {
                "state_id": "CT",
                "rpcpinc": 4.1808934,
                "long": -67.6732,
                "lat": 38.7665
            },
            {
                "state_id": "VT",
                "rpcpinc": 2.8365026,
                "long": -66.5716,
                "lat": 47.2627
            },
            {
                "state_id": "NH",
                "rpcpinc": 3.3513665,
                "long": -65.5597,
                "lat": 43.2314
            },
            {
                "state_id": "RI",
                "rpcpinc": 2.9955618,
                "long": -65.4087,
                "lat": 40.827
            },
            {
                "state_id": "MA",
                "rpcpinc": 3.7438855,
                "long": -64.0568,
                "lat": 38.3589
            },
            {
                "state_id": "ME",
                "rpcpinc": 2.7158854,
                "long": -64.7323,
                "lat": 48.3294
            }
        ]
    }
};

module.exports = Config;