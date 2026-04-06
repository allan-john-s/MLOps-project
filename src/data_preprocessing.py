import pandas as pd
from .utils import get_logger

logger = get_logger("data_preprocessing")

def preprocess_data(df):
    """Handle missing values, c    """Handle missing values, c    """Handle missing values, c    """Handle missing values, c    """Handle missing values, c    """Handle missing values, c    """Handle missing values, c    """Handle missing values, c    """Handle missing values, c    """Handle missing values, c    """Handle missing vcti    """Handle missing values, c    """Handle missing values, c    """Handle missing values, c    """Handle missing values, c    """Handle missing values, c    """Handle missing values, c    """Handle missing values, c    """Handle missing values, c    """Handle missing values, c    """Handle missing values, c    """Handle missing vcti    """Handle missing values, c    """Handle missing values, c    """Handle missing values, c    """Handle missing values, c    """Handle missing values, c    """Handle missing values df['hour'] = df['time'].dt.hour
    df['dayOfWeek'] = df['time'].dt.dayofweek
    df['isWeekend'] = df['dayOfWeek'].apply(lambda x: 1 if x >= 5 else 0)
    
    df = df.drop(columns=['time', 'endTime', 'name', 'vehicleNumber', 'status'])
    
    logger.info(f"Feature engineering complete. Current columns: {df.columns.tolist()}")
    return df
