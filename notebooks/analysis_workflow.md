# Analysis Workflow & Methodology — Brent Oil Price Change Analysis

## 1. Analysis Steps

### Step 1: Data Loading & Preprocessing
- Load the Brent oil price CSV (Date, Price columns).
- Parse dates from `day-month-year` format; set as a DatetimeIndex.
- Handle missing values (forward-fill for non-trading days).
- Compute daily log returns: `log_return = ln(P_t / P_{t-1})`.

### Step 2: Exploratory Data Analysis (EDA)
- Plot the full price series to visually identify structural breaks.
- Compute rolling mean and standard deviation (30-day, 90-day windows) to observe trend and volatility shifts.
- Overlay compiled key events on the price chart.

### Step 3: Time Series Property Investigation
- **Trend analysis**: Decompose the series (additive/multiplicative) using `statsmodels.tsa.seasonal.seasonal_decompose`.
- **Stationarity testing**: Apply the Augmented Dickey-Fuller (ADF) test and KPSS test on both price levels and log returns.
- **Volatility patterns**: Plot rolling standard deviation and examine clustering of large absolute returns (ARCH effects).

### Step 4: Change Point Detection
- Apply the `ruptures` library (PELT algorithm with RBF cost) to detect structural breaks in the price series.
- Validate detected change points against the compiled events dataset.
- Report change point dates, pre/post segment means, and standard deviations.

### Step 5: Statistical Quantification of Event Impact
- For each key event, define a pre-event window (−30 days) and post-event window (+30 days).
- Compute mean price and volatility in each window.
- Perform a two-sample t-test to assess whether the mean price shift is statistically significant.
- Report effect size (Cohen's d) alongside p-values.

### Step 6: Insight Generation & Communication
- Summarize findings in a structured report with annotated charts.
- Deliver results via: written report (PDF/Markdown), interactive Jupyter notebook, and slide deck for stakeholder presentations.

---

## 2. Assumptions and Limitations

### Assumptions
- Daily closing prices are representative of market sentiment on that date.
- Events are assigned a single start date; gradual build-ups are not modeled.
- Log returns are approximately normally distributed within short windows.
- Non-trading days are filled forward, introducing minor smoothing.

### Limitations
- **Correlation ≠ Causation**: A price change coinciding with an event does not prove the event caused the change. Multiple confounding factors (USD strength, demand shocks, speculative trading) act simultaneously. Change point detection identifies *when* the statistical properties of the series shifted; it cannot attribute that shift to a single cause. Causal inference would require a counterfactual framework (e.g., synthetic control or difference-in-differences), which is beyond the scope of this analysis.
- The 30-day event window is arbitrary; results may differ with different window sizes.
- Change point algorithms are sensitive to the penalty parameter; results should be treated as indicative, not definitive.
- The dataset ends September 2022; post-2022 dynamics are not captured.

---

## 3. Communication Channels
| Audience | Format | Channel |
|---|---|---|
| Investors | Executive summary + annotated charts | PDF report, email |
| Policymakers | Policy brief (2–4 pages) | Formal document, presentation |
| Data/Technical teams | Full Jupyter notebook | GitHub repository |
| General stakeholders | Dashboard with key metrics | Web-based interactive dashboard |
