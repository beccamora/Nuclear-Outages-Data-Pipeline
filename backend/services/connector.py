"""
PART 1: Data Connector
extract data from EIA API
"""
import requests
import logging
import time
from backend.app.utils.config import settings

class EIAConnector:
    """
    - Authenticate API key
    - Extract dataset with pagination
    - Error handling (API auth, status codes)

    """
    def __init__(self):
        self.base_url = settings.EIA_BASE_URL
        self.api_key = settings.EIA_API_KEY
        self.page_size = settings.page_size
        self.max_retries = settings.max_retries
        self.retry_delay = settings.retry_delay

    def fetch_data(self) -> list[dict]:
        # Authenticate API key
        if not self.api_key:
            logging.error("API key not found! Set EIA_API_KEY environment variable.")
            raise ValueError("EIA_API_KEY is required")

        # collect records and position in dataset
        all_records = []
        offset = 0

        # dictionary for query string
        # loop until no more records are found
        while True:
            params = {
                "api_key": self.api_key,
                "frequency": "daily",
                "data[0]": "capacity",
                "data[1]": "outage",
                "data[2]": "percentOutage",
                "offset": offset,
                "length": self.page_size
            }

            # call GET function
            records = self.get_data(self.base_url, params)

            if not records:
                logging.info("No records found")
                break

            # add all elements found in records to all_records (unlike append that would add it as 1 element)
            all_records.extend(records)
            logging.info(f"Fetched {len(records)} records (offset={offset})")

            # check for last page based on
            if len(records) < self.page_size:
                logging.info(f"Reached last page")
                break

            # advance offest and loop for next page
            offset += self.page_size

        logging.info(f"Finished fetching: {len(all_records)} records")
        return all_records

    def get_data(self, url: str, params: dict) -> list[dict]:
        for attempt in range(self.max_retries):
            try:
                # HTTP GET request
                response = requests.get(url, params=params, timeout=30)
                # Check for unauthorized API code and raise error
                if response.status_code == 401:
                    raise PermissionError("API key is invalid")

                # check for other codes
                response.raise_for_status()

                # JSON str to dict
                data = response.json().get("response", {}).get("data", [])
                return data

            # dont retry invalid API key
            except PermissionError:
                raise

            # other exceptions get a retry
            except Exception as e:
                logging.warning(f"Request failed (attempt {attempt + 1}): {e} ")
                # sleep on every attempt except the last one
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay)

        # if all attempts failed return an empty list (gets handled on fetch_data func)
        logging.error(f"Request failed after {self.max_retries} attempts, skipping page")
        return []