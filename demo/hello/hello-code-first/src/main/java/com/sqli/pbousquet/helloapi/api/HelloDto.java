package com.sqli.pbousquet.helloapi.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class HelloDto {

  @JsonProperty("message")
  private String message;

}

