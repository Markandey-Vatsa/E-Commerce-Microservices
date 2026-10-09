package com.example.notificationservice.Services;
import com.example.notificationservice.Entity.UserContactInfo;
import com.example.notificationservice.EventsPojo.PaymentNotification;
import com.example.notificationservice.Repository.UserContactDetailsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class EmailServices {

    private final UserContactDetailsRepository userContactDetailsRepository;
    private final JavaMailSender mailSender;

    public void sendMail(String to, String subject, String text){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }

    public void userRegistrationMail(UserContactInfo userContactInfo){
        String firstName = userContactInfo.getFirstName();
        String email = userContactInfo.getEmail();
        String subject = "Welcome to our platform.";
        String text = "Hello " + firstName + ",\n\n" +
                "Welcome to our platform!\n\n" +
                "Your account has been successfully created.\n\n" +
                "Regards,\n" +
                "E-Commerce Team";
        sendMail(email, subject, text);
    }

    public void orderCreatedEvent(Long userId){
        UserContactInfo contactInfo = userContactDetailsRepository.findByUserId(userId);
        String firstName = contactInfo.getFirstName();
        String email = contactInfo.getEmail();
        String topic = "Order created, make the payment !!";
        String text = "Dear "+firstName + ",\n\n"+
                "Your order is created, kindly make the payment within 30 mins to continue with the order.\n\n" +
                "Regards, \n"+
                "E-Commerce Team";
        sendMail(email, topic, text);
    }

    public void paymentNotification(PaymentNotification notif){
        UUID orderId =  notif.getOrderId();
        Long userId =  notif.getUserId();
        BigDecimal amount = notif.getAmount();

        UserContactInfo contactInfo = userContactDetailsRepository.findByUserId(userId);
        String firstName = contactInfo.getFirstName();
        String email = contactInfo.getEmail();
        String status = notif.getStatus();

        String topic = null;
        String text = null;

        if(status.equals("SUCCESS")) {
            topic = "Payment Successful";
            text = "Dear " + firstName + ",\n\n" +
                    "Your payment of INR " + amount + " for Order ID " + orderId +
                    " has been processed successfully.\n\n" +
                    "Regards,\n" +
                    "E-Commerce Team";
            sendMail(email, topic, text);
        }else  if(status.equals("FAILURE")){
            topic = "Payment Failed";
            text = "Dear " + firstName + ",\n\n" +
                    "Unfortunately, your payment of INR " + amount +
                    " for Order ID " + orderId +
                    " could not be processed.\n\n" +
                    "If any amount was debited, please verify your payment status " +
                    "before attempting another payment.\n\n" +
                    "Regards,\n" +
                    "E-Commerce Team";
            sendMail(email, topic, text);
        }
    }
}
