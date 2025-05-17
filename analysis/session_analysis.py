import pandas as pd
import re
from datetime import datetime

log_file = 'access.log'

# A simple regex for common combined log format: 
log_pattern = re.compile(r'(\S+) - - \[(.*?)\] "(.*?)" (\d{3}) (\S+)')

records = []
with open(log_file) as f:
    for line in f:
        match = log_pattern.match(line)
        if match:
            ip = match.group(1)
            datetime_str = match.group(2)  # e.g. 10/Oct/2000:13:55:36 -0700
            # Parse datetime, ignoring timezone offset here for simplicity
            timestamp = datetime.strptime(datetime_str.split()[0], "%d/%b/%Y:%H:%M:%S")
            request = match.group(3)
            status = int(match.group(4))
            size = match.group(5)
            records.append((ip, timestamp, request, status, size))

df = pd.DataFrame(records, columns=['ip', 'timestamp', 'request', 'status', 'size'])

# Now you can run the session analysis on df...

SESSION_TIMEOUT = pd.Timedelta(minutes=30)

df = df.sort_values(['ip', 'timestamp']).reset_index(drop=True)
df['prev_timestamp'] = df.groupby('ip')['timestamp'].shift(1)
df['time_diff'] = df['timestamp'] - df['prev_timestamp']
df['new_session'] = (df['time_diff'].isna()) | (df['time_diff'] > SESSION_TIMEOUT)
df['session_id'] = df.groupby('ip')['new_session'].cumsum()
df['session_id_global'] = df['ip'] + '_session_' + df['session_id'].astype(str)

print(df[['ip', 'timestamp', 'request', 'session_id_global']].head(20))
