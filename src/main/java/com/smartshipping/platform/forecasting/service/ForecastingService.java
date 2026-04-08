package com.smartshipping.platform.forecasting.service;

import com.smartshipping.platform.domain.model.HistoricalDemand;
import com.smartshipping.platform.domain.repository.HistoricalDemandRepository;
import com.smartshipping.platform.forecasting.algorithm.ForecastingAlgorithm;
import com.smartshipping.platform.forecasting.model.ForecastResult;
import com.smartshipping.platform.forecasting.model.ForecastingParameters;
import com.smartshipping.platform.forecasting.model.HistoricalData;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ForecastingService {

    private final HistoricalDemandRepository historicalDemandRepository;
    private final Map<String, ForecastingAlgorithm> algorithms;

    public ForecastingService(
            HistoricalDemandRepository historicalDemandRepository,
            List<ForecastingAlgorithm> algorithmList) {
        this.historicalDemandRepository = historicalDemandRepository;
        this.algorithms = new HashMap<>();
        for (ForecastingAlgorithm algorithm : algorithmList) {
            this.algorithms.put(algorithm.getName(), algorithm);
        }
    }

    public ForecastResult generateForecast(
            String tradeLane,
            String cargoType,
            ForecastingParameters params) {

        HistoricalData historicalData = fetchHistoricalData(tradeLane, cargoType);

        String algorithmName = params.getAlgorithm() != null 
                ? params.getAlgorithm() 
                : ForecastingParameters.ALGORITHM_SMA;

        ForecastingAlgorithm algorithm = algorithms.get(algorithmName);
        if (algorithm == null) {
            algorithm = algorithms.get(ForecastingParameters.ALGORITHM_SMA);
        }

        return algorithm.forecast(historicalData, params);
    }

    public double calculateAccuracy(ForecastResult forecast, String tradeLane, String cargoType) {
        HistoricalData actualData = fetchHistoricalData(tradeLane, cargoType);
        
        ForecastingAlgorithm algorithm = algorithms.get(forecast.getAlgorithm());
        if (algorithm == null) {
            return 0.0;
        }
        
        return algorithm.calculateAccuracy(forecast, actualData);
    }

    public List<String> getAvailableTradeLanes() {
        return historicalDemandRepository.findAllTradeLanes();
    }

    public List<String> getAvailableAlgorithms() {
        return List.of(
                ForecastingParameters.ALGORITHM_SMA,
                ForecastingParameters.ALGORITHM_LINEAR_REGRESSION,
                ForecastingParameters.ALGORITHM_SEASONAL
        );
    }

    private HistoricalData fetchHistoricalData(String tradeLane, String cargoType) {
        List<HistoricalDemand> demandData;
        
        if (tradeLane != null && !tradeLane.isEmpty()) {
            demandData = historicalDemandRepository.findByTradeLane(tradeLane);
        } else {
            demandData = historicalDemandRepository.findAll();
        }

        List<HistoricalData.DataPoint> dataPoints = demandData.stream()
                .map(d -> HistoricalData.DataPoint.builder()
                        .date(d.getDate())
                        .value(d.getTeuVolume())
                        .build())
                .toList();

        return HistoricalData.builder()
                .tradeLane(tradeLane)
                .cargoType(cargoType)
                .dataPoints(dataPoints)
                .build();
    }

    public ForecastingParameters getDefaultParameters() {
        return ForecastingParameters.builder()
                .forecastHorizon(30)
                .granularity(ForecastingParameters.GRANULARITY_DAILY)
                .confidenceLevel(new BigDecimal("1.96"))
                .algorithm(ForecastingParameters.ALGORITHM_SMA)
                .build();
    }
}
