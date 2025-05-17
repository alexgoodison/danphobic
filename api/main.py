import os
import uuid

from fastapi import FastAPI, File, UploadFile, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Dict, Any
from services.elastic import es, es_index
from services.log_parser import NginxLogParser
from model.log import  LogEntry
from services.parser import check_blacklist_occurance, count_requests_by_ip, detect_high_frequency_ips, detect_suspicious_user_agents, detect_sensitive_endpoint_access, detect_burst_requests, count_user_agents

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
        log_search = es.search(index=es_index, query=query)
        
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
        print(f"Blacklist occurance: {blacklist_occurance}")
        print(f"Request counts: {request_counts}")
        print(f"High frequency IPs: {high_frequency_ips}")
        print(f"Suspicious user agents: {suspicious_user_agents}")
        print(f"Sensitive endpoint access: {sensitive_endpoint_access}")
        print(f"Burst requests: {burst_requests}")
        print(f"User agent counts: {user_agent_counts}")

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
            "user_agent_counts": user_agent_counts
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