package com.northwind;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class NorthwindApplication {

    public static void main(String[] args) {
        SpringApplication.run(NorthwindApplication.class, args);
    }
}
