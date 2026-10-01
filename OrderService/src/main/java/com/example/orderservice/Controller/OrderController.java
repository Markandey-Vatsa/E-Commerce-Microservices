package com.example.orderservice.Controller;
import com.example.orderservice.DTO.CheckoutDetailsDTO;
import com.example.orderservice.DTO.OrderRequestDTO;
import com.example.orderservice.Entity.Order;
import com.example.orderservice.Services.Services;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RequiredArgsConstructor
@RestController
@RequestMapping("/orders")
public class OrderController {

    private final Services services;

    @PostMapping("/createOrder")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequestDTO order, HttpServletRequest request){
        String authorizationHeader = request.getHeader("Authorization");
        CheckoutDetailsDTO dto =  services.createOrder(order,authorizationHeader);

//     it will create order (call product service to reduce stock), then payment.
//        Payment service will give it checkout info, which it will sent to frontend.
//        then frontend will call checkout link of razorpay.
//        then frontend will hit verify API of payment service to check if payment done.
//        After that -> frontend will call another controller of this service to make delivery.-> sending order ID

        return new ResponseEntity<>(dto, HttpStatus.OK);
    }

    @PostMapping("/make-delivery/{orderId}")
    public ResponseEntity<?> makeDelivery(@PathVariable Long orderId, HttpServletRequest request){
    String authorizationHeader = request.getHeader("Authorization");
    boolean delivery_created = services.confirmAndDeliverOrder(orderId,authorizationHeader);
    if(delivery_created){
        return new ResponseEntity<>("Shipment has been created",HttpStatus.OK);
    }
    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);

    }

    @GetMapping("/getOrder/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id){
        Order order = services.getOrder(id);
        return new ResponseEntity<>(order, HttpStatus.OK);
    }

    @GetMapping("/my-order/{user_id}")
    public ResponseEntity<?> getMyOrder(@PathVariable Long user_id){
        List<Order> orderList = services.getOrdersByUserId(user_id);
        return new ResponseEntity<>(orderList, HttpStatus.OK);
    }

    @DeleteMapping("/deleteOrder/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id){
        services.deleteOrderById(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
