#!/usr/bin/env python3
"""
Nginx Log Parser

This script parses nginx access logs and provides analysis capabilities.
It supports the default nginx log format as well as common variations.

Usage:
    python nginx_log_parser.py [logfile] [options]

Options:
    --format FORMAT    Specify the log format (default, combined, custom)
    --filter FIELD=VALUE   Filter logs by field value
    --top N FIELD      Show top N entries for a field (e.g. IP, URL)
    --timerange START END  Filter logs by time range (format: YYYY-MM-DD HH:MM:SS)
    --output OUTPUT    Output format (console, csv, json)
"""

import re
import sys
import argparse
import json
import csv
from datetime import datetime
from collections import Counter, defaultdict


class NginxLogParser:
    # Standard nginx log format patterns
    LOG_FORMATS = {
        'default': r'(?P<remote_addr>[\d\.]+) - (?P<remote_user>[^ ]*) \[(?P<time_local>.*?)\] "(?P<request>.*?)" (?P<status>\d+) (?P<body_bytes_sent>\d+) "(?P<http_referer>.*?)" "(?P<http_user_agent>.*?)"',
        'combined': r'(?P<remote_addr>[\d\.]+) - (?P<remote_user>[^ ]*) \[(?P<time_local>.*?)\] "(?P<request>.*?)" (?P<status>\d+) (?P<body_bytes_sent>\d+) "(?P<http_referer>.*?)" "(?P<http_user_agent>.*?)"',
        'error': r'(?P<time>\d{4}/\d{2}/\d{2} \d{2}:\d{2}:\d{2}) \[(?P<level>.*?)\] (?P<pid>\d+)#(?P<tid>\d+): \*(?P<message>.*)'
    }

    def __init__(self, format_name='default', custom_format=None):
        """
        Initialize the parser with the specified log format
        
        Args:
            format_name: One of the predefined formats ('default', 'combined', 'error')
            custom_format: A custom regex pattern for parsing logs
        """
        if custom_format:
            self.pattern = re.compile(custom_format)
        elif format_name in self.LOG_FORMATS:
            self.pattern = re.compile(self.LOG_FORMATS[format_name])
        else:
            raise ValueError(f"Unknown format: {format_name}")
        
        self.entries = []
        self.stats = {}

    def parse_file(self, filename):
        """Parse an nginx log file and store the entries"""
        try:
            with open(filename, 'r') as file:
                for line_num, line in enumerate(file, 1):
                    try:
                        entry = self.parse_line(line)
                        if entry:
                            self.entries.append(entry)
                    except Exception as e:
                        print(f"Error parsing line {line_num}: {line.strip()}")
                        print(f"Error: {e}")
        except FileNotFoundError:
            print(f"Error: File '{filename}' not found")
            sys.exit(1)
        
        print(f"Successfully parsed {len(self.entries)} log entries")
        return self.entries

    def parse_line(self, line):
        """Parse a single line from the log file"""
        match = self.pattern.match(line.strip())
        if not match:
            return None
        
        data = match.groupdict()
        
        # Further process some fields
        if 'time_local' in data:
            # Convert nginx time format to datetime object
            time_str = data['time_local']
            try:
                # Standard nginx time format: 10/Oct/2023:13:55:36 +0200
                data['datetime'] = datetime.strptime(
                    time_str.split()[0], "%d/%b/%Y:%H:%M:%S"
                )
            except ValueError:
                # If parsing fails, keep the original string
                data['datetime'] = time_str
        
        if 'request' in data:
            # Parse HTTP request into method, path, and protocol
            request_parts = data['request'].split()
            if len(request_parts) >= 3:
                data['method'] = request_parts[0]
                data['path'] = request_parts[1]
                data['protocol'] = request_parts[2]
            elif len(request_parts) == 2:
                data['method'] = request_parts[0]
                data['path'] = request_parts[1]
                data['protocol'] = ''
            else:
                data['method'] = data['request']
                data['path'] = ''
                data['protocol'] = ''
        
        # Convert numeric fields to integers
        for field in ['status', 'body_bytes_sent']:
            if field in data and data[field].isdigit():
                data[field] = int(data[field])
        
        return data

    def filter_entries(self, field, value):
        """Filter log entries by field value"""
        if not field or not value:
            return self.entries
        
        filtered = []
        for entry in self.entries:
            if field in entry:
                # Handle different types of comparisons
                if isinstance(entry[field], str) and isinstance(value, str):
                    if value.startswith('*') and value.endswith('*'):
                        # Wildcard search
                        if value[1:-1] in entry[field]:
                            filtered.append(entry)
                    elif value.startswith('*'):
                        # Ends with
                        if entry[field].endswith(value[1:]):
                            filtered.append(entry)
                    elif value.endswith('*'):
                        # Starts with
                        if entry[field].startswith(value[:-1]):
                            filtered.append(entry)
                    else:
                        # Exact match
                        if entry[field] == value:
                            filtered.append(entry)
                elif entry[field] == value:
                    filtered.append(entry)
        
        return filtered

    def filter_by_time_range(self, start_time, end_time):
        """Filter log entries by time range"""
        if not start_time or not end_time:
            return self.entries
        
        # Convert time strings to datetime objects if needed
        if isinstance(start_time, str):
            start_time = datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S")
        if isinstance(end_time, str):
            end_time = datetime.strptime(end_time, "%Y-%m-%d %H:%M:%S")
        
        filtered = []
        for entry in self.entries:
            if 'datetime' in entry:
                entry_time = entry['datetime']
                if start_time <= entry_time <= end_time:
                    filtered.append(entry)
        
        return filtered

    def calculate_stats(self):
        """Calculate various statistics from the log entries"""
        stats = {
            'total_entries': len(self.entries),
            'status_codes': Counter(),
            'ip_addresses': Counter(),
            'user_agents': Counter(),
            'requests_per_day': defaultdict(int),
            'paths': Counter(),
            'methods': Counter(),
            'bytes_sent': {
                'total': 0,
                'average': 0,
                'max': 0
            }
        }
        
        if not self.entries:
            self.stats = stats
            return stats
        
        for entry in self.entries:
            # Count status codes
            if 'status' in entry:
                stats['status_codes'][entry['status']] += 1
            
            # Count IP addresses
            if 'remote_addr' in entry:
                stats['ip_addresses'][entry['remote_addr']] += 1
            
            # Count user agents
            if 'http_user_agent' in entry:
                stats['user_agents'][entry['http_user_agent']] += 1
            
            # Count requests per day
            if 'datetime' in entry and isinstance(entry['datetime'], datetime):
                day = entry['datetime'].strftime('%Y-%m-%d')
                stats['requests_per_day'][day] += 1
            
            # Count paths
            if 'path' in entry:
                stats['paths'][entry['path']] += 1
            
            # Count methods
            if 'method' in entry:
                stats['methods'][entry['method']] += 1
            
            # Calculate bytes sent
            if 'body_bytes_sent' in entry:
                bytes_sent = entry['body_bytes_sent']
                stats['bytes_sent']['total'] += bytes_sent
                stats['bytes_sent']['max'] = max(stats['bytes_sent']['max'], bytes_sent)
        
        # Calculate average bytes sent
        stats['bytes_sent']['average'] = stats['bytes_sent']['total'] / len(self.entries)
        
        self.stats = stats
        return stats

    def get_top_entries(self, field, count=10):
        """Get the top N entries for a specific field"""
        if not field or not self.entries:
            return []
        
        counter = Counter()
        for entry in self.entries:
            if field in entry:
                counter[entry[field]] += 1
        
        return counter.most_common(count)

    def export_to_csv(self, filename):
        """Export log entries to CSV file"""
        if not self.entries:
            print("No entries to export")
            return False
        
        # Get all fields from all entries
        fields = set()
        for entry in self.entries:
            fields.update(entry.keys())
        
        # Sort fields for consistent output
        fields = sorted(fields)
        
        try:
            with open(filename, 'w', newline='') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=fields)
                writer.writeheader()
                for entry in self.entries:
                    # Ensure datetime is string
                    if 'datetime' in entry and isinstance(entry['datetime'], datetime):
                        entry = entry.copy()  # Don't modify the original
                        entry['datetime'] = entry['datetime'].strftime('%Y-%m-%d %H:%M:%S')
                    writer.writerow(entry)
            
            print(f"Exported {len(self.entries)} entries to {filename}")
            return True
        except Exception as e:
            print(f"Error exporting to CSV: {e}")
            return False

    def export_to_json(self, filename):
        """Export log entries to JSON file"""
        if not self.entries:
            print("No entries to export")
            return False
        
        try:
            # Convert datetime objects to strings
            entries_copy = []
            for entry in self.entries:
                entry_copy = entry.copy()
                if 'datetime' in entry_copy and isinstance(entry_copy['datetime'], datetime):
                    entry_copy['datetime'] = entry_copy['datetime'].strftime('%Y-%m-%d %H:%M:%S')
                entries_copy.append(entry_copy)
            
            with open(filename, 'w') as jsonfile:
                json.dump(entries_copy, jsonfile, indent=2)
            
            print(f"Exported {len(self.entries)} entries to {filename}")
            return True
        except Exception as e:
            print(f"Error exporting to JSON: {e}")
            return False

    def print_summary(self):
        """Print a summary of the log statistics"""
        if not self.stats:
            self.calculate_stats()
        
        stats = self.stats
        
        print("\n===== Nginx Log Summary =====")
        print(f"Total Entries: {stats['total_entries']}")
        
        print("\nTop 5 IP Addresses:")
        for ip, count in stats['ip_addresses'].most_common(5):
            print(f"  {ip}: {count}")
        
        print("\nHTTP Status Codes:")
        for status, count in sorted(stats['status_codes'].items()):
            print(f"  {status}: {count}")

        print("\nTop 5 Requested Paths:")
        for path, count in stats['paths'].most_common(5):
            print(f"  {path}: {count}")
        
        print("\nHTTP Methods:")
        for method, count in sorted(stats['methods'].items()):
            print(f"  {method}: {count}")
        
        print("\nBytes Sent:")
        print(f"  Total: {stats['bytes_sent']['total']}")
        print(f"  Average: {stats['bytes_sent']['average']:.2f}")
        print(f"  Max: {stats['bytes_sent']['max']}")
        
        print("\nRequests per Day:")
        for day, count in sorted(stats['requests_per_day'].items()):
            print(f"  {day}: {count}")


def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Parse and analyze Nginx logs')
    parser.add_argument('logfile', nargs='?', help='Path to the Nginx log file')
    parser.add_argument('--format', choices=['default', 'combined', 'error'], default='default',
                        help='Log format to use (default, combined, error)')
    parser.add_argument('--filter', help='Filter logs by field=value')
    parser.add_argument('--top', nargs=2, metavar=('N', 'FIELD'),
                        help='Show top N entries for a field (e.g. 10 remote_addr)')
    parser.add_argument('--timerange', nargs=2, metavar=('START', 'END'),
                        help='Filter logs by time range (format: YYYY-MM-DD HH:MM:SS)')
    parser.add_argument('--output', choices=['console', 'csv', 'json'], default='console',
                        help='Output format (console, csv, json)')
    parser.add_argument('--output-file', help='Output file name for CSV or JSON output')
    
    return parser.parse_args()
