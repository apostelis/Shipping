package com.smartshipping.platform.api.controller;

import com.smartshipping.platform.domain.model.Vessel;
import com.smartshipping.platform.domain.repository.VesselRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/vessels")
@Tag(name = "Vessels", description = "Vessel fleet information")
public class VesselController {

    private final VesselRepository vesselRepository;

    public VesselController(VesselRepository vesselRepository) {
        this.vesselRepository = vesselRepository;
    }

    @GetMapping
    @Operation(summary = "List vessels", description = "Get all vessels with key specs")
    public ResponseEntity<List<Map<String, Object>>> listVessels() {
        List<Map<String, Object>> vessels = vesselRepository.findAll().stream()
                .map(v -> Map.<String, Object>of(
                        "id", v.getId().toString(),
                        "name", v.getName(),
                        "imoNumber", v.getImoNumber(),
                        "capacityTeu", v.getCapacityTeu(),
                        "status", v.getStatus().name(),
                        "operator", v.getOperator() != null ? v.getOperator() : "",
                        "specifications", v.getSpecifications() != null ? v.getSpecifications() : "{}"
                ))
                .toList();
        return ResponseEntity.ok(vessels);
    }
}
