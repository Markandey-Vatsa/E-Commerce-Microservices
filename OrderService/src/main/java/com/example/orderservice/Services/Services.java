package com.example.orderservice.Services;

import com.example.orderservice.DTO.DeliveryTransferDTO;
import com.example.orderservice.DTO.OrderRequestDTO;
import com.example.orderservice.DTO.StockUpdateRequest;
import com.example.orderservice.Entity.Order;
import com.example.orderservice.GlobalExceptionalHandler.OrderNotFoundException;
import com.example.orderservice.Repository.OrderRepository;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.List;

import static io.jsonwebtoken.Jwts.header;


@Service
public class Services {
    private final OrderRepository orderRepository;
    private final RestClient productRestClient;
    private final RestClient deliveryRestClient;

    Services(OrderRepository orderRepository, @Qualifier("productRestClient") RestClient productRestClient, @Qualifier("deliveryRestClient") RestClient deliveryRestClient) {
        this.orderRepository = orderRepository;
        this.productRestClient = productRestClient;
        this.deliveryRestClient = deliveryRestClient;
    }



    private Order orderFromOrderRequestDTO(OrderRequestDTO orderRequestDTO){
        Order order = new Order();
        order.setProdId(orderRequestDTO.getProductId());
        order.setQuantity(orderRequestDTO.getQuantity());
        order.setUserId(orderRequestDTO.getUserId());
        return order;
    }


    public boolean createOrder(OrderRequestDTO orderDTO, String authorizationHeader){

        // 1. Call Product Service
        // 2. If stock update succeeds
        // 3. Save order
        Order order = orderFromOrderRequestDTO(orderDTO);
        StockUpdateRequest request = new StockUpdateRequest();
        request.setQuantity(order.getQuantity());

//        System.out.println(order.getProdId());


        BigDecimal price = productRestClient.post()
                .uri("/products/reduceStock/{id}", order.getProdId())
                .header("Authorization",authorizationHeader)
                .body(request)
                .retrieve()
                .body(BigDecimal.class);

        order.setPrice(price.multiply(
                BigDecimal.valueOf(order.getQuantity())
        ));

        orderRepository.save(order);

//        TODO: CREATE DELIVERY TRANSFER DTO AND SEND TO DELIVERY SERVICE -> DONE

        DeliveryTransferDTO deliveryTransferDTO = getDeliveryTransferDTO(orderDTO,order);

        HttpStatusCode status = deliveryRestClient.post()
                .uri("/createShipment")
                .header("Authorization", authorizationHeader)
                .body(deliveryTransferDTO)
                .retrieve()
                .toBodilessEntity()
                .getStatusCode();

        if (status != HttpStatus.CREATED) {
            return false;
        }

        return true;

    }


    private DeliveryTransferDTO getDeliveryTransferDTO(OrderRequestDTO orderRequestDTO,Order order){
        DeliveryTransferDTO deliveryTransferDTO = new DeliveryTransferDTO();
        deliveryTransferDTO.setDeliveryAddress(orderRequestDTO.getDeliveryAddressDTO());
        deliveryTransferDTO.setUserId(order.getUserId());
        deliveryTransferDTO.setOrderId(order.getOrderId());
        return deliveryTransferDTO;
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
