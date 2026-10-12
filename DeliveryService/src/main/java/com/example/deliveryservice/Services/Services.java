package com.example.deliveryservice.Services;


import com.example.deliveryservice.DTO.DeliveryPartnerDetails;
import com.example.deliveryservice.DTO.DeliveryTransferDTO;
import com.example.deliveryservice.Entity.*;
import com.example.deliveryservice.GlobalExceptionHandler.NoDeliveryPartnerAvailable;
import com.example.deliveryservice.Repository.DeliveryAddressRepository;
import com.example.deliveryservice.Repository.DeliveryPartnersRepository;
import com.example.deliveryservice.Repository.DeliveryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;


@RequiredArgsConstructor
@Service
public class Services {

    private final DeliveryRepository deliveryRepository;
    private final DeliveryPartnersRepository deliveryPartnersRepository;
    private final DeliveryAddressRepository deliveryAddressRepository;

    public Delivery createShipment(DeliveryTransferDTO deliveryTransferDTO){

        DeliveryAddress deliveryAddress = getDeliveryAddressFromDTO(deliveryTransferDTO);
        Delivery delivery = new Delivery();
        delivery.setDeliveryAddress(deliveryAddress);
        delivery.setOrderId(deliveryTransferDTO.getOrderId());
        delivery.setCustomerId(deliveryTransferDTO.getUserId());
        delivery.setCreatedAt(LocalDateTime.now());
        delivery.setEstimatedDeliveryDate(LocalDateTime.now().plusWeeks(1));

//        SAVE DELIVERY ADDRESS IN ADDRESS TABLE
        deliveryAddressRepository.save(deliveryAddress);


        //TODO: CREATE A SERVICE WHICH FINDS DELIVERY PARTNERS AVAILABLE AND SET PARTNER ID. // -> DONE

        delivery.setTrackingNumber(generateTrackingNumber());
        delivery.setStatus(DeliveryStatus.CREATED);

//        TODO: Delivery status change as delivery proceed --> DONE(status changes as assigned to delivery partner)
        deliveryRepository.save(delivery);

        return delivery;
    }

    public DeliveryAddress getDeliveryAddressFromDTO(DeliveryTransferDTO deliveryTransferDTO){
    DeliveryAddress deliveryAddress = new DeliveryAddress();
    deliveryAddress.setUserId(deliveryTransferDTO.getUserId());
    deliveryAddress.setCity(deliveryTransferDTO.getDeliveryAddress().getCity());
    deliveryAddress.setHouseNumber(deliveryTransferDTO.getDeliveryAddress().getHouseNumber());
    deliveryAddress.setPostalCode(deliveryTransferDTO.getDeliveryAddress().getPostalCode());
    deliveryAddress.setStreet(deliveryTransferDTO.getDeliveryAddress().getStreet());
    deliveryAddress.setState(deliveryTransferDTO.getDeliveryAddress().getState());
    return deliveryAddress;
    }


    private String generateTrackingNumber() {
        return "TRK-" + UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();
    }


    public void assignShipment(Delivery delivery){
        String postalCode = delivery.getDeliveryAddress().getPostalCode();
        DeliveryPartners partner = deliveryPartnersRepository.findAll()
                .stream()
                .filter(p->p.getPinCode().equals(postalCode))
                .filter(p->p.getStatus() == PartnerStatus.AVAILABLE)
                .findFirst()
                .orElseThrow(() -> new NoDeliveryPartnerAvailable("No delivery partner is available in the requested region."));

//        ASSIGNED THE DELIVERY PARTNER ID
        delivery.setDeliveryPartnerId(partner.getId());
        delivery.setStatus(DeliveryStatus.ASSIGNED);
        deliveryRepository.save(delivery);
    }

    public boolean addDeliveryPartner(DeliveryPartnerDetails details){
        DeliveryPartners partner = new  DeliveryPartners();
        partner.setName(details.getName());
        partner.setPhone(details.getPhone());
        partner.setPinCode(details.getPinCode());
        deliveryPartnersRepository.save(partner);
        return true;
    }
}
