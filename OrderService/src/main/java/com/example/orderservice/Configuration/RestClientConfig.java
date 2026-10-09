package com.example.orderservice.Configuration;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;


@Configuration
public class RestClientConfig {

    @Value("${services.product.url}")
    private String productServiceUrl;

    @Value("${services.delivery.url}")
    private String deliveryServiceUrl;

    @Value("${services.payment.url}")
    private String paymentServiceUrl;

    @Bean
    public RestClient productRestClient() {
        return RestClient.builder()
                .baseUrl(productServiceUrl)
                .build();
    }

    @Bean
    public RestClient deliveryRestClient() {
        return RestClient.builder()
                .baseUrl(deliveryServiceUrl)
                .build();
    }

    @Bean
    public RestClient paymentServiceClient(){
        return RestClient.builder()
                .baseUrl(paymentServiceUrl)
                .build();
    }
}
