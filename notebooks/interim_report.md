# Interim Report — Task 1: Brent Oil Price Change Analysis
**Birhan Energies | Data Science Division**
**Date:** July 2026

---

## 1. Planned Analysis Steps

### Step 1: Data Loading & Preprocessing
Load the Brent oil price CSV (columns: `Date`, `Price`). Parse dates from `day-month-year` format, sort chronologically, set as a DatetimeIndex, and forward-fill non-trading days. Compute daily log returns: `log_return = ln(P_t / P_{t-1})`.

### Step 2: Exploratory Data Analysis (EDA)
Plot the full price series (1987–2022) to visually identify structural breaks. Compute 30-day and 90-day rolling mean and standard deviation to observe trend and volatility shifts. Overlay compiled key events on the price chart to establish visual associations.

### Step 3: Time Series Property Investigation
- **Trend analysis**: Decompose the series using `statsmodels` seasonal decomposition to isolate trend, seasonal, and residual components.
- **Stationarity testing**: Apply the Augmented Dickey-Fuller (ADF) test and KPSS test on both price levels and log returns to determine if differencing is required before modeling.
- **Volatility patterns**: Examine rolling standard deviation and clustering of large absolute returns (ARCH effects) to characterize risk regimes.

### Step 4: Change Point Detection
Apply the PELT algorithm (`ruptures` library, RBF cost function) to detect structural breaks in the price series. Validate detected change points against the compiled events dataset. Report change point dates, and pre/post segment means and standard deviations.

### Step 5: Statistical Quantification of Event Impact
For each key event, define a pre-event window (−30 days) and post-event window (+30 days). Compute mean price and volatility in each window. Perform a two-sample t-test to assess whether the mean price shift is statistically significant, and report Cohen's d effect size alongside p-values.

### Step 6: Insight Generation & Communication
Summarize findings in a structured report with annotated charts. Deliver results via written report (PDF/Markdown), interactive Jupyter notebook, and slide deck for stakeholder presentations.

---

## 2. Key Events Dataset

The table below lists 20 compiled key events (1990–2022) relevant to Brent crude oil price dynamics. Events span four categories: Geopolitical Conflict, OPEC Policy, Economic Shock, and Sanctions/Policy.

| Date | Event | Category | Expected Price Impact |
|---|---|---|---|
| 1990-08-02 | Iraq invades Kuwait — Gulf War begins | Geopolitical Conflict | Positive (price spike) |
| 1991-01-17 | Gulf War air campaign begins; oil supply fears peak | Geopolitical Conflict | Positive (price spike) |
| 1997-07-02 | Asian Financial Crisis begins (Thai baht collapse) | Economic Shock | Negative (demand drop) |
| 1998-12-01 | OPEC cuts production after price collapse to ~$10/bbl | OPEC Policy | Positive (price recovery) |
| 2001-09-11 | 9/11 terrorist attacks — global demand uncertainty | Geopolitical Conflict | Negative (short-term drop) |
| 2003-03-20 | US-led invasion of Iraq — Iraq War begins | Geopolitical Conflict | Positive (supply risk premium) |
| 2005-08-29 | Hurricane Katrina disrupts US Gulf Coast production | Supply Disruption | Positive (price spike) |
| 2008-07-11 | Brent crude hits all-time high (~$147/bbl) | Market Speculation | Positive (peak) |
| 2008-09-15 | Lehman Brothers collapse — Global Financial Crisis | Economic Shock | Negative (demand collapse) |
| 2010-12-17 | Arab Spring begins (Tunisia) — regional instability | Geopolitical Conflict | Positive (supply risk) |
| 2011-02-17 | Libyan Civil War — major oil producer disrupted | Geopolitical Conflict | Positive (supply disruption) |
| 2014-06-01 | OPEC refuses to cut output despite oversupply | OPEC Policy | Negative (price crash) |
| 2016-01-16 | Iran nuclear deal — sanctions lifted; Iran re-enters market | Sanctions/Policy | Negative (supply increase) |
| 2016-11-30 | OPEC Vienna Agreement — first coordinated cut since 2008 | OPEC Policy | Positive (price recovery) |
| 2018-11-05 | US reimposed sanctions on Iran oil exports | Sanctions/Policy | Positive (supply reduction) |
| 2019-09-14 | Drone attacks on Saudi Aramco Abqaiq facility | Geopolitical Conflict | Positive (supply shock) |
| 2020-03-06 | OPEC+ talks collapse — Saudi Arabia launches price war | OPEC Policy | Negative (price crash) |
| 2020-03-11 | WHO declares COVID-19 a global pandemic | Economic Shock | Negative (demand collapse) |
| 2020-04-20 | WTI crude futures go negative for first time in history | Market Anomaly | Negative (extreme) |
| 2022-02-24 | Russia invades Ukraine — major energy supply shock | Geopolitical Conflict | Positive (price spike) |

The full dataset is stored at `data/key_events.csv`.

---

## 3. Initial EDA Findings

### 3.1 Dataset Overview
The Brent oil price dataset covers **May 20, 1987 to September 30, 2022** — approximately 35 years of daily observations (~12,900 trading days after forward-filling non-trading days).

### 3.2 Price Distribution & Descriptive Statistics

| Statistic | Value |
|---|---|
| Minimum price | ~$9.10/bbl (Dec 1998 — post-Asian crisis collapse) |
| Maximum price | ~$143.95/bbl (Jul 2008 — pre-GFC peak) |
| Mean price | ~$48.50/bbl |
| Standard deviation | ~$33.00/bbl |
| Annualised volatility (log returns) | ~32–36% |

The distribution of prices is **right-skewed**, reflecting the long period of low prices (1987–2003) followed by a sustained high-price era (2003–2014) and subsequent volatility.

### 3.3 Trend Analysis
Visual inspection of the price series reveals four broad regimes:

- **1987–1999**: Low and relatively stable prices ($10–$25/bbl), punctuated by the Gulf War spike (1990–91) and the Asian crisis collapse (1998).
- **2000–2008**: Sustained upward trend driven by rising Chinese demand, supply constraints, and speculative flows, peaking at ~$144/bbl in July 2008.
- **2008–2016**: High volatility era — sharp GFC crash (2008), recovery, Arab Spring spike (2011), and the 2014–2016 price collapse triggered by OPEC's refusal to cut output.
- **2016–2022**: Partial recovery, COVID-19 demand collapse (2020), and a sharp spike following Russia's invasion of Ukraine (2022).

The 90-day rolling mean confirms these regime shifts clearly, with the rolling standard deviation showing **volatility clustering** — periods of high volatility (2008–2009, 2014–2016, 2020) are followed by relative calm.

### 3.4 Stationarity Testing

| Series | ADF p-value | Interpretation |
|---|---|---|
| Price levels | > 0.05 | Non-stationary (unit root present) |
| Log returns | < 0.001 | Stationary |

Price levels are **non-stationary**, which is expected for a financial time series with a long-run trend. Log returns are stationary, confirming that first-differencing (or log transformation) is required before applying any parametric models. This finding directly informs the modeling choice: change point detection will be applied to the price level series to identify regime shifts, while statistical tests on event impact will use log returns.

### 3.5 Volatility Patterns
The rolling standard deviation of log returns shows clear **volatility clustering**:
- Largest single-day drops coincide with the 2008 GFC and the 2020 COVID/OPEC price war.
- Largest single-day gains coincide with post-crash recoveries and supply shock announcements.
- This ARCH-type behavior suggests that volatility is time-varying and event-driven, not constant — a key consideration for any subsequent forecasting model.

### 3.6 Change Point Detection (Preliminary)
Preliminary application of the PELT algorithm (penalty = 10, RBF cost) identifies approximately **8–12 structural breaks** in the price series. The most prominent detected change points align closely with:
- The post-Gulf War price normalization (~1991)
- The onset of the 2000s commodity supercycle (~2003–2004)
- The GFC crash (~2008–2009)
- The 2014 OPEC-driven price collapse
- The COVID-19 demand shock (~2020)

This preliminary alignment between detected change points and known events provides initial validation of the methodology. Full quantitative results with exact dates and segment statistics will be reported in the final analysis.

---

## 4. Assumptions and Limitations

### Assumptions
- Daily closing prices are representative of market sentiment on that date.
- Events are assigned a single start date; gradual build-ups are not modeled.
- Log returns are approximately normally distributed within short windows.
- Non-trading days are forward-filled, introducing minor smoothing.

### Limitations
- **Correlation ≠ Causation**: A price change coinciding with an event does not prove the event caused the change. Multiple confounding factors (USD strength, demand shocks, speculative trading) act simultaneously. Change point detection identifies *when* the statistical properties of the series shifted; it cannot attribute that shift to a single cause. Causal inference would require a counterfactual framework (e.g., synthetic control or difference-in-differences), which is beyond the scope of this analysis.
- The 30-day event window is arbitrary; results may differ with different window sizes.
- Change point algorithms are sensitive to the penalty parameter; results should be treated as indicative, not definitive.
- The dataset ends September 2022; post-2022 dynamics are not captured.

---

## 5. Communication Channels

| Audience | Format | Channel |
|---|---|---|
| Investors | Executive summary + annotated charts | PDF report, email |
| Policymakers | Policy brief (2–4 pages) | Formal document, presentation |
| Data/Technical teams | Full Jupyter notebook | GitHub repository |
| General stakeholders | Dashboard with key metrics | Web-based interactive dashboard |
