"""
PART 3: Simple API
endpoint to retrieve data from table and chart
"""
import pandas as pd
import logging
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from backend.services.storage import load_data, load_yearly_data

router = APIRouter()

# GET endpoint with query parameters for outages
@router.get("/data")
def get_data(
        # set values
        page: int =Query(1, ge=1),
        limit: int = Query(100, ge=1, le=5000),
        date_from: Optional[str] = Query(None),
        date_to: Optional[str] = Query(None),
):

    # read outages parquet file
    df = load_data()
    if df.empty:
        # source missing
        raise HTTPException(
            status_code=503,
            detail="No data available — run POST /refresh first"
        )

    # if the date was provided, we filter rows
    if date_from:
        df = df[df["period"] >= pd.to_datetime(date_from)]
    if date_to:
        df = df[df["period"] <= pd.to_datetime(date_to)]


    total = len(df)

    # paginate with 100 limit
    start = (page - 1) * limit
    page_df = df.iloc[start: start + limit].copy()

    # dates for JSON response
    page_df["period"] = page_df["period"].astype(str)

    return {
        "total": total,
        "page": page,
        "pages": -(-total // limit),
        "data": page_df.to_dict(orient="records"),
    }

# GET endpoint to get yearly outages
@router.get("/data/stats")
def get_stats():
    df = load_yearly_data()

    if df.empty:
        raise HTTPException(
            status_code=503,
            detail="No data available — run POST /refresh first"
        )

    return {"data": df.to_dict(orient="records")}
