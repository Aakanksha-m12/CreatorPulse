package com.contentcreator.controller;

import com.contentcreator.dto.AnalysisResponse;
import com.contentcreator.dto.AnalyzeRequest;
import com.contentcreator.entity.ContentUpload;
import com.contentcreator.entity.User;
import com.contentcreator.repository.ContentUploadRepository;
import com.contentcreator.service.ModuleOrchestratorService;
import com.contentcreator.config.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analyze")
@RequiredArgsConstructor
public class AnalysisController {

    private final ModuleOrchestratorService orchestratorService;
    private final ContentUploadRepository uploadRepository;

    @PostMapping("/{contentId}")
    public ResponseEntity<AnalysisResponse> analyze(
            Authentication authentication,
            @PathVariable Long contentId,
            @RequestBody(required = false) AnalyzeRequest request) {

        User user = extractUser(authentication);

        ContentUpload upload = uploadRepository.findById(contentId)
                .filter(uploadEntity -> uploadEntity.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Upload not found"));

        AnalysisResponse response = orchestratorService.analyze(
                user, upload, request != null ? request.getModules() : null);

        return ResponseEntity.ok(response);
    }

    private User extractUser(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            return user;
        }
        throw new RuntimeException("Unauthenticated request");
    }
}
