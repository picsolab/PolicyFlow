from app import db, models
from .models import Subject, Policy, State, Cascade, Metadata
from sqlalchemy import text
from sqlalchemy.orm.session import Session

class BaseDao(object):
    """Base Data Access Object class"""
    def __init__(self):
        pass


    def get_all_state(self):
        return State.query.all()

    def get_metadata_by_year(self, year):
        return Metadata.query.filter(Metadata.year == year)

    def get_cascade_by_policy_id(self, policy_id):
        return Cascade.query.filter(Cascade.policyId == policy_id)

    def helper_get_valid_year(self, year):
        max_year = 1999
        min_year = 1960
        if year < max_year:
            year = min_year
        elif year > max_year:
            year = max_year
        return year

class PageDao(BaseDao):
    """page dao providing page related data"""
    @staticmethod
    def get_all_subjects():
        subjects = Subject.query.all()
        output = {}
        policies = {}
        pipe = {}
        for subject in subjects:
            for policy in subject.policies:
                policies.setdefault(subject.subjectName, []).append(policy.policyId)
                pipe[policy.policyId] = policy.policyName
        output["policies"] = policies
        output["pipe"] = pipe
        return output


class PolicyDao(BaseDao):
    """policy dao providing policy related data"""
    @staticmethod
    def get_policy_by_id(policy_id):
        output = {}
        detail = {}
        result = Policy.query.filter(Policy.policyId == policy_id).first()
        cascades = result.cascades
        for item in cascades:
            detail.setdefault(item.adoptedYear, []).append(item.stateId)
        years = detail.keys()
        output["policyId"] = result.policyId
        output["policyName"] = result.policyName
        output["policyStart"] = min(years)
        output["policyEnd"] = max(years)
        output["detail"] = detail
        return output


class NetworkDao(BaseDao):
    """network dao providing network related data"""

    def get_parameterized_network(self, meta_flag, policy_id):
        """get_parameterized_network"""
        output = []
        meta_set = {}
        year_set = {}
        meta_noshow_set = {}
        meta_unadopted_set = {}
        pipe = {
            "perCapitaIncome": "state_pci",
            "minorityDiversity": "state_md",
            "legislativeProfessionalism": "state_lp",
            "citizenIdeology": "state_ci",
            "totalPopulation": "state_pop",
            "populationDensity": "state_pd"
        }
        stmt = text("SELECT s.state_id AS stateId, m.year AS year, m." + pipe[meta_flag] + " AS " + meta_flag + " "
                    "FROM state AS s, `metadata` AS m "
                    "WHERE s.state_id=m.state_id "
                    "HAVING (m.year, s.state_id) IN ( "
                    "   SELECT c0.adopted_year, c0.state_id "
                    "   FROM `cascade` AS c0 "
                    "   WHERE c0.policy_id=:policy_id "
                    ") ORDER BY m.year ASC")
        stmt = stmt.columns(State.stateId, Metadata.year, getattr(Metadata, meta_flag))

        # data from those states who:
        # - were affected by the specified policy
        # - during 1960 to 1999
        result_with_valid_data = db.session.query(State.stateId, Metadata.year, getattr(Metadata, meta_flag)).from_statement(stmt).params(policy_id=policy_id).all()

        for item in result_with_valid_data:
            meta_set[item.stateId] = getattr(item, meta_flag)
            year_set[item.stateId] = item.year

        # data from those states who:
        # - were affected by the specified policy
        # - without time limitations
        result_full = super(NetworkDao, self).get_cascade_by_policy_id(policy_id)
        min_year = 9999
        for item in result_full:
            if item.stateId not in meta_set:
                meta_noshow_set[item.stateId] = 0
            if item.adoptedYear < min_year:
                min_year = item.adoptedYear
        min_year = super(NetworkDao, self).helper_get_valid_year(min_year)

        meta_from_earliest_year = super(NetworkDao, self).get_metadata_by_year(min_year)
        for item in meta_from_earliest_year:
            stateId = item.stateId
            if stateId not in meta_set:
                if stateId in meta_noshow_set:
                    meta_noshow_set[stateId] = getattr(item, meta_flag)
                else:
                    meta_unadopted_set[stateId] = getattr(item, meta_flag)

        states = super(NetworkDao, self).get_all_state()

        for state in states:
            temp_object = {}
            stateId = state.stateId
            temp_object["stateId"] = stateId
            temp_object["stateName"] = state.stateName
            temp_object["longtitude"] = state.longtitude
            temp_object["latitude"] = state.latitude
            if stateId == "NE":
                temp_object["valid"] = False if stateId in meta_unadopted_set else True
                temp_object["metadata"] = -1
                temp_object["year"] = -1
            elif stateId in meta_unadopted_set:
                temp_object["valid"] = False
                temp_object["metadata"] = meta_unadopted_set[stateId]
                temp_object["year"] = min_year
            else:
                temp_object["valid"] = True
                if stateId in meta_set:
                    temp_object["metadata"] = meta_set[stateId]
                    temp_object["year"] = year_set[stateId]
                else:
                    temp_object["metadata"] = meta_noshow_set[stateId]
                    temp_object["year"] = min_year
            output.append(temp_object)
        return output

