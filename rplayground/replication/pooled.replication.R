################################################################################
# "Persistent Policy Pathways: Inferring Diffusion                             #
# Networks in the American States"                                             #
# Bruce Desmarais, Jeff Harden, and Fred Boehmke                               #
# Replication File for Boehmke and Skinner (2012) [Pooled Model]               #
# Last update: 3/20/15                                                         #
################################################################################
## Packages and Data ##
library(foreign)
library(car)
library(boot)
library(MASS)
library(rms)

## Replicate Original Model ##
pooled <- read.dta("mkdata-pooled01.dta", convert.factors = FALSE)
pooled$src_lag_pct <- ifelse(pooled$src_35_300 > 0, pooled$src_lag/pooled$src_35_300, 0)

# Count each state's sources 

# Count of sources or percentage?
 pooled$sources <- pooled$src_lag
# pooled$sources <- pooled$src_lag_pct

m1 <- robcov(
lrm(adopt ~ nbrs_lag + rpcpinc + totpop + legp_king + citi6002 + unif_rep + unif_dem + minordiv + factor(state) + factor(year) + factor(policy), x = TRUE, y = TRUE, data = pooled),
cluster = pooled$statepol); gc()

## Substitute Sources for Neighbors ##
m1sc <- robcov(
lrm(adopt ~ sources + rpcpinc + totpop + legp_king + citi6002 + unif_rep + unif_dem + minordiv + factor(state) + factor(year) + factor(policy), x = TRUE, y = TRUE, data = pooled),
cluster = pooled$statepol); gc()

## Neighbors and Sources ##
m1sc2 <- robcov(
lrm(adopt ~ nbrs_lag + sources + rpcpinc + totpop + legp_king + citi6002 + unif_rep + unif_dem + minordiv + factor(state) + factor(year) + factor(policy), x = TRUE, y = TRUE, data = pooled),
cluster = pooled$statepol); gc()

## Model Fit ##
# AIC and BIC
AIC(m1); AIC(m1sc); AIC(m1sc2)
BIC(m1, m1sc, m1sc2)

# Function to compute PCC
cv.pcc <- function(model){
dat <- model$model
n <- nrow(dat)
# A vector to store the value of the linear predictor 
# on each observation when it is excluded
cv.lp <- numeric(n) 
for(i in 1:n){ # Loop through all the observations
# Estimate the model without observation i
cv.model <- glm(adopt ~ ., family = binomial (link = logit),
data = dat[-i, ]) 
# Calculate the value of the linear predictor for the left out observation
cv.lp[i] <- model.matrix(model)[i, ] %*% coef(cv.model) 
cat("Completed", i, "of", n, "\n")
}
predicted.cv <- inv.logit(cv.lp)
# The % correctly classified using CV computations
correct.cv <- mean(ifelse(model$y == rbinom(n, 1, predicted.cv), 1, 0))
return(list(predicted.cv = predicted.cv, correct.cv = correct.cv))
}
 
# PCC
set.seed(5347)
m1.pcc <- mean(ifelse(m1$y == rbinom(length(m1$y), 1, inv.logit(m1$linear.predictors)), 1, 0)) 
m1sc.pcc <- mean(ifelse(m1sc$y == rbinom(length(m1sc$y), 1, inv.logit(m1sc$linear.predictors)), 1, 0)) 
m1sc2.pcc <- mean(ifelse(m1sc2$y == rbinom(length(m1sc2$y), 1, inv.logit(m1sc2$linear.predictors)), 1, 0)) 
m1.pcc; m1sc.pcc; m1sc2.pcc

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
    sim.ep[i, j] <- mean(inv.logit(x[[j]] %*% as.matrix(sim.b[i, ])))
    cat("j =", j, "of", length(x), "; i =", i, "of", m, "\n")
    }
    }
  pe <- apply(sim.ep, 2, mean)
  lo <- apply(sim.ep, 2, quantile, prob = .025)
  hi <- apply(sim.ep, 2, quantile, prob = .975)
return(list(pe = pe, lo = lo, hi = hi))
}

# Effect of neighbors (no source.count)
x0 <- x1 <- x2 <- x3 <- x4 <- x5 <- x6 <- x7 <- x8 <- model.matrix(m1)
x0[ , "nbrs_lag"] <- 0
x1[ , "nbrs_lag"] <- 1
x2[ , "nbrs_lag"] <- 2
x3[ , "nbrs_lag"] <- 3
x4[ , "nbrs_lag"] <- 4
x5[ , "nbrs_lag"] <- 5
x6[ , "nbrs_lag"] <- 6
x7[ , "nbrs_lag"] <- 7
x8[ , "nbrs_lag"] <- 8
x.n <- list(x0, x1, x2, x3, x4, x5, x6, x7, x8)

set.seed(5587788); gc()
ep.m1n <- ep(m1, x.n, m1$var)

pooled.jitter.n <- rep(0:8, each = 200)

pdf("po-neighbors-nsc.pdf")

par(mar = c(4.5, 5, .1, .1))
plot(seq(-.2, 8.2, length = 9), ep.m1n$pe, type = "n", ylim = c(0, 1), xlab = "", ylab = "", axes = FALSE)
title(xlab = "Neighbors Adopting Policy", line = 3, cex.lab = 2)
title(ylab = "Expected Probability of Adoption", line = 3.5, cex.lab = 2)
abline(h = seq(0, 1, .1), col = "black", lty = 3, lwd = 2)
abline(v = 0:8, col = "black", lty = 3, lwd = 2)
box()
rug(jitter(pooled.jitter.n), ticksize = .015)
points(0:8, ep.m1n$pe, pch = 19, lwd = 3)
lines(0:8, ep.m1n$pe)
for(i in 1:9){
segments(i - 1, ep.m1n$lo[i], i - 1, ep.m1n$hi[i], lwd = 3)
}
text(0:8, ep.m1n$hi + .05, round(ep.m1n$pe, 2), cex = 1.75)
axis(1, at = 0:8, cex.axis = 1.75)
axis(2, at = seq(0, 1, .1), las = 2, cex.axis = 1.5)

dev.off()

# Effect of source.count (no neighbors)
x0 <- x1 <- x2 <- x3 <- x4 <- x5 <- x6 <- x7 <- x8 <- x9 <- x10 <- x11 <- x12 <- x13 <- x14 <- model.matrix(m1sc)
x0[ , "sources"] <- 0
x1[ , "sources"] <- 1
x2[ , "sources"] <- 2
x3[ , "sources"] <- 3
x4[ , "sources"] <- 4
x5[ , "sources"] <- 5
x6[ , "sources"] <- 6
x7[ , "sources"] <- 7
x8[ , "sources"] <- 8
x9[ , "sources"] <- 9
x10[ , "sources"] <- 10
x11[ , "sources"] <- 11
x12[ , "sources"] <- 12
x13[ , "sources"] <- 13
x14[ , "sources"] <- 14
x.sc <- list(x0, x1, x2, x3, x4, x5, x6, x7, x8, x9, x10, x11, x12, x13, x14)

set.seed(557839938); gc()
ep.m1sc <- ep(m1sc, x.sc, m1sc$var)

pooled.jitter.sc <- c(rep(0:11, each = 100), rep(12:14, times = c(79, 29, 17)))
setwd(latex.dir)
pdf("po-sources-nn.pdf")

par(mar = c(4.5, 5, .1, .1))
plot(seq(-.25, 14.25, length = 15), ep.m1sc$pe, type = "n", ylim = c(0, 1), xlab = "", ylab = "", axes = FALSE)
title(xlab = "Sources Adopting Policy", line = 3, cex.lab = 2)
title(ylab = "Expected Probability of Adoption", line = 3.5, cex.lab = 2)
abline(h = seq(0, 1, .1), col = "black", lty = 3, lwd = 2)
abline(v = 0:14, col = "black", lty = 3, lwd = 2)
box()
rug(jitter(pooled.jitter.sc), ticksize = .015)
points(0:14, ep.m1sc$pe, pch = 19, lwd = 3)
lines(0:14, ep.m1sc$pe)
for(i in 1:15){
segments(i - 1, ep.m1sc$lo[i], i - 1, ep.m1sc$hi[i], lwd = 3)
}
text(c(0, 5, 10, 14), (ep.m1sc$hi[c(1, 6, 11, 15)] + .05), round(ep.m1sc$pe[c(1, 6, 11, 15)], 2), cex = 1.75)
axis(1, at = seq(0, 14, by = 2), cex.axis = 1.75); axis(1, at = seq(1, 15, by = 2), cex.axis = 1.75)
axis(2, at = seq(0, 1, .1), las = 2, cex.axis = 1.5)

dev.off()

# Effect of neighbors (with source.count)
x0 <- x1 <- x2 <- x3 <- x4 <- x5 <- x6 <- x7 <- x8 <- model.matrix(m1sc2)
x0[ , "nbrs_lag"] <- 0
x1[ , "nbrs_lag"] <- 1
x2[ , "nbrs_lag"] <- 2
x3[ , "nbrs_lag"] <- 3
x4[ , "nbrs_lag"] <- 4
x5[ , "nbrs_lag"] <- 5
x6[ , "nbrs_lag"] <- 6
x7[ , "nbrs_lag"] <- 7
x8[ , "nbrs_lag"] <- 8
x.n2 <- list(x0, x1, x2, x3, x4, x5, x6, x7, x8)

set.seed(5115788); gc()
ep.m1n2 <- ep(m1sc2, x.n2, m1sc2$var)

setwd(latex.dir)
pdf("po-neighbors.pdf")

par(mar = c(4.5, 5, .1, .1))
plot(seq(-.2, 8.2, length = 9), ep.m1n2$pe, type = "n", ylim = c(0, 1), xlab = "", ylab = "", axes = FALSE)
title(xlab = "Neighbors Adopting Policy", line = 3, cex.lab = 2)
title(ylab = "Expected Probability of Adoption", line = 3.5, cex.lab = 2)
abline(h = seq(0, 1, .1), col = "black", lty = 3, lwd = 2)
abline(v = 0:8, col = "black", lty = 3, lwd = 2)
box()
rug(jitter(pooled.jitter.n), ticksize = .015)
points(0:8, ep.m1n2$pe, pch = 19, lwd = 3)
lines(0:8, ep.m1n2$pe)
for(i in 1:9){
segments(i - 1, ep.m1n2$lo[i], i - 1, ep.m1n2$hi[i], lwd = 3)
}
text(0:8, ep.m1n2$hi + .05, round(ep.m1n2$pe, 2), cex = 1.75)
axis(1, at = 0:8, cex.axis = 1.75)
axis(2, at = seq(0, 1, .1), las = 2, cex.axis = 1.5)

dev.off()

# Effect of source.count (with neighbors)
x0 <- x1 <- x2 <- x3 <- x4 <- x5 <- x6 <- x7 <- x8 <- x9 <- x10 <- x11 <- x12 <- x13 <- x14 <- model.matrix(m1sc2)
x0[ , "sources"] <- 0
x1[ , "sources"] <- 1
x2[ , "sources"] <- 2
x3[ , "sources"] <- 3
x4[ , "sources"] <- 4
x5[ , "sources"] <- 5
x6[ , "sources"] <- 6
x7[ , "sources"] <- 7
x8[ , "sources"] <- 8
x9[ , "sources"] <- 9
x10[ , "sources"] <- 10
x11[ , "sources"] <- 11
x12[ , "sources"] <- 12
x13[ , "sources"] <- 13
x14[ , "sources"] <- 14
x.sc2 <- list(x0, x1, x2, x3, x4, x5, x6, x7, x8, x9, x10, x11, x12, x13, x14)

set.seed(55738338); gc()
ep.m1sc2 <- ep(m1sc2, x.sc2, m1sc2$var)

setwd(latex.dir)
pdf("po-sources.pdf")

par(mar = c(4.5, 5, .1, .1))
plot(seq(-.25, 14.25, length = 15), ep.m1sc2$pe, type = "n", ylim = c(0, 1), xlab = "", ylab = "", axes = FALSE)
title(xlab = "Sources Adopting Policy", line = 3, cex.lab = 2)
title(ylab = "Expected Probability of Adoption", line = 3.5, cex.lab = 2)
abline(h = seq(0, 1, .1), col = "black", lty = 3, lwd = 2)
abline(v = 0:14, col = "black", lty = 3, lwd = 2)
box()
rug(jitter(pooled.jitter.sc), ticksize = .015)
points(0:14, ep.m1sc2$pe, pch = 19, lwd = 3)
lines(0:14, ep.m1sc2$pe)
for(i in 1:15){
segments(i - 1, ep.m1sc2$lo[i], i - 1, ep.m1sc2$hi[i], lwd = 3)
}
text(c(0, 5, 10, 14), (ep.m1sc2$hi[c(1, 6, 11, 15)] + .05), round(ep.m1sc2$pe[c(1, 6, 11, 15)], 2), cex = 1.75)
axis(1, at = seq(0, 14, by = 2), cex.axis = 1.75); axis(1, at = seq(1, 15, by = 2), cex.axis = 1.75)
axis(2, at = seq(0, 1, .1), las = 2, cex.axis = 1.5)

dev.off()
