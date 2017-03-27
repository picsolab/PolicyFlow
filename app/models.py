from app import db
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Float, ForeignKey

class Policy(db.Model):
    __tablename__ = 'policy'

    policyId = db.Column('policy_id', db.String(45), primary_key=True)
    policyName = db.Column('policy_name', db.String(120), index=True)
    policySubjectId = db.Column('policy_subject_id', ForeignKey('subject.subject_id'))
    policyStart = db.Column('policy_start', db.Integer)
    policyEnd = db.Column('policy_end', db.Integer)

    def __repr__(self):
        return '<Policy %r: %r>' % (self.policyId, self.policyName)

class Subject(db.Model):
    __tablename__ = 'subject'

    subjectId = db.Column('subject_id', db.Integer, primary_key=True)
    subjectName = db.Column('subject_name', db.String(45), index=True)

    def __repr__(self):
        return '<Subject %r>' % (self.subjectName)


class Network(db.Model):
    __tablename__ = 'network'

    stateFromId = db.Column('state_from_id', db.String(2), primary_key=True, index=True)
    stateToId = db.Column('state_to_id', db.String(2), primary_key=True, index=True)

    def __repr__(self):
        return '<Network from %r to %r>' % (self.stateFromId, self.stateToId)

class Metadata(db.Model):
    __tablename__ = 'metadata'

    stateId = db.Column('state_id', db.Integer, primary_key=True)
    stateName = db.Column('state_name', db.String(45))
    stateYear = db.Column('year', db.String(4))
    statePerCapitaIncome = db.Column('state_pci', db.Float)
    statePopulation = db.Column('state_pop', db.Float)
    stateMinorityDiversity = db.Column('state_md', db.Float)
    stateCitizenIdeology = db.Column('state_ci', db.Float)
    stateLegislativeProfessionalism = db.Column('state_lp', db.Float)

    def __repr__(self):
        return '<Metadata of %r>' % (self.stateName)