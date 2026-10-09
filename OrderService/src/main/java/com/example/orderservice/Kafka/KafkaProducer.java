package com.example.orderservice.Kafka;
import com.example.orderservice.EventsPOJO.NotificationEvent;
import com.example.orderservice.EventsPOJO.PaymentNotification;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KafkaProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendNotificationEvent(NotificationEvent event) {
        kafkaTemplate.send("notification-events", event);
    }

    public void sendPaymentNotification(PaymentNotification notif) {
        kafkaTemplate.send("notification-events",notif);
    }
}
