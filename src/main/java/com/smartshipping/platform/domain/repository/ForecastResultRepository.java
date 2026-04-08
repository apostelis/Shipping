package com.smartshipping.platform.domain.repository;

import com.smartshipping.platform.domain.model.ForecastResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ForecastResultRepository extends JpaRepository<ForecastResult, Long> {

    List<ForecastResult> findByTradeLane(String tradeLane);

    List<ForecastResult> findByGranularity(String granularity);

    List<ForecastResult> findByForecastDate(LocalDate forecastDate);

    List<ForecastResult> findByAlgorithm(String algorithm);

    List<ForecastResult> findByTradeLaneAndGranularity(String tradeLane, String granularity);

    List<ForecastResult> findByTradeLaneAndForecastDateGreaterThanEqual(
            String tradeLane, LocalDate startDate);
}
