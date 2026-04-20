package com.smartshipping.platform.domain.repository;

import com.smartshipping.platform.domain.model.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    Optional<Booking> findByBookingReference(String bookingReference);

    List<Booking> findByCustomerId(UUID customerId);

    Page<Booking> findByStatus(Booking.BookingStatus status, Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.originPort.id = :portId OR b.destinationPort.id = :portId")
    List<Booking> findByPort(UUID portId);

    @Query("SELECT b FROM Booking b WHERE b.bookingDate BETWEEN :startDate AND :endDate")
    List<Booking> findByBookingDateRange(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT b FROM Booking b WHERE b.customer.id = :customerId AND b.status = :status")
    List<Booking> findByCustomerAndStatus(UUID customerId, Booking.BookingStatus status);

    @Query("SELECT SUM(b.volumeTeu) FROM Booking b WHERE b.status = :status")
    Double sumVolumeByStatus(Booking.BookingStatus status);

    @Query("SELECT b FROM Booking b JOIN FETCH b.originPort JOIN FETCH b.destinationPort WHERE b.status = :status ORDER BY b.bookingDate DESC")
    List<Booking> findByStatusWithPorts(@Param("status") Booking.BookingStatus status);
}
