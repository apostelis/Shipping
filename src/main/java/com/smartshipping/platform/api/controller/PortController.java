package com.smartshipping.platform.api.controller;

import com.smartshipping.platform.api.dto.PortResponse;
import com.smartshipping.platform.domain.repository.PortRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ports")
@Tag(name = "Ports", description = "Port information and lookup")
public class PortController {

    private final PortRepository portRepository;

    public PortController(PortRepository portRepository) {
        this.portRepository = portRepository;
    }

    @GetMapping
    @Operation(summary = "List all ports", description = "Returns all ports with their coordinates and metadata")
    public List<PortResponse> listPorts() {
        return portRepository.findAll().stream()
                .map(port -> new PortResponse(
                        port.getCode(),
                        port.getName(),
                        port.getCountry(),
                        port.getLatitude(),
                        port.getLongitude()
                ))
                .toList();
    }
}
