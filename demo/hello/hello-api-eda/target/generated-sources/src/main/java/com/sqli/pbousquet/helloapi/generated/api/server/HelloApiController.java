package com.sqli.pbousquet.helloapi.generated.api.server;

import com.sqli.pbousquet.helloapi.generated.api.model.ApiErrorResponse;
import com.sqli.pbousquet.helloapi.generated.api.model.HelloDto;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import jakarta.annotation.Generated;

@Generated(value = "org.openapitools.codegen.languages.SpringCodegen")
@Controller
@RequestMapping("${openapi.hello.base-path:}")
public class HelloApiController implements HelloApi {

    private final HelloApiDelegate delegate;

    public HelloApiController(@Autowired(required = false) HelloApiDelegate delegate) {
        this.delegate = Optional.ofNullable(delegate).orElse(new HelloApiDelegate() {});
    }

    @Override
    public HelloApiDelegate getDelegate() {
        return delegate;
    }

}
