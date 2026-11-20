package com.contentcreator.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;

@Entity
@Table(name = "otp_codes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpCode {

    public static final String PURPOSE_SIGNUP = "SIGNUP";
    public static final String PURPOSE_RESET = "RESET";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, length = 6)
    private String code;

    @Column(nullable = false, length = 16)
    private String purpose;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    private boolean used;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void init() {
        if (code == null) {
            code = String.format("%06d", ThreadLocalRandom.current().nextInt(1000000));
        }
        if (expiryDate == null) {
            expiryDate = LocalDateTime.now().plusMinutes(10);
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
