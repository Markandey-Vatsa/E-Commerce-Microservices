package com.example.productservice.Repository;
import com.example.productservice.Entity.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Existing pessimistic locking
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);


    // Existing seller-specific search
    List<Product> findBySellerEmail(String sellerEmail);


    // FULLTEXT product search with price filtering and pagination
    @Query(
            value = """
            SELECT p.*
            FROM products p
            WHERE MATCH(p.name, p.description)
                  AGAINST(:keyword IN NATURAL LANGUAGE MODE)

              AND (:minPrice IS NULL OR p.price >= :minPrice)

              AND (:maxPrice IS NULL OR p.price <= :maxPrice)

            ORDER BY MATCH(p.name, p.description)
                     AGAINST(:keyword IN NATURAL LANGUAGE MODE) DESC
            """,

            countQuery = """
            SELECT COUNT(*)
            FROM products p
            WHERE MATCH(p.name, p.description)
                  AGAINST(:keyword IN NATURAL LANGUAGE MODE)

              AND (:minPrice IS NULL OR p.price >= :minPrice)

              AND (:maxPrice IS NULL OR p.price <= :maxPrice)
            """,

            nativeQuery = true
    )
    Page<Product> searchProducts(
            @Param("keyword") String keyword,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable
    );

}
