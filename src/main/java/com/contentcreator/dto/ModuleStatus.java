package com.contentcreator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class ModuleStatus {
    private String name;
    private String baseUrl;
    private String analyzePath;
    private String status;
    private long latencyMs;
    private String detail;
}
