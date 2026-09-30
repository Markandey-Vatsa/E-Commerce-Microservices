package com.example.deliveryservice.GlobalExceptionHandler;
import org.springframework.cglib.core.Local;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NoDeliveryPartnerAvailable.class)
    public ResponseEntity<?> handleENoPartnerAvailable(NoDeliveryPartnerAvailable ex){
        ErrorResponse error = new ErrorResponse();
        error.setCode(404);
        error.setMessage(ex.getMessage());
        error.setTimestamp(LocalDateTime.now());
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

}
