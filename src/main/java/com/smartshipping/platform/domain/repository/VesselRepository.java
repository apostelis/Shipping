package com.smartshipping.platform.domain.repository;

import com.smartshipping.platform.domain.model.Vessel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VesselRepository extends JpaRepository<Vessel, Long> {

    Optional<Vessel> findByImoNumber(String imoNumber);

    List<Vessel> findByStatus(Vessel.VesselStatus status);

    Page<Vessel> findByCapacityTeuGreaterThanEqual(Integer minCapacity, Pageable pageable);

    @Query("SELECT v FROM Vessel v WHERE v.status = 'ACTIVE' AND v.capacityTeu >= :minCapacity")
    List<Vessel> findAvailableVessels(Integer minCapacity);

    @Query("SELECT v FROM Vessel v WHERE v.currentLocation.id = :portId")
    List<Vessel> findByCurrentLocation(Long portId);
}
