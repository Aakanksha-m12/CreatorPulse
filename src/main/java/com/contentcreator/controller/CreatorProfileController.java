package com.contentcreator.controller;

import com.contentcreator.dto.CreatorProfileRequest;
import com.contentcreator.dto.MessageResponse;
import com.contentcreator.entity.CreatorProfile;
import com.contentcreator.entity.User;
import com.contentcreator.service.CreatorProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class CreatorProfileController {

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    private final CreatorProfileService profileService;

    private String extractEmail(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            return user.getEmail();
        }
        return authentication.getName();
    }

    private User extractUser(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            return user;
        }
        throw new RuntimeException("Unauthenticated request");
    }

    @PostMapping
    public ResponseEntity<MessageResponse> createOrUpdateProfile(
            Authentication authentication,
            @RequestBody CreatorProfileRequest request) {

        profileService.createOrUpdateProfile(extractEmail(authentication), request);

        return ResponseEntity.ok(MessageResponse.builder()
                .message("Profile saved successfully")
                .success(true)
                .build());
    }

    @PostMapping(value = "/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)    public ResponseEntity<Map<String, Object>> uploadPhoto(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("No photo provided. Attach a file in the 'file' form field.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !(contentType.equals("image/jpeg") || contentType.equals("image/png"))) {
            throw new RuntimeException("Only JPG or PNG photos are allowed");
        }
        if (file.getSize() > 2 * 1024 * 1024) {
            throw new RuntimeException("Photo must be under 2MB");
        }

        User user = extractUser(authentication);
        String extension = contentType.equals("image/png") ? "png" : "jpg";
        String storedName = UUID.randomUUID() + "-photo." + extension;

        try {
            Path dir = Paths.get(uploadDir).resolve("profile-photos").resolve(String.valueOf(user.getId()))
                    .toAbsolutePath().normalize();
            Files.createDirectories(dir);
            Path target = dir.resolve(storedName).normalize();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store photo: " + ex.getMessage());
        }

        String photoUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/profile-photos/" + user.getId() + "/" + storedName)
                .toUriString();

        profileService.saveProfilePhoto(extractEmail(authentication), photoUrl);

        Map<String, Object> response = new HashMap<>();
        response.put("url", photoUrl);
        response.put("message", "Photo uploaded successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/goals")
    public ResponseEntity<Map<String, Object>> saveGoals(@RequestBody Map<String, Object> body, Authentication authentication) {
        Object raw = body.get("goals");
        List<String> goals = new ArrayList<>();
        if (raw instanceof List<?> list) {
            for (Object o : list) {
                if (o != null) goals.add(o.toString().trim());
            }
        }
        List<String> saved = profileService.saveGoals(extractEmail(authentication), goals);
        Map<String, Object> response = new HashMap<>();
        response.put("goals", saved);
        response.put("message", "Goals saved successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/completion")
    public ResponseEntity<Map<String, Object>> completion(Authentication authentication) {
        return ResponseEntity.ok(profileService.completion(extractEmail(authentication)));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getProfile(Authentication authentication) {
        CreatorProfile profile = profileService.getProfile(extractEmail(authentication))
                .orElse(null);

        Map<String, Object> response = new HashMap<>();
        if (profile != null) {
            response.put("niche", profile.getNiche());
            response.put("niches", splitList(profile.getNiches(), profile.getNiche()));
            response.put("platformFocus", profile.getPlatformFocus());
            response.put("displayName", profile.getDisplayName());
            response.put("username", profile.getUsername());
            response.put("email", profile.getEmail());
            response.put("country", profile.getCountry());
            response.put("timezone", profile.getTimezone());
            response.put("language", profile.getLanguage());
            response.put("goals", profile.getGoals());
            response.put("contentStyle", profile.getContentStyle());
            response.put("instagramHandle", profile.getInstagramHandle());
            response.put("youtubeChannel", profile.getYoutubeChannel());
            response.put("youtubeFormat", profile.getYoutubeFormat());
            response.put("instagramFormat", profile.getInstagramFormat());
            response.put("audienceAge", profile.getAudienceAge());
            response.put("audienceGender", profile.getAudienceGender());
            response.put("audienceRegion", profile.getAudienceRegion());
            response.put("postFrequency", profile.getPostFrequency());
            response.put("profilePhoto", profile.getProfilePhoto());
        } else {
            response.put("message", "No profile found. Please create one first.");
        }

        return ResponseEntity.ok(response);
    }

    private List<String> splitList(String value, String fallback) {
        if (value != null && !value.isBlank()) {
            return Arrays.stream(value.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
        }
        return fallback != null && !fallback.isBlank()
                ? List.of(fallback)
                : List.of();
    }
}
