package com.sqli.pbousquet.helloapi.generated.producer;

import com.sqli.pbousquet.helloapi.generated.producer.model.*;

/**
 * 
 */
@jakarta.annotation.Generated(value = "io.zenwave360.sdk.plugins.SpringCloudStreams3Plugin",
		date = "2026-05-05T07:46:49.541258957+02:00")
public interface DefaultServiceEventsProducer {

	/**
	 * 
	 */
	boolean sendHelloMessage(HelloMessagePayload payload, HelloMessagePayloadHeaders headers);

	default boolean sendHelloMessage(HelloMessagePayload payload) {
		return sendHelloMessage(payload, null);
	};

	static class HelloMessagePayloadHeaders extends java.util.HashMap<String, Object> {

		public HelloMessagePayloadHeaders set(String header, Object value) {
			put(header, value);
			return this;
		}

	}

}
