import logging
import yaml
import joblib
from pathlib import Path

defdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefde Pdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefde Pdefdefdefdefdelogdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefde Pdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefde Pdefdefdefdefdelogdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefde Pdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefde Pdefdefdefdefdelogdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefde Pdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefde Pdefdefdefdefdelogdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefde Pdefdefdefdefdefdefdefdefdefdefdefdefingdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefdefde Pdefdefdefdefdefdefdefdef= ldefdefdefdefdefdefdefdefde= config['data']['raw_data_path']
        logger.info(f"Ingesting data from {path}")
        df = pd.read_csv(path)
        logger.info(f"Data ingested successfully. Shape: {df.shape}")
        return df
    except Exception as e:
        logger.error(f"Error during data ingestion: {e}")
        raise
