package com.contentcreator.controller;

import com.contentcreator.entity.User;
import com.contentcreator.service.PostingTimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/posting-times")
@RequiredArgsConstructor
public class PostingTimeController {

    private final PostingTimeService service;

    private User user(Authentication auth) {
        if (auth.getPrincipal() instanceof User u) return u;
        throw new RuntimeException("Unauthenticated request");
    }

    @GetMapping("/personal")
    public ResponseEntity<Map<String, Object>> personal(Authentication auth) {
        return ResponseEntity.ok(service.personal(user(auth)));
    }

    @GetMapping("/schedule")
    public ResponseEntity<Map<String, Object>> schedule(
            Authentication auth,
            @RequestParam(required = false) String platform,
            @RequestParam(required = false) String niche) {
        user(auth);
        return ResponseEntity.ok(service.schedule(platform, niche));
    }
}
