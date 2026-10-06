package com.example.productservice.Services;
import com.example.productservice.DTO.StockReservationRequest;
import com.example.productservice.DTO.StockReservationResponse;
import com.example.productservice.Entity.Product;
import com.example.productservice.Entity.ReservedProductStock;
import com.example.productservice.GlobalExceptionalHandler.ProductNotFoundException;
import com.example.productservice.GlobalExceptionalHandler.ReservationNotFouncException;
import com.example.productservice.Repository.ProductRepository;
import com.example.productservice.Repository.ReservedStockRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


@RequiredArgsConstructor
@Service
public class Services {
    private final ProductRepository productRepository;
    private final ReservedStockRepository reservedStockRepository;
    public boolean createProduct(Product product, Authentication authentication) {
        String sellerEmail= authentication.getName();
        product.setSellerEmail(sellerEmail);
        productRepository.save(product);
        return true;
    }

    public List<Product> findAll(){
        return productRepository.findAll();
    }

    public  Product findById(Long id){
        return productRepository.findById(id).orElseThrow(()->new ProductNotFoundException("Product not found"));
    }

    public boolean updateProduct(
            Product product,
            Authentication authentication) {

        Product existingProduct = productRepository.findById(product.getId())
                .orElseThrow(() ->
                        new ProductNotFoundException("Product not found"));

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        String sellerEmail = authentication.getName();

        if (!isAdmin && !existingProduct.getSellerEmail().equals(sellerEmail)) {
            throw new AccessDeniedException(
                    "You cannot modify this product"
            );
        }

        existingProduct.setName(product.getName());
        existingProduct.setDescription(product.getDescription());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setStock(product.getStock());

        productRepository.save(existingProduct);

        return true;
    }


    public boolean deleteProduct(
            Long id,
            Authentication authentication) {

        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new ProductNotFoundException("Product not found"));

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        String sellerEmail = authentication.getName();

        if (!isAdmin && !product.getSellerEmail().equals(sellerEmail)) {
            throw new AccessDeniedException(
                    "You cannot delete this product"
            );
        }

        productRepository.delete(product);

        return true;
    }

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
    public void releaseStock(UUID orderId) {
        Long reservationId = reservedStockRepository.findByOrderId(orderId); // one reservation is associated to one order, hence both unique Ids for a row.
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


    public List<Product> getMyProducts(Authentication authentication){
        String email = authentication.getName();
        List<Product> products = productRepository.findBySellerEmail(email);
        return products;
    }



}
