import json, os, random
from argparse import ArgumentParser

parser = ArgumentParser(description='Converting raw centralities.')
parser.add_argument('--simulating', '-s',help='is simulating', required=False)
args = parser.parse_args()
_is_simulating = str(args.simulating)

if _is_simulating == "y":
    _is_simulating = True
else:
    _is_simulating = False

def rel_path(filename):
	"""Return the path of this filename relative to the current script
	"""
	return os.path.join(os.getcwd(), os.path.dirname(__file__), filename)

with open(rel_path('../raw/raw_centralities.json'), 'r') as raw_centralities, \
        open(rel_path('../out/centralities_by_state.json'), 'w') as output_file:
    centralities = json.load(raw_centralities)
    output = {"centralities":{}, "stat":{}}
    max_cen = {"outdegree": 0, "pageRank": 0, "betweenness": 0,"hit": 0,"close":0 }
    min_cen = {"outdegree": 9999, "pageRank": 9999, "betweenness": 9999, "hit": 9999, "close":9999}
    for state_id in centralities["outdegree"].keys():
        temp_centrality_obj = {}
        for centrality_type in ["outdegree", "pageRank", "betweenness", "hit", "close"]:
            curr_val = 0
            if _is_simulating:
                curr_val = round(random.uniform(0, 20), 2)
            else:
                curr_val = centralities[centrality_type][state_id]
            temp_centrality_obj[centrality_type] = curr_val
            max_cen[centrality_type] = max(max_cen[centrality_type], curr_val)
            min_cen[centrality_type] = min(min_cen[centrality_type], curr_val)
        output["centralities"][state_id] = temp_centrality_obj
    output["stat"]["min"] = min_cen
    output["stat"]["max"] = max_cen
    json.dump(output, output_file)

