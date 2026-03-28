"""
PART 3: Simple API
FastAPI application entry point
"""

import logging
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.endpoints import data, refresh
from backend.app.utils.logging_config import *

app = FastAPI()

# allow requests for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# include endpoints
app.include_router(data.router)
app.include_router(refresh.router)

# function to handle requests
@app.get("/")
def root():
    # info message
    return {
        "message": "Nuclear Outage API",
        "endpoints": {
            "POST /refresh":        "Trigger data pipeline",
            "GET  /data":           "Query outage records (params: page, limit, date_from, date_to)",
        }
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)