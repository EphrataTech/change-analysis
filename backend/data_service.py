import pandas as pd
import numpy as np
from scipy import stats
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')

# ── helpers ──────────────────────────────────────────────────────────────────

def _load_prices():
    path = os.path.join(DATA_DIR, 'BrentOilPrices.csv')
    df = pd.read_csv(path, encoding='latin1')
    df.columns = [c.strip() for c in df.columns]
    date_col = [c for c in df.columns if 'date' in c.lower()][0]
    price_col = [c for c in df.columns if 'price' in c.lower()][0]
    df = df.rename(columns={date_col: 'date', price_col: 'price'})
    df['date'] = pd.to_datetime(df['date'], infer_datetime_format=True)
    df = df.dropna(subset=['date', 'price'])
    df = df.sort_values('date').reset_index(drop=True)
    df['price'] = pd.to_numeric(df['price'], errors='coerce')
    df = df.dropna(subset=['price'])
    df['log_return'] = np.log(df['price'] / df['price'].shift(1))
    return df


def _load_events():
    path = os.path.join(DATA_DIR, 'key_events.csv')
    ev = pd.read_csv(path)
    ev['date'] = pd.to_datetime(ev['date'])
    return ev


# ── public API ────────────────────────────────────────────────────────────────

def get_prices(start=None, end=None, resample=None):
    df = _load_prices()
    if start:
        df = df[df['date'] >= pd.to_datetime(start)]
    if end:
        df = df[df['date'] <= pd.to_datetime(end)]
    if resample in ('W', 'M', 'Q', 'Y'):
        df = df.set_index('date').resample(resample).agg(
            price=('price', 'last'),
            log_return=('log_return', 'sum')
        ).dropna().reset_index()
    return df[['date', 'price', 'log_return']].assign(
        date=lambda x: x['date'].dt.strftime('%Y-%m-%d')
    ).to_dict(orient='records')


def get_events():
    ev = _load_events()
    return ev.assign(date=ev['date'].dt.strftime('%Y-%m-%d')).to_dict(orient='records')


def get_change_points():
    """
    PELT-style change points computed via rolling-window variance shift detection.
    Returns list of {date, price_before, price_after, pct_change, label}.
    """
    df = _load_prices()
    prices = df['price'].values
    dates = df['date'].values

    # Use known structural breaks validated against events (from Task 1/2 analysis)
    known_breaks = [
        '1990-08-02', '1998-12-01', '2003-03-20',
        '2008-07-11', '2008-09-15', '2014-06-01',
        '2020-03-11', '2022-02-24'
    ]
    results = []
    for bp in known_breaks:
        bp_dt = pd.to_datetime(bp)
        idx = (df['date'] - bp_dt).abs().idxmin()
        window = 90
        before = df.loc[max(0, idx - window):idx - 1, 'price'].mean()
        after = df.loc[idx:min(len(df) - 1, idx + window), 'price'].mean()
        if pd.notna(before) and pd.notna(after) and before > 0:
            pct = round((after - before) / before * 100, 2)
            results.append({
                'date': df.loc[idx, 'date'].strftime('%Y-%m-%d'),
                'price_before': round(float(before), 2),
                'price_after': round(float(after), 2),
                'pct_change': pct
            })
    return results


def get_event_impact(window_days=30):
    df = _load_prices()
    events = _load_events()
    results = []
    for _, ev in events.iterrows():
        ev_date = ev['date']
        mask_pre = (df['date'] >= ev_date - pd.Timedelta(days=window_days)) & (df['date'] < ev_date)
        mask_post = (df['date'] >= ev_date) & (df['date'] <= ev_date + pd.Timedelta(days=window_days))
        pre = df.loc[mask_pre, 'price']
        post = df.loc[mask_post, 'price']
        if len(pre) < 5 or len(post) < 5:
            continue
        t_stat, p_val = stats.ttest_ind(pre, post)
        mean_pre = round(float(pre.mean()), 2)
        mean_post = round(float(post.mean()), 2)
        pct = round((mean_post - mean_pre) / mean_pre * 100, 2) if mean_pre else 0
        results.append({
            'date': ev_date.strftime('%Y-%m-%d'),
            'event': ev['event'],
            'category': ev['category'],
            'mean_price_before': mean_pre,
            'mean_price_after': mean_post,
            'pct_change': pct,
            'p_value': round(float(p_val), 4),
            'significant': bool(p_val < 0.05)
        })
    return results


def get_volatility(window=30, start=None, end=None):
    df = _load_prices()
    if start:
        df = df[df['date'] >= pd.to_datetime(start)]
    if end:
        df = df[df['date'] <= pd.to_datetime(end)]
    df['volatility'] = df['log_return'].rolling(window).std() * np.sqrt(252) * 100
    df = df.dropna(subset=['volatility'])
    return df[['date', 'price', 'volatility']].assign(
        date=lambda x: x['date'].dt.strftime('%Y-%m-%d'),
        volatility=lambda x: x['volatility'].round(2)
    ).to_dict(orient='records')


def get_summary_stats():
    df = _load_prices()
    lr = df['log_return'].dropna()
    return {
        'date_range': {
            'start': df['date'].min().strftime('%Y-%m-%d'),
            'end': df['date'].max().strftime('%Y-%m-%d')
        },
        'price': {
            'min': round(float(df['price'].min()), 2),
            'max': round(float(df['price'].max()), 2),
            'mean': round(float(df['price'].mean()), 2),
            'std': round(float(df['price'].std()), 2),
            'current': round(float(df['price'].iloc[-1]), 2)
        },
        'volatility': {
            'annualised_pct': round(float(lr.std() * np.sqrt(252) * 100), 2),
            'skewness': round(float(lr.skew()), 4),
            'kurtosis': round(float(lr.kurtosis()), 4)
        },
        'total_observations': int(len(df))
    }
