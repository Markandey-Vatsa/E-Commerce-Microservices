package com.example.paymentservice.Services;


import com.example.paymentservice.DTO.PaymentOrderResponse;
import com.example.paymentservice.DTO.PaymentVerificationRequest;
import com.example.paymentservice.Entity.Payment;
import com.example.paymentservice.Entity.PaymentStatus;
import com.example.paymentservice.Reposiory.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import jakarta.annotation.PostConstruct;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class PaymentService {
    @Value("${razorpay.key-id}")
    private String keyId;
    @Value("${razorpay.key-secret}")
    private String keySecret;

    private final RazorpayClient razorpayClient;
    private final PaymentRepository paymentRepository;

    public PaymentService(RazorpayClient razorpayClient,PaymentRepository paymentRepository) {
        this.razorpayClient = razorpayClient;
        this.paymentRepository = paymentRepository;
    }


    @PostConstruct
    public void checkRazorpayCredentials() {
        System.out.println("Key ID = " + keyId);
        System.out.println("Secret length = " +
                (keySecret == null ? "NULL" : keySecret.length()));
    }


    public PaymentOrderResponse createRazorpayOrder(
            BigDecimal amount,
            Long orderId) throws RazorpayException {

        JSONObject options = new JSONObject();

        options.put(
                "amount",
                amount.multiply(BigDecimal.valueOf(100)).intValue()
        );

        options.put("currency", "INR");
        options.put("receipt", "order_" + orderId);

        Order razorpayOrder =
                razorpayClient.orders.create(options);

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
    public boolean verifyPayment(
            PaymentVerificationRequest request)
            throws RazorpayException {

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

        // Verify Razorpay signature
        boolean verified =
                Utils.verifyPaymentSignature(
                        options,
                        keySecret
                );

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
                                () -> new RuntimeException(
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

        return true;
    }
}

