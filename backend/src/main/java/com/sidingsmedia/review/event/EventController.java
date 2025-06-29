// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

package com.sidingsmedia.review.event;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sidingsmedia.review.common.ListResponse;

/**
 * Controller for event service.
 */
@RestController
@RequestMapping("/event")
public class EventController {
    @Autowired
    EventService service;

    Logger logger = LoggerFactory.getLogger(EventController.class);

    /**
     * Get list of events for specified (or all) monitors in a given time range.
     *
     * @param after Include events with a start time after this point.
     * @param before Include events with a start time before this point.
     * @param monitors Filter for only these monitors.
     * @return List of events
     */
    @GetMapping(value = "", produces = MediaType.APPLICATION_JSON_VALUE)
    public ListResponse<Event> getEvents(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime after,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime before,
            @RequestParam(value = "monitor", required = false) long[] monitors) {

        return new ListResponse<Event>(service.getEvents(after, before, monitors));
    }

    /**
     * Get an event by it's ID.
     *
     * @param eventId Event ID.
     * @return Event.
     */
    @GetMapping(value = "/{eventId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Event getEventById(@PathVariable() long eventId) {
        return service.getEventById(eventId);
    }
}
