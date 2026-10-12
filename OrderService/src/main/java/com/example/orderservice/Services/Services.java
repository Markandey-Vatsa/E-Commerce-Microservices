package com.example.orderservice.Services;

import com.example.orderservice.DTO.*;
import com.example.orderservice.Entity.Order;
import com.example.orderservice.Entity.Status;
import com.example.orderservice.EventsPOJO.NotificationEvent;
import com.example.orderservice.EventsPOJO.PaymentNotification;
import com.example.orderservice.GlobalExceptionalHandler.OrderNotFoundException;
import com.example.orderservice.Kafka.KafkaProducer;
import com.example.orderservice.Repository.OrderRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


@Service
public class Services {
    private final OrderRepository orderRepository;
    private final RestClient productRestClient;
    private final RestClient deliveryRestClient;
    private final RestClient paymentServiceRestClient;
    private final KafkaProducer kafkaProducer;

    Services(OrderRepository orderRepository,
             @Qualifier("productRestClient") RestClient productRestClient,
             @Qualifier("deliveryRestClient") RestClient deliveryRestClient,
             @Qualifier("paymentServiceClient") RestClient paymentServiceRestClient,
             KafkaProducer kafkaProducer) {
        this.orderRepository = orderRepository;
        this.productRestClient = productRestClient;
        this.deliveryRestClient = deliveryRestClient;
        this.paymentServiceRestClient = paymentServiceRestClient;
        this.kafkaProducer = kafkaProducer;
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


    public OrderResponse createOrder(OrderRequestDTO orderDTO, String authorizationHeader){

        Order order = orderFromOrderRequestDTO(orderDTO);
        order.setOrderId(UUID.randomUUID());
        StockReservationRequest request = new StockReservationRequest();
        request.setQuantity(order.getQuantity());
        request.setOrderId(order.getOrderId());
        request.setProductId(order.getProdId());


        StockReservationResponse response = productRestClient.post()
                .uri("/products/reserveStock")
                .header("Authorization",authorizationHeader)
                .body(request)
                .retrieve()
                .body(StockReservationResponse.class);

        OrderResponse orderResponse = new OrderResponse();

        if(!response.isSuccess()){
            orderResponse.setMessage(response.getMessage());
            orderResponse.setSuccess(response.isSuccess());
            orderResponse.setOrderId(order.getOrderId());
            return orderResponse;
        }

        order.setReservationId(response.getReservationId());
        order.setPrice(response.getUnitPrice().multiply(
                BigDecimal.valueOf(order.getQuantity())
        ));

        order.setStatus(Status.PENDING_PAYMENT);
        orderRepository.save(order);
        orderResponse.setMessage(response.getMessage());
        orderResponse.setSuccess(response.isSuccess());
        orderResponse.setOrderId(order.getOrderId());
        NotificationEvent event = new NotificationEvent(
                "ORDER_CREATED",
                order.getUserId()
        );
        kafkaProducer.sendNotificationEvent(event);
        return orderResponse;
    }

    public CheckoutDetailsDTO createPayment(UUID orderId,String authorizationHeader){
        //        TODO: CALL PAYMENT SERVICE FOR THE PAYMENT, ONCE IT RETURNS CHECKOUT DETAILS-> send those details to frontend from orderCreate controller -> then frontend will verify payment by calling payment service -> then frontend will hit make-delivery controller to confirm the order. --> DONE
       Order order = orderRepository.findById(orderId).orElse(null);
       if(order.getStatus().equals(Status.CANCELLED)){
           throw new OrderNotFoundException("Order Not Found");
       }
       if(order == null) throw new OrderNotFoundException("Order Not Found");
        CheckoutDetailsDTO checkoutDetailsDTO = paymentServiceRestClient.post()
                .uri("/payments/create/{orderId}",order.getOrderId())
                .header("Authorization",authorizationHeader)
                .body(order.getPrice())
                .retrieve()
                .body(CheckoutDetailsDTO.class);
        return checkoutDetailsDTO;
    }

    public boolean changeOrderStatusToConfirm(UUID orderId, String authorizationHeader){
        Order order = orderRepository.findById(orderId).orElse(null);
        if(order == null) throw new OrderNotFoundException("Order Not Found");
//        order.setStatus(status);
//        orderRepository.save(order);
        Long userId = order.getUserId();
        BigDecimal amount =  order.getPrice();
        boolean success = confirmAndDeliverOrder(orderId,authorizationHeader);
        String status = null;
        if(success) status = "SUCCESS";
        else status = "FAILURE";
        kafkaProducer.sendPaymentNotification(new PaymentNotification(status,orderId,userId,amount));
        return success;
    }



    public boolean confirmAndDeliverOrder(
            UUID orderId,
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

    @Scheduled(fixedRate = 60000)
    public void cancelExpiredOrders() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(30);
        List<Order> expiredOrders =
                orderRepository.findByStatusAndCreatedAtBefore(
                        Status.PENDING_PAYMENT, cutoff);
        for (Order order : expiredOrders) {
            try {
                if (order.getStatus() != Status.PENDING_PAYMENT) {
                    continue;
                }
                order.setStatus(Status.CANCELLED);
                orderRepository.save(order);

            } catch (Exception e) {
                System.err.println(
                        "Failed to cancel order " + order.getOrderId()
                                + ": " + e.getMessage()
                );
            }
        }
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

    public Order getOrder(UUID id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));
    }

    public List<Order> getOrdersByUserId(Long userId){
        List<Order> orderList = orderRepository.findByUserId(userId);
        return orderList;
    }

    public void deleteOrderById(UUID orderId){
        Order order = getOrder(orderId);
        if(order != null) {
            orderRepository.delete(order);
        }else{
            throw new OrderNotFoundException("Order not found");
        }
    }

}
