package com.smartshipping.platform.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request for route optimization")
public class RouteOptimizationRequest {

    @NotBlank(message = "Origin port code is required")
    @Schema(description = "Origin port code", example = "SHANGHAI")
    private String originPortCode;

    @NotBlank(message = "Destination port code is required")
    @Schema(description = "Destination port code", example = "ROTTERDAM")
    private String destinationPortCode;

    @Schema(description = "Optimization objective: DISTANCE, TIME, COST, or BALANCED")
    private String objectiveType;

    @Schema(description = "Maximum distance in nautical miles")
    private BigDecimal maxDistance;

    @Schema(description = "Maximum time in hours")
    private BigDecimal maxTimeHours;

    @Schema(description = "Maximum cost")
    private BigDecimal maxCost;

    @Schema(description = "Maximum number of stops")
    private Integer maxStops;
}
