package com.example.orderservice.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Bean
    public RestClient productRestClient() {
        return RestClient.builder()
                .baseUrl("http://localhost:8080")
                .build();
    }

    @Bean
    public RestClient deliveryRestClient() {
        return RestClient.builder()
                .baseUrl("http://localhost:8084")
                .build();
    }
}
