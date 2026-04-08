package com.smartshipping.platform.api.controller;

import com.smartshipping.platform.api.dto.ScenarioResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/scenarios")
@Tag(name = "Scenarios", description = "Scenario management for what-if analysis")
public class ScenarioController {

    private static final Map<String, ScenarioResponse> SCENARIOS = List.of(
            new ScenarioResponse("normal", "Normal Operations",
                    "Baseline scenario with all ports and lanes operational",
                    List.of(), List.of()),
            new ScenarioResponse("demand-spike", "Demand Spike",
                    "Simulates a sudden surge in shipping demand across all routes",
                    List.of(), List.of()),
            new ScenarioResponse("port-disruption", "Port Disruption",
                    "Simulates a major port closure disrupting supply chains",
                    List.of(), List.of("ROTTERDAM")),
            new ScenarioResponse("hormuz-blockade", "Hormuz Blockade",
                    "Simulates a blockade of the Strait of Hormuz affecting Middle East routes",
                    List.of("DUBAI-JEDDAH", "MUMBAI-DUBAI"), List.of())
    ).stream().collect(Collectors.toMap(ScenarioResponse::id, Function.identity()));

    @GetMapping
    @Operation(summary = "List all scenarios", description = "Returns all available what-if scenarios")
    public List<ScenarioResponse> listScenarios() {
        return List.copyOf(SCENARIOS.values());
    }

    @GetMapping("/{scenarioId}")
    @Operation(summary = "Get scenario by ID", description = "Returns a specific scenario by its identifier")
    public ScenarioResponse getScenario(@PathVariable String scenarioId) {
        ScenarioResponse scenario = SCENARIOS.get(scenarioId);
        if (scenario == null) {
            throw new IllegalArgumentException("Unknown scenario: " + scenarioId);
        }
        return scenario;
    }
}
