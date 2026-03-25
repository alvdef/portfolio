---
title: When a worse model wins
order: 4
date: 2026-03-18
group: AWS SPOT
---

Evaluating this system required more than prediction accuracy. A lower MAPE does not necessarily translate to greater practical value, because what matters for scheduling decisions is whether the model correctly identifies when to wait and when to execute. A model can mispredict the exact price and still correctly signal that prices will drop in the next 12 hours, and for scheduling purposes that model is more useful than one that predicts the price precisely but misses the trend.

I designed four business-oriented metrics alongside the standard error metrics:

- **Trend accuracy** measures whether the model correctly predicts the direction of price movement. Only counted for moves above a significance threshold, since small fluctuations do not affect scheduling decisions.
- **Cost savings** quantifies the percentage saving from following the model's timing recommendation versus executing immediately.
- **Perfect information savings** is the maximum saving available in the window, assuming you knew all future prices. An upper bound.
- **Savings efficiency** captures the fraction of that maximum the model actually achieves, normalizing for how much opportunity the market offered in the first place.

## Training data diversity

The model trained exclusively on x86_64 data achieved a MAPE of 16.41%, the lowest of any configuration. A model trained on a mixed dataset including ARM instances had a MAPE of 20.62%, about 25% worse.

Its savings efficiency, however, was 16.3% versus 7.8%. The less accurate model roughly doubled the practical value.

This was against my initial hypothesis. I expected more diverse training data to improve accuracy, and instead it degraded it. What happened is that training on more heterogeneous data pushed the model toward learning general patterns of price movement across instance types. It predicted directions more reliably, and since scheduling decisions depend on direction (should I wait for a cheaper window or execute now?), that capability translated directly into better savings.

The result confirmed the core methodological point of the thesis: optimizing exclusively for prediction error can be counterproductive when the underlying goal is a business decision.

## Regional validation

The regional validation surfaced a complementary finding. In `ap-northeast-1`, the model achieved a MAPE of 5.4%, the best accuracy of any region. Its savings efficiency was -1.03%.

The market was so stable that prices barely moved. Regardless of prediction accuracy, if there is almost no price variation, waiting gains you nothing. The system generates economic value only where the market gives it room to work.

![[spot-regional-velocity.png|Regional price velocity analysis, showing average changes per day vs average percent change]]

This is worth keeping in mind when evaluating whether a system like this is worth deploying. Rough predictions still yield savings in volatile markets. But in stable ones, accuracy becomes irrelevant because there is nothing to gain by waiting.
