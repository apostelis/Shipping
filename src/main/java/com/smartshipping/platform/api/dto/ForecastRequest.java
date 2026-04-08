package com.smartshipping.platform.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request for generating demand forecast")
public class ForecastRequest {

    @NotBlank(message = "Trade lane is required")
    @Schema(description = "Trade lane identifier", example = "ASIA-EUROPE")
    private String tradeLane;

    @Schema(description = "Cargo type", example = "CONTAINER")
    private String cargoType;

    @NotNull(message = "Forecast horizon is required")
    @Schema(description = "Number of periods to forecast", example = "30")
    private Integer forecastHorizon;

    @Schema(description = "Granularity: DAILY, WEEKLY, or MONTHLY", example = "DAILY")
    private String granularity;

    @Schema(description = "Confidence level for intervals", example = "1.96")
    private BigDecimal confidenceLevel;

    @Schema(description = "Algorithm to use", example = "SIMPLE_MOVING_AVERAGE")
    private String algorithm;
}
