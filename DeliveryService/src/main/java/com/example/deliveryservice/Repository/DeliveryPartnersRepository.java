package com.example.deliveryservice.Repository;

import com.example.deliveryservice.Entity.DeliveryPartners;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryPartnersRepository extends JpaRepository<DeliveryPartners,Long> {
}
