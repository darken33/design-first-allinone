package com.sqli.pbousquet.helloapi.api;

import org.junit.Assert;
import org.junit.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class HelloApiTest {

    private final HelloApi helloApi = new HelloApi();

    @Test
    public void getHello_must_return_Hello_World() {
        ResponseEntity<HelloDto> result = helloApi.hello();
        Assert.assertTrue(HttpStatus.OK.equals(result.getStatusCode()));
        Assert.assertTrue("Hello World".equals(result.getBody().getMessage()));
    }

    @Test
    public void getHello_Philippe_must_return_Hello_Philippe() {
        ResponseEntity<HelloDto> result = helloApi.helloWithName("Philippe");
        Assert.assertTrue(HttpStatus.OK.equals(result.getStatusCode()));
        Assert.assertTrue("Hello Philippe".equals(result.getBody().getMessage()));
    }
}
