from app import db, models
from .models import Subject, Policy, State, Cascade, Metadata
from sqlalchemy import text, Integer
from sqlalchemy.orm.session import Session

class BaseDao(object):
    """Base Data Access Object class"""
    def __init__(self):
        pass

    def get_all_subjects(self):
        return Subject.query.all()

    def get_all_policies(self):
        return Policy.query.all()

    def get_all_state(self):
        return State.query.all()

    def get_state_id_names(self):
        return db.session.execute(\
            text("SELECT state.state_id AS stateId, state_name AS stateName FROM `state`")).fetchall()

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

    def helper_normalizer(self, cur, min_val, max_val):
        return round((cur - min_val)/(max_val - min_val), 4)

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

    def get_all_policies(self):
        output = {}
        subject_pipe = {}
        policy_set = {}
        policy_pipe = {}
        subjects = super(PageDao, self).get_all_subjects()
        policies = Policy.query.with_entities(Policy.policyId, Policy.policyName, Policy.policySubjectId).all()
        for subject in subjects:
            subject_pipe[subject.subjectId] = subject.subjectName
        for policy in policies:
            policy_set.setdefault(subject_pipe[policy.policySubjectId], []).append(policy.policyId)
            policy_pipe[policy.policyId] = policy.policyName
        output["policies"] = policy_set
        output["pipe"] = policy_pipe
        return output

class StateDao(BaseDao):
    pass

    def get_root_count_list_for(self, subject_id):
        output = {}
        stmt = text("\
        SELECT r.state_id AS stateId, s.state_name AS stateName, count(r.state_id) AS rootCount \
        FROM policy AS p, root_state AS r, `state` AS s \
        WHERE p.policy_subject_id=:subject_id AND p.policy_id=r.policy_id AND r.state_id=s.state_id \
        GROUP BY r.state_id \
        ")

        query_result = db.session.execute(stmt, {'subject_id': int(subject_id)}).fetchall()
        for item in query_result:
            temp_object = {}
            temp_object["state_id"] = item.stateId
            temp_object["state_name"] = item.stateName
            temp_object["num"] = item.rootCount
            output[item.stateId] = temp_object
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
        year_noshow_set = {}
        meta_unadopted_set = {}
        min_year = 9999
        min_meta = 9999
        max_meta = 0
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
        result_with_valid_data = db.session.query(State.stateId, Metadata.year, getattr(Metadata, meta_flag))\
            .from_statement(stmt).params(policy_id=policy_id).all()

        for item in result_with_valid_data:
            meta = getattr(item, meta_flag)
            meta_set[item.stateId] = meta
            year_set[item.stateId] = item.year
            max_meta = max(max_meta, meta)
            min_meta = min(min_meta, meta)

        # data from those states who:
        # - were affected by the specified policy
        # - without time limitations
        result_full = super(NetworkDao, self).get_cascade_by_policy_id(policy_id)
        for item in result_full:
            if item.stateId not in meta_set:
                meta_noshow_set[item.stateId] = 0
                year_noshow_set[item.stateId] = item.adoptedYear
            if item.adoptedYear < min_year:
                min_year = item.adoptedYear
        min_year = super(NetworkDao, self).helper_get_valid_year(min_year)

        meta_from_earliest_year = super(NetworkDao, self).get_metadata_by_year(min_year)
        for item in meta_from_earliest_year:
            stateId = item.stateId
            if stateId not in meta_set:
                meta = getattr(item, meta_flag)
                if stateId in meta_noshow_set:
                    meta_noshow_set[stateId] = meta
                else:
                    meta_unadopted_set[stateId] = meta
                max_meta = max(max_meta, meta)
                min_meta = min(min_meta, meta)

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
                temp_object["normalizedMetadata"] = -1
                temp_object["dataYear"] = -1
                temp_object["adoptedYear"] = -1
            elif stateId in meta_unadopted_set:
                temp_object["valid"] = False
                temp_object["metadata"] = meta_unadopted_set[stateId]
                temp_object["normalizedMetadata"] = super(NetworkDao, self).helper_normalizer(meta_unadopted_set[stateId], min_meta, max_meta)
                temp_object["dataYear"] = min_year
                temp_object["adoptedYear"] = -1
            else:
                temp_object["valid"] = True
                if stateId in meta_set:
                    temp_object["metadata"] = meta_set[stateId]
                    temp_object["normalizedMetadata"] = super(NetworkDao, self).helper_normalizer(meta_set[stateId], min_meta, max_meta)
                    temp_object["adoptedYear"] = year_set[stateId]
                    temp_object["dataYear"] = year_set[stateId]
                else:
                    temp_object["metadata"] = meta_noshow_set[stateId]
                    temp_object["normalizedMetadata"] = super(NetworkDao, self).helper_normalizer(meta_noshow_set[stateId], min_meta, max_meta)
                    temp_object["adoptedYear"] = year_noshow_set[stateId]
                    temp_object["dataYear"] = min_year
            output.append(temp_object)
        return output

