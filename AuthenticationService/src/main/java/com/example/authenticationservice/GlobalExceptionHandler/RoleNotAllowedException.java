package com.example.authenticationservice.GlobalExceptionHandler;

public class RoleNotAllowedException extends RuntimeException{
    public RoleNotAllowedException(String message){
        super(message);
    }
}
