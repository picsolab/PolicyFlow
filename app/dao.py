from app import db, models
from app.models import Subject, Policy

class PageDao:

    def get_subject_list(self):
        subjects = db.Subject.query.all()
