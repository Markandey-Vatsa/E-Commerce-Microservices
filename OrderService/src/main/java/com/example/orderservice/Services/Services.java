package com.example.orderservice.Services;

import com.example.orderservice.DTO.*;
import com.example.orderservice.Entity.Order;
import com.example.orderservice.Entity.Status;
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
    private final RestClient paymentServiceRestClient;

    Services(OrderRepository orderRepository,
             @Qualifier("productRestClient") RestClient productRestClient,
             @Qualifier("deliveryRestClient") RestClient deliveryRestClient,
             @Qualifier("paymentServiceClient") RestClient paymentServiceRestClient) {
        this.orderRepository = orderRepository;
        this.productRestClient = productRestClient;
        this.deliveryRestClient = deliveryRestClient;
        this.paymentServiceRestClient = paymentServiceRestClient;
    }



    private Order orderFromOrderRequestDTO(OrderRequestDTO orderRequestDTO){
        Order order = new Order();
        order.setProdId(orderRequestDTO.getProductId());
        order.setQuantity(orderRequestDTO.getQuantity());
        order.setUserId(orderRequestDTO.getUserId());
        order.setHouseNumber(orderRequestDTO.getDeliveryAddressDTO().getHouseNumber());
        order.setStreet(orderRequestDTO.getDeliveryAddressDTO().getStreet());
        order.setCity(orderRequestDTO.getDeliveryAddressDTO().getCity());
        order.setState(orderRequestDTO.getDeliveryAddressDTO().getState());
        order.setPostalCode(orderRequestDTO.getDeliveryAddressDTO().getPostalCode());
        return order;
    }


    public CheckoutDetailsDTO createOrder(OrderRequestDTO orderDTO, String authorizationHeader){

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

        //        TODO: CALL PAYMENT SERVICE FOR THE PAYMENT, ONCE IT RETURNS CHECKOUT DETAILS-> send those details to frontend from orderCreate controller -> then frontend will verify payment by calling payment service -> then frontend will hit make-delivery controller to confirm the order.
        CheckoutDetailsDTO checkoutDetailsDTO = paymentServiceRestClient.post()
                .uri("/payments/create/{orderId}",order.getOrderId())
                .body(order.getPrice())
                .retrieve()
                .body(CheckoutDetailsDTO.class);

       return checkoutDetailsDTO;
    }


    public boolean confirmAndDeliverOrder(
            Long orderId,
            String authorizationHeader) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        DeliveryTransferDTO deliveryTransferDTO =
                getDeliveryTransferDTO(order);

        HttpStatusCode status = deliveryRestClient.post()
                .uri("/createShipment")
                .header("Authorization", authorizationHeader)
                .body(deliveryTransferDTO)
                .retrieve()
                .toBodilessEntity()
                .getStatusCode();

         if(status == HttpStatus.CREATED){
             order.setStatus(Status.CONFIRMED);
             orderRepository.save(order);
             return true;
         }

         return false;
    }


    private DeliveryTransferDTO getDeliveryTransferDTO(Order order){
        DeliveryTransferDTO dto = new DeliveryTransferDTO();
        DeliveryAddressDTO address = new DeliveryAddressDTO();
        address.setCity(order.getCity());
        address.setHouseNumber(order.getHouseNumber());
        address.setPostalCode(order.getPostalCode());
        address.setState(order.getState());
        address.setStreet(order.getStreet());
        dto.setDeliveryAddress(address);
        dto.setUserId(order.getUserId());
        dto.setOrderId(order.getOrderId());
        return dto;

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
