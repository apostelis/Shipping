package com.smartshipping.platform.domain.repository;

import com.smartshipping.platform.domain.model.Voyage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VoyageRepository extends JpaRepository<Voyage, Long> {

    List<Voyage> findByVesselId(UUID vesselId);

    Page<Voyage> findByStatus(String status, Pageable pageable);

    @Query("SELECT v FROM Voyage v WHERE v.departureTime BETWEEN :startDate AND :endDate")
    List<Voyage> findByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT v FROM Voyage v WHERE v.vessel.id = :vesselId AND v.status = 'SCHEDULED' " +
           "ORDER BY v.departureTime ASC")
    List<Voyage> findUpcomingVoyages(UUID vesselId);

    Optional<Voyage> findByVesselIdAndVoyageNumber(UUID vesselId, String voyageNumber);
}
