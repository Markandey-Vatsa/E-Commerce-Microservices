package com.example.productservice.Services;

import com.example.productservice.DTO.StockUpdateRequest;
import com.example.productservice.Entity.Product;
import com.example.productservice.GlobalExceptionalHandler.ProductNotFoundException;
import com.example.productservice.Repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;


@RequiredArgsConstructor
@Service
public class Services {


    private final ProductRepository productRepository;


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


    public Product reduceStock(Long productId, StockUpdateRequest quantity) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        if (product.getStock() < quantity.getQuantity()) {
            throw new RuntimeException("Insufficient stock");
        }

        product.setStock(product.getStock() - quantity.getQuantity());

        productRepository.save(product);

        return product;
    }




}
