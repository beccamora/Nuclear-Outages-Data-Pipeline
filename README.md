# Nuclear Outages Data Pipeline

This project implements a data pipeline that extracts Nuclear Outages data from the U.S. Energy Information Administration (EIA) Open Data API, processes and stores it efficiently, and exposes it through a REST API with a simple web interface.

# Live Demo
Link: https://nuclear-outages-data-pipeline-72yc.vercel.app/
- Backend Deployed on Render
- Frontend Deployed on Vercel

> Note: the backend is hosted on Render's free tier and may take 30–60 seconds
> to load on the first request if it has been inactive. If Refresh Data
> times out, wait a moment and try again.

# Quick Start (Local)
### Prerequisites
- Python 3.10+
- Node.js 18+
- A free EIA API key (see below)

## 1. Get an EIA API Key

1. Go to https://www.eia.gov/opendata/
2. Register with your email
3. Your API key will be sent by email within a few minutes

## 2. Clone the repository
```bash
git clone https://github.com/beccamora/Nuclear-Outages-Data-Pipeline.git

cd Nuclear-Outage-Data-Pipeline
```

## 3. Backend Setup
```bash
# navigate to the backend folder
cd Nuclear-Outage-Data-Pipeline/backend

# create and activate a virtual environment
python -m venv .venv

# Mac / Linux
source .venv/bin/activate

# Windows
.venv\Scripts\activate

# install dependencies
pip install -r requirements.txt
```

**Create an `.env` file** inside the `backend/` folder and write your API key and base URL:
```
EIA_API_KEY=your_api_key_here

EIA_BASE_URL=eia_base_url_here
```

## 3. Run the API
Open a new terminal:
```bash
cd Nuclear-Outage-Data-Pipeline

uvicorn backend.app.main:app --reload
```

- The API will be running at `http://localhost:8000`
- Swagger UI will be running at `http://127.0.0.1:8000/docs#/`
---

## 4. Run the Frontend

Open a new terminal:
```bash
cd Nuclear-Outage-Data-Pipeline/frontend

npm install

npm run dev
```
The dashboard will be at `http://localhost:5173`

## 5. Load Data

Open `http://localhost:5173` and click **Refresh Data** in the top right corner to trigger the pipeline that extracts data from the EIA API and saves it locally.
The first run takes about 30–60 seconds depending on your connection.

## Assumptions

- The EIA endpoint returns **US-level aggregate data**. One record per day
  representing total national nuclear outage.
- The pipeline uses **incremental loading**: on subsequent runs it only saves
  records newer than the most recent date stored to avoid duplicates.

### Example Result `/data`
```json
{
    "total": 7026,
    "page": 1,
    "pages": 586,
    "data": [
        {
            "period": "2024-01-15",
            "capacity": 101764.9,
            "outage": 5806.928,
            "percentOutage": 5.71
        }
    ]
}
```

### Example Result `/data/stats`
```json
{
    "data": [
        {
            "year": 2024,
            "avg_outage": 8271.28,
            "max_outage": 18500.0,
            "min_outage": 3200.5
        }
    ]
}
```
