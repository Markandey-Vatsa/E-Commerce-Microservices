package com.example.paymentservice.Services;
import com.example.paymentservice.DTO.PaymentOrderResponse;
import com.example.paymentservice.DTO.PaymentVerificationRequest;
import com.example.paymentservice.Entity.Payment;
import com.example.paymentservice.Entity.PaymentStatus;
import com.example.paymentservice.GlobalExceptionalHandler.PaymentException;
import com.example.paymentservice.GlobalExceptionalHandler.PaymentNotFoundException;
import com.example.paymentservice.Reposiory.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PaymentService implements PaymentServiceInterface {
    @Value("${razorpay.key-id}")
    private String keyId;
    @Value("${razorpay.key-secret}")
    private String keySecret;

    private final RazorpayClient razorpayClient;
    private final PaymentRepository paymentRepository;
    @Qualifier("orderRestClient")
    private RestClient orderRestClient;

    public PaymentService(RazorpayClient razorpayClient,PaymentRepository paymentRepository, @Qualifier("orderRestClient") RestClient orderRestClient) {
        this.razorpayClient = razorpayClient;
        this.paymentRepository = paymentRepository;
        this.orderRestClient = orderRestClient;
    }

    @Override
    public PaymentOrderResponse createPaymentOrder(
            BigDecimal amount,
            UUID orderId) {
        JSONObject options = new JSONObject();
        options.put(
                "amount",
                amount.multiply(BigDecimal.valueOf(100)).intValue()
        );
        options.put("currency", "INR");
        options.put("receipt", "order_" + orderId);
        Order razorpayOrder;
        try {
             razorpayOrder = razorpayClient.orders.create(options);
        }catch(RazorpayException e){
            throw new PaymentException("Your payment provider failed.",e);
        }
        String razorpayOrderId =
                razorpayOrder.get("id");
        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setRazorpayOrderId(razorpayOrderId);
        payment.setAmount(amount);
        payment.setStatus(PaymentStatus.CREATED);
        payment.setPaymentDate(LocalDateTime.now());
        paymentRepository.save(payment);
        return new PaymentOrderResponse(
                razorpayOrderId,
                amount,
                "INR",
                keyId
        );
    }



    // 2. VERIFY PAYMENT
    @Override
    public boolean verifyPayment(
            PaymentVerificationRequest request) {
        JSONObject options = new JSONObject();
        options.put(
                "razorpay_order_id",
                request.getRazorpayOrderId()
        );

        options.put(
                "razorpay_payment_id",
                request.getRazorpayPaymentId()
        );

        options.put(
                "razorpay_signature",
                request.getRazorpaySignature()
        );
        boolean verified;
        try {
            // Verify Razorpay signature
            verified =
                    Utils.verifyPaymentSignature(
                            options,
                            keySecret
                    );
        }catch(RazorpayException e){
            throw new PaymentException("Your payment verification failed.",e);
        }

        if (!verified) {
            return false;
        }

        // Find our payment record
        Payment payment =
                paymentRepository
                        .findByRazorpayOrderId(
                                request.getRazorpayOrderId()
                        )
                        .orElseThrow(
                                () -> new PaymentNotFoundException(
                                        "Payment not found"
                                )
                        );

        // Update payment
        payment.setRazorpayPaymentId(
                request.getRazorpayPaymentId()
        );
//        TODO: MARK SUCCESS AFTER WEBHOOK RETURNS VERIFICATION RESPONSE TO THE SERVER
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaymentDate(LocalDateTime.now());
        paymentRepository.save(payment);
        if(payment.getStatus().equals(PaymentStatus.SUCCESS)){
            UUID orderId = payment.getOrderId();
            orderRestClient.post()
                    .uri("/orders/orderStatusConfirm")
                    .body(orderId)
                    .retrieve()
                    .toBodilessEntity();
        }

        return true;
    }
}

