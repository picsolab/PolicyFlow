from flask import request, g, json
from app import app

class BaseService(object):
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

    @staticmethod
    @app.route("/api/success/", methods=["GET"])
    def get_success():
        """get all subject from database."""
        return json.dumps({})