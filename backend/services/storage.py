"""
- Store table DF's as parquet files
- Functions to load data tables
- Function to get last period for incremental data extraction
"""
import pandas as pd
import logging
from backend.app.utils.config import settings

def save_data(outages_df: pd.DataFrame, yearly_df: pd.DataFrame):

    # create data folder if it does not exist
    settings.data_dir.mkdir(exist_ok=True)

    # check for existing outages df parquet file
    if settings.outages_file.exists():
        # load previously saved data
        previous = pd.read_parquet(settings.outages_file)
        # stack current and previous df and drop period duplicates
        outages_df = pd.concat([previous, outages_df], ignore_index=True)
        outages_df = outages_df.drop_duplicates(subset=["period"], keep="last")

    # final outages df
    outages_df.to_parquet(settings.outages_file, index=False)
    logging.info(f"Saved {len(outages_df)} rows to {settings.outages_file}")

    # yearly outages updates on every entry
    yearly_df.to_parquet(settings.yearly_file, index=False)
    logging.info(f"Saved {len(yearly_df)} rows to {settings.yearly_file}")

def load_data()->pd.DataFrame:
    # load outages for data entrypoint
    if not settings.outages_file.exists():
        logging.warning(f"No outages file found")
        return pd.DataFrame()
    return pd.read_parquet(settings.outages_file)

def load_yearly_data():
    # load yearly outages for data entrypoint
    if not settings.yearly_file.exists():
        logging.warning(f"No yearly data file found")
        return pd.DataFrame()
    return pd.read_parquet(settings.yearly_file)

def get_last_period():
    # return recent period
    if not settings.outages_file.exists():
        return None
    df = pd.read_parquet(settings.outages_file, columns=["period"])
    if df.empty:
        return None
    return df["period"].max()





