package com.example.deliveryservice.Controller;
import com.example.deliveryservice.DTO.DeliveryPartnerDetails;
import com.example.deliveryservice.DTO.DeliveryTransferDTO;
import com.example.deliveryservice.Entity.Delivery;
import com.example.deliveryservice.Entity.DeliveryAddress;
import com.example.deliveryservice.Repository.DeliveryPartnersRepository;
import com.example.deliveryservice.Services.Services;
import lombok.RequiredArgsConstructor;
import org.apache.catalina.connector.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



@RequiredArgsConstructor
@RestController
@RequestMapping("/delivery/")
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

//    DELIVERY PARTNERS CAN BE ADDED BY ADMIN
    @PostMapping("/create/delivery-partner")
    public ResponseEntity<?> createDeliveryPartner(@RequestBody DeliveryPartnerDetails partnerDetails){
       boolean status = services.addDeliveryPartner(partnerDetails);
       if(status){
           return new ResponseEntity<>("Partner created", HttpStatus.CREATED);
       }
       return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

}
