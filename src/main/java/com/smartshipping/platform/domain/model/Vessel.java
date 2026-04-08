package com.smartshipping.platform.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "vessels")
@Getter
@Setter
public class Vessel extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "imo_number", nullable = false, unique = true, length = 20)
    private String imoNumber;

    @Column(name = "call_sign", length = 20)
    private String callSign;

    @Column(name = "flag", length = 50)
    private String flag;

    @Column(name = "capacity_teu", nullable = false)
    private Integer capacityTeu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_location_id")
    private Port currentLocation;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private VesselStatus status = VesselStatus.ACTIVE;

    @Column(name = "specifications", columnDefinition = "jsonb")
    private String specifications;

    @Column(name = "year_built")
    private Integer yearBuilt;

    @Column(name = "operator")
    private String operator;

    public enum VesselStatus {
        ACTIVE, IN_MAINTENANCE, OUT_OF_SERVICE, DECOMMISSIONED
    }
}
