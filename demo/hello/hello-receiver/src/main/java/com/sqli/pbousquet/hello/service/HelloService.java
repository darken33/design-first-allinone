package com.sqli.pbousquet.hello.service;

import org.springframework.stereotype.Component;
import com.sqli.pbousquet.hello.model.HelloMessagePayload;
import com.sqli.pbousquet.hello.receiver.IReceiveHelloMessageConsumerService;
@Component
public class HelloService implements IReceiveHelloMessageConsumerService {
    
    @Override
    public void receiveHelloMessage(HelloMessagePayload payload, HelloMessagePayloadHeaders headers) {
        System.out.println(payload.getMessage());
    }

}
