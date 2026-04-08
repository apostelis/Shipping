package com.smartshipping.platform.domain.repository;

import com.smartshipping.platform.domain.model.Port;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PortRepository extends JpaRepository<Port, Long> {

    Optional<Port> findByCode(String code);

    List<Port> findByCountry(String country);

    @Query("SELECT p FROM Port p WHERE p.name LIKE %:name%")
    List<Port> searchByName(String name);

    @Query("SELECT p FROM Port p WHERE " +
           "p.latitude BETWEEN :minLat AND :maxLat " +
           "AND p.longitude BETWEEN :minLon AND :maxLon")
    List<Port> findByCoordinates(
            Double minLat, Double maxLat,
            Double minLon, Double maxLon
    );
}
