package com.contentcreator.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender mailSender;

    @Autowired
    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Value("${spring.mail.username:}")
    private String from;

    public void sendOtp(String toEmail, String otp, String purpose) {
        String subject;
        String body;
        if ("SIGNUP".equals(purpose)) {
            subject = "CreatorPulse — Verify Your Email";
            body = "Hello,\n\nWelcome to CreatorPulse! Use this code to verify your email:\n\n"
                    + otp + "\n\nThe code is valid for 10 minutes.\n\n— CreatorPulse";
        } else {
            subject = "CreatorPulse — Password Reset Code";
            body = "Hello,\n\nWe received a request to reset your password.\n\n"
                    + "Use this code to reset your password:\n\n"
                    + otp + "\n\nThe code is valid for 10 minutes.\n\n"
                    + "If you didn't request this, you can safely ignore this email.\n\n— CreatorPulse";
        }

        log.info("========================================");
        log.info("OTP ({}) for {}: {}", purpose, toEmail, otp);
        log.info("========================================");

        if (from == null || from.isBlank()) {
            log.warn("Mail not configured (spring.mail.username is empty) — OTP not emailed, see console above.");
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("OTP email sent to {}", toEmail);
        } catch (Exception ex) {
            log.warn("Failed to email OTP to {} (see console for the code): {}", toEmail, ex.getMessage());
        }
    }
}
