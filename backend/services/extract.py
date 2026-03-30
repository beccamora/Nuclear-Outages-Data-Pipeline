"""
Full pipeline integration for incremental data extraction
    - Call function from connector.py to extract data from EIA API (API auth, pagination and error handling))
    - Validate and structure data through process.py (check missing fields, DF for tables and charts)
    - Call function to save data as parquet from storage.py (save parquet, load data and helper func for incremental extraction)
"""
import logging
from backend.services.connector import EIAConnector
from backend.services.process import process_data
from backend.services.storage import save_data, get_last_period

def data_pipeline() -> dict:
    logging.info("Starting data pipeline")
    # fetch data
    connector = EIAConnector()
    raw_data = connector.fetch_data()
    # request failed, return empty list
    if not raw_data:
         logging.info("No records available")
         return {"status": "empty", "saved": 0}

    # call function to process data (validation and df structure)
    outages_df, yearly_df = process_data(raw_data)
    if outages_df.empty:
        logging.warning("No outages records available after processing")
        return {"status": "empty", "saved": 0}

    # filter records so we only add new ones (incremental extraction)
    last_period = get_last_period()
    if last_period:
        # filter df to keep dates after last period
        outages_df = outages_df[outages_df["period"] > last_period].reset_index(drop=True)
        logging.info(f"New records after {last_period.date()}: {len(outages_df)}")

    if outages_df.empty:
        logging.info("No new data to process")
        return {"status": "up_to_date", "records": 0}

    # call function to save df as parquet file
    save_data(outages_df, yearly_df)

    logging.info("Data pipeline completed")

    return {
        "status": "success",
        "records": len(outages_df),
        "period_from": str(outages_df["period"].min().date()),
        "period_to": str(outages_df["period"].max().date()),
    }
