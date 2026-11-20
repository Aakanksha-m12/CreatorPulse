package com.contentcreator.controller;

import com.contentcreator.entity.SavedPlan;
import com.contentcreator.entity.User;
import com.contentcreator.repository.SavedPlanRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** The creator's notebook: future video titles + when to post them. */
@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class PlanController {

    private final SavedPlanRepository planRepo;

    private User user(Authentication auth) {
        if (auth.getPrincipal() instanceof User u) return u;
        throw new RuntimeException("Unauthenticated request");
    }

    @Data
    public static class PlanRequest {
        private String title;
        private String platform;
        private String date;
        private String time;
        private String note;
        private String status;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list(Authentication auth) {
        User u = user(auth);
        return ResponseEntity.ok(planRepo.findByUserOrderByPlannedForAscCreatedAtDesc(u)
                .stream().map(this::toMap).toList());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(Authentication auth, @RequestBody PlanRequest req) {
        User u = user(auth);
        if (req == null || req.getTitle() == null || req.getTitle().isBlank()) {
            throw new RuntimeException("Give your future post a title first");
        }
        if (req.getTitle().trim().length() > 120) {
            throw new RuntimeException("Plan title must be under 120 characters");
        }
        SavedPlan p = SavedPlan.builder()
                .user(u)
                .title(req.getTitle().trim())
                .platform(normalizePlatform(req.getPlatform()))
                .plannedFor(parseWhen(req.getDate(), req.getTime()))
                .note(req.getNote() == null ? "" : req.getNote().trim())
                .status(SavedPlan.STATUS_PLANNED)
                .build();
        return ResponseEntity.ok(toMap(planRepo.save(p)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
            Authentication auth, @PathVariable Long id, @RequestBody PlanRequest req) {
        SavedPlan p = owned(user(auth), id);
        if (req.getTitle() != null && !req.getTitle().isBlank()) p.setTitle(req.getTitle().trim());
        if (req.getPlatform() != null) p.setPlatform(normalizePlatform(req.getPlatform()));
        if (req.getDate() != null || req.getTime() != null) {
            LocalDateTime w = parseWhen(req.getDate(), req.getTime());
            if (w != null) p.setPlannedFor(w);
        }
        if (req.getNote() != null) p.setNote(req.getNote().trim());
        if (req.getStatus() != null) {
            String s = req.getStatus().trim().toUpperCase();
            if (!SavedPlan.STATUS_PLANNED.equals(s) && !SavedPlan.STATUS_DONE.equals(s)) {
                throw new RuntimeException("Status must be PLANNED or DONE");
            }
            p.setStatus(s);
        }
        return ResponseEntity.ok(toMap(planRepo.save(p)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication auth, @PathVariable Long id) {
        planRepo.delete(owned(user(auth), id));
        return ResponseEntity.noContent().build();
    }

    private SavedPlan owned(User u, Long id) {
        return planRepo.findById(id)
                .filter(p -> p.getUser().getId().equals(u.getId()))
                .orElseThrow(() -> new RuntimeException("Saved plan not found"));
    }

    private String normalizePlatform(String p) {
        if (p != null && p.toLowerCase().contains("insta")) return "Instagram";
        return "YouTube";
    }

    private LocalDateTime parseWhen(String date, String time) {
        try {
            LocalDate d = (date == null || date.isBlank()) ? LocalDate.now().plusDays(1) : LocalDate.parse(date);
            LocalTime t = (time == null || time.isBlank()) ? LocalTime.of(19, 0) : LocalTime.parse(time);
            return LocalDateTime.of(d, t);
        } catch (Exception ex) {
            throw new RuntimeException("Date must be YYYY-MM-DD and time HH:MM");
        }
    }

    private Map<String, Object> toMap(SavedPlan p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", p.getId());
        m.put("title", p.getTitle());
        m.put("platform", p.getPlatform());
        m.put("plannedFor", p.getPlannedFor() == null ? null : p.getPlannedFor().toString());
        m.put("note", p.getNote());
        m.put("status", p.getStatus());
        return m;
    }
}
