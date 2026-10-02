package com.example.paymentservice.GlobalExceptionalHandler;

public class PaymentException extends RuntimeException {
    public PaymentException(String message,Throwable cause) {
        super(message,cause);
    }
}
