package com.example.blouse.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOrderStatusUpdate(String toEmail, String customerName, String orderNumber, String newStatus, String comment) {
        if (fromEmail == null || fromEmail.isEmpty() || fromEmail.equals("your-email@gmail.com")) {
            System.out.println("Email notifications are not fully configured yet. Skipping email to " + toEmail);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Update on your Blouse Order #" + orderNumber);

            String prettyStatus = newStatus.replace("_", " ");
            
            StringBuilder body = new StringBuilder();
            body.append("Hello ").append(customerName).append(",\n\n");
            body.append("The status of your order (").append(orderNumber).append(") has been updated to: ").append(prettyStatus).append("\n\n");
            
            if (comment != null && !comment.trim().isEmpty()) {
                body.append("Note from our team: ").append(comment).append("\n\n");
            }
            
            body.append("Thank you for shopping with us!\n\n");
            body.append("- The Boutique Team");

            message.setText(body.toString());
            mailSender.send(message);
            System.out.println("Successfully sent order update email to " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }
}
