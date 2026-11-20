package com.contentcreator.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hashtag_reference", uniqueConstraints = {
        @UniqueConstraint(name = "uk_hashtag_niche_tag", columnNames = {"niche", "hashtag"})
}, indexes = {
        @Index(name = "idx_hashtag_niche", columnList = "niche")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HashtagReference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 60)
    private String niche;

    @Column(nullable = false, length = 80)
    private String hashtag;

    @Column(name = "popularity")
    private Integer popularity;

    @Column(length = 30)
    private String category;
}
