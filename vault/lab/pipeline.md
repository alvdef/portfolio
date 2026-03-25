---
title: Building the data pipeline
order: 2
date: 2026-03-23
group: AWS SPOT
---

The pipeline's job was to overcome AWS's 90-day history limit. The `describe_spot_price_history` API returns up to 90 days of prices for any instance/AZ/region combination, which is not enough for training. You miss seasonal patterns and most structural behavior. The fix was to poll the API on a schedule and store everything.

The capture system is fully serverless. Lambda functions, triggered by EventBridge cron rules, handle each data source. These are lightweight extraction tasks that run in seconds and sit well within Lambda's limits. There was no reason to keep a dedicated EC2 instance running for this kind of workload.

Four sources feed the pipeline. Spot prices are collected hourly through the AWS SDK, each data point identified by the unique combination of region, availability zone, instance type, and OS. On-demand prices and instance metadata (vCPU count, memory, processor architecture) are fetched conditionally when a new instance type appears in the Spot data. Benchmark scores from Sparecores provide performance-per-cost analysis. Eviction risk rates come from AWS's Spot Advisor, a semi-official source that aggregates over several days rather than updating in real time, which limits its reliability. Still worth collecting since no official historical record exists and acquisition is trivial.

For storage, I chose PostgreSQL on RDS. The schema had to hold more than time-series prices: instance metadata, benchmark results, eviction rates, on-demand reference prices. A relational model with foreign keys was the natural fit for this kind of structured, interconnected data. I considered purpose-built alternatives like Amazon Timestream, but the heterogeneity of the data ruled out a pure time-series store. The price table uses BRIN indices on the timestamp column (more efficient than B-trees for range queries over dense, append-ordered data) and range partitioning via pg_partman to keep query performance stable as the table grows.

I stored prices at their native granularity: second-precision timestamps, one row per price change event, no resampling upfront. This preserved flexibility for the analysis phase, where the right temporal resolution ended up being one of the most consequential findings.

## Data characterization

After several months of data collection, the analysis of the captured data drove two decisions that influenced the final model more than any architectural choice.

The mean time between price changes is 6.6 hours, with the distribution peaking between 5 and 8 hours. Sampling at 4-hour intervals was mostly redundant because the majority of those data points just repeated the previous price. When I later switched to 12-hour timesteps for the model, training time dropped by 67% and MAPE improved by 22.2%. The improvement came from matching the model's temporal resolution to the market's actual rhythm.

![[spot-update-intervals.png|Distribution of time between price updates across all instances]]

Regions behave as independent markets. The same instance type in `eu-west-1` and `us-west-1` can have completely different price dynamics with no correlation between them. This ruled out a single global model and established the regional approach: one model per region, trained on all the series within that region simultaneously.

![[spot-regional-independence.png|Same instance type across regions and AZs showing independent price dynamics]]

For the main experiments, I selected `eu-north-1` (Stockholm) as the primary test region. The volatility analysis ranked it 5th globally, making it one of the more dynamic markets. Developing and validating on a difficult case gives more confidence that the approach generalizes; once the model held up in Stockholm, validating it in more stable regions was confirmatory.
