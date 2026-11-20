package com.contentcreator.repository;

import com.contentcreator.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByUserId(Long userId);
    Optional<Subscription> findByRazorpayPaymentId(String paymentId);
    Optional<Subscription> findByRazorpayOrderId(String orderId);
}
