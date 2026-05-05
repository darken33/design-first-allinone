package com.sqli.pbousquet.helloapi.generated.producer;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.context.ApplicationContext;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHeaders;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Component;

import com.sqli.pbousquet.helloapi.generated.producer.model.*;

/**
 * 
 */
@Component("DefaultDefaultServiceEventsProducer")
@jakarta.annotation.Generated(value = "io.zenwave360.sdk.plugins.SpringCloudStreams3Plugin",
		date = "2026-05-05T07:46:49.56396254+02:00")
public class DefaultDefaultServiceEventsProducer implements DefaultServiceEventsProducer {

	protected Logger log = LoggerFactory.getLogger(getClass());

	protected final StreamBridge streamBridge;

	protected final ApplicationContext applicationContext;

	public String sendHelloMessageBindingName = "send-hello-message-out-0";

	public DefaultDefaultServiceEventsProducer(StreamBridge streamBridge, ApplicationContext applicationContext) {
		this.streamBridge = streamBridge;
		this.applicationContext = applicationContext;
	}

	/**
	 * 
	 */
	public boolean sendHelloMessage(HelloMessagePayload payload, HelloMessagePayloadHeaders headers) {
		log.debug("Sending message to topic: {}", sendHelloMessageBindingName);
		Message message = MessageBuilder.createMessage(wrapNullPayload(payload), new MessageHeaders(headers));
		return streamBridge.send(sendHelloMessageBindingName, message);
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
