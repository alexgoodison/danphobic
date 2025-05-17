import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.animation import FFMpegWriter
from tqdm import tqdm
from collections import defaultdict

# Load data
df = pd.read_csv("access_parsed.csv", parse_dates=["timestamp"])
df = df.sort_values("timestamp")

# Focus on top N suspicious IPs
top_ips = df['ip'].value_counts().nlargest(6).index.tolist()
df = df[df['ip'].isin(top_ips)]

# Bucket requests by minute
df['minute'] = df['timestamp'].dt.floor('T')

# Build time series of requests per IP
timeline = df.groupby(['minute', 'ip']).size().unstack(fill_value=0)

# Fill in all missing timestamps
timeline = timeline.reindex(pd.date_range(timeline.index.min(), timeline.index.max(), freq='T'), fill_value=0)

# Compute total requests
timeline['Total'] = timeline.sum(axis=1)

# Set up figure and axes
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 6), sharex=True)

ip_columns = [col for col in timeline.columns if col != "Total"]
colors = plt.cm.viridis(range(len(ip_columns)))

# Initialise lines
lines = []
for i, ip in enumerate(ip_columns):
    line, = ax1.plot([], [], label=ip, color=colors[i])
    lines.append(line)

total_line, = ax2.plot([], [], color='black', linewidth=2, label="Total Requests")

# Set labels
ax1.set_ylabel("Requests per Minute")
ax1.set_title("Suspicious IP Activity")
ax1.legend(loc="upper left")

ax2.set_ylabel("Total Requests")
ax2.set_xlabel("Time")
ax2.legend()

# Format time axis
ax2.set_xticks(timeline.index[::max(1, len(timeline)//10)])
ax2.set_xticklabels(timeline.index[::max(1, len(timeline)//10)].strftime('%H:%M'), rotation=90)

# Animation function
def animate(i):
    window = timeline.iloc[:i+1]
    for j, ip in enumerate(ip_columns):
        lines[j].set_data(window.index, window[ip])
    total_line.set_data(window.index, window['Total'])
    ax1.relim()
    ax1.autoscale_view()
    ax2.relim()
    ax2.autoscale_view()
    return lines + [total_line]

# Create animation
print("Rendering frames...")
ani = animation.FuncAnimation(fig, animate, frames=len(timeline), interval=20, blit=False)

# Save with ffmpeg writer
print("Saving animation...")
writer = FFMpegWriter(fps=10, bitrate=1800)
ani.save("animated_timeline.mp4", writer=writer, dpi=200)
print("Done: saved to animated_timeline.mp4")
