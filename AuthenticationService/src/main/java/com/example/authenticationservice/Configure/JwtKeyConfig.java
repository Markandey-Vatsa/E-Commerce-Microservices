package com.example.authenticationservice.Configure;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Configuration
public class JwtKeyConfig {

    @Bean
    public KeyPair keyPair(
            @Value("${jwt.private-key}") String privateKeyString,
            @Value("${jwt.public-key}") String publicKeyString
    ) throws Exception {

        byte[] privateKeyBytes =
                Base64.getDecoder().decode(privateKeyString);

        byte[] publicKeyBytes =
                Base64.getDecoder().decode(publicKeyString);

        KeyFactory keyFactory = KeyFactory.getInstance("RSA");

        PrivateKey privateKey = keyFactory.generatePrivate(
                new PKCS8EncodedKeySpec(privateKeyBytes)
        );

        PublicKey publicKey = keyFactory.generatePublic(
                new X509EncodedKeySpec(publicKeyBytes)
        );

        return new KeyPair(publicKey, privateKey);
    }

    @Bean
    public PrivateKey getPrivateKey(KeyPair keyPair){
        return keyPair.getPrivate();
    }

    @Bean
    public PublicKey getPublicKey(KeyPair keyPair){
        return keyPair.getPublic();
    }

}
