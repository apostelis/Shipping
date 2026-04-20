package com.smartshipping.platform.api.controller;

import com.smartshipping.platform.api.dto.DashboardKpiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/dashboard")
@Tag(name = "Dashboard", description = "Dashboard KPIs and summary metrics")
public class DashboardController {

    @GetMapping("/kpis")
    @Operation(summary = "Get dashboard KPIs", description = "Returns key performance indicators for a given scenario")
    public DashboardKpiResponse getKpis(@RequestParam(defaultValue = "normal") String scenarioId) {
        return switch (scenarioId) {
            case "normal" -> new DashboardKpiResponse(
                    new BigDecimal("14.2"), new BigDecimal("93.8"), 47, new BigDecimal("11.5"), scenarioId);
            case "demand-spike" -> new DashboardKpiResponse(
                    new BigDecimal("18.5"), new BigDecimal("91.2"), 42, new BigDecimal("12.3"), scenarioId);
            case "port-disruption" -> new DashboardKpiResponse(
                    new BigDecimal("23.1"), new BigDecimal("87.6"), 38, new BigDecimal("8.7"), scenarioId);
            case "hormuz-blockade" -> new DashboardKpiResponse(
                    new BigDecimal("31.4"), new BigDecimal("84.3"), 56, new BigDecimal("15.9"), scenarioId);
            default -> throw new IllegalArgumentException("Unknown scenario: " + scenarioId);
        };
    }
}
