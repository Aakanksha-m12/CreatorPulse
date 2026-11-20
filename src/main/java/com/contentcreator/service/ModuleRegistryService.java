package com.contentcreator.service;

import com.contentcreator.config.ModuleProperties;
import com.contentcreator.dto.ModuleStatus;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ModuleRegistryService {

    private static final Logger log = LoggerFactory.getLogger(ModuleRegistryService.class);

    private final RestClient.Builder restClientBuilder;
    private final ModuleProperties moduleProperties;

    public List<ModuleStatus> status() {
        return moduleProperties.getModules().stream()
                .map(this::probe)
                .collect(Collectors.toList());
    }

    private ModuleStatus probe(ModuleProperties.Module module) {
        String url = module.getBaseUrl() + module.getHealthPath();
        long start = System.currentTimeMillis();
        try {
            RestClient restClient = restClientBuilder.build();
            ResponseEntity<Void> response = restClient.get()
                    .uri(url)
                    .retrieve()
                    .toBodilessEntity();
            long latency = System.currentTimeMillis() - start;
            return toStatus(module, "up", latency, "HTTP " + response.getStatusCode().value());
        } catch (Exception ex) {
            long latency = System.currentTimeMillis() - start;
            log.warn("Module '{}' health check at {} failed: {}", module.getName(), url, ex.getMessage());
            return toStatus(module, "down", latency, ex.getMessage());
        }
    }

    private ModuleStatus toStatus(ModuleProperties.Module module, String status, long latency, String detail) {
        return ModuleStatus.builder()
                .name(module.getName())
                .baseUrl(module.getBaseUrl())
                .analyzePath(module.getPath())
                .status(status)
                .latencyMs(latency)
                .detail(detail)
                .build();
    }
}
