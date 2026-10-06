package com.example.authenticationservice.Service;

import com.example.authenticationservice.DTO.UserRequest;
import com.example.authenticationservice.Entity.PasswordResetOTP;
import com.example.authenticationservice.Entity.Role;
import com.example.authenticationservice.Entity.User;
import com.example.authenticationservice.GlobalExceptionHandler.RoleNotAllowedException;
import com.example.authenticationservice.Kafka.KafkaProducer;
import com.example.authenticationservice.Kafka.UserRegisteredEvent;
import com.example.authenticationservice.Repository.UserOtpRepository;
import com.example.authenticationservice.Repository.UserRepository;
import com.example.authenticationservice.Utils.JwtUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@RequiredArgsConstructor
@Service
public class Services {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final UserOtpRepository userOtpRepository;
    private final JavaMailSender javaMailSender;
    private final KafkaProducer kafkaProducer;

    public void registerUser(User user) throws RuntimeException {

        User user1 = new User();

        if (user.getUsername().isEmpty()
                || user.getPassword().isEmpty()
                || user.getRole() == null) {

            throw new NullPointerException("This field can't be empty !");
        }

        if (user.getRole().equals(Role.ADMIN)) {
            throw new RoleNotAllowedException(
                    "This role can't be created through this registration !"
            );
        }

        user1.setRole(user.getRole());
        user1.setUsername(user.getUsername());
        user1.setPassword(passwordEncoder.encode(user.getPassword()));
        user1.setFirstName(user.getFirstName());
        user1.setLastName(user.getLastName());

        User savedUser = userRepository.save(user1);
        UserRegisteredEvent sendUser = new UserRegisteredEvent(savedUser.getId(),savedUser.getUsername(),savedUser.getFirstName(),savedUser.getLastName());

        kafkaProducer.sendUserRegisteredEvent(sendUser);
    }

    public void createAdmin(User user) {
        if (user.getUsername().isEmpty()
                || user.getPassword().isEmpty()
                || user.getRole() == null) {

            throw new NullPointerException("This field can't be empty !");
        }
        user.setRole(Role.ADMIN);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

    public String loginService(String username, String password) {

        // 1. Authenticate username + password
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        username,
                        password
                )
        );

        // 2. Get the user from database
        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        // 3. Get role
        String role = user.getRole().name();

        // 4. Generate JWT containing username + role
        return jwtUtil.generateToken(
                user.getId(),
                user.getUsername(),
                role
        );
    }

    private String generateOTP() {
        int otp = new SecureRandom().nextInt(900000) + 100000;
        return String.valueOf(otp);
    }


    public void sendOtpEmail(String email, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Password Reset OTP");

        message.setText(
                "Your password reset OTP is: " + otp +
                        "\n\nThis OTP will expire in 5 minutes."
        );
        javaMailSender.send(message);
    }

    @Transactional
    public void sendOTP(String email){
        User user = userRepository.findByUsername(email).orElseThrow(() ->  new RuntimeException("User not found"));
        userOtpRepository.deleteByUser(user);
        String otp = generateOTP();
        PasswordResetOTP passwordResetOTP = new PasswordResetOTP();
        passwordResetOTP.setOtp(otp);
        passwordResetOTP.setUser(user);
        passwordResetOTP.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        userOtpRepository.save(passwordResetOTP);
        sendOtpEmail(email,otp);
    }

    public boolean resetPassword(UserRequest passwordReset){
        User user = userRepository.findByUsername(passwordReset.getUsername()).orElse(null);
        if(user!=null){
            user.setPassword(passwordEncoder.encode(passwordReset.getPassword()));
            userRepository.save(user);
            return true;
        }
        return false;
    }


    @Transactional
    public boolean verifyOtp(String email, String otp) {
        User user = userRepository.findByUsername(email)
                .orElse(null);
        if (user == null) {
            return false;
        }
        PasswordResetOTP resetOTP = userOtpRepository
                .findByUser(user).orElse(null);

        if (resetOTP == null) {
            return false;
        }
        if (!LocalDateTime.now().isBefore(
                resetOTP.getExpiryTime())) {
            return false;
        }

        if(resetOTP.getOtp().equals(otp)){
            userOtpRepository.deleteByUser(user);
            return true;
        }

        return false;
    }
}