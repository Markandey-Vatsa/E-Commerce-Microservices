package com.example.paymentservice.Services;
import com.example.paymentservice.DTO.PaymentOrderResponse;
import com.example.paymentservice.DTO.PaymentVerificationRequest;


import java.math.BigDecimal;

public interface PaymentServiceInterface {
     PaymentOrderResponse createPaymentOrder(BigDecimal amount, Long orderId);
     boolean verifyPayment(PaymentVerificationRequest request);
}
