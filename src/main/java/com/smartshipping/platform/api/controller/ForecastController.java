package com.smartshipping.platform.api.controller;

import com.smartshipping.platform.forecasting.model.ForecastResult;
import com.smartshipping.platform.forecasting.model.ForecastingParameters;
import com.smartshipping.platform.forecasting.service.ForecastingService;
import com.smartshipping.platform.api.dto.ForecastRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/forecast")
@Tag(name = "Demand Forecasting", description = "Demand forecasting and prediction APIs")
public class ForecastController {

    private final ForecastingService forecastingService;

    public ForecastController(ForecastingService forecastingService) {
        this.forecastingService = forecastingService;
    }

    @PostMapping("/demand")
    @Operation(summary = "Generate demand forecast", description = "Generate a demand forecast for a trade lane")
    public ResponseEntity<ForecastResult> generateForecast(
            @Valid @RequestBody ForecastRequest request) {
        
        ForecastingParameters params = ForecastingParameters.builder()
                .tradeLane(request.getTradeLane())
                .cargoType(request.getCargoType())
                .forecastHorizon(request.getForecastHorizon())
                .granularity(request.getGranularity() != null ? 
                        request.getGranularity() : ForecastingParameters.GRANULARITY_DAILY)
                .confidenceLevel(request.getConfidenceLevel() != null ? 
                        request.getConfidenceLevel() : new BigDecimal("1.96"))
                .algorithm(request.getAlgorithm() != null ? 
                        request.getAlgorithm() : ForecastingParameters.ALGORITHM_SMA)
                .build();

        ForecastResult result = forecastingService.generateForecast(
                request.getTradeLane(),
                request.getCargoType(),
                params
        );

        return ResponseEntity.ok(result);
    }

    @GetMapping("/trade-lanes")
    @Operation(summary = "Get available trade lanes", description = "Get list of available trade lanes for forecasting")
    public ResponseEntity<List<String>> getTradeLanes() {
        return ResponseEntity.ok(forecastingService.getAvailableTradeLanes());
    }

    @GetMapping("/algorithms")
    @Operation(summary = "Get available algorithms", description = "Get list of available forecasting algorithms")
    public ResponseEntity<List<String>> getAlgorithms() {
        return ResponseEntity.ok(forecastingService.getAvailableAlgorithms());
    }

    @GetMapping("/default-parameters")
    @Operation(summary = "Get default parameters", description = "Get default forecasting parameters")
    public ResponseEntity<ForecastingParameters> getDefaultParameters() {
        return ResponseEntity.ok(forecastingService.getDefaultParameters());
    }
}
