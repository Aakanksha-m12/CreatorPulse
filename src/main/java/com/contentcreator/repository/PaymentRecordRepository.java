package com.contentcreator.repository;

import com.contentcreator.entity.PaymentRecord;
import com.contentcreator.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Long> {
    Optional<PaymentRecord> findByRazorpayPaymentId(String paymentId);
    List<PaymentRecord> findByUserOrderByCreatedAtDesc(User user);
}
