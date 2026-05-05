package com.sqli.pbousquet.helloapi.generated.producer;

@jakarta.annotation.Generated(value = "io.zenwave360.sdk.plugins.SpringCloudStreams3Plugin",
		date = "2026-05-05T07:46:49.579845463+02:00")
public class EventsProducerInMemoryContext {

	private InMemoryDefaultServiceEventsProducer inMemoryDefaultServiceEventsProducer = new InMemoryDefaultServiceEventsProducer();

	public InMemoryDefaultServiceEventsProducer defaultServiceEventsProducer() {
		return inMemoryDefaultServiceEventsProducer;
	}

}
