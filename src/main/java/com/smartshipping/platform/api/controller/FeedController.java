package com.smartshipping.platform.api.controller;

import com.smartshipping.platform.infrastructure.feed.ImfPortWatchFeed;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/feed")
@Tag(name = "Data Feed", description = "IMF PortWatch data feed management")
public class FeedController {

    private final ImfPortWatchFeed feed;

    public FeedController(ImfPortWatchFeed feed) {
        this.feed = feed;
    }

    @PostMapping("/refresh")
    @Operation(summary = "Trigger data refresh", description = "Manually trigger IMF PortWatch data fetch for yesterday")
    public ResponseEntity<Map<String, String>> triggerRefresh() {
        feed.fetchDailyData();
        return ResponseEntity.ok(Map.of("status", "completed", "message", "Daily data fetch triggered"));
    }
}
