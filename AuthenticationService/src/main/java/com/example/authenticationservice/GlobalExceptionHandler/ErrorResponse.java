package com.example.authenticationservice.GlobalExceptionHandler;


import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ErrorResponse {
    String message;
    Integer code;
    LocalDateTime timestamp;
}
