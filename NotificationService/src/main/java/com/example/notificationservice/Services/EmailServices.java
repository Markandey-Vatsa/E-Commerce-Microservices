package com.example.notificationservice.Services;
import com.example.notificationservice.Entity.UserContactInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class EmailServices {

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

}
