package com.smartshipping.platform.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Getter
@Setter
public class Booking extends BaseEntity {

    @Column(name = "booking_reference", nullable = false, unique = true, length = 50)
    private String bookingReference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origin_port_id", nullable = false)
    private Port originPort;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_port_id", nullable = false)
    private Port destinationPort;

    @Column(name = "cargo_type", nullable = false, length = 100)
    private String cargoType;

    @Column(name = "volume_teu", nullable = false, precision = 10, scale = 2)
    private BigDecimal volumeTeu;

    @Column(name = "weight_kg", precision = 12, scale = 2)
    private BigDecimal weightKg;

    @Column(name = "booking_date", nullable = false)
    private LocalDateTime bookingDate = LocalDateTime.now();

    @Column(name = "requested_date")
    private LocalDateTime requestedDate;

    @Column(name = "actual_date")
    private LocalDateTime actualDate;

    @Column(name = "revenue", precision = 12, scale = 2)
    private BigDecimal revenue;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "special_instructions", columnDefinition = "TEXT")
    private String specialInstructions;

    public enum BookingStatus {
        PENDING, CONFIRMED, IN_TRANSIT, DELIVERED, CANCELLED
    }
}
