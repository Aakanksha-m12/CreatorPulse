package com.contentcreator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Builder
public class ContentUploadResponse {
    private Long id;
    private String originalFilename;
    private String contentType;
    private long size;
    private LocalDateTime uploadedAt;
}
