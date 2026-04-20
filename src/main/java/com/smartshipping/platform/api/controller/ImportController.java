package com.smartshipping.platform.api.controller;

import com.smartshipping.platform.domain.model.HistoricalDemand;
import com.smartshipping.platform.domain.model.Port;
import com.smartshipping.platform.domain.model.ShippingLane;
import com.smartshipping.platform.domain.repository.HistoricalDemandRepository;
import com.smartshipping.platform.domain.repository.PortRepository;
import com.smartshipping.platform.domain.repository.ShippingLaneRepository;
import com.smartshipping.platform.optimization.service.RouteOptimizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/import")
@Tag(name = "Data Import", description = "CSV data import")
public class ImportController {

    private final HistoricalDemandRepository demandRepository;
    private final ShippingLaneRepository laneRepository;
    private final PortRepository portRepository;
    private final RouteOptimizationService routeOptimizationService;

    public ImportController(HistoricalDemandRepository demandRepository,
                           ShippingLaneRepository laneRepository,
                           PortRepository portRepository,
                           RouteOptimizationService routeOptimizationService) {
        this.demandRepository = demandRepository;
        this.laneRepository = laneRepository;
        this.portRepository = portRepository;
        this.routeOptimizationService = routeOptimizationService;
    }

    @PostMapping("/demand")
    @Operation(summary = "Import demand CSV", description = "Import historical demand data from CSV")
    @Transactional
    public ResponseEntity<Map<String, Object>> importDemand(@RequestParam("file") MultipartFile file) {
        int imported = 0;
        int skipped = 0;

        try (var reader = new InputStreamReader(file.getInputStream());
             var parser = new CSVParser(reader, CSVFormat.DEFAULT.builder()
                     .setHeader()
                     .setSkipHeaderRecord(true)
                     .setIgnoreHeaderCase(true)
                     .setTrim(true)
                     .build())) {

            for (CSVRecord record : parser) {
                try {
                    String tradeLane = record.get("trade_lane");
                    String originCode = record.get("origin_port");
                    String destCode = record.get("destination_port");
                    LocalDate date = LocalDate.parse(record.get("date"));
                    BigDecimal teuVolume = new BigDecimal(record.get("teu_volume"));

                    Port origin = portRepository.findByCode(originCode).orElse(null);
                    Port dest = portRepository.findByCode(destCode).orElse(null);

                    if (origin == null || dest == null) {
                        skipped++;
                        continue;
                    }

                    HistoricalDemand demand = new HistoricalDemand();
                    demand.setTradeLane(tradeLane);
                    demand.setOriginPort(origin);
                    demand.setDestinationPort(dest);
                    demand.setCargoType("MIXED_CONTAINER");
                    demand.setDate(date);
                    demand.setTeuVolume(teuVolume);
                    demand.setRevenue(teuVolume.multiply(BigDecimal.valueOf(1500)));
                    demand.setBookingCount(teuVolume.divide(BigDecimal.valueOf(20), 0, java.math.RoundingMode.HALF_UP).intValue());

                    demandRepository.save(demand);
                    imported++;
                } catch (Exception e) {
                    skipped++;
                }
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }

        return ResponseEntity.ok(Map.of("imported", imported, "skipped", skipped));
    }

    @PostMapping("/lanes")
    @Operation(summary = "Import lanes CSV", description = "Import shipping lanes from CSV and refresh route graph")
    @Transactional
    public ResponseEntity<Map<String, Object>> importLanes(@RequestParam("file") MultipartFile file) {
        int imported = 0;
        int skipped = 0;

        try (var reader = new InputStreamReader(file.getInputStream());
             var parser = new CSVParser(reader, CSVFormat.DEFAULT.builder()
                     .setHeader()
                     .setSkipHeaderRecord(true)
                     .setIgnoreHeaderCase(true)
                     .setTrim(true)
                     .build())) {

            for (CSVRecord record : parser) {
                try {
                    String originCode = record.get("origin_port");
                    String destCode = record.get("destination_port");

                    Port origin = portRepository.findByCode(originCode).orElse(null);
                    Port dest = portRepository.findByCode(destCode).orElse(null);

                    if (origin == null || dest == null) {
                        skipped++;
                        continue;
                    }

                    // Update existing or create new
                    ShippingLane lane = laneRepository
                            .findByOriginPortCodeAndDestinationPortCode(originCode, destCode)
                            .orElseGet(ShippingLane::new);

                    lane.setOriginPort(origin);
                    lane.setDestinationPort(dest);
                    lane.setDistanceNm(new BigDecimal(record.get("distance_nm")));
                    lane.setEstimatedTimeHours(new BigDecimal(record.get("time_hours")));
                    lane.setBaseCost(new BigDecimal(record.get("base_cost")));
                    lane.setFuelCost(new BigDecimal(record.get("fuel_cost")));
                    lane.setTransitFee(parseBigDecimalOrZero(record, "transit_fee"));
                    lane.setCanalFee(parseBigDecimalOrZero(record, "canal_fee"));
                    lane.setIsActive(true);

                    laneRepository.save(lane);
                    imported++;
                } catch (Exception e) {
                    skipped++;
                }
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }

        // Refresh route graph with new lanes
        routeOptimizationService.refreshRouteGraph();

        return ResponseEntity.ok(Map.of("imported", imported, "skipped", skipped, "graphRefreshed", true));
    }

    private BigDecimal parseBigDecimalOrZero(CSVRecord record, String field) {
        try {
            return new BigDecimal(record.get(field));
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }
}
