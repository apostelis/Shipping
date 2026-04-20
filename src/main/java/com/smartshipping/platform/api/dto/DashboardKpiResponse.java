package com.smartshipping.platform.api.dto;

import java.math.BigDecimal;

public record DashboardKpiResponse(BigDecimal costSavingsPercent, BigDecimal forecastAccuracyPercent, int routesOptimized, BigDecimal avgTransitReductionPercent, String scenarioId) {}
