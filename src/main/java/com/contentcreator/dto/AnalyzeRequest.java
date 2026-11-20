package com.contentcreator.dto;

import lombok.Data;
import java.util.Set;

@Data
public class AnalyzeRequest {
    private Set<String> modules;
}
