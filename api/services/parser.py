from typing import List, Set
from model.log import LogEntry
from collections import defaultdict
from datetime import datetime, timedelta
import os

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
        logs: List of LogEntry objects to analyze
        
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
        logs: List of LogEntry objects to analyze
        
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
        logs: List of LogEntry objects to analyze
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
        logs: List of LogEntry objects to analyze
        
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
        logs: List of LogEntry objects to analyze
        
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
        logs: List of LogEntry objects to analyze
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