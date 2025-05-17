# parse_log.py
import pandas as pd
import re
from datetime import datetime

# Read raw log
with open("access.log") as f:
    lines = f.readlines()

# Basic regex to extract fields
pattern = re.compile(
    r'(?P<ip>\S+) - - \[(?P<time>[^\]]+)\] "(?P<method>\S+) (?P<request>\S+) \S+" (?P<status>\d{3}) (?P<size>\S+) "(?P<referer>[^"]*)" "(?P<user_agent>[^"]*)"'
)

data = []
for line in lines:
    match = pattern.match(line)
    if match:
        entry = match.groupdict()
        # Convert time format
        entry["timestamp"] = datetime.strptime(entry["time"], "%d/%b/%Y:%H:%M:%S %z")
        data.append(entry)

# Convert to DataFrame
df = pd.DataFrame(data)

# Save parsed version
df.to_csv("access_parsed.csv", index=False)
print("Saved parsed log to access_parsed.csv")
