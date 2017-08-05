from app import db, models
from .models import Subject, Policy, State, Cascade, Metadata
from sqlalchemy import text, Integer
from sqlalchemy.orm.session import Session


class BaseDao(object):
    """Base Data Access Object class"""

    def __init__(self):
        pass

    @staticmethod
    def helper_get_valid_year(year):
        max_year = 1999
        min_year = 1960
        if year < max_year:
            year = min_year
        elif year > max_year:
            year = max_year
        return year

    @staticmethod
    def helper_normalizer(cur, min_val, max_val):
        return round((cur - min_val) / (max_val - min_val), 4)


class MetadataDao(BaseDao):
    @staticmethod
    def get_metadata_by_year(year):
        return Metadata.query.filter(Metadata.year == year)


class CascadeDao(BaseDao):
    @staticmethod
    def get_cascade_by_policy_id(policy_id):
        """
        data from those states who:
            - were affected by the specified policy
            - without time limitations
        """
        return Cascade.query.filter(Cascade.policyId == policy_id)


class SubjectDao(BaseDao):
    """page dao providing page related data"""

    @staticmethod
    def get_all_subjects():
        return Subject.query.all()


class StateDao(BaseDao):
    @staticmethod
    def get_state_id_names():
        return db.session.execute(
            text("SELECT state.state_id AS stateId, state_name AS stateName FROM `state`")).fetchall()

    @staticmethod
    def get_root_count_list_for(subject_id):
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

    @staticmethod
    def get_all_state():
        return State.query.all()


class PolicyDao(BaseDao):
    """policy dao providing policy related data"""

    @staticmethod
    def get_all_policies():
        return Policy.query.all()

    @staticmethod
    def get_policy_id_name_subject():
        return Policy.query.with_entities(Policy.policyId, Policy.policyName, Policy.policySubjectId).all()

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
        output["message"] = "success"
        return output

    @staticmethod
    def get_policies_by_word_match(word_str):
        pass

    @staticmethod
    def get_policies_by_text_similarity(policy_id):
        pass

    @staticmethod
    def get_policies_by_state(state_id):
        pass

    @staticmethod
    def get_policies_by_state_as_root(state_id):
        pass

    @staticmethod
    def get_policies_by_subject(subject_id):
        pass

    @staticmethod
    def get_policies_by_cluster(cluster_id):
        pass


class TextQueryDao(BaseDao):
    """text query dao conducting text queries"""

    @staticmethod
    def get_states_with_validated_data(policy_id):
        """
        data from those states who:
            - were affected by the specified policy
            - during 1960 to 1999
        """

        stmt = text("SELECT s.state_id AS stateId, \
                      m.year AS year, \
                      m.state_md AS minorityDiversity, \
                      m.state_ci AS citizenIdeology, \
                      m.state_lp AS legislativeProfessionalism, \
                      m.state_pci AS perCapitaIncome, \
                      m.state_pd AS populationDensity, \
                      m.state_pop AS totalPopulation \
                    FROM state AS s, `metadata` AS m \
                    WHERE s.state_id=m.state_id \
                    HAVING (m.year, s.state_id) IN ( \
                      SELECT c0.adopted_year, c0.state_id \
                      FROM `cascade` AS c0 \
                      WHERE c0.policy_id=:policy_id \
                    ) ORDER BY m.year ASC")

        stmt = stmt.columns(State.stateId,
                            Metadata.year,
                            Metadata.minorityDiversity,
                            Metadata.citizenIdeology,
                            Metadata.legislativeProfessionalism,
                            Metadata.perCapitaIncome,
                            Metadata.populationDensity,
                            Metadata.totalPopulation)

        return db.session.query(State.stateId,
                                Metadata.year,
                                Metadata.minorityDiversity,
                                Metadata.citizenIdeology,
                                Metadata.legislativeProfessionalism,
                                Metadata.perCapitaIncome,
                                Metadata.populationDensity,
                                Metadata.totalPopulation) \
            .from_statement(stmt) \
            .params(policy_id=policy_id) \
            .all()
