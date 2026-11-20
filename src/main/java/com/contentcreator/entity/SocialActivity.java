package com.contentcreator.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "social_activity")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialActivity {

    public static final String PLATFORM_INSTAGRAM = "INSTAGRAM";
    public static final String PLATFORM_YOUTUBE = "YOUTUBE";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 16)
    private String platform;

    @Column(length = 128)
    private String handle;

    @Column(name = "recorded_on", nullable = false)
    private LocalDate recordedOn;

    @Column(name = "followers")
    private long followers;

    @Column(name = "total_views")
    private long totalViews;

    @Column(name = "total_likes")
    private long totalLikes;

    @Column(name = "total_comments")
    private long totalComments;

    @Column(name = "post_count")
    private long postCount;

    @Column(name = "real_data", nullable = false)
    private boolean realData = false;

    @Column(name = "manual_data", nullable = false)
    private boolean manualData = false;

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
