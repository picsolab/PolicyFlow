from flask import request, g, json
from app import app

import random

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
        subjects = SubjectDao.get_all_valid_subjects()
        policies = PolicyDao.get_policy_id_name_subject()
        for subject in subjects:
            subject_pipe[subject.subjectId] = subject.subjectName
        for policy in policies:
            if policy.policySubjectId in subject_pipe:
                policy_set.setdefault(subject_pipe[policy.policySubjectId], []).append(policy.policyId)
                policy_pipe[policy.policyId] = policy.policyName
        all_policies = reduce(lambda x, y: x + y, map(lambda z: policy_set[z], policy_set), [])
        output["policies"] = policy_set
        output["pipe"] = policy_pipe
        output["all"] = sorted(all_policies)
        return json.dumps(output)

    @staticmethod
    @app.route("/api/cluster/<cluster_method>", methods=["GET"])
    def get_cluster_based_on_cluster_method(cluster_method):
        """get cluster"""
        output = {"name": cluster_method}
        if cluster_method == "subject":
            subjects = SubjectDao.get_all_valid_subjects()
            children = [{"name": s.subjectName, "id": s.subjectId, "valid": s.subjectValid, "size": len(s.policies)}
                        for s in subjects]
            output["children"] = children
            output["size"] = reduce(lambda x, y: x + y["size"], children, 0)
        elif cluster_method == "text":
            reduced_policy = {}
            policies = PolicyDao.get_policy_per_lda_cluster()
            for policy in policies:
                reduced_policy.setdefault(policy[0], []).append({"name": policy[1], "size": policy[2]})
            output["children"] = reduce(lambda x, y: x + [{"name": y, "children": reduced_policy[y],
                                                           "size": reduce(lambda a, b: a + b["size"], reduced_policy[y],
                                                                          0)}], reduced_policy, [])
            output["size"] = reduce(lambda x, y: x + y["size"], output["children"], 0)
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
        query_result = StateDao.get_root_count_list_for(subject_id)
        root_states = {}
        for item in query_result:
            temp_object = {"state_id": item.stateId, "state_name": item.stateName, "num": item.rootCount}
            root_states[item.stateId] = temp_object
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
        output = {}
        detail = {}
        result = PolicyDao.get_policy_by_id(policy_id)
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
        return json.dumps(output)

    @staticmethod
    @app.route("/api/policies/")
    def get_policies_by_params():
        args = request.args
        method = args['method']
        param = args['param']
        start_year = int(args['start_year']) if args['start_year'] is not None else PolicyDao.START_YEAR
        end_year = int(args['end_year']) if int(args['end_year']) is not None else PolicyDao.END_YEAR
        policies = None
        policy_dao = PolicyDao(start_year=start_year, end_year=end_year)
        if method == 'subject':
            params = param.split("-")
            if len(params) == 1:
                policies = policy_dao.get_all_policies_with_valid_subject()
                if policies is not None:
                    return json.dumps({"policies": [
                        {"policy_id": p[0].policyId, "policy_name": p[0].policyName, "relevance": random.uniform(0, 1)}
                        for p in policies]})
            else:
                policies = policy_dao.get_policies_by_subject(int(params[1]))
        elif method == 'cluster':
            policies = policy_dao.get_policies_by_cluster(int(param))
        elif method == 'state':
            policies = policy_dao.get_policies_by_state_as_root(int(param))
        elif method == 'word':
            policies = policy_dao.get_policies_by_word_match(param)
        elif method == 'text':
            params = param.split("-")
            if len(params) == 1:
                policies = policy_dao.get_all_policies()
            else:
                policies = policy_dao.get_policies_by_text_similarity(params)

        if policies is not None:
            return json.dumps({"policies": [
                {"policy_id": p.policyId, "policy_name": p.policyName, "relevance": random.uniform(0, 1)}
                for p in policies]})

        return json.dumps({})


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
    @app.route("/api/network/")
    def get_network_by_params():
        args = request.args
        method = args['method']
        param = args['param']
        iters = int(args['iters'])
        start_year = int(args['start_year']) if args['start_year'] is not None else PolicyDao.START_YEAR
        end_year = int(args['end_year']) if int(args['end_year']) is not None else PolicyDao.END_YEAR
        policies = None
        cascade_text = ""
        policy_dao = PolicyDao(start_year=start_year, end_year=end_year)
        if method == 'subject':
            params = param.split("-")
            if len(params) == 1:
                policies = policy_dao.get_all_policies_with_valid_subject()
                if policies is not None:
                    cascade_text = reduce(lambda x, y: x + y[0].serialize(), policies, "")
            else:
                policies = policy_dao.get_policies_by_subject(params[1])
                if policies is not None:
                    cascade_text = reduce(lambda x, y: x + y.serialize(), policies, "")
        elif method == 'cluster':
            policies = policy_dao.get_policies_by_cluster(int(param))
        elif method == 'state':
            policies = policy_dao.get_policies_by_state_as_root(int(param))
        elif method == 'word':
            policies = policy_dao.get_policies_by_word_match(param)
        elif method == 'text':
            params = param.split("-")
            if len(params) == 1:
                policies = policy_dao.get_all_policies()
            else:
                policies = policy_dao.get_policies_by_text_similarity(params)
            if policies is not None:
                cascade_text = reduce(lambda x, y: x + y.serialize(), policies, "")

        if cascade_text is not "":
            return json.dumps(computing_service.get_network_by(cascade_text, iters=iters), cls=DecimalEncoder)
        else:
            pass

        return json.dumps({})

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


class ServiceUtils:
    """service utils"""

    def __init__(self):
        pass
