package com.example.productservice.GlobalExceptionalHandler;

public class ReservationNotFouncException extends RuntimeException {
    public ReservationNotFouncException(String message) {
        super(message);
    }
}
