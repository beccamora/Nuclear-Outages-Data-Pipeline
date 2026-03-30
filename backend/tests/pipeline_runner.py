"""
Pipeline runner
"""
import sys
import logging
from backend.services.extract import data_pipeline
from backend.app.utils.logging_config import *

if __name__ == "__main__":
    try:
        result = data_pipeline()
        logging.info(f"Pipeline result: {result}")
    except Exception as e:
        logging.critical(f"Pipeline failed: {e}")
        sys.exit(1)