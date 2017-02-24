library(NetworkInference)
network02<-read.csv("./replication/mkdata-network02.tab", header=TRUE, sep="\t")
head(network02)
dim(network02)
state_names<-network02$state
policies<-network02[,c(-1,-2, -"statenam", -"stateno")]

dim(policies)
max(policies, na.rm = TRUE)
min(policies, na.rm = TRUE)
summary(policies)

# transform dataframe to cascate object
policy_cascades <- as.cascade(policies, node_names = state_names)
names(policy_cascades)

policy_cascades$cascade_nodes[1:2]
policy_cascades$cascade_times[1:2]
policy_cascades$node_names[1:10]

# plot before go
cascade_ids <- colnames(policies)
cascade_ids
length(cascade_ids) 
# [1] 187

selection <- cascade_ids[c(1:10)]
plot(policy_cascades, label_nodes = TRUE, selection = selection)

selection <- cascade_ids[5:15]
plot(policy_cascades, label_nodes = FALSE, selection = selection)

# count of possible edges is influenced by the order in time of nodes
npe <- count_possible_edges(policy_cascades)
npe

results <- netinf(policy_cascades, trans_mod = "exponential", n_edges = npe, lambda = 1)
plot(results, type = "improvement")
diffusion_network <- netinf(policy_cascades, trans_mod = "exponential", n_edges = 100, lambda = 1)
plot(diffusion_network, type = "improvement")
plot(diffusion_network, type = "network")

library(igraph)
g <- graph_from_data_frame(d = results[, 1:2])
plot(g, edge.arrow.size=.03, vertex.color = "grey70")

# dhb2015apsr-modellinks-nomiss.tab: Stata dataset for the multilevel logit models of diffusion ties.
# dhb2015apsr-modellinks-QAPiters.R: R script file for the multilevel logit models of diffusion ties.
# 
# dhb2015apsr-networks.csv: Networks in .csv format. There are two networks, selected based on model fit of the tuning parameters (see the article text for details). One is based on 300 edges over 35 years of adoption and the other is 400 edges over 10 years.
# 
# gaming.replication.R: R script file for Indian gaming replication (Boehmke 2005).
# gaming.tab: Stata dataset for Indian gaming replication (Boehmke 2005).
# 
# infer_networks.R: R script that runs Netinf on the policy adoption data, produces parameter tuning fit plots, and generates CSV files of adjacency matrices corresponding to the inferred networks for each year at the hyperparameter values we use in the APSR piece.
# 
# lottery.replication.R: R script file for lottery replication (Berry and Berry 1990).
# lottery.tab: Stata dataset for lottery replication (Berry and Berry 1990).
# 
# mkdata-network02-statehood.tab: Stata dataset giving statehood dates for all 50 states.
# mkdata-network02.tab: Stata dataset giving policy adoption dates.
# 
# mkdata-pooled01.tab: Stata dataset for pooled model replication (Boehmke and Skinner 2012).
# pooled.replication.R: R script file for pooled model replication (Boehmke and Skinner 2012).
# 
# punishment.replication.R: R script file for capital punishment replication (Boehmke 2005).
# punishment.tab: Stata dataset for capital punishment replication (Boehmke 2005).
# 
# smoking.replication.R: R script file for smoking ban replication (Shipan and Volden 2006).
# smoking.tab: Stata dataset for smoking ban replication (Shipan and Volden 2006).

apsr<-read.csv("./replication/dhb2015apsr-modellinks-nomiss.tab", header=TRUE, sep="\t")
# pooled01<-read.csv("./replication/mkdata-pooled01.tab", header=TRUE, sep="\t")
# lottery<-read.csv("./replication/lottery.tab", header=TRUE, sep="\t")
# punishment<-read.csv("./replication/punishment.tab", header=TRUE, sep="\t")
# smoking<-read.csv("./replication/smoking.tab", header=TRUE, sep="\t")
# gaming<-read.csv("./replication/gaming.tab", header=TRUE, sep="\t")
# networks<-read.csv("./replication/dhb2015apsr-networks.csv", header=TRUE, sep=",")

dim(apsr)
# # [1] 94080    39
# dim(pooled01)
# # [1] 344324     51
# dim(lottery)
# # [1] 901  12
# dim(punishment)
# # [1] 650  78
# dim(smoking)
# # [1] 3600   47
# dim(gaming)
# # [1] 1500   92
# dim(networks)
# # [1] 125000      5

colnames(apsr)

# year      adoption time by state_02
# lat       latitude
# lon       longitude
# contig    ?
# citi6010  citizen ideology
# legp_king legislative professionalism
# minodiv   minority diversity
# rpcpinc   per capita income
# totpop    total population


