package com.smartshipping.platform.forecasting.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForecastingParameters {

    private String tradeLane;
    private String cargoType;
    private int forecastHorizon;
    private String granularity;
    private BigDecimal confidenceLevel;
    private String algorithm;

    public static final String GRANULARITY_DAILY = "DAILY";
    public static final String GRANULARITY_WEEKLY = "WEEKLY";
    public static final String GRANULARITY_MONTHLY = "MONTHLY";

    public static final String ALGORITHM_SMA = "SIMPLE_MOVING_AVERAGE";
    public static final String ALGORITHM_LINEAR_REGRESSION = "LINEAR_REGRESSION";
    public static final String ALGORITHM_SEASONAL = "SEASONAL_DECOMPOSITION";
}
