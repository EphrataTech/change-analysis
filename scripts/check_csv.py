import pandas as pd
df = pd.read_csv('c:/Users/ephra/change analysis/data/BrentOilPrices.csv', encoding='latin1')
print('Shape:', df.shape)
print('Columns:', df.columns.tolist())
print(df.head(5).to_string())
print(df.tail(3).to_string())
print('Dtypes:', df.dtypes.to_string())
