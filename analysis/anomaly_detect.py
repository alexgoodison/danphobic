import pandas as pd
import re
import seaborn as sns
import matplotlib.pyplot as plt
from datetime import datetime

# === Step 1: Parse Log File ===

pattern = re.compile(
    r'(?P<ip>[\d\.]+) - - \[(?P<timestamp>[^\]]+)\] "(?P<request>[^"]+)" (?P<status>\d+) (?P<size>\d+) "(?P<referrer>[^"]*)" "(?P<user_agent>[^"]*)"'
)

def parse_log_line(line):
    match = pattern.match(line)
    if match:
        return match.groupdict()
    return None

with open("access.log") as f:
    parsed_lines = [parse_log_line(line) for line in f if parse_log_line(line)]

df = pd.DataFrame(parsed_lines)
df.dropna(inplace=True)

# Convert timestamp to datetime
df['timestamp'] = pd.to_datetime(df['timestamp'], format="%d/%b/%Y:%H:%M:%S %z")

# === Step 2: Request Volume Z-score ===

ip_counts = df['ip'].value_counts().rename("request_count").reset_index()
ip_counts.columns = ['ip', 'request_count']
ip_counts['z_score'] = (ip_counts['request_count'] - ip_counts['request_count'].mean()) / ip_counts['request_count'].std()
suspicious_volume = ip_counts[ip_counts['z_score'] > 3]

# === Step 3: Bot-like Behaviour ===

ua_diversity = df.groupby('ip')['user_agent'].nunique().rename("ua_diversity")
merged = ip_counts.merge(ua_diversity, on='ip')
bot_like = merged[(merged['request_count'] > 100) & (merged['ua_diversity'] < 2)]

# === Step 4: Heatmap of Hourly Activity ===

df['hour'] = df['timestamp'].dt.floor('H')
activity_heatmap = df.groupby(['ip', 'hour']).size().unstack(fill_value=0)

# Filter to suspicious IPs for heatmap
focus_ips = suspicious_volume['ip'].tolist()
filtered_heatmap = activity_heatmap.loc[activity_heatmap.index.intersection(focus_ips)]

# Plot Heatmap
if not filtered_heatmap.empty:
    plt.figure(figsize=(12, 6))
    sns.heatmap(filtered_heatmap, cmap="Reds", linewidths=0.5)
    plt.title("Request Activity Heatmap for Suspicious IPs")
    plt.xlabel("Hour")
    plt.ylabel("IP Address")
    plt.tight_layout()
    plt.savefig("suspicious_heatmap.png")
    print("Heatmap saved to suspicious_heatmap.png")
else:
    print("No suspicious IPs to display in heatmap.")

# === Step 5: Print Summary ===

print("\nHigh volume IPs (Z-score > 3):")
print(suspicious_volume[['ip', 'request_count', 'z_score']])

print("\nBot-like behaviour detected:")
print(bot_like[['ip', 'request_count', 'ua_diversity']])
