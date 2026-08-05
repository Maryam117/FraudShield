package com.fraudshield;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FraudShieldApplication {

    public static void main(String[] args) {
        SpringApplication.run(FraudShieldApplication.class, args);
        System.out.println("\n=======================================================");
        System.out.println("  FraudShield Backend Service Started Successfully!");
        System.out.println("  API Endpoint: http://localhost:8080/api");
        System.out.println("=======================================================\n");
    }
}
