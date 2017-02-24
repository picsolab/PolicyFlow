################################################################################
# "Persistent Policy Pathways: Inferring Diffusion                             #
# Networks in the American States"                                             #
# Bruce Desmarais, Jeff Harden, and Fred Boehmke                               #
# Replication File for Boehmke (2005) [Indian Gaming]                          #
# Last update: 3/20/15                                                         #
################################################################################
## Packages and Data ##
library(foreign)
library(car)
library(boot)
library(MASS)
library(rms)

## Replicate Original Models ##
gaming <- read.dta("gaming.dta", convert.factors = FALSE)

# Table 4.4, (p. 89) 
m1 <- glm(adopt_ig ~ init + sigs + initideo + ideology + fedtribe + pl280 + casino + south + totpop + debt + deficit + rpcpinc + drpcpinc + dmajrgov + rmajrgov + rmajdgov + nmajrgov + nmajdgov + othergov + nbrs + nbrs_ig4 + spline1 + spline2 + spline3, family = binomial (link = probit), data = gaming)

## Create Network Sources Variable ##
# Need the files in the "Sources Files" folder

years <- 1970:1999
net.data <- list()

for(i in years){
net.data[[i]] <- read.csv(paste("Network", i, "T10E400.csv", sep = ""), header = TRUE)
}
states <- colnames(net.data[[1970]])[-1]

# List states that adopted lotteries in each year (adopt) and cumulative list of states that had adopted lotteries by each year
adopt <- vector("list", 30); names(adopt) <- paste("y", years, sep = "")
adopt2 <- vector("list", 30); names(adopt2) <- paste("y", years, sep = "")

for(i in 1:length(adopt)){
states.adopt <- gaming$state[which(gaming$year == i + 1969 & gaming$adopt_ig == 1)]
if(length(states.adopt) != 0L) adopt[[i]] <- states.adopt
adopt2[[i]] <- as.vector(unlist(adopt[1:i]))
}

# Count each state's sources that previously adopted a gaming for each year
network <- matrix(NA, nrow = length(states), ncol = length(years))
rownames(network) <- states; colnames(network) <- years

for(j in years){
m.states <- vector("list", nrow(network)); names(m.states) <- states
net <- matrix(NA, nrow = nrow(network), ncol = 1); rownames(net) <- states

for(i in 1:nrow(network)){
m.states[[i]] <- as.character(net.data[[j]]$X[which(net.data[[j]][ , states[i]] == 1)])
 net[i, 1] <- sum(length(intersect(m.states[[i]], adopt2[[j - 1969]]))) # Count
# net[i, 1] <- sum(length(intersect(m.states[[i]], adopt2[[j - 1969]])))/length(m.states[[i]]) # Percent
} # End i loop
network[ , j - 1969] <- net
} # End j loop

gaming$source.adopt <- rep(NA, times = nrow(gaming))
for(j in years){
for(i in 1:length(states)){
gaming$source.adopt[gaming$state == states[i] & gaming$year == j] <- network[i, j - 1969] 
}
}

## Now Include Source Variable ##
# Table 4.4, (p. 89) 
m1sc <- glm(adopt_ig ~ init + sigs + initideo + ideology + fedtribe + pl280 + casino + south + totpop + debt + deficit + rpcpinc + drpcpinc + dmajrgov + rmajrgov + rmajdgov + nmajrgov + nmajdgov + othergov + source.adopt + spline1 + spline2 + spline3 + source.adopt, family = binomial (link = probit), data = gaming)
m1sc2 <- glm(adopt_ig ~ init + sigs + initideo + ideology + fedtribe + pl280 + casino + south + totpop + debt + deficit + rpcpinc + drpcpinc + dmajrgov + rmajrgov + rmajdgov + nmajrgov + nmajdgov + othergov + nbrs + nbrs_ig4 + source.adopt + spline1 + spline2 + spline3, family = binomial (link = probit), data = gaming)

compareCoefs(m1, m1sc, m1sc2)

## Model Fit ##
# AIC and BIC
AIC(m1, m1sc, m1sc2)
BIC(m1, m1sc, m1sc2)

# Function to compute CV PCC
cv.pcc <- function(model){
dat <- model$model
n <- nrow(dat)
# A vector to store the value of the linear predictor 
# on each observation when it is excluded
cv.lp <- numeric(n) 
for(i in 1:n){ # Loop through all the observations
# Estimate the model without observation i
cv.model <- glm(formula(model), family = binomial (link = probit),
data = dat[-i, ]) 
# Calculate the value of the linear predictor for the left out observation
cv.lp[i] <- as.numeric(as.matrix(cbind(1, dat[ , -1]))[i, ] %*% coef(cv.model)) 
cat("Completed", i, "of", n, "\n")
}
predicted.cv <- pnorm(cv.lp)
# The % correctly classified using CV computations
correct.cv <- mean(ifelse(model$y == rbinom(n, 1, predicted.cv), 1, 0))
return(list(predicted.cv = predicted.cv, correct.cv = correct.cv))
}
 
# CV PCC
set.seed(3939869)
m1.cv <- cv.pcc(m1) 
m1sc.cv <- cv.pcc(m1sc)
m1sc2.cv <- cv.pcc(m1sc2)
m1.cv$correct.cv; m1sc.cv$correct.cv; m1sc2.cv$correct.cv

## Compute Expected Probabilities ##
# A function to compute EP using the "observed value" method of Hanmer and Kalkan (2013) 
# Inputs: The model, a list of design matrices, and number of simulations
# Outputs: Expected probability point estimate, 95% confidence interval
ep <- function(model, x, vcv, m = 1000){
  b <- as.matrix(coef(model))
  vcv <- vcv
  sim.b <- mvrnorm(m, b, vcv)
  sim.ep <- matrix(NA, nrow = m, ncol = length(x))
    for(j in 1:length(x)){
    for(i in 1:m){
    sim.ep[i, j] <- mean(pnorm(x[[j]] %*% as.matrix(sim.b[i, ])))
    }
    }
  pe <- apply(sim.ep, 2, mean)
  lo <- apply(sim.ep, 2, quantile, prob = .025)
  hi <- apply(sim.ep, 2, quantile, prob = .975)
return(list(pe = pe, lo = lo, hi = hi))
}

# Effect of neighbors (no source.adopt)
x0 <- x1 <- x2 <- x3 <- x4 <- x5 <- model.matrix(m1)
x0[ , "nbrs"] <- 0
x1[ , "nbrs"] <- 1
x2[ , "nbrs"] <- 2
x3[ , "nbrs"] <- 3
x4[ , "nbrs"] <- 4
x5[ , "nbrs"] <- 5
x.n <- list(x0, x1, x2, x3, x4, x5)

set.seed(55788)
ep.m1n <- ep(m1, x.n, vcov(m1))

setwd(latex.dir)
pdf("ig-neighbors-nsc.pdf")

par(mar = c(4.5, 5, .1, .1))
plot(seq(-.1, 5.2, length = 6), ep.m1n$pe, type = "n", ylim = c(0, 1), xlab = "", ylab = "", axes = FALSE)
title(xlab = "Neighbors Adopting Indian Gaming", line = 3, cex.lab = 2)
title(ylab = "Expected Probability of Adoption", line = 3.5, cex.lab = 2)
abline(h = seq(0, 1, .1), col = "black", lty = 3, lwd = 2)
abline(v = 0:5, col = "black", lty = 3, lwd = 2)
box()
rug(jitter(gaming$nbrs), ticksize = .015)
points(0:5, ep.m1n$pe, pch = 19, lwd = 3)
lines(0:5, ep.m1n$pe)
for(i in 1:6){
segments(i - 1, ep.m1n$lo[i], i - 1, ep.m1n$hi[i], lwd = 3)
}
text(0:5, ep.m1n$hi + .05, round(ep.m1n$pe, 2), cex = 1.75)
axis(1, cex.axis = 1.75)
axis(2, at = seq(0, 1, .1), las = 2, cex.axis = 1.5)

dev.off()

# Effect of source.adopt (no neighbors)
x0 <- x1 <- x2 <- x3 <- x4 <- x5 <- x6 <- x7 <- x8 <- x9 <- x10 <- model.matrix(m1sc)
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
x10[ , "source.adopt"] <- 10
x.sc <- list(x0, x1, x2, x3, x4, x5, x6, x7, x8, x9, x10)

set.seed(7389)
ep.m1sc <- ep(m1sc, x.sc, vcov(m1sc))

pdf("ig-sources-nn.pdf")

par(mar = c(4.5, 5, .1, .1))
plot(seq(-.16, 10.2, length = 11), ep.m1sc$pe, type = "n", ylim = c(0, 1), xlab = "", ylab = "", axes = FALSE)
title(xlab = "Sources Adopting Indian Gaming", line = 3, cex.lab = 2)
title(ylab = "Expected Probability of Adoption", line = 3.5, cex.lab = 2)
abline(h = seq(0, 1, .1), col = "black", lty = 3, lwd = 2)
abline(v = 0:10, col = "black", lty = 3, lwd = 2)
box()
rug(jitter(gaming$source.adopt), ticksize = .015)
points(0:10, ep.m1sc$pe, pch = 19, lwd = 3)
lines(0:10, ep.m1sc$pe)
for(i in 1:11){
segments(i - 1, ep.m1sc$lo[i], i - 1, ep.m1sc$hi[i], lwd = 3)
}
text(seq(0, 10, by = 2), ep.m1sc$hi[seq(1, 11, by = 2)] + .05, round(ep.m1sc$pe[seq(1, 11, by = 2)], 2), cex = 1.75)
axis(1, at = 0:10, cex.axis = 1.75)
axis(2, at = seq(0, 1, .1), las = 2, cex.axis = 1.5)

dev.off()

# Effect of neighbors (with source.adopt)
x0 <- x1 <- x2 <- x3 <- x4 <- x5 <- model.matrix(m1sc2)
x0[ , "nbrs"] <- 0
x1[ , "nbrs"] <- 1
x2[ , "nbrs"] <- 2
x3[ , "nbrs"] <- 3
x4[ , "nbrs"] <- 4
x5[ , "nbrs"] <- 5
x.n2 <- list(x0, x1, x2, x3, x4, x5)

set.seed(555788)
ep.m1n2 <- ep(m1sc2, x.n2, vcov(m1sc2))

setwd(latex.dir)
pdf("ig-neighbors.pdf")

par(mar = c(4.5, 5, .1, .1))
plot(seq(-.1, 5.2, length = 6), ep.m1n2$pe, type = "n", ylim = c(0, 1), xlab = "", ylab = "", axes = FALSE)
title(xlab = "Neighbors Adopting Indian Gaming", line = 3, cex.lab = 2)
title(ylab = "Expected Probability of Adoption", line = 3.5, cex.lab = 2)
abline(h = seq(0, 1, .1), col = "black", lty = 3, lwd = 2)
abline(v = 0:5, col = "black", lty = 3, lwd = 2)
box()
rug(jitter(gaming$nbrs), ticksize = .015)
points(0:5, ep.m1n2$pe, pch = 19, lwd = 3)
lines(0:5, ep.m1n2$pe)
for(i in 1:6){
segments(i - 1, ep.m1n2$lo[i], i - 1, ep.m1n2$hi[i], lwd = 3)
}
text(0:5, ep.m1n2$hi + .05, round(ep.m1n2$pe, 2), cex = 1.75)
axis(1, cex.axis = 1.75)
axis(2, at = seq(0, 1, .1), las = 2, cex.axis = 1.5)

dev.off()

# Effect of source.adopt (with neighbors)
x0 <- x1 <- x2 <- x3 <- x4 <- x5 <- x6 <- x7 <- x8 <- x9 <- x10 <- model.matrix(m1sc2)
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
x10[ , "source.adopt"] <- 10
x.sc2 <- list(x0, x1, x2, x3, x4, x5, x6, x7, x8, x9, x10)

set.seed(733589)
ep.m1sc2 <- ep(m1sc2, x.sc2, vcov(m1sc2))

setwd(latex.dir)
pdf("ig-sources.pdf")

par(mar = c(4.5, 5, .1, .1))
plot(seq(-.16, 10.2, length = 11), ep.m1sc2$pe, type = "n", ylim = c(0, 1), xlab = "", ylab = "", axes = FALSE)
title(xlab = "Sources Adopting Indian Gaming", line = 3, cex.lab = 2)
title(ylab = "Expected Probability of Adoption", line = 3.5, cex.lab = 2)
abline(h = seq(0, 1, .1), col = "black", lty = 3, lwd = 2)
abline(v = 0:10, col = "black", lty = 3, lwd = 2)
box()
rug(jitter(gaming$source.adopt), ticksize = .015)
points(0:10, ep.m1sc2$pe, pch = 19, lwd = 3)
lines(0:10, ep.m1sc2$pe)
for(i in 1:11){
segments(i - 1, ep.m1sc2$lo[i], i - 1, ep.m1sc2$hi[i], lwd = 3)
}
text(seq(0, 10, by = 2), ep.m1sc2$hi[seq(1, 11, by = 2)] + .05, round(ep.m1sc2$pe[seq(1, 11, by = 2)], 2), cex = 1.75)
axis(1, at = 0:10, cex.axis = 1.75)
axis(2, at = seq(0, 1, .1), las = 2, cex.axis = 1.5)

dev.off()

