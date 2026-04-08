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
@Table(name = "historical_demand")
@Getter
@Setter
public class HistoricalDemand {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @UuidGenerator
    @Column(name = "id")
    private UUID id;

    @Column(name = "trade_lane", nullable = false, length = 50)
    private String tradeLane;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origin_port_id", nullable = false)
    private Port originPort;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_port_id", nullable = false)
    private Port destinationPort;

    @Column(name = "cargo_type", length = 100)
    private String cargoType;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "teu_volume", nullable = false, precision = 12, scale = 2)
    private BigDecimal teuVolume;

    @Column(name = "revenue", precision = 12, scale = 2)
    private BigDecimal revenue;

    @Column(name = "booking_count")
    private Integer bookingCount;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
