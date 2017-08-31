from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

from app import db

STATES = ["AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY",
          "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY",
          "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY"]


def get_state_index(state_id):
    return STATES.index(state_id)


def get_state_id(state_index):
    return STATES[state_index]


class Network(db.Model):
    """Network class"""
    __tablename__ = 'network'

    stateFromId = db.Column('state_from_id', ForeignKey('state.state_id'), primary_key=True, index=True)
    stateToId = db.Column('state_to_id', ForeignKey('state.state_id'), primary_key=True, index=True)

    def __repr__(self):
        return '<Network from %r to %r>' % (self.stateFromId, self.stateToId)


class Subject(db.Model):
    """Subject class"""
    __tablename__ = 'subject'

    subjectId = db.Column('subject_id', db.Integer, primary_key=True)
    subjectName = db.Column('subject_name', db.String(45), index=True)
    subjectValid = db.Column('subject_valid', db.Integer)

    policies = relationship("Policy", back_populates="subject")

    def __repr__(self):
        return '<Subject %r>' % self.subjectName


class State(db.Model):
    """State class"""
    __tablename__ = 'state'

    stateId = db.Column('state_id', db.String(2), primary_key=True)
    stateName = db.Column('state_name', db.String(20))
    longtitude = db.Column(db.Numeric)
    latitude = db.Column(db.Numeric)

    meta = relationship('Metadata', uselist=False, back_populates="state")

    def __repr__(self):
        return '<State %r>' % self.stateId


class RootState(db.Model):
    """RootState class: states that act as roots in a cascade."""
    __tablename__ = 'root_state'

    policyId = db.Column('policy_id', ForeignKey('policy.policy_id'), primary_key=True)
    stateId = db.Column('state_id', ForeignKey('state.state_id'), primary_key=True)

    policy = relationship('Policy', back_populates="rootStates")

    def __repr__(self):
        return '<RootState %r>' % self.rootId


class Policy(db.Model):
    """Policy class"""
    __tablename__ = 'policy'

    policyId = db.Column('policy_id', db.String(80), primary_key=True)
    policyName = db.Column('policy_name', db.String(250), index=True)
    policySubjectId = db.Column('policy_subject_id', ForeignKey('subject.subject_id'))
    policyStart = db.Column('policy_start', db.Integer)
    policyEnd = db.Column('policy_end', db.Integer)
    policyDescription = db.Column('policy_description', db.String(250))
    policyLda1 = db.Column('policy_lda_1', db.Integer)
    policyLda2 = db.Column('policy_lda_2', db.Integer)

    subject = relationship("Subject", back_populates="policies")
    cascades = relationship("Cascade", back_populates="policy")
    rootStates = relationship("RootState", back_populates="policy")
    policyText = relationship("PolicyText", back_populates="policy")

    def __repr__(self):
        return '<Policy %r: %r>' % (self.policyId, self.policyName)

    def serialize(self):
        """serialize full cascade"""
        return reduce(lambda x, y: "{}{},{},".format(x, get_state_index(y.stateId), y.adoptedYear), self.cascades,
                      "\n").rstrip(',')


class Cascade(db.Model):
    """Cascade class"""
    __tablename__ = 'cascade'

    policyId = db.Column('policy_id', db.String(80), ForeignKey('policy.policy_id'), primary_key=True)
    adoptedYear = db.Column('adopted_year', db.Integer, primary_key=True)
    stateId = db.Column('state_id', db.String(2), ForeignKey('state.state_id'), primary_key=True)

    policy = relationship("Policy", back_populates="cascades")

    def __repr__(self):
        return '<Cascade %r>' % self.policyId


class Metadata(db.Model):
    """Metadata class"""
    __tablename__ = 'metadata'

    stateId = db.Column('state_id', db.String(2), ForeignKey('state.state_id'), primary_key=True)
    stateName = db.Column('state_name', db.String(45))
    year = db.Column('year', db.Integer, primary_key=True)
    perCapitaIncome = db.Column('state_pci', db.Float)
    totalPopulation = db.Column('state_pop', db.Float)
    minorityDiversity = db.Column('state_md', db.Float)
    citizenIdeology = db.Column('state_ci', db.Float)
    legislativeProfessionalism = db.Column('state_lp', db.Float)
    populationDensity = db.Column('state_pd', db.Float)

    state = relationship("State", back_populates="meta")

    def __repr__(self):
        return '<Metadata of %r>' % self.stateName


class PolicyText(db.Model):
    """PolicyText class"""
    __tablename__ = 'policy_text'

    policyId = db.Column('policy_id', db.String(80), ForeignKey('policy.policy_id'), primary_key=True)
    url1 = db.Column('url_1', db.String(500), index=True)
    url2 = db.Column('url_2', db.String(500), index=True)
    url3 = db.Column('url_3', db.String(500), index=True)
    url4 = db.Column('url_4', db.String(500), index=True)
    url5 = db.Column('url_5', db.String(500), index=True)
    text1 = db.Column('text_1', db.String(500), index=True)
    text2 = db.Column('text_2', db.String(500), index=True)
    text3 = db.Column('text_3', db.String(500), index=True)
    text4 = db.Column('text_4', db.String(500), index=True)
    text5 = db.Column('text_5', db.String(500), index=True)

    policy = relationship("Policy", back_populates="policyText")

    def __repr__(self):
        return '<PolicyText of %r>' % self.policyId

    def serialize(self):
        """serialize policy text"""
        return [{"url": self.url1, "text": self.text1},
                {"url": self.url2, "text": self.text2},
                {"url": self.url3, "text": self.text3},
                {"url": self.url4, "text": self.text4},
                {"url": self.url5, "text": self.text5}]


class PolicySimilarity(db.Model):
    """PolicySimilarity class"""
    __tablename__ = 'policy_similarity'

    policyId1 = db.Column('policy_id_1', db.String(80), ForeignKey('policy.policy_id'), primary_key=True)
    policyId2 = db.Column('policy_id_2', db.String(80), ForeignKey('policy.policy_id'), primary_key=True)
    policyTextSimilarity = db.Column('policy_text_similarity', db.Float)
    policyCascadeSimilarity = db.Column('policy_cascade_similarity', db.Float)

    def __repr__(self):
        return '<PolicySimilarity of %r and %r>' % (self.policyId1, self.policyId2)


class NetinfNetwork:
    edges = []
    norm_edges = []
    max_margin = 0
    min_margin = 0

    def __init__(self, network_text=""):
        if network_text is not "":
            """
            < src > 
            < dst > 
            < number_trees > 
            < marginal_gain > 
            < median_timediff > 
            < av_timediff >
            """
            self.edges = [tuple(x.split("/")) for x in network_text.split("\n")]
            # self.update_range(self.edges)

    def update_range(self, edges):
        self.max_margin = map(max, zip(*self.edges))[3]
        self.min_margin = map(min, zip(*self.edges))[3]

    def normalize(self):
        diff = self.max_margin - self.min_margin
        self.norm_edges = [tuple(x[0], x[1], x[2], (x[3] - self.min_margin) / diff, x[4], x[5]) for x in self.edges]
        return self.norm_edges

    def get_network_object(self):
        try:
            network_object = [{"source": x[0], "target": x[1], "value": round(float(x[3]), 2)} for x in self.edges]
        except IndexError:
            network_object = []
        return network_object
