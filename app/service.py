from flask import request, g, json
from app import app

from .dao import PageDao, PolicyDao

page_dao = PageDao()
policy_dao = PolicyDao()

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
        subject_list = page_dao.get_all_subjects()
        g.fn = json.dumps(subject_list)
        print ("Request headers", request.headers, g.fn)
        return json.dumps(subject_list)

    @staticmethod
    @app.route("/api/policies", methods=["GET"])
    def get_policy_list():
        """get all policies and map from policyId to policyName from database."""
        policies = page_dao.get_all_policies()
        return json.dumps(policies)


class PolicyService(Service):
    """policy service handling requests from policy view"""
    def __init(self):
        pass

    @staticmethod
    @app.route("/api/policy/<policyId>")
    def get_policy_by_id(policyId):
        policyObj = policy_dao.get_policy_by_id(policyId)
        return json.dumps(policyObj)