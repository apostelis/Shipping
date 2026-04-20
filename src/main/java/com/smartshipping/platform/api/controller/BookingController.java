package com.smartshipping.platform.api.controller;

import com.smartshipping.platform.domain.model.Booking;
import com.smartshipping.platform.domain.repository.BookingRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/bookings")
@Tag(name = "Bookings", description = "Shipping bookings")
public class BookingController {

    private final BookingRepository bookingRepository;

    public BookingController(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @GetMapping
    @Operation(summary = "List bookings", description = "Get all bookings with routing info")
    public ResponseEntity<List<Map<String, Object>>> listBookings(
            @RequestParam(defaultValue = "PENDING") String status) {

        List<Booking> bookings = bookingRepository.findByStatusWithPorts(
                Booking.BookingStatus.valueOf(status));

        List<Map<String, Object>> result = bookings.stream()
                .map(b -> Map.<String, Object>of(
                        "id", b.getId().toString(),
                        "reference", b.getBookingReference(),
                        "originCode", b.getOriginPort().getCode(),
                        "originName", b.getOriginPort().getName(),
                        "destinationCode", b.getDestinationPort().getCode(),
                        "destinationName", b.getDestinationPort().getName(),
                        "cargoType", b.getCargoType(),
                        "volumeTeu", b.getVolumeTeu(),
                        "status", b.getStatus().name()
                ))
                .toList();

        return ResponseEntity.ok(result);
    }
}
