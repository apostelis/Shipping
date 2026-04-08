package com.smartshipping.platform.forecasting.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForecastResult {

    private String tradeLane;
    private String cargoType;
    private String granularity;
    private LocalDate date;
    private BigDecimal predictedValue;
    private BigDecimal confidenceLower;
    private BigDecimal confidenceUpper;
    private String algorithm;
    private BigDecimal accuracyMape;
    private List<ForecastPoint> forecastPoints;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForecastPoint {
        private LocalDate date;
        private BigDecimal predicted;
        private BigDecimal lowerBound;
        private BigDecimal upperBound;
    }
}
