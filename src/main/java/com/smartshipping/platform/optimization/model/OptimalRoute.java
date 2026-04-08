package com.smartshipping.platform.optimization.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptimalRoute {

    private String routeId;
    private List<RouteSegment> segments;
    private BigDecimal totalDistanceNm;
    private BigDecimal totalTimeHours;
    private BigDecimal totalCost;
    private BigDecimal fuelCost;
    private BigDecimal transitFee;
    private BigDecimal canalFee;
    private LocalDateTime estimatedDeparture;
    private LocalDateTime estimatedArrival;
    private OptimizationCriteria criteria;
    private List<String> warnings;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RouteSegment {
        private String originPortCode;
        private String destinationPortCode;
        private BigDecimal distanceNm;
        private BigDecimal timeHours;
        private BigDecimal cost;
        private String routeName;
    }
}
