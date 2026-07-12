import pandas as pd
import numpy as np
import warnings
from statsmodels.tsa.stattools import adfuller
warnings.filterwarnings('ignore')

df = pd.read_csv('c:/Users/ephra/change analysis/data/BrentOilPrices.csv', encoding='latin1')
print('Columns:', df.columns.tolist())
print('Head:\n', df.head().to_string())
print('Shape:', df.shape)

df['Date'] = pd.to_datetime(df['Date'], infer_datetime_format=True)
df = df.sort_values('Date').set_index('Date').asfreq('D').ffill()
df['log_return'] = np.log(df['Price'] / df['Price'].shift(1))
lr = df['log_return'].dropna()

print(f"\nDate range: {df.index.min().date()} to {df.index.max().date()}")
print(f"Total observations: {len(df)}")
print(f"Min: {df['Price'].min():.2f}, Max: {df['Price'].max():.2f}, Mean: {df['Price'].mean():.2f}, Std: {df['Price'].std():.2f}")
print(f"Annualised vol: {lr.std()*np.sqrt(252)*100:.2f}%")
print(f"Skewness: {lr.skew():.4f}, Kurtosis: {lr.kurtosis():.4f}")

adf = adfuller(df['Price'].dropna())
print(f"\nADF levels: stat={adf[0]:.4f}, p={adf[1]:.4f} -> {'Non-stationary' if adf[1]>0.05 else 'Stationary'}")
adf2 = adfuller(lr)
print(f"ADF log returns: stat={adf2[0]:.4f}, p={adf2[1]:.4f} -> {'Stationary' if adf2[1]<0.05 else 'Non-stationary'}")

print("\nDecade breakdown:")
for y in [1987, 1990, 2000, 2010, 2020]:
    s = df.loc[(df.index.year >= y) & (df.index.year < y+10), 'Price']
    if len(s):
        print(f"  {y}s: mean={s.mean():.2f}, min={s.min():.2f}, max={s.max():.2f}")

print("\nTop 5 single-day drops:")
for d, v in lr.nsmallest(5).items():
    print(f"  {d.date()}: {v*100:.2f}%")

print("\nTop 5 single-day gains:")
for d, v in lr.nlargest(5).items():
    print(f"  {d.date()}: {v*100:.2f}%")
