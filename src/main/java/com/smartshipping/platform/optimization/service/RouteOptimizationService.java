package com.smartshipping.platform.optimization.service;

import com.smartshipping.platform.domain.model.ShippingLane;
import com.smartshipping.platform.domain.repository.ShippingLaneRepository;
import com.smartshipping.platform.optimization.algorithm.DijkstraRouteOptimizer;
import com.smartshipping.platform.optimization.model.OptimalRoute;
import com.smartshipping.platform.optimization.model.OptimizationCriteria;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class RouteOptimizationService {

    private final ShippingLaneRepository shippingLaneRepository;
    private DijkstraRouteOptimizer routeOptimizer;

    public RouteOptimizationService(ShippingLaneRepository shippingLaneRepository) {
        this.shippingLaneRepository = shippingLaneRepository;
        initializeRouteGraph();
    }

    private void initializeRouteGraph() {
        this.routeOptimizer = new DijkstraRouteOptimizer();
        
        List<ShippingLane> lanes = shippingLaneRepository.findAllActive();
        
        List<DijkstraRouteOptimizer.LaneData> laneDataList = lanes.stream()
                .map(lane -> new DijkstraRouteOptimizer.LaneData(
                        lane.getOriginPort().getCode(),
                        lane.getDestinationPort().getCode(),
                        lane.getDistanceNm(),
                        lane.getEstimatedTimeHours(),
                        lane.getBaseCost(),
                        lane.getFuelCost(),
                        lane.getTransitFee(),
                        lane.getCanalFee()
                ))
                .toList();
        
        routeOptimizer.loadFromShippingLanes(laneDataList);
    }

    public OptimalRoute findOptimalRoute(OptimizationCriteria criteria) {
        List<DijkstraRouteOptimizer.Edge> path = routeOptimizer.findShortestPath(
                criteria.getOriginPortCode(),
                criteria.getDestinationPortCode()
        );

        if (path.isEmpty()) {
            return createEmptyRoute(criteria);
        }

        return buildOptimalRoute(path, criteria);
    }

    public List<OptimalRoute> findAlternativeRoutes(OptimizationCriteria criteria, int maxAlternatives) {
        List<List<DijkstraRouteOptimizer.Edge>> paths = routeOptimizer.findKShortestPaths(
                criteria.getOriginPortCode(),
                criteria.getDestinationPortCode(),
                maxAlternatives
        );

        List<OptimalRoute> routes = new ArrayList<>();
        for (List<DijkstraRouteOptimizer.Edge> path : paths) {
            if (!path.isEmpty()) {
                routes.add(buildOptimalRoute(path, criteria));
            }
        }

        return routes;
    }

    private OptimalRoute buildOptimalRoute(List<DijkstraRouteOptimizer.Edge> edges, OptimizationCriteria criteria) {
        BigDecimal totalDistance = BigDecimal.ZERO;
        BigDecimal totalTime = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;
        BigDecimal fuelCost = BigDecimal.ZERO;
        BigDecimal transitFee = BigDecimal.ZERO;
        BigDecimal canalFee = BigDecimal.ZERO;

        List<OptimalRoute.RouteSegment> segments = new ArrayList<>();
        
        for (DijkstraRouteOptimizer.Edge edge : edges) {
            totalDistance = totalDistance.add(edge.getDistance());
            totalTime = totalTime.add(edge.getTime());
            totalCost = totalCost.add(edge.getCost());
            
            segments.add(OptimalRoute.RouteSegment.builder()
                    .originPortCode(edge.getFrom())
                    .destinationPortCode(edge.getTo())
                    .distanceNm(edge.getDistance())
                    .timeHours(edge.getTime())
                    .cost(edge.getCost())
                    .routeName(edge.getFrom() + "-" + edge.getTo())
                    .build());
        }

        LocalDateTime now = LocalDateTime.now();
        
        return OptimalRoute.builder()
                .routeId(UUID.randomUUID().toString())
                .segments(segments)
                .totalDistanceNm(totalDistance)
                .totalTimeHours(totalTime)
                .totalCost(totalCost)
                .fuelCost(fuelCost)
                .transitFee(transitFee)
                .canalFee(canalFee)
                .estimatedDeparture(now)
                .estimatedArrival(now.plusHours(totalTime.longValue()))
                .criteria(criteria)
                .build();
    }

    private OptimalRoute createEmptyRoute(OptimizationCriteria criteria) {
        return OptimalRoute.builder()
                .routeId(UUID.randomUUID().toString())
                .totalDistanceNm(BigDecimal.ZERO)
                .totalTimeHours(BigDecimal.ZERO)
                .totalCost(BigDecimal.ZERO)
                .warnings(List.of("No route found between " + criteria.getOriginPortCode() + 
                        " and " + criteria.getDestinationPortCode()))
                .build();
    }

    public void refreshRouteGraph() {
        initializeRouteGraph();
    }
}
