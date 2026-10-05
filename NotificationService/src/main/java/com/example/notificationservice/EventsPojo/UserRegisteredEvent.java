package com.example.notificationservice.EventsPojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRegisteredEvent {
    private String firstName;
    private String lastName;
    private Long userId;
    private String email;
}