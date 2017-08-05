from flask import request, g, json
from app import app

from .helper import DecimalEncoder
from .base_service import BaseService
from .computing_service import ComputingService
from ..dao import BaseDao, SubjectDao, PolicyDao, TextQueryDao, StateDao, CascadeDao, MetadataDao

computing_service = ComputingService()


class PageService(BaseService):
    """page service handling page related requests"""

    def __init__(self):
        pass

    @staticmethod
    @app.route("/api/subjects/", methods=["GET"])
    def get_subject_list():
        """get all subject from database."""
        output = {}
        subject_pipe = {}
        policy_set = {}
        policy_pipe = {}
        subjects = SubjectDao.get_all_subjects()
        policies = PolicyDao.get_policy_id_name_subject()
        for subject in subjects:
            subject_pipe[subject.subjectId] = subject.subjectName
        for policy in policies:
            policy_set.setdefault(subject_pipe[policy.policySubjectId], []).append(policy.policyId)
            policy_pipe[policy.policyId] = policy.policyName
        output["policies"] = policy_set
        output["pipe"] = policy_pipe
        return json.dumps(output)


class StateService(BaseService):
    """state service handling requests from bar chart"""

    def __init__(self):
        pass

    @staticmethod
    @app.route("/api/root/<subject_id>", methods=["GET"])
    def get_root_count(subject_id):
        """get all subject from database."""
        result = []
        state_pipe = StateDao.get_state_id_names()
        root_states = StateDao.get_root_count_list_for(subject_id)
        for state in state_pipe:
            if root_states.has_key(state.stateId):
                result.append(root_states[state.stateId])
            else:
                result.append({
                    "state_id": state.stateId,
                    "state_name": state.stateName,
                    "num": 0
                })
        result.sort(key=lambda state: state["num"], reverse=True)
        return json.dumps({"detail": result})


class PolicyService(BaseService):
    """policy service handling requests from policy view"""

    def __init__(self):
        pass

    @staticmethod
    @app.route("/api/policy/<policy_id>")
    def get_policy_by_id(policy_id):
        """get_policy_by_id"""
        return json.dumps(PolicyDao.get_policy_by_id(policy_id))


class NetworkService(BaseService):
    """network service handling requests for network view"""

    def __init__(self):
        pass

    @staticmethod
    def get_policy_detail(policy_id):
        """get_parameterized_diffusion"""
        data_list = []
        stat = {}
        year_set = {}
        year_noshow_set = {}
        min_year = 9999
        meta_set = {"md": {}, "ci": {}, "lp": {}, "pci": {}, "pd": {}, "pop": {}}
        meta_noshow_set = {"md": {}, "ci": {}, "lp": {}, "pci": {}, "pd": {}, "pop": {}}
        meta_unadopted_set = {"md": {}, "ci": {}, "lp": {}, "pci": {}, "pd": {}, "pop": {}}
        min_meta = {"md": 9999, "ci": 9999, "lp": 9999, "pci": 9999, "pd": 9999, "pop": 9999}
        max_meta = {"md": 0, "ci": 0, "lp": 0, "pci": 0, "pd": 0, "pop": 0}
        pipe = {
            "md": "minorityDiversity",
            "ci": "citizenIdeology",
            "lp": "legislativeProfessionalism",
            "pci": "perCapitaIncome",
            "pd": "populationDensity",
            "pop": "totalPopulation"
        }
        ne_adopt_year = 9999
        ne_validity = False

        result_with_valid_data = TextQueryDao.get_states_with_validated_data(policy_id)

        for item in result_with_valid_data:
            year_set[item.stateId] = item.year
            for obj in pipe:
                meta_set[obj][item.stateId] = getattr(item, pipe[obj])
                max_meta[obj] = max(max_meta[obj], getattr(item, pipe[obj]))
                min_meta[obj] = min(min_meta[obj], getattr(item, pipe[obj]))

        result_full = CascadeDao.get_cascade_by_policy_id(policy_id)
        for item in result_full:
            if item.stateId == "NE":
                ne_adopt_year = item.adoptedYear
                ne_validity = True
            elif item.stateId not in meta_set["md"]:
                for obj in pipe:
                    meta_noshow_set[obj][item.stateId] = 0
                year_noshow_set[item.stateId] = item.adoptedYear
            if item.adoptedYear < min_year:
                min_year = item.adoptedYear
        min_year = BaseDao.helper_get_valid_year(min_year)

        meta_from_earliest_year = MetadataDao.get_metadata_by_year(min_year)
        for item in meta_from_earliest_year:
            stateId = item.stateId
            if stateId not in meta_set["md"]:
                for obj in pipe:
                    val = getattr(item, pipe[obj])
                    if stateId in meta_noshow_set["md"]:
                        meta_noshow_set[obj][stateId] = val
                    else:
                        meta_unadopted_set[obj][stateId] = val
                    max_meta[obj] = max(max_meta[obj], val)
                    min_meta[obj] = min(min_meta[obj], val)

        states = StateDao.get_all_state()

        for state in states:
            temp_object = {}
            stateId = state.stateId
            temp_object["stateId"] = stateId
            temp_object["stateName"] = state.stateName
            temp_meta_set = {}
            if stateId == "NE":
                temp_object["valid"] = ne_validity
                temp_object["dataYear"] = -1
                temp_object["adoptedYear"] = ne_adopt_year
            elif stateId in meta_unadopted_set["md"]:
                temp_object["valid"] = False if policy_id != "unselected" else True
                for obj in pipe:
                    temp_meta_set[obj] = meta_unadopted_set[obj][stateId]
                temp_object["dataYear"] = min_year
                temp_object["adoptedYear"] = 9999
            else:
                temp_object["valid"] = True
                if stateId in meta_set["md"]:
                    for obj in pipe:
                        temp_meta_set[obj] = meta_set[obj][stateId]
                    temp_object["adoptedYear"] = year_set[stateId]
                    temp_object["dataYear"] = year_set[stateId]
                else:
                    for obj in pipe:
                        temp_meta_set[obj] = meta_noshow_set[obj][stateId]
                    temp_object["adoptedYear"] = year_noshow_set[stateId]
                    temp_object["dataYear"] = min_year
            temp_object["metadata"] = temp_meta_set
            data_list.append(temp_object)
        stat["max"] = max_meta
        stat["min"] = min_meta
        return data_list, stat


    @staticmethod
    @app.route("/api/network/<policy_id>")
    def get_specified_network_by(policy_id):
        """get_specified_network_by meta_flag and policy_id"""
        data_list, stat = NetworkService.get_policy_detail(policy_id)
        data_object = {}
        for item in data_list:
            data_object[item["stateId"]] = item
        return json.dumps({"nodes": data_object, "stat": stat}, cls=DecimalEncoder)

    @staticmethod
    @app.route("/api/diffusion/<policy_id>")
    def get_specified_diffusion_by(policy_id):
        """get_specified_diffusion_by policy_id"""
        data_list, stat = NetworkService.get_policy_detail(policy_id)
        return json.dumps({"nodes": data_list, "stat": stat}, cls=DecimalEncoder)

    @staticmethod
    @app.route("/api/geo/<policy_id>")
    def get_specified_geo_by(policy_id):
        """get_specified_diffusion_by policy_id"""
        data_list, stat = NetworkService.get_policy_detail(policy_id)
        data_object = {}
        for item in data_list:
            data_object[item["stateId"]] = item
        return json.dumps({"nodes": data_object, "stat": stat}, cls=DecimalEncoder)


class ServiceUtils():
    """service utils"""
    pass
