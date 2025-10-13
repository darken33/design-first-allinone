package com.sqli.pbousquet.helloapi.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.MediaType;
import org.springframework.http.converter.AbstractHttpMessageConverter;

public class ByteArrayToStringConverter extends AbstractHttpMessageConverter<byte[]> {

  public ByteArrayToStringConverter() {
    super(MediaType.APPLICATION_JSON);
  }

  @Override
  protected boolean supports(Class<?> clazz) {
    return byte[].class.isAssignableFrom(clazz);
  }

  @Override
  protected byte[] readInternal(Class<? extends byte[]> clazz, HttpInputMessage inputMessage) throws IOException {
    return inputMessage.getBody().readAllBytes();
  }

  @Override
  protected void writeInternal(byte[] bytes, HttpOutputMessage outputMessage) throws IOException {
    String output = new String(bytes, StandardCharsets.UTF_8);
    outputMessage.getBody().write(output.getBytes());
  }
}