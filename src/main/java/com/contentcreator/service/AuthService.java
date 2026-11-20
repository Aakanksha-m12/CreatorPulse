package com.contentcreator.service;

import com.contentcreator.dto.*;
import com.contentcreator.entity.OtpCode;
import com.contentcreator.entity.User;
import com.contentcreator.repository.OtpCodeRepository;
import com.contentcreator.repository.UserRepository;
import com.contentcreator.config.ConflictException;
import com.contentcreator.entity.RefreshToken;
import com.contentcreator.repository.RefreshTokenRepository;
import com.contentcreator.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final OtpCodeRepository otpCodeRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService customUserDetailsService;
    private final MailService mailService;

    @org.springframework.beans.factory.annotation.Value("${jwt.refresh-expiration-ms:2592000000}")
    private long refreshExpirationMs;

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName())
                .verified(false)
                .build();

        userRepository.save(user);

        sendOtp(request.getEmail(), OtpCode.PURPOSE_SIGNUP);

        return AuthResponse.builder()
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .message("Account created. Enter the 6-digit code sent to " + user.getEmail() + " to verify your email.")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!user.isVerified()) {
            throw new RuntimeException("Please verify your email first. Check your inbox for the 6-digit code.");
        }

        return buildAuthResponse(user, "Login successful");
    }

    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        OtpCode otp = validateOtp(request.getEmail(), request.getCode(), OtpCode.PURPOSE_SIGNUP);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setVerified(true);
        userRepository.save(user);

        otp.setUsed(true);
        otpCodeRepository.save(otp);

        return buildAuthResponse(user, "Email verified successfully");
    }

    @Transactional
    public MessageResponse resendOtp(String email) {
        if (!userRepository.existsByEmail(email)) {
            return genericOtpMessage();
        }
        sendOtp(email, OtpCode.PURPOSE_SIGNUP);
        return genericOtpMessage();
    }

    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail();
        if (!userRepository.existsByEmail(email)) {
            return genericOtpMessage();
        }
        sendOtp(email, OtpCode.PURPOSE_RESET);
        return genericOtpMessage();
    }

    @Transactional
    public MessageResponse verifyResetOtp(VerifyResetOtpRequest request) {
        validateOtp(request.getEmail(), request.getCode(), OtpCode.PURPOSE_RESET);
        return MessageResponse.builder()
                .message("Code verified. You can now set a new password.")
                .success(true)
                .build();
    }

    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        OtpCode otp = validateOtp(request.getEmail(), request.getCode(), OtpCode.PURPOSE_RESET);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        otp.setUsed(true);
        otpCodeRepository.save(otp);
        otpCodeRepository.findByEmailAndPurposeAndUsedFalse(request.getEmail(), OtpCode.PURPOSE_RESET)
                .forEach(o -> { o.setUsed(true); otpCodeRepository.save(o); });

        return MessageResponse.builder()
                .message("Password reset successfully")
                .success(true)
                .build();
    }

    private void sendOtp(String email, String purpose) {
        otpCodeRepository.findByEmailAndPurposeAndUsedFalse(email, purpose)
                .forEach(o -> { o.setUsed(true); otpCodeRepository.save(o); });

        OtpCode otp = new OtpCode();
        otp.setEmail(email);
        otp.setPurpose(purpose);
        otp.init();
        otpCodeRepository.save(otp);

        mailService.sendOtp(email, otp.getCode(), purpose);
    }

    private OtpCode validateOtp(String email, String code, String purpose) {
        OtpCode otp = otpCodeRepository.findFirstByEmailAndPurposeAndCodeOrderByIdDesc(email, purpose, code)
                .orElseThrow(() -> new RuntimeException("Invalid verification code"));

        if (otp.isUsed()) {
            throw new RuntimeException("This code has already been used");
        }
        if (otp.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Code has expired. Request a new one.");
        }
        return otp;
    }

    private AuthResponse buildAuthResponse(User user, String message) {
        var userDetails = customUserDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtils.generateToken(userDetails);
        return AuthResponse.builder()
                .token(token)
                .refreshToken(issueRefreshToken(user))
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .message(message)
                .build();
    }

    /** Issues an opaque refresh token (30 days, max 5 active sessions per user). */
    private String issueRefreshToken(User user) {
        List<RefreshToken> existing = refreshTokenRepository.findByUserOrderByCreatedAtAsc(user);
        List<RefreshToken> active = existing.stream()
                .filter(t -> !t.isRevoked() && t.getExpiryDate().isAfter(LocalDateTime.now())).toList();
        for (int i = 0; i + 4 < active.size() + 1 && i < active.size(); i++) {
            RefreshToken oldest = active.get(i);
            oldest.setRevoked(true);
            refreshTokenRepository.save(oldest);
        }
        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .token(java.util.UUID.randomUUID().toString())
                .expiryDate(LocalDateTime.now().plusSeconds(refreshExpirationMs / 1000))
                .revoked(false)
                .build();
        refreshTokenRepository.save(rt);
        return rt.getToken();
    }

    @Transactional
    public AuthResponse refresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new RuntimeException("Refresh token required");
        }
        RefreshToken stored = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));
        if (stored.isRevoked() || stored.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Refresh token expired — please log in again");
        }
        // Rotate: single use.
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);
        User user = stored.getUser();
        return buildAuthResponse(user, "Token refreshed");
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenRepository.findByToken(refreshToken).ifPresent(t -> {
                t.setRevoked(true);
                refreshTokenRepository.save(t);
            });
        }
    }

    private MessageResponse genericOtpMessage() {
        return MessageResponse.builder()
                .message("If an account exists with that email, a verification code has been sent.")
                .success(true)
                .build();
    }
}
