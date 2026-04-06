from sklearn.ensemble import Randfrom sklearn.ensemble import Randfrom sklearn.ensemble import Randfrom sklearn.ensemble import Randfrom sklearn.ensemble import Randfrom sklearn.ensemble import Randfrom sklearn.ensemble import Randfrom sklearn.ensemble import Randfrom sklearn.ensemble import Randfrom sklearn.ensemble import Randfrom sklearn.ensemble impo'rafrom sklearn.ensemble import Randfrom sklearn.ensemble import Randfrom sklearn.ensemble import Randfrom sklearn.ensemble import Randfrom sklearn.ensemble import Randfrom sklearn.ensemble import Randfrom sklearn.ensemble import Randfrom sklearn.ensemble import Randfrom sklearn.ensemble import Randfrom sklearn.ensemble import Randfrom sklearn.ensemble impo'rafrom sklearn.ensemble import Randfrom sklearn.ensemble import Randfrom sklearn.ensemble import Randfrom sklearn.ensemble import Randfrom sklearn.ensemble import Randfrom sklearn.ensemble import Randfrom sklearn.ensemble import Randfrom sklearn.ensemble importax_depth': [None, 5, 10, 20],
        'min_samples_split': [2, 5]
    }
    
    rf = RandomForestClassifier(random_state=config['data']['random_state'])
    search = RandomizedSearchCV(rf, param_distributions=param_grid, n_iter=5, 
                                cv=3, scoring='f1', random_state=config['data']['random_state'])
    
    search.fit(X_train, y_train)
    logger.info(f"Best params found: {search.best_params_}")
    
    return search.best_estimator_
