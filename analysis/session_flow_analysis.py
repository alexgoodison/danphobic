import pandas as pd
from datetime import timedelta
from collections import Counter
import os

# Load access log data
df = pd.read_csv("access_parsed.csv", parse_dates=["timestamp"])

# Directly use the 'request' column as endpoint
df['endpoint'] = df['request']

# Sort and compute sessions based on IP + user-agent + 30 min gap
df = df.sort_values(by=['ip', 'user_agent', 'timestamp']).reset_index(drop=True)
df['prev_time'] = df.groupby(['ip', 'user_agent'])['timestamp'].shift()
df['time_diff'] = (df['timestamp'] - df['prev_time']).fillna(pd.Timedelta(seconds=0))
df['new_session'] = (df['time_diff'] > timedelta(minutes=30))
df['session_id'] = df['new_session'].cumsum()

# Reconstruct session paths
sessions = df.groupby('session_id')['endpoint'].apply(list)

# Count transitions
transitions = Counter()
for session in sessions:
    for i in range(len(session) - 1):
        transitions[(session[i], session[i + 1])] += 1

# Display top 20 transitions
print("Top 20 Transitions:")
for (src, tgt), count in transitions.most_common(20):
    print(f"{src} → {tgt}: {count}")

# Save transitions for Sankey plot
sankey_df = pd.DataFrame([
    {"source": src, "target": tgt, "value": count}
    for (src, tgt), count in transitions.items()
])
os.makedirs("figures", exist_ok=True)
sankey_df.to_csv("figures/sankey_data.csv", index=False)
print("Sankey data saved to figures/sankey_data.csv")
