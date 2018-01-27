import os
from decimal import Decimal
from flask import json


class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)


def rel_path(filename):
    """Return the path of this filename relative to the current script"""
    return os.path.join(os.getcwd(), os.path.dirname(__file__), filename)
