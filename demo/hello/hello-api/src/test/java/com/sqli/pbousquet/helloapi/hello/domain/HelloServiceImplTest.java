package com.sqli.pbousquet.helloapi.hello.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class HelloServiceImplTest {

    private HelloServiceImpl helloService;

    @BeforeEach
    void setUp() {
        helloService = new HelloServiceImpl();
    }

    @Test
    @DisplayName("Should return 'Hello World' when name is 'World'")
    void sayHello_should_return_hello_world() {
        // Given
        String name = "World";
        
        // When
        String result = helloService.sayHello(name);
        
        // Then
        assertEquals("Hello World", result);
    }

    @Test
    @DisplayName("Should return 'Hello Philippe' when name is 'Philippe'")
    void sayHello_should_return_hello_philippe() {
        // Given
        String name = "Philippe";
        
        // When
        String result = helloService.sayHello(name);
        
        // Then
        assertEquals("Hello Philippe", result);
    }

    @Test
    @DisplayName("Should handle null name")
    void sayHello_should_handle_null_name() {
        // Given
        String name = null;
        
        // When
        String result = helloService.sayHello(name);
        
        // Then
        assertEquals("Hello null", result);
    }

    @Test
    @DisplayName("Should handle empty name")
    void sayHello_should_handle_empty_name() {
        // Given
        String name = "";
        
        // When
        String result = helloService.sayHello(name);
        
        // Then
        assertEquals("Hello ", result);
    }

    @Test
    @DisplayName("Should handle whitespace name")
    void sayHello_should_handle_whitespace_name() {
        // Given
        String name = "   ";
        
        // When
        String result = helloService.sayHello(name);
        
        // Then
        assertEquals("Hello    ", result);
    }
}