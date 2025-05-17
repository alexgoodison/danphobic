import re
import pandas as pd

# Function to parse a single Apache log line into a dictionary
def parse_log_line(line):
    log_pattern = re.compile(
        r'(?P<ip>\S+) \S+ \S+ \[(?P<timestamp>.+?)\] "(?P<request>.+?)" \d+ \d+'
    )
    match = log_pattern.match(line)
    if match:
        return match.groupdict()
    else:
        return None

# Read the log file and parse lines
logfile = 'access.log'
entries = []

with open(logfile, 'r') as f:
    for line in f:
        parsed = parse_log_line(line)
        if parsed:
            entries.append(parsed)

# Create DataFrame
df = pd.DataFrame(entries)

# SQL injection suspicious patterns (case-insensitive)
sql_patterns = [
    r"union select",
    r"select.+from",
    r"or\s+1=1",
    r"--|;--|;|/\*|\*/",
    r"drop\s+table",
    r"sleep\(",
    r"xp_",
    r"%27|'",
]

pattern = '|'.join(sql_patterns)

# Filter suspicious requests
suspicious_requests = df[df['request'].str.contains(pattern, regex=True, na=False, case=False)]

print("Suspicious SQL injection attempts found:")
print(suspicious_requests[['ip', 'timestamp', 'request']])
