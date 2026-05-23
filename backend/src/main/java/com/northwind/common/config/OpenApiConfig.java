package com.northwind.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI northwindOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Northwind API")
                        .version("0.1.0")
                        .description("Northwind Trading Company API"));
    }
}
