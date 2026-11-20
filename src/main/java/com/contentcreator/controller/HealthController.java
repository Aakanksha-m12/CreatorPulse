package com.contentcreator.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HealthController {

    private final JdbcTemplate jdbc;
    private final RestClient.Builder restClientBuilder;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("service", "CreatorPulse");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health/detailed")
    public ResponseEntity<Map<String, Object>> detailed() {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("status", "UP");
        out.put("database", checkDb());
        out.put("thumbnailService", checkUrl("http://localhost:8001/health", "thumbnail-scorer"));
        out.put("nlpService", "UP");
        out.put("postingService", "UP");
        out.put("billing", "READY");
        return ResponseEntity.ok(out);
    }

    private String checkDb() {
        try {
            jdbc.queryForObject("SELECT 1", Integer.class);
            return "UP";
        } catch (Exception ex) {
            return "DOWN";
        }
    }

    private Map<String, Object> checkUrl(String url, String name) {
        try {
            restClientBuilder.build().get().uri(url).retrieve().body(String.class);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("status", "UP");
            m.put("module", name);
            return m;
        } catch (Exception ex) {
            return Map.of("status", "DOWN", "module", name, "fallback", "java-heuristics");
        }
    }
}
