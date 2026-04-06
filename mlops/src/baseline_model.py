from sklearn.dummy import DummyClassifier
from sklearn.metrics import f1_score
from .utils import get_logger

logger = get_logger("baseline_model")

def evaluate_baseline(X_train, y_train, X_val, y_val):
    """Train and evaluate a naive baseline model."""
    logger.info("Training Baseline Model (Majority Class).")
    
    model = DummyClassifier(strategy='most_frequent')
    model.fit(X_train, y_train)
    
    preds = model.predict(X_val)
    f1 = f1_score(y_val, preds, zero_division=0)
    
    logger.info(f"Baseline Val F1 Score: {f1:.4f}")
    return model, f1
