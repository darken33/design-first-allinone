package com.sqli.pbousquet.helloapi.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

@RestController
public class HelloApi {

    @RequestMapping(
        method = RequestMethod.GET,
        value = "/api/v1/hello",
        produces = { "application/json" }
    )
    @Operation(
        operationId = "hello",
        summary = "Saluer le monde",
        tags = { "Hello" },
        responses = {
            @ApiResponse(responseCode = "200", description = "OK", content = {
                @Content(mediaType = "application/json", schema = @Schema(implementation = HelloDto.class))
            }),
        }
    )
    public ResponseEntity<HelloDto> hello() {
        HelloDto result = new HelloDto();
        result.setMessage("Hello World");
        return ResponseEntity.ok(result);
    }

    @RequestMapping(
        method = RequestMethod.GET,
        value = "/api/v1/hello/{name}",
        produces = { "application/json" }
    )
    @Operation(
        operationId = "helloWithName",
        summary = "Saluer une personne en particulier",
        tags = { "Hello" },
        responses = {
            @ApiResponse(responseCode = "200", description = "OK", content = {
                @Content(mediaType = "application/json", schema = @Schema(implementation = HelloDto.class))
            }),
        }
    )
    public ResponseEntity<HelloDto> helloWithName(@Parameter(name = "name", description = "Nom de la personne à saluer", required = true) @PathVariable("name") String name) {
        HelloDto result = new HelloDto();
        result.setMessage("Hello "+name);
        return ResponseEntity.ok(result);
    }
}
