from app import db, models
from .models import Subject, Policy

class BaseDao:
    """Base Data Access Object class"""
    def __init__(self):
        pass

class PageDao(BaseDao):
    """page dao providing page related data"""
    def get_all_subjects(self):
        subjects = Subject.query.all()
        output = {}
        policies = {}
        pipe = {}
        for s in subjects:
            for p in s.policies:
                policies.setdefault(s.subjectName, []).append(p.policyId)
                pipe[p.policyId] = p.policyName
        output["policies"] = policies
        output["pipe"] = pipe
        return output


class PolicyDao(BaseDao):
    """policy dao providing policy related data"""
    def get_policy_by_id(self, policyId):
        output = {}
        detail = {}
        result = Policy.query.filter(Policy.policyId == policyId).first()
        cascades = result.cascades
        for item in cascades:
            detail.setdefault(item.adoptedYear, []).append(item.stateId)
        years = detail.keys()
        output["policyId"] = result.policyId
        output["policyName"] = result.policyName
        output["policyStart"] = min(years)
        output["policyEnd"] = max(years)
        output["detail"] = detail
        return output