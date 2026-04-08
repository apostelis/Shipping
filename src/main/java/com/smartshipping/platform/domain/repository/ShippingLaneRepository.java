package com.smartshipping.platform.domain.repository;

import com.smartshipping.platform.domain.model.ShippingLane;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShippingLaneRepository extends JpaRepository<ShippingLane, Long> {

    Optional<ShippingLane> findByOriginPortCodeAndDestinationPortCode(
            String originCode, String destCode);

    List<ShippingLane> findByOriginPortId(UUID originPortId);

    List<ShippingLane> findByDestinationPortId(UUID destinationPort_id);

    List<ShippingLane> findByIsActive(Boolean isActive);

    @Query("SELECT s FROM ShippingLane s WHERE s.isActive = true")
    List<ShippingLane> findAllActive();

    @Query("SELECT s FROM ShippingLane s WHERE s.originPort.code = :code OR s.destinationPort.code = :code")
    List<ShippingLane> findByPortCode(String code);
}
