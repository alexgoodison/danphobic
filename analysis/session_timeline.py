import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Load your parsed log
df = pd.read_csv("access_parsed.csv", parse_dates=["timestamp"])

# Filter the most suspicious IP
ip = "20.171.207.17"
df_suspicious = df[df["ip"] == ip].copy()

# Optional: round timestamps to the minute
df_suspicious["minute"] = df_suspicious["timestamp"].dt.floor("T")

# Group by minute
activity = df_suspicious.groupby("minute").size().reset_index(name="requests")

# Plot
plt.figure(figsize=(14, 5))
sns.lineplot(data=activity, x="minute", y="requests", marker="o", lw=1.5)
plt.title(f"📈 Request Timeline for Suspicious IP: {ip}")
plt.xlabel("Time")
plt.ylabel("Number of Requests per Minute")
plt.xticks(rotation=45)
plt.tight_layout()
plt.grid(True)
plt.savefig("session_timeline.png")
print("Saved session timeline plot to session_timeline.png")
