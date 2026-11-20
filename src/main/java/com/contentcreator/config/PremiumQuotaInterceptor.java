package com.contentcreator.config;

import com.contentcreator.entity.AnalysisRecord;
import com.contentcreator.entity.User;
import com.contentcreator.repository.AnalysisRecordRepository;
import com.contentcreator.service.SubscriptionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * M6 premium authorization layer: JWT authentication (filter) -> plan check (here)
 * -> controller. Free quotas: 3 thumbnail scores/week, 10 NLP analyses/week.
 * Over-quota answers 403 {code: PREMIUM_REQUIRED} instead of running the module.
 */
@Component
@RequiredArgsConstructor
public class PremiumQuotaInterceptor implements HandlerInterceptor {

    private final SubscriptionService subscriptionService;
    private final AnalysisRecordRepository analysisRepo;
    private final ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;
        String path = request.getRequestURI();
        String quotaType = null;
        long freeLimit = 0;
        if (path.equals("/api/thumbnails/score")) {
            quotaType = AnalysisRecord.TYPE_THUMBNAIL;
            freeLimit = 3;
        } else if (path.equals("/api/optimize/analyze")) {
            quotaType = AnalysisRecord.TYPE_COMBINED;
            freeLimit = 10;
        } else {
            return true;
        }
        User user = currentUser();
        if (user == null) return true; // authentication layer handles this
        if (subscriptionService.isPremium(user.getId())) return true;
        long used = analysisRepo.countByUserAndTypeAndCreatedAtAfter(
                user, quotaType, LocalDateTime.now().minusDays(7));
        if (used >= freeLimit) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write(objectMapper.writeValueAsString(Map.of(
                    "error", "Free plan allows " + freeLimit + " uses per week — upgrade to Pro for unlimited access",
                    "code", "PREMIUM_REQUIRED",
                    "used", used,
                    "limit", freeLimit)));
            return false;
        }
        return true;
    }

    private User currentUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof User user) return user;
        } catch (Exception ignored) {}
        return null;
    }
}
