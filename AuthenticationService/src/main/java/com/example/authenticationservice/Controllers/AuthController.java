package com.example.authenticationservice.Controllers;


import com.example.authenticationservice.DTO.UserRequest;
import com.example.authenticationservice.Entity.User;
import com.example.authenticationservice.Service.Services;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final Services services;


    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        services.registerUser(user);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserRequest user){
//  TODO: AUTHENTICATE AND RETURN JWT TOKEN (THAT CAN BE VERIFIED THROUGH PUBLIC KEY)
        String jwt = services.loginService(user.getUsername(), user.getPassword());
        return new ResponseEntity<>(jwt, HttpStatus.OK);
    }

    @PostMapping("/createAdmin")
    public ResponseEntity<?> createAdmin(@RequestBody User user){
//        TODO: ADMIN CAN ONLY BE CREATED BY ANOTHER ADMIN
         services.createAdmin(user);
         return new ResponseEntity<>(HttpStatus.CREATED);
        }
}
