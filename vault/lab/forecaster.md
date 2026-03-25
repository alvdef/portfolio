---
title: Training a regional forecaster
order: 3
date: 2026-02-15
group: AWS SPOT
---

Spot price forecasting is complicated by scale. Thousands of time series behave differently from each other: `c5.xlarge` in Stockholm and `c5.24xlarge` in Tokyo share neither scale, volatility, nor rhythm. Training one model per series is not feasible, and every new instance type AWS launches would require retraining.

The solution was a regional model: one per AWS region, trained on all the series within that region simultaneously. Regions are natural boundaries because they function as independent markets, and within a region, series share enough structural behavior (driven by common supply/demand dynamics) to make joint training viable.

Each series is normalized individually before training. Two instances from the same family and generation can diverge by 694% in mean price, so a global normalization would collapse the structure entirely. Per-instance z-score normalization keeps the relative fluctuations meaningful. During inference, predictions are denormalized using the same per-instance parameters; for unseen instance types, the system falls back to the mean of all known parameters.

![[spot-price-divergence.png|c5n.xlarge vs c7a.32xlarge in eu-north-1, same family, 694% divergence in mean price]]

## Architectures

I explored three architectures of increasing complexity.

The baseline was a vanilla RNN using LSTM or GRU cells, projecting the final hidden state directly to the full prediction horizon. Simple, fast, a reference point.

A Seq2Seq model added encoder-decoder structure with multi-head attention. The encoder processes the input into a context representation; the decoder generates predictions step by step, using attention to focus on the most relevant parts of the input at each timestep. I used GRU cells for both encoder and decoder to keep computational cost comparable to the baseline despite the added structural complexity.

The FeatureSeq2Seq extended this by integrating static instance features (family, generation, size, processor architecture). These features are processed through a subnet and fused with the encoder output before being passed to the decoder. The hypothesis was that different instance types have distinct price dynamics, and providing that context explicitly should help the model learn type-specific patterns.

## What the experiments showed

Of everything I tuned, the timestep made the biggest difference.

Setting it to 12 hours instead of 4 reduced short-term MAPE by 25.8% and training time by 65.5%. At 4-hour granularity, most data points between actual price changes just repeated the previous value, so the model spent its capacity learning to reproduce stale inputs. At 12 hours the signal is real. The improvement came from matching the data representation to the market's actual rhythm (mean time between price changes: 6.6 hours).

GRU consistently outperformed LSTM across metrics. LSTM has more parameters and theoretically more capacity to capture long-range dependencies, but GRU optimized better on this data. The signal in Spot price series apparently does not require the extra gating mechanism; the simpler cell generalized better and was less prone to overfitting.

Scaling the hidden layer beyond 256 neurons confirmed this. At 512 and 1024, long-horizon error exploded (MAPE 5-20d went from 21.56% to 36.33% and 48.88%) while training cost more than doubled. The model was memorizing noise. 256 was the sweet spot.

## Inference

Each model predicts a fixed window of 4 days directly (8 timesteps at 12h granularity). For longer horizons, the system extends the forecast autoregressively: predicted values are fed back as input for the next prediction block. Errors accumulate as the horizon grows; MAPE at day 4 is around 13%, by day 20 it reaches around 22%. Most scheduling decisions operate on a 3 to 7 day window, where accuracy is highest.

![[spot-mape-degradation.png|MAPE degradation over the prediction horizon, comparing 2-day vs 4-day prediction windows]]

Predictions are served through a FastAPI endpoint that takes region, availability zone, instance type, OS, and desired horizon as parameters. The API handles the full pipeline internally: pulling historical data from the database, running per-instance normalization, executing the model, and denormalizing the output back to actual prices.
