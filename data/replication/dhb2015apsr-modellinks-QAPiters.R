#	***************************************************************		#
#     	File Name:	dhb2015apsr-modellinks-est.R				#
#     	Date:   	April 30, 2015						#
#       Author: 	Bruce Desmarais, Jeff Harden, and Frederick J. Boehmke	#
#       Purpose:	Estimate the QAP model of the estimated directed 	#
#			diffusion links	between states.				#	
#       Input File:	dhb2015apsr-modellinks-nomiss.dta			#
#       Output File:	qapHLMres*.Rdata, 					#
#	***************************************************************		#

library(snowfall)

estimate <- function(findic){
	
library(foreign)
library(texreg)

## variables: src, contig, ids, idr,time
# src (tie variable): 1 if ids is a source for idr during year time, 0 otherwise
# contig: 1 if ids and idr are contiguous, 0 otherwise
# ids: id of potential source state
# idr: id of potential recipient state
# time: year

## Read in QAP code
# source("../data/Analysis/RCode/LSMCode.R")
# code for function qapLogit, which computes logit and also QAP-adjusted p-values

network.data <- read.dta("dhb2015apsr-modellinks-nomiss.dta")

  years=network.data$year
  Rstates=network.data$state_01
  Sstates=network.data$state_02
  y <- network.data$src_35_300

repvals <- function(x,a,b){
	x1 <- x
	for(i in 1:length(a)){
		x1[which(x==a[i])] <- b[i]
	}
	x1
}

ustate <- sort(unique(Rstates))

truID <- paste(Rstates,Sstates,years,sep="")

require(lme4)
system.time(tru_est <- glmer(src_35_300 ~ contig + distance + citi6010_diff + legp_king_diff + minordiv_diff + rpcpinc_diff + totpop_diff + unif_dem_both + unif_rep_both + citi6010_02 + legp_king_02 + minordiv_02 + rpcpinc_02 + totpop_02 + unif_dem_02 + unif_rep_02 + citi6010_01 + legp_king_01 + minordiv_01 +	rpcpinc_01 + totpop_01 + unif_dem_01 + unif_rep_01+as.factor(year)+(1|Rstates)+(1|Sstates),data=network.data,x=T,y=T,family=binomial,nAGQ=0))

nperm  <- 100

require(blme)
set.seed(findic*100000)
resList <- list()
for(i in 1:nperm){
	pustate <- sample(ustate,length(ustate))
	pRstates <- repvals(Rstates,ustate,pustate)
	pSstates <- repvals(Sstates,ustate,pustate)
	permID <- paste(pRstates,pSstates,years,sep="")
	py <- y[match(truID,permID)]
	resList[[i]] <- summary(glmer(py ~ contig + distance + citi6010_diff + legp_king_diff + minordiv_diff + rpcpinc_diff + totpop_diff + unif_dem_both + unif_rep_both + citi6010_02 + legp_king_02 + minordiv_02 + rpcpinc_02 + totpop_02 + unif_dem_02 + unif_rep_02 + citi6010_01 + legp_king_01 + minordiv_01 +	rpcpinc_01 + totpop_01 + unif_dem_01 + unif_rep_01+as.factor(year)+(1|pRstates)+(1|pSstates),data=network.data,x=T,y=T,family=binomial,nAGQ=0))$coef[,1]
	if(i/5==round(i/5)){
		 write.csv(data.frame(i) ,paste("QAPiter",findic,".csv",sep=""))
		  print(resList[[i]])
		  print(i)
		  save(list=c("tru_est","resList"),file=paste("qapHLMres",findic,".RData",sep=""))
		  }
}

save(list=c("tru_est","resList"),file=paste("qapHLMres",findic,".RData",sep=""))

}


indics <- 1:6

sfInit(cpus=6,parallel=TRUE)
sfClusterApplyLB(indics,estimate)
sfStop()



