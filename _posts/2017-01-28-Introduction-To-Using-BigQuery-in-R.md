---
layout: post
title:  "An Introduction to Using Google BigQuery in R"
author: Jon Starnes
date:   2017-01-28 22:03:45
comments: true
tags:   [bigrquery, ggplot2, Google BigQuery, SQL]
categories: [blog, Big Data, blogNew, SQL]
---

Google BigQuery is an enterprise data warehouse that allows users to store massive datasets and access them with super-fast SQL queries that harness the processing power of Google's infrastructure. BigQuery is also home to large public datasets including the Medicare dataset used here. The Google Cloud project overall is a great place to start exploring open data and learning more about the various Google APIs created for the access and presentation of Big Data (Terrabyte+).

In this tutorial we will set up a Google BigQuery account, set up and test a sample SQL query on the Medicare data in the BigQuery API, then set up and access the data in R to report a simple table and plot of the sampled Medicare data. The examples include a walk-through of setting up the Google BigQuery account properly, two sample SQL queries of the Medicare dataset, and tables and barplots that highlight the provider specialties and states with the ten highest expenditures for Medicare Part D prescriptions.

<br>

#### Quick Setup Instructions for BigQuery Account

You will need a current Google or gmail account to get started. Log in to your Google/Gmail account and then follow the first link below to start a Google Cloud account and project. Follow this short list below. For more a more detailed walkthrough of setting up Google BigQuery check out how the instructions at this blog on [Setting up Google BigQuery](https://blog.exploratory.io/setting-up-google-bigquery-5459043667dd#.2wcqc6cfj){:target='blank'}


Go to [Google APIs Console](https://console.developers.google.com/apis/){:target='blank'}

* Clink on <em><b>BigQuery API</b></em>.

* If you see a warning or pop-up for <em><b>Create a project</b></em>, accept it then name your project. Use only lower-case letters, dashes and numbers when naming your project. Otherwise, bigrquery may not play nice with BigQuery.
If you do not see a pop-up warning asking you to start a new project, look for a <em>Create a project</em> pull-down or button in the BigQuery console.

* View your new [project dashboard](https://console.cloud.google.com/){:target='blank'}.

<br>

#### Testing our Query in the BigQuery API

Now lets look at the Medicare table we will be using in this excercise.

[Medicare Part D Prescribers 2014, Schema](https://bigquery.cloud.google.com/table/bigquery-public-data:medicare.part_d_prescriber_2014?tab=schema){:target='blank'}


To find the table size and number of rows in the Medicare Part D table, follow the link above and then click on 'Details'. The dataset is 3.17GB and has over 24 million rows. Until you have a design plan, it's probably a good idea to start on the smaller side to explore this data. Query processing is free up to 1 TB. Carefully planned exploratory queries will prevent charges from the Google API service.

Use the table schema above to pick fields to use in the first go at exploring the data.

Since the SQL queries will import aggregated numbers as integers, import them using SQL's ROUND feature to insure that your numbers are floats with two decimals. Do this with the query to save time later.

<br>

#### SQL Query

Next, let's add our SQL query and save it to an r object. We will simply assign the whole query as a string and then call it using the query_exec function in 'bigrquery'.

{% highlight r %}
sql1 = "SELECT specialty_description AS specialty,
  ROUND(SUM(total_claim_count), 2) AS total_claims,
  ROUND(SUM(bene_count), 2) AS total_beneficiaries,
  ROUND(SUM(total_drug_cost), 2) AS total_cost,
  ROUND(AVG(total_drug_cost), 2) AS avg_cost
  FROM [bigquery-public-data.medicare.part_d_prescriber_2014]
  GROUP BY specialty
  ORDER BY total_cost DESC
  LIMIT 10;"
{% endhighlight %}


If your query ran without error then you should see a newly generated preview of your results in a table below where you wrote your query.

<br>

### Setting up R for BigQuery

Working with BigQuery requires additional setup. First install devtools, then 'httpuv' for listening to and interacting with HTTP and WebSocket clients. Then install The bigrquery package.

<br>

#### Install Required Packages

{% highlight r %}
install.packages('devtools')
devtools::install_github("assertthat")
install.packages('httpuv')
# BigQuery Package
devtools::install_github("bigrquery")
{% endhighlight %}

<br>

#### Load Required Libraries
Then attach the required libraries for querying Google BigQuery.

{% highlight r %}
library(devtools)
library(httpuv)
library(bigrquery)
{% endhighlight %}

<br>

#### BigQuery Account information

Add your BigQuery account as objects that we will call on in the next steps.

{% highlight r %}
projectID = "R-and-BigQuery-Medicare"
datasetID = "medicare_partD_prescribers"
{% endhighlight %}


<br>

#### Run and Save a Query

Next, run a query. The query below is using the objects we saved earlier, and results in a new data file called "data1".

{% highlight r %}
data1 = query_exec(sql1, project = projectID)
{% endhighlight %}

<br>

### View the New Data

The result of this first query is the top ten prescription costs by care provider specialty. The SQL query for BigQuery aggregated the Medicare Part D data into totals for claims, Medicare Part D Beneficiaries, and drug costs(prescriptions) and the average (mean) drug cost.

{% highlight r %}
load("~/bigquery_example.RData")
{% endhighlight %}


Here is a first look at what is in the first data query.

<br>

#### Table 1: Top 10 Specialties with the Highest Drug Costs

{% highlight r %}
library(htmlTable)
htmlTable(format(data1[1:5], big.mark=",", scientific=FALSE),
          header =  paste(c("Specialty", "Claims",
                            "Beneficiaries", "Total Cost", "Avg. Cost")),
                          css.cell = "padding-left: .5em; padding-right: .2em;")
{% endhighlight %}

<br>

<table class="gmisc_table" style="border-collapse: collapse; margin-top: 1em; margin-bottom: 1em;">
<thead>
<tr>
<th style="border-bottom: 1px solid grey; border-top: 2px solid grey;">
</th>
<th style="border-bottom: 1px solid grey; border-top: 2px solid grey; text-align: center;">
Specialty
</th>
<th style="border-bottom: 1px solid grey; border-top: 2px solid grey; text-align: center;">
Claims
</th>
<th style="border-bottom: 1px solid grey; border-top: 2px solid grey; text-align: center;">
Beneficiaries
</th>
<th style="border-bottom: 1px solid grey; border-top: 2px solid grey; text-align: center;">
Total Cost
</th>
<th style="border-bottom: 1px solid grey; border-top: 2px solid grey; text-align: center;">
Avg. Cost
</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">
1
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
Internal Medicine
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
385,878,260
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
75,632,169
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
22,984,632,037
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
3,348.88
</td>
</tr>
<tr>
<td style="text-align: left;">
2
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
Family Practice
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
361,432,334
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
67,269,092
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
18,255,475,412
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
2,554.00
</td>
</tr>
<tr>
<td style="text-align: left;">
3
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
Nurse Practitioner
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
77,806,940
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
15,976,609
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
6,402,619,812
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
3,088.91
</td>
</tr>
<tr>
<td style="text-align: left;">
4
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
Neurology
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
18,611,279
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
2,712,173
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
5,087,737,347
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
13,004.47
</td>
</tr>
<tr>
<td style="text-align: left;">
5
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
Psychiatry
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
40,916,821
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
5,427,422
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
4,191,868,687
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
6,190.20
</td>
</tr>
<tr>
<td style="text-align: left;">
6
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
Cardiology
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
67,063,399
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
14,138,640
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
4,039,385,824
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
4,098.10
</td>
</tr>
<tr>
<td style="text-align: left;">
7
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
Hematology/Oncology
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
5,323,398
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
981,381
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
3,467,281,174
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
20,675.38
</td>
</tr>
<tr>
<td style="text-align: left;">
8
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
Gastroenterology
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
10,338,099
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
3,126,280
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
3,099,043,158
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
13,645.56
</td>
</tr>
<tr>
<td style="text-align: left;">
9
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
Physician Assistant
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
40,437,509
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
10,237,398
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
3,020,290,520
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
2,695.39
</td>
</tr>
<tr>
<td style="border-bottom: 2px solid grey; text-align: left;">
10
</td>
<td style="padding-left: .5em; padding-right: .2em; border-bottom: 2px solid grey; text-align: center;">
Rheumatology
</td>
<td style="padding-left: .5em; padding-right: .2em; border-bottom: 2px solid grey; text-align: center;">
10,880,367
</td>
<td style="padding-left: .5em; padding-right: .2em; border-bottom: 2px solid grey; text-align: center;">
2,211,941
</td>
<td style="padding-left: .5em; padding-right: .2em; border-bottom: 2px solid grey; text-align: center;">
2,457,641,511
</td>
<td style="padding-left: .5em; padding-right: .2em; border-bottom: 2px solid grey; text-align: center;">
15,470.10
</td>
</tr>
</tbody>
</table>

<br>

#### Figure 1: Top 10 Specialty Providers with the Highest Drug Costs

And a simple bar plot of the top ten provider categories.

{% highlight r %}
library(ggplot2)
library(scales)
ggplot(data1, aes(x = reorder(specialty, -total_cost), y = total_cost, fill = specialty)) +
    geom_bar(stat = "identity") +
    xlab("Provider Specialty") +
    ylab("Total Cost") +
    scale_y_continuous(labels = dollar) +
    theme(axis.ticks.x=element_blank(),
          legend.position = "none",
          axis.text.x=element_text(angle=90,hjust=1.05,vjust=0.5))
{% endhighlight %}

<br>

![Top 10 Specialty Providers with the Highest Drug Costs](/img/blog/post004_plot1.png){: height="100%" width="100%"}

<br>

### Top 10 States with the Highest Part D Costs

The second query below is grouped by state name and will query the top 10 states with the highest total Medicare Part D drug cost.
<br>


{% highlight r %}
sql2 =
"SELECT nppes_provider_state AS state,
ROUND(SUM(total_claim_count), 2) AS total_claims,
ROUND(SUM(bene_count), 2) AS total_beneficiaries,
ROUND(SUM(total_drug_cost), 2) AS total_cost,
ROUND(AVG(total_claim_count), 2) AS avg_claims,
ROUND(AVG(bene_count), 2) AS avg_beneficiaries,
ROUND(AVG(total_drug_cost), 2) AS avg_cost
FROM
 [bigquery-public-data.medicare.part_d_prescriber_2014]
GROUP BY state
ORDER BY total_cost DESC
LIMIT 10;"
{% endhighlight %}


One more time with another query and a table view of the data.

{% highlight r %}
data2 = query_exec(sql2, project = projectID)
{% endhighlight %}

<br>

#### Table 2: Top 10 Specialties with the Highest Drug Costs

A quick table view of the second query data.


{% highlight r %}
library(htmlTable)
htmlTable(format(data2[1:5], big.mark=",", scientific=FALSE),
          header =  paste(c("State", "Claims",
                            "Beneficiaries", "Total Cost", "Avg. Cost")),
                          css.cell = "padding-left: .5em; padding-right: .2em;")
{% endhighlight %}

<br>

<table class="gmisc_table" style="border-collapse: collapse; margin-top: 1em; margin-bottom: 1em;">
<thead>
<tr>
<th style="border-bottom: 1px solid grey; border-top: 2px solid grey;">
</th>
<th style="border-bottom: 1px solid grey; border-top: 2px solid grey; text-align: center;">
State
</th>
<th style="border-bottom: 1px solid grey; border-top: 2px solid grey; text-align: center;">
Claims
</th>
<th style="border-bottom: 1px solid grey; border-top: 2px solid grey; text-align: center;">
Beneficiaries
</th>
<th style="border-bottom: 1px solid grey; border-top: 2px solid grey; text-align: center;">
Total Cost
</th>
<th style="border-bottom: 1px solid grey; border-top: 2px solid grey; text-align: center;">
Avg. Cost
</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">
1
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
CA
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
116,446,642
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
25,742,811
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
9,633,893,459
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
4,162.26
</td>
</tr>
<tr>
<td style="text-align: left;">
2
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
NY
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
79,575,358
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
16,066,653
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
7,522,274,092
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
4,557.87
</td>
</tr>
<tr>
<td style="text-align: left;">
3
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
FL
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
91,446,623
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
22,514,043
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
6,969,934,015
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
4,325.70
</td>
</tr>
<tr>
<td style="text-align: left;">
4
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
TX
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
75,687,823
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
17,798,120
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
6,462,968,508
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
4,389.77
</td>
</tr>
<tr>
<td style="text-align: left;">
5
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
PA
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
62,949,047
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
11,754,376
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
4,842,161,770
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
3,939.50
</td>
</tr>
<tr>
<td style="text-align: left;">
6
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
OH
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
53,497,321
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
11,156,950
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
4,050,839,095
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
4,043.17
</td>
</tr>
<tr>
<td style="text-align: left;">
7
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
NC
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
46,022,957
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
9,272,742
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
3,358,005,546
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
3,831.88
</td>
</tr>
<tr>
<td style="text-align: left;">
8
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
MI
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
39,464,395
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
9,251,248
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
3,193,749,462
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
3,874.71
</td>
</tr>
<tr>
<td style="text-align: left;">
9
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
IL
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
42,529,201
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
8,206,059
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
3,120,751,393
</td>
<td style="padding-left: .5em; padding-right: .2em; text-align: center;">
3,601.20
</td>
</tr>
<tr>
<td style="border-bottom: 2px solid grey; text-align: left;">
10
</td>
<td style="padding-left: .5em; padding-right: .2em; border-bottom: 2px solid grey; text-align: center;">
NJ
</td>
<td style="padding-left: .5em; padding-right: .2em; border-bottom: 2px solid grey; text-align: center;">
29,243,495
</td>
<td style="padding-left: .5em; padding-right: .2em; border-bottom: 2px solid grey; text-align: center;">
6,216,323
</td>
<td style="padding-left: .5em; padding-right: .2em; border-bottom: 2px solid grey; text-align: center;">
2,980,197,009
</td>
<td style="padding-left: .5em; padding-right: .2em; border-bottom: 2px solid grey; text-align: center;">
4,582.87
</td>
</tr>
</tbody>
</table>

<br>

#### Figure 2: Top 10 States with the Highest Drug Costs

A quick plot of the data for a quick visual reference.


{% highlight r %}
ggplot(data2, aes(x = reorder(state, -total_cost), y = total_cost, fill = state)) +
    geom_bar(stat = "identity") +
    xlab("US States") +
    ylab("Total Cost") +
    scale_y_continuous(labels = dollar) +
    theme(axis.ticks.x=element_blank(),
          legend.position = "none",
          axis.text.x=element_text(angle=90,hjust=1.05,vjust=0.5))
{% endhighlight %}

<br>

![Top 10 States with the Highest Drug Costs](/img/blog/post004_plot2.png){: height="100%" width="100%"}

Using BigQuery with R takes a little setup but it offers a great deal of flexibility for your workflow. The above was just the basics of how to get started and see the data. If your work environment and wallet will support it you can query and save subsets or large sets of big data and complete your analysis reporting in R.
