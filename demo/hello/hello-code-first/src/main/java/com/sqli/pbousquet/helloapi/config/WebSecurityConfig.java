package com.sqli.pbousquet.helloapi.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.StaticHeadersWriter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@Configuration
@EnableWebSecurity
@OpenAPIDefinition(info = @Info(title = "Hello API", version = "v1"))
public class WebSecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
 
        httpSecurity
            .httpBasic(security -> security.disable())
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authorize -> authorize.anyRequest().permitAll());
	
        httpSecurity.headers(headers -> {
                headers.addHeaderWriter(
                        new StaticHeadersWriter(
                                "Content-Security-Policy",
                                "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
                        )
                );
                headers.addHeaderWriter(
                        new StaticHeadersWriter(
                                "Access-Control-Allow-Origin",
                                "*"
                        )
                );
        });
 
        return httpSecurity.build();
    }

}