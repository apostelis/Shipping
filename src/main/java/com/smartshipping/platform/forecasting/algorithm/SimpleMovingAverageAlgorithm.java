package com.smartshipping.platform.forecasting.algorithm;

import com.smartshipping.platform.forecasting.model.ForecastResult;
import com.smartshipping.platform.forecasting.model.ForecastingParameters;
import com.smartshipping.platform.forecasting.model.HistoricalData;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class SimpleMovingAverageAlgorithm implements ForecastingAlgorithm {

    private static final int DEFAULT_WINDOW_SIZE = 7;

    @Override
    public String getName() {
        return ForecastingParameters.ALGORITHM_SMA;
    }

    @Override
    public ForecastResult forecast(HistoricalData data, ForecastingParameters params) {
        List<HistoricalData.DataPoint> points = data.getDataPoints();
        if (points == null || points.isEmpty()) {
            return createEmptyForecast(data, params);
        }

        int windowSize = Math.min(DEFAULT_WINDOW_SIZE, points.size());
        List<BigDecimal> window = new ArrayList<>();

        for (int i = points.size() - windowSize; i < points.size(); i++) {
            window.add(points.get(i).getValue());
        }

        BigDecimal sma = window.stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(windowSize), 4, RoundingMode.HALF_UP);

        // Detect trend from recent data (last 30 days vs previous 30 days)
        BigDecimal dailyTrend = BigDecimal.ZERO;
        if (points.size() >= 60) {
            BigDecimal recentAvg = BigDecimal.ZERO;
            BigDecimal olderAvg = BigDecimal.ZERO;
            for (int i = points.size() - 30; i < points.size(); i++) {
                recentAvg = recentAvg.add(points.get(i).getValue());
            }
            for (int i = points.size() - 60; i < points.size() - 30; i++) {
                olderAvg = olderAvg.add(points.get(i).getValue());
            }
            recentAvg = recentAvg.divide(BigDecimal.valueOf(30), 4, RoundingMode.HALF_UP);
            olderAvg = olderAvg.divide(BigDecimal.valueOf(30), 4, RoundingMode.HALF_UP);
            dailyTrend = recentAvg.subtract(olderAvg).divide(BigDecimal.valueOf(30), 6, RoundingMode.HALF_UP);
        }

        BigDecimal stdDev = calculateStdDev(window, sma);
        BigDecimal confidenceLevel = params.getConfidenceLevel() != null
                ? params.getConfidenceLevel()
                : new BigDecimal("1.96");

        BigDecimal baseMargin = stdDev.multiply(confidenceLevel);

        List<ForecastResult.ForecastPoint> forecastPoints = new ArrayList<>();
        LocalDate currentDate = points.get(points.size() - 1).getDate();

        for (int i = 1; i <= params.getForecastHorizon(); i++) {
            currentDate = incrementDate(currentDate, params.getGranularity());
            // Predicted value follows the trend
            BigDecimal predicted = sma.add(dailyTrend.multiply(BigDecimal.valueOf(i)));
            // Confidence band widens over time (sqrt growth — realistic uncertainty propagation)
            BigDecimal widening = baseMargin.multiply(BigDecimal.valueOf(Math.sqrt(i)));
            forecastPoints.add(ForecastResult.ForecastPoint.builder()
                    .date(currentDate)
                    .predicted(predicted.setScale(1, RoundingMode.HALF_UP))
                    .lowerBound(predicted.subtract(widening).setScale(1, RoundingMode.HALF_UP))
                    .upperBound(predicted.add(widening).setScale(1, RoundingMode.HALF_UP))
                    .build());
        }

        BigDecimal finalPredicted = sma.add(dailyTrend.multiply(BigDecimal.valueOf(params.getForecastHorizon())));
        BigDecimal finalMargin = baseMargin.multiply(BigDecimal.valueOf(Math.sqrt(params.getForecastHorizon())));

        return ForecastResult.builder()
                .tradeLane(data.getTradeLane())
                .cargoType(data.getCargoType())
                .granularity(params.getGranularity())
                .date(currentDate)
                .predictedValue(finalPredicted.setScale(1, RoundingMode.HALF_UP))
                .confidenceLower(finalPredicted.subtract(finalMargin).setScale(1, RoundingMode.HALF_UP))
                .confidenceUpper(finalPredicted.add(finalMargin).setScale(1, RoundingMode.HALF_UP))
                .algorithm(getName())
                .forecastPoints(forecastPoints)
                .build();
    }

    @Override
    public double calculateAccuracy(ForecastResult forecast, HistoricalData actual) {
        if (actual.getDataPoints() == null || actual.getDataPoints().isEmpty()) {
            return 0.0;
        }

        List<HistoricalData.DataPoint> actualPoints = actual.getDataPoints();
        List<ForecastResult.ForecastPoint> forecastPoints = forecast.getForecastPoints();
        
        if (forecastPoints == null || forecastPoints.isEmpty()) {
            return 0.0;
        }

        double sumAbsolutePercentageError = 0.0;
        int count = 0;

        for (int i = 0; i < Math.min(actualPoints.size(), forecastPoints.size()); i++) {
            BigDecimal actualValue = actualPoints.get(i).getValue();
            BigDecimal forecastValue = forecastPoints.get(i).getPredicted();
            
            if (actualValue.compareTo(BigDecimal.ZERO) != 0) {
                double ape = Math.abs(
                    actualValue.subtract(forecastValue)
                        .divide(actualValue, 4, RoundingMode.HALF_UP)
                        .doubleValue()
                );
                sumAbsolutePercentageError += ape;
                count++;
            }
        }

        return count > 0 ? (sumAbsolutePercentageError / count) * 100 : 0.0;
    }

    private BigDecimal calculateStdDev(List<BigDecimal> values, BigDecimal mean) {
        if (values.size() <= 1) {
            return BigDecimal.ZERO;
        }

        BigDecimal sumSquaredDiffs = values.stream()
                .map(v -> v.subtract(mean).pow(2))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double variance = sumSquaredDiffs.divide(
                BigDecimal.valueOf(values.size() - 1), 4, RoundingMode.HALF_UP
        ).doubleValue();

        return BigDecimal.valueOf(Math.sqrt(variance));
    }

    private LocalDate incrementDate(LocalDate date, String granularity) {
        return switch (granularity) {
            case ForecastingParameters.GRANULARITY_DAILY -> date.plusDays(1);
            case ForecastingParameters.GRANULARITY_WEEKLY -> date.plusWeeks(1);
            case ForecastingParameters.GRANULARITY_MONTHLY -> date.plusMonths(1);
            default -> date.plusDays(1);
        };
    }

    private ForecastResult createEmptyForecast(HistoricalData data, ForecastingParameters params) {
        return ForecastResult.builder()
                .tradeLane(data.getTradeLane())
                .cargoType(data.getCargoType())
                .granularity(params.getGranularity())
                .predictedValue(BigDecimal.ZERO)
                .confidenceLower(BigDecimal.ZERO)
                .confidenceUpper(BigDecimal.ZERO)
                .algorithm(getName())
                .build();
    }
}
