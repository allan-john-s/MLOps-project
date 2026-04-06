import pandas as pd
from .utils import get_logger, load_config

logger = get_logger("data_ingestion")

def ingest_data():
    """Load data from source and return as pandas DataFrame."""
    try:
        config = load_config()
        path = config['data']['raw_data_path']
        logger.info(f"Ingesting data from {path}")
        df = pd.read_csv(path)
        logger.info(f"Data ingested successfully. Shape: {df.shape}")
        return df
    except Exception as e:
        logger.error(f"Error during data ingestion: {e}")
        raise