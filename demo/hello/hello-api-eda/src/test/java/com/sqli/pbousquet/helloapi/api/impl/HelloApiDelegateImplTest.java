package com.sqli.pbousquet.helloapi.api.impl;

import com.sqli.pbousquet.helloapi.generated.api.model.HelloDto;
import com.sqli.pbousquet.helloapi.generated.api.server.HelloApiDelegate;
import com.sqli.pbousquet.helloapi.hello.domain.HelloServiceImpl;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.withSettings;

import org.junit.Assert;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.MockMakers;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.sqli.pbousquet.helloapi.generated.producer.DefaultServiceEventsProducer;

public class HelloApiDelegateImplTest {

    @Mock(mockMaker = MockMakers.SUBCLASS)
    private final DefaultServiceEventsProducer producer = Mockito.mock(DefaultServiceEventsProducer.class,  withSettings().mockMaker(MockMakers.SUBCLASS));
    private final HelloApiDelegate helloApi = new HelloApiDelegateImpl(new HelloServiceImpl(producer));

    @Test
    public void getHello_must_return_Hello_World() {
        when(producer.sendHelloMessage(any())).thenReturn(true);
        ResponseEntity<HelloDto> result = helloApi.helloWorld();
        Assert.assertTrue(HttpStatus.OK.equals(result.getStatusCode()));
        Assert.assertTrue("Hello World".equals(result.getBody().getMessage()));
    }

    @Test
    public void getHello_Philippe_must_return_Hello_Philippe() {
        when(producer.sendHelloMessage(any())).thenReturn(true);
        ResponseEntity<HelloDto> result = helloApi.helloWithName("Philippe");
        Assert.assertTrue(HttpStatus.OK.equals(result.getStatusCode()));
        Assert.assertTrue("Hello Philippe".equals(result.getBody().getMessage()));
    }
}
