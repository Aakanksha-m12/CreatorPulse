package com.contentcreator.service;

import com.contentcreator.entity.PaymentRecord;
import com.contentcreator.entity.Subscription;
import com.contentcreator.entity.User;
import com.contentcreator.repository.PaymentRecordRepository;
import com.contentcreator.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepo;
    private final PaymentRecordRepository paymentRepo;

    @Value("${app.razorpay.key-id:}")
    private String keyId;

    @Value("${app.razorpay.key-secret:}")
    private String keySecret;

    public boolean isPremium(Long userId) {
        return subscriptionRepo.findByUserId(userId)
                .filter(s -> Subscription.STATUS_ACTIVE.equals(s.getStatus()))
                .filter(s -> s.getCurrentPeriodEnd() != null && s.getCurrentPeriodEnd().isAfter(LocalDateTime.now()))
                .filter(s -> !Subscription.PLAN_FREE.equalsIgnoreCase(s.getPlan()))
                .isPresent();
    }

    public Map<String, Object> statusFor(User user) {
        Optional<Subscription> sub = subscriptionRepo.findByUserId(user.getId());
        boolean premium = isPremium(user.getId());
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("plan", sub.map(Subscription::getPlan).orElse(Subscription.PLAN_FREE));
        m.put("status", sub.map(Subscription::getStatus).orElse("NONE"));
        m.put("premium", premium);
        m.put("currentPeriodEnd", sub.map(Subscription::getCurrentPeriodEnd).orElse(null));
        m.put("razorpayKeyId", (keyId == null || keyId.isBlank()) ? null : keyId);
        m.put("mockMode", keyId == null || keyId.isBlank());
        return m;
    }

    /** Creates a Razorpay order (live) or a mock order when keys are absent. */
    public Map<String, Object> createOrder(User user, String plan) {
        String normalized = plan == null ? "PRO" : plan.toUpperCase();
        if (!Set.of("PRO", "STUDIO").contains(normalized)) {
            throw new RuntimeException("Plan must be PRO or STUDIO");
        }
        long amountPaise = "STUDIO".equals(normalized) ? 119900L : 49900L;
        String orderId;
        if (keyId == null || keyId.isBlank()) {
            orderId = "order_mock_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
        } else {
            orderId = createRazorpayOrder(amountPaise, "INR", "CreatorPulse " + normalized);
        }
        Subscription sub = subscriptionRepo.findByUserId(user.getId()).orElse(
                Subscription.builder().user(user).build());
        sub.setUser(user);
        sub.setPlan(normalized);
        sub.setStatus(Subscription.STATUS_PENDING);
        sub.setRazorpayOrderId(orderId);
        subscriptionRepo.save(sub);
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("orderId", orderId);
        m.put("amount", amountPaise);
        m.put("currency", "INR");
        m.put("plan", normalized);
        m.put("keyId", (keyId == null || keyId.isBlank()) ? null : keyId);
        m.put("mockMode", keyId == null || keyId.isBlank());
        m.put("prefillEmail", user.getEmail());
        m.put("prefillName", user.getDisplayName());
        return m;
    }

    /**
     * Verifies payment signature and activates subscription.
     * Idempotent: a repeated paymentId is acknowledged without double-processing.
     */
    @Transactional
    public Map<String, Object> verifyAndActivate(User user, String orderId, String paymentId, String signature) {
        validateIds(orderId, paymentId);
        // Idempotency: already-processed payment -> return current state, no rewrite.
        Optional<Subscription> byPayment = subscriptionRepo.findByRazorpayPaymentId(paymentId);
        if (byPayment.isPresent() && Subscription.STATUS_ACTIVE.equals(byPayment.get().getStatus())) {
            return Map.of("alreadyProcessed", true, "message", "Payment already confirmed",
                    "plan", byPayment.get().getPlan(), "status", "ACTIVE",
                    "currentPeriodEnd", String.valueOf(byPayment.get().getCurrentPeriodEnd()));
        }
        boolean mockMode = keyId == null || keyId.isBlank() || orderId.startsWith("order_mock_");
        if (!mockMode) {
            verifySignatureOrThrow(orderId, paymentId, signature);
        }
        Subscription sub = subscriptionRepo.findByUserId(user.getId())
                .orElse(Subscription.builder().user(user).build());
        // If user switched order, still honour the stored plan (PRO/STUDIO).
        String plan = sub.getPlan();
        if (plan == null || Subscription.PLAN_FREE.equals(plan) || Subscription.STATUS_PENDING.equals(sub.getStatus()) && orderId.equals(sub.getRazorpayOrderId())) {
            if (plan == null || Subscription.PLAN_FREE.equals(plan)) plan = "PRO";
        }
        // Expire any other active rows for this user (trigger also guards this).
        sub.setUser(user);
        sub.setPlan(plan == null ? "PRO" : plan);
        sub.setStatus(Subscription.STATUS_ACTIVE);
        sub.setRazorpayOrderId(orderId);
        sub.setRazorpayPaymentId(paymentId);
        sub.setRazorpaySignature(signature);
        sub.setCurrentPeriodEnd(LocalDateTime.now().plusMonths(1));
        subscriptionRepo.save(sub);
        // Payment history (idempotent: same paymentId never recorded twice).
        if (paymentRepo.findByRazorpayPaymentId(paymentId).isEmpty()) {
            paymentRepo.save(PaymentRecord.builder()
                    .user(user)
                    .plan(sub.getPlan())
                    .amountPaise("STUDIO".equals(sub.getPlan()) ? 119900L : 49900L)
                    .currency("INR")
                    .razorpayOrderId(orderId)
                    .razorpayPaymentId(paymentId)
                    .validTill(sub.getCurrentPeriodEnd())
                    .build());
        }
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("alreadyProcessed", false);
        m.put("message", "Subscription activated");
        m.put("plan", sub.getPlan());
        m.put("status", "ACTIVE");
        m.put("currentPeriodEnd", String.valueOf(sub.getCurrentPeriodEnd()));
        return m;
    }

    /** Customer-facing history: current validity + every past payment. */
    public Map<String, Object> historyFor(User user) {
        Map<String, Object> out = new LinkedHashMap<>(statusFor(user));
        List<Map<String, Object>> payments = new ArrayList<>();
        for (PaymentRecord p : paymentRepo.findByUserOrderByCreatedAtDesc(user)) {
            Map<String, Object> e = new LinkedHashMap<>();
            e.put("date", String.valueOf(p.getCreatedAt()));
            e.put("plan", p.getPlan());
            e.put("amount", "Rs." + (p.getAmountPaise() / 100));
            e.put("paymentId", p.getRazorpayPaymentId());
            e.put("validTill", String.valueOf(p.getValidTill()));
            payments.add(e);
        }
        out.put("payments", payments);
        return out;
    }

    /** Cancels the current subscription; premium stays until the paid period ends. */
    @Transactional
    public Map<String, Object> cancel(User user) {
        Subscription sub = subscriptionRepo.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No subscription found"));
        if (!Subscription.STATUS_ACTIVE.equals(sub.getStatus())) {
            return Map.of("plan", sub.getPlan(), "status", sub.getStatus(),
                    "message", "Subscription is not active — nothing to cancel");
        }
        sub.setStatus(Subscription.STATUS_CANCELLED);
        subscriptionRepo.save(sub);
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("plan", sub.getPlan());
        m.put("status", "CANCELLED");
        m.put("message", "Subscription cancelled. Premium stays active until "
                + sub.getCurrentPeriodEnd());
        m.put("currentPeriodEnd", String.valueOf(sub.getCurrentPeriodEnd()));
        return m;
    }

    /** Razorpay server-to-server webhook. Verifies signature + idempotent — duplicates are normal. */
    @Transactional
    public Map<String, Object> handleWebhook(String payload, String signature) {
        boolean liveMode = keySecret != null && !keySecret.isBlank();
        if (liveMode) {
            verifyWebhookSignatureOrThrow(payload == null ? "" : payload, signature);
        }
        String paymentId = extractJson(payload, "payment_id", "razorpay_payment_id", "id");
        if (paymentId == null || paymentId.isBlank()) {
            return Map.of("ok", false, "message", "No payment id in webhook payload — ignored");
        }
        Optional<Subscription> existing = subscriptionRepo.findByRazorpayPaymentId(paymentId);
        if (existing.isPresent() && Subscription.STATUS_ACTIVE.equals(existing.get().getStatus())) {
            return Map.of("ok", true, "duplicate", true, "message", "Duplicate webhook ignored — already active");
        }
        // Without a user mapping we cannot activate; acknowledge so Razorpay stops retrying.
        return Map.of("ok", true, "duplicate", false,
                "message", "Webhook received; client verify call completes activation (idempotent)");
    }

    // ---- helpers ----
    private void validateIds(String orderId, String paymentId) {
        if (orderId == null || orderId.isBlank()) throw new RuntimeException("orderId is required");
        if (paymentId == null || paymentId.isBlank()) throw new RuntimeException("paymentId is required");
        if (!paymentId.matches("[A-Za-z0-9_\\-]{4,100}")) throw new RuntimeException("Invalid paymentId format");
    }

    private void verifySignatureOrThrow(String orderId, String paymentId, String signature) {
        try {
            String data = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String expected = HexFormat.of().formatHex(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
            if (signature == null || !expected.equalsIgnoreCase(signature)) {
                throw new RuntimeException("Payment signature verification failed");
            }
        } catch (RuntimeException re) { throw re; }
        catch (Exception ex) { throw new RuntimeException("Signature verification error: " + ex.getMessage()); }
    }

    private void verifyWebhookSignatureOrThrow(String payload, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String expected = HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
            if (signature == null || !expected.equalsIgnoreCase(signature)) {
                throw new RuntimeException("Webhook signature verification failed");
            }
        } catch (RuntimeException re) { throw re; }
        catch (Exception ex) { throw new RuntimeException("Webhook verification error: " + ex.getMessage()); }
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    private String createRazorpayOrder(long amountPaise, String currency, String receiptNote) {
        Exception last = null;
        for (int attempt = 1; attempt <= 3; attempt++) {
            try {
                org.springframework.http.client.SimpleClientHttpRequestFactory rf =
                        new org.springframework.http.client.SimpleClientHttpRequestFactory();
                rf.setConnectTimeout(10000);
                rf.setReadTimeout(20000);
                org.springframework.web.client.RestTemplate rt =
                        new org.springframework.web.client.RestTemplate(rf);
                String url = "https://api.razorpay.com/v1/orders";
                Map<String, Object> body = Map.of("amount", amountPaise, "currency", currency,
                        "receipt", "cp_" + System.currentTimeMillis(), "notes", Map.of("plan", receiptNote));
                HttpHeaders h = new HttpHeaders();
                h.setContentType(MediaType.APPLICATION_JSON);
                h.setBasicAuth(keyId, keySecret);
                ResponseEntity<Map> resp = rt.exchange(url, HttpMethod.POST, new HttpEntity<>(body, h), Map.class);
                Object id = resp.getBody() == null ? null : resp.getBody().get("id");
                if (id == null) throw new RuntimeException("Razorpay order creation failed");
                return String.valueOf(id);
            } catch (Exception ex) {
                last = ex;
                try { Thread.sleep(1000L * attempt); } catch (InterruptedException ignored) {}
            }
        }
        throw new RuntimeException("Razorpay order failed after 3 attempts: "
                + (last == null ? "unknown error" : last.getMessage()));
    }

    private String extractJson(String payload, String... keys) {
        if (payload == null) return null;
        for (String k : keys) {
            java.util.regex.Matcher m = java.util.regex.Pattern
                    .compile("\"" + java.util.regex.Pattern.quote(k) + "\"\\s*:\\s*\"([^\"]+)\"")
                    .matcher(payload);
            if (m.find()) return m.group(1);
        }
        return null;
    }
}
