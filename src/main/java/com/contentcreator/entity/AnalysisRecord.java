package com.contentcreator.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analysis_record", indexes = {
        @Index(name = "idx_analysis_user_created", columnList = "user_id, created_at"),
        @Index(name = "idx_analysis_user_type", columnList = "user_id, type")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisRecord {

    public static final String TYPE_THUMBNAIL = "THUMBNAIL";
    public static final String TYPE_CAPTION = "CAPTION";
    public static final String TYPE_TITLE = "TITLE";
    public static final String TYPE_HASHTAG = "HASHTAG";
    public static final String TYPE_COMBINED = "COMBINED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "type", nullable = false, length = 20)
    private String type;

    @Column(name = "input_summary", columnDefinition = "TEXT")
    private String inputSummary;

    @Column(name = "score")
    private Integer score;

    @Column(name = "details", columnDefinition = "MEDIUMTEXT")
    private String details;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (score != null) {
            score = Math.max(0, Math.min(100, score));
        }
    }
}
