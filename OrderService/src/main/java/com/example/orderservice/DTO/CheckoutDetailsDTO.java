package com.example.orderservice.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class CheckoutDetailsDTO {

    private String razorpayOrderId;
    private BigDecimal amount;
    private String currency;
    private String keyId;
}
