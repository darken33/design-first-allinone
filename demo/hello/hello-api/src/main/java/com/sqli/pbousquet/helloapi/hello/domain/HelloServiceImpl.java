package com.sqli.pbousquet.helloapi.hello.domain;

import org.springframework.stereotype.Service;

import com.sqli.pbousquet.helloapi.hello.api.HelloService;

@Service
public class HelloServiceImpl implements HelloService{

    @Override
    public String sayHello(String name) {
        return "Hello " + name;
    }
    
}
