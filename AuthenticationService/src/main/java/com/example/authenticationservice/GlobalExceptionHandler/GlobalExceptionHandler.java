package com.example.authenticationservice.GlobalExceptionHandler;

import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RoleNotAllowedException.class)
    public ResponseEntity<?> roleNotAllowedException(RoleNotAllowedException ex){
        ErrorResponse errorResponse = new ErrorResponse();
        errorResponse.setCode(HttpStatus.UNAUTHORIZED.value());
        errorResponse.setMessage(ex.getMessage());
        errorResponse.setTimestamp(LocalDateTime.now());

        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<?> NullPointerException(NullPointerException ex){
        ErrorResponse errorResponse = new ErrorResponse();
        errorResponse.setCode(HttpStatus.BAD_REQUEST.value());
        errorResponse.setMessage(ex.getMessage());
        errorResponse.setTimestamp(LocalDateTime.now());

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<?> AuthenticationException(AuthenticationException ex){
        ErrorResponse errorResponse = new ErrorResponse();
        errorResponse.setCode(HttpStatus.UNAUTHORIZED.value());
        errorResponse.setMessage(ex.getMessage());
        errorResponse.setTimestamp(LocalDateTime.now());

        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }
}
