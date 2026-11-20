package com.contentcreator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ContentCreatorApplication {
    public static void main(String[] args) {
        // Broken IPv6 routes abort api.razorpay.com calls on some networks;
        // IPv4 works everywhere, so prefer it no matter how the app is launched.
        if (System.getProperty("java.net.preferIPv4Stack") == null) {
            System.setProperty("java.net.preferIPv4Stack", "true");
        }
        SpringApplication.run(ContentCreatorApplication.class, args);
    }
}
