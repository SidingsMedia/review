// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

package com.sidingsmedia.review.event;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.apache.commons.lang3.ArrayUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * Repository for events.
 */
@Repository
public class EventRepository {
    @Autowired
    JdbcTemplate jdbcTemplate;

    @Value("${zoneminder.default-storage}")
    private String defaultStoragePath;

    /**
     * Get all the events in a given time period.
     *
     * @param after Include events with a start time after this point.
     * @param before Include events with a start time before this point.
     * @return List of events between the start and end times.
     */
    public List<Event> getEventsInTimePeriod(LocalDateTime after, LocalDateTime before) {
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
        return jdbcTemplate.query(sql,
                (rs, rowNum) -> new Event(rs.getLong("Id"), rs.getLong("MonitorId"),
                        rs.getObject("StartDateTime", LocalDateTime.class),
                        rs.getObject("EndDateTime", LocalDateTime.class), rs.getLong("Frames"),
                        rs.getLong("DiskSpace")),
                after, before);
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

        return jdbcTemplate.query(sql,
                (rs, rowNum) -> new Event(rs.getLong("Id"), rs.getLong("MonitorId"),
                        rs.getObject("StartDateTime", LocalDateTime.class),
                        rs.getObject("EndDateTime", LocalDateTime.class), rs.getLong("Frames"),
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

        List<Event> events = jdbcTemplate.query(sql,
                (rs, rowNum) -> new Event(rs.getLong("Id"), rs.getLong("MonitorId"),
                        rs.getObject("StartDateTime", LocalDateTime.class),
                        rs.getObject("EndDateTime", LocalDateTime.class), rs.getLong("Frames"),
                        rs.getLong("DiskSpace")),
                eventId);

        if (events.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(events.get(0));
    }

    /**
     * Get path of event video.
     *
     * @param eventId Event to get path for.
     * @return Event path.
     */
    public Path getEventVideoPath(long eventId) {
        final String sql = """
                SELECT
                    Events.MonitorId,
                    Events.StartDateTime,
                    Storage.Path
                FROM
                    Events
                    LEFT OUTER JOIN
                        Storage
                        ON Events.StorageId = Storage.Id
                WHERE
                    Events.Id = ?
                """;



        Map<String, Object> row;
        try {
            row = jdbcTemplate.queryForMap(sql, eventId);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }

        LocalDateTime startDateTime = (LocalDateTime) row.get("StartDateTime");
        String storagePath = (String) row.get("Path");
        long monitor = (Long) row.get("MonitorId");

        if (storagePath == null) {
            storagePath = defaultStoragePath;
        }

        Path videoPath = Paths.get(storagePath, String.valueOf(monitor),
                startDateTime.toLocalDate().toString(), String.valueOf(eventId),
                String.valueOf(eventId) + "-video.mp4");

        return videoPath;
    }

    /**
     * Get an input stream for the event video file.
     *
     * @param eventId ID of event.
     * @return Video input stream.
     * @throws IOException Failed to read file.
     */
    public InputStream getFileStream(long eventId) throws IOException {
        Path videoPath = getEventVideoPath(eventId);

        if (videoPath == null) {
            return null;
        }

        return Files.newInputStream(videoPath);
    }

    /**
     * Get an event covering a specific time.
     *
     * @param monitorId ID of monitor to select event from.
     * @param time Time across which event should cover.
     * @return Event if it exists.
     */
    public Optional<Event> getEventCoveringTime(long monitorId, LocalDateTime time) {
        // Order by frames limit 1 to avoid cases where multiple events
        // have been created with only a couple of frames. Therefore
        // prioritize the event with the most frames because it is most
        // likely to be complete.
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
                    MonitorId = ?
                    AND StartDateTime <= ?
                    AND EndDateTime > ?
                ORDER BY
                    Frames DESC LIMIT 1;
                """;

        List<Event> events = jdbcTemplate.query(sql,
                (rs, rowNum) -> new Event(rs.getLong("Id"), rs.getLong("MonitorId"),
                        rs.getObject("StartDateTime", LocalDateTime.class),
                        rs.getObject("EndDateTime", LocalDateTime.class), rs.getLong("Frames"),
                        rs.getLong("DiskSpace")),
                monitorId, time, time);

        if (events.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(events.get(0));
    }
}
