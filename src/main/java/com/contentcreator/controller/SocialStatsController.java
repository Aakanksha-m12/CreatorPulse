package com.contentcreator.controller;

import com.contentcreator.entity.User;
import com.contentcreator.service.SocialStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/social")
@RequiredArgsConstructor
public class SocialStatsController {

    private final SocialStatsService socialStatsService;

    private String extractEmail(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            return user.getEmail();
        }
        return authentication.getName();
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> overview(Authentication authentication) {
        return ResponseEntity.ok(socialStatsService.overview(extractEmail(authentication)));
    }

    @GetMapping("/growth")
    public ResponseEntity<Map<String, Object>> growth(@RequestParam(defaultValue = "week") String range, Authentication authentication) {
        return ResponseEntity.ok(socialStatsService.growth(extractEmail(authentication), range));
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(Authentication authentication) {
        return ResponseEntity.ok(socialStatsService.refresh(extractEmail(authentication)));
    }

    @PostMapping("/manual")
    public ResponseEntity<Map<String, Object>> recordManual(@RequestBody Map<String, Object> body, Authentication authentication) {
        String platform = body.get("platform") == null ? "" : body.get("platform").toString();
        Long followers = body.get("followers") instanceof Number n ? n.longValue() : null;
        Long views = body.get("views") instanceof Number v ? v.longValue() : null;
        String dateStr = body.get("date") == null ? null : body.get("date").toString();
        return ResponseEntity.ok(socialStatsService.recordManual(extractEmail(authentication), platform, followers, views, dateStr));
    }

    @GetMapping("/entries")
    public ResponseEntity<List<Map<String, Object>>> listEntries(@RequestParam(defaultValue = "false") boolean manualOnly, Authentication authentication) {
        String email = extractEmail(authentication);
        if (manualOnly) {
            return ResponseEntity.ok(socialStatsService.listManualEntries(email));
        }
        return ResponseEntity.ok(socialStatsService.listEntries(email));
    }

    @PutMapping("/entries/{id}")
    public ResponseEntity<Map<String, Object>> updateEntry(@PathVariable Long id, @RequestBody Map<String, Object> body, Authentication authentication) {
        return ResponseEntity.ok(socialStatsService.updateEntry(extractEmail(authentication), id, body));
    }

    @DeleteMapping("/entries/{id}")
    public ResponseEntity<Map<String, Object>> deleteEntry(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(socialStatsService.deleteEntry(extractEmail(authentication), id));
    }
}
