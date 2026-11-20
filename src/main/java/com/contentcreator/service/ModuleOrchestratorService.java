package com.contentcreator.service;

import com.contentcreator.config.ModuleProperties;
import com.contentcreator.dto.AnalysisResponse;
import com.contentcreator.dto.ModuleResult;
import com.contentcreator.entity.ContentUpload;
import com.contentcreator.entity.CreatorProfile;
import com.contentcreator.entity.User;
import com.contentcreator.repository.CreatorProfileRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ModuleOrchestratorService {

    private static final Logger log = LoggerFactory.getLogger(ModuleOrchestratorService.class);

    private final RestClient.Builder restClientBuilder;
    private final ModuleProperties moduleProperties;
    private final CreatorProfileRepository profileRepository;
    private final ObjectMapper objectMapper;

    public AnalysisResponse analyze(User user, ContentUpload upload, Set<String> requestedModules) {
        List<ModuleResult> results = new ArrayList<>();

        for (ModuleProperties.Module module : selectModules(requestedModules)) {
            results.add(callModule(user, upload, module));
        }

        String overallStatus = computeOverallStatus(results);

        return AnalysisResponse.builder()
                .contentId(upload.getId())
                .fileName(upload.getOriginalFilename())
                .submittedAt(LocalDateTime.now())
                .overallStatus(overallStatus)
                .modules(results)
                .build();
    }

    private List<ModuleProperties.Module> selectModules(Set<String> requestedModules) {
        List<ModuleProperties.Module> configured = moduleProperties.getModules();
        if (requestedModules == null || requestedModules.isEmpty()) {
            return configured;
        }
        Set<String> normalized = requestedModules.stream()
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
        return configured.stream()
                .filter(module -> normalized.contains(module.getName().toLowerCase()))
                .collect(Collectors.toList());
    }

    private ModuleResult callModule(User user, ContentUpload upload, ModuleProperties.Module module) {
        String url = module.getBaseUrl() + module.getPath();
        try {
            MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
            parts.add("file", new FileSystemResource(Paths.get(upload.getStoredPath())));
            parts.add("metadata", new ByteArrayResource(
                    buildMetadata(user, upload).getBytes(StandardCharsets.UTF_8)));

            RestClient restClient = restClientBuilder.build();

            ResponseEntity<String> response = restClient.post()
                    .uri(url)
                    .body(parts)
                    .retrieve()
                    .toEntity(String.class);

            Object data = parseBody(response.getBody());
            log.info("Module '{}' at {} responded with status {}", module.getName(), url, response.getStatusCode());

            return ModuleResult.builder()
                    .module(module.getName())
                    .status("success")
                    .data(data)
                    .build();
        } catch (Exception ex) {
            log.warn("Module '{}' at {} unavailable: {}", module.getName(), url, ex.getMessage());
            return ModuleResult.builder()
                    .module(module.getName())
                    .status("unavailable")
                    .error(ex.getMessage())
                    .build();
        }
    }

    private Object parseBody(String body) {
        if (body == null || body.isBlank()) {
            return Map.of();
        }
        try {
            JsonNode node = objectMapper.readTree(body);
            return objectMapper.convertValue(node, Object.class);
        } catch (Exception ex) {
            return body;
        }
    }

    private String buildMetadata(User user, ContentUpload upload) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("contentId", upload.getId());
        metadata.put("fileName", upload.getOriginalFilename());
        metadata.put("contentType", upload.getContentType());
        metadata.put("size", upload.getSize());

        CreatorProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        if (profile != null) {
            Map<String, Object> profileMap = new HashMap<>();
            profileMap.put("niche", profile.getNiche());
            profileMap.put("platformFocus", profile.getPlatformFocus());
            profileMap.put("goals", profile.getGoals());
            profileMap.put("contentStyle", profile.getContentStyle());
            metadata.put("profile", profileMap);
        }

        try {
            return objectMapper.writeValueAsString(metadata);
        } catch (Exception ex) {
            return "{}";
        }
    }

    private String computeOverallStatus(List<ModuleResult> results) {
        if (results.isEmpty()) {
            return "no_modules_configured";
        }
        long successCount = results.stream().filter(r -> "success".equals(r.getStatus())).count();
        if (successCount == results.size()) {
            return "success";
        }
        if (successCount > 0) {
            return "partial";
        }
        return "unavailable";
    }
}
