package com.example.authenticationservice.Controllers;


import com.example.authenticationservice.DTO.UserRequest;
import com.example.authenticationservice.Entity.User;
import com.example.authenticationservice.Service.Services;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
//   AUTHENTICATE AND RETURN JWT TOKEN (THAT CAN BE VERIFIED THROUGH PUBLIC KEY)
        String jwt = services.loginService(user.getUsername(), user.getPassword());
        return new ResponseEntity<>(jwt, HttpStatus.OK);
    }

    @PostMapping("/createAdmin")
    public ResponseEntity<?> createAdmin(@RequestBody User user){
//       ADMIN CAN ONLY BE CREATED BY ANOTHER ADMIN
         services.createAdmin(user);
         return new ResponseEntity<>(HttpStatus.CREATED);
        }

//        Forgot password controller
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email){
        services.sendOTP(email);
        return new ResponseEntity<>("OTP Sent",HttpStatus.OK);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestParam String email,@RequestParam String otp){
        boolean verify = services.verifyOtp(email,otp);
        if(verify) return new ResponseEntity<>("OTP Verified successfully: ",HttpStatus.OK);
        return new ResponseEntity<>("Invalid OTP",HttpStatus.BAD_REQUEST);
    }


    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestBody UserRequest passwordReset) {
        boolean result =
                services.resetPassword(passwordReset);
        if (result) {
            return ResponseEntity.ok("Password reset successfully");
        }

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body("User not found");
    }
}
