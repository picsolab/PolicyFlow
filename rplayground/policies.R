library(NetworkInference)
# Load the `policies` dataset (?policies for details).
data(policies)
state_names <- rownames(policies)
policies[1:7, 1:3]

# transform dataframe to cascate object
policy_cascades <- as.cascade(policies, node_names = state_names)
names(policy_cascades)

policy_cascades$cascade_nodes[1:2]
policy_cascades$cascade_times[1:2]
policy_cascades$node_names[1:10]

# plot before go
cascade_ids <- colnames(policies)
selection <- cascade_ids[c(16, 186)]
plot(policy_cascades, label_nodes = TRUE, selection = selection)

selection <- cascade_ids[5:15]
plot(policy_cascades, label_nodes = FALSE, selection = selection)

# count of possible edges is influenced by the order in time of nodes
npe <- count_possible_edges(policy_cascades)
npe

results <- netinf(policy_cascades, trans_mod = "exponential", n_edges = npe, lambda = 1)
plot(results, type = "improvement")
diffusion_network <- netinf(policy_cascades, trans_mod = "exponential", n_edges = 25, lambda = 1)
plot(diffusion_network, type = "improvement")
plot(diffusion_network, type = "network")

library(igraph)
g <- graph_from_data_frame(d = results[, 1:2])
plot(g, edge.arrow.size=.03, vertex.color = "grey70")
