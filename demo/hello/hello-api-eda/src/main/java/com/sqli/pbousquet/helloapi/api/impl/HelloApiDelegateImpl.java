package com.sqli.pbousquet.helloapi.api.impl;

import com.fasterxml.jackson.core.sym.Name;
import com.sqli.pbousquet.helloapi.generated.api.model.HelloDto;
import com.sqli.pbousquet.helloapi.generated.api.server.HelloApiDelegate;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import com.sqli.pbousquet.helloapi.hello.api.HelloService;

@Component
public class HelloApiDelegateImpl implements HelloApiDelegate {

    private final HelloService service;

    HelloApiDelegateImpl(HelloService service) {
        this.service = service;
    }

    @Override
    public ResponseEntity<HelloDto> helloUsingGET1() {
        HelloDto result = new HelloDto();
        result.setMessage(service.sayHello("World"));
        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<HelloDto> helloUsingGET(String name) {
        HelloDto result = new HelloDto();
        result.setMessage(service.sayHello(name));
        return ResponseEntity.ok(result);
    }
}
