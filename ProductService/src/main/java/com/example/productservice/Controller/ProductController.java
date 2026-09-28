package com.example.productservice.Controller;


import com.example.productservice.DTO.StockUpdateRequest;
import com.example.productservice.Entity.Product;
import com.example.productservice.Services.Services;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RequiredArgsConstructor
@RestController
@RequestMapping("/products")
public class ProductController {

    private final Services services;

    @PostMapping("/createProduct")
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        boolean created = services.createProduct(product);

        if(created){
            return new ResponseEntity<>(HttpStatus.CREATED);
        }
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }


    @GetMapping("/getProducts")
    public ResponseEntity<?> getProducts() {
        List<Product> productList = services.findAll();
        return new ResponseEntity<>(productList, HttpStatus.OK);
    }

    @GetMapping("/getProduct/{id}")
    public ResponseEntity<?> getProduct(@PathVariable Long id) {
        Product product = services.findById(id);
        return new ResponseEntity<>(product, HttpStatus.OK);
    }

    @PutMapping("/updateProduct")
    public ResponseEntity<?> updateProduct(@RequestBody Product product) {
        boolean updated = services.updateProduct(product);
        if(updated){
            return new ResponseEntity<>("Product details updated !",HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

    @DeleteMapping("/deleteProduct")
    public ResponseEntity<?> deleteProduct(@RequestBody Product product) {
        boolean deleted = services.deleteProduct(product.getId());

        if(deleted){
            return new ResponseEntity<>("Product details deleted",HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }


//    -----------------REDUCE STOCK-----------------
   @PostMapping("/reduceStock/{id}")
    public ResponseEntity<?> reduceStock(@PathVariable Long id, @RequestBody StockUpdateRequest quantity){
        Product product = services.reduceStock(id,quantity);
        return new ResponseEntity<>(product.getPrice(),HttpStatus.OK);
   }


}
