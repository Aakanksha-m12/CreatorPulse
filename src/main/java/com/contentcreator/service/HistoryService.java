package com.contentcreator.service;

import com.contentcreator.entity.AnalysisRecord;
import com.contentcreator.entity.ContentUpload;
import com.contentcreator.entity.User;
import com.contentcreator.repository.AnalysisRecordRepository;
import com.contentcreator.repository.ContentUploadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

/** Unified Recent Activity: analyses + uploads, newest first. Feeds dashboard + history. */
@Service
@RequiredArgsConstructor
public class HistoryService {

    private final AnalysisRecordRepository analysisRepo;
    private final ContentUploadRepository uploadRepo;

    public List<Map<String, Object>> recent(User user, int limit) {
        int lim = Math.max(1, Math.min(50, limit));
        List<Map<String, Object>> items = new ArrayList<>();
        for (AnalysisRecord a : analysisRepo.findTop20ByUserOrderByCreatedAtDesc(user)) {
            items.add(Map.of("kind", a.getType(), "title", label(a),
                    "score", a.getScore() == null ? 0 : a.getScore(),
                    "createdAt", String.valueOf(a.getCreatedAt()), "source", "analysis", "id", a.getId()));
        }
        for (ContentUpload c : uploadRepo.findByUserOrderByCreatedAtDesc(user)) {
            items.add(Map.of("kind", "UPLOAD", "title", c.getOriginalFilename(),
                    "score", 0, "createdAt", String.valueOf(c.getCreatedAt()),
                    "source", "upload", "id", c.getId()));
            if (items.size() >= lim + 20) break;
        }
        items.sort((a, b) -> String.valueOf(b.get("createdAt")).compareTo(String.valueOf(a.get("createdAt"))));
        return items.stream().limit(lim).toList();
    }

    private String label(AnalysisRecord a) {
        String s = a.getInputSummary() == null || a.getInputSummary().isBlank() ? a.getType().toLowerCase() : a.getInputSummary();
        return switch (a.getType()) {
            case AnalysisRecord.TYPE_THUMBNAIL -> "Thumbnail scored: " + s;
            case AnalysisRecord.TYPE_COMBINED -> "Caption + hashtags: " + s;
            default -> a.getType().toLowerCase() + ": " + s;
        };
    }
}
