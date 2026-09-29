package com.example.authenticationservice.Repository;

import com.example.authenticationservice.Entity.PasswordResetOTP;
import com.example.authenticationservice.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserOtpRepository extends JpaRepository<PasswordResetOTP,Long> {
    public void deleteByUser(User user);
    public Optional<PasswordResetOTP> findByUser(User user);
}
