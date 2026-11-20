package com.contentcreator.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "posting_time_rule", indexes = {
        @Index(name = "idx_posting_platform_niche", columnList = "platform, niche, day_type")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostingTimeRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String platform;

    @Column(nullable = false, length = 60)
    private String niche;

    @Column(name = "day_type", nullable = false, length = 20)
    private String dayType;

    @Column(name = "start_hour", nullable = false)
    private Integer startHour;

    @Column(name = "end_hour", nullable = false)
    private Integer endHour;

    @Column(name = "display_label", nullable = false, length = 40)
    private String displayLabel;

    @Column(columnDefinition = "TEXT")
    private String reasoning;

    @Column(name = "score_boost")
    private Integer scoreBoost;
}
