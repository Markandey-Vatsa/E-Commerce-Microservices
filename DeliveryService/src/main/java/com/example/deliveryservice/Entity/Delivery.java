package com.example.deliveryservice.Entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;



@Data
@Entity
public class Delivery {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long orderId;
    private Long customerId;
    @Embedded
    private DeliveryAddress deliveryAddress;
    private Long deliveryPartnerId;
    private String trackingNumber;
    @Enumerated(EnumType.STRING)
    private DeliveryStatus status;
    private LocalDateTime estimatedDeliveryDate;
    private LocalDateTime deliveredAt;
    private LocalDateTime createdAt;
}
