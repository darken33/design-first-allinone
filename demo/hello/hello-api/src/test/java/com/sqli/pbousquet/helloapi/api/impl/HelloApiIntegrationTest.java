package com.sqli.pbousquet.helloapi.api.impl;

import static org.hamcrest.Matchers.is;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.sqli.pbousquet.helloapi.HelloApiApplication;

@SpringBootTest(classes = HelloApiApplication.class)
@AutoConfigureMockMvc
@SpringJUnitConfig
class HelloApiIntegrationTest {

    private static final String HELLO_ENDPOINT = "/api/v1/hello";

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/v1/hello should return Hello World")
    void getHello_should_return_hello_world() throws Exception {
        mockMvc.perform(get(HELLO_ENDPOINT))
                .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message", is("Hello World")));
    }

    @Test
    @DisplayName("GET /api/v1/hello/{name} should return Hello {name}")
    void getHelloWithName_should_return_hello_name() throws Exception {
        String name = "Philippe";
        
        mockMvc.perform(get(HELLO_ENDPOINT + "/{name}", name))
                .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message", is("Hello " + name)));
    }

    @Test
    @DisplayName("GET /api/v1/hello/DevFest should return Hello DevFest")
    void getHelloWithDevFest_should_return_hello_devfest() throws Exception {
        mockMvc.perform(get(HELLO_ENDPOINT + "/DevFest"))
                .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message", is("Hello DevFest")));
    }
}