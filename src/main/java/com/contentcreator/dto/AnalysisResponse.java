package com.contentcreator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@Builder
public class AnalysisResponse {
    private Long contentId;
    private String fileName;
    private LocalDateTime submittedAt;
    private String overallStatus;
    private List<ModuleResult> modules;
}
