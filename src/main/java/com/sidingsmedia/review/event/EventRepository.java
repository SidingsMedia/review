// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

package com.sidingsmedia.review.event;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.apache.commons.lang3.ArrayUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * Repository for events.
 */
@Repository
public class EventRepository {
    @Autowired
    JdbcTemplate jdbcTemplate;

    /**
     * Get all the events in a given time period.
     *
     * @param after  Include events with a start time after this point.
     * @param before Include events with a start time before this point.
     * @return List of events between the start and end times.
     */
    public List<Event> getEventsInTimePeriod(Date after, Date before) {
        final String sql = """
                SELECT
                    Id,
                    MonitorId,
                    StartDateTime,
                    EndDateTime,
                    Frames,
                    DiskSpace
                FROM
                    Events
                WHERE
                    StartDateTime > ?
                    AND StartDateTime < ?
                """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new Event(
                rs.getLong("Id"),
                rs.getLong("MonitorId"),
                rs.getDate("StartDateTime"),
                rs.getDate("EndDateTime"),
                rs.getLong("Frames"),
                rs.getLong("DiskSpace")),
                after, before);
    }

    /**
     * Get events in a given time period filtered by monitors.
     *
     * @param after    Include events with a start time after this
     *                 point.
     * @param before   Include events with a start time before this
     *                 point.
     * @param monitors Monitors to filter by.
     * @return List of events between the start and end times.
     */
    public List<Event> getEventsInTimePeriod(Date after, Date before, long[] monitors) {
        final String inStmt = String.join(",", Collections.nCopies(monitors.length, "?"));
        final String sql = String.format("""
                SELECT
                    Id,
                    MonitorId,
                    StartDateTime,
                    EndDateTime,
                    Frames,
                    DiskSpace
                FROM
                    Events
                WHERE
                    StartDateTime > ?
                    AND StartDateTime < ?
                    AND MonitorId IN (%s)
                """, inStmt);

        // Java will get grumpy if we just try to put all three params
        // in the query call because monitors is an array so we need to
        // get it all into one big array first
        Object[] params = new Object[2 + monitors.length];
        params[0] = after;
        params[1] = before;
        System.arraycopy(ArrayUtils.toObject(monitors), 0, params, 2, monitors.length);

        return jdbcTemplate.query(sql, (rs, rowNum) -> new Event(
                rs.getLong("Id"),
                rs.getLong("MonitorId"),
                rs.getDate("StartDateTime"),
                rs.getDate("EndDateTime"),
                rs.getLong("Frames"),
                rs.getLong("DiskSpace")),
                params);
    }

    /**
     * Get an event by it's ID.
     *
     * @param eventId ID of event.
     * @return The event if it exists.
     */
    public Optional<Event> getEventById(long eventId) {
        final String sql = """
                SELECT
                    Id,
                    MonitorId,
                    StartDateTime,
                    EndDateTime,
                    Frames,
                    DiskSpace
                FROM
                    Events
                WHERE
                    Id = ?
                """;

        List<Event> events = jdbcTemplate.query(sql, (rs, rowNum) -> new Event(
                rs.getLong("Id"),
                rs.getLong("MonitorId"),
                rs.getDate("StartDateTime"),
                rs.getDate("EndDateTime"),
                rs.getLong("Frames"),
                rs.getLong("DiskSpace")), eventId);

        if (events.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(events.get(0));
    }
}
