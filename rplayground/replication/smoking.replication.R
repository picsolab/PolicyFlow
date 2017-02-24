################################################################################
# "Persistent Policy Pathways: Inferring Diffusion                             #
# Networks in the American States"                                             #
# Bruce Desmarais, Jeff Harden, and Fred Boehmke                               #
# Replication File for Shipan and Volden (2006)                                #
# Last update: 3/20/15                                                         #
################################################################################
## Packages and Data ##
library(foreign)
library(rms)
library(car)
library(boot)
library(MASS)

## Replicate Original Models ##
smoking <- read.dta("smoking.dta")

# Table 3, Model 9 (p. 839) 
m9 <- robcov(lrm(dvrest ~ pooledcensus + pooledlocalhealth + poolednei + synar1 + toblobbyratio + healthlobbyratio + tobaccolobby + healthorgslobby + percentsmokers + production + proddum + psphealth + govideolbrfh + ugovdem + ugovrep + profess, x = TRUE, y = TRUE, data = subset(smoking, policynum == 2)), cluster = subset(smoking, policynum == 2)$state)

## Create Network Sources Variable ##
# Need the files in the "Sources Files" folder

years <- 1975:2000
net.data <- list()

for(i in years){
net.data[[i]] <- read.csv(paste("Network", i, "T10E400.csv", sep = ""), header = TRUE)
}
states <- colnames(net.data[[1975]])[-1]

# List states that adopted smoking bans in each year (adopt) and cumulative list of states that had adopted smoking ban by each year
adopt <- vector("list", 26); names(adopt) <- paste("y", years, sep = "")
adopt2 <- vector("list", 26); names(adopt2) <- paste("y", years, sep = "")

for(i in 1:length(adopt)){
states.adopt <- unique(smoking$state[which(smoking$year == i + 1974 & smoking$dvrest == 1)])
if(length(states.adopt) != 0L) adopt[[i]] <- states.adopt
adopt2[[i]] <- as.vector(unlist(adopt[1:i]))
}

# Count each state's sources that previously adopted a smoking for each year
network <- matrix(NA, nrow = length(states), ncol = length(years))
rownames(network) <- states; colnames(network) <- years

for(j in years){
m.states <- vector("list", nrow(network)); names(m.states) <- states
net <- matrix(NA, nrow = nrow(network), ncol = 1); rownames(net) <- states

for(i in 1:nrow(network)){
m.states[[i]] <- as.character(net.data[[j]]$X[which(net.data[[j]][ , states[i]] != 0)])
 net[i, 1] <- sum(length(intersect(m.states[[i]], adopt2[[j - 1974]]))) # Count
# net[i, 1] <- sum(length(intersect(m.states[[i]], adopt2[[j - 1974]])))/length(m.states[[i]]) # Percent
# net[i, 1] <- ifelse(length(intersect(m.states[[i]], adopt2[[j - 1974]])) == 0, 0, sum(net.data[[j]][ , c(intersect(m.states[[i]], adopt2[[j - 1974]]))])) # Sum of edge weights
} # End i loop
network[ , j - 1974] <- net
} # End j loop

smoking$source.adopt <- rep(NA, times = nrow(smoking))
for(j in years){
for(i in 1:length(states)){
smoking$source.adopt[smoking$state == states[i] & smoking$year == j] <- network[i, as.character(j)] 
}
}

## Now Include Source Variable ##
# Table 3, Model 9 (p. 839) 
m9sc <- robcov(lrm(dvrest ~ pooledcensus + pooledlocalhealth + synar1 + toblobbyratio + healthlobbyratio + tobaccolobby + healthorgslobby + percentsmokers + production + proddum + psphealth + govideolbrfh + ugovdem + ugovrep + profess + source.adopt, x = TRUE, y = TRUE, data = subset(smoking, policynum == 2 & poolednei != "NA")), cluster = subset(smoking, policynum == 2 & poolednei != "NA")$state)
m9sc2 <- robcov(lrm(dvrest ~ pooledcensus + pooledlocalhealth + poolednei + synar1 + toblobbyratio + healthlobbyratio + tobaccolobby + healthorgslobby + percentsmokers + production + proddum + psphealth + govideolbrfh + ugovdem + ugovrep + profess + source.adopt, x = TRUE, y = TRUE, data = subset(smoking, policynum == 2)), cluster = subset(smoking, policynum == 2)$state)

compareCoefs(m9, m9sc, m9sc2)

## Model Fit ##
# AIC and BIC
AIC(m9); AIC(m9sc); AIC(m9sc2)
BIC(m9, m9sc, m9sc2)

# Function to compute CV PCC
cv.pcc <- function(model, data){
model <- glm(formula(model), family = binomial (link = logit), data = data) 
dat <- model$model
n <- nrow(dat)
# A vector to store the value of the linear predictor 
# on each observation when it is excluded
cv.lp <- numeric(n) 
for(i in 1:n){ # Loop through all the observations
# Estimate the model without observation i
cv.model <- glm(formula(model), family = binomial (link = logit), data = dat[-i, ]) 
# Calculate the value of the linear predictor for the left out observation
cv.lp[i] <- as.numeric(as.matrix(cbind(1, dat[ , -1]))[i, ] %*% coef(cv.model)) 
cat("Completed", i, "of", n, "\n")
}
predicted.cv <- inv.logit(cv.lp)
# The % correctly classified using CV computations
correct.cv <- mean(ifelse(model$y == rbinom(n, 1, predicted.cv), 1, 0))
return(list(predicted.cv = predicted.cv, correct.cv = correct.cv))
}
 
# CV PCC
set.seed(47464)
m9.cv <- cv.pcc(m9, subset(smoking, policynum == 2)) 
m9sc.cv <- cv.pcc(m9sc, subset(smoking, policynum == 2))
m9sc2.cv <- cv.pcc(m9sc2, subset(smoking, policynum == 2))
m9.cv$correct.cv; m9sc.cv$correct.cv; m9sc2.cv$correct.cv

## Compute Expected Probabilities ##
# A function to compute EP using the "observed value" method of Hanmer and Kalkan (2013) 
# Inputs: The model, a list of design matrices, and number of simulations
# Outputs: Expected probability point estimate, 95% confidence interval
ep <- function(model, x, m = 1000){
  b <- as.matrix(coef(model))
  vcv <- model$var
  sim.b <- mvrnorm(m, b, vcv)
  sim.ep <- matrix(NA, nrow = m, ncol = length(x))
    for(j in 1:length(x)){
    for(i in 1:m){
    sim.ep[i, j] <- mean(inv.logit(x[[j]] %*% as.matrix(sim.b[i, ])))
    }
    }
  pe <- apply(sim.ep, 2, mean)
  lo <- apply(sim.ep, 2, quantile, prob = .025, na.rm = TRUE)
  hi <- apply(sim.ep, 2, quantile, prob = .975, na.rm = TRUE)
return(list(pe = pe, lo = lo, hi = hi))
}

# Model 9, neighbors (no source.adopt)
pn.range <- seq(min(na.omit(subset(smoking, policynum==2)$poolednei)), max(na.omit(subset(smoking, policynum==2)$poolednei)), length = 10)

x0 <- x1 <- x2 <- x3 <- x4 <- x5 <- x6 <- x7 <- x8 <- x9 <- model.matrix(m9)
x0[ , "poolednei"] <- pn.range[1]
x1[ , "poolednei"] <- pn.range[2]
x2[ , "poolednei"] <- pn.range[3]
x3[ , "poolednei"] <- pn.range[4]
x4[ , "poolednei"] <- pn.range[5]
x5[ , "poolednei"] <- pn.range[6]
x6[ , "poolednei"] <- pn.range[7]
x7[ , "poolednei"] <- pn.range[8]
x8[ , "poolednei"] <- pn.range[9]
x9[ , "poolednei"] <- pn.range[10]
x.n <- list(x0, x1, x2, x3, x4, x5, x6, x7, x8, x9)

set.seed(8765)
ep.m9n <- ep(m9, x.n)

pdf("sm-neighbors-nsc.pdf")

par(mar = c(4.5, 5, .1, .1))
plot(seq(-.02, 1.02, length = 10), ep.m9n$pe, type = "n", ylim = c(0, 1), xlab = "", ylab = "", axes = FALSE)
title(xlab = "% Neighbors Adopting Smoking Ban", line = 3, cex.lab = 2)
title(ylab = "Expected Probability of Adoption", line = 3.5, cex.lab = 2)
abline(h = seq(0, 1, .1), col = "black", lty = 3, lwd = 2)
abline(v = pn.range, col = "black", lty = 3, lwd = 2)
box()
rug(jitter(subset(smoking, policynum == 2)$poolednei), ticksize = .015)
points(pn.range, ep.m9n$pe, pch = 19, lwd = 3)
lines(pn.range, ep.m9n$pe)
for(i in 1:10){
segments(pn.range[i], ep.m9n$lo[i], pn.range[i], ep.m9n$hi[i], lwd = 3)
}
text(pn.range[seq(1, 10, by = 2)], ep.m9n$hi[seq(1, 10, by = 2)] + .05, round(ep.m9n$pe[seq(1, 10, by = 2)], 2), cex = 1.75)
text(pn.range[10], ep.m9n$hi[10] + .05, round(ep.m9n$pe[10], 2), cex = 1.75)
axis(1, at = seq(0, 1, .1), cex.axis = 1.75)
axis(2, at = seq(0, 1, .1), las = 2, cex.axis = 1.55)

dev.off()

# Model 9, source.adopt (no neighbors)
x0 <- x1 <- x2 <- x3 <- x4 <- x5 <- x6 <- x7 <- x8 <- x9 <- model.matrix(m9sc)
x0[ , "source.adopt"] <- 0
x1[ , "source.adopt"] <- 1
x2[ , "source.adopt"] <- 2
x3[ , "source.adopt"] <- 3
x4[ , "source.adopt"] <- 4
x5[ , "source.adopt"] <- 5
x6[ , "source.adopt"] <- 6
x7[ , "source.adopt"] <- 7
x8[ , "source.adopt"] <- 8
x9[ , "source.adopt"] <- 9
x.sc <- list(x0, x1, x2, x3, x4, x5, x6, x7, x8, x9)

set.seed(756785)
ep.m9sc <- ep(m9sc, x.sc)

setwd(latex.dir)
pdf("sm-sources-nn.pdf")

par(mar = c(4.5, 5, .1, .1))
plot(seq(-.1, 9.2, length = 10), ep.m9sc$pe, type = "n", ylim = c(0, 1), xlab = "", ylab = "", axes = FALSE)
title(xlab = "Sources Adopting Smoking Ban", line = 3, cex.lab = 2)
title(ylab = "Expected Probability of Adoption", line = 3.5, cex.lab = 2)
abline(h = seq(0, 1, .1), col = "black", lty = 3, lwd = 2)
abline(v = 0:9, col = "black", lty = 3, lwd = 2)
box()
rug(jitter(subset(smoking, policynum == 2)$source.adopt), ticksize = .015)
points(0:9, ep.m9sc$pe, pch = 19, lwd = 3)
lines(0:9, ep.m9sc$pe)
for(i in 1:10){
segments(i - 1, ep.m9sc$lo[i], i - 1, ep.m9sc$hi[i], lwd = 3)
}
text(seq(0, 9, by = 2), ep.m9sc$hi[seq(1, 10, by = 2)] + .05, round(ep.m9sc$pe[seq(1, 10, by = 2)], 2), cex = 1.75)
text(9, ep.m9sc$hi[10] + .05, round(ep.m9sc$pe[10], 2), cex = 1.75)
axis(1, at = 0:9, cex.axis = 1.75)
axis(2, at = seq(0, 1, .1), las = 2, cex.axis = 1.5)

dev.off()

# Model 9, neighbors (with source.adopt)
x0 <- x1 <- x2 <- x3 <- x4 <- x5 <- x6 <- x7 <- x8 <- x9 <- model.matrix(m9sc2)
x0[ , "poolednei"] <- pn.range[1]
x1[ , "poolednei"] <- pn.range[2]
x2[ , "poolednei"] <- pn.range[3]
x3[ , "poolednei"] <- pn.range[4]
x4[ , "poolednei"] <- pn.range[5]
x5[ , "poolednei"] <- pn.range[6]
x6[ , "poolednei"] <- pn.range[7]
x7[ , "poolednei"] <- pn.range[8]
x8[ , "poolednei"] <- pn.range[9]
x9[ , "poolednei"] <- pn.range[10]
x.n2 <- list(x0, x1, x2, x3, x4, x5, x6, x7, x8, x9)

set.seed(8456765)
ep.m9n2 <- ep(m9sc2, x.n2)

setwd(latex.dir)
pdf("sm-neighbors.pdf")

par(mar = c(4.5, 5, .1, .1))
plot(seq(-.02, 1.02, length = 10), ep.m9n2$pe, type = "n", ylim = c(0, 1), xlab = "", ylab = "", axes = FALSE)
title(xlab = "% Neighbors Adopting Smoking Ban", line = 3, cex.lab = 2)
title(ylab = "Expected Probability of Adoption", line = 3.5, cex.lab = 2)
abline(h = seq(0, 1, .1), col = "black", lty = 3, lwd = 2)
abline(v = pn.range, col = "black", lty = 3, lwd = 2)
box()
rug(jitter(subset(smoking, policynum == 2)$poolednei), ticksize = .015)
points(pn.range, ep.m9n2$pe, pch = 19, lwd = 3)
lines(pn.range, ep.m9n2$pe)
for(i in 1:10){
segments(pn.range[i], ep.m9n2$lo[i], pn.range[i], ep.m9n2$hi[i], lwd = 3)
}
text(pn.range[seq(1, 10, by = 2)], ep.m9n2$hi[seq(1, 10, by = 2)] + .05, round(ep.m9n2$pe[seq(1, 10, by = 2)], 2), cex = 1.75)
text(pn.range[10], ep.m9n2$hi[10] + .05, round(ep.m9n2$pe[10], 2), cex = 1.75)
axis(1, at = seq(0, 1, .1), cex.axis = 1.75)
axis(2, at = seq(0, 1, .1), las = 2, cex.axis = 1.55)

dev.off()

# Model 9, source.adopt (with neighbors)
x0 <- x1 <- x2 <- x3 <- x4 <- x5 <- x6 <- x7 <- x8 <- x9 <- model.matrix(m9sc2)
x0[ , "source.adopt"] <- 0
x1[ , "source.adopt"] <- 1
x2[ , "source.adopt"] <- 2
x3[ , "source.adopt"] <- 3
x4[ , "source.adopt"] <- 4
x5[ , "source.adopt"] <- 5
x6[ , "source.adopt"] <- 6
x7[ , "source.adopt"] <- 7
x8[ , "source.adopt"] <- 8
x9[ , "source.adopt"] <- 9
x.sc2 <- list(x0, x1, x2, x3, x4, x5, x6, x7, x8, x9)

set.seed(75655785)
ep.m9sc2 <- ep(m9sc2, x.sc2)

setwd(latex.dir)
pdf("sm-sources.pdf")

par(mar = c(4.5, 5, .1, .1))
plot(seq(-.1, 9.2, length = 10), ep.m9sc2$pe, type = "n", ylim = c(0, 1), xlab = "", ylab = "", axes = FALSE)
title(xlab = "Sources Adopting Smoking Ban", line = 3, cex.lab = 2)
title(ylab = "Expected Probability of Adoption", line = 3.5, cex.lab = 2)
abline(h = seq(0, 1, .1), col = "black", lty = 3, lwd = 2)
abline(v = 0:9, col = "black", lty = 3, lwd = 2)
box()
rug(jitter(subset(smoking, policynum == 2)$source.adopt), ticksize = .015)
points(0:9, ep.m9sc2$pe, pch = 19, lwd = 3)
lines(0:9, ep.m9sc2$pe)
for(i in 1:10){
segments(i - 1, ep.m9sc2$lo[i], i - 1, ep.m9sc2$hi[i], lwd = 3)
}
text(seq(0, 9, by = 2), ep.m9sc2$hi[seq(1, 10, by = 2)] + .05, round(ep.m9sc2$pe[seq(1, 10, by = 2)], 2), cex = 1.75)
text(9, ep.m9sc2$hi[10] + .05, round(ep.m9sc2$pe[10], 2), cex = 1.75)
axis(1, at = 0:9, cex.axis = 1.75)
axis(2, at = seq(0, 1, .1), las = 2, cex.axis = 1.5)

dev.off()