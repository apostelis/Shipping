package com.smartshipping.platform.common.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleNotFound_returns404WithMessage() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Port not found");
        ResponseEntity<ErrorResponse> response = handler.handleNotFound(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals(404, response.getBody().status());
        assertEquals("Port not found", response.getBody().message());
        assertNotNull(response.getBody().timestamp());
    }

    @Test
    void handleBadRequest_returns400WithMessage() {
        IllegalArgumentException ex = new IllegalArgumentException("Invalid port code");
        ResponseEntity<ErrorResponse> response = handler.handleBadRequest(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals(400, response.getBody().status());
        assertEquals("Invalid port code", response.getBody().message());
    }

    @Test
    void handleGeneral_returns500WithGenericMessage() {
        Exception ex = new RuntimeException("unexpected");
        ResponseEntity<ErrorResponse> response = handler.handleGeneral(ex);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals(500, response.getBody().status());
        assertEquals("Internal server error", response.getBody().message());
    }
}
