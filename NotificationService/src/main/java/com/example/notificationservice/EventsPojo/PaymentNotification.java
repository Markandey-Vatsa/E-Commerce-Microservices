package com.example.notificationservice.EventsPojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentNotification {
    String status;
    private UUID orderId;
    private Long userId;
    private BigDecimal amount;
}
