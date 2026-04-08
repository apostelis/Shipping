package com.smartshipping.platform.forecasting.algorithm;

import com.smartshipping.platform.forecasting.model.ForecastResult;
import com.smartshipping.platform.forecasting.model.ForecastingParameters;
import com.smartshipping.platform.forecasting.model.HistoricalData;

public interface ForecastingAlgorithm {

    String getName();

    ForecastResult forecast(HistoricalData data, ForecastingParameters params);

    double calculateAccuracy(ForecastResult forecast, HistoricalData actual);
}
