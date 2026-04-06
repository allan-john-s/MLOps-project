from .utils import get_logger

logger = get_logger("data_validation")

def validate_data(df):
    """Validate data schema and check for critical issues."""
    logger.info("Starting data validation.")
    
    if df.empty:
        raise ValueError("Dataset is empty!")

    missing = df.isnull().sum().sum()
    if missing > 0:
        logger.warning(f"Found {missing} missing values in the dataset.")
        
    logger.info("Data validation completed.")
    return True
