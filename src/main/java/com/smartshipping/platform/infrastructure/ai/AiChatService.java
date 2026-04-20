package com.smartshipping.platform.infrastructure.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.smartshipping.platform.domain.repository.HistoricalDemandRepository;
import com.smartshipping.platform.domain.repository.PortRepository;
import com.smartshipping.platform.domain.repository.ShippingLaneRepository;
import com.smartshipping.platform.optimization.service.RouteOptimizationService;
import com.smartshipping.platform.optimization.model.OptimizationCriteria;
import com.smartshipping.platform.optimization.model.OptimalRoute;
import com.smartshipping.platform.forecasting.service.ForecastingService;
import com.smartshipping.platform.forecasting.model.ForecastResult;
import com.smartshipping.platform.forecasting.model.ForecastingParameters;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Service
public class AiChatService {

    private static final Logger log = LoggerFactory.getLogger(AiChatService.class);

    private final HistoricalDemandRepository demandRepository;
    private final PortRepository portRepository;
    private final ShippingLaneRepository laneRepository;
    private final RouteOptimizationService routeService;
    private final ForecastingService forecastingService;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private static final String CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

    public AiChatService(
            HistoricalDemandRepository demandRepository,
            PortRepository portRepository,
            ShippingLaneRepository laneRepository,
            RouteOptimizationService routeService,
            ForecastingService forecastingService,
            ObjectMapper objectMapper,
            @Value("${app.anthropic.api-key:}") String apiKey) {
        this.demandRepository = demandRepository;
        this.portRepository = portRepository;
        this.laneRepository = laneRepository;
        this.routeService = routeService;
        this.forecastingService = forecastingService;
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
    }

    public String chat(String userMessage) {
        if (apiKey == null || apiKey.isBlank()) {
            return "AI chat is not configured. Set the ANTHROPIC_API_KEY environment variable.";
        }

        try {
            ArrayNode messages = objectMapper.createArrayNode();
            ObjectNode userMsgContent = objectMapper.createObjectNode();
            userMsgContent.put("type", "text");
            userMsgContent.put("text", userMessage);

            ArrayNode userContentArray = objectMapper.createArrayNode();
            userContentArray.add(userMsgContent);

            ObjectNode userMsgNode = objectMapper.createObjectNode();
            userMsgNode.put("role", "user");
            userMsgNode.set("content", userContentArray);
            messages.add(userMsgNode);

            // Tool use loop
            for (int i = 0; i < 5; i++) {
                ObjectNode requestBody = buildRequest(messages);
                String responseJson = callClaude(requestBody);
                JsonNode response = objectMapper.readTree(responseJson);

                JsonNode content = response.get("content");
                boolean hasToolUse = false;
                StringBuilder textParts = new StringBuilder();
                ArrayNode toolResults = objectMapper.createArrayNode();

                // Add assistant message
                ObjectNode assistantMsg = objectMapper.createObjectNode();
                assistantMsg.put("role", "assistant");
                assistantMsg.set("content", content);
                messages.add(assistantMsg);

                for (JsonNode block : content) {
                    if ("text".equals(block.get("type").asText())) {
                        textParts.append(block.get("text").asText());
                    } else if ("tool_use".equals(block.get("type").asText())) {
                        hasToolUse = true;
                        String toolName = block.get("name").asText();
                        String toolInput = block.get("input").toString();
                        String toolId = block.get("id").asText();
                        String result = executeToolCall(toolName, toolInput);

                        ObjectNode toolResult = objectMapper.createObjectNode();
                        toolResult.put("type", "tool_result");
                        toolResult.put("tool_use_id", toolId);
                        toolResult.put("content", result);
                        toolResults.add(toolResult);
                    }
                }

                if (!hasToolUse) {
                    return textParts.toString();
                }

                // Add tool results as user message
                ObjectNode toolResultMsg = objectMapper.createObjectNode();
                toolResultMsg.put("role", "user");
                toolResultMsg.set("content", toolResults);
                messages.add(toolResultMsg);
            }

            return "I wasn't able to complete the analysis.";

        } catch (Exception e) {
            log.error("AI chat error", e);
            return "Sorry, I encountered an error: " + e.getMessage();
        }
    }

    private ObjectNode buildRequest(ArrayNode messages) {
        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", "claude-sonnet-4-20250514");
        body.put("max_tokens", 1024);
        body.put("system", buildSystemPrompt());
        body.set("messages", messages);
        body.set("tools", buildToolsJson());
        return body;
    }

    private String callClaude(ObjectNode requestBody) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(CLAUDE_API_URL))
                .header("Content-Type", "application/json")
                .header("x-api-key", apiKey)
                .header("anthropic-version", "2023-06-01")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Claude API error " + response.statusCode() + ": " + response.body());
        }

        return response.body();
    }

    private String executeToolCall(String toolName, String inputJson) {
        try {
            var input = objectMapper.readTree(inputJson);

            return switch (toolName) {
                case "get_trade_lanes" -> {
                    var lanes = demandRepository.findAllTradeLanes();
                    yield objectMapper.writeValueAsString(lanes);
                }
                case "get_demand_data" -> {
                    String tradeLane = input.get("trade_lane").asText();
                    var data = demandRepository.findByTradeLane(tradeLane);
                    int start = Math.max(0, data.size() - 30);
                    var recent = data.subList(start, data.size()).stream()
                            .map(d -> Map.of(
                                    "date", d.getDate().toString(),
                                    "teu", d.getTeuVolume().toString(),
                                    "revenue", d.getRevenue() != null ? d.getRevenue().toString() : "0"
                            ))
                            .toList();
                    yield objectMapper.writeValueAsString(Map.of(
                            "trade_lane", tradeLane,
                            "days", recent.size(),
                            "data", recent
                    ));
                }
                case "optimize_route" -> {
                    String origin = input.get("origin_port").asText();
                    String dest = input.get("destination_port").asText();
                    String objective = input.has("objective") ? input.get("objective").asText() : "BALANCED";

                    OptimizationCriteria criteria = OptimizationCriteria.builder()
                            .originPortCode(origin)
                            .destinationPortCode(dest)
                            .objectiveType(OptimizationCriteria.ObjectiveType.valueOf(objective))
                            .maxStops(5)
                            .build();

                    OptimalRoute route = routeService.findOptimalRoute(criteria);
                    yield objectMapper.writeValueAsString(Map.of(
                            "origin", origin,
                            "destination", dest,
                            "segments", route.getSegments() != null ? route.getSegments().stream()
                                    .map(s -> s.getOriginPortCode() + " -> " + s.getDestinationPortCode())
                                    .toList() : List.of(),
                            "total_distance_nm", route.getTotalDistanceNm(),
                            "total_time_hours", route.getTotalTimeHours(),
                            "total_cost_usd", route.getTotalCost()
                    ));
                }
                case "get_forecast" -> {
                    String tradeLane = input.get("trade_lane").asText();
                    int horizon = input.has("horizon") ? input.get("horizon").asInt() : 30;

                    ForecastingParameters params = ForecastingParameters.builder()
                            .tradeLane(tradeLane)
                            .forecastHorizon(horizon)
                            .granularity("DAILY")
                            .confidenceLevel(new BigDecimal("1.96"))
                            .algorithm("SIMPLE_MOVING_AVERAGE")
                            .build();

                    ForecastResult result = forecastingService.generateForecast(tradeLane, "MIXED_CONTAINER", params);
                    yield objectMapper.writeValueAsString(Map.of(
                            "trade_lane", tradeLane,
                            "algorithm", result.getAlgorithm(),
                            "predicted_avg_teu", result.getPredictedValue(),
                            "confidence_lower", result.getConfidenceLower(),
                            "confidence_upper", result.getConfidenceUpper(),
                            "forecast_points", result.getForecastPoints() != null ? result.getForecastPoints().size() : 0
                    ));
                }
                case "list_ports" -> {
                    var ports = portRepository.findAll().stream()
                            .map(p -> Map.of("code", p.getCode(), "name", p.getName(), "country", p.getCountry()))
                            .toList();
                    yield objectMapper.writeValueAsString(ports);
                }
                default -> "{\"error\": \"Unknown tool: " + toolName + "\"}";
            };
        } catch (Exception e) {
            log.error("Tool execution error for {}: {}", toolName, e.getMessage());
            return "{\"error\": \"" + e.getMessage().replace("\"", "'") + "\"}";
        }
    }

    private String buildSystemPrompt() {
        return """
                You are the AI assistant for SmartShipping Intelligence Platform — a shipping operations tool \
                that optimizes routes and forecasts demand.

                You have access to tools that query real shipping data:
                - get_trade_lanes: Lists available trade lanes
                - get_demand_data: Gets historical demand for a trade lane (returns last 30 days)
                - optimize_route: Finds the optimal route between two ports
                - get_forecast: Generates a demand forecast for a trade lane
                - list_ports: Lists all ports in the system

                Available port codes: CNSHA (Shanghai), NLRTM (Rotterdam), SGSIN (Singapore), GRPIR (Piraeus), \
                DEHAM (Hamburg), ESVLC (Valencia), SAJED (Jeddah), AEJEA (Dubai), INNSA (Mumbai), \
                USLAX (Los Angeles), BRSSZ (Santos), ESALG (Algeciras), MAPTM (Tangier Med), \
                LKCMB (Colombo), ZACPT (Cape Town)

                When answering:
                - Use the tools to get real data, don't make up numbers
                - Be concise and business-focused
                - Format currency as dollars, volumes as TEU
                - When comparing routes, highlight cost and time savings
                - When discussing forecasts, mention confidence levels and trends
                """;
    }

    private ArrayNode buildToolsJson() {
        ArrayNode tools = objectMapper.createArrayNode();

        tools.add(buildToolJson("get_trade_lanes",
                "Get all available trade lanes in the system",
                objectMapper.createObjectNode()));

        ObjectNode demandProps = objectMapper.createObjectNode();
        ObjectNode tradeLaneProp = objectMapper.createObjectNode();
        tradeLaneProp.put("type", "string");
        tradeLaneProp.put("description", "Trade lane name, e.g. ASIA-EUROPE, GULF-EUROPE, INTRA-ASIA, MED-NORTHEUROPE, EUROPE-AMERICAS, INDIA-GULF");
        demandProps.set("trade_lane", tradeLaneProp);
        tools.add(buildToolJson("get_demand_data",
                "Get the last 30 days of historical demand data for a specific trade lane",
                demandProps, "trade_lane"));

        ObjectNode routeProps = objectMapper.createObjectNode();
        ObjectNode originProp = objectMapper.createObjectNode();
        originProp.put("type", "string");
        originProp.put("description", "Origin port code, e.g. CNSHA, NLRTM");
        routeProps.set("origin_port", originProp);
        ObjectNode destProp = objectMapper.createObjectNode();
        destProp.put("type", "string");
        destProp.put("description", "Destination port code");
        routeProps.set("destination_port", destProp);
        ObjectNode objProp = objectMapper.createObjectNode();
        objProp.put("type", "string");
        ArrayNode enumVals = objectMapper.createArrayNode();
        enumVals.add("COST");
        enumVals.add("TIME");
        enumVals.add("DISTANCE");
        enumVals.add("BALANCED");
        objProp.set("enum", enumVals);
        objProp.put("description", "Optimization objective");
        routeProps.set("objective", objProp);
        tools.add(buildToolJson("optimize_route",
                "Find the optimal shipping route between two ports",
                routeProps, "origin_port", "destination_port"));

        ObjectNode forecastProps = objectMapper.createObjectNode();
        ObjectNode fTradeLane = objectMapper.createObjectNode();
        fTradeLane.put("type", "string");
        fTradeLane.put("description", "Trade lane name");
        forecastProps.set("trade_lane", fTradeLane);
        ObjectNode horizonProp = objectMapper.createObjectNode();
        horizonProp.put("type", "integer");
        horizonProp.put("description", "Number of days to forecast (default 30)");
        forecastProps.set("horizon", horizonProp);
        tools.add(buildToolJson("get_forecast",
                "Generate a demand forecast for a trade lane",
                forecastProps, "trade_lane"));

        tools.add(buildToolJson("list_ports",
                "List all ports in the system with codes, names, and countries",
                objectMapper.createObjectNode()));

        return tools;
    }

    private ObjectNode buildToolJson(String name, String description, ObjectNode properties, String... required) {
        ObjectNode tool = objectMapper.createObjectNode();
        tool.put("name", name);
        tool.put("description", description);

        ObjectNode inputSchema = objectMapper.createObjectNode();
        inputSchema.put("type", "object");
        inputSchema.set("properties", properties);

        ArrayNode requiredArray = objectMapper.createArrayNode();
        for (String r : required) {
            requiredArray.add(r);
        }
        inputSchema.set("required", requiredArray);

        tool.set("input_schema", inputSchema);
        return tool;
    }
}
