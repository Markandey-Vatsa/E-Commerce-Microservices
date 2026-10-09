package com.example.notificationservice.Services;
import com.example.notificationservice.Entity.UserContactInfo;
import com.example.notificationservice.EventsPojo.NotificationEvent;
import com.example.notificationservice.EventsPojo.PaymentNotification;
import com.example.notificationservice.EventsPojo.UserRegisteredEvent;
import com.example.notificationservice.Repository.UserContactDetailsRepository;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class KafkaConsumer {

    private final EmailServices emailServices;
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

        UserContactInfo user =
                userContactDetailsRepository.save(userContactInfo);

        emailServices.userRegistrationMail(user);
    }

    @KafkaListener(
            topics = "notification-events",
            groupId = "notification-service"
    )
    public void handleNotificationEvent(
            ConsumerRecord<String, Object> record) {

        Object event = record.value();

        if (event == null) {
            System.out.println("Received null event from Kafka");
            return;
        }

        System.out.println("Received event from topic: " + record.topic());
        System.out.println("Event type: " + event.getClass().getName());

        if (event instanceof NotificationEvent notification) {

            String eventType = notification.getEventType();
            Long userId = notification.getUserId();

            switch (eventType) {
                case "ORDER_CREATED" ->
                        emailServices.orderCreatedEvent(userId);

                default ->
                        System.out.println(
                                "Unknown notification event: " + eventType
                        );
            }

        } else if (event instanceof PaymentNotification payment) {

            emailServices.paymentNotification(payment);

        } else {
            System.out.println(
                    "Unsupported notification event: "
                            + event.getClass().getName()
            );
        }
    }
}