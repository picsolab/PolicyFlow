# Set working directory
setwd("~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/NetInf/") # [BAD]

# Read in libraries
library(foreign)

# Read in data
stHood <- read.dta("mkdata-network02-statehood.dta")
adopt <- read.dta("mkdata-network02.dta")
stHood <- stHood[match(adopt$state,stHood$state),]

allNA <- function(x){
	all(is.na(x))
}

## Important parameterization questions
# Size of window looking back
# number of edges
# exponential prior
allInd <- 1
allResults <- list()
for(lam in c(.125,.25,.5,1)){


nNotNA <- function(x){sum(is.finite(x))}
years <- 1960:2009
# Create vector of policy names
policies <- names(adopt)[5:ncol(adopt)]
# Results Array, states X policies X year
nbrArray <- array(0,dim=c(50,length(policies), length(years)))

stAbr <- adopt$state

estims <- list()
estind <- 1
bics <- matrix(0,10,10)
wins <- c(5,10,15,20,25,30,35,40,45,50)
edgs <- c(100,200,300,400,500,600,700,800,900,1000)
for(w in 1:10){
for(ed in 1:10){
for(yr in years){


win <- wins[w]
edg <- edgs[ed]

base <- yr

# Organize for netinf
# normalize adoption years
adoptT <- adopt[,5:ncol(adopt)]
adoptT <- as.matrix(adoptT)
# Keep adoption instances occuring before base
adoptT[adoptT>=(base)] <- NA
# Keep adoption instances in the last 30 yrs
adoptT[adoptT<(base-win)] <- NA
adoptN <- adoptT
#stDate <- matrix(rep(stHood$yrstatehd,ncol(adoptN)),50,ncol(adoptN))
#adoptN[stDate>end] <- NA
adoptN <- adoptN[,!apply(adoptN,2,allNA)]

# Re-normalize to zero-out the starting state
for(i in 1:ncol(adoptN)){
	adoptN[,i] <- adoptN[,i] - min(adoptN[,i],na.rm=T)
}


# Create character vector of file lines
datFile <- file("~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/NetInf/netinf_mac/StateCascades.txt")
stateno <- adopt$stateno
stateabb <- adopt$state
idVec <- paste(stateno[order(stateno)],stateabb[order(stateno)],sep=",")
cascVec <- NULL
for(i in 1:ncol(adoptN)){
	casci <- adoptN[,i]
	mati <- cbind(stateno,casci)[order(casci),]
	mati <- rbind(mati[-which(is.na(mati[,2])),])
	cVeci <- paste(mati[,1],mati[,2],sep=",",collapse=";")
	cascVec <- c(cascVec,cVeci)
}
writeLines(c(idVec,"",cascVec),datFile)
close(datFile)

# Push netinf command to Bash
# Set working directory
setwd("~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/NetInf/netinf_mac/")
p1 <- pipe("rm network-edge.info","r")
call <- paste("./netinf -e:",edg," -a:",lam," -i:./StateCascades.txt -s:1",sep="")
p2 <- pipe(call,"r")
close(p1)
close(p2)
while(!is.element("network-edge.info",dir())){4}

# Set working directory
setwd("~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/NetInf/netinf_mac/") # [BAD]

# Read in inferred edges and weight data
edges <- read.table("network-edge.info",sep="/",header=F,stringsAsFactors=F,skip=1)

# add column names
names(edges) <- c("src", "dst", "vol", "marginal_gain", "median_timediff","average_timediff")

# Build the Network
setwd("~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/NetInf/")# [BAD]

# node Ids 
nodes <- sort(stHood$state)

# Initialize the Adjacency Matrix

edgesS <- edges
amat <- matrix(0,length(nodes),length(nodes))
ind1 <- match(edgesS[,1],nodes)
ind2 <- match(edgesS[,2],nodes)
amat[cbind(ind1,ind2)] <- 1

for(st in 1:length(stAbr)){
	nbrsi <- edges[edges$dst==stAbr[st],]
	adoptL <- adopt[,5:ncol(adopt)]
	adoptL <- as.matrix(adoptL)
	# Keep adoption instances occuring before base
	adoptL[adoptL>=(base)] <- NA
	nbrAdopt <- rbind(adoptL[is.element(stAbr,nbrsi[,1]),])
	nbrArray[st,,yr-1959] <- apply(nbrAdopt,2,nNotNA)
}

print(yr)

}

policy <- NULL
adoptInd <- NULL
neighbors <- NULL
allAdopt <- NULL

for(plc in 5:ncol(adopt)){
adopti <- adopt[,c(4,plc)]
### Model adoptions given edges ####
# Select out one policy
# define the span of years to model
yrsi <- (min(adopti[,2],na.rm=T)+1):max(adopti[,2],na.rm=T)
# pull out vector to replace missing adoption year with max years +1
adoptsi <- adopti[,2]
# replace na's with max span +1
adoptsi[is.na(adoptsi)] <- max(yrsi)+1
# Build dataset with three variables - adopt indicator, n neighbors adopting in prior years, n states adopting in prior years.
for(t in yrsi){
	if(t >1959){
	obst <- adopti[which(adoptsi >=t),1]
	for(st in obst){
		allAdopt <- c(allAdopt,sum(adoptsi < t))
		adoptInd <- c(adoptInd,1*(adoptsi[adopti[,1]==st] == t))
		neighbors <- c(neighbors,nbrArray[which(stAbr==st),plc-4,t-1959])
		policy <- c(policy,plc-4)
	}
}
}
}

est <- glm(adoptInd~allAdopt+neighbors+as.factor(policy),family=binomial)
bics[w,ed] <- BIC(est)
print(c(w,ed))
estims[[estind]] <- list(w=w,ed=ed,sumr = summary(est))
estind = estind+1
}
}

allResults[[allInd]] <- list(bics,estims)

allInd <- allInd + 1

}

save.image("NetInfTuning.RData")



pvalList <- list()
betaList <- list()
rbetaList <- list()
for(l in 1:4){
pvals <- matrix(0,10,10)
betas <- matrix(0,10,10)
rbeta <- matrix(0,10,10)
estind <- 1
for(i in 1:10){
	for(j in 1:10){
		estij <- allResults[[l]][[2]][[estind]]$sumr$coef[3,]
		pvals[i,j] <- estij[4]
		betas[i,j] <- estij[1]
		rbeta[i,j] <- estij[1]/allResults[[l]][[2]][[estind]]$sumr$coef[2,1]
		estind <- estind +1
	}
}
pvalList[[l]] <- pvals
betaList[[l]] <- betas
rbetaList[[l]] <- rbeta
}

library(fields)

### BIC Plots ###
pdf(file = "~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/NetInf/tuning_results/imgBIClam125.pdf",pointsize=10,height=3.6,width=3.2,family="Times")
par(las=1,mar=c(4,4,1,2))
image.plot(x=wins,y=edgs,z=allResults[[1]][[1]],col=gray((0:100)/100),xlab="",ylab="Edges",horizontal=T)
title(line=2.25,xlab="Time Interval")
dev.off()

pdf(file = "~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/NetInf/tuning_results/imgBIClam25.pdf",pointsize=10,height=3.6,width=3.2,family="Times")
par(las=1,mar=c(4,4,1,2))
image.plot(x=wins,y=edgs,z=allResults[[2]][[1]],col=gray((0:100)/100),xlab="",ylab="Edges",horizontal=T)
title(line=2.25,xlab="Time Interval")
dev.off()

pdf(file = "~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/NetInf/tuning_results/imgBIClam5.pdf",pointsize=10,height=3.6,width=3.2,family="Times")
par(las=1,mar=c(4,4,1,2))
image.plot(x=wins,y=edgs,z=allResults[[3]][[1]],col=gray((0:100)/100),xlab="",ylab="Edges",horizontal=T)
title(line=2.25,xlab="Time Interval")
dev.off()

pdf(file = "~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/NetInf/tuning_results/imgBIClam1.pdf",pointsize=10,height=3.6,width=3.2,family="Times")
par(las=1,mar=c(4,4,1,2))
image.plot(x=wins,y=edgs,z=allResults[[4]][[1]],col=gray((0:100)/100),xlab="",ylab="Edges",horizontal=T)
title(line=2.25,xlab="Time Interval")
dev.off()

### Beta Plots ###
pdf(file = "~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/NetInf/tuning_results/imgBetalam125.pdf",pointsize=10,height=3.6,width=3.2,family="Times")
par(las=1,mar=c(4,4,1,2))
image.plot(x=wins,y=edgs,z=betaList[[1]],col=gray((0:100)/100),xlab="",ylab="Edges",horizontal=T)
title(line=2.25,xlab="Time Interval")
dev.off()

pdf(file = "~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/NetInf/tuning_results/imgBetalam25.pdf",pointsize=10,height=3.6,width=3.2,family="Times")
par(las=1,mar=c(4,4,1,2))
image.plot(x=wins,y=edgs,z=betaList[[2]],col=gray((0:100)/100),xlab="",ylab="Edges",horizontal=T)
title(line=2.25,xlab="Time Interval")
dev.off()

pdf(file = "~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/NetInf/tuning_results/imgBetalam5.pdf",pointsize=10,height=3.6,width=3.2,family="Times")
par(las=1,mar=c(4,4,1,2))
image.plot(x=wins,y=edgs,z=betaList[[3]],col=gray((0:100)/100),xlab="",ylab="Edges",horizontal=T)
title(line=2.25,xlab="Time Interval")
dev.off()

pdf(file = "~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/NetInf/tuning_results/imgBetalam1.pdf",pointsize=10,height=3.6,width=3.2,family="Times")
par(las=1,mar=c(4,4,1,2))
image.plot(x=wins,y=edgs,z=betaList[[4]],col=gray((0:100)/100),xlab="",ylab="Edges",horizontal=T)
title(line=2.25,xlab="Time Interval")
dev.off()

### Relative Beta Plots ###

pdf(file = "~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/NetInf/tuning_results/imgRBetalam125.pdf",pointsize=10,height=3.6,width=3.2,family="Times")
par(las=1,mar=c(4,4,1,2))
image.plot(x=wins,y=edgs,z=rbetaList[[1]],col=gray((0:100)/100),xlab="",ylab="Edges",horizontal=T)
title(line=2.25,xlab="Time Interval")
dev.off()

pdf(file = "~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/NetInf/tuning_results/imgRBetalam25.pdf",pointsize=10,height=3.6,width=3.2,family="Times")
par(las=1,mar=c(4,4,1,2))
image.plot(x=wins,y=edgs,z=rbetaList[[2]],col=gray((0:100)/100),xlab="",ylab="Edges",horizontal=T)
title(line=2.25,xlab="Time Interval")
dev.off()

pdf(file = "~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/NetInf/tuning_results/imgRBetalam5.pdf",pointsize=10,height=3.6,width=3.2,family="Times")
par(las=1,mar=c(4,4,1,2))
image.plot(x=wins,y=edgs,z=rbetaList[[3]],col=gray((0:100)/100),xlab="",ylab="Edges",horizontal=T)
title(line=2.25,xlab="Time Interval")
dev.off()

pdf(file = "~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/NetInf/tuning_results/imgRBetalam1.pdf",pointsize=10,height=3.6,width=3.2,family="Times")
par(las=1,mar=c(4,4,1,2))
image.plot(x=wins,y=edgs,z=rbetaList[[4]],col=gray((0:100)/100),xlab="",ylab="Edges",horizontal=T)
title(line=2.25,xlab="Time Interval")
dev.off()

### Draw the network for selected parameters ###
netList <- list()
lam <- .5
win <- 10
edg <- 400
for(yr in years){

base <- yr

# Organize for netinf
# normalize adoption years
adoptT <- adopt[,5:ncol(adopt)]
adoptT <- as.matrix(adoptT)
# Keep adoption instances occuring before base
adoptT[adoptT>=(base)] <- NA
# Keep adoption instances in the last 30 yrs
adoptT[adoptT<(base-win)] <- NA
adoptN <- adoptT
#stDate <- matrix(rep(stHood$yrstatehd,ncol(adoptN)),50,ncol(adoptN))
#adoptN[stDate>end] <- NA
adoptN <- adoptN[,!apply(adoptN,2,allNA)]

# Re-normalize to zero-out the starting state
for(i in 1:ncol(adoptN)){
	adoptN[,i] <- adoptN[,i] - min(adoptN[,i],na.rm=T)
}

# Create character vector of file lines
datFile <- file("~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/NetInf/netinf_mac/StateCascades.txt")
stateno <- adopt$stateno
stateabb <- adopt$state
idVec <- paste(stateno[order(stateno)],stateabb[order(stateno)],sep=",")
cascVec <- NULL
for(i in 1:ncol(adoptN)){
	casci <- adoptN[,i]
	mati <- cbind(stateno,casci)[order(casci),]
	mati <- rbind(mati[-which(is.na(mati[,2])),])
	cVeci <- paste(mati[,1],mati[,2],sep=",",collapse=";")
	cascVec <- c(cascVec,cVeci)
}
writeLines(c(idVec,"",cascVec),datFile)
close(datFile)

# Push netinf command to Bash
# Set working directory
setwd("~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/NetInf/netinf_mac/")
p1 <- pipe("rm network-edge.info","r")
call <- paste("./netinf -e:",edg," -a:",lam," -i:./StateCascades.txt -s:1",sep="")
p2 <- pipe(call,"r")
close(p1)
close(p2)
while(!is.element("network-edge.info",dir())){4}

# Set working directory
setwd("~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/NetInf/netinf_mac/") # [BAD]

# Read in inferred edges and weight data
edges <- read.table("network-edge.info",sep="/",header=F,stringsAsFactors=F,skip=1)

# add column names
names(edges) <- c("src", "dst", "vol", "marginal_gain", "median_timediff","average_timediff")

# Build the Network
setwd("~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/NetInf/") # [BAD]

# node Ids 
nodes <- sort(stHood$state)

# Initialize the Adjacency Matrix

edgesS <- edges
amat <- matrix(0,length(nodes),length(nodes))
ind1 <- match(edgesS[,1],nodes)
ind2 <- match(edgesS[,2],nodes)
amat[cbind(ind1,ind2)] <- 1

colnames(amat) <- nodes
rownames(amat) <- nodes

netList[[yr-1959]] <- amat

fnm <- paste("~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/Published Model Replications/Sources Files/Network",yr,"T",win,"E",edg,".csv",sep="")
write.csv(amat,fnm)


print(yr)

}

#### Longer time span and fewer edges ####

netList <- list()
lam <- .5
win <- 35
edg <- 300
for(yr in years){

base <- yr

# Organize for netinf
# normalize adoption years
adoptT <- adopt[,5:ncol(adopt)]
adoptT <- as.matrix(adoptT)
# Keep adoption instances occuring before base
adoptT[adoptT>=(base)] <- NA
# Keep adoption instances in the last 30 yrs
adoptT[adoptT<(base-win)] <- NA
adoptN <- adoptT
#stDate <- matrix(rep(stHood$yrstatehd,ncol(adoptN)),50,ncol(adoptN))
#adoptN[stDate>end] <- NA
adoptN <- adoptN[,!apply(adoptN,2,allNA)]

# Re-normalize to zero-out the starting state
for(i in 1:ncol(adoptN)){
	adoptN[,i] <- adoptN[,i] - min(adoptN[,i],na.rm=T)
}

# Create character vector of file lines
datFile <- file("~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/NetInf/netinf_mac/StateCascades.txt")
stateno <- adopt$stateno
stateabb <- adopt$state
idVec <- paste(stateno[order(stateno)],stateabb[order(stateno)],sep=",")
cascVec <- NULL
for(i in 1:ncol(adoptN)){
	casci <- adoptN[,i]
	mati <- cbind(stateno,casci)[order(casci),]
	mati <- rbind(mati[-which(is.na(mati[,2])),])
	cVeci <- paste(mati[,1],mati[,2],sep=",",collapse=";")
	cascVec <- c(cascVec,cVeci)
}
writeLines(c(idVec,"",cascVec),datFile)
close(datFile)

# Push netinf command to Bash
# Set working directory
setwd("~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/NetInf/netinf_mac/")
p1 <- pipe("rm network-edge.info","r")
call <- paste("./netinf -e:",edg," -a:",lam," -i:./StateCascades.txt -s:1",sep="")
p2 <- pipe(call,"r")
close(p1)
close(p2)
while(!is.element("network-edge.info",dir())){4}

# Set working directory
setwd("~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/NetInf/netinf_mac/") # [BAD]

# Read in inferred edges and weight data
edges <- read.table("network-edge.info",sep="/",header=F,stringsAsFactors=F,skip=1)

# add column names
names(edges) <- c("src", "dst", "vol", "marginal_gain", "median_timediff","average_timediff")

# Build the Network
setwd("~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/NetInf/") # [BAD]

# node Ids 
nodes <- sort(stHood$state)

# Initialize the Adjacency Matrix

edgesS <- edges
amat <- matrix(0,length(nodes),length(nodes))
ind1 <- match(edgesS[,1],nodes)
ind2 <- match(edgesS[,2],nodes)
amat[cbind(ind1,ind2)] <- 1

colnames(amat) <- nodes
rownames(amat) <- nodes

netList[[yr-1959]] <- amat

fnm <- paste("~/Dropbox/professional/Research/Submitted/StateNet/APSR Replication Files/Published Model Replications/Sources Files/Network",yr,"T",win,"E",edg,".csv",sep="")
write.csv(amat,fnm)

print(yr)

}
