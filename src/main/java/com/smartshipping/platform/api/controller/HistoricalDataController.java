package com.smartshipping.platform.api.controller;

import com.smartshipping.platform.domain.model.HistoricalDemand;
import com.smartshipping.platform.domain.repository.HistoricalDemandRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    @Operation(summary = "Get historical demand", description = "Get historical demand data for a trade lane")
    public ResponseEntity<List<Map<String, Object>>> getHistoricalDemand(
            @RequestParam String tradeLane,
            @RequestParam(defaultValue = "90") int days) {

        List<HistoricalDemand> data = repository.findByTradeLane(tradeLane);

        // Return last N days
        int startIndex = Math.max(0, data.size() - days);
        List<Map<String, Object>> result = data.subList(startIndex, data.size()).stream()
                .map(d -> Map.<String, Object>of(
                        "date", d.getDate().toString(),
                        "value", d.getTeuVolume()
                ))
                .toList();

        return ResponseEntity.ok(result);
    }
}
