import sqlalchemy
import csv
import scipy.stats as stats

engine = sqlalchemy.create_engine(
    "mysql+pymysql://root:mcom7573@localhost:3306/diffusion2017vis"
)

conn = engine.connect()


result1 = engine.execute("""select * from policy_similarity;""")

for idx, row in enumerate(result1):
    policy_id1 = row[0]
    policy_id2 = row[1]
    print(policy_id1, policy_id2)

    policy1 = engine.execute("""select p.policy_name, p.policy_id, c.adopted_year, c.state_id
                                from `policy` as p, `cascade` as c
                                where p.policy_id=c.policy_id and c.policy_id = %s""", (policy_id1,))

    seq1 = [policy_info1[3] for policy_info1 in policy1]

    print(seq1)