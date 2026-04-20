package com.smartshipping.platform.infrastructure.feed;

import com.smartshipping.platform.domain.model.HistoricalDemand;
import com.smartshipping.platform.domain.model.Port;
import com.smartshipping.platform.domain.repository.HistoricalDemandRepository;
import com.smartshipping.platform.domain.repository.PortRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class ImfPortWatchFeed {

    private static final Logger log = LoggerFactory.getLogger(ImfPortWatchFeed.class);
    private static final String API_BASE = "https://services9.arcgis.com/weJ1QsnbMYJlCHdG/arcgis/rest/services/Daily_Ports_Data/FeatureServer/0/query";

    private final HistoricalDemandRepository demandRepository;
    private final PortRepository portRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    // IMF portId -> { ourPortCode, tradeLane, destPortCode }
    private static final List<FeedMapping> MAPPINGS = List.of(
        new FeedMapping("port1188", "CNSHA", "NLRTM", "ASIA-EUROPE"),
        new FeedMapping("port1114", "NLRTM", "USLAX", "EUROPE-AMERICAS"),
        new FeedMapping("port744",  "AEJEA", "NLRTM", "GULF-EUROPE"),
        new FeedMapping("port1188", "CNSHA", "SGSIN", "INTRA-ASIA"),
        new FeedMapping("port908",  "GRPIR", "NLRTM", "MED-NORTHEUROPE"),
        new FeedMapping("port776",  "INNSA", "AEJEA", "INDIA-GULF")
    );

    public ImfPortWatchFeed(HistoricalDemandRepository demandRepository,
                            PortRepository portRepository,
                            ObjectMapper objectMapper) {
        this.demandRepository = demandRepository;
        this.portRepository = portRepository;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newHttpClient();
    }

    @Scheduled(cron = "0 0 6 * * *") // Every day at 6 AM
    public void fetchDailyData() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        log.info("IMF PortWatch feed: fetching data for {}", yesterday);

        int inserted = 0;
        int errors = 0;

        for (FeedMapping mapping : MAPPINGS) {
            try {
                BigDecimal teuVolume = fetchExportContainer(mapping.imfPortId(), yesterday);
                if (teuVolume == null) {
                    log.warn("No data for {} on {}", mapping.imfPortId(), yesterday);
                    continue;
                }

                // Convert metric tons to TEU (approx 14 tonnes per TEU)
                teuVolume = teuVolume.divide(BigDecimal.valueOf(14), 1, RoundingMode.HALF_UP);

                Optional<Port> originPort = portRepository.findByCode(mapping.originCode());
                Optional<Port> destPort = portRepository.findByCode(mapping.destCode());

                if (originPort.isEmpty() || destPort.isEmpty()) {
                    log.warn("Port not found: {} or {}", mapping.originCode(), mapping.destCode());
                    continue;
                }

                HistoricalDemand demand = new HistoricalDemand();
                demand.setTradeLane(mapping.tradeLane());
                demand.setOriginPort(originPort.get());
                demand.setDestinationPort(destPort.get());
                demand.setCargoType("MIXED_CONTAINER");
                demand.setDate(yesterday);
                demand.setTeuVolume(teuVolume);
                demand.setRevenue(teuVolume.multiply(BigDecimal.valueOf(1500)));
                demand.setBookingCount(teuVolume.divide(BigDecimal.valueOf(20), 0, RoundingMode.HALF_UP).intValue());

                demandRepository.save(demand);
                inserted++;
                log.info("Inserted {} TEU for {} on {}", teuVolume, mapping.tradeLane(), yesterday);

            } catch (Exception e) {
                errors++;
                log.error("Failed to fetch data for {}: {}", mapping.tradeLane(), e.getMessage());
            }
        }

        log.info("IMF PortWatch feed complete: {} inserted, {} errors", inserted, errors);
    }

    private BigDecimal fetchExportContainer(String imfPortId, LocalDate date) throws Exception {
        String dateStr = date.format(DateTimeFormatter.ISO_LOCAL_DATE);
        String url = API_BASE
                + "?where=portid%3D%27" + imfPortId + "%27%20AND%20date%3D%27" + dateStr + "%27"
                + "&outFields=date,export_container"
                + "&f=json&resultRecordCount=1";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode features = root.get("features");

        if (features == null || features.isEmpty()) {
            return null;
        }

        JsonNode attrs = features.get(0).get("attributes");
        JsonNode exportContainer = attrs.get("export_container");

        if (exportContainer == null || exportContainer.isNull()) {
            return null;
        }

        return new BigDecimal(exportContainer.asText());
    }

    record FeedMapping(String imfPortId, String originCode, String destCode, String tradeLane) {}
}
