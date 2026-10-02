package com.example.paymentservice.GlobalExceptionalHandler;

public class PaymentNotFoundException extends RuntimeException {
    public PaymentNotFoundException(String message) {
        super(message);
    }
}
