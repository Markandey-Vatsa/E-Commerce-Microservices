package com.example.authenticationservice.DTO;

import lombok.Data;

@Data
public class UserRequest {
    private String username;
    private String password;
}
