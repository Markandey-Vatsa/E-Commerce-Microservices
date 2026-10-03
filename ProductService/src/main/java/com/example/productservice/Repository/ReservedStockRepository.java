package com.example.productservice.Repository;

import com.example.productservice.Entity.ReservedProductStock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservedStockRepository extends JpaRepository<ReservedProductStock,Long> {

    List<ReservedProductStock> findByExpiresAtBefore(LocalDateTime time);
}
