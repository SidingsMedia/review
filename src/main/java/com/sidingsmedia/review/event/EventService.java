// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

package com.sidingsmedia.review.event;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sidingsmedia.review.common.exceptions.ValidationException;

@Service
public class EventService {
    @Autowired
    EventRepository repository;

    public List<Event> getEvents(Date after, Date before, long[] monitors) {
        if (after.after(before)) {
            throw new ValidationException("Start date is after end date", "after", after);
        }
        if (monitors == null) {
            return repository.getEventsInTimePeriod(after, before);
        }

        return repository.getEventsInTimePeriod(after, before, monitors);
    }
}
