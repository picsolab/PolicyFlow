from flask import request, g, json
from app import app

from .helper import DecimalEncoder
from .base_service import BaseService
from ..dao import PageDao, PolicyDao, NetworkDao, StateDao, DiffusionDao

page_dao = PageDao()
policy_dao = PolicyDao()
network_dao = NetworkDao()
state_dao = StateDao()
diffusion_dao = DiffusionDao()


class PageService(BaseService):
    """page service handling page related requests"""

    def __init__(self):
        pass

    @staticmethod
    @app.route("/api/subjects/", methods=["GET"])
    def get_subject_list():
        """get all subject from database."""
        return json.dumps(page_dao.get_all_policies())


class StateService(BaseService):
    """state service handling requests from bar chart"""

    def __init__(self):
        pass

    @staticmethod
    @app.route("/api/root/<subject_id>", methods=["GET"])
    def get_root_count(subject_id):
        """get all subject from database."""
        result = []
        state_pipe = state_dao.get_state_id_names()
        root_states = state_dao.get_root_count_list_for(subject_id)
        for state in state_pipe:
            if (root_states.has_key(state.stateId)):
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
        return json.dumps(policy_dao.get_policy_by_id(policy_id))


class NetworkService(BaseService):
    """network service handling requests for network view"""

    def __init__(self):
        pass

    @staticmethod
    @app.route("/api/network/<policy_id>")
    def get_specified_network_by(policy_id):
        """get_specified_network_by meta_flag and policy_id"""
        data_list, stat = diffusion_dao.get_parameterized_diffusion(policy_id)
        data_object = {}
        for item in data_list:
            data_object[item["stateId"]] = item
        return json.dumps({"nodes": data_object, "stat": stat}, cls=DecimalEncoder)

    @staticmethod
    @app.route("/api/diffusion/<policy_id>")
    def get_specified_diffusion_by(policy_id):
        """get_specified_diffusion_by policy_id"""
        data_list, stat = diffusion_dao.get_parameterized_diffusion(policy_id)
        return json.dumps({"nodes": data_list, "stat": stat}, cls=DecimalEncoder)

    @staticmethod
    @app.route("/api/geo/<policy_id>")
    def get_specified_geo_by(policy_id):
        """get_specified_diffusion_by policy_id"""
        data_list, stat = diffusion_dao.get_parameterized_diffusion(policy_id)
        data_object = {}
        for item in data_list:
            data_object[item["stateId"]] = item
        return json.dumps({"nodes": data_object, "stat": stat}, cls=DecimalEncoder)


class ServiceUtils():
    """service utils"""
    pass
