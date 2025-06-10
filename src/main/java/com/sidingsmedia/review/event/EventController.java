// SPDX-FileCopyrightText: 2025 Sidings Media <contact@sidingsmedia.com>
// SPDX-License-Identifier: MIT

package com.sidingsmedia.review.event;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sidingsmedia.review.common.ListResponse;

@RestController
@RequestMapping("/event")
public class EventController {
    @Autowired
    EventService service;

    @GetMapping(value = "", produces = MediaType.APPLICATION_JSON_VALUE)
    public ListResponse<Event> getEvents(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date after,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date before,
            @RequestParam(value = "monitor", required = false) long[] monitors) {

        return new ListResponse<Event>(service.getEvents(after, before, monitors));
    }
}
