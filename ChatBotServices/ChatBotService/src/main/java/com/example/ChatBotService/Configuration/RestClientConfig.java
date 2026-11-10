package com.example.ChatBotService.Configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Value("${services.product.url}")
    private String productServiceUrl;

    @Bean
    public RestClient productServiceRestClient(){
        return RestClient.builder().baseUrl(productServiceUrl).build();
    }
}
