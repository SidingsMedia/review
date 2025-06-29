// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

package com.sidingsmedia.review.event;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.jspecify.annotations.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sidingsmedia.review.common.exceptions.NotFoundException;
import com.sidingsmedia.review.common.exceptions.ValidationException;

/**
 * Event service
 */
@Service
public class EventService {
    @Autowired
    EventRepository repository;

    Logger logger = LoggerFactory.getLogger(EventController.class);

    /**
     * Get all events in a time range, optionally filtered by monitor ID.
     *
     * @param after Start of time range.
     * @param before End of time range.
     * @param monitors Monitors to filter by.
     * @return List of events in time period.
     */
    public List<Event> getEvents(LocalDateTime after, LocalDateTime before,
            @Nullable long[] monitors) {
        if (after.isAfter(before)) {
            throw new ValidationException("Start date is after end date", "after", after);
        }
        if (monitors == null) {
            return repository.getEventsInTimePeriod(after, before);
        }

        return repository.getEventsInTimePeriod(after, before, monitors);
    }

    /**
     * Get an event by it's ID.
     *
     * @param eventId ID of event.
     * @return The event.
     */
    public Event getEventById(long eventId) {
        Optional<Event> event = repository.getEventById(eventId);

        if (event.isEmpty()) {
            throw new NotFoundException("Event not found", eventId, Event.class);
        }

        return event.get();
    }
}
