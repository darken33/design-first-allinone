package com.sqli.pbousquet.helloapi.api;

import com.fasterxml.jackson.annotation.JsonProperty;

public class HelloDto {
  @JsonProperty("message")
  private String message;

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }
}

