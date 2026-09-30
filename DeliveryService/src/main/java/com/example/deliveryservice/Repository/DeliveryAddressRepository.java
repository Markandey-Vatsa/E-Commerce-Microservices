package com.example.deliveryservice.Repository;

import com.example.deliveryservice.Entity.DeliveryAddress;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryAddressRepository extends JpaRepository<DeliveryAddress, Long> {
}
