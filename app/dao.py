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
        subjectList = []
        for s in subjects:
            subjectList.append(s.subjectName)
        return subjectList

    def get_all_policies(self):
        policies = Policy.query.all()
        policyList = []
        policyPipe = {}
        for p in policies:
            policyList.append(p.policyId)
        return policyList


class PolicyDao(BaseDao):
    """policy dao providing policy related data"""
    def get_policy_by_id(self, policyId):
        policy = {}
        detail = {}
        result = Policy.query.filter(Policy.policyId == policyId).first()
        cascades = result.cascades
        for item in cascades:
            detail.setdefault(item.adoptedYear, []).append(item.stateId)
        policy["policyId"] = result.policyId
        policy["policyName"] = result.policyName
        policy["policyStart"] = result.policyStart
        policy["policyEnd"] = result.policyEnd
        policy["detail"] = detail
        return policy