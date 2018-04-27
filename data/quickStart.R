### Quick start
library(NetworkInference)

# Simulate random cascade data
df <- simulate_rnd_cascades(50, n_node = 20)
node_names <- unique(df$node_name)

# Cast data into `cascades` object
## From dataframe
cascades <- as.cascade(df, node_names = node_names)

## From matrix
df_matrix <- as.matrix(cascades) ### Create example matrix
cascades <- as.cascade(df_matrix, node_names = node_names)

result <- netinf(cascades, trans_mod = "exponential", lambda = 1, n_edges = 5)

