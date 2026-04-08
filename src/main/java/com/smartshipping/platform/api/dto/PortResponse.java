package com.smartshipping.platform.api.dto;

import java.math.BigDecimal;

public record PortResponse(String code, String name, String country, BigDecimal latitude, BigDecimal longitude) {}
