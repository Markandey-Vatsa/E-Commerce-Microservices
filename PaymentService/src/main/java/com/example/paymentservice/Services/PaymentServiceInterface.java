package com.example.paymentservice.Services;
import com.example.paymentservice.DTO.PaymentOrderResponse;
import com.example.paymentservice.DTO.PaymentVerificationRequest;
import java.math.BigDecimal;
import java.util.UUID;

public interface PaymentServiceInterface {
     PaymentOrderResponse createPaymentOrder(BigDecimal amount, UUID orderId);
     boolean verifyPayment(PaymentVerificationRequest request);
}
