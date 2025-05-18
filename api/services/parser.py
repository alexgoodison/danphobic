from typing import List, Set, Dict, Tuple
from model.log import LogEntry
from collections import defaultdict
from datetime import datetime, timedelta
import os
import json

def load_blacklist() -> Set[str]:
    """Load IP addresses from blacklist file into a set for O(1) lookups"""
    blacklist_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'ip_blacklist.txt')
    with open(blacklist_path, 'r') as f:
        return {line.strip() for line in f if line.strip()}

def check_blacklist_occurance(logs: List[LogEntry]) -> List[str]:
    """
    Find all IP addresses in the logs that are in the blacklist
    
    Args:
        logs: List of LogEntry objects to check
        
    Returns:
        List[str]: List of blacklisted IP addresses found in the logs
    """
    blacklist = load_blacklist()
    # Get unique IPs from logs that are in the blacklist
    return list({log.remote_addr for log in logs if log.remote_addr in blacklist})

def count_requests_by_ip(logs: List[LogEntry]) -> dict[str, int]:
    """
    Count the total number of requests made by each remote address
    
    Args:
        logs: List of LogEntry objects to analyse
        
    Returns:
        dict[str, int]: Dictionary mapping IP addresses to their request counts
    """
    request_counts = {}
    for log in logs:
        request_counts[log.remote_addr] = request_counts.get(log.remote_addr, 0) + 1
    return request_counts

def count_user_agents(logs: List[LogEntry]) -> dict[str, int]:
    """
    Count the total number of requests made by each user agent
    
    Args:
        logs: List of LogEntry objects to analyse
        
    Returns:
        dict[str, int]: Dictionary mapping user agents to their request counts
    """
    user_agent_counts = {}
    for log in logs:
        user_agent = log.http_user_agent
        user_agent_counts[user_agent] = user_agent_counts.get(user_agent, 0) + 1
    return user_agent_counts

def detect_high_frequency_ips(logs: List[LogEntry], std_dev_threshold: float = 2.0) -> dict[str, int]:
    """
    Detect IPs making unusually high numbers of requests using statistical analysis.
    An IP is considered suspicious if its request count is more than std_dev_threshold
    standard deviations above the mean.

    Args:
        logs: List of LogEntry objects to analyse
        std_dev_threshold: Number of standard deviations above mean to consider suspicious (default: 2.0)
        
    Returns:
        dict[str, int]: Dictionary mapping suspicious IPs to their request counts
    """
    request_counts = count_requests_by_ip(logs)
    
    if not request_counts:
        return {}
    
    # Calculate mean and standard deviation
    counts = list(request_counts.values())
    mean = sum(counts) / len(counts)
    
    # Calculate standard deviation
    squared_diff_sum = sum((count - mean) ** 2 for count in counts)
    std_dev = (squared_diff_sum / len(counts)) ** 0.5
    
    # Calculate threshold
    threshold = mean + (std_dev_threshold * std_dev)
    
    return {ip: count for ip, count in request_counts.items() if count > threshold}


def detect_suspicious_user_agents(logs: List[LogEntry]) -> dict[str, List[LogEntry]]:
    """
    Detect requests with suspicious user agents
    
    Args:
        logs: List of LogEntry objects to analyse
        
    Returns:
        dict[str, List[LogEntry]]: Dictionary mapping suspicious user agents to their log entries
    """
    suspicious_patterns = [
        'sqlmap', 'nikto', 'nmap', 'scanner', 'crawler', 'bot',
        'python-requests', 'curl', 'wget', 'apache-httpclient'
    ]
    
    suspicious_logs = {}
    for log in logs:
        user_agent = log.http_user_agent.lower()
        for pattern in suspicious_patterns:
            if pattern in user_agent:
                if pattern not in suspicious_logs:
                    suspicious_logs[pattern] = []
                suspicious_logs[pattern].append(log)
                break
    
    return suspicious_logs

def detect_sensitive_endpoint_access(logs: List[LogEntry]) -> dict[str, List[LogEntry]]:
    """
    Detect access to potentially sensitive endpoints
    
    Args:
        logs: List of LogEntry objects to analyse
        
    Returns:
        dict[str, List[LogEntry]]: Dictionary mapping sensitive endpoints to their log entries
    """
    sensitive_patterns = [
        '/admin', '/login', '/wp-admin', '/phpmyadmin', '/config',
        '/.env', '/.git', '/backup', '/api/', '/debug', '/console'
    ]
    
    sensitive_logs = {}
    for log in logs:
        path = log.path.lower()
        for pattern in sensitive_patterns:
            if pattern in path:
                if pattern not in sensitive_logs:
                    sensitive_logs[pattern] = []
                sensitive_logs[pattern].append(log)
                break
    
    return sensitive_logs

def detect_burst_requests(logs: List[LogEntry], time_window_seconds: int = 60, request_threshold: int = 10) -> dict[str, List[tuple[LogEntry, float]]]:
    """
    Detect IPs making many requests within a short time window
    
    Args:
        logs: List of LogEntry objects to analyse
        time_window_seconds: Time window in seconds to consider for burst detection
        request_threshold: Minimum number of requests within time window to consider suspicious
        
    Returns:
        dict[str, List[tuple[LogEntry, float]]]: Dictionary mapping IPs to list of (log entry, time since first request) tuples
    """
    
    # Group logs by IP address
    ip_logs = defaultdict(list)
    for log in logs:
        ip_logs[log.remote_addr].append(log)
    
    burst_requests = {}
    
    for ip, ip_entries in ip_logs.items():
        # Sort logs by timestamp
        sorted_logs = sorted(ip_entries, key=lambda x: x.datetime)
        
        # Use sliding window to detect bursts
        for i in range(len(sorted_logs)):
            window_start = datetime.fromisoformat(sorted_logs[i].datetime) 
            window_end = window_start + timedelta(seconds=time_window_seconds)
            window_end_str = window_end.isoformat()
            
            # Count requests in this window
            window_requests = []
            for j in range(i, len(sorted_logs)):
                if sorted_logs[j].datetime > window_end_str:
                    break
                time_diff = (datetime.fromisoformat(sorted_logs[j].datetime) - window_start).total_seconds()
                window_requests.append((sorted_logs[j], time_diff))
            
            # If we found a burst, add it to results
            if len(window_requests) >= request_threshold:
                burst_requests[ip] = window_requests
                break  # Only report the first burst for each IP
    
    return burst_requests

def count_status_codes(logs: List[LogEntry]) -> Dict[str, int]:
    """
    Count HTTP status codes by their category (2xx, 3xx, 4xx, 5xx)
    
    Args:
        logs: List of LogEntry objects to analyse
        
    Returns:
        Dict[str, int]: Dictionary mapping status code categories to their counts
    """
    status_counts = {
        '2xx': 0,  # Success
        '3xx': 0,  # Redirection
        '4xx': 0,  # Client Error
        '5xx': 0,  # Server Error
    }
    
    for log in logs:
        status = log.status
        if 200 <= status < 300:
            status_counts['2xx'] += 1
        elif 300 <= status < 400:
            status_counts['3xx'] += 1
        elif 400 <= status < 500:
            status_counts['4xx'] += 1
        elif 500 <= status < 600:
            status_counts['5xx'] += 1
    
    return status_counts

def count_http_methods(logs: List[LogEntry]) -> Dict[str, int]:
    """
    Count the number of requests by HTTP method (GET, POST, etc.)
    
    Args:
        logs: List of LogEntry objects to analyse
        
    Returns:
        Dict[str, int]: Dictionary mapping HTTP methods to their request counts
    """
    method_counts = defaultdict(int)
    
    for log in logs:
        method = log.method.upper()  # Normalize to uppercase
        method_counts[method] += 1
    
    return dict(method_counts)

def count_most_accessed_paths(logs: List[LogEntry]) -> Dict[str, int]:
    """
    Count and return the frequency of accessed paths, removing query parameters.
    
    Args:
        logs: List of LogEntry objects to analyse
        
    Returns:
        Dict[str, int]: Dictionary mapping paths to their access counts
    """
    path_counts = defaultdict(int)
    
    for log in logs:
        # Remove query parameters from path
        path = log.path.split('?')[0]
        path_counts[path] += 1
    
    return dict(path_counts)

def calculate_requests_per_minute(logs: List[LogEntry]) -> List[Tuple[str, int]]:
    """
    Calculate the number of requests per minute over time.
    Returns data points suitable for a time series graph.
    
    Args:
        logs: List of LogEntry objects to analyse
        
    Returns:
        List[Tuple[str, int]]: List of (timestamp, request_count) tuples, where timestamp is in ISO format
    """
    if not logs:
        return []
    
    # Sort logs by timestamp
    sorted_logs = sorted(logs, key=lambda x: x.datetime)
    
    # Get the time range
    start_time = datetime.fromisoformat(sorted_logs[0].datetime)
    end_time = datetime.fromisoformat(sorted_logs[-1].datetime)
    
    # Initialize the time series data
    time_series = []
    current_time = start_time
    
    # Group logs by minute
    while current_time <= end_time:
        next_time = current_time + timedelta(minutes=1)
        # Count requests in this minute
        count = sum(1 for log in sorted_logs 
                   if current_time <= datetime.fromisoformat(log.datetime) < next_time)
        
        time_series.append((current_time.isoformat(), count))
        current_time = next_time
    
    return time_series

def analyze_error_paths(logs: List[LogEntry], error_threshold: int = 3) -> Dict[str, Dict[str, int]]:
    """
    Analyze paths that frequently result in errors.
    Groups errors by path and status code to identify problematic endpoints.
    
    Args:
        logs: List of LogEntry objects to analyse
        error_threshold: Minimum number of errors to consider a path problematic (default: 3)
        
    Returns:
        Dict[str, Dict[str, int]]: Dictionary mapping paths to their error counts by status code
    """
    # Group errors by path and status code
    error_paths = defaultdict(lambda: defaultdict(int))
    
    for log in logs:
        # Only consider 4xx and 5xx responses as errors
        if 400 <= log.status < 600:
            error_paths[log.path][str(log.status)] += 1
    
    # Filter to only include paths with enough errors
    significant_errors = {
        path: status_counts 
        for path, status_counts in error_paths.items()
        if sum(status_counts.values()) >= error_threshold
    }
    
    return dict(significant_errors)

def generate_insights(
    blacklist_occurance: List[str],
    request_counts: dict[str, int],
    high_frequency_ips: dict[str, int],
    suspicious_user_agents: dict[str, List[LogEntry]],
    sensitive_endpoint_access: dict[str, List[LogEntry]],
    burst_requests: dict[str, List[tuple[LogEntry, float]]],
    user_agent_counts: dict[str, int],
    status_counts: dict[str, int],
    method_counts: dict[str, int],
    requests_per_minute: List[Tuple[str, int]],
    error_paths: Dict[str, Dict[str, int]],
    path_counts: Dict[str, int]
) -> List[str]:
    """
    Generate key insights from the analysis results
    
    Args:
        Various analysis results from other functions
        
    Returns:
        List[str]: List of key insights about potential anomalies
    """
    insights = []
    
    # Blacklist insights
    if blacklist_occurance:
        insights.append(f"Found {len(blacklist_occurance)} blacklisted IPs accessing the system")
    
    # High frequency IP insights
    if high_frequency_ips:
        insights.append(f"Detected {len(high_frequency_ips)} IPs making unusually high numbers of requests")
        for ip, count in high_frequency_ips.items():
            insights.append(f"IP {ip} made {count} requests, significantly above average")
    
    # Most accessed paths insights
    if path_counts:
        total_requests = sum(path_counts.values())
        if total_requests > 0:
            # Sort paths by count and get top 5
            top_paths = sorted(path_counts.items(), key=lambda x: x[1], reverse=True)[:5]
            
            insights.append(f"Top 5 most accessed paths:")
            for path, count in top_paths:
                percentage = (count / total_requests) * 100
                insights.append(f"- {path}: {count} requests ({percentage:.1f}% of total)")
            
            # Identify potential hotspots (paths with more than 20% of total traffic)
            hotspot_threshold = total_requests * 0.2
            hotspots = [(path, count) for path, count in path_counts.items() if count > hotspot_threshold]
            if hotspots:
                insights.append(f"Found {len(hotspots)} high-traffic paths (more than 20% of total requests)")
    
    # Suspicious user agent insights
    if suspicious_user_agents:
        total_suspicious = sum(len(entries) for entries in suspicious_user_agents.values())
        insights.append(f"Detected {total_suspicious} requests from suspicious user agents")
        for pattern, entries in suspicious_user_agents.items():
            insights.append(f"Found {len(entries)} requests using {pattern} user agent")
    
    # Sensitive endpoint insights
    if sensitive_endpoint_access:
        total_sensitive = sum(len(entries) for entries in sensitive_endpoint_access.values())
        insights.append(f"Detected {total_sensitive} accesses to sensitive endpoints")
        for endpoint, entries in sensitive_endpoint_access.items():
            insights.append(f"Found {len(entries)} accesses to {endpoint}")
    
    # Burst request insights
    if burst_requests:
        insights.append(f"Detected {len(burst_requests)} IPs making burst requests")
        for ip, requests in burst_requests.items():
            insights.append(f"IP {ip} made {len(requests)} requests in a short time window")
    
    # User agent distribution insights
    if user_agent_counts:
        total_requests = sum(user_agent_counts.values())
        if total_requests > 0:
            # Find user agents with more than 20% of total requests
            threshold = total_requests * 0.2
            for ua, count in user_agent_counts.items():
                if count > threshold:
                    percentage = (count / total_requests) * 100
                    insights.append(f"User agent '{ua}' accounts for {percentage:.1f}% of all requests")
    
    # Status code insights
    if status_counts:
        total_responses = sum(status_counts.values())
        if total_responses > 0:
            # Calculate percentages for each status code category
            for category, count in status_counts.items():
                if count > 0:
                    percentage = (count / total_responses) * 100
                    insights.append(f"{percentage:.1f}% of responses are {category}")
            
            # Alert on high error rates
            error_rate = ((status_counts['4xx'] + status_counts['5xx']) / total_responses) * 100
            if error_rate > 10:  # Alert if more than 10% of responses are errors
                insights.append(f"High error rate detected: {error_rate:.1f}% of responses are errors")
            
            # Alert on high server error rate
            server_error_rate = (status_counts['5xx'] / total_responses) * 100
            if server_error_rate > 5:  # Alert if more than 5% of responses are server errors
                insights.append(f"High server error rate detected: {server_error_rate:.1f}% of responses are 5xx errors")
    
    # HTTP method insights
    if method_counts:
        total_requests = sum(method_counts.values())
        if total_requests > 0:
            # Calculate percentages for each method
            for method, count in method_counts.items():
                percentage = (count / total_requests) * 100
                insights.append(f"{percentage:.1f}% of requests use {method} method")
            
            # Alert on unusual method distributions
            if 'POST' in method_counts and method_counts['POST'] > 0:
                post_percentage = (method_counts['POST'] / total_requests) * 100
                if post_percentage > 30:  # Alert if more than 30% of requests are POST
                    insights.append(f"High POST request rate detected: {post_percentage:.1f}% of requests are POST")
            
            # Alert on potentially dangerous methods
            dangerous_methods = {'PUT', 'DELETE', 'PATCH', 'TRACE', 'CONNECT'}
            for method in dangerous_methods:
                if method in method_counts and method_counts[method] > 0:
                    insights.append(f"Potentially dangerous {method} method detected: {method_counts[method]} requests")
    
    # Traffic pattern insights
    if requests_per_minute:
        # Calculate average requests per minute
        total_requests = sum(count for _, count in requests_per_minute)
        total_minutes = len(requests_per_minute)
        avg_requests = total_requests / total_minutes if total_minutes > 0 else 0
        
        # Find peak traffic
        max_requests = max(count for _, count in requests_per_minute)
        max_time = next(time for time, count in requests_per_minute if count == max_requests)
        
        insights.append(f"Average traffic: {avg_requests:.1f} requests per minute")
        insights.append(f"Peak traffic: {max_requests} requests at {max_time}")
        
        # Detect traffic spikes (more than 2x average)
        spike_threshold = avg_requests * 2
        spikes = [(time, count) for time, count in requests_per_minute if count > spike_threshold]
        if spikes:
            insights.append(f"Detected {len(spikes)} traffic spikes above {spike_threshold:.1f} requests per minute")
        
        # Detect traffic drops (less than 0.5x average)
        drop_threshold = avg_requests * 0.5
        drops = [(time, count) for time, count in requests_per_minute if count < drop_threshold]
        if drops:
            insights.append(f"Detected {len(drops)} traffic drops below {drop_threshold:.1f} requests per minute")
    
    # Error path insights
    if error_paths:
        total_error_paths = len(error_paths)
        insights.append(f"Found {total_error_paths} paths with significant error rates")
        
        # Sort paths by total error count
        sorted_paths = sorted(
            error_paths.items(),
            key=lambda x: sum(x[1].values()),
            reverse=True
        )
        
        # Report top 5 most error-prone paths
        for path, status_counts in sorted_paths[:5]:
            total_errors = sum(status_counts.values())
            error_breakdown = ", ".join(f"{status}: {count}" for status, count in status_counts.items())
            insights.append(f"Path '{path}' had {total_errors} errors ({error_breakdown})")
        
        # Look for patterns in error paths
        common_prefixes = defaultdict(int)
        for path in error_paths.keys():
            # Split path into segments and count common prefixes
            segments = path.split('/')
            for i in range(1, len(segments)):
                prefix = '/'.join(segments[:i])
                common_prefixes[prefix] += 1
        
        # Report common prefixes with multiple error paths
        for prefix, count in common_prefixes.items():
            if count >= 3:  # If 3 or more error paths share this prefix
                insights.append(f"Multiple error paths found under '{prefix}' ({count} paths)")
    
    return insights

def generate_map_markers(logs: List[LogEntry]) -> List[Dict]:
    """
    Generate map markers from logs using IP geolocation data
    
    Args:
        logs: List of LogEntry objects to analyse
        
    Returns:
        List[Dict]: List of marker objects with coordinates and metadata
    """
    # Load IP cache
    ip_cache_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'ip_cache.json')
    with open(ip_cache_path, 'r') as f:
        ip_cache = json.load(f)
    
    # Count requests by IP to determine marker size
    request_counts = count_requests_by_ip(logs)
    
    # Create markers for each unique IP
    markers = []
    seen_ips = set()
    
    for log in logs:
        ip = log.remote_addr
        if ip in seen_ips:
            continue
            
        seen_ips.add(ip)
        if ip not in ip_cache:
            continue
            
        ip_data = ip_cache[ip]
        if ip_data['status'] != 'success':
            continue
            
        # Create marker with IP data and request count
        marker = {
            'id': ip,
            'latitude': ip_data['lat'],
            'longitude': ip_data['lon'],
            'city': ip_data['city'],
            'country': ip_data['country'],
            'isp': ip_data['isp'],
            'request_count': request_counts.get(ip, 0),
        }
        markers.append(marker)
    
    return markers