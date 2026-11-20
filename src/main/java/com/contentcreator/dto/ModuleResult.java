package com.contentcreator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class ModuleResult {
    private String module;
    private String status;
    private Object data;
    private String error;
}
