package com.contentcreator.controller;

import com.contentcreator.entity.User;
import com.contentcreator.service.HistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryController {

    private final HistoryService history;

    @GetMapping("/recent")
    public ResponseEntity<List<Map<String, Object>>> recent(
            Authentication auth, @RequestParam(defaultValue = "20") int limit) {
        User user = auth.getPrincipal() instanceof User u ? u : null;
        if (user == null) throw new RuntimeException("Unauthenticated request");
        return ResponseEntity.ok(history.recent(user, limit));
    }
}
