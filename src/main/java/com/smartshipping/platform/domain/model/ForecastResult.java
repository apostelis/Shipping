package com.smartshipping.platform.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "forecast_results")
@Getter
@Setter
public class ForecastResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @UuidGenerator
    @Column(name = "id")
    private UUID id;

    @Column(name = "trade_lane", nullable = false, length = 50)
    private String tradeLane;

    @Column(name = "cargo_type", length = 100)
    private String cargoType;

    @Column(name = "granularity", nullable = false, length = 20)
    private String granularity;

    @Column(name = "forecast_date", nullable = false)
    private LocalDate forecastDate;

    @Column(name = "predicted_teu", nullable = false, precision = 12, scale = 2)
    private BigDecimal predictedTeu;

    @Column(name = "confidence_lower", precision = 12, scale = 2)
    private BigDecimal confidenceLower;

    @Column(name = "confidence_upper", precision = 12, scale = 2)
    private BigDecimal confidenceUpper;

    @Column(name = "algorithm", nullable = false, length = 50)
    private String algorithm;

    @Column(name = "model_version", length = 50)
    private String modelVersion;

    @Column(name = "accuracy_mape", precision = 8, scale = 4)
    private BigDecimal accuracyMape;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
