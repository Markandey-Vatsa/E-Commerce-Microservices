package com.example.paymentservice.RestClientConfig;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {
    @Bean
    public RestClient orderRestClient() {
        return RestClient.builder()
                .baseUrl("http://localhost:8082")
                .build();
    }
}
