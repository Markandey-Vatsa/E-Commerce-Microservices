package com.example.authenticationservice.Service;

import com.example.authenticationservice.Entity.Role;
import com.example.authenticationservice.Entity.User;
import com.example.authenticationservice.GlobalExceptionHandler.RoleNotAllowedException;
import com.example.authenticationservice.Repository.UserRepository;
import com.example.authenticationservice.Utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class Services {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

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

        userRepository.save(user1);
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
                user.getUsername(),
                role
        );
    }
}