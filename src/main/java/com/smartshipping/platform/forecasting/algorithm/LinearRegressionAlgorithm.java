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
public class LinearRegressionAlgorithm implements ForecastingAlgorithm {

    @Override
    public String getName() {
        return ForecastingParameters.ALGORITHM_LINEAR_REGRESSION;
    }

    @Override
    public ForecastResult forecast(HistoricalData data, ForecastingParameters params) {
        List<HistoricalData.DataPoint> points = data.getDataPoints();
        if (points == null || points.size() < 2) {
            return createEmptyForecast(data, params);
        }

        double[] x = new double[points.size()];
        double[] y = new double[points.size()];
        
        for (int i = 0; i < points.size(); i++) {
            x[i] = i;
            y[i] = points.get(i).getValue().doubleValue();
        }

        double[] coefficients = linearRegression(x, y);
        double slope = coefficients[0];
        double intercept = coefficients[1];

        BigDecimal confidenceLevel = params.getConfidenceLevel() != null 
                ? params.getConfidenceLevel() 
                : new BigDecimal("1.96");

        double lastX = points.size() - 1;
        double predictedValue = intercept + slope * (lastX + params.getForecastHorizon());

        double sumSquaredErrors = 0;
        for (int i = 0; i < points.size(); i++) {
            double predicted = intercept + slope * i;
            double error = y[i] - predicted;
            sumSquaredErrors += error * error;
        }
        double standardError = Math.sqrt(sumSquaredErrors / (points.size() - 2));

        BigDecimal margin = confidenceLevel.multiply(BigDecimal.valueOf(standardError));

        List<ForecastResult.ForecastPoint> forecastPoints = new ArrayList<>();
        LocalDate currentDate = points.get(points.size() - 1).getDate();
        
        for (int i = 1; i <= params.getForecastHorizon(); i++) {
            currentDate = incrementDate(currentDate, params.getGranularity());
            double predicted = intercept + slope * (lastX + i);
            forecastPoints.add(ForecastResult.ForecastPoint.builder()
                    .date(currentDate)
                    .predicted(BigDecimal.valueOf(predicted))
                    .lowerBound(BigDecimal.valueOf(predicted).subtract(margin))
                    .upperBound(BigDecimal.valueOf(predicted).add(margin))
                    .build());
        }

        return ForecastResult.builder()
                .tradeLane(data.getTradeLane())
                .cargoType(data.getCargoType())
                .granularity(params.getGranularity())
                .date(currentDate)
                .predictedValue(BigDecimal.valueOf(predictedValue))
                .confidenceLower(BigDecimal.valueOf(predictedValue).subtract(margin))
                .confidenceUpper(BigDecimal.valueOf(predictedValue).add(margin))
                .algorithm(getName())
                .forecastPoints(forecastPoints)
                .build();
    }

    private double[] linearRegression(double[] x, double[] y) {
        int n = x.length;
        double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        
        for (int i = 0; i < n; i++) {
            sumX += x[i];
            sumY += y[i];
            sumXY += x[i] * y[i];
            sumX2 += x[i] * x[i];
        }
        
        double slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        double intercept = (sumY - slope * sumX) / n;
        
        return new double[]{slope, intercept};
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
