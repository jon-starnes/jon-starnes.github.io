---
layout: post
title:  "Bureau of Labor Statistics Data with blscrapeR: US Unemployment: Supplemental Materials"
author: Jon Starnes
date:   2016-08-23 00:10:45
comments: true
tags: [Barack Obama, Bill Clinton, blscrapeR, ggplot2, George W. Bush, unemployment rates, underutilized labor]
categories: [blog, blscrapeR, Bureau of Labor Statistics, Open Data, R]
---

### Supplemental Materials
*Here is where in all future posts you will find a review of the coding steps used to produce the data. I decided to seperate the main overview and results from the code for now so that the data could be the star and the steps getting there could be reviewed if desired. If I decide to do a real tutorial or feature tutorials, the format will change.*

The blscrapeR package is an API wrapper for BLS datasets. Querying and pulling data through R and into project scripts or knitr documents is fast and seamless. What follows below is a basic example of how to extract open access data from a public source and explore it using the free and open source R language and environment for statistical computing and graphics.  

Visiting the Burea of Labor Statistics site may be the best first step. The BLS assigns series numbers to their datasets listed on the [bls.gov](http://www.bls.gov/news.release/empsit.t15.htm) site. After finding the series numbers you want, move back to R to install and load the blscrapeR API.  



#### Step 1
*Scraping Data from the BLS*  


First install the blscrapeR package, then open data from the BLS and save it to a dataset or datasets in the R workspace.


```
suppressMessages(install.packages('blscrapeR'))
library(blscrapeR)

bls_2000 <- bls_api(c("LNS13327709", "LNS14000000"),
                       startyear = 1993, endyear = 2000)

bls_2008 <- bls_api(c("LNS13327709", "LNS14000000"),
                    startyear = 2001, endyear = 2008)

bls_2016 <- bls_api(c("LNS13327709", "LNS14000000"),
                    startyear = 2009, endyear = 2016)

```




It's always a good idea to do a spot check or 'sanity check' of the data before moving ahead.

*Note: I converted the seriesID character data into factor data (2 values), then reversed the factor order so that unemployed and under-employed data would be colored and shown in the order presented above.*


```
head(bls_2000, 5)

```

      year period periodName value footnotes    seriesID       date
    1 2000    M12   December   3.9           LNS14000000 2000-12-31
    2 2000    M11   November   3.9           LNS14000000 2000-11-30
    3 2000    M10    October   3.9           LNS14000000 2000-10-31
    4 2000    M09  September   3.9           LNS14000000 2000-09-30
    5 2000    M08     August   4.1           LNS14000000 2000-08-31



```
tail(bls_2008, 5)

```

        year period periodName value footnotes    seriesID       date
    188 2006    M05        May   8.2           LNS13327709 2006-05-31
    189 2006    M04      April   8.1           LNS13327709 2006-04-30
    190 2006    M03      March   8.2           LNS13327709 2006-03-31
    191 2006    M02   February   8.4           LNS13327709 2006-02-28
    192 2006    M01    January   8.4           LNS13327709 2006-01-31




#### Step 3 - Code the Plots
Code used for the plots. I started in RStudio using ggplot since I am more familiar with it.
The custom theme and the first plot code are below.  


#### Clinton years plot


```
library(ggplot2)
library(viridis)

# Basic plot
g2000 <-
ggplot(data=bls_2000, aes(x = date, y = value, color=(seriesID))) +
  coord_cartesian(ylim=c(4, 20)) +
  geom_line(size=1.5, alpha=0.30) +
  geom_point(size=0.3, alpha=0.90) +
  scale_color_viridis(discrete=TRUE,
                      labels=c("U-3 - Unemployment Rate",
                               "U-6 - Under Employed")) +
  scale_x_date(date_breaks = ("1 year"), date_labels = "%Y") +
  xlab("Year") +
  ylab("Percent")

# Custom theme
  theme_basic <-
    theme_bw() +
    theme(legend.key = element_rect(fill=NA),
          legend.position="top", legend.title=element_blank(),
          axis.title.y = element_text(margin = margin(l = 0, r = 10)),
          axis.title.x = element_text(margin = margin(t = 10)),
          legend.background = element_rect(fill = "white"),
          panel.grid.minor = element_line(colour = "#f3f3f3"),
          panel.grid.major = element_line(colour = "#DADADA"),
          text = element_text(family = "sans",
                              face = "plain", colour = "black", size = 12))

# Run and save
g2000 + theme_basic

```
