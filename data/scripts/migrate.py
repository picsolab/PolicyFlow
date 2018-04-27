#!app/env/bin/python
from helper import rel_path

from sys import path

path.append(rel_path('../../'))

from sqlalchemy.orm import sessionmaker
from argparse import ArgumentParser
import pandas as pd
from app import db
from app.models import Policy, Cascade, RootState
from app.dao import PolicyDao

Session = sessionmaker(bind=db.engine)

IGNORING_STATE_LIST = [unicode(state, "utf-8") for state in ["DC", "GU", "PR", "VI"]]


def get_fixed_description(policy_id, description):
    _THE_DESCRIPTION = unicode(
        "Provides The Rules Governing Any Transaction (Other Than A Finance Lease) That Couples A Debt With A "
        "Creditor's Interest In A Debtor's Personal Property",
        "utf-8")
    _THE_OTHER_DESCRIPTION = unicode(
        "Allows State Governments During A Declared Emergency To Give Reciprocity To Other States' Licensees On "
        "Emergency Services Providers",
        "utf-8")

    if policy_id == unicode('uccarticle9amendments2010', "utf-8"):
        return _THE_DESCRIPTION
    if policy_id == unicode('emergencyvolunteerhealthpractitioners', "utf-8"):
        return _THE_OTHER_DESCRIPTION

    return description


def add_policy_n_description():
    """add policy and description"""
    _SUBJECT_ID = 13  # unknown
    df = pd.read_stata(rel_path('../external/raw/policies_with_descriptions.dta'))
    new_policies_ids = []
    old_policies_ids = []
    policies = []
    root_states = []
    cascades = []

    # query current policies
    session = Session()
    old_policy_ids = [p[0] for p in session.query(Policy.policyId).all()]

    for row in df.itertuples():
        if row.state in IGNORING_STATE_LIST:
            continue
        policy_id = row.policy
        if policy_id not in old_policy_ids:
            policy_description = get_fixed_description(policy_id, row.description)

            if policy_id not in new_policies_ids:
                new_policies_ids.append(policy_id)
                policies.append(Policy(policyId=row.policy, policyName=policy_description, policySubjectId=_SUBJECT_ID,
                                       policyStart=int(row.first_year), policyEnd=int(row.last_year)))

            if row.first_adopt == row.first_year:
                root_states.append(RootState(policyId=row.policy, stateId=row.state))

            cascades.append(Cascade(policyId=row.policy, adoptedYear=int(row.first_adopt), stateId=row.state))
        else:
            if policy_id not in old_policies_ids:
                old_policies_ids.append(policy_id)

    session.add_all(policies)
    session.add_all(cascades)
    session.add_all(root_states)

    # print """%d of new policy added, %d of overlapping old policy found, and %d of cascaded inserted.""" % (
    #     len(new_policies_ids), len(old_policies_ids), len(cascades))
    # session.commit()


def get_stat_for_0708_update():
    df = pd.read_stata(rel_path('../external/raw/policies_with_descriptions.dta'))
    distinct_df = df.drop_duplicates(['policy'])
    # count_dc = df.state.value_counts()['DC']
    policies = {}
    for state in IGNORING_STATE_LIST:
        policies[state] = df.loc[df['state'] == state, 'policy']
    full_series = pd.concat([policies[state] for state in IGNORING_STATE_LIST])
    distinct_full_series = full_series.drop_duplicates().sort_values()
    # print "%d policies contain one or more states from {'DC' 'GU', 'PR', 'VI'}." % len(distinct_full_series)
    # print "policies that adopted by less that 5 states:"
    # for policy in distinct_full_series.iteritems():
    #     if (distinct_df.loc[distinct_df['policy'] == policy[1], 'totadopt'] < 5).bool():
    #         print policy[1]


def alter_major_topic():
    subject_code_book = {
        "Macroeconomics": {"id": 1, "valid": 1},
        "Civil Rights": {"id": 2, "valid": 1},
        "Health": {"id": 3, "valid": 1},
        "Agriculture": {"id": 4, "valid": 1},
        "Labor": {"id": 5, "valid": 1},
        "Education": {"id": 6, "valid": 1},
        "Environment": {"id": 7, "valid": 1},
        "Energy": {"id": 8, "valid": 1},
        "Immigration": {"id": 9, "valid": 1},
        "Transportation": {"id": 10, "valid": 1},
        "Law and Crime": {"id": 12, "valid": 1},
        "Social Welfare": {"id": 13, "valid": 1},
        "Housing": {"id": 14, "valid": 1},
        "Domestic Commerce": {"id": 15, "valid": 1},
        "Defense": {"id": 16, "valid": 1},
        "Technology": {"id": 17, "valid": 1},
        "Foreign Trade": {"id": 18, "valid": 1},
        "International Affairs": {"id": 19, "valid": 1},
        "Government Operations": {"id": 20, "valid": 1},
        "Public Lands": {"id": 21, "valid": 1},
        "Arts and Entertainment": {"id": 23, "valid": 0},
        "Government Administration": {"id": 24, "valid": 0},
        "Weather": {"id": 26, "valid": 0},
        "Fires": {"id": 27, "valid": 0},
        "Sports": {"id": 29, "valid": 0},
        "Death Notices": {"id": 30, "valid": 0},
        "Religion": {"id": 31, "valid": 0},
        "Other": {"id": 99, "valid": 0},
        "Unknown": {"id": 98, "valid": 1}
    }
    session = Session()
    df = pd.read_stata(rel_path('../external/raw/0718/policies_with_descriptions_topics.dta'))
    ddf = df.drop_duplicates('policy', inplace=False)
    all_policies = PolicyDao.get_all_policies()
    updated = 0
    unknown = 0
    raw_to_unknown = 0
    for policy in all_policies:
        major_topic_c = ddf.loc[ddf['policy'] == str(policy.policyId), 'majortopic']
        if len(major_topic_c) == 1:
            subject = str(major_topic_c.iat[0])
            if subject == 'nan':
                unknown += 1
                session.execute("UPDATE policy SET policy_subject_id=:policy_subject_id WHERE policy_id=:policy_id",
                                {'policy_subject_id': 98, 'policy_id': policy.policyId})
            else:
                updated += 1
                subject_id = subject_code_book[str(subject)]["id"]
                session.execute("UPDATE policy SET policy_subject_id=:policy_subject_id WHERE policy_id=:policy_id",
                                {'policy_subject_id': subject_id, 'policy_id': policy.policyId})
        else:
            raw_to_unknown += 1
            session.execute("UPDATE policy SET policy_subject_id=:policy_subject_id WHERE policy_id=:policy_id",
                            {'policy_subject_id': 98, 'policy_id': policy.policyId})
    # session.commit()
    # print """updated: %d, unknown: %d, raw: %d\n""" % (updated, unknown, raw_to_unknown)


if __name__ == '__main__':
    parser = ArgumentParser(description='database migration.')
    parser.add_argument('--operation', '-o', help='specify operation to perform.', required=True)
    args = parser.parse_args()
    operation = str(args.operation)

    if operation == "a":
        """add policy and description"""
        add_policy_n_description()
    if operation == "s":
        get_stat_for_0708_update()
    if operation == "u":
        alter_major_topic()
