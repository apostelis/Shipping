package com.smartshipping.platform.api.controller;

import com.smartshipping.platform.domain.model.HistoricalDemand;
import com.smartshipping.platform.domain.repository.HistoricalDemandRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/historical")
@Tag(name = "Historical Data", description = "Historical demand data")
public class HistoricalDataController {

    private final HistoricalDemandRepository repository;

    public HistoricalDataController(HistoricalDemandRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/demand")
    @Operation(summary = "Get historical demand", description = "Get historical demand data for a trade lane, optionally adjusted for a scenario")
    public ResponseEntity<List<Map<String, Object>>> getHistoricalDemand(
            @RequestParam String tradeLane,
            @RequestParam(defaultValue = "90") int days,
            @RequestParam(defaultValue = "normal") String scenarioId) {

        List<HistoricalDemand> data = repository.findByTradeLane(tradeLane);

        int startIndex = Math.max(0, data.size() - days);
        List<HistoricalDemand> slice = data.subList(startIndex, data.size());

        List<Map<String, Object>> result = slice.stream()
                .map(d -> {
                    BigDecimal adjusted = applyScenario(d.getTeuVolume(), d.getDate(), tradeLane, scenarioId);
                    return Map.<String, Object>of(
                            "date", d.getDate().toString(),
                            "value", adjusted
                    );
                })
                .toList();

        return ResponseEntity.ok(result);
    }

    private BigDecimal applyScenario(BigDecimal baseValue, LocalDate date, String tradeLane, String scenarioId) {
        return switch (scenarioId) {
            case "demand-spike" -> applyDemandSpike(baseValue, date, tradeLane);
            case "port-disruption" -> applyPortDisruption(baseValue, date, tradeLane);
            case "hormuz-blockade" -> applyHormuzBlockade(baseValue, date, tradeLane);
            default -> baseValue;
        };
    }

    /**
     * Demand spike: MED-NORTHEUROPE surges +80% in the last 30 days.
     * Other lanes see a moderate +15% sympathy increase.
     */
    private BigDecimal applyDemandSpike(BigDecimal baseValue, LocalDate date, String tradeLane) {
        LocalDate spikeStart = LocalDate.of(2026, 2, 1);
        LocalDate rampStart = LocalDate.of(2026, 1, 20);

        if (tradeLane.equals("MED-NORTHEUROPE")) {
            if (!date.isBefore(spikeStart)) {
                return baseValue.multiply(new BigDecimal("1.83"));
            } else if (!date.isBefore(rampStart)) {
                // Ramp up from 1.0 to 1.83 over ~12 days
                long daysIn = rampStart.until(date).getDays();
                double factor = 1.0 + 0.83 * (daysIn / 12.0);
                return baseValue.multiply(BigDecimal.valueOf(factor)).setScale(1, RoundingMode.HALF_UP);
            }
        } else if (!date.isBefore(LocalDate.of(2026, 2, 1))) {
            return baseValue.multiply(new BigDecimal("1.15"));
        }
        return baseValue;
    }

    /**
     * Port disruption: Rotterdam lanes drop -60%. Hamburg and Mediterranean lanes surge +40%
     * as traffic reroutes.
     */
    private BigDecimal applyPortDisruption(BigDecimal baseValue, LocalDate date, String tradeLane) {
        LocalDate disruptionStart = LocalDate.of(2026, 3, 1);
        if (date.isBefore(disruptionStart)) return baseValue;

        return switch (tradeLane) {
            case "ASIA-EUROPE", "EUROPE-AMERICAS", "GULF-EUROPE" ->
                    baseValue.multiply(new BigDecimal("0.40")); // -60% (Rotterdam dependent)
            case "MED-NORTHEUROPE" ->
                    baseValue.multiply(new BigDecimal("1.45")); // +45% (reroute via Med)
            case "INTRA-ASIA" ->
                    baseValue.multiply(new BigDecimal("1.20")); // +20% (backlog effect)
            default -> baseValue;
        };
    }

    /**
     * Hormuz blockade: Gulf lanes collapse. Cape route and Indian Ocean lanes surge.
     */
    private BigDecimal applyHormuzBlockade(BigDecimal baseValue, LocalDate date, String tradeLane) {
        LocalDate blockadeStart = LocalDate.of(2026, 3, 1);
        if (date.isBefore(blockadeStart)) return baseValue;

        return switch (tradeLane) {
            case "GULF-EUROPE" ->
                    baseValue.multiply(new BigDecimal("0.15")); // -85% (strait closed)
            case "INDIA-GULF" ->
                    baseValue.multiply(new BigDecimal("0.25")); // -75% (Gulf access limited)
            case "ASIA-EUROPE" ->
                    baseValue.multiply(new BigDecimal("1.30")); // +30% (reroute pressure)
            case "MED-NORTHEUROPE" ->
                    baseValue.multiply(new BigDecimal("1.35")); // +35% (alternative routing)
            default -> baseValue;
        };
    }
}
