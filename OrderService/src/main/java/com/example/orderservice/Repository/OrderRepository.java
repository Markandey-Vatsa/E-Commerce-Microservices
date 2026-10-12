package com.example.orderservice.Repository;
import com.example.orderservice.Entity.Order;
import com.example.orderservice.Entity.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order,UUID> {

    List<Order> findByUserId(Long userId);
    Optional<Order> findById(UUID orderId);
    List<Order> findByStatusAndCreatedAtBefore(Status status, LocalDateTime cutoff);
}
