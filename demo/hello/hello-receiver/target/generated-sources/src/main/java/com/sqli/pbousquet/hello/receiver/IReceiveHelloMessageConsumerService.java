package com.sqli.pbousquet.hello.receiver;

import java.util.Map;

import com.sqli.pbousquet.hello.model.*;

/**
* 
*/
@jakarta.annotation.Generated(value = "io.zenwave360.sdk.plugins.SpringCloudStreams3Plugin",
		date = "2026-04-29T10:15:42.240119783+02:00")
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
