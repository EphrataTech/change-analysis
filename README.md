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

### 1. Data Analysis (Jupyter Notebook)
To set up the environment for EDA and change point analysis:
```bash
pip install -r requirements.txt
```

### 2. Dashboard Backend (Flask)
Install Python dependencies for the backend API:
```bash
pip install -r backend/requirements.txt
```

### 3. Dashboard Frontend (React)
Install React dependencies:
```bash
cd frontend
npm install
```

## Usage

### 1. Running Notebooks
Place `BrentOilPrices.csv` in the `data/` folder, then run the notebook:
```bash
jupyter notebook notebooks/task1_eda_changepoint.ipynb
```

### 2. Running the Interactive Dashboard
To start the dashboard locally:
1. **Start the Backend Server**:
   ```bash
   python backend/app.py
   ```
   The Flask server will run on `http://localhost:5000`.

2. **Start the Frontend Development Server**:
   ```bash
   cd frontend
   npm run dev
   ```
   The Vite server will start on `http://localhost:3000` and automatically proxy API requests to port 5000. Open the browser to see the dashboard.

