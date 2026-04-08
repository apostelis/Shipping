package com.smartshipping.platform.domain.repository;

import com.smartshipping.platform.domain.model.HistoricalDemand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HistoricalDemandRepository extends JpaRepository<HistoricalDemand, Long> {

    @Query("SELECT h FROM HistoricalDemand h WHERE h.tradeLane = :tradeLane ORDER BY h.date ASC")
    List<HistoricalDemand> findByTradeLane(String tradeLane);

    @Query("SELECT h FROM HistoricalDemand h WHERE h.originPort.code = :originCode " +
           "AND h.destinationPort.code = :destCode ORDER BY h.date ASC")
    List<HistoricalDemand> findByPortPair(String originCode, String destCode);

    @Query("SELECT h FROM HistoricalDemand h WHERE h.date BETWEEN :startDate AND :endDate")
    List<HistoricalDemand> findByDateRange(LocalDate startDate, LocalDate endDate);

    @Query("SELECT DISTINCT h.tradeLane FROM HistoricalDemand h")
    List<String> findAllTradeLanes();
}
