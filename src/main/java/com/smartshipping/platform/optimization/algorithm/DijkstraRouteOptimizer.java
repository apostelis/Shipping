package com.smartshipping.platform.optimization.algorithm;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.Set;

public class DijkstraRouteOptimizer {

    private final Map<String, Map<String, Edge>> graph;

    public DijkstraRouteOptimizer() {
        this.graph = new HashMap<>();
    }

    public void addEdge(String from, String to, BigDecimal distance, BigDecimal time, BigDecimal cost) {
        graph.computeIfAbsent(from, k -> new HashMap<>());
        graph.computeIfAbsent(to, k -> new HashMap<>());
        
        graph.get(from).put(to, Edge.builder()
                .from(from)
                .to(to)
                .distance(distance)
                .time(time)
                .cost(cost)
                .build());
    }

    public List<Edge> findShortestPath(String origin, String destination) {
        Map<String, BigDecimal> distances = new HashMap<>();
        Map<String, String> previous = new HashMap<>();
        Set<String> visited = new HashSet<>();
        PriorityQueue<Node> pq = new PriorityQueue<>(Comparator.comparing(Node::getDistance));

        for (String node : graph.keySet()) {
            distances.put(node, BigDecimal.valueOf(Double.MAX_VALUE));
        }
        distances.put(origin, BigDecimal.ZERO);

        pq.add(new Node(origin, BigDecimal.ZERO));

        while (!pq.isEmpty()) {
            Node current = pq.poll();
            String currentNode = current.getNode();

            if (visited.contains(currentNode)) {
                continue;
            }
            visited.add(currentNode);

            if (currentNode.equals(destination)) {
                break;
            }

            Map<String, Edge> edges = graph.get(currentNode);
            if (edges == null) {
                continue;
            }

            for (Edge edge : edges.values()) {
                String neighbor = edge.getTo();
                
                if (visited.contains(neighbor)) {
                    continue;
                }

                BigDecimal newDist = distances.get(currentNode).add(edge.getDistance());
                
                if (newDist.compareTo(distances.get(neighbor)) < 0) {
                    distances.put(neighbor, newDist);
                    previous.put(neighbor, currentNode);
                    pq.add(new Node(neighbor, newDist));
                }
            }
        }

        return reconstructPath(previous, origin, destination);
    }

    public List<List<Edge>> findKShortestPaths(String origin, String destination, int k) {
        List<List<Edge>> paths = new ArrayList<>();
        
        List<Edge> firstPath = findShortestPath(origin, destination);
        if (firstPath.isEmpty()) {
            return paths;
        }
        paths.add(firstPath);

        for (int i = 1; i < k; i++) {
            for (int j = 0; j < paths.get(i - 1).size(); j++) {
                Edge removedEdge = paths.get(i - 1).get(j);
                
                String fromNode = removedEdge.getFrom();
                String toNode = removedEdge.getTo();
                
                Map<String, Edge> edgesFrom = graph.get(fromNode);
                if (edgesFrom != null) {
                    Edge original = edgesFrom.get(toNode);
                    if (original != null) {
                        edgesFrom.remove(toNode);
                    }
                }
                
                List<Edge> alternativePath = findShortestPath(origin, destination);
                if (!alternativePath.isEmpty() && !isDuplicate(alternativePath, paths)) {
                    paths.add(alternativePath);
                }
                
                if (edgesFrom != null && removedEdge != null) {
                    edgesFrom.put(toNode, removedEdge);
                }
            }
            
            if (paths.size() >= k) {
                break;
            }
        }

        return paths;
    }

    private boolean isDuplicate(List<Edge> path, List<List<Edge>> existingPaths) {
        for (List<Edge> existing : existingPaths) {
            if (existing.equals(path)) {
                return true;
            }
        }
        return false;
    }

    private List<Edge> reconstructPath(Map<String, String> previous, String origin, String destination) {
        List<Edge> path = new ArrayList<>();
        String current = destination;

        while (current != null && !current.equals(origin)) {
            String prev = previous.get(current);
            if (prev == null) {
                return new ArrayList<>();
            }

            Map<String, Edge> edges = graph.get(prev);
            if (edges != null) {
                Edge edge = edges.get(current);
                if (edge != null) {
                    path.add(0, edge);
                }
            }
            current = prev;
        }

        return path;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Edge {
        private String from;
        private String to;
        private BigDecimal distance;
        private BigDecimal time;
        private BigDecimal cost;
    }

    @Data
    @AllArgsConstructor
    public static class Node {
        private String node;
        private BigDecimal distance;
    }

    public void loadFromShippingLanes(List<LaneData> lanes) {
        for (LaneData lane : lanes) {
            BigDecimal cost = calculateLaneCost(lane);
            addEdge(lane.originPortCode(), lane.destinationPortCode(), 
                    lane.distanceNm(), lane.estimatedTimeHours(), cost);
        }
    }

    private BigDecimal calculateLaneCost(LaneData lane) {
        BigDecimal baseCost = lane.baseCost() != null ? lane.baseCost() : BigDecimal.ZERO;
        BigDecimal fuelCost = lane.fuelCost() != null ? lane.fuelCost() : BigDecimal.ZERO;
        BigDecimal transitFee = lane.transitFee() != null ? lane.transitFee() : BigDecimal.ZERO;
        BigDecimal canalFee = lane.canalFee() != null ? lane.canalFee() : BigDecimal.ZERO;
        
        return baseCost.add(fuelCost).add(transitFee).add(canalFee);
    }

    public record LaneData(
        String originPortCode,
        String destinationPortCode,
        BigDecimal distanceNm,
        BigDecimal estimatedTimeHours,
        BigDecimal baseCost,
        BigDecimal fuelCost,
        BigDecimal transitFee,
        BigDecimal canalFee
    ) {}
}
