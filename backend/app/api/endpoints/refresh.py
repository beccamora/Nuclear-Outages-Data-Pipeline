"""
PART 3: Simple API
Endpoint to trigger data extraction
"""
import logging
from fastapi import APIRouter, BackgroundTasks
from backend.services.extract import data_pipeline

# create API router to group operations
router = APIRouter()

# flag operation
is_running = False

# POST because we are triggering an action
@router.post("/refresh")
def refresh(background_tasks: BackgroundTasks):

    global is_running
    if is_running:
        return {"status": "already_running"}

    # schedule run pipeline task
    background_tasks.add_task(run_full_pipeline)
    return {"status": "started"}


def run_full_pipeline():
    # set flag as true and then run pipeline
    global is_running
    is_running = True
    try:
        result = data_pipeline()
        logging.info(f"Pipeline finished: {result}")
    finally:
        # reset flag
        is_running = False