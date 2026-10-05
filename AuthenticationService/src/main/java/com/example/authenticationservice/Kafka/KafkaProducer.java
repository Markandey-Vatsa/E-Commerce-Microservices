package com.example.authenticationservice.Kafka;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducer {

    private final KafkaTemplate<String, UserRegisteredEvent> kafkaTemplate;

    public KafkaProducer(
            KafkaTemplate<String, UserRegisteredEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendUserRegisteredEvent(UserRegisteredEvent event) {
        kafkaTemplate.send("user-events", event);
    }
}