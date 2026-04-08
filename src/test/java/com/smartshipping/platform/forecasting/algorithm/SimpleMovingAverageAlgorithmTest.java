package com.smartshipping.platform.forecasting.algorithm;

import com.smartshipping.platform.forecasting.model.ForecastResult;
import com.smartshipping.platform.forecasting.model.ForecastingParameters;
import com.smartshipping.platform.forecasting.model.HistoricalData;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SimpleMovingAverageAlgorithmTest {

    private final SimpleMovingAverageAlgorithm algorithm = new SimpleMovingAverageAlgorithm();

    @Test
    void testGetName() {
        assertEquals(ForecastingParameters.ALGORITHM_SMA, algorithm.getName());
    }

    @Test
    void testForecastWithValidData() {
        HistoricalData data = HistoricalData.builder()
                .tradeLane("ASIA-EUROPE")
                .cargoType("CONTAINER")
                .dataPoints(List.of(
                        HistoricalData.DataPoint.builder()
                                .date(LocalDate.of(2024, 1, 1))
                                .value(new BigDecimal("1000"))
                                .build(),
                        HistoricalData.DataPoint.builder()
                                .date(LocalDate.of(2024, 1, 2))
                                .value(new BigDecimal("1100"))
                                .build(),
                        HistoricalData.DataPoint.builder()
                                .date(LocalDate.of(2024, 1, 3))
                                .value(new BigDecimal("1200"))
                                .build(),
                        HistoricalData.DataPoint.builder()
                                .date(LocalDate.of(2024, 1, 4))
                                .value(new BigDecimal("1150"))
                                .build(),
                        HistoricalData.DataPoint.builder()
                                .date(LocalDate.of(2024, 1, 5))
                                .value(new BigDecimal("1250"))
                                .build(),
                        HistoricalData.DataPoint.builder()
                                .date(LocalDate.of(2024, 1, 6))
                                .value(new BigDecimal("1300"))
                                .build(),
                        HistoricalData.DataPoint.builder()
                                .date(LocalDate.of(2024, 1, 7))
                                .value(new BigDecimal("1400"))
                                .build()
                ))
                .build();

        ForecastingParameters params = ForecastingParameters.builder()
                .forecastHorizon(7)
                .granularity(ForecastingParameters.GRANULARITY_DAILY)
                .confidenceLevel(new BigDecimal("1.96"))
                .build();

        ForecastResult result = algorithm.forecast(data, params);

        assertNotNull(result);
        assertEquals("ASIA-EUROPE", result.getTradeLane());
        assertEquals(ForecastingParameters.ALGORITHM_SMA, result.getAlgorithm());
        assertNotNull(result.getPredictedValue());
        assertNotNull(result.getConfidenceLower());
        assertNotNull(result.getConfidenceUpper());
    }

    @Test
    void testForecastWithEmptyData() {
        HistoricalData data = HistoricalData.builder()
                .tradeLane("ASIA-EUROPE")
                .dataPoints(List.of())
                .build();

        ForecastingParameters params = ForecastingParameters.builder()
                .forecastHorizon(7)
                .granularity(ForecastingParameters.GRANULARITY_DAILY)
                .build();

        ForecastResult result = algorithm.forecast(data, params);

        assertNotNull(result);
        assertEquals(BigDecimal.ZERO, result.getPredictedValue());
    }

    @Test
    void testAccuracyCalculation() {
        HistoricalData data = HistoricalData.builder()
                .tradeLane("ASIA-EUROPE")
                .dataPoints(List.of(
                        HistoricalData.DataPoint.builder()
                                .date(LocalDate.of(2024, 1, 1))
                                .value(new BigDecimal("1000"))
                                .build(),
                        HistoricalData.DataPoint.builder()
                                .date(LocalDate.of(2024, 1, 2))
                                .value(new BigDecimal("1100"))
                                .build()
                ))
                .build();

        ForecastResult forecast = ForecastResult.builder()
                .forecastPoints(List.of(
                        ForecastResult.ForecastPoint.builder()
                                .date(LocalDate.of(2024, 1, 1))
                                .predicted(new BigDecimal("1050"))
                                .build(),
                        ForecastResult.ForecastPoint.builder()
                                .date(LocalDate.of(2024, 1, 2))
                                .predicted(new BigDecimal("1150"))
                                .build()
                ))
                .build();

        double accuracy = algorithm.calculateAccuracy(forecast, data);

        assertTrue(accuracy >= 0);
        assertTrue(accuracy <= 100);
    }
}
