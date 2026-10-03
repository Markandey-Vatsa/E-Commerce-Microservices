package com.example.productservice.Services;

import com.example.productservice.DTO.StockReservationRequest;
import com.example.productservice.DTO.StockReservationResponse;
import com.example.productservice.DTO.StockUpdateRequest;
import com.example.productservice.Entity.Product;
import com.example.productservice.Entity.ReservedProductStock;
import com.example.productservice.GlobalExceptionalHandler.InsufficientStockException;
import com.example.productservice.GlobalExceptionalHandler.ProductNotFoundException;
import com.example.productservice.GlobalExceptionalHandler.ReservationNotFouncException;
import com.example.productservice.Repository.ProductRepository;
import com.example.productservice.Repository.ReservedStockRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;


@RequiredArgsConstructor
@Service
public class Services {
    private final ProductRepository productRepository;
    private final ReservedStockRepository reservedStockRepository;
    public boolean createProduct(Product product) {
        productRepository.save(product);
        return true;
    }

    public List<Product> findAll(){
        return productRepository.findAll();
    }

    public  Product findById(Long id){
        return productRepository.findById(id).orElseThrow(()->new ProductNotFoundException("Product not found"));
    }

    public boolean updateProduct(Product product){
        Product product1 = productRepository.findById(product.getId()).orElseThrow(()->new ProductNotFoundException("Product not found"));
        product1.setName(product.getName());
        product1.setDescription(product.getDescription());
        product1.setPrice(product.getPrice());
        product.setStock(product.getStock());
        productRepository.save(product1);
        return true;
    }


    public boolean deleteProduct(Long id){
        Product product1 = productRepository.findById(id).orElseThrow(()->new ProductNotFoundException("Product not found"));
        productRepository.deleteById(id);
        return true;
    }


//    public Product reduceStock(Long productId, StockUpdateRequest quantity) {
//
//        Product product = productRepository.findById(productId)
//                .orElseThrow(() ->
//                        new RuntimeException("Product not found"));
//
//        if (product.getStock() < quantity.getQuantity()) {
//            throw new RuntimeException("Insufficient stock");
//        }
//
//        product.setStock(product.getStock() - quantity.getQuantity());
//
//        productRepository.save(product);
//
//        return product;
//    }


    @Transactional
    public StockReservationResponse reserveStock(StockReservationRequest request){
        Product product = productRepository.findByIdForUpdate(request.getProductId()).orElseThrow(()->new ProductNotFoundException("Product not found"));
        if(product.getStock() < request.getQuantity()){
            StockReservationResponse stockReservationResponse = new StockReservationResponse();
            stockReservationResponse.setProductId(product.getId());
            stockReservationResponse.setMessage("Insufficient stock");
            stockReservationResponse.setQuantity(null);
            stockReservationResponse.setReservationId(null);
            stockReservationResponse.setSuccess(Boolean.FALSE);
            return stockReservationResponse;
        }

        ReservedProductStock reservedProductStock = new ReservedProductStock();
        reservedProductStock.setCreatedAt(LocalDateTime.now());
        reservedProductStock.setExpiresAt(LocalDateTime.now().plusMinutes(30));
        reservedProductStock.setOrderId(request.getOrderId());
        reservedProductStock.setProductId(product.getId());
        reservedProductStock.setQuantity(request.getQuantity());

        reservedStockRepository.save(reservedProductStock);
        product.setStock(product.getStock() - request.getQuantity());
        productRepository.save(product);

        StockReservationResponse stockReservationResponse = new StockReservationResponse();
        stockReservationResponse.setProductId(product.getId());
        stockReservationResponse.setMessage(product.getName() + " has been reserved");
        stockReservationResponse.setQuantity(request.getQuantity());
        stockReservationResponse.setReservationId(reservedProductStock.getReservationId());
        stockReservationResponse.setSuccess(Boolean.TRUE);
        stockReservationResponse.setUnitPrice(product.getPrice());

        return stockReservationResponse;
    }


    @Transactional
    public void releaseStock(Long reservationId) {
        ReservedProductStock reservation =
                reservedStockRepository.findById(reservationId)
                        .orElseThrow(() ->
                                new ReservationNotFouncException("Reservation not found"));
        Product product =
                productRepository.findByIdForUpdate(reservation.getProductId())
                        .orElseThrow(() ->
                                new ProductNotFoundException("Product not found"));
        product.setStock(
                product.getStock() + reservation.getQuantity()
        );
        productRepository.save(product);
        reservedStockRepository.delete(reservation);
    }


    @Scheduled(fixedRate = 60000)
    @Transactional
    public void releaseExpiredReservations() {
        List<ReservedProductStock> expiredReservations =
                reservedStockRepository.findByExpiresAtBefore(LocalDateTime.now());
        for (ReservedProductStock reservation : expiredReservations) {
            Product product = productRepository
                    .findByIdForUpdate(reservation.getProductId())
                    .orElse(null);
            if (product == null) {
                continue;
            }
            product.setStock(
                    product.getStock() + reservation.getQuantity()
            );
            productRepository.save(product);
            reservedStockRepository.delete(reservation);
        }
    }




}
