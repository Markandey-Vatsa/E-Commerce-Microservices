package com.example.deliveryservice.Config;



import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Configuration
public class JwtKeyConfig {

    @Bean
    public PublicKey publicKey(
            @Value("${jwt.public-key}") String publicKeyString
    ) throws Exception {

        byte[] keyBytes =
                Base64.getDecoder().decode(publicKeyString);

        KeyFactory keyFactory = KeyFactory.getInstance("RSA");

        return keyFactory.generatePublic(
                new X509EncodedKeySpec(keyBytes)
        );
    }
}