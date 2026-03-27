"""
Validate data extracted from EIA API and structure into
- Outages table
- Yearly outages table (min, max and avg)
"""
import pandas as pd
import logging

required_fields = ["period", "capacity", "outage", "percentOutage"]

def process_data(raw_data:list[dict])-> tuple[pd.DataFrame, pd.DataFrame]:
    # validate data
    valid_data = validate_data(raw_data)

    if not valid_data:
        logging.warning("Validation failed")
        return pd.DataFrame(), pd.DataFrame()

    # table 1 - structure outages data
    df = pd.DataFrame(valid_data)
    # only keep required fields (drop units)
    df = df[["period", "capacity", "outage", "percentOutage"]]

    # normalize df
    df["period"] = pd.to_datetime(df["period"], errors="coerce")
    df["capacity"] = pd.to_numeric(df["capacity"], errors="coerce")
    df["outage"] = pd.to_numeric(df["outage"], errors="coerce")
    df["percentOutage"] = pd.to_numeric(df["percentOutage"], errors="coerce")

    # sort data by period and index
    df = df.sort_values("period").reset_index(drop=True)
    logging.info(f"Outages table ready: {len(df)} rows")

    # table 2 - structure yearly data
    yearly_df = df.copy()
    # extract year from period
    yearly_df["year"] = yearly_df["period"].dt.year

    # group data by year and show avg, max and min outages
    yearly_df = yearly_df.groupby("year")["outage"].agg(
        avg_outage="mean",
        max_outage="max",
        min_outage="min",
    ).reset_index()

    yearly_df["avg_outage"] = yearly_df["avg_outage"].round(2)
    yearly_df["max_outage"] = yearly_df["max_outage"].round(2)
    yearly_df["min_outage"] = yearly_df["min_outage"].round(2)

    logging.info(f"yearly table ready: {len(yearly_df)} years")

    return df, yearly_df


def validate_data(raw_data: list[dict]) -> list[dict]:
    valid_data = []
    skipped = 0

    for row in raw_data:
        # validate required fields
        if not all(row.get(field) for field in required_fields):
            logging.warning("Skipping, missing required fields")
            skipped += 1
            continue

        valid_data.append(row)

    logging.info(f"Validation complete. valid: {len(valid_data)}, skipped: {skipped}")

    return valid_data

