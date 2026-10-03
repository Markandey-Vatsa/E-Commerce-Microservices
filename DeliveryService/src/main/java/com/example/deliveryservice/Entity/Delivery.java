package com.example.deliveryservice.Entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;


@Data
@Entity
public class Delivery {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private UUID orderId;
    private Long customerId;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "address_id")
    private DeliveryAddress deliveryAddress;

    private Long deliveryPartnerId;
    private String trackingNumber;
    @Enumerated(EnumType.STRING)
    private DeliveryStatus status;
    private LocalDateTime estimatedDeliveryDate;
    private LocalDateTime deliveredAt;
    private LocalDateTime createdAt;
}
