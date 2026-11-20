package com.contentcreator.service;

import com.contentcreator.dto.CreatorProfileRequest;
import com.contentcreator.entity.CreatorProfile;
import com.contentcreator.entity.User;
import com.contentcreator.repository.CreatorProfileRepository;
import com.contentcreator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CreatorProfileService {

    private final CreatorProfileRepository profileRepository;
    private final UserRepository userRepository;

    @Transactional
    public CreatorProfile createOrUpdateProfile(String email, CreatorProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<CreatorProfile> existingProfile = profileRepository.findByUserId(user.getId());

        CreatorProfile profile = existingProfile.orElse(new CreatorProfile());
        profile.setUser(user);
        profile.setNiche(request.getNiche());
        profile.setNiches(joinList(request.getNiches(), request.getNiche()));
        profile.setPlatformFocus(request.getPlatformFocus());
        profile.setDisplayName(request.getDisplayName());
        profile.setUsername(request.getUsername());
        profile.setEmail(request.getEmail());
        profile.setCountry(request.getCountry());
        profile.setTimezone(request.getTimezone());
        profile.setLanguage(request.getLanguage());
        profile.setGoals(request.getGoals());
        profile.setContentStyle(request.getContentStyle());
        profile.setInstagramHandle(request.getInstagramHandle());
        profile.setYoutubeChannel(request.getYoutubeChannel());
        profile.setYoutubeFormat(request.getYoutubeFormat());
        profile.setInstagramFormat(request.getInstagramFormat());
        profile.setAudienceAge(request.getAudienceAge());
        profile.setAudienceGender(request.getAudienceGender());
        profile.setAudienceRegion(request.getAudienceRegion());
        profile.setPostFrequency(request.getPostFrequency());
        profile.setProfilePhoto(request.getProfilePhoto());

        return profileRepository.save(profile);
    }

    @Transactional
    public CreatorProfile saveProfilePhoto(String email, String photoUrl) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        CreatorProfile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    CreatorProfile p = new CreatorProfile();
                    p.setUser(user);
                    p.setEmail(email);
                    return p;
                });
        profile.setProfilePhoto(photoUrl);
        return profileRepository.save(profile);
    }

    @Transactional
    public List<String> saveGoals(String email, List<String> goals) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        CreatorProfile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    CreatorProfile p = new CreatorProfile();
                    p.setUser(user);
                    p.setEmail(email);
                    return p;
                });
        List<String> clean = goals == null
                ? List.of()
                : goals.stream().filter(g -> g != null && !g.isBlank()).distinct().toList();
        profile.setGoals(String.join(", ", clean));
        profileRepository.save(profile);
        return clean;
    }

    private String joinList(List<String> values, String fallback) {
        if (values != null && !values.isEmpty()) {
            return values.stream().filter(v -> v != null && !v.isBlank()).distinct()
                    .collect(Collectors.joining(","));
        }
        return fallback;
    }

    @Transactional(readOnly = true)
    public Optional<CreatorProfile> getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return profileRepository.findByUserId(user.getId());
    }

    /** Backend-calculated profile completion for the dashboard checklist. */
    @Transactional(readOnly = true)
    public Map<String, Object> completion(String email) {
        Optional<CreatorProfile> opt = getProfile(email);
        List<String> missing = new ArrayList<>();
        if (opt.isEmpty()) {
            missing = List.of("displayName", "niche", "platformFocus", "goals",
                    "country", "timezone", "language", "username", "audience", "profilePhoto");
        } else {
            CreatorProfile p = opt.get();
            if (blank(p.getDisplayName())) missing.add("displayName");
            if (blank(p.getNiche()) && blank(p.getNiches())) missing.add("niche");
            if (blank(p.getPlatformFocus())) missing.add("platformFocus");
            if (blank(p.getGoals())) missing.add("goals");
            if (blank(p.getCountry())) missing.add("country");
            if (blank(p.getTimezone())) missing.add("timezone");
            if (blank(p.getLanguage())) missing.add("language");
            if (blank(p.getUsername())) missing.add("username");
            if (blank(p.getAudienceAge()) && blank(p.getAudienceGender()) && blank(p.getAudienceRegion()))
                missing.add("audience");
            if (blank(p.getProfilePhoto())) missing.add("profilePhoto");
        }
        int total = 10;
        int completed = total - missing.size();
        int percentage = (int) Math.round(completed * 100.0 / total);
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("percentage", percentage);
        m.put("completed", completed);
        m.put("total", total);
        m.put("missing", missing);
        return m;
    }

    private boolean blank(String s) { return s == null || s.isBlank(); }
}
