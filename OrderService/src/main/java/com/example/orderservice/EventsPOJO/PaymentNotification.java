package com.example.orderservice.EventsPOJO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentNotification {
    private String status;
    private UUID orderId;
    private Long userId;
    private BigDecimal amount;
}
