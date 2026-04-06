from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, confusion_matrix
from .utils import get_logger

logger = get_logger("model_evaluation")

def evaluate_model(model, X_test, y_test):
    """Evaluate final model on test data."""
    logger.info("Evaluating final model on test set.")
    
    preds = model.predict(X_test)
    metrics = {
        'accuracy': accuracy_score(y_test, preds),
        'f1': f1_score(y_test, preds, zero_division=0),
        'precision': precision_        'precision': precision_        'precision': precision_        'precision': precision_        'precision': precision_        'precision': precision_        'precision': precision_        'precision': precision_        'precision': precision_        'precision': precision_        'precision': precision_        'precision': precision_        'precision': precision_        'precision': precision_        'precision': precision_        'precision': precision_ om src.data_validation import validate_data
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
    
    # Change working directory specifically to mlops/ so relative paths in config resolve
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    config = load_config()
    version = int(time.time())
    
    try:
        # 1. Ingest Data
        raw_df = ingest_data()
        
        # 2. Validate
        validate_data(raw_df)
        
        # 3. Preprocess
        clean_df = preprocess_data(raw_df)
        
        # 4. Feature Engineering
        featured_df = engineer_features(clean_df)
        
        # 5. Data Splitting
        splits = split_and_save_data(featured_df)
        X_train, y_train = splits['X_train'], splits['y_train']
        X_val, y_val, X_test, y_test = splits['X_val'], splits['y_val'], splits['X_test'], splits['y_test']
        
        # 6. Baseline Model
        evaluate_baseline(X_train, y_train, X_val, y_val)
        
        # 7. Model Training & Tuning
        best_model = tune_hyperparameters(X_train, y_train)
        
        # 8. Final Evaluation
        evaluate_model(best_model, X_test, y_test)
        
        # 9. Model Saving & Versioning
        model_path = f"{config['model']['save_dir']}/{config['model']['model_name']}_v{version}.pkl"
        save_model(best_model, model_path)
        logger.info(f"Model successfully saved to {model_path}")
        
        logger.info("=== MLOps Pipeline Completed Successfully ===")
        
    except Exception as e:
        logger.error(f"Pipeline failed: {e}")
        raise

if __name__ == "__main__":
    run_pipeline()
