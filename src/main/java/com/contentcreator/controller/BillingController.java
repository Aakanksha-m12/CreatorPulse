package com.contentcreator.controller;

import com.contentcreator.entity.User;
import com.contentcreator.service.SubscriptionService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
public class BillingController {

    private final SubscriptionService billing;

    private User user(Authentication auth) {
        if (auth.getPrincipal() instanceof User u) return u;
        throw new RuntimeException("Unauthenticated request");
    }

    @Data
    public static class OrderRequest { private String plan; }

    @Data
    public static class VerifyRequest {
        private String orderId;
        private String paymentId;
        private String signature;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status(Authentication auth) {
        return ResponseEntity.ok(billing.statusFor(user(auth)));
    }

    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> history(Authentication auth) {
        return ResponseEntity.ok(billing.historyFor(user(auth)));
    }

    @PostMapping("/order")
    public ResponseEntity<Map<String, Object>> order(Authentication auth, @RequestBody OrderRequest req) {
        return ResponseEntity.ok(billing.createOrder(user(auth), req == null ? "PRO" : req.getPlan()));
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verify(Authentication auth, @RequestBody VerifyRequest req) {
        if (req == null) throw new RuntimeException("Payment details required");
        return ResponseEntity.ok(billing.verifyAndActivate(
                user(auth), req.getOrderId(), req.getPaymentId(), req.getSignature()));
    }

    @PostMapping("/cancel")
    public ResponseEntity<Map<String, Object>> cancel(Authentication auth) {
        return ResponseEntity.ok(billing.cancel(user(auth)));
    }

    /** Razorpay server webhook — public, idempotent, signature-checked where possible. */
    @PostMapping(value = "/webhook", consumes = MediaType.ALL_VALUE)
    public ResponseEntity<Map<String, Object>> webhook(
            @RequestBody(required = false) String payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        return ResponseEntity.ok(billing.handleWebhook(payload == null ? "" : payload, signature));
    }
}
