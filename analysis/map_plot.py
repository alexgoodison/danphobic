import pandas as pd
import geopandas as gpd
import matplotlib.pyplot as plt

def plot_map():
    world = gpd.read_file(gpd.datasets.get_path('naturalearth_lowres'))
    geo_df = pd.read_csv('ip_locations.csv')
    gdf = gpd.GeoDataFrame(geo_df, geometry=gpd.points_from_xy(geo_df.lon, geo_df.lat))

    fig, ax = plt.subplots(figsize=(15, 10))
    world.boundary.plot(ax=ax, color='lightgrey')
    gdf.plot(ax=ax, markersize=30, color='red', alpha=0.6)
    plt.title('IP Geolocation of Requests')
    plt.tight_layout()
    plt.savefig('ip_geolocation_map.png')
    plt.show()
    print("Map saved as ip_geolocation_map.png")

if __name__ == "__main__":
    plot_map()