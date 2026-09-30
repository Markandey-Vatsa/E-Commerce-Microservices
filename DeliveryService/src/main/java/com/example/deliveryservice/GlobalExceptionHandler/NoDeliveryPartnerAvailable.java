package com.example.deliveryservice.GlobalExceptionHandler;

public class NoDeliveryPartnerAvailable extends RuntimeException {
    public NoDeliveryPartnerAvailable(String message) {
        super(message);
    }
}
