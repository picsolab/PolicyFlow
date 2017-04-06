from app import db
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Float, ForeignKey

class Network(db.Model):
    """Network class"""
    __tablename__ = 'network'

    stateFromId = db.Column('state_from_id', db.String(2), primary_key=True, index=True)
    stateToId = db.Column('state_to_id', db.String(2), primary_key=True, index=True)

    def __repr__(self):
        return '<Network from %r to %r>' % (self.stateFromId, self.stateToId)

class Subject(db.Model):
    """Subject class"""
    __tablename__ = 'subject'

    subjectId = db.Column('subject_id', db.Integer, primary_key=True)
    subjectName = db.Column('subject_name', db.String(45), index=True)

    policies = relationship("Policy", back_populates="subject")

    def __repr__(self):
        return '<Subject %r>' % (self.subjectName)

class State(db.Model):
    """State class"""
    __tablename__ = 'state'

    stateId = db.Column('state_id', db.String(2), primary_key=True)
    stateName = db.Column('state_name', db.String(20))
    longtitude = db.Column(db.Numeric)
    latitude = db.Column(db.Numeric)

    meta = relationship('Metadata', uselist=False, back_populates="state")

    def __repr__(self):
        return '<State %r>' % (self.stateId)

class RootState(db.Model):
    """RootState class: states that act as roots in a cascade."""
    __tablename__ = 'root_state'

    policyId = db.Column('policy_id', ForeignKey('policy.policy_id'), primary_key=True)
    stateId = db.Column('state_id', ForeignKey('state.state_id'), primary_key=True)

    policy = relationship('Policy', back_populates="rootStates")

    def __repr__(self):
        return '<RootState %r>' % (self.rootId)

class Policy(db.Model):
    """Policy class"""
    __tablename__ = 'policy'

    policyId = db.Column('policy_id', db.String(45), primary_key=True)
    policyName = db.Column('policy_name', db.String(150), index=True)
    policySubjectId = db.Column('policy_subject_id', ForeignKey('subject.subject_id'))
    policyStart = db.Column('policy_start', db.Integer)
    policyEnd = db.Column('policy_end', db.Integer)

    subject = relationship("Subject", back_populates="policies")
    cascades = relationship("Cascade", back_populates="policy")
    rootStates = relationship("RootState", back_populates="policy")

    def __repr__(self):
        return '<Policy %r: %r>' % (self.policyId, self.policyName)

class Cascade(db.Model):
    """Cascade class"""
    __tablename__ = 'cascade'

    policyId = db.Column('policy_id', db.String(45), ForeignKey('policy.policy_id'), primary_key=True)
    adoptedYear = db.Column('adopted_year', db.Integer, primary_key=True)
    stateId = db.Column('state_id', db.String(2), ForeignKey('state.state_id'), primary_key=True)

    policy = relationship("Policy", back_populates="cascades")

    def __repr__(self):
        return '<Cascade %r>' % (self.policyId)

class Metadata(db.Model):
    """Metadata class"""
    __tablename__ = 'metadata'

    stateId = db.Column('state_id', db.String(2), ForeignKey('state.state_id'), primary_key=True)
    stateName = db.Column('state_name', db.String(45))
    stateYear = db.Column('year', db.Integer, primary_key=True)
    statePerCapitaIncome = db.Column('state_pci', db.Float)
    statePopulation = db.Column('state_pop', db.Float)
    stateMinorityDiversity = db.Column('state_md', db.Float)
    stateCitizenIdeology = db.Column('state_ci', db.Float)
    stateLegislativeProfessionalism = db.Column('state_lp', db.Float)
    statePopulationDensity = db.Column('state_pd', db.Float)

    state = relationship("State", back_populates="meta")

    def __repr__(self):
        return '<Metadata of %r>' % (self.stateName)
        