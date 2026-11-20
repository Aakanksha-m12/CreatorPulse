package com.contentcreator.config;

import lombok.Getter;

@Getter
public class PremiumRequiredException extends RuntimeException {
    private final String code = "PREMIUM_REQUIRED";
    public PremiumRequiredException(String message) { super(message); }
}
