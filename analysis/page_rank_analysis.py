import pandas as pd
import networkx as nx
import matplotlib.pyplot as plt
import os

df = pd.read_csv("access_parsed.csv", parse_dates=["timestamp"])
print("Columns in CSV:", df.columns)

# Use 'request' column directly as 'endpoint'
df['endpoint'] = df['request']

# Sort by IP and timestamp to get proper transitions
df = df.sort_values(['ip', 'timestamp']).reset_index(drop=True)

# Build page transitions edges (from endpoint to next endpoint per IP)
edges = []
for ip, group in df.groupby('ip'):
    endpoints = group['endpoint'].tolist()
    # Filter out any NaNs just in case
    endpoints = [e for e in endpoints if pd.notna(e)]
    # Create edges for consecutive page visits
    edges.extend([(endpoints[i], endpoints[i+1]) for i in range(len(endpoints)-1)])

# Build directed graph
G = nx.DiGraph()
G.add_edges_from(edges)

# Calculate PageRank
pr = nx.pagerank(G)

# Sort pages by PageRank score descending
top_pages = sorted(pr.items(), key=lambda x: x[1], reverse=True)[:10]

print("Top 10 Pages by PageRank:")
for page, score in top_pages:
    print(f"{page}: {score:.6f}")

# Plot and save the graph (only top 50 nodes to avoid clutter)
plt.figure(figsize=(12, 12))
top_nodes = [node for node, _ in sorted(pr.items(), key=lambda x: x[1], reverse=True)[:50]]
subgraph = G.subgraph(top_nodes)
pos = nx.spring_layout(subgraph, k=0.3, seed=42)  # seed for reproducible layout
nx.draw_networkx_nodes(subgraph, pos, node_size=300, node_color='lightblue')
nx.draw_networkx_edges(subgraph, pos, arrowsize=10, arrowstyle='->')
nx.draw_networkx_labels(subgraph, pos, font_size=8)

os.makedirs('figures', exist_ok=True)
plt.title("Top 50 Pages Transition Graph")
plt.axis('off')
plt.tight_layout()
plt.savefig('figures/page_rank_graph.png', dpi=300)
plt.close()

print("Graph saved to figures/page_rank_graph.png")
