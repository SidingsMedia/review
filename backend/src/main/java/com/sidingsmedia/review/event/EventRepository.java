// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

package com.sidingsmedia.review.event;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.apache.commons.lang3.ArrayUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * Repository for events.
 */
@Repository
public class EventRepository {
    @Autowired
    JdbcTemplate jdbcTemplate;

    @Value("#{${server.media-roots}}")
    private Map<String, String> mediaRoots;

    private static final String BASE_EVENT_QUERY = """
            SELECT
                Events.Id,
                Events.MonitorId,
                Events.StartDateTime,
                Events.EndDateTime,
                Events.Frames,
                Events.DiskSpace,
                Events.Length,
                Storage.Name
            FROM
                Events
                LEFT OUTER JOIN
                    Storage
                    ON Events.StorageId = Storage.Id
            """;

    /**
     * Extract an {@link Event} from a {@link ResultSet}.
     *
     * @param rs {@link ResultSet} to extract {@link Event} from.
     * @return THe event.
     * @throws SQLException An error occurred processing the results set.
     */
    private Event rsToEvent(ResultSet rs) throws SQLException {
        String storageName = rs.getString("Name");
        LocalDateTime startDateTime = rs.getObject("StartDateTime", LocalDateTime.class);
        long eventId = rs.getLong("Id");
        long monitorId = rs.getLong("MonitorId");

        if (storageName == null) {
            storageName = "default";
        }

        String mediaRoot = mediaRoots.get(storageName);
        if (mediaRoot == null) {
            throw new IllegalStateException("Media root for storage " + storageName + " not set");
        }

        String videoPath = String.format("/%d/%s/%d/%d-video.mp4", monitorId,
                startDateTime.toLocalDate().toString(), eventId, eventId);
        String thumbPath = String.format("/%d/%s/%d/snapshot.jpg", monitorId,
                startDateTime.toLocalDate().toString(), eventId);

        return new Event(eventId, monitorId, startDateTime,
                rs.getObject("EndDateTime", LocalDateTime.class), rs.getLong("Frames"),
                rs.getLong("DiskSpace"), rs.getDouble("Length"), mediaRoot + videoPath,
                mediaRoot + thumbPath);
    }

    /**
     * Get all the events in a given time period.
     *
     * @param after Include events with a start time after this point.
     * @param before Include events with a start time before this point.
     * @return List of events between the start and end times.
     */
    public List<Event> getEventsInTimePeriod(LocalDateTime after, LocalDateTime before) {
        final String sql = BASE_EVENT_QUERY + """
                WHERE
                    Events.StartDateTime > ?
                    AND Events.StartDateTime < ?
                ORDER BY
                    Events.StartDateTime ASC
                """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> rsToEvent(rs), after, before);
    }

    /**
     * Get events in a given time period filtered by monitors.
     *
     * @param after Include events with a start time after this point.
     * @param before Include events with a start time before this point.
     * @param monitors Monitors to filter by.
     * @return List of events between the start and end times.
     */
    public List<Event> getEventsInTimePeriod(LocalDateTime after, LocalDateTime before,
            long[] monitors) {
        final String inStmt = String.join(",", Collections.nCopies(monitors.length, "?"));
        final String sql = String.format(BASE_EVENT_QUERY + """
                WHERE
                    Events.StartDateTime > ?
                    AND Events.StartDateTime < ?
                    AND Events.MonitorId IN (%s)
                ORDER BY
                    Events.StartDateTime ASC
                """, inStmt);

        // Java will get grumpy if we just try to put all three params
        // in the query call because monitors is an array so we need to
        // get it all into one big array first
        Object[] params = new Object[2 + monitors.length];
        params[0] = after;
        params[1] = before;
        System.arraycopy(ArrayUtils.toObject(monitors), 0, params, 2, monitors.length);

        return jdbcTemplate.query(sql, (rs, rowNum) -> rsToEvent(rs), params);
    }

    /**
     * Get an event by it's ID.
     *
     * @param eventId ID of event.
     * @return The event if it exists.
     */
    public Optional<Event> getEventById(long eventId) {
        final String sql = BASE_EVENT_QUERY + """
                WHERE
                    Events.Id = ?
                """;

        List<Event> events = jdbcTemplate.query(sql, (rs, rowNum) -> rsToEvent(rs), eventId);

        if (events.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(events.get(0));
    }
}
