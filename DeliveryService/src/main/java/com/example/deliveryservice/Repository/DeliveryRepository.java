package com.example.deliveryservice.Repository;

import com.example.deliveryservice.Entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryRepository extends JpaRepository<Delivery,Long> {

}
