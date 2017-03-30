const Config = {
    bases: {
        subject: {
            list: ['asd', 'subject', 'dfg', 'fgh', 'ghj', 'hjk', 'jkl'],
            default: 'subject'
        },
        policy: {
            list: [
                'aboldeapen',
                'aborparc',
                'aborparn',
                'aborpreroe',
                'absvot',
                'acctlic',
                'adc',
                'adcom',
                'aging',
                'aidperm',
                'airpol',
                'alcbevcon',
                'alctreat',
                'animcruel',
                'antiage',
                'antiinj',
                'antimis',
                'archlic',
                'arts',
                'ausbalsys',
                'autoreg',
                'autosaf',
                'banfaninc',
                'bangag',
                'beaulic',
                'blind',
                'boh',
                'bottle',
                'bradycamp',
                'broadcom',
                'budgstd',
                'cappun',
                'ccreceipt',
                'chartersch',
                'childabu',
                'childlab',
                'childseat',
                'chirolic',
                'cigtax',
                'citzon',
                'civinjaut',
                'cogrowman',
                'colcanscr',
                'comage',
                'compsch',
                'conacchwy',
                'consgsoil',
                'contrains',
                'correct',
                'credfreez',
                'crtadm',
                'cyberstalk',
                'deaf',
                'debtlim',
                'denlic',
                'dirdem',
                'dirprim',
                'dui08',
                'earlvot',
                'econdev',
                'education',
                'edutv',
                'elecdayreg',
                'elecdereg',
                'englic',
                'engonly',
                'enterzone',
                'environ',
                'equalpay',
                'expsta',
                'fairemp',
                'fairtrade',
                'famcap',
                'fhpriv',
                'fhpub',
                'fhurb',
                'fish',
                'foia',
                'forest',
                'gastax',
                'gaymarban',
                'gdl',
                'grandvist',
                'harass',
                'hatecrime',
                'health',
                'higissue',
                'higrenew',
                'hiport',
                'hiprecon',
                'hmomod1',
                'hmomod2',
                'homerul',
                'hsexit',
                'humrel',
                'hwyagen',
                'idas',
                'idtheft',
                'inctax',
                'indgaming',
                'indorgris',
                'infanthear',
                'intbar',
                'jucoen',
                'juvct',
                'juvisup',
                'kegreg',
                'kidhelmet',
                'kinship',
                'laborag',
                'legpre',
                'legresea',
                'lemon',
                'libext',
                'lien',
                'livingwill',
                'lott',
                'mailreg',
                'manclin',
                'medmar',
                'merit',
                'methpre',
                'miglab',
                'minwage',
                'missplan',
                'mlda21',
                'mntlhlth',
                'mothpen',
                'motorhelm',
                'motorvoter',
                'msas',
                'natreso',
                'norealid',
                'nrmlsch',
                'nrslic',
                'offwmh',
                'oldagea',
                'parksys',
                'parolesup',
                'pdrugmon',
                'pestcomp',
                'pharmlic',
                'pldvpag',
                'postdna',
                'primseat',
                'prkagcit',
                'prob',
                'pubbrefeed',
                'pubcamfun',
                'pubhouen',
                'realest',
                'recipsup',
                'renewport',
                'retainag',
                'retstate',
                'revenue',
                'right2work',
                'rightdie',
                'roadshwy',
                'sals',
                'schoolchoi',
                'sdce',
                'segoss',
                'sexreginfo',
                'shield',
                'slains',
                'smokeban',
                'snrpresc',
                'soil',
                'sprinsch',
                'stalkdef',
                'stateptr',
                'statrapage',
                'stplnb',
                'strikes',
                'taxcom',
                'teacelm',
                'teacsec',
                'tels',
                'termlim',
                'timelim',
                'transport',
                'urbrenen',
                'utreg',
                'viccomp',
                'vicrtsamd',
                'welfagy',
                'workcom',
                'zerotol'
            ],
            default: 'aboldeapen'
        }
    },
    models: {
        conditions: {
            defaults: {
                subject: 'subject',
                policy: 'aboldeapen',
                metadata: 'perCapitaIncome'
            }
        }
    },
    api: {
        root: 'api/',
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
        ]
    }
};

module.exports = Config;