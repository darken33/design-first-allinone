package com.sqli.pbousquet.helloapi.generated.producer;

import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHeaders;
import org.springframework.messaging.support.MessageBuilder;

import com.sqli.pbousquet.helloapi.generated.producer.model.*;

/**
 * 
 */
@jakarta.annotation.Generated(value = "io.zenwave360.sdk.plugins.SpringCloudStreams3Plugin",
		date = "2025-11-03T08:54:11.592736726Z")
public class InMemoryDefaultServiceEventsProducer implements DefaultServiceEventsProducer {

	protected Logger log = LoggerFactory.getLogger(getClass());

	protected ApplicationContext applicationContext;

	public InMemoryDefaultServiceEventsProducer withApplicationContext(ApplicationContext applicationContext) {
		this.applicationContext = applicationContext;
		return this;
	}

	public String sendHelloMessageBindingName = "send-hello-message-out-0";

	protected Map<String, List<Message>> capturedMessages = new HashMap<>();

	public Map<String, List<Message>> getCapturedMessages() {
		return capturedMessages;
	}

	public List<Message> getCapturedMessages(String bindingName) {
		return capturedMessages.getOrDefault(bindingName, new ArrayList<>());
	}

	private boolean appendCapturedMessage(String bindingName, Message message) {
		if (capturedMessages.containsKey(bindingName)) {
			capturedMessages.get(bindingName).add(message);
		}
		else {
			capturedMessages.put(bindingName, new ArrayList<>(List.of(message)));
		}
		return true;
	}

	/**
	 * 
	 */
	public boolean sendHelloMessage(HelloMessagePayload payload, HelloMessagePayloadHeaders headers) {
		log.debug("Capturing message to topic: {}", sendHelloMessageBindingName);
		Message message = MessageBuilder.createMessage(wrapNullPayload(payload), new MessageHeaders(headers));
		return appendCapturedMessage(sendHelloMessageBindingName, message);
	}

	protected Object wrapNullPayload(Object payload) {
		if (payload != null) {
			return payload;
		}
		try {
			return Class.forName("org.springframework.kafka.support.KafkaNull").getField("INSTANCE").get(null);
		}
		catch (ClassNotFoundException | NoSuchFieldException | IllegalAccessException e) {
			log.warn("Unable to find KafkaNull class, returning null");
			return null;
		}
	}

}
