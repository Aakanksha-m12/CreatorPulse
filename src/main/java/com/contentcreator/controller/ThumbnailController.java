package com.contentcreator.controller;

import com.contentcreator.entity.User;
import com.contentcreator.service.ThumbnailScoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/thumbnails")
@RequiredArgsConstructor
public class ThumbnailController {

    private final ThumbnailScoreService scoreService;

    private User user(Authentication auth) {
        if (auth.getPrincipal() instanceof User u) return u;
        throw new RuntimeException("Unauthenticated request");
    }

    @PostMapping("/score")
    public ResponseEntity<Map<String, Object>> score(
            Authentication auth, @RequestParam("files") List<MultipartFile> files) {
        return ResponseEntity.ok(scoreService.scoreMany(user(auth), files));
    }

    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> history(Authentication auth) {
        return ResponseEntity.ok(scoreService.history(user(auth)));
    }
}
