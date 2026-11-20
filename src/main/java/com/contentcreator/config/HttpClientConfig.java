package com.contentcreator.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.client.RestClientCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

@Configuration
@RequiredArgsConstructor
@EnableConfigurationProperties(ModuleProperties.class)
public class HttpClientConfig {

    private final ModuleProperties moduleProperties;

    @Bean
    public RestClientCustomizer moduleRestClientCustomizer() {
        return restClientBuilder -> {
            SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
            requestFactory.setConnectTimeout(moduleProperties.getConnectTimeoutMs());
            requestFactory.setReadTimeout(moduleProperties.getReadTimeoutMs());
            restClientBuilder.requestFactory(requestFactory);
        };
    }
}
