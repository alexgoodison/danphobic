import re
import pandas as pd
import matplotlib.pyplot as plt

# --- Read & Parse Log File ---
log_file = 'access.log'

pattern = re.compile(
    r'(?P<ip>\S+) - - \[(?P<timestamp>[^]]+)] "(?P<request>[^"]+)" (?P<status>\d{3}) (?P<size>\S+) "[^"]*" "(?P<user_agent>[^"]+)"'
)

entries = []
with open(log_file, 'r') as f:
    for line in f:
        match = pattern.match(line)
        if match:
            data = match.groupdict()
            data['timestamp'] = pd.to_datetime(data['timestamp'], format='%d/%b/%Y:%H:%M:%S %z')
            data['status'] = int(data['status'])
            data['size'] = int(data['size']) if data['size'].isdigit() else 0
            entries.append(data)

df = pd.DataFrame(entries)
df.set_index('timestamp', inplace=True)

# --- Feature Engineering ---
df['method'] = df['request'].str.extract(r'^(GET|POST|HEAD|PUT|DELETE|OPTIONS)')
df['url'] = df['request'].str.extract(r'^\w+ (.+?) HTTP/')
df['agent_type'] = df['user_agent'].apply(
    lambda ua: (
        'GPTBot' if 'GPTBot' in ua else
        'AhrefsBot' if 'AhrefsBot' in ua else
        'WordPress' if 'WordPress' in ua else
        'Chrome' if 'Chrome' in ua else
        'Other'
    )
)
df['hour'] = df.index.hour

# --- Analysis 1: Requests Per Minute ---
requests_per_min = df.resample('1Min').size()
requests_per_min.plot(figsize=(12, 6), title='Requests Per Minute')
plt.xlabel('Time')
plt.ylabel('Requests')
plt.tight_layout()
plt.savefig('requests_per_minute.png')
plt.close()

# --- Analysis 2: Requests by Agent Type ---
agent_ts = df.groupby('agent_type').resample('1Min').size().unstack(0).fillna(0)
agent_ts.plot(figsize=(12, 6), stacked=True, title='Requests Per Minute by Agent Type')
plt.xlabel('Time')
plt.ylabel('Requests')
plt.tight_layout()
plt.savefig('requests_by_agent_type.png')
plt.close()

# --- Analysis 3: Top IP Addresses ---
top_ips = df['ip'].value_counts().head(10)
top_ips.plot(kind='bar', figsize=(10, 6), title='Top 10 IPs by Request Count')
plt.ylabel('Request Count')
plt.xlabel('IP Address')
plt.tight_layout()
plt.savefig('top_ips.png')
plt.close()

# --- Analysis 4: Most Requested URLs ---
top_urls = df['url'].value_counts().head(10)
top_urls.plot(kind='barh', figsize=(10, 6), title='Top 10 Requested URLs')
plt.xlabel('Request Count')
plt.ylabel('URL')
plt.tight_layout()
plt.savefig('top_urls.png')
plt.close()

# --- Analysis 5: Status Code Distribution ---
status_counts = df['status'].value_counts()
status_counts.plot(kind='bar', figsize=(8, 6), title='HTTP Status Code Distribution')
plt.ylabel('Count')
plt.xlabel('Status Code')
plt.tight_layout()
plt.savefig('status_code_distribution.png')
plt.close()

# --- Analysis 6: Requests by Hour of Day ---
requests_by_hour = df.groupby('hour').size()
requests_by_hour.plot(kind='bar', figsize=(10, 6), title='Requests by Hour of Day')
plt.xlabel('Hour (0–23)')
plt.ylabel('Requests')
plt.tight_layout()
plt.savefig('requests_by_hour.png')
plt.close()

print("✅ All plots saved to current directory.")
