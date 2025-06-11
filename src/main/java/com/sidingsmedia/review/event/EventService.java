// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

package com.sidingsmedia.review.event;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import org.bytedeco.javacv.FFmpegFrameGrabber;
import org.bytedeco.javacv.Frame;
import org.bytedeco.javacv.Java2DFrameConverter;
import org.bytedeco.librealsense.frame;
import org.jspecify.annotations.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sidingsmedia.review.common.exceptions.NotFoundException;
import com.sidingsmedia.review.common.exceptions.UnexpectedNullValueException;
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

    /**
     * Get the file stream for an event video.
     *
     * @param eventId ID of event.
     * @return Event file stream.
     * @throws IOException Failed to read file.
     */
    public InputStream export(long eventId) throws IOException {
        InputStream stream = repository.getFileStream(eventId);
        if (stream == null) {
            throw new NotFoundException("Event not found", eventId, Event.class);
        }

        return stream;
    }

    /**
     * Get a frame of an event.
     *
     * @param monitorId Id of monitor creating event.
     * @param timestamp Timestamp to fetch frame for.
     * @return Event frame.
     */
    public BufferedImage getFrame(long monitorId, LocalDateTime timestamp) {
        Optional<Event> event = repository.getEventCoveringTime(monitorId, timestamp);
        logger.debug("Fetching frame at {} for monitor {}", timestamp, monitorId);
        if (event.isEmpty()) {
            throw new NotFoundException("No event covering the requested time period exists",
                    timestamp, Event.class);
        }

        Path videoPath = repository.getEventVideoPath(event.get().id());
        if (videoPath == null) {
            throw new UnexpectedNullValueException("Video path was null when event exists", null);
        }

        logger.debug("Using video at {}", videoPath);

        long offset = ChronoUnit.MICROS.between(event.get().start(), timestamp);
        logger.trace("Video offset is {}", offset);

        try (FFmpegFrameGrabber grabber = new FFmpegFrameGrabber(videoPath.toString());
                Java2DFrameConverter converter = new Java2DFrameConverter();) {

            logger.trace("Starting frame grabber");
            grabber.start();
            grabber.setTimestamp(offset);
            Frame frame = grabber.grabImage();
            logger.trace("Grabbed frame");
            return converter.convert(frame);

        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
