package com.sqli.pbousquet.helloapi.hello.domain;

import org.springframework.stereotype.Service;

import com.sqli.pbousquet.helloapi.generated.producer.IDefaultServiceEventsProducer;
import com.sqli.pbousquet.helloapi.generated.producer.model.HelloMessagePayload;
import com.sqli.pbousquet.helloapi.hello.api.HelloService;

@Service
public class HelloServiceImpl implements HelloService{

    private final IDefaultServiceEventsProducer service;

    public HelloServiceImpl(IDefaultServiceEventsProducer service) {
        this.service = service;
    }

    @Override
    public String sayHello(String name) {
        String message = "Hello " + name;
        HelloMessagePayload payload = new HelloMessagePayload();
        payload.setMessage(message);
        service.sendHelloMessage(payload);
        return message;
    }
    
}
