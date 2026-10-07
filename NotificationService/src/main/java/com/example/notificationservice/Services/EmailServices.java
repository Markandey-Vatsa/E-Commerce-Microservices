package com.example.notificationservice.Services;
import com.example.notificationservice.Entity.UserContactInfo;
import com.example.notificationservice.Repository.UserContactDetailsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

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
}
