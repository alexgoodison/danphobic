import os
import uuid

from fastapi import FastAPI, File, UploadFile, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Dict, Any
from services.elastic import es, es_index
from services.log_parser import NginxLogParser
from model.log import  LogEntry
from services.parser import check_blacklist_occurance, count_requests_by_ip, detect_high_frequency_ips, detect_suspicious_user_agents, detect_sensitive_endpoint_access, detect_burst_requests, count_user_agents, generate_insights, count_status_codes, count_http_methods, calculate_requests_per_minute, analyze_error_paths, count_most_accessed_paths, generate_map_markers, analyze_bot_vs_human_traffic
from services.gemini import gemini_model

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.post("/analyse")
async def analyse_logs(query: Dict[str, Any] = Body(...)):
    try:
        log_search = es.search(index=es_index, query=query, size=100)
        
        if not log_search.get("hits", {}).get("hits"):
            return {"message": "No logs found", "logs": []}

        logs = []
        for hit in log_search["hits"]["hits"]:
            try:
                log_entry = LogEntry(**hit["_source"])
                logs.append(log_entry)
            except Exception as e:
                print(f"Error converting log entry: {str(e)}")
                continue

        # Checks
        blacklist_occurance = check_blacklist_occurance(logs) # Array of blacklisted IPs
        request_counts = count_requests_by_ip(logs) # Dictionary of IP addresses and their request counts
        high_frequency_ips = detect_high_frequency_ips(logs) # Dictionary of IP addresses and their request counts
        suspicious_user_agents = detect_suspicious_user_agents(logs) # Dictionary of IP addresses and their request counts
        sensitive_endpoint_access = detect_sensitive_endpoint_access(logs) # Dictionary of IP addresses and their request counts
        burst_requests = detect_burst_requests(logs) # Dictionary of IP addresses and their request counts
        user_agent_counts = count_user_agents(logs) # Dictionary of user agents and their request counts
        status_counts = count_status_codes(logs) # Dictionary of status code categories and their counts
        method_counts = count_http_methods(logs) # Dictionary of HTTP methods and their counts
        requests_per_minute = calculate_requests_per_minute(logs) # List of (timestamp, count) tuples
        error_paths = analyze_error_paths(logs) # Dictionary of paths and their error counts
        path_counts = count_most_accessed_paths(logs) # Get all path counts
        bot_vs_human_traffic = analyze_bot_vs_human_traffic(logs) # List of (timestamp, bot_count, human_count) tuples

        # Generate insights including path analysis
        insights = generate_insights(
            blacklist_occurance,
            request_counts,
            high_frequency_ips,
            suspicious_user_agents,
            sensitive_endpoint_access,
            burst_requests,
            user_agent_counts,
            status_counts,
            method_counts,
            requests_per_minute,
            error_paths,
            path_counts
        )

        # print(f"Insights: {insights}")
        # print(f"Status counts: {status_counts}")
        # print(f"Method counts: {method_counts}")
        # print(f"Requests per minute: {requests_per_minute[:5]}...")  # Print first 5 data points
        # print(f"Error paths: {error_paths}")
        # print(f"Path counts: {path_counts}")
        print(f"Bot vs human traffic: {bot_vs_human_traffic}")

        summary = gemini_model.generate_content(f"<instructions>The following are key insights from a group of Nginx logs. In the response, only provide a bulletpointed, formatted summary of the key insights. Only use one level of bullet points. Include at most 7 bullet points. Ensure they are informative. Only provide the bulletpoints, no other text.</instructions> <insights>Total number of logs: {len(logs)}. Key insights: {insights}</insights>")

        map_markers = generate_map_markers(logs)

        return {
            "message": "Logs retrieved successfully",
            "total": len(logs),
            "logs": logs,
            "blacklist_occurance": blacklist_occurance,
            "request_counts": request_counts,
            "high_frequency_ips": high_frequency_ips,
            "suspicious_user_agents": suspicious_user_agents,
            "sensitive_endpoint_access": sensitive_endpoint_access,
            "burst_requests": burst_requests,
            "user_agent_counts": user_agent_counts,
            "status_counts": status_counts,
            "method_counts": method_counts,
            "requests_per_minute": requests_per_minute,
            "error_paths": error_paths,
            "path_counts": path_counts,
            "insights": insights,
            "summary": summary.text,
            "map_markers": map_markers,
            "bot_vs_human_traffic": bot_vs_human_traffic
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving logs: {str(e)}"
        )

@app.post("/upload")
async def upload_log(file: UploadFile = File(...)):
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")

        # Save file temporarily
        contents = await file.read()
        filename = f"{uuid.uuid4()}_{file.filename}"
        with open(filename, "wb") as f:
            f.write(contents)

        # Parse the file
        parser = NginxLogParser()
        parser.parse_file(filename)

        # Process in chunks of 1000 records
        chunk_size = 1000
        total_indexed = 0
        total_chunks = (len(parser.entries) + chunk_size - 1) // chunk_size

        for chunk_idx in range(total_chunks):
            start_idx = chunk_idx * chunk_size
            end_idx = min((chunk_idx + 1) * chunk_size, len(parser.entries))
            chunk_entries = parser.entries[start_idx:end_idx]

            # Prepare bulk indexing operations for this chunk
            bulk_operations = []
            for i, entry in enumerate(chunk_entries):
                doc_id = f"{filename}_{start_idx + i}"
                # Add the index operation metadata
                bulk_operations.append({"index": {"_index": es_index, "_id": doc_id}})
                # Add the document
                bulk_operations.append(entry)

            # Perform bulk indexing for this chunk
            if bulk_operations:
                response = es.bulk(operations=bulk_operations)
                if response.get("errors"):
                    print(f"Some documents failed to index in chunk {chunk_idx + 1}:", response)
                else:
                    chunk_count = len(bulk_operations) // 2
                    total_indexed += chunk_count
                    print(f"Successfully indexed chunk {chunk_idx + 1}/{total_chunks} ({chunk_count} documents)")

        # Clean up local file
        os.remove(filename)

        return JSONResponse({
            "success": True,
            "message": "Upload successful",
            "data": {
                "filename": filename,
                "lines_indexed": total_indexed,
                "total_chunks": total_chunks
            }
        })

    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Invalid file format - must be text file")
    except Exception as e:
        print(f"Error uploading log: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))