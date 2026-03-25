---
title: Context on AWS Spot prices
order: 1
date: 2026-03-14
group: AWS SPOT
---

> These articles are based on my bachelors thesis, available [here in Spanish](/assets/thesis.pdf).

AWS sells unused data center capacity through Spot Instances at up to 90% off on-demand pricing, with the caveat that any instance can be reclaimed with two minutes notice. For batch workloads that tolerate interruptions (ML training, data processing, CI/CD), the discount is large enough to design around.

Prices also fluctuate. They change roughly three times a day on average, driven by supply and demand of AWS's idle capacity, and other (rather unknown) factors. The spread between the cheapest and most expensive window can be substantial, and if you can anticipate when prices will drop, you can schedule workloads for those moments. Savings on top of the Spot discount itself.

![[spot-price-volatility.png|Price of c5n.xlarge in eu-north-1a from Jan 2024 to Mar 2025]]

This project aed to build a prediction system for Spot prices, accurate enough to inform scheduling decisions, and serve it through an API that orchestrators like Apache Airflow can query.

## Constraints

1. AWS's `describe_spot_price_history` API only goes back 90 days. Not enough to capture seasonal patterns or long-term structural behavior. To get a longer history you have to build your own capture system and let it accumulate over time.

2. The pricing algorithm is proprietary. Since AWS replaced the old auction model in 2017/2018 with a supply/demand mechanism, prices move gradually, but the actual factors behind them are undisclosed. You work from outputs only.

3. Every combination of region, availability zone, instance type, and OS generates its own price series, easily thousands of them. Training a dedicated model per series was not viable; the system needed a model that generalizes across all of them without retraining for each one.

I developed this as my bachelor's thesis at Universidad de Zaragoza, in collaboration with Universitat Rovira i Virgili (URV), who integrated the system into their research pipelines and migrated their batch workloads to Spot. 
