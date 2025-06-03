# Danphobic - NGINX Log Analysis Dashboard 🏆

**Winner of the UCC ACM Hackathon sponsored by NGINX**

Created by Alex Goodison & Suneet Mahajan.

Danphobic is a powerful web-based dashboard for analyzing NGINX access logs. It provides insights into web server traffic patterns, detects anomalies, and helps identify potential security threats through advanced log analysis.

## 🎥 Demo

[![Danphobic Demo](https://img.youtube.com/vi/aNV8Q0hqLG8/0.jpg)](https://www.youtube.com/watch?v=aNV8Q0hqLG8)

## 🚀 Features

- **Interactive Dashboard**: Clean, modern interface for visualising log data
- **AI-Powered Analysis**: Leverages Google's Gemini LLM for intelligent log querying and analysis
- **Anomaly Detection**: Identifies suspicious patterns including:
  - High-frequency IP requests
  - Suspicious user agents
  - Sensitive endpoint access attempts
  - Burst requests
  - Error rate spikes
  - Bot vs. human traffic analysis
- **Geographic Visualisation**: Map view of request origins
- **Advanced Analytics**:
  - Request patterns over time
  - Status code distribution
  - HTTP method analysis
  - Most accessed paths
  - Error path analysis
  - Traffic pattern insights

## 🛠️ Tech Stack

- **Frontend**: Next.js with modern UI components
- **Backend**: FastAPI (Python)
- **Search Engine**: Elasticsearch for efficient log storage and querying
- **AI Integration**: Google Gemini LLM for intelligent log analysis
- **Data Processing**: Custom Python parser for NGINX log analysis

## 🎯 Problem Statement

The project addresses the challenge of making sense of NGINX access logs by:

1. Reading and parsing NGINX access logs
2. Identifying unusual patterns and potential security threats
3. Presenting insights through an intuitive dashboard interface

## 🏆 Achievement

This project won the UCC ACM Hackathon sponsored by NGINX, demonstrating excellence in:

- Technical implementation
- User experience design
- Problem-solving approach
- Innovation in log analysis

## 🔍 Key Features in Detail

### Anomaly Detection

- Identifies blacklisted IPs
- Detects unusual request patterns
- Monitors sensitive endpoint access
- Analyses user agent patterns
- Tracks error rates and spikes

### Data Visualisation

- Interactive charts and graphs
- Geographic request distribution
- Real-time traffic monitoring
- Error pattern analysis
- Traffic pattern insights

### AI Integration

- Natural language querying of logs
- Intelligent pattern recognition
- Automated anomaly detection
- Smart insights generation
