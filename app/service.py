from decimal import Decimal
from flask import request, g, json
from app import app

from .dao import PageDao, PolicyDao, NetworkDao

page_dao = PageDao()
policy_dao = PolicyDao()
network_dao = NetworkDao()

class Service(object):
    """Base Service class"""
    def __init__(self):
        pass

    @app.before_request
    def before():
        pass

    @app.after_request
    def after(response):
        fn = g.get('fn', None)
        if fn:
            print ("Printing response", fn)
            print (response.status, fn)
            print (response.headers, fn)
            print (response.get_data(), fn)
        return response


class PageService(Service):
    """page service handling page related requests"""
    def __init__(self):
        pass

    @staticmethod
    @app.route("/api/subjects", methods=["GET"])
    def get_subject_list():
        """get all subject from database."""
        return json.dumps(page_dao.get_all_subjects())


class PolicyService(Service):
    """policy service handling requests from policy view"""
    def __init__(self):
        pass

    @staticmethod
    @app.route("/api/policy/<policy_id>")
    def get_policy_by_id(policy_id):
        """get_policy_by_id"""
        return json.dumps(policy_dao.get_policy_by_id(policy_id))

class NetworkService(Service):
    """network service handling requests for network view"""
    def __init__(self):
        pass

    @staticmethod
    @app.route("/api/network/<meta_flag>/<policy_id>")
    def get_specified_network_by(meta_flag, policy_id):
        """get_specified_network_by meta_flag and policy_id"""
        query_result = network_dao.get_parameterized_network(meta_flag, policy_id)
        return json.dumps(query_result, cls=DecimalEncoder)

class ServiceUtils():
    """service utils"""
    pass

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)
        