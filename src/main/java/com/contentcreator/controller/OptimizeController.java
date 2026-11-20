package com.contentcreator.controller;

import com.contentcreator.entity.User;
import com.contentcreator.service.NlpOptimizeService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/optimize")
@RequiredArgsConstructor
public class OptimizeController {

    private final NlpOptimizeService nlp;

    private User user(Authentication auth) {
        if (auth.getPrincipal() instanceof User u) return u;
        throw new RuntimeException("Unauthenticated request");
    }

    @Data
    public static class OptimizeRequest {
        private String caption;
        private String title;
        private List<String> hashtags;
        private String niche;
    }

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyze(Authentication auth, @RequestBody OptimizeRequest req) {
        return ResponseEntity.ok(nlp.analyze(user(auth),
                req == null ? null : req.getCaption(), req == null ? null : req.getTitle(),
                req == null ? null : req.getHashtags(), req == null ? null : req.getNiche()));
    }

    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> history(Authentication auth) {
        return ResponseEntity.ok(nlp.history(user(auth)));
    }
}
