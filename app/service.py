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
        return json.dumps(page_dao.get_all_subjects())


class PolicyService(Service):
    """policy service handling requests from policy view"""
    def __init__(self):
        pass

    @staticmethod
    @app.route("/api/policy/<policyId>")
    def get_policy_by_id(policyId):
        return json.dumps(policy_dao.get_policy_by_id(policyId))