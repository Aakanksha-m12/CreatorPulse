package com.contentcreator.controller;

import com.contentcreator.dto.ContentUploadResponse;
import com.contentcreator.entity.ContentUpload;
import com.contentcreator.entity.User;
import com.contentcreator.repository.ContentUploadRepository;
import com.contentcreator.service.ContentStorageService;
import com.contentcreator.config.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
public class ContentUploadController {

    private final ContentStorageService storageService;
    private final ContentUploadRepository uploadRepository;

    private User extractUser(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            return user;
        }
        throw new RuntimeException("Unauthenticated request");
    }

    @PostMapping("/upload")
    public ResponseEntity<ContentUploadResponse> upload(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {

        ContentUpload upload = storageService.store(file, extractUser(authentication));

        return ResponseEntity.ok(toResponse(upload));
    }

    @GetMapping
    public ResponseEntity<List<ContentUploadResponse>> listUploads(Authentication authentication) {
        User user = extractUser(authentication);
        List<ContentUploadResponse> uploads = uploadRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(uploads);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(Authentication authentication, @PathVariable Long id) {
        ContentUpload upload = getOwnedUpload(authentication, id);
        Resource resource = storageService.loadAsResource(upload);

        String contentType = upload.getContentType() != null ? upload.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + upload.getOriginalFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUpload(Authentication authentication, @PathVariable Long id) {
        ContentUpload upload = getOwnedUpload(authentication, id);
        storageService.delete(upload);
        return ResponseEntity.noContent().build();
    }

    private ContentUpload getOwnedUpload(Authentication authentication, Long id) {
        User user = extractUser(authentication);
        return uploadRepository.findById(id)
                .filter(upload -> upload.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Upload not found"));
    }

    private ContentUploadResponse toResponse(ContentUpload upload) {
        return ContentUploadResponse.builder()
                .id(upload.getId())
                .originalFilename(upload.getOriginalFilename())
                .contentType(upload.getContentType())
                .size(upload.getSize())
                .uploadedAt(upload.getCreatedAt())
                .build();
    }
}
