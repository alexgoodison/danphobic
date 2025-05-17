import requests
import pandas as pd
import time

def get_location(ip):
    url = f"http://ip-api.com/json/{ip}"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            if data['status'] == 'success':
                return {
                    'ip': ip,
                    'lat': data['lat'],
                    'lon': data['lon'],
                    'country': data['country'],
                    'region': data['regionName'],
                    'city': data['city']
                }
    except Exception as e:
        print(f"Error with IP {ip}: {e}")
    return None

unique_ips = df['ip'].unique()
geo_data = []

for ip in unique_ips:
    info = get_location(ip)
    if info:
        geo_data.append(info)
    time.sleep(1)  # Respect IP-API's free tier rate limit

geo_df = pd.DataFrame(geo_data)
geo_df.to_csv('ip_locations.csv', index=False)
