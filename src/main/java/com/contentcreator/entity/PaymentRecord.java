package com.contentcreator.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/** One row per successful payment — powers the customer's payment history. */
@Entity
@Table(name = "payment_record", indexes = {
        @Index(name = "idx_pay_user_created", columnList = "user_id, created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 20)
    private String plan;

    @Column(name = "amount_paise", nullable = false)
    private Long amountPaise;

    @Column(nullable = false, length = 10)
    private String currency;

    @Column(name = "razorpay_order_id", length = 100)
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id", length = 100, unique = true)
    private String razorpayPaymentId;

    @Column(name = "valid_till")
    private LocalDateTime validTill;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
