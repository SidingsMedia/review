// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

package com.sidingsmedia.review.event;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;

import javax.imageio.ImageIO;

import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sidingsmedia.review.common.ListResponse;

import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletResponse;

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

    /**
     * Export the video file.
     *
     * @param response Response to directly manipulate to write file to.
     * @param eventId ID of event to export.
     */
    @GetMapping(value = "/{eventId}/export", produces = "video/mp4")
    public void export(HttpServletResponse response, @PathVariable() long eventId) {

        // Make sure request to service is first so if that fails we
        // still use the default error handling
        try (InputStream inputStream = service.export(eventId);
                ServletOutputStream outputStream = response.getOutputStream();) {
            response.setContentType("video/mp4");

            IOUtils.copy(inputStream, outputStream);

            response.setStatus(HttpStatus.OK.value());
            response.flushBuffer();
        } catch (IOException e) {
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            logger.error("Error occurred when retrieving video", e);
        }
    }

    /**
     * Get an event frame by it's timestamp.
     *
     * @param monitorId Id of monitor to fetch from.
     * @param timestamp Timestamp to fetch frame for.
     * @return Event frame.
     * @throws IOException Failed to write image to buffer.
     */
    @GetMapping(value = "/frame/{monitorId}/{timestamp}")
    public ResponseEntity<byte[]> frame(@PathVariable long monitorId,
            @PathVariable @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime timestamp)
            throws IOException {

        BufferedImage frame = service.getFrame(monitorId, timestamp);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(frame, "jpeg", baos);
        byte[] image = baos.toByteArray();

        return ResponseEntity.status(HttpStatus.OK).contentType(MediaType.IMAGE_JPEG).body(image);
    }
}
