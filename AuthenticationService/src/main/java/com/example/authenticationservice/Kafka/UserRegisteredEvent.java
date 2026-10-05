package com.example.authenticationservice.Kafka;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.UUID;


@Data
public class UserRegisteredEvent {
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;

    public UserRegisteredEvent(Long userId, String email, String firstName, String lastName){
        this.userId = userId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
    }
}
