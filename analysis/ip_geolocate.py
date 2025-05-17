import pandas as pd
import requests
import time
import os
import json

INPUT_CSV = 'parsed_log.csv'
OUTPUT_CSV = 'ip_locations.csv'
CACHE_FILE = 'ip_cache.json'
API_URL = 'http://ip-api.com/json/{}'

# Load parsed log
df = pd.read_csv(INPUT_CSV)
unique_ips = df['ip'].unique()

# Load existing cache if any
if os.path.exists(CACHE_FILE):
    with open(CACHE_FILE, 'r') as f:
        cache = json.load(f)
else:
    cache = {}

results = []

for i, ip in enumerate(unique_ips):
    print(f'[{i+1}/{len(unique_ips)}] Processing IP: {ip}')

    if ip in cache:
        print(f"    (cached)")
        data = cache[ip]
    else:
        try:
            response = requests.get(API_URL.format(ip), timeout=5)
            data = response.json()
            cache[ip] = data
            time.sleep(1.4)  # Respect the 45 req/min rate limit
        except Exception as e:
            print(f"    Failed to get data for {ip}: {e}")
            continue

    if data.get("status") == "success":
        results.append({
            "ip": ip,
            "country": data.get("country"),
            "region": data.get("regionName"),
            "city": data.get("city"),
            "lat": data.get("lat"),
            "lon": data.get("lon"),
            "isp": data.get("isp")
        })

# Save to CSV
results_df = pd.DataFrame(results)
results_df.to_csv(OUTPUT_CSV, index=False)

# Save cache
with open(CACHE_FILE, 'w') as f:
    json.dump(cache, f, indent=2)

print(f"\nSaved {len(results)} results to {OUTPUT_CSV}")
