package com.contentcreator.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/** A future post the creator saved: title + when to publish it. */
@Entity
@Table(name = "saved_plan", indexes = {
        @Index(name = "idx_plan_user_when", columnList = "user_id, planned_for")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedPlan {

    public static final String STATUS_PLANNED = "PLANNED";
    public static final String STATUS_DONE = "DONE";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, length = 20)
    private String platform;

    @Column(name = "planned_for")
    private LocalDateTime plannedFor;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null || status.isBlank()) status = STATUS_PLANNED;
    }
}
