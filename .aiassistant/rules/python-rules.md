---
apply: always
---

# Python Implementation Rules for Shipping Intelligence Platform

## Overview
This document provides detailed Python implementation guidelines for ML/AI components of the SmartShipping Intelligence Platform. Follow these rules for all Python-based forecasting and optimization modules.

**Critical Guidelines:**
- Always run tests before committing - use `pytest` and verify all tests pass
- Implementation over planning - keep analysis brief then start coding
- Follow clean architecture with clear separation of concerns
- Core domain logic should be framework-agnostic
- Use type hints everywhere - run `mypy` for type checking

---

## Technology Stack Requirements

### Core Technologies
- **Python Version**: 3.11+ (Latest stable - leverage performance improvements and new features)
- **Web Framework**: FastAPI 0.100+ with Pydantic v2
- **Async Runtime**: uvicorn with asyncio
- **Data Processing**: pandas, numpy, polars (for large datasets)
- **ML Frameworks**: scikit-learn, TensorFlow/PyTorch, Prophet
- **Optimization**: OR-Tools, PuLP, scipy.optimize
- **Database**: SQLAlchemy 2.0+ with asyncpg
- **Testing**: pytest, pytest-asyncio, hypothesis, pytest-benchmark
- **Code Quality**: black, ruff, mypy, pre-commit hooks

### Required Dependencies
```toml
# pyproject.toml
[tool.poetry.dependencies]
python = "^3.10"
fastapi = "^0.104.0"
uvicorn = {extras = ["standard"], version = "^0.24.0"}
pydantic = "^2.4.0"
sqlalchemy = "^2.0.0"
asyncpg = "^0.28.0"
pandas = "^2.1.0"
numpy = "^1.25.0"
scikit-learn = "^1.3.0"
prophet = "^1.1.0"
tensorflow = "^2.14.0"
ortools = "^9.7.0"
redis = "^5.0.0"
celery = "^5.3.0"
httpx = "^0.25.0"
prometheus-client = "^0.18.0"
structlog = "^23.2.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.0"
pytest-asyncio = "^0.21.0"
pytest-cov = "^4.1.0"
black = "^23.10.0"
ruff = "^0.1.0"
mypy = "^1.6.0"
pre-commit = "^3.5.0"
```

---

## Project Structure Rules - Clean Architecture

### Mandatory Directory Organization (Clean Architecture Pattern)
```
shipping_platform/
├── domain/                      # Core business logic (NO framework dependencies)
│   ├── __init__.py
│   ├── entities/               # Business entities
│   │   ├── __init__.py
│   │   ├── booking.py
│   │   ├── vessel.py
│   │   └── port.py
│   ├── value_objects/          # Immutable value objects
│   │   ├── __init__.py
│   │   ├── money.py
│   │   └── coordinates.py
│   ├── services/               # Domain services
│   │   ├── __init__.py
│   │   └── pricing_service.py
│   └── ports/                  # Abstract interfaces
│       ├── __init__.py
│       ├── repositories.py    # Repository interfaces
│       └── external.py        # External service interfaces
├── application/                 # Application business rules
│   ├── __init__.py
│   ├── use_cases/             # Use case implementations
│   │   ├── __init__.py
│   │   ├── create_booking.py
│   │   └── optimize_route.py
│   └── dto/                   # Data Transfer Objects
│       ├── __init__.py
│       └── responses.py
├── infrastructure/             # Frameworks & Drivers (FastAPI, SQLAlchemy, etc.)
│   ├── __init__.py
│   ├── api/                   # FastAPI routes
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── forecasting.py
│   │   │   └── optimization.py
│   │   └── dependencies.py   # Dependency injection
│   ├── persistence/           # Database implementations
│   │   ├── __init__.py
│   │   ├── sqlalchemy/
│   │   │   ├── models.py
│   │   │   └── repositories.py
│   │   └── mongodb/
│   ├── ml/                   # ML implementations
│   │   ├── __init__.py
│   │   ├── forecasting/
│   │   └── optimization/
│   └── external/              # External service adapters
│       ├── __init__.py
│       ├── weather_api.py
│       └── ais_client.py
├── shared/                    # Shared kernel
│   ├── __init__.py
│   └── utils/                 # Utilities
│       ├── __init__.py
│       ├── logging.py
│       └── metrics.py
├── tests/                      # Test suite
│   ├── __init__.py
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── scripts/                    # Utility scripts
├── notebooks/                  # Jupyter notebooks for analysis
├── data/                      # Data directory
├── models/                    # Saved ML models
├── docker/                    # Docker configurations
├── alembic/                   # Database migrations
├── pyproject.toml
├── .env.example
└── README.md
```

---

## Coding Standards

### 1. Type Hints and Pydantic Models

#### Always Use Type Hints
```python
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, date
from decimal import Decimal

async def calculate_forecast(
    historical_data: List[Dict[str, Any]],
    start_date: date,
    end_date: date,
    confidence_level: float = 0.95,
    algorithm: Optional[str] = None
) -> Dict[str, Union[float, List[float]]]:
    """
    Calculate demand forecast for the specified period.

    Args:
        historical_data: Historical booking data
        start_date: Forecast start date
        end_date: Forecast end date
        confidence_level: Confidence level for prediction intervals
        algorithm: Specific algorithm to use

    Returns:
        Dictionary containing forecast values and confidence intervals
    """
    # Implementation
    pass
```

#### Pydantic Models for Data Validation
```python
from pydantic import BaseModel, Field, validator, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum

class CargoType(str, Enum):
    CONTAINER = "container"
    BULK = "bulk"
    BREAKBULK = "breakbulk"
    LIQUID = "liquid"

class ForecastRequest(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    trade_lane: str = Field(..., min_length=3, max_length=50, description="Trade lane identifier")
    start_date: date = Field(..., description="Forecast start date")
    end_date: date = Field(..., description="Forecast end date")
    cargo_type: CargoType = Field(..., description="Type of cargo")
    granularity: str = Field(default="daily", pattern="^(daily|weekly|monthly)$")
    include_external_factors: bool = Field(default=True, description="Include external factors in forecast")

    @validator('end_date')
    def end_date_after_start_date(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v

    @validator('trade_lane')
    def validate_trade_lane(cls, v):
        if not v.replace('-', '').replace('_', '').isalnum():
            raise ValueError('Invalid trade lane format')
        return v.upper()

class ForecastResponse(BaseModel):
    forecast_id: str = Field(..., description="Unique forecast identifier")
    trade_lane: str
    predictions: List[PredictionPoint]
    accuracy_metrics: AccuracyMetrics
    generated_at: datetime
    model_version: str

class PredictionPoint(BaseModel):
    date: date
    predicted_value: float = Field(..., ge=0, description="Predicted TEU volume")
    lower_bound: float = Field(..., ge=0, description="Lower confidence bound")
    upper_bound: float = Field(..., ge=0, description="Upper confidence bound")
    confidence_level: float = Field(..., ge=0, le=1)
```

### 2. Async/Await Patterns

#### FastAPI Async Endpoints
```python
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from typing import List
import asyncio

app = FastAPI(title="Shipping Intelligence Platform", version="1.0.0")

@app.post("/api/v1/forecast", response_model=ForecastResponse)
async def create_forecast(
    request: ForecastRequest,
    background_tasks: BackgroundTasks,
    db_session = Depends(get_db_session),
    current_user = Depends(get_current_user)
) -> ForecastResponse:
    """Create a new demand forecast."""
    try:
        # Validate permissions
        if not await check_permissions(current_user, "forecast:create"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")

        # Fetch historical data asynchronously
        historical_data = await fetch_historical_data(
            db_session,
            request.trade_lane,
            request.start_date
        )

        # Run forecast calculation
        forecast_result = await run_forecast_async(historical_data, request)

        # Store results asynchronously
        await store_forecast_results(db_session, forecast_result)

        # Schedule background model retraining if needed
        background_tasks.add_task(
            check_and_retrain_model,
            trade_lane=request.trade_lane
        )

        return forecast_result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Forecast creation failed: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def fetch_historical_data(session, trade_lane: str, start_date: date):
    """Fetch historical data with concurrent queries."""
    tasks = [
        fetch_bookings(session, trade_lane, start_date),
        fetch_port_metrics(session, trade_lane),
        fetch_vessel_data(session, trade_lane)
    ]
    results = await asyncio.gather(*tasks)
    return combine_historical_data(*results)
```

### 3. Machine Learning Implementation Rules

#### Forecasting Model Structure
```python
from abc import ABC, abstractmethod
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_percentage_error, mean_squared_error
from typing import Tuple, Dict, Any

class BaseForecastModel(ABC):
    """Abstract base class for all forecasting models."""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.model = None
        self.is_trained = False
        self.metrics = {}

    @abstractmethod
    def train(self, X: pd.DataFrame, y: pd.Series) -> None:
        """Train the model on historical data."""
        pass

    @abstractmethod
    def predict(self, X: pd.DataFrame, horizon: int) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Generate predictions with confidence intervals.

        Returns:
            Tuple of (predictions, lower_bounds, upper_bounds)
        """
        pass

    def evaluate(self, y_true: pd.Series, y_pred: np.ndarray) -> Dict[str, float]:
        """Calculate evaluation metrics."""
        return {
            'mape': mean_absolute_percentage_error(y_true, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_true, y_pred)),
            'mae': np.mean(np.abs(y_true - y_pred))
        }

    def save(self, path: str) -> None:
        """Save model to disk."""
        import joblib
        joblib.dump(self, path)

    @classmethod
    def load(cls, path: str) -> 'BaseForecastModel':
        """Load model from disk."""
        import joblib
        return joblib.load(path)

class ProphetForecastModel(BaseForecastModel):
    """Facebook Prophet implementation for time series forecasting."""

    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        from prophet import Prophet

        self.model = Prophet(
            seasonality_mode=config.get('seasonality_mode', 'multiplicative'),
            yearly_seasonality=config.get('yearly_seasonality', True),
            weekly_seasonality=config.get('weekly_seasonality', True),
            daily_seasonality=config.get('daily_seasonality', False),
            changepoint_prior_scale=config.get('changepoint_prior_scale', 0.05)
        )

    def train(self, X: pd.DataFrame, y: pd.Series) -> None:
        """Train Prophet model."""
        # Prepare data in Prophet format
        df = pd.DataFrame({
            'ds': X.index,
            'y': y.values
        })

        # Add regressors if available
        for col in X.columns:
            if col != 'ds':
                self.model.add_regressor(col)
                df[col] = X[col].values

        # Fit model
        self.model.fit(df)
        self.is_trained = True

    def predict(self, X: pd.DataFrame, horizon: int) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Generate forecast with Prophet."""
        if not self.is_trained:
            raise ValueError("Model must be trained before prediction")

        # Create future dataframe
        future = self.model.make_future_dataframe(periods=horizon)

        # Add regressors to future dataframe
        for col in X.columns:
            if col != 'ds':
                # Extend regressor values (simplified - should use proper forecasting)
                future[col] = X[col].iloc[-1]

        # Generate forecast
        forecast = self.model.predict(future)

        # Extract predictions and confidence intervals
        predictions = forecast['yhat'].iloc[-horizon:].values
        lower_bounds = forecast['yhat_lower'].iloc[-horizon:].values
        upper_bounds = forecast['yhat_upper'].iloc[-horizon:].values

        return predictions, lower_bounds, upper_bounds

class LSTMForecastModel(BaseForecastModel):
    """LSTM neural network for complex pattern recognition."""

    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.sequence_length = config.get('sequence_length', 30)
        self.n_features = None
        self.scaler = None

    def _build_model(self, input_shape: Tuple[int, int]) -> None:
        """Build LSTM architecture."""
        import tensorflow as tf

        self.model = tf.keras.Sequential([
            tf.keras.layers.LSTM(
                64,
                activation='relu',
                input_shape=input_shape,
                return_sequences=True
            ),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.LSTM(32, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(16, activation='relu'),
            tf.keras.layers.Dense(1)
        ])

        self.model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
            loss='mse',
            metrics=['mae']
        )

    def _prepare_sequences(self, data: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Create sequences for LSTM training."""
        X, y = [], []
        for i in range(len(data) - self.sequence_length):
            X.append(data[i:i + self.sequence_length])
            y.append(data[i + self.sequence_length, 0])  # Predict first feature
        return np.array(X), np.array(y)

    def train(self, X: pd.DataFrame, y: pd.Series) -> None:
        """Train LSTM model."""
        from sklearn.preprocessing import MinMaxScaler

        # Combine features and target
        data = pd.concat([y, X], axis=1).values

        # Scale data
        self.scaler = MinMaxScaler()
        scaled_data = self.scaler.fit_transform(data)

        # Prepare sequences
        X_seq, y_seq = self._prepare_sequences(scaled_data)

        # Build model if not exists
        if self.model is None:
            self._build_model((X_seq.shape[1], X_seq.shape[2]))

        # Train model
        self.model.fit(
            X_seq, y_seq,
            epochs=self.config.get('epochs', 50),
            batch_size=self.config.get('batch_size', 32),
            validation_split=0.2,
            verbose=0
        )

        self.is_trained = True
```

### 4. Route Optimization Implementation

```python
from ortools.constraint_solver import pywrapcp, routing_enums_pb2
from typing import List, Tuple, Optional
import networkx as nx
import numpy as np

class RouteOptimizer:
    """Multi-objective route optimization using OR-Tools."""

    def __init__(self, ports: List[Port], vessels: List[Vessel]):
        self.ports = ports
        self.vessels = vessels
        self.distance_matrix = self._calculate_distance_matrix()
        self.time_matrix = self._calculate_time_matrix()
        self.cost_matrix = self._calculate_cost_matrix()

    def optimize_route(
        self,
        origin: str,
        destination: str,
        cargo_volume: float,
        optimization_criteria: Dict[str, float],
        constraints: Optional[Dict[str, Any]] = None
    ) -> RouteOptimizationResult:
        """
        Find optimal route considering multiple objectives.

        Args:
            origin: Origin port code
            destination: Destination port code
            cargo_volume: Volume in TEU
            optimization_criteria: Weights for different objectives
            constraints: Optional constraints (time windows, vessel capacity, etc.)

        Returns:
            Optimized route with metrics
        """
        # Create routing model
        manager = pywrapcp.RoutingIndexManager(
            len(self.ports), 1, [self._get_port_index(origin)],
            [self._get_port_index(destination)]
        )
        routing = pywrapcp.RoutingModel(manager)

        # Define cost callbacks
        def combined_cost_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)

            distance_cost = self.distance_matrix[from_node][to_node] * optimization_criteria.get('distance', 0.3)
            time_cost = self.time_matrix[from_node][to_node] * optimization_criteria.get('time', 0.4)
            monetary_cost = self.cost_matrix[from_node][to_node] * optimization_criteria.get('cost', 0.3)

            return int((distance_cost + time_cost + monetary_cost) * 1000)

        cost_callback_index = routing.RegisterTransitCallback(combined_cost_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(cost_callback_index)

        # Add constraints
        if constraints:
            self._add_constraints(routing, manager, constraints)

        # Set search parameters
        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        search_parameters.local_search_metaheuristic = (
            routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
        )
        search_parameters.time_limit.seconds = 30

        # Solve
        solution = routing.SolveWithParameters(search_parameters)

        if solution:
            return self._extract_solution(manager, routing, solution)
        else:
            raise ValueError("No feasible route found")

    def _extract_solution(
        self,
        manager: pywrapcp.RoutingIndexManager,
        routing: pywrapcp.RoutingModel,
        solution
    ) -> RouteOptimizationResult:
        """Extract route from OR-Tools solution."""
        route = []
        index = routing.Start(0)

        while not routing.IsEnd(index):
            node = manager.IndexToNode(index)
            route.append(self.ports[node])
            index = solution.Value(routing.NextVar(index))

        # Calculate metrics
        total_distance = sum(
            self.distance_matrix[i][i+1]
            for i in range(len(route)-1)
        )
        total_time = sum(
            self.time_matrix[i][i+1]
            for i in range(len(route)-1)
        )
        total_cost = sum(
            self.cost_matrix[i][i+1]
            for i in range(len(route)-1)
        )

        return RouteOptimizationResult(
            route=route,
            total_distance=total_distance,
            total_time=total_time,
            total_cost=total_cost,
            carbon_emissions=self._calculate_emissions(route, total_distance)
        )

class DijkstraRouteOptimizer:
    """Simple Dijkstra-based route optimization for baseline."""

    def __init__(self, network: nx.DiGraph):
        self.network = network

    def find_shortest_path(
        self,
        origin: str,
        destination: str,
        weight: str = 'distance'
    ) -> Tuple[List[str], float]:
        """Find shortest path using Dijkstra's algorithm."""
        try:
            path = nx.shortest_path(
                self.network,
                source=origin,
                target=destination,
                weight=weight
            )
            cost = nx.shortest_path_length(
                self.network,
                source=origin,
                target=destination,
                weight=weight
            )
            return path, cost
        except nx.NetworkXNoPath:
            raise ValueError(f"No path exists between {origin} and {destination}")

    def find_k_shortest_paths(
        self,
        origin: str,
        destination: str,
        k: int = 3,
        weight: str = 'distance'
    ) -> List[Tuple[List[str], float]]:
        """Find k shortest paths for alternatives."""
        from itertools import islice

        def k_shortest_paths_generator(G, source, target, k, weight):
            return islice(
                nx.shortest_simple_paths(G, source, target, weight=weight),
                k
            )

        paths = []
        for path in k_shortest_paths_generator(
            self.network, origin, destination, k, weight
        ):
            cost = sum(
                self.network[path[i]][path[i+1]][weight]
                for i in range(len(path)-1)
            )
            paths.append((path, cost))

        return paths
```

### 5. Data Processing Pipeline

```python
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import asyncio
from concurrent.futures import ProcessPoolExecutor

class DataPipeline:
    """Async data processing pipeline for historical data."""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.executor = ProcessPoolExecutor(max_workers=config.get('max_workers', 4))

    async def process_historical_data(
        self,
        raw_data: pd.DataFrame,
        processing_steps: List[str]
    ) -> pd.DataFrame:
        """Process historical data with specified steps."""
        data = raw_data.copy()

        for step in processing_steps:
            processor = self._get_processor(step)
            data = await self._run_async(processor, data)

        return data

    async def _run_async(self, func, *args):
        """Run CPU-intensive function in executor."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.executor, func, *args)

    def _get_processor(self, step: str):
        """Get processing function for step."""
        processors = {
            'clean': self._clean_data,
            'normalize': self._normalize_data,
            'feature_engineer': self._engineer_features,
            'aggregate': self._aggregate_data,
            'validate': self._validate_data
        }
        return processors.get(step, lambda x: x)

    def _clean_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """Clean and preprocess raw data."""
        # Remove duplicates
        data = data.drop_duplicates()

        # Handle missing values
        numeric_columns = data.select_dtypes(include=[np.number]).columns
        data[numeric_columns] = data[numeric_columns].fillna(data[numeric_columns].median())

        categorical_columns = data.select_dtypes(include=['object']).columns
        data[categorical_columns] = data[categorical_columns].fillna('UNKNOWN')

        # Remove outliers using IQR method
        for col in numeric_columns:
            Q1 = data[col].quantile(0.25)
            Q3 = data[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            data = data[(data[col] >= lower_bound) & (data[col] <= upper_bound)]

        return data

    def _normalize_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """Normalize numerical features."""
        from sklearn.preprocessing import StandardScaler

        numeric_columns = data.select_dtypes(include=[np.number]).columns
        scaler = StandardScaler()
        data[numeric_columns] = scaler.fit_transform(data[numeric_columns])

        return data

    def _engineer_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Create derived features for ML models."""
        # Time-based features
        if 'date' in data.columns:
            data['date'] = pd.to_datetime(data['date'])
            data['year'] = data['date'].dt.year
            data['month'] = data['date'].dt.month
            data['week'] = data['date'].dt.isocalendar().week
            data['day_of_week'] = data['date'].dt.dayofweek
            data['is_weekend'] = data['day_of_week'].isin([5, 6]).astype(int)
            data['quarter'] = data['date'].dt.quarter

        # Lag features
        if 'volume_teu' in data.columns:
            for lag in [7, 14, 30]:
                data[f'volume_lag_{lag}'] = data['volume_teu'].shift(lag)

            # Rolling statistics
            for window in [7, 30]:
                data[f'volume_rolling_mean_{window}'] = (
                    data['volume_teu'].rolling(window=window).mean()
                )
                data[f'volume_rolling_std_{window}'] = (
                    data['volume_teu'].rolling(window=window).std()
                )

        # Categorical encodings
        if 'port_code' in data.columns:
            port_volume = data.groupby('port_code')['volume_teu'].mean()
            data['port_avg_volume'] = data['port_code'].map(port_volume)

        return data

    def _validate_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """Validate processed data."""
        # Check for required columns
        required_columns = self.config.get('required_columns', [])
        missing_columns = set(required_columns) - set(data.columns)
        if missing_columns:
            raise ValueError(f"Missing required columns: {missing_columns}")

        # Check data types
        expected_dtypes = self.config.get('expected_dtypes', {})
        for col, dtype in expected_dtypes.items():
            if col in data.columns and not data[col].dtype == dtype:
                try:
                    data[col] = data[col].astype(dtype)
                except Exception as e:
                    raise ValueError(f"Cannot convert {col} to {dtype}: {e}")

        # Check for data quality
        if data.empty:
            raise ValueError("Processed data is empty")

        null_percentages = data.isnull().sum() / len(data)
        high_null_cols = null_percentages[null_percentages > 0.5]
        if not high_null_cols.empty:
            raise ValueError(f"High null percentage in columns: {high_null_cols.to_dict()}")

        return data
```

### 6. Testing Standards - Test Pyramid Strategy

#### Testing Distribution
- **Unit Tests (70%)**: Fast, isolated business logic tests
- **Integration Tests (20%)**: Test external integrations with real dependencies
- **End-to-End Tests (10%)**: Critical user flows only

#### Test Organization
```
tests/
├── unit/                       # Pure unit tests (no I/O)
│   ├── domain/
│   ├── application/
│   └── shared/
├── integration/                # Tests with real dependencies
│   ├── api/
│   ├── persistence/
│   └── external/
├── e2e/                       # End-to-end tests
├── fixtures/                  # Shared test fixtures
├── conftest.py               # Pytest configuration
└── pytest.ini                # Pytest settings
```

#### Pytest Configuration
```ini
# pytest.ini
[tool.pytest.ini_options]
minversion = "7.0"
testpaths = ["tests"]
python_files = ["test_*.py", "*_test.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = [
    "--strict-markers",
    "--tb=short",
    "--cov=app",
    "--cov-report=term-missing",
    "--cov-report=html",
    "--cov-fail-under=80",
]
asyncio_mode = "auto"
markers = [
    "unit: Unit tests",
    "integration: Integration tests",
    "e2e: End-to-end tests",
    "slow: Slow running tests",
]
```

#### Unit Testing with Pytest
```python
import pytest
import pytest_asyncio
from unittest.mock import Mock, patch, AsyncMock
import pandas as pd
import numpy as np
from datetime import date, timedelta
from hypothesis import given, strategies as st

@pytest.fixture
def sample_forecast_request():
    """Fixture for forecast request."""
    return ForecastRequest(
        trade_lane="ASIA-EUROPE",
        start_date=date.today(),
        end_date=date.today() + timedelta(days=30),
        cargo_type="container",
        granularity="daily"
    )

@pytest.fixture
def sample_historical_data():
    """Fixture for historical data."""
    dates = pd.date_range(start='2023-01-01', end='2023-12-31', freq='D')
    data = pd.DataFrame({
        'date': dates,
        'volume_teu': np.random.randint(1000, 5000, size=len(dates)),
        'port': np.random.choice(['SHANGHAI', 'SINGAPORE', 'ROTTERDAM'], size=len(dates))
    })
    return data

class TestForecastService:
    """Test suite for forecast service."""

    @pytest.mark.asyncio
    async def test_create_forecast_success(self, sample_forecast_request, sample_historical_data):
        """Test successful forecast creation."""
        # Arrange
        mock_repo = AsyncMock()
        mock_repo.get_historical_data.return_value = sample_historical_data

        service = ForecastService(repository=mock_repo)

        # Act
        result = await service.create_forecast(sample_forecast_request)

        # Assert
        assert result is not None
        assert result.trade_lane == "ASIA-EUROPE"
        assert len(result.predictions) == 30
        assert all(p.predicted_value > 0 for p in result.predictions)
        mock_repo.get_historical_data.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_forecast_insufficient_data(self, sample_forecast_request):
        """Test forecast creation with insufficient data."""
        # Arrange
        mock_repo = AsyncMock()
        mock_repo.get_historical_data.return_value = pd.DataFrame()  # Empty data

        service = ForecastService(repository=mock_repo)

        # Act & Assert
        with pytest.raises(ValueError, match="Insufficient historical data"):
            await service.create_forecast(sample_forecast_request)

    @pytest.mark.parametrize("algorithm,expected_accuracy", [
        ("prophet", 0.85),
        ("lstm", 0.90),
        ("moving_average", 0.75),
    ])
    def test_model_accuracy(self, algorithm, expected_accuracy, sample_historical_data):
        """Test different algorithms achieve expected accuracy."""
        # Arrange
        model = create_forecast_model(algorithm)
        train_data = sample_historical_data[:-30]
        test_data = sample_historical_data[-30:]

        # Act
        model.train(train_data.drop('volume_teu', axis=1), train_data['volume_teu'])
        predictions, _, _ = model.predict(test_data.drop('volume_teu', axis=1), horizon=30)

        # Calculate accuracy
        mape = mean_absolute_percentage_error(test_data['volume_teu'].values, predictions)
        accuracy = 1 - mape

        # Assert
        assert accuracy >= expected_accuracy * 0.9  # Allow 10% tolerance

class TestRouteOptimization:
    """Test suite for route optimization."""

    def test_dijkstra_shortest_path(self):
        """Test Dijkstra algorithm finds shortest path."""
        # Arrange
        network = nx.DiGraph()
        network.add_edge("A", "B", distance=100, time=10, cost=1000)
        network.add_edge("A", "C", distance=200, time=15, cost=1500)
        network.add_edge("B", "C", distance=50, time=5, cost=500)
        network.add_edge("B", "D", distance=150, time=12, cost=1200)
        network.add_edge("C", "D", distance=100, time=8, cost=800)

        optimizer = DijkstraRouteOptimizer(network)

        # Act
        path, cost = optimizer.find_shortest_path("A", "D", weight="distance")

        # Assert
        assert path == ["A", "B", "D"]
        assert cost == 250

    def test_multi_objective_optimization(self):
        """Test multi-objective route optimization."""
        # Arrange
        ports = [
            Port(code="SHA", name="Shanghai", lat=31.23, lon=121.47),
            Port(code="SIN", name="Singapore", lat=1.35, lon=103.82),
            Port(code="RTM", name="Rotterdam", lat=51.92, lon=4.48),
        ]
        vessels = [Vessel(id="V1", capacity=10000, speed=20)]

        optimizer = RouteOptimizer(ports, vessels)

        # Act
        result = optimizer.optimize_route(
            origin="SHA",
            destination="RTM",
            cargo_volume=5000,
            optimization_criteria={
                "distance": 0.3,
                "time": 0.4,
                "cost": 0.3
            }
        )

        # Assert
        assert len(result.route) >= 2
        assert result.route[0].code == "SHA"
        assert result.route[-1].code == "RTM"
        assert result.total_distance > 0
        assert result.total_time > 0
        assert result.total_cost > 0
```

### 7. Configuration Management

```python
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, Dict, Any
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings with environment variable support."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )

    # API Configuration
    api_title: str = "Shipping Intelligence Platform"
    api_version: str = "1.0.0"
    api_prefix: str = "/api/v1"
    debug: bool = False

    # Database Configuration
    database_url: str = "postgresql+asyncpg://user:pass@localhost/shipping"
    database_pool_size: int = 20
    database_max_overflow: int = 10

    # Redis Configuration
    redis_url: str = "redis://localhost:6379"
    redis_ttl: int = 3600

    # ML Configuration
    model_storage_path: str = "./models"
    model_retrain_interval: int = 7  # days
    forecast_horizon_days: int = 30
    forecast_confidence_level: float = 0.95

    # External Services
    weather_api_key: Optional[str] = None
    weather_api_url: str = "https://api.weather.com/v1"
    ais_api_key: Optional[str] = None
    ais_api_url: str = "https://api.marinetraffic.com/v1"

    # Security
    secret_key: str = "change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Performance
    max_workers: int = 4
    batch_size: int = 1000
    cache_enabled: bool = True

    # Monitoring
    prometheus_enabled: bool = True
    prometheus_port: int = 9090
    log_level: str = "INFO"

    @property
    def database_settings(self) -> Dict[str, Any]:
        """Get database configuration as dict."""
        return {
            "url": self.database_url,
            "pool_size": self.database_pool_size,
            "max_overflow": self.database_max_overflow,
            "echo": self.debug
        }

    @property
    def redis_settings(self) -> Dict[str, Any]:
        """Get Redis configuration as dict."""
        return {
            "url": self.redis_url,
            "decode_responses": True,
            "health_check_interval": 30
        }

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()

# Usage in application
settings = get_settings()
```

### 8. Logging and Monitoring

```python
import structlog
from prometheus_client import Counter, Histogram, Gauge
import time
from functools import wraps
from typing import Any, Callable

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

# Create logger
logger = structlog.get_logger()

# Prometheus metrics
forecast_requests = Counter('forecast_requests_total', 'Total forecast requests', ['trade_lane', 'status'])
forecast_duration = Histogram('forecast_duration_seconds', 'Forecast calculation duration')
active_forecasts = Gauge('active_forecasts', 'Number of active forecast calculations')
model_accuracy = Gauge('model_accuracy', 'Current model accuracy', ['model_type', 'trade_lane'])

def log_execution(func: Callable) -> Callable:
    """Decorator for logging function execution."""
    @wraps(func)
    async def async_wrapper(*args, **kwargs) -> Any:
        start_time = time.time()
        logger.info(f"Starting {func.__name__}", function=func.__name__, args=args, kwargs=kwargs)

        try:
            result = await func(*args, **kwargs)
            duration = time.time() - start_time
            logger.info(
                f"Completed {func.__name__}",
                function=func.__name__,
                duration=duration,
                success=True
            )
            return result
        except Exception as e:
            duration = time.time() - start_time
            logger.error(
                f"Failed {func.__name__}",
                function=func.__name__,
                duration=duration,
                error=str(e),
                exc_info=True
            )
            raise

    @wraps(func)
    def sync_wrapper(*args, **kwargs) -> Any:
        start_time = time.time()
        logger.info(f"Starting {func.__name__}", function=func.__name__)

        try:
            result = func(*args, **kwargs)
            duration = time.time() - start_time
            logger.info(f"Completed {func.__name__}", function=func.__name__, duration=duration)
            return result
        except Exception as e:
            duration = time.time() - start_time
            logger.error(f"Failed {func.__name__}", function=func.__name__, error=str(e))
            raise

    if asyncio.iscoroutinefunction(func):
        return async_wrapper
    else:
        return sync_wrapper

def track_metrics(metric_name: str):
    """Decorator for tracking Prometheus metrics."""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            with forecast_duration.time():
                active_forecasts.inc()
                try:
                    result = await func(*args, **kwargs)
                    forecast_requests.labels(trade_lane=kwargs.get('trade_lane', 'unknown'), status='success').inc()
                    return result
                except Exception as e:
                    forecast_requests.labels(trade_lane=kwargs.get('trade_lane', 'unknown'), status='error').inc()
                    raise
                finally:
                    active_forecasts.dec()
        return wrapper
    return decorator
```

---

## Performance Optimization Rules

### 1. Use Async/Await Properly
- Always use `asyncio.gather()` for concurrent operations
- Don't block the event loop with synchronous operations
- Use `asyncio.create_task()` for fire-and-forget operations

### 2. Optimize Data Operations
- Use `pandas` vectorized operations instead of loops
- Consider `polars` for large datasets (>1M rows)
- Use chunking for processing large files
- Implement data caching with Redis

### 3. ML Model Optimization
- Use model quantization for inference
- Implement batch prediction
- Cache predictions when possible
- Use model versioning for A/B testing

### 4. Database Optimization
- Use connection pooling
- Implement query result caching
- Use bulk inserts for large data loads
- Create appropriate indexes

---

## Security Rules

### 1. Input Validation
- Always validate input with Pydantic models
- Sanitize user inputs
- Use parameterized queries
- Implement rate limiting

### 2. Authentication & Authorization
```python
from fastapi import Security, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Verify JWT token."""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
```

### 3. Secrets Management
- Never hardcode secrets
- Use environment variables
- Implement secret rotation
- Use AWS Secrets Manager or similar

---

## Docker Configuration

### Multi-Stage Build for Production
```dockerfile
# Build stage
FROM python:3.11-slim as builder

WORKDIR /app
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install poetry==1.7.0
COPY pyproject.toml poetry.lock ./
RUN poetry export -f requirements.txt --output requirements.txt --without-hashes

# Runtime stage
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY --from=builder /app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose for Development
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://user:pass@postgres/shipping
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./:/app
    command: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=shipping
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  jupyter:
    build: .
    ports:
      - "8888:8888"
    volumes:
      - ./notebooks:/app/notebooks
      - ./data:/app/data
    command: jupyter lab --ip=0.0.0.0 --allow-root --no-browser

volumes:
  postgres-data:
```

---

## Pre-commit Hooks Configuration

### .pre-commit-config.yaml
```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
      - id: check-json
      - id: check-toml
      - id: check-merge-conflict
      - id: detect-private-key

  - repo: https://github.com/psf/black
    rev: 23.10.0
    hooks:
      - id: black
        args: [--line-length=100]

  - repo: https://github.com/charliermarsh/ruff-pre-commit
    rev: v0.1.0
    hooks:
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.6.0
    hooks:
      - id: mypy
        additional_dependencies: [types-all]
        args: [--strict]

  - repo: https://github.com/PyCQA/bandit
    rev: 1.7.5
    hooks:
      - id: bandit
        args: [-r, app]
```

### Setup Commands
```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run manually on all files
pre-commit run --all-files

# Update hooks
pre-commit autoupdate
```

---

## Environment Configuration

### Development (.env.development)
```env
DEBUG=true
LOG_LEVEL=DEBUG
DATABASE_URL=postgresql+asyncpg://dev:dev@localhost/shipping_dev
REDIS_URL=redis://localhost:6379
ML_MODEL_PATH=./models/dev
ENABLE_PROFILING=true
```

### Testing (.env.test)
```env
DEBUG=false
LOG_LEVEL=WARNING
DATABASE_URL=postgresql+asyncpg://test:test@localhost/shipping_test
REDIS_URL=redis://localhost:6379/1
ML_MODEL_PATH=./models/test
ENABLE_PROFILING=false
```

### Production (.env.production)
```env
DEBUG=false
LOG_LEVEL=INFO
DATABASE_URL=${DATABASE_URL}
REDIS_URL=${REDIS_URL}
ML_MODEL_PATH=/app/models
ENABLE_PROFILING=false
SENTRY_DSN=${SENTRY_DSN}
```

---

## Makefile for Common Tasks

```makefile
.PHONY: help install test lint format clean run docker-up docker-down

help:
	@echo "Available commands:"
	@echo "  install     Install dependencies"
	@echo "  test        Run tests"
	@echo "  lint        Run linters"
	@echo "  format      Format code"
	@echo "  clean       Clean cache files"
	@echo "  run         Run application"
	@echo "  docker-up   Start Docker services"
	@echo "  docker-down Stop Docker services"

install:
	poetry install

test:
	pytest tests/ -v --cov=app --cov-report=html

test-unit:
	pytest tests/unit -v -m unit

test-integration:
	pytest tests/integration -v -m integration

lint:
	ruff check app tests
	mypy app tests
	bandit -r app

format:
	black app tests
	ruff check --fix app tests

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache .coverage htmlcov .mypy_cache

run:
	uvicorn app.main:app --reload

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

migrate:
	alembic upgrade head

rollback:
	alembic downgrade -1
```

---

## Code Quality Checklist

Before committing code, ensure:

- [ ] All functions have type hints
- [ ] Docstrings for all public functions
- [ ] No hardcoded values (use config)
- [ ] Async functions properly await all calls
- [ ] Error handling implemented
- [ ] Logging statements added
- [ ] Unit tests written (coverage >80%)
- [ ] Integration tests for APIs
- [ ] Code formatted with `black`
- [ ] Linting passed with `ruff`
- [ ] Type checking passed with `mypy`
- [ ] Security scan passed with `bandit`
- [ ] Performance benchmarks met
- [ ] Pre-commit hooks pass
- [ ] `make test` passes without errors

---

## Prohibited Practices

1. **Never** use `print()` statements - use proper logging
2. **Never** catch bare exceptions - catch specific exceptions
3. **Never** use mutable default arguments
4. **Never** use `eval()` or `exec()` with user input
5. **Never** store passwords in plain text
6. **Never** ignore type hints
7. **Never** use synchronous operations in async functions
8. **Never** commit `.env` files or secrets
9. **Never** use global variables for state
10. **Never** skip input validation
11. **Never** skip running tests before committing
12. **Never** expose detailed error messages to clients

---

*This document defines the mandatory standards for Python implementation of ML/AI components. All code must comply with these rules.*