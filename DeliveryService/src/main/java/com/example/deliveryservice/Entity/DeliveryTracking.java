package com.example.deliveryservice.Entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;


@Data
@Entity
public class DeliveryTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long deliveryId;

    @Enumerated(EnumType.STRING)
    private DeliveryStatus status;

    private String location;

    private LocalDateTime timestamp;

    private String description;

}