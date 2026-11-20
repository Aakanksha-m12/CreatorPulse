package com.contentcreator.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "password_reset_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    private boolean used;

    @PrePersist
    public void init() {
        if (token == null) {
            token = UUID.randomUUID().toString();
        }
        if (expiryDate == null) {
            expiryDate = LocalDateTime.now().plusHours(1);
        }
    }
}
