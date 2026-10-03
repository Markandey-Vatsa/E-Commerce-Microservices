package com.example.productservice.GlobalExceptionalHandler;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ErrorResponse {
    String message;
    int status;
    LocalDateTime timestamp;
}
