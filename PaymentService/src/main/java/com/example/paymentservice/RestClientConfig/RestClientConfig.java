package com.example.paymentservice.RestClientConfig;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Value("${services.product.url}")
    private String productUrl;

    @Value("${services.order.url}")
    private String orderUrl;

    @Bean
    public RestClient orderRestClient() {
        return RestClient.builder()
                .baseUrl(orderUrl)
                .build();
    }

    @Bean
    public RestClient productRestClient(){
        return RestClient.builder()
                .baseUrl(productUrl)
                .build();
    }
}
