library(data.table)
data<-read.csv("./external/raw/bills_for_evaluation_set.csv", header=FALSE, sep=",")
data
data<-data[,c(1,2,4)]
colnames(data)<-c("cascade", "state","year")
dim(data)
data<-data[!is.na(as.numeric(as.character(data$year))),]
data<-data[as.numeric(as.character(data$year))>1000,]
dim(data)

row.names(data)<-c(1:75)
cascade1<-data[1:38,]
cascade2<-data[39:75,]
dt.c1<-data.table(cascade1)
dt.c2<-data.table(cascade2)
c1<-dt.c1[,.SD[which.min(year)],by=state][]
c2<-dt.c2[,.SD[which.min(year)],by=state][]

merged<-merge(c1, c2, by.x="state", by.y = "state", all.x = TRUE, all.y = TRUE)
merged<-merged[,c(1,3,5)]
colnames(merged)<-c("state","AGPPJ","AGA")

library(NetworkInference)
state_names <- merged$state
policies<-merged[,2:3]
row.names(policies)<-state_names
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
