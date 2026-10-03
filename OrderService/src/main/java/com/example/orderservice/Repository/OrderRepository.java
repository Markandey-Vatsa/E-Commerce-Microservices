package com.example.orderservice.Repository;
import com.example.orderservice.Entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order,UUID> {

    List<Order> findByUserId(UUID userId);
    Optional<Order> findById(UUID orderId);
}
