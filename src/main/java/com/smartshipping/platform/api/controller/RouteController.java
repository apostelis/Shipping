package com.smartshipping.platform.api.controller;

import com.smartshipping.platform.api.dto.RouteOptimizationRequest;
import com.smartshipping.platform.optimization.model.OptimalRoute;
import com.smartshipping.platform.optimization.model.OptimizationCriteria;
import com.smartshipping.platform.optimization.service.RouteOptimizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/routes")
@Tag(name = "Route Optimization", description = "Route optimization and planning APIs")
public class RouteController {

    private final RouteOptimizationService routeOptimizationService;

    public RouteController(RouteOptimizationService routeOptimizationService) {
        this.routeOptimizationService = routeOptimizationService;
    }

    @PostMapping("/optimize")
    @Operation(summary = "Optimize route", description = "Find optimal route between two ports")
    public ResponseEntity<OptimalRoute> optimizeRoute(
            @Valid @RequestBody RouteOptimizationRequest request) {
        
        OptimizationCriteria criteria = OptimizationCriteria.builder()
                .originPortCode(request.getOriginPortCode())
                .destinationPortCode(request.getDestinationPortCode())
                .objectiveType(request.getObjectiveType() != null ? 
                        OptimizationCriteria.ObjectiveType.valueOf(request.getObjectiveType()) : 
                        OptimizationCriteria.ObjectiveType.BALANCED)
                .maxDistance(request.getMaxDistance())
                .maxTimeHours(request.getMaxTimeHours())
                .maxCost(request.getMaxCost())
                .maxStops(request.getMaxStops() != null ? request.getMaxStops() : 5)
                .build();

        OptimalRoute route = routeOptimizationService.findOptimalRoute(criteria);
        return ResponseEntity.ok(route);
    }

    @GetMapping("/alternatives")
    @Operation(summary = "Get alternative routes", description = "Find alternative routes between two ports")
    public ResponseEntity<List<OptimalRoute>> getAlternativeRoutes(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam(defaultValue = "3") int maxAlternatives) {
        
        OptimizationCriteria criteria = OptimizationCriteria.builder()
                .originPortCode(origin)
                .destinationPortCode(destination)
                .objectiveType(OptimizationCriteria.ObjectiveType.BALANCED)
                .maxStops(5)
                .build();

        List<OptimalRoute> routes = routeOptimizationService.findAlternativeRoutes(criteria, maxAlternatives);
        return ResponseEntity.ok(routes);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh route graph", description = "Refresh the route optimization graph from database")
    public ResponseEntity<Void> refreshRouteGraph() {
        routeOptimizationService.refreshRouteGraph();
        return ResponseEntity.ok().build();
    }
}
