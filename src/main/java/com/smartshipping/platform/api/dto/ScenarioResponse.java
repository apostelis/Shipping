package com.smartshipping.platform.api.dto;

import java.util.List;

public record ScenarioResponse(String id, String name, String description, List<String> disabledLanes, List<String> disabledPorts) {}
