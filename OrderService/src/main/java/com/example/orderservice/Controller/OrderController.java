package com.example.orderservice.Controller;
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
        boolean created =  services.createOrder(order,authorizationHeader);
        if(!created){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(HttpStatus.CREATED);
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
