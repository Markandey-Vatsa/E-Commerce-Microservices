package com.example.deliveryservice.Controller;
import com.example.deliveryservice.DTO.DeliveryTransferDTO;
import com.example.deliveryservice.Entity.Delivery;
import com.example.deliveryservice.Entity.DeliveryAddress;
import com.example.deliveryservice.Services.Services;
import lombok.RequiredArgsConstructor;
import org.apache.catalina.connector.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;



@RequiredArgsConstructor
@RestController
public class DeliveryControllers {

    private final Services services;

//    WILL BE CALLED FROM ORDER SERVICE AND ASSIGN IT
    @PostMapping("/createShipment")
    public ResponseEntity<?> createDeliveryShipment(@RequestBody DeliveryTransferDTO deliveryTransferDTO) {
//        TODO: Create delivery shipment and notify order service --> DONE
        Delivery delivery = services.createShipment(deliveryTransferDTO);
        services.assignShipment(delivery);

        return new ResponseEntity<>(HttpStatus.CREATED);
    }

}
