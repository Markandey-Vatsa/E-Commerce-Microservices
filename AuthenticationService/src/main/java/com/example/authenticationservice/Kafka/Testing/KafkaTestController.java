//package com.example.authenticationservice.Kafka.Testing;
//
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//@RestController
//@RequestMapping("/kafka")
//public class KafkaTestController {
//
//    private final KafkaProducer kafkaProducer;
//
//    public KafkaTestController(KafkaProducer kafkaProducer) {
//        this.kafkaProducer = kafkaProducer;
//    }
//
//    @PostMapping("/send")
//    public String send(@RequestBody String message) {
//        kafkaProducer.sendMessage(message);
//        return "Message sent";
//    }
//}
