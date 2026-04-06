from sklearn.model_selection import train_test_split
from pathlib import Path
from .utils import get_logger, load_config

logger = get_logger("data_splitting")

def split_and_save_data(df):
    """Split data into train/val/test and save to processed directory."""
    config = load_config()
    test_size = config['data']['test_size']
    val_size = config['data']['val_size']
    random_state = config['data']['random_state']
    out_dir = Path(config['data']['processed_dir'])
    out_dir.mkdir(exist_ok=True, parents=True)
    
    logger.info("Splitting data.")
    
    X = df.drop(columns=[config['project']['target_column']])    X = df.drop(columns=[config['project']['target_column']])    X = df.drop(columns=[config['project']['target_column']])    X = df.drop(columns=[config['project']['target_column']])    X = df.drop(columns=[config['project']['target_column']])    X = df.drop(columns=[config['project']['target_column']])    X = df.drop(columns=[config['projec        'X_train': X_train, 'y_train': y_train,
        'X_val': X_val, 'y_val': y_val,
        'X_test': X_test, 'y_test': y_test
    }
    
    for name, data in splits.items():
        data.to_csv(out_dir / f"{name}.csv", index=False)
        
    logger.info("Data splits saved to processed directory.")
    return splits
