package com.sqli.pbousquet.hello.receiver;

import java.util.Map;

import com.sqli.pbousquet.hello.model.*;

/**
* 
*/
@jakarta.annotation.Generated(value = "io.zenwave360.sdk.plugins.SpringCloudStreams3Plugin",
		date = "2025-11-03T08:57:39.844702077Z")
public interface IReceiveHelloMessageConsumerService {

	/**
	 * 
	 */
	void receiveHelloMessage(HelloMessagePayload payload, HelloMessagePayloadHeaders headers);

	/**
	 * Default method for handling unknown messages or tombstone records (null record
	 * values).
	 */
	default void defaultHandler(Object payload, Map<String, Object> headers) {
		throw new UnsupportedOperationException(
				"Payload type not supported: " + (payload != null ? payload.getClass().getName() : null));
	};

	static class HelloMessagePayloadHeaders extends java.util.HashMap<String, Object> {

		public HelloMessagePayloadHeaders set(String header, Object value) {
			put(header, value);
			return this;
		}

	}

}
