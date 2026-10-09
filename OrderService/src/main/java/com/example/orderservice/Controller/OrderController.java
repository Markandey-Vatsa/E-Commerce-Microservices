package com.example.orderservice.Controller;
import com.example.orderservice.DTO.CheckoutDetailsDTO;
import com.example.orderservice.DTO.OrderRequestDTO;
import com.example.orderservice.DTO.OrderResponse;
import com.example.orderservice.Entity.Order;
import com.example.orderservice.Entity.Status;
import com.example.orderservice.Services.Services;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;


@RequiredArgsConstructor
@RestController
@RequestMapping("/orders")
public class OrderController {

    private final Services services;

    @PostMapping("/createOrder")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequestDTO order, HttpServletRequest request){
        String authorizationHeader = request.getHeader("Authorization");
        OrderResponse orderResponse =  services.createOrder(order,authorizationHeader);
        if(!orderResponse.isSuccess()) return new ResponseEntity<>(orderResponse,HttpStatus.CONFLICT);
        return new ResponseEntity<>(orderResponse, HttpStatus.OK);
    }

    @PostMapping("/make-payment/{orderId}")
    public ResponseEntity<?> makePayment(@PathVariable UUID orderId,HttpServletRequest request){
        String authorizationHeader = request.getHeader("Authorization");
        CheckoutDetailsDTO checkoutDetailsDTO = services.createPayment(orderId,authorizationHeader);
        return new ResponseEntity<>(checkoutDetailsDTO,HttpStatus.OK);
    }
//    ONCE PAYMENT IS VERIFIED, THAT FUNCTION WILL CALL THIS CONTROLLER TO CHANGE THE STATUS OF ORDER FROM PAYMENT_PENDING -> CONFIRM
    @PostMapping("/orderStatusConfirm")
    public ResponseEntity<?> orderStatusConfirm(@RequestBody UUID orderId, HttpServletRequest request){
        String authorizationHeader = request.getHeader("Authorization");
//        In this service, the notification of payment verification event is sent into notification-event topic.
        boolean status = services.changeOrderStatusToConfirm(orderId,authorizationHeader);
        if(status){
        return new ResponseEntity<>("Shipment has been created",HttpStatus.OK);
    }
    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }


    @GetMapping("/getOrder/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable UUID id){
        Order order = services.getOrder(id);
        return new ResponseEntity<>(order, HttpStatus.OK);
    }

    @GetMapping("/my-order/{user_id}")
    public ResponseEntity<?> getMyOrder(@PathVariable Long user_id){
        List<Order> orderList = services.getOrdersByUserId(user_id);
        return new ResponseEntity<>(orderList, HttpStatus.OK);
    }

    @DeleteMapping("/deleteOrder/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable UUID id){
        services.deleteOrderById(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
