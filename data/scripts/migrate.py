#!app/env/bin/python
from helper import rel_path

from sys import path

path.append(rel_path('../../'))

from sqlalchemy.orm import sessionmaker
from argparse import ArgumentParser
import pandas as pd
from app import db
from app.models import Policy, Cascade, RootState

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

    print """%d of new policy added, %d of overlapping old policy found, and %d of cascaded inserted.""" % (
        len(new_policies_ids), len(old_policies_ids), len(cascades))
    session.commit()


def get_stat_for_0708_update():
    df = pd.read_stata(rel_path('../external/raw/policies_with_descriptions.dta'))
    distinct_df = df.drop_duplicates(['policy'])
    # count_dc = df.state.value_counts()['DC']
    policies = {}
    for state in IGNORING_STATE_LIST:
        policies[state] = df.loc[df['state'] == state, 'policy']
    full_series = pd.concat([policies[state] for state in IGNORING_STATE_LIST])
    distinct_full_series = full_series.drop_duplicates().sort_values()
    print "%d policies contain one or more states from {'DC' 'GU', 'PR', 'VI'}." % len(distinct_full_series)
    print "policies that adopted by less that 5 states:"
    for policy in distinct_full_series.iteritems():
        if (distinct_df.loc[distinct_df['policy'] == policy[1], 'totadopt'] < 5).bool():
            print policy[1]


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
