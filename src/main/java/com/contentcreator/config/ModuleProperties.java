package com.contentcreator.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

@Data
@ConfigurationProperties(prefix = "app.modules")
public class ModuleProperties {

    private int connectTimeoutMs = 2000;
    private int readTimeoutMs = 8000;

    private List<Module> modules = new ArrayList<>();

    @Data
    public static class Module {
        private String name;
        private String baseUrl;
        private String path = "/analyze";
        private String healthPath = "/health";
    }
}
