package com.smartshipping.platform.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "voyages")
@Getter
@Setter
public class Voyage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vessel_id", nullable = false)
    private Vessel vessel;

    @Column(name = "voyage_number", nullable = false, length = 20)
    private String voyageNumber;

    @Column(name = "route", nullable = false, columnDefinition = "jsonb")
    private String route;

    @Column(name = "departure_time", nullable = false)
    private LocalDateTime departureTime;

    @Column(name = "arrival_time")
    private LocalDateTime arrivalTime;

    @Column(name = "actual_departure_time")
    private LocalDateTime actualDepartureTime;

    @Column(name = "actual_arrival_time")
    private LocalDateTime actualArrivalTime;

    @Column(name = "fuel_consumed", precision = 12, scale = 2)
    private BigDecimal fuelConsumed;

    @Column(name = "distance_traveled", precision = 10, scale = 2)
    private BigDecimal distanceTraveled;

    @Column(name = "weather_conditions", columnDefinition = "jsonb")
    private String weatherConditions;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "SCHEDULED";
}
