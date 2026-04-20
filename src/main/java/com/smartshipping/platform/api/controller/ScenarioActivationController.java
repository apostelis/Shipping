package com.smartshipping.platform.api.controller;

import com.smartshipping.platform.optimization.service.RouteOptimizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/scenarios")
@Tag(name = "Demo Scenarios", description = "Scenario activation")
public class ScenarioActivationController {

    private final RouteOptimizationService routeOptimizationService;

    public ScenarioActivationController(RouteOptimizationService routeOptimizationService) {
        this.routeOptimizationService = routeOptimizationService;
    }

    @PostMapping("/{scenarioId}/activate")
    @Operation(summary = "Activate scenario", description = "Apply a scenario by disabling lanes/ports in the route graph")
    public ResponseEntity<Map<String, String>> activateScenario(@PathVariable String scenarioId) {
        switch (scenarioId) {
            case "port-disruption" ->
                routeOptimizationService.applyScenario(List.of("ROTTERDAM"), List.of());
            case "hormuz-blockade" ->
                routeOptimizationService.applyScenario(List.of(), List.of("DUBAI-JEDDAH", "MUMBAI-DUBAI"));
            default ->
                routeOptimizationService.applyScenario(List.of(), List.of());
        }
        return ResponseEntity.ok(Map.of("status", "activated", "scenario", scenarioId));
    }
}
