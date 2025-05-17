import os
import uuid

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from services.elastic import es, es_index
from services.log_parser import NginxLogParser

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
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


        # TODO: Upload to S3

        # Parse the file
        parser = NginxLogParser()
        parser.parse_file(filename)

        # Prepare bulk indexing operations
        bulk_operations = []
        for i, entry in enumerate(parser.entries[0:10]):
            doc_id = f"{filename}_{i}"
            # Add the index operation metadata
            bulk_operations.append({"index": {"_index": es_index, "_id": doc_id}})
            # Add the document
            bulk_operations.append(entry)

        # Perform bulk indexing
        if bulk_operations:
            response = es.bulk(operations=bulk_operations)
            if response.get("errors"):
                print("Some documents failed to index:", response)
            else:
                print(f"Successfully bulk indexed {len(bulk_operations)//2} documents")

        # Clean up local file
        os.remove(filename)

        return JSONResponse({
            "success": True,
            "message": "Upload successful",
            "data": {
                "filename": filename,
                "lines_indexed": len(parser.entries)
            }
        })

    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Invalid file format - must be text file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))