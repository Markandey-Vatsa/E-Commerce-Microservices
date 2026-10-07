package com.example.notificationservice.Services;

import com.example.notificationservice.Entity.UserContactInfo;
import com.example.notificationservice.EventsPojo.NotificationEvent;
import com.example.notificationservice.EventsPojo.UserRegisteredEvent;
import com.example.notificationservice.Repository.UserContactDetailsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;


@RequiredArgsConstructor
@Service
public class KafkaConsumer {
    private final EmailServices  emailServices;
    private final UserContactDetailsRepository userContactDetailsRepository;
    @KafkaListener(
            topics = "user-events",
            groupId = "notification-service"
    )
    public void consumeUserRegisteredEvent(UserRegisteredEvent event) {
        UserContactInfo userContactInfo = new UserContactInfo();
        userContactInfo.setFirstName(event.getFirstName());
        userContactInfo.setLastName(event.getLastName());
        userContactInfo.setEmail(event.getEmail());
        userContactInfo.setUserId(event.getUserId());
        UserContactInfo user = userContactDetailsRepository.save(userContactInfo);
        emailServices.userRegistrationMail(user);
    }

    @KafkaListener(
            topics = "notification-events",
            groupId = "notification-service"
    )
    public void handleNotificationEvent(NotificationEvent event) {
        String eventType = event.getEventType();
        Long userId = event.getUserId();
        System.out.println("EVENT HIT");
        switch (eventType){
            case "ORDER_CREATED": emailServices.orderCreatedEvent(userId);
            break;
        }
    }
}