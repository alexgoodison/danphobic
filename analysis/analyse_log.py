import pandas as pd
import re

def parse_log(filename):
    log_entries = []
    with open(filename, 'r') as f:
        for line in f:
            match = re.match(r'(?P<ip>\d+\.\d+\.\d+\.\d+).*?\[(?P<datetime>.*?)\].*?"(?P<method>\S+) (?P<path>\S+) .*?" (?P<status>\d+)', line)
            if match:
                log_entries.append(match.groupdict())
    df = pd.DataFrame(log_entries)
    df.to_csv('parsed_log.csv', index=False)
    print("Log parsed and saved as parsed_log.csv")
    return df

if __name__ == "__main__":
    df = parse_log('access.log')