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

    policy2 = engine.execute("""select p.policy_name, p.policy_id, c.adopted_year, c.state_id
                                        from `policy` as p, `cascade` as c
                                        where p.policy_id=c.policy_id and c.policy_id = %s""", (policy_id2,))

    seq1 = [policy_info1[3] for policy_info1 in policy1]
    seq2 = [policy_info2[3] for policy_info2 in policy2]
    seq1_numeric_rank = []
    seq2_numeric_rank = []

    common_eles = set(seq1).intersection(seq2)
    print(common_eles)
    if common_eles: # if common element exists
        common_eles1 = [state for state in seq1 if state in seq2]
        common_eles2 = [state for state in seq2 if state in seq1]
        union_eles = list(set().union(seq1, seq2))

        jaccard_score = len(common_eles) / len(union_eles)

        if len(common_eles) == 1:  # if there is only one common element, just give zero score
            kendall_score = -1
        else:   # More than two common elements, then calculate kendall score
            state_to_rank = { key:value for key, value in zip(range(len(common_eles)), common_eles) }

            for state_in_seq in common_eles1:
                for rank, state in state_to_rank.items():
                    if state == state_in_seq:
                        seq1_numeric_rank.append(rank)

            for state_in_seq in common_eles2:
                for rank, state in state_to_rank.items():
                    if state == state_in_seq:
                        seq2_numeric_rank.append(rank)

            tau, p_value = stats.kendalltau(seq1_numeric_rank, seq2_numeric_rank)
            kendall_score = tau

        kendall_score = abs((kendall_score + 1) / 2) # normalize to 0-1 scale
        similarity_score = float(round(jaccard_score * kendall_score, 2))
        print(jaccard_score, kendall_score)

    else: # no common element
        similarity_score = 0

    print(similarity_score)
    engine.execute("""update policy_similarity set policy_cascade_similarity = %s where policy_id_1 = %s and policy_id_2 = %s""", (similarity_score, policy_id1, policy_id2))


