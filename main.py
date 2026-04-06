import sys
import os
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.data_ingestion import ingest_data
from src.data_validation import validate_data
from src.data_preprocessing import preprocess_data
from src.feature_engineering import engineer_features
from src.data_splitting import split_and_save_data
from src.baseline_model import evaluate_baseline
from src.hyperparameter_tuning import tune_hyperparameters
from src.model_evaluation import evaluate_model
from src.utils import get_logger, load_config, save_model

logger = get_logger("main_pipeline")

def run_pipeline():
    logger.info("=== Starting MLOps Pipeline ===")
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    config = load_config()
    version = int(time.time())
    try:
        raw_df = ingest_data()
        validate_data(raw_df)
        clean_df = preprocess_data(raw_df)
        featured_df = engineer_features(clean_df)
        splits = split_and_save_data(featured_df)
        X_train, y_train = splits['X_train'], splits['y_train']
        X_val, y_val, X_test, y_test = splits['X_val'], splits['y_val'], splits['X_test'], splits['y_test']
        evaluate_baseline(X_train, y_train, X_val, y_val)
        best_model = tune_hyperparameters(X_train, y_train)
        evaluate_model(best_model, X_test, y_test)
        model_path = f"{config['model']['save_dir']}/{config['model']['model_name']}_v{version}.pkl"
        save_model(best_model, model_path)
        logger.info(f"Model successfully saved to {model_path}")
        logger.info("=== MLOps Pipeline Completed Successfully ===")
    except Exception as e:
        logger.error(f"Pipeline failed: {e}")
        raise

if __name__ == "__main__":
    run_pipeline()