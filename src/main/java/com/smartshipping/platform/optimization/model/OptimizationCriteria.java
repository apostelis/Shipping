package com.smartshipping.platform.optimization.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptimizationCriteria {

    private String originPortCode;
    private String destinationPortCode;
    private ObjectiveType objectiveType;
    private BigDecimal maxDistance;
    private BigDecimal maxTimeHours;
    private BigDecimal maxCost;
    private Integer maxStops;

    public enum ObjectiveType {
        DISTANCE,
        TIME,
        COST,
        BALANCED
    }

    public static OptimizationCriteria defaultCriteria() {
        return OptimizationCriteria.builder()
                .objectiveType(ObjectiveType.BALANCED)
                .maxStops(5)
                .build();
    }
}
