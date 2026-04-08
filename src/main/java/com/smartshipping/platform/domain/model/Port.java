package com.smartshipping.platform.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "ports")
@Getter
@Setter
public class Port extends BaseEntity {

    @Column(name = "code", nullable = false, unique = true, length = 10)
    private String code;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "country", nullable = false)
    private String country;

    @Column(name = "latitude", nullable = false, precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", nullable = false, precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "facilities", columnDefinition = "jsonb")
    private String facilities;

    @Column(name = "restrictions", columnDefinition = "jsonb")
    private String restrictions;

    @Column(name = "operational_metrics", columnDefinition = "jsonb")
    private String operationalMetrics;

    @Column(name = "time_zone", length = 50)
    private String timeZone;
}
