import pandas as pd

df = pd.read_csv("access_parsed.csv", nrows=10)
print(df['request'].tolist())
