package com.smartshipping.platform.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
@Getter
@Setter
public class Customer extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_type", nullable = false)
    private CustomerType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "segment", nullable = false)
    private CustomerSegment segment;

    @Column(name = "credit_rating")
    private Integer creditRating;

    @Column(name = "shipping_patterns", columnDefinition = "jsonb")
    private String shippingPatterns;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "contact_phone")
    private String contactPhone;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    public enum CustomerType {
        INDUSTRIAL, RETAIL, WHOLESALE, LOGISTICS_PROVIDER
    }

    public enum CustomerSegment {
        PLATINUM, GOLD, SILVER, BRONZE
    }
}
