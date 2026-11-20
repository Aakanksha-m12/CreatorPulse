package com.contentcreator.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import java.time.LocalDateTime;

@Entity
@Table(name = "creator_profile")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @Column(name = "niche")
    private String niche;

    @Column(name = "niches", columnDefinition = "TEXT")
    private String niches;

    @Column(name = "platform_focus")
    private String platformFocus;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "username")
    private String username;

    @Column(name = "email")
    private String email;

    @Column(name = "country")
    private String country;

    @Column(name = "timezone")
    private String timezone;

    @Column(name = "language")
    private String language;

    @Column(name = "goals", columnDefinition = "TEXT")
    private String goals;

    @Column(name = "content_style")
    private String contentStyle;

    @Column(name = "instagram_handle")
    private String instagramHandle;

    @Column(name = "youtube_channel")
    private String youtubeChannel;

    @Column(name = "youtube_format")
    private String youtubeFormat;

    @Column(name = "instagram_format")
    private String instagramFormat;

    @Column(name = "audience_age")
    private String audienceAge;

    @Column(name = "audience_gender")
    private String audienceGender;

    @Column(name = "audience_region")
    private String audienceRegion;

    @Column(name = "post_frequency")
    private String postFrequency;

    @Column(name = "profile_photo", columnDefinition = "TEXT")
    private String profilePhoto;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
