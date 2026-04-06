from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import RandomizedSearchCV
from .utils import get_logger, load_config

logger = get_logger("hyperparameter_tuning")

def tune_hyperparameters(X_train, y_train):
    config = load_config()
    logger.info("Starting hyperparameter tuning.")
    param_grid = {
        'n_estimators': [50, 100],
        'max_depth': [None, 5, 10],
        'min_samples_split': [2, 5]
    }
    rf = RandomForestClassifier(random_state=config['data']['random_state'])
    search = RandomizedSearchCV(rf, param_distributions=param_grid, n_iter=5, cv=3, scoring='f1', random_state=config['data']['random_state'])
    search.fit(X_train, y_train)
    logger.info(f"Best params found: {search.best_params_}")
    return search.best_estimator_