package com.sqli.pbousquet.hello.receiver;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Consumer;
import java.util.function.Function;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHeaders;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Component;

import com.sqli.pbousquet.hello.model.*;

@Component("receive-hello-message")
@jakarta.annotation.Generated(value = "io.zenwave360.sdk.plugins.SpringCloudStreams3Plugin",
		date = "2026-04-29T10:15:42.220813195+02:00")
public class ReceiveHelloMessageConsumer implements Consumer<Message<HelloMessagePayload>> {

	protected Logger log = LoggerFactory.getLogger(getClass());

	protected IReceiveHelloMessageConsumerService service;

	protected StreamBridge streamBridge;

	protected Map<Class<? extends Exception>, String> errorQueueMap;

	public ReceiveHelloMessageConsumer(IReceiveHelloMessageConsumerService service,
			@Autowired(required = false) StreamBridge streamBridge) {
		this.service = service;
		this.streamBridge = streamBridge;
	}

	@Value("#{${spring.cloud.stream.bindings.receive-hello-message-in-0.dead-letter-queue-error-map:{:}}}")
	public void setErrorQueueMap(Map<Class<? extends Exception>, String> errorQueueMap) {
		this.errorQueueMap = errorQueueMap;
	}

	@Override
	public void accept(Message<HelloMessagePayload> message) {
		log.debug("Received message: {}", message);
		try {
			Object payload = message.getPayload();
			if (payload instanceof HelloMessagePayload) {
				var headers = new IReceiveHelloMessageConsumerService.HelloMessagePayloadHeaders();
				headers.putAll(message.getHeaders());
				service.receiveHelloMessage((HelloMessagePayload) payload, headers);
				return;
			}
			log.warn("Received message without any business handler: [payload: {}, message: {}]",
					payload.getClass().getName(), message);
			service.defaultHandler(payload, message.getHeaders());
			return;
		}
		catch (Exception e) {
			if (log.isDebugEnabled()) {
				log.error("Error processing message: {}", message, e);
			}
			else {
				log.error("Error processing message: {}", message);
			}

			String resolvedDLQ = resolveDeadLetterQueue(e, message);
			if (streamBridge != null && resolvedDLQ != null) {
				try {
					log.debug("Sending message to dead letter queue: {}", resolvedDLQ);
					Object payload = message.getPayload();
					var headers = new HashMap(message.getHeaders());
					headers.put("x-original-headers", message.getHeaders().toString());
					headers.put("x-exception-type", e.getClass().getName());
					headers.put("x-exception-message", e.getMessage());
					headers.put("x-exception-stacktrace ", getStackTraceAsString(e));
					headers.put("x-exception-payload-type", payload.getClass().getName());
					streamBridge.send(resolvedDLQ, MessageBuilder.createMessage(payload, new MessageHeaders(headers)));
					return;
				}
				catch (Exception e1) {
					log.error("Error sending message to dead letter queue: {}", resolvedDLQ, e1);
				}
			}
			throw e;
		}
	}

	protected String resolveDeadLetterQueue(Exception e, Message message) {
		if (errorQueueMap != null) {
			for (Map.Entry<Class<? extends Exception>, String> entry : errorQueueMap.entrySet()) {
				if (entry.getKey().isAssignableFrom(e.getClass())) {
					return entry.getValue();
				}
			}
		}
		return null;
	}

	protected String getStackTraceAsString(Exception e) {
		StringWriter sw = new StringWriter();
		PrintWriter pw = new PrintWriter(sw);
		e.printStackTrace(pw);
		return sw.toString();
	}

}
