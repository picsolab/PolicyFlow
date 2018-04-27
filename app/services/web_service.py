from collections import Counter
from flask import request, g, json, jsonify
from app import app

import random
import sys
import json
import numpy as np

from ..services.helper import rel_path
from .helper import DecimalEncoder
from .base_service import BaseService
from .computing_service import ComputingService
from ..models import get_state_index
from ..dao import BaseDao, SubjectDao, PolicyDao, TextQueryDao, StateDao, CascadeDao, MetadataDao, PolicyTextDao, \
    PolicySimilarityDao
from operator import itemgetter

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
        policy_set = {}
        policy_pipe = {}
        subject_pipe = SubjectService.get_valid_subject_pipe()
        policies = PolicyDao.get_policy_id_name_subject()
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
        children = []
        if cluster_method == "subject":
            subjects = SubjectDao.get_all_valid_subjects()
            children = [{"name": s.subjectName, "id": s.subjectId, "valid": s.subjectValid, "size": len(s.policies)}
                        for s in subjects]
        elif cluster_method == "text":
            reduced_policy = {}
            policies = PolicyDao.get_policy_per_lda_cluster()
            children = [{"name": p.policyLda1, "size": p.policyCount} for p in policies]
        output["children"] = children
        output["size"] = reduce(lambda x, y: x + y["size"], children, 0)
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
    def parse_args(args):
        method = args['method']
        param = args['param']
        start_year = int(args['start_year']) if args['start_year'] is not None else PolicyDao.START_YEAR
        end_year = int(args['end_year']) if int(args['end_year']) is not None else PolicyDao.END_YEAR
        return method, param, start_year, end_year

    @staticmethod
    def get_policy_id_list_n_set():
        global subject_pipe
        policies = PolicyDao.get_policy_id_name_subject()
        policy_ids_list = []
        policy_ids_dict = {}
        for index, policy in enumerate(policies):
            policy_ids_list.append({
                "index": index,
                "policyId": policy.policyId,
                "policyName": policy.policyName,
                "policySubject": subject_pipe[policy.policySubjectId]
            })
            policy_ids_dict[policy.policyId] = index
        return policy_ids_list, policy_ids_dict

    @staticmethod
    def get_q_policy_group(method, param, start_year, end_year):
        policy_dao = PolicyDao(start_year=start_year, end_year=end_year)
        if method == 'subject':
            params = param.split("-")
            if len(params) == 1:
                return policy_dao.get_q_all_policies_with_valid_subject()
            else:
                return policy_dao.get_q_policies_by_subject(int(params[1]))
        elif method == 'text':
            params = param.split("-")
            if len(params) == 1:
                return policy_dao.get_q_all_policies_with_valid_cluster_count()
            else:
                return policy_dao.get_q_policies_by_text_similarity(params)
        return None

    @staticmethod
    def get_policy_group(method, param, start_year, end_year):
        return PolicyService.get_q_policy_group(method, param, start_year, end_year).all()

    @staticmethod
    def get_annual_adoption_count_list_in_group_specified_by(method, param):
        policies = PolicyService.get_q_policy_group(method, param, 0, 9999).all()
        year_list = list()
        for policy in policies:
            year_list.extend([cascade.adoptedYear for cascade in policy.cascades])
        count_by_year = Counter(year_list)
        return count_by_year

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
        output["policyStart"] = None if len(years) == 0 else min(years)
        output["policyEnd"] = None if len(years) == 0 else max(years)
        output["detail"] = detail
        output["message"] = "success"
        return json.dumps(output)

    @staticmethod
    @app.route("/api/policies/")
    def get_policies_by_params():
        global policy_contains_full_text_set
        method, param, start_year, end_year = PolicyService.parse_args(request.args)
        policies = PolicyService.get_policy_group(method, param, start_year, end_year)

        if policies is not None:
            return json.dumps({"policies": [{
                "policy_id": p.policyId,
                "policy_name": p.policyName,
                "subject": p.subject.subjectName,
                "policy_start": p.policyStart,
                "policy_end": p.policyEnd,
                "adoption_count": len(p.cascades),
                "has_full_text": p.policyId in policy_contains_full_text_set}
                for p in policies]})

        return json.dumps({})

    @staticmethod
    @app.route("/api/policy/detail/")
    def get_policy_detail():
        args = request.args
        policy_id = args['policy']
        output = {}
        if policy_id == "unselected":
            return json.dumps(output)

        method, param, start_year, end_year = PolicyService.parse_args(args);
        policy_dao = PolicyDao(start_year=start_year, end_year=end_year)
        policy_db_obj = PolicyDao.get_policy_by_id(policy_id)
        output["snippets"] = PolicyTextDao.get_policy_text_by_policy_id(policy_id).serialize()
        output["policy_id"] = policy_db_obj.policyId
        output["policy_name"] = policy_db_obj.policyName
        output["subject"] = policy_db_obj.subject.subjectName

        q_policies = PolicyService.get_q_policy_group(method, param, start_year, end_year)
        text_top, cascade_top = policy_dao.get_top_similar_policies(q_policies, policy_id, 5)
        text_similarities = [{
            "policy_id": item.policyId2,
            "policy_name": item.policyName,
            "policy_text_similarity": item.policyTextSimilarity}
            for item in text_top]
        cascade_similarities = [{
            "policy_id": item.policyId2,
            "policy_name": item.policyName,
            "policy_cascade_similarity": item.policyCascadeSimilarity}
            for item in cascade_top]
        output["text_similarities"] = text_similarities
        output["cascade_similarities"] = cascade_similarities
        return json.dumps(output, cls=DecimalEncoder)

    @staticmethod
    @app.route("/api/policy/network/")
    def get_policy_network():
        global policy_id_list, text_similarity_list, cascade_similarity_list
        return json.dumps({
            "policies": policy_id_list,
            "text_similarities": text_similarity_list,
            "cascade_similarities": cascade_similarity_list},
            cls=DecimalEncoder)

    @staticmethod
    @app.route("/api/policy/trend/<method>/<param>")
    def get_annual_adoption_list(method, param):
        output = dict()
        annual_list = PolicyService.get_annual_adoption_count_list_in_group_specified_by(method, param)
        output["list"] = [{"year": k, "count": v} for k, v in annual_list.iteritems()]
        return json.dumps(output)


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
            temp_object["stateIndex"] = get_state_index(stateId)
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
        iters = int(args['iters'])
        method, param, start_year, end_year = PolicyService.parse_args(args)
        policies = PolicyService.get_policy_group(method, param, start_year, end_year)
        network = []

        if policies is not None:
            cascade_text = reduce(lambda x, y: x + y.serialize(), policies, "")
            network = computing_service.get_network_by(cascade_text, iters=iters)
    
        return json.dumps(network, cls=DecimalEncoder)

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
    @app.route("/api/diffusion2/<policy_id>")
    def get_specified_diffusion2_by(policy_id):
        """get_specified_diffusion2_by policy_id"""
        # return a sample json file
        data_list, stat = NetworkService.get_policy_detail(policy_id)
        #sample_file_path = rel_path("../resource/ex-policy-diffusion.json")

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

class PolicyPlotService(BaseService):
    @staticmethod
    @app.route("/api/plot/")
    def get_policy_metadata():
        policies = PolicyDao.get_all_policies()
        policy_list = []

        for policy in policies:
            policy_dict = {
                #"policy_id": policy.polidyId,
                "policy_name": policy.policyName,
                "policy_subject_id": policy.policySubjectId,
                "policy_start": policy.policyStart,
                "policy_end": policy.policyEnd,
                "policy_lda": policy.policyLda1
            }
            policy_list.append(policy_dict)

        return json.dumps(policy_list, cls=DecimalEncoder)

class PolicySimilarityService(BaseService):
    @staticmethod
    def get_similarity_matrices():
        global policy_count
        text_similarities = [[None] * policy_count for i in range(policy_count)]
        cascade_similarities = [[None] * policy_count for i in range(policy_count)]
        similarities = PolicySimilarityDao.get_all_similarities()
        for similarity in similarities:
            index1 = policy_id_dict[similarity.policyId1]
            index2 = policy_id_dict[similarity.policyId2]
            text_similarities[index1][index2] = similarity.policyTextSimilarity
            cascade_similarities[index1][index2] = similarity.policyCascadeSimilarity
        for i in range(policy_count):
            text_similarities[i][i] = 1
            cascade_similarities[i][i] = 1
        return text_similarities, cascade_similarities

class PolicyCorrelationService(BaseService):
    @staticmethod
    @app.route("/api/policy/correlation/<policy_id>")
    def get_correlations(policy_id):
        data_list, stat = NetworkService.get_policy_detail(policy_id)
        print("data_list: ", data_list)
        print("request.args: ", request.args)

        corr_scores_dict = {}
        nodes = data_list
        for attr in ["md", "pi", "cd", "pop", "pci", "lp"]:
            # Prepare metadata ranking
            state_attr_dict = {}
            for stateInfo in nodes:
                stateId = stateInfo["stateId"]
                state_attr_dict[stateId] = stateInfo["metadata"][attr]  # Add { state: attr } item
            # Rank metadata (socio-economic status)    
            sorted_state_attr_dict = sorted(state_attr_dict.items(), key=itemgetter(1))
            metadata_state_ranking = sorted_state_attr_dict.keys()

        # Rank attribute (influence)

        return json.dumps({"nodes": data_list, "stat": stat}, cls=DecimalEncoder)


class PolicyTextService(BaseService):
    @staticmethod
    def get_policy_contain_full_text():
        policy_set = set()
        policies = PolicyTextDao.get_policy_with_full_text()
        for policy in policies:
            policy_set.add(policy.policyId)
        return policy_set

class SubjectService(BaseService):
    @staticmethod
    def get_valid_subject_pipe():
        subject_dict = {}
        subjects = SubjectDao.get_all_valid_subjects()
        for subject in subjects:
            subject_dict[subject.subjectId] = subject.subjectName
        return subject_dict

    @staticmethod
    def get_subject_pipe():
        subject_dict = {}
        subjects = SubjectDao.get_all_subjects()
        for subject in subjects:
            subject_dict[subject.subjectId] = subject.subjectName
        return subject_dict


class ServiceUtils:
    """service utils"""

    def __init__(self):
        pass


def __init__():
    """init globals, do not change order"""
    global subject_pipe
    subject_pipe = SubjectService.get_subject_pipe()

    global policy_id_list, policy_id_dict, policy_count
    policy_id_list, policy_id_dict = PolicyService.get_policy_id_list_n_set()
    policy_count = len(policy_id_dict)

    global text_similarity_list, cascade_similarity_list
    text_similarity_list, cascade_similarity_list = PolicySimilarityService.get_similarity_matrices()

    global policy_contains_full_text_set
    policy_contains_full_text_set = PolicyTextService.get_policy_contain_full_text()


__init__()
