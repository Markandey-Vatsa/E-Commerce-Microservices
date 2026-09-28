package com.example.orderservice.Services;

import com.example.orderservice.DTO.StockUpdateRequest;
import com.example.orderservice.Entity.Order;
import com.example.orderservice.GlobalExceptionalHandler.OrderNotFoundException;
import com.example.orderservice.Repository.OrderRepository;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.List;


@RequiredArgsConstructor
@Service
public class Services {

    private final OrderRepository orderRepository;
    private final RestClient restClient;

    public boolean createOrder(Order order){

        // 1. Call Product Service
        // 2. If stock update succeeds
        // 3. Save order

        StockUpdateRequest request = new StockUpdateRequest();
        request.setQuantity(order.getQuantity());

        BigDecimal price = restClient.post()
                .uri("/products/reduceStock/{id}", order.getProdId())
                .body(request)
                .retrieve()
                .body(BigDecimal.class);

        order.setPrice(price.multiply(
                BigDecimal.valueOf(order.getQuantity())
        ));

        orderRepository.save(order);

        return true;
    }

    public Order getOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));
    }

    public List<Order> getOrdersByUserId(Long userId){
        List<Order> orderList = orderRepository.findByUserId(userId);
        return orderList;
    }

    public void deleteOrderById(Long orderId){
        Order order = getOrder(orderId);
        if(order != null) {
            orderRepository.delete(order);
        }else{
            throw new OrderNotFoundException("Order not found");
        }
    }

}
