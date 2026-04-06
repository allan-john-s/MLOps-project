import pandas as pd
from .utils import get_logger

logger = get_logger("feature_engineering")

def engineer_features(df):
    """Create new meaningful features from existing data."""
    logger.info("Starting feature engineering.")
    df = df.copy()
    
    df['time'] = pd.to_datetime(df['time'])
    df['hour'] = df['time'].dt.hour
    df['dayOfWeek'] = df['time'].dt.dayofweek
    df['isWeekend'] = df['dayOfWeek'].apply(lambda x: 1 if x >= 5 else 0)
    
    df = df.drop(columns=['time', 'endTime', 'name', 'vehicleNumber', 'status'])
    
    logger.info(f"Feature engineering complete. Current columns: {df.columns.tolist()}")
    return df