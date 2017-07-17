#!app/env/bin/python
import json, os, random
from argparse import ArgumentParser
from helper import rel_path

state_list = ["AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY",
              "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY",
              "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY"]
edges = [{"source": 36, "target": 1}, {"source": 4, "target": 2}, {"source": 36, "target": 3},
         {"source": 22, "target": 4}, {"source": 46, "target": 5}, {"source": 33, "target": 6},
         {"source": 6, "target": 7}, {"source": 4, "target": 8}, {"source": 4, "target": 9},
         {"source": 6, "target": 11}, {"source": 30, "target": 12}, {"source": 4, "target": 13},
         {"source": 13, "target": 14}, {"source": 4, "target": 15}, {"source": 36, "target": 16},
         {"source": 5, "target": 17}, {"source": 6, "target": 18}, {"source": 4, "target": 19},
         {"source": 4, "target": 20}, {"source": 33, "target": 21}, {"source": 33, "target": 22},
         {"source": 4, "target": 23}, {"source": 8, "target": 24}, {"source": 4, "target": 25},
         {"source": 4, "target": 26}, {"source": 4, "target": 27}, {"source": 4, "target": 28},
         {"source": 6, "target": 29}, {"source": 6, "target": 30}, {"source": 4, "target": 31},
         {"source": 4, "target": 32}, {"source": 6, "target": 33}, {"source": 4, "target": 34},
         {"source": 36, "target": 35}, {"source": 4, "target": 36}, {"source": 33, "target": 36},
         {"source": 33, "target": 37}, {"source": 30, "target": 38}, {"source": 17, "target": 39},
         {"source": 46, "target": 40}, {"source": 13, "target": 41}, {"source": 44, "target": 42},
         {"source": 46, "target": 43}, {"source": 13, "target": 44}, {"source": 26, "target": 44},
         {"source": 6, "target": 45}, {"source": 4, "target": 46}, {"source": 18, "target": 47},
         {"source": 5, "target": 49}, {"source": 5, "target": 49}]


def convert_edges():
    edges_in_state_ids = [{"source": state_list[edge["source"]], "target": state_list[edge["target"]]} for edge in edges]
    print edges_in_state_ids


def convert_centralities(_is_simulating):
    if _is_simulating == "n":
        _is_simulating = False
    else:
        _is_simulating = True

    with open(rel_path('../raw/raw_centralities.json'), 'r') as raw_centralities, \
            open(rel_path('../out/centralities_by_state.json'), 'w') as output_file:
        centralities = json.load(raw_centralities)
        output = {"centralities": {}, "stat": {}}
        max_cen = {"outdegree": 0, "pageRank": 0, "betweenness": 0, "hit": 0, "close": 0}
        min_cen = {"outdegree": 9999, "pageRank": 9999, "betweenness": 9999, "hit": 9999, "close": 9999}
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


if __name__ == '__main__':
    parser = ArgumentParser(description='converters.')
    parser.add_argument('--operation', '-o', help='specify operation to perform.', required=True)
    parser.add_argument('--simulating', '-s', help='is simulating', required=False)
    args = parser.parse_args()
    operation = str(args.operation)

    if operation == "c":
        """convert centralities"""
        convert_centralities(str(args.simulating))
    elif operation == "e":
        """convert edges from index to state ids"""
        convert_edges()
