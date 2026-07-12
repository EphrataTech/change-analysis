# Brent Oil Price Change Analysis

Analysis of how geopolitical events, OPEC decisions, and economic shocks affect Brent crude oil prices (1987–2022).

## Project Structure
```
├── data/
│   ├── BrentOilPrices.csv       # Raw price data (place here)
│   └── key_events.csv           # Compiled key events dataset
├── notebooks/
│   ├── analysis_workflow.md     # Analysis plan & methodology
│   └── task1_eda_changepoint.ipynb
├── scripts/
├── src/
└── tests/
```

## Setup
```bash
pip install -r requirements.txt
```

## Usage
Place `BrentOilPrices.csv` in the `data/` folder, then run the notebook:
```bash
jupyter notebook notebooks/task1_eda_changepoint.ipynb
```
