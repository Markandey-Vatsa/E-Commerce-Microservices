package com.example.paymentservice.Controller;
import com.example.paymentservice.DTO.PaymentVerificationRequest;
import com.example.paymentservice.DTO.PaymentOrderResponse;
import com.example.paymentservice.Services.PaymentService;
import com.razorpay.RazorpayException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;

//@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create/{orderId}")
    public ResponseEntity<?> createPayment(
            @PathVariable Long orderId,
            @RequestBody BigDecimal amount) {

        try {

            PaymentOrderResponse response =
                    paymentService.createRazorpayOrder(amount, orderId);
            return ResponseEntity.ok(response);

        } catch (RazorpayException e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Payment creation failed"+e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @RequestBody PaymentVerificationRequest request) {
        try {
            boolean verified =
                    paymentService.verifyPayment(request);
            if (verified) {
                return ResponseEntity.ok("Payment verified successfully");
            }
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Payment verification failed");

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Payment verification error");
        }
    }



//    TODO: RECEIVE THE RESPONSE FROM RAZORPAY WEBHOOK FOR PAYMENT VERIFICATION
//    FIRST CHECK IF WE RECEIVE WEBHOOK RESPONSE
@PostMapping("/webhook")
public ResponseEntity<?> handleWebhook(
        @RequestBody String payload,
        @RequestHeader("X-Razorpay-Signature") String signature) {

    System.out.println("Webhook received");
    System.out.println("Signature: " + signature);
    System.out.println("Payload: " + payload);

    return ResponseEntity.ok().build();
}

}