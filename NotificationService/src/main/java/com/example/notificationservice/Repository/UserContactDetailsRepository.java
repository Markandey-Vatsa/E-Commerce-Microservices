package com.example.notificationservice.Repository;
import com.example.notificationservice.Entity.UserContactInfo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserContactDetailsRepository extends JpaRepository<UserContactInfo,Long> {

    UserContactInfo findByUserId(Long userId);
}
