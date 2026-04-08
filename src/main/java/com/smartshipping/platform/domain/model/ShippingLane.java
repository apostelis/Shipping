package com.smartshipping.platform.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipping_lanes")
@Getter
@Setter
public class ShippingLane extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origin_port_id", nullable = false)
    private Port originPort;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_port_id", nullable = false)
    private Port destinationPort;

    @Column(name = "distance_nm", nullable = false, precision = 10, scale = 2)
    private BigDecimal distanceNm;

    @Column(name = "estimated_time_hours", precision = 8, scale = 2)
    private BigDecimal estimatedTimeHours;

    @Column(name = "base_cost", precision = 12, scale = 2)
    private BigDecimal baseCost;

    @Column(name = "fuel_cost", precision = 12, scale = 2)
    private BigDecimal fuelCost;

    @Column(name = "transit_fee", precision = 12, scale = 2)
    private BigDecimal transitFee;

    @Column(name = "canal_fee", precision = 12, scale = 2)
    private BigDecimal canalFee;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
